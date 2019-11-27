// S3Adapter
//
// Stores Parse files in AWS S3.

const AWS = require('aws-sdk');
const optionsFromArguments = require('./lib/optionsFromArguments');

const awsCredentialsDeprecationNotice = function awsCredentialsDeprecationNotice() {
  // eslint-disable-next-line no-console
  console.warn('Passing AWS credentials to this adapter is now DEPRECATED and will be removed in a future version',
    'See: https://github.com/parse-server-modules/parse-server-s3-adapter#aws-credentials for details');
};

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
    this._baseUrl = options.baseUrl;
    this._baseUrlDirect = options.baseUrlDirect;
    this._signatureVersion = options.signatureVersion;
    this._globalCacheControl = options.globalCacheControl;
    this._encryption = options.ServerSideEncryption;
    this._generateKey = options.generateKey;
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
      s3Options.accessKeyId = options.accessKey;
      s3Options.secretAccessKey = options.secretKey;
    }

    Object.assign(s3Options, options.s3overrides);

    this._s3Client = new AWS.S3(s3Options);
    this._hasBucket = false;
  }

  createBucket() {
    let promise;
    if (this._hasBucket) {
      promise = Promise.resolve();
    } else {
      promise = new Promise((resolve) => {
        this._s3Client.createBucket(() => {
          this._hasBucket = true;
          resolve();
        });
      });
    }
    return promise;
  }

  // For a given config object, filename, and data, store a file in S3
  // Returns a promise containing the S3 object creation response
  createFile(filename, data, contentType) {
    const params = {
      Key: this._bucketPrefix + filename,
      Body: data,
    };

    if (this._generateKey instanceof Function) {
      params.Key = this._bucketPrefix + this._generateKey(filename);
    }

    if (this._directAccess) {
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
    return this.createBucket().then(() => new Promise((resolve, reject) => {
      this._s3Client.upload(params, (err, response) => {
        if (err !== null) {
          return reject(err);
        }
        return resolve(response);
      });
    }));
  }

  deleteFile(filename) {
    return this.createBucket().then(() => new Promise((resolve, reject) => {
      const params = {
        Key: this._bucketPrefix + filename,
      };
      this._s3Client.deleteObject(params, (err, data) => {
        if (err !== null) {
          return reject(err);
        }
        return resolve(data);
      });
    }));
  }

  // Search for and return a file if found by filename
  // Returns a promise that succeeds with the buffer result from S3
  getFileData(filename) {
    const params = { Key: this._bucketPrefix + filename };
    return this.createBucket().then(() => new Promise((resolve, reject) => {
      this._s3Client.getObject(params, (err, data) => {
        if (err !== null) {
          return reject(err);
        }
        // Something happened here...
        if (data && !data.Body) {
          return reject(data);
        }
        return resolve(data.Body);
      });
    }));
  }

  // Generates and returns the location of a file stored in S3 for the given request and filename
  // The location is the direct S3 link if the option is set,
  // otherwise we serve the file through parse-server
  getFileLocation(config, filename) {
    const fileName = filename.split('/').map(encodeURIComponent).join('/');
    if (this._directAccess) {
      if (this._baseUrl && this._baseUrlDirect) {
        return `${this._baseUrl}/${fileName}`;
      } if (this._baseUrl) {
        return `${this._baseUrl}/${this._bucketPrefix + fileName}`;
      }
      return `https://${this._bucket}.s3.amazonaws.com/${this._bucketPrefix + fileName}`;
    }
    return (`${config.mount}/files/${config.applicationId}/${fileName}`);
  }

  handleFileStream(filename, req, res) {
    const params = {
      Key: this._bucketPrefix + filename,
      Range: req.get('Range'),
    };
    return this.createBucket().then(() => new Promise((resolve, reject) => {
      this._s3Client.getObject(params, (error, data) => {
        if (error !== null) {
          return reject(error);
        }
        if (data && !data.Body) {
          return reject(data);
        }
        res.writeHead(206, {
          'Accept-Ranges': data.AcceptRanges,
          'Content-Length': data.ContentLength,
          'Content-Range': data.ContentRange,
          'Content-Type': data.ContentType,
        });
        res.write(data.Body);
        res.end();
        return resolve(data.Body);
      });
    }));
  }
}

module.exports = S3Adapter;
module.exports.default = S3Adapter;
