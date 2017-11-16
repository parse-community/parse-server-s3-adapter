# parse-server-s3-adapter

[![Greenkeeper badge](https://badges.greenkeeper.io/parse-community/parse-server-s3-adapter.svg)](https://greenkeeper.io/)
[![codecov.io](https://codecov.io/github/parse-community/parse-server-s3-adapter/coverage.svg?branch=master)](https://codecov.io/github/parse-community/parse-server-s3-adapter?branch=master)
[![Build Status](https://travis-ci.org/parse-community/parse-server-s3-adapter.svg?branch=master)](https://travis-ci.org/parse-community/parse-server-s3-adapter)

parse-server adapter for AWS S3

# installation

`npm install --save @parse/s3-files-adapter`

# AWS Credentials

## Deprecation Notice -- AWS Credentials
 *the ability to explicitly pass credentials to this adapter is deprecated and will be removed in a future release.*

You may already be compatible with this change.  If you have not explicitly set an `accessKey` and `secretKey` and you have configured the environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, then you're all set and this will continue to work as is.

If you explicitly configured the environment variables `S3_ACCESS_KEY`
`S3_SECRET_KEY`

*OR*

If you explicitly configured the `accessKey` and `secretKey` in your adapter configuration, then you'll need to...

For non AWS hosts:

*  Run `aws configure` in a terminal which will step you through configuring credentials for the AWS SDK and CLI

For an AWS host:

*  Ensure that the role that your host is running as has permissions for your s3 bucket

*Then*

*  remove the `accessKey` and `secretKey` from your configuration

If for some reason you really need to be able to set the key and secret explicitly, you can still do it using `s3overrides` as described below and setting `accessKeyId` and `secretAccessKey` in the `s3Overrides` object.

# Deprecated Configuration
Although it is not recommended, AWS credentials can be explicitly configured through an options
object, constructor string arguments or environment variables ([see below](#using-a-config-file)).
This option is provided for backward compatibility and will be removed in the forthcoming version 2.0 of this adapter.

The preferred method is to use the default AWS credentials pattern.  If no AWS credentials are explicitly configured, the AWS SDK will look for credentials in the standard locations used by all AWS SDKs and the AWS CLI. More info can be found in [the docs](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#config-settings-and-precedence).  For more information on AWS best practices, see [IAM Best Practices User Guide](http://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html).

# usage with parse-server

### using a config file

```
{
  "appId": 'my_app_id',
  "masterKey": 'my_master_key',
  // other options
  "filesAdapter": {
    "module": "@parse/s3-files-adapter",
    "options": {
      "bucket": "my_bucket",
      // optional:
      "region": 'us-east-1', // default value
      "bucketPrefix": '', // default value
      "directAccess": false, // default value
      "baseUrl": null, // default value
      "baseUrlDirect": false, // default value
      "signatureVersion": 'v4', // default value
      "globalCacheControl": null, // default value. Or 'public, max-age=86400' for 24 hrs Cache-Control
      "ServerSideEncryption": 'AES256|aws:kms' //AES256 or aws:kms, or if you do not pass this, encryption won't be done
    }
  }
}
```

### using environment variables

Set your environment variables:

```
S3_BUCKET=bucketName
```

the following optional configuration can be set by environment variable too:

```
S3_SIGNATURE_VERSION=v4
```

And update your config / options

```
{
  "appId": 'my_app_id',
  "masterKey": 'my_master_key',
  // other options
  "filesAdapter": "@parse/s3-files-adapter"
}
```


### passing as an instance
```
var S3Adapter = require('@parse/s3-files-adapter');

var s3Adapter = new S3Adapter('accessKey',
                  'secretKey', bucket, {
                    region: 'us-east-1'
                    bucketPrefix: '',
                    directAccess: false,
                    baseUrl: 'http://images.example.com',
                    signatureVersion: 'v4',
                    globalCacheControl: 'public, max-age=86400'  // 24 hrs Cache-Control.
                  });

var api = new ParseServer({
	appId: 'my_app',
	masterKey: 'master_key',
	filesAdapter: s3adapter
})
```
**Note:** there are a few ways you can pass arguments:

```
S3Adapter("bucket")
S3Adapter("bucket", options)
S3Adapter("key", "secret", "bucket") -- Deprecated, see notice above
S3Adapter("key", "secret", "bucket", options) -- Deprecated, see notice above
S3Adapter(options) // where options must contain bucket.
S3Adapter(options, s3overrides)
```
If you use the last form, `s3overrides` are the parameters passed to [AWS.S3](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property).

In this form if you set `s3overrides.params`, you must set at least `s3overrides.params.Bucket`

or with an options hash

```
var S3Adapter = require('@parse/s3-files-adapter');

var s3Options = {
  "bucket": "my_bucket",
  // optional:
  "region": 'us-east-1', // default value
  "bucketPrefix": '', // default value
  "directAccess": false, // default value
  "baseUrl": null // default value
  "signatureVersion": 'v4', // default value
  "globalCacheControl": null // default value. Or 'public, max-age=86400' for 24 hrs Cache-Control
}

var s3Adapter = new S3Adapter(s3Options);

var api = new ParseServer({
  appId: 'my_app',
  masterKey: 'master_key',
  filesAdapter: s3Adapter
})
```
