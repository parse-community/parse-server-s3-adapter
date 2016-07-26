# parse-server-s3-adapter
[![codecov.io](https://codecov.io/github/parse-server-modules/parse-server-s3-adapter/coverage.svg?branch=master)](https://codecov.io/github/parse-server-modules/parse-server-s3-adapter?branch=master)
[![Build Status](https://travis-ci.org/parse-server-modules/parse-server-s3-adapter.svg?branch=master)](https://travis-ci.org/parse-server-modules/parse-server-s3-adapter)

parse-server adapter for AWS S3

# installation

`npm install --save parse-server-s3-adapter`

# aws credentials

AWS credentials can be explicitly configured through an options object or environment variables ([see below](#using-a-config-file)).

If no AWS credentials are configured, the AWS SDK will look for credentials in the standard locations used by all AWS SDKs and the AWS CLI. More info can be found in [the docs](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#config-settings-and-precedence).

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
      "globalCacheControl": null // default value. Or 'public, max-age=86400000' for 24 hrs Cache-Control
    }
  }
}
```

### using environment variables

Set your environment variables:

```
S3_ACCESS_KEY=accessKey
S3_SECRET_KEY=secretKey
S3_BUCKET=bucketName
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

var s3Adapter = new S3Adapter('bucket', ['accessKey',
                  'secretKey',] {
                    region: 'us-east-1'
                    bucketPrefix: '',
                    directAccess: false,
                    baseUrl: 'http://images.example.com',
                    signatureVersion: 'v4',
                    globalCacheControl: 'public, max-age=86400000'  // 24 hrs Cache-Control.
                  });

var api = new ParseServer({
	appId: 'my_app',
	masterKey: 'master_key',
	filesAdapter: s3adapter
})
```

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
  "globalCacheControl": null // default value. Or 'public, max-age=86400000' for 24 hrs Cache-Control
}

var s3Adapter = new S3Adapter(s3Options);

var api = new ParseServer({
  appId: 'my_app',
  masterKey: 'master_key',
  filesAdapter: s3Adapter
})
```
