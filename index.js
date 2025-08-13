// S3Adapter
//
// Stores Parse files in AWS S3.

const {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const optionsFromArguments = require('./lib/optionsFromArguments');

const awsCredentialsDeprecationNotice = function awsCredentialsDeprecationNotice() {
  // eslint-disable-next-line no-console
  console.warn(
    'Passing AWS credentials to this adapter is now DEPRECATED and will be removed in a future version',
    'See: https://github.com/parse-server-modules/parse-server-s3-adapter#aws-credentials for details'
  );
};

const serialize = obj => {
  const str = [];
  Object.keys(obj).forEach(key => {
    if (obj[key]) {
      str.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
    }
  });
  return str.join('&');
};

async function buildDirectAccessUrl(baseUrl, baseUrlFileKey, presignedUrl, config, filename) {
  let urlBase;
  if (typeof baseUrl === 'function') {
    urlBase = await baseUrl(config, filename);
  } else {
    urlBase = baseUrl;
  }
  let directAccessUrl = `${urlBase}/${baseUrlFileKey}`;

  if (presignedUrl) {
    directAccessUrl += presignedUrl.substring(presignedUrl.indexOf('?'));
  }

  return directAccessUrl;
}

function cleanS3Key(key) {
  // Single-pass character replacement using a lookup map for better performance
  // See: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html#object-key-guidelines

  const charMap = {
    '\\': '-',
    '{': '-', '}': '-',
    '^': '-', '`': '-', '[': '-', ']': '-', '"': '-', '<': '-', '>': '-',
    '~': '-', '#': '-', '|': '-', '%': '-',
    '&': '-and-',
    '$': '-dollar-',
    '@': '-at-',
    '=': '-equals-',
    ';': '-', ':': '-', '+': '-plus-', ',': '-', '?': '-'
  };

  let result = '';
  let lastWasHyphen = false;

  for (let i = 0; i < key.length; i++) {
    const char = key[i];
    const charCode = char.charCodeAt(0);

    // Skip non-printable ASCII and extended ASCII
    if ((charCode >= 0 && charCode <= 31) || charCode === 127 || charCode >= 128) {
      continue;
    }

    // Handle whitespace - convert to single hyphen
    if (/\s/.test(char)) {
      if (!lastWasHyphen) {
        result += '-';
        lastWasHyphen = true;
      }
      continue;
    }

    // Replace problematic characters
    if (charMap[char]) {
      const replacement = charMap[char];
      if (replacement === '-') {
        if (!lastWasHyphen) {
          result += '-';
          lastWasHyphen = true;
        }
      } else {
        result += replacement;
        lastWasHyphen = false;
      }
      continue;
    }

    // Keep safe characters
    result += char;
    lastWasHyphen = false;
  }

  // Remove leading/trailing hyphens and periods
  result = result.replace(/^[-\.]+|[-\.]+$/g, '');

  // Ensure we don't end up with an empty string
  return result || `file-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function responseToBuffer(response) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    response.Body.on('data', chunk => chunks.push(chunk));
    response.Body.on('end', () => resolve(Buffer.concat(chunks)));
    response.Body.on('error', reject);
  });
}

class S3Adapter {
  // Creates an S3 session.
  // Providing AWS access, secret keys and bucket are mandatory
  // Region will use sane defaults if omitted
  constructor(...args) {
    const options = optionsFromArguments(args);
    this._region = options.region;
    this._bucket = options.bucket;
    this._bucketPrefix = options.bucketPrefix;
    this._directAccess = options.directAccess;
    this._fileAcl = options.fileAcl;
    this._baseUrl = options.baseUrl;
    this._baseUrlDirect = options.baseUrlDirect;
    this._signatureVersion = options.signatureVersion;
    this._globalCacheControl = options.globalCacheControl;
    this._presignedUrl = options.presignedUrl;
    this._presignedUrlExpires = parseInt(options.presignedUrlExpires, 10);
    this._encryption = options.ServerSideEncryption;
    this._generateKey = options.generateKey;
    this._cleanKey = options.cleanKey;
    this._endpoint = options.s3overrides?.endpoint;
    // Optional FilesAdaptor method
    this.validateFilename = options.validateFilename;

    const s3Options = {
      params: { Bucket: this._bucket },
      region: this._region,
      signatureVersion: this._signatureVersion,
      globalCacheControl: this._globalCacheControl,
    };

    if (options.accessKey && options.secretKey) {
      awsCredentialsDeprecationNotice();
      s3Options.credentials = {
        accessKeyId: options.accessKey,
        secretAccessKey: options.secretKey,
      };
    } else if (options.credentials) {
      s3Options.credentials = options.credentials;
    }

    if (options.accessKey && options.secretKey) {
      awsCredentialsDeprecationNotice();
      s3Options.accessKeyId = options.accessKey;
      s3Options.secretAccessKey = options.secretKey;
    }

    Object.assign(s3Options, options.s3overrides);

    this._s3Client = new S3Client(s3Options);
    this._hasBucket = false;
  }

  async createBucket() {
    if (this._hasBucket) {
      return;
    }

    try {
      // Check if the bucket exists
      await this._s3Client.send(new HeadBucketCommand({ Bucket: this._bucket }));
      this._hasBucket = true;
    } catch (error) {
      if (error.name !== 'NotFound') {
        // If the error is something other than "NotFound", rethrow it
        throw error;
      }

      // If the bucket does not exist, attempt to create it
      try {
        await this._s3Client.send(new CreateBucketCommand({ Bucket: this._bucket }));
        this._hasBucket = true;
      } catch (creationError) {
        // Handle specific errors during bucket creation
        if (creationError.name === 'BucketAlreadyExists' || creationError.name === 'BucketAlreadyOwnedByYou') {
          this._hasBucket = true;
        } else {
          throw creationError;
        }
      }
    }
  }

  // For a given config object, filename, and data, store a file in S3
  // Returns a promise containing the S3 object creation response
  async createFile(filename, data, contentType, options = {}) {
    let finalKey = filename;

    // Apply generateKey if provided
    if (this._generateKey instanceof Function) {
      finalKey = this._generateKey(filename, contentType, options);
    }

    // Apply key cleaning if enabled (after generateKey)
    if (this._cleanKey) {
      finalKey = cleanS3Key(finalKey);
    }

    const params = {
      Bucket: this._bucket,
      Key: this._bucketPrefix + finalKey,
      Body: data,
    };
    if (this._fileAcl) {
      if (this._fileAcl === 'none') {
        delete params.ACL;
      } else {
        params.ACL = this._fileAcl;
      }
    } else if (this._directAccess) {
      params.ACL = 'public-read';
    }
    if (contentType) {
      params.ContentType = contentType;
    }
    if (this._globalCacheControl) {
      params.CacheControl = this._globalCacheControl;
    }
    if (this._encryption === 'AES256' || this._encryption === 'aws:kms') {
      params.ServerSideEncryption = this._encryption;
    }
    if (options.metadata && typeof options.metadata === 'object') {
      params.Metadata = options.metadata;
    }
    if (options.tags && typeof options.tags === 'object') {
      const serializedTags = serialize(options.tags);
      params.Tagging = serializedTags;
    }
    await this.createBucket();
    const command = new PutObjectCommand(params);
    const response = await this._s3Client.send(command);
    const endpoint = this._endpoint || `https://${this._bucket}.s3.${this._region}.amazonaws.com`;
    const location = `${endpoint}/${params.Key}`;

    return Object.assign(response || {}, { Location: location });
  }

  async deleteFile(filename) {
    const params = {
      Bucket: this._bucket,
      Key: this._bucketPrefix + filename,
    };
    await this.createBucket();
    const command = new DeleteObjectCommand(params);
    const response = await this._s3Client.send(command);
    return response;
  }

  // Search for and return a file if found by filename
  // Returns a promise that succeeds with the buffer result from S3
  async getFileData(filename) {
    const params = {
      Bucket: this._bucket,
      Key: this._bucketPrefix + filename,
    };
    await this.createBucket();
    const command = new GetObjectCommand(params);
    const response = await this._s3Client.send(command);
    if (response && !response.Body) {
      throw new Error(response);
    }

    const buffer = await responseToBuffer(response);
    return buffer;
  }

  // Exposed only for testing purposes
  getFileSignedUrl(client, command, options) {
    return getSignedUrl(client, command, options);
  }

  // Generates and returns the location of a file stored in S3 for the given request and filename
  // The location is the direct S3 link if the option is set,
  // otherwise we serve the file through parse-server
  async getFileLocation(config, filename) {
    const fileName = filename.split('/').map(encodeURIComponent).join('/');
    if (!this._directAccess) {
      return `${config.mount}/files/${config.applicationId}/${fileName}`;
    }

    const fileKey = `${this._bucketPrefix}${fileName}`;

    let presignedUrl = '';
    if (this._presignedUrl) {
      const params = { Bucket: this._bucket, Key: fileKey };
      const options = this._presignedUrlExpires ? { expiresIn: this._presignedUrlExpires } : {};

      const command = new GetObjectCommand(params);
      presignedUrl = await this.getFileSignedUrl(this._s3Client, command, options);

      if (!this._baseUrl) {
        return presignedUrl;
      }
    }

    if (!this._baseUrl) {
      return `https://${this._bucket}.s3.amazonaws.com/${fileKey}`;
    }

    const baseUrlFileKey = this._baseUrlDirect ? fileName : fileKey;
    return await buildDirectAccessUrl(this._baseUrl, baseUrlFileKey, presignedUrl, config, filename);
  }

  async handleFileStream(filename, req, res) {
    const params = {
      Bucket: this._bucket,
      Key: this._bucketPrefix + filename,
      Range: req.get('Range'),
    };

    await this.createBucket();
    const command = new GetObjectCommand(params);
    const data = await this._s3Client.send(command);
    if (data && !data.Body) {
      throw new Error('S3 object body is missing.');
    }

    res.writeHead(206, {
      'Accept-Ranges': data.AcceptRanges,
      'Content-Length': data.ContentLength,
      'Content-Range': data.ContentRange,
      'Content-Type': data.ContentType,
    });
    data.Body.on('data', chunk => res.write(chunk));
    data.Body.on('end', () => res.end());
    data.Body.on('error', e => {
      res.status(404);
      res.send(e.message);
    });
    return responseToBuffer(data);
  }
}

module.exports = S3Adapter;
module.exports.default = S3Adapter;
