'use strict';

const DEFAULT_S3_REGION = 'us-east-1';

function requiredOrFromEnvironment(options, key, env) {
  options[key] = options[key] || process.env[env];
  if (!options[key]) {
    throw `S3Adapter requires option '${key}' or env. variable ${env}`;
  }
  return options;
}

function fromEnvironmentOrDefault(options, key, env, defaultValue) {
  options[key] = options[key] || process.env[env] || defaultValue;
  return options;
}

const optionsFromArguments = function optionsFromArguments(args) {
  const stringOrOptions = args[0];
  let options = {};
  let otherOptions;

  if (typeof stringOrOptions == 'string') {
    if (args.length == 1) {
      options.bucket = stringOrOptions;
    } else if (args.length == 2) {
      options.bucket = stringOrOptions;
      if (typeof args[1] != 'object') {
        throw new Error('Failed to configure S3Adapter. Arguments don\'t make sense');
      }
      otherOptions = args[1];
    } else if (args.length > 2) {
      if (typeof args[1] != 'string' || typeof args[2] != 'string') {
        throw new Error('Failed to configure S3Adapter. Arguments don\'t make sense');
      }
      options.accessKey = args[0];
      options.secretKey = args[1];
      options.bucket = args[2];
      otherOptions = args[3];
    }

    if (otherOptions) {
      options.bucketPrefix = otherOptions.bucketPrefix;
      options.directAccess = otherOptions.directAccess;
      options.baseUrl = otherOptions.baseUrl;
      options.baseUrlDirect = otherOptions.baseUrlDirect;
      options.signatureVersion = otherOptions.signatureVersion;
      options.globalCacheControl = otherOptions.globalCacheControl;
    }
  } else {
    options = stringOrOptions || {};
  }
  options = requiredOrFromEnvironment(options, 'bucket', 'S3_BUCKET');
  options = fromEnvironmentOrDefault(options, 'accessKey', 'S3_ACCESS_KEY', null);
  options = fromEnvironmentOrDefault(options, 'secretKey', 'S3_SECRET_KEY', null);
  options = fromEnvironmentOrDefault(options, 'bucketPrefix', 'S3_BUCKET_PREFIX', '');
  options = fromEnvironmentOrDefault(options, 'region', 'S3_REGION', DEFAULT_S3_REGION);
  options = fromEnvironmentOrDefault(options, 'directAccess', 'S3_DIRECT_ACCESS', false);
  options = fromEnvironmentOrDefault(options, 'baseUrl', 'S3_BASE_URL', null);
  options = fromEnvironmentOrDefault(options, 'baseUrlDirect', 'S3_BASE_URL_DIRECT', false);
  options = fromEnvironmentOrDefault(options, 'signatureVersion', 'S3_SIGNATURE_VERSION', 'v4');
  options = fromEnvironmentOrDefault(
    options, 'globalCacheControl', 'S3_GLOBAL_CACHE_CONTROL', null);

  return options;
}

module.exports = optionsFromArguments;
