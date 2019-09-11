'use strict';
// S3Adapter
//
// Stores Parse files in AWS S3.

var AWS = require('aws-sdk');
var optionsFromArguments = require('./lib/optionsFromArguments');

const awsCredentialsDeprecationNotice = function awsCredentialsDeprecationNotice() {
  // eslint-disable-next-line no-console
  console.warn('Passing AWS credentials to this adapter is now DEPRECATED and will be removed in a future version',
    'See: https://github.com/parse-server-modules/parse-server-s3-adapter#aws-credentials for details');
}

// Creates an S3 session.
// Providing AWS access, secret keys and bucket are mandatory
// Region will use sane defaults if omitted
function S3Adapter() {
  var options = optionsFromArguments(arguments);
  this._region = options.region;
  this._bucket = options.bucket;
  this._bucketPrefix = options.bucketPrefix;
  this._directAccess = options.directAccess;
  this._baseUrl = options.baseUrl;
  this._baseUrlDirect = options.baseUrlDirect;
  this._signatureVersion = options.signatureVersion;
  this._globalCacheControl = options.globalCacheControl;
  this._encryption = options.ServerSideEncryption;

  let s3Options = {
    params: { Bucket: this._bucket },
    region: this._region,
    signatureVersion: this._signatureVersion,
    globalCacheControl: this._globalCacheControl
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

S3Adapter.prototype.createBucket = function() {
  var promise;
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
S3Adapter.prototype.createFile = function(filename, data, contentType) {
  let params = {
    Key: this._bucketPrefix + filename,
    Body: data
  };
  if (this._directAccess) {
    params.ACL = "public-read"
  }
  if (contentType) {
    params.ContentType = contentType;
  }
  if(this._globalCacheControl) {
    params.CacheControl = this._globalCacheControl;
  }
  if(this._encryption == 'AES256' || this._encryption == 'aws:kms'){
    params.ServerSideEncryption = this._encryption;
  }
  return this.createBucket().then(() => {
    return new Promise((resolve, reject) => {
      this._s3Client.upload(params, (err, data) => {
        if (err !== null) {
          return reject(err);
        }
        resolve(data);
      });
    });
  });
}

S3Adapter.prototype.deleteFile = function(filename) {
  return this.createBucket().then(() => {
    return new Promise((resolve, reject) => {
      let params = {
        Key: this._bucketPrefix + filename
      };
      this._s3Client.deleteObject(params, (err, data) =>{
        if(err !== null) {
          return reject(err);
        }
        resolve(data);
      });
    });
  });
}

// Search for and return a file if found by filename
// Returns a promise that succeeds with the buffer result from S3
S3Adapter.prototype.getFileData = function(filename) {
  let params = {Key: this._bucketPrefix + filename};
  return this.createBucket().then(() => {
    return new Promise((resolve, reject) => {
      this._s3Client.getObject(params, (err, data) => {
        if (err !== null) {
          return reject(err);
        }
        // Something happened here...
        if (data && !data.Body) {
          return reject(data);
        }
        resolve(data.Body);
      });
    });
  });
}

// Generates and returns the location of a file stored in S3 for the given request and filename
// The location is the direct S3 link if the option is set, otherwise we serve the file through parse-server
S3Adapter.prototype.getFileLocation = function(config, filename) {
  filename = encodeURIComponent(filename);
  if (this._directAccess) {
    if (this._baseUrl && this._baseUrlDirect) {
      return `${this._baseUrl}/${filename}`;
    } else if (this._baseUrl) {
      return `${this._baseUrl}/${this._bucketPrefix + filename}`;
    } else {
      return `https://${this._bucket}.s3.amazonaws.com/${this._bucketPrefix + filename}`;
    }
  }
  return (config.mount + '/files/' + config.applicationId + '/' + filename);
}

S3Adapter.prototype.handleFileStream = function (filename, req, res) {
  const params = {
    Key: this._bucketPrefix + filename,
    Range: req.get('Range'),
  };
  return this.createBucket().then(() => {
    return new Promise((resolve, reject) => {
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
        resolve(data.Body);
      });
    });
  });
}

module.exports = S3Adapter;
module.exports.default = S3Adapter;
