# parse-server-s3-adapter
[![codecov.io](https://codecov.io/github/parse-server-modules/parse-server-s3-adapter/coverage.svg?branch=master)](https://codecov.io/github/parse-server-modules/parse-server-s3-adapter?branch=master)
[![Build Status](https://travis-ci.org/parse-server-modules/parse-server-s3-adapter.svg?branch=master)](https://travis-ci.org/parse-server-modules/parse-server-s3-adapter)

parse-server adapter for AWS S3

# installation

`npm install --save parse-server-s3-adapter`

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
      "accessKey": "accessKey",
      "secretKey": "secretKey",
      "bucket": "my_bucket",
      // optional:
      "region": 'us-east-1', // default value
      "bucketPrefix": '', // default value
      "directAccess": false, // default value
      "baseUrl": null, // default value
      "baseUrlDirect": false // default value
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
                  'secretKey',
                  'bucket' , {
                    region: 'us-east-1'
                    bucketPrefix: '',
                    directAccess: false,
                    baseUrl: 'http://images.example.com'
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
  "accessKey": "accessKey",
  "secretKey": "secretKey",
  "bucket": "my_bucket",
  // optional:
  "region": 'us-east-1', // default value
  "bucketPrefix": '', // default value
  "directAccess": false, // default value
  "baseUrl": null // default value
}

var s3Adapter = new S3Adapter(s3Options);

var api = new ParseServer({
  appId: 'my_app',
  masterKey: 'master_key',
  filesAdapter: s3Adapter
})
```
