# parse-server-s3-adapter
[![codecov.io](https://codecov.io/github/parse-server-modules/parse-server-s3-adapter/coverage.svg?branch=master)](https://codecov.io/github/parse-server-modules/parse-server-s3-adapter?branch=master)
[![Build Status](https://travis-ci.org/parse-server-modules/parse-server-s3-adapter.svg?branch=master)](https://travis-ci.org/parse-server-modules/parse-server-s3-adapter)

parse-server adapter for AWS S3

# installation

`npm install --save parse-server-s3-adapter`

# aws credentials

Although it is not recommended, AWS credentials can be explicitly configured through an options
object, constructor string arguments or environment variables ([see below](#using-a-config-file)).
This option is provided for backward compatibility.

The preferred method is to use the default AWS credentials pattern.  If no AWS credentials are explicitly configured, the AWS SDK will look for credentials in the standard locations used by all AWS SDKs and the AWS CLI. More info can be found in [the docs](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#config-settings-and-precedence).  For more information on AWS best practices, see [IAM Best Practices User Guide](http://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html).

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
      "accessKey": "accessKey",
      "secretKey": "secretKey",
      "region": 'us-east-1', // default value
      "bucketPrefix": '', // default value
      "directAccess": false, // default value
      "baseUrl": null, // default value
      "baseUrlDirect": false, // default value
      "signatureVersion": 'v4', // default value
      "globalCacheControl": null // default value. Or 'public, max-age=86400' for 24 hrs Cache-Control
    }
  }
}
```

### using environment variables

Set your environment variables:

```
S3_BUCKET=bucketName
```

the following optional configurations can be set by environment variables too:

```
S3_ACCESS_KEY=accessKey
S3_SECRET_KEY=secretKey
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
S3Adapter("key", "secret", "bucket")
S3Adapter("key", "secret", "bucket", options)
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
  "accessKey": null, // default value
  "secretKey": null, // default value
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
