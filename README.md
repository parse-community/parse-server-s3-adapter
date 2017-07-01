# parse-server-s3-adapter

[![Greenkeeper badge](https://badges.greenkeeper.io/parse-server-modules/parse-server-s3-adapter.svg)](https://greenkeeper.io/)
[![codecov.io](https://codecov.io/github/parse-server-modules/parse-server-s3-adapter/coverage.svg?branch=master)](https://codecov.io/github/parse-server-modules/parse-server-s3-adapter?branch=master)
[![Build Status](https://travis-ci.org/parse-server-modules/parse-server-s3-adapter.svg?branch=master)](https://travis-ci.org/parse-server-modules/parse-server-s3-adapter)

parse-server adapter for AWS S3

# installation

`npm install --save parse-server-s3-adapter`

# AWS Credentials

This adapter uses the AWS SDK to access S3.  The SDK must have access to appropriate credentials.  To properly configure the AWS SDK see [the docs](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#config-settings-and-precedence).  For more information on AWS best practices, see [IAM Best Practices User Guide](http://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html).

In short, for development purposes, you can configure your credentials using the aws cli with the following command:

``` aws configure```

For production on an AWS ec2 instance, the instance role should have appropriate permissions and this adapter will pick them up through the AWS SDK.

# usage with parse-server

### using a config file

```
{
  "appId": 'my_app_id',
  "masterKey": 'my_master_key',
  // other options
  "filesAdapter": {
    "module": "parse-server-s3-adapter",
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
  "filesAdapter": "parse-server-s3-adapter"
}
```


### passing as an instance
```
var S3Adapter = require('parse-server-s3-adapter');

var s3Adapter = new S3Adapter(bucket, {
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
S3Adapter(options) // where options must contain bucket.
S3Adapter(options, s3overrides)
```
If you use the last form, `s3overrides` are the parameters passed to [AWS.S3](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property).

In this form if you set `s3overrides.params`, you must set at least `s3overrides.params.Bucket`

or with an options hash

```
var S3Adapter = require('parse-server-s3-adapter');

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
