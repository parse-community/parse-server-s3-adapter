# Parse Server S3 File Adapter <!-- omit in toc -->

[![Build Status](https://github.com/parse-community/parse-server-s3-adapter/workflows/ci/badge.svg?branch=master)](https://github.com/parse-community/parse-server-s3-adapter/actions?query=workflow%3Aci+branch%3Amaster)
[![Snyk Badge](https://snyk.io/test/github/parse-community/parse-server-s3-adapter/badge.svg)](https://snyk.io/test/github/parse-community/parse-server-s3-adapter)
[![Coverage](https://img.shields.io/codecov/c/github/parse-community/parse-server-s3-adapter/master.svg)](https://codecov.io/github/parse-community/parse-server-s3-adapter?branch=master)
[![auto-release](https://img.shields.io/badge/%F0%9F%9A%80-auto--release-9e34eb.svg)](https://github.com/parse-community/parse-server-s3-adapter/releases)

[![Parse Server](https://img.shields.io/badge/Parse_Server-7.0-169CEE.svg?style=flat&logo=data:image/svg%2bxml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJ1dWlkLTg2MzQ2MDY1LTNjNjQtNDBlYy1hNmQ0LWUyNzZmM2E0Y2U5MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMTExMy42NiAxMDk5LjQyIj48ZyBpZD0idXVpZC04MWRmNWUyZC04YWQyLTQwMmEtYTNlZS1hYjE2YTQ5NjhhNjciPjxwYXRoIGQ9Ik00ODUuMDMsNzg1LjE0Yy04MC4zMSwwLTE2MC42MS0uMDktMjQwLjkyLjA3LTE5LjY5LjA0LTM4Ljk2LDIuODUtNTYuODksMTEuODYtMzAuNjEsMTUuMzktNDYuMjQsNDAuODYtNTAuNTEsNzQuMTctMS43OCwxMy44Ny0xLjA3LDI3LjUzLDIuNCw0MS4wNyw5Ljg4LDM4LjYxLDQwLjk3LDYzLDgwLjc3LDYzLjYxLDE0LjQ4LjIyLDI4LjYtMS4xMyw0Mi4xOC02LjU3LDIyLjIxLTguODksMzcuNjgtMjQuNjksNDcuNTUtNDYuMjIsNS43LTEyLjQ0LDguNzgtMjUuNiwxMC4wMy0zOS4yMS43LTcuNjUsMS4zNC04LjM5LDkuMDctOC40LDM5LjExLS4wNiw3OC4yMi0uMDYsMTE3LjMzLDAsNy44MS4wMSw4LjcuNzcsOC4yNSw4LjYxLTEuNSwyNS45LTYuMjYsNTEuMTktMTQuOTUsNzUuNjgtOS44OSwyNy44OC0yNC41Miw1Mi45Ni00NC44OCw3NC40OS0xMi4wNiwxMi43NS0yNS44NiwyMy41LTQxLDMyLjM2LTI3LjYxLDE2LjE3LTU3LjU2LDI1LjU0LTg5LjIxLDI5LjYzLTE2LjAzLDIuMDctMzIuMTMsMy41Ni00OC4zMiwyLjk5LTUxLjA1LTEuODEtOTguMTktMTUuMzItMTM4LjkyLTQ3LjM1LTI5LjE4LTIyLjk0LTUwLjIzLTUxLjkxLTYzLjE2LTg2LjczQzQuNDksOTQwLjAzLjIsOTE0LjAyLDAsODg3LjEyYy0uMi0yNy4zOSwzLjIzLTU0LjA2LDEyLjA0LTgwLjAxLDE2LjE1LTQ3LjU1LDQ2LjA0LTg0LjIyLDg4LjM3LTExMC44NSwzMy41LTIxLjA4LDcwLjM1LTMyLjQxLDEwOS41MS0zNi43NiwxOC45My0yLjEsMzcuOTEtMi43OCw1Ni45NS0yLjc4LDE0Ni4wMS4wNiwyOTIuMDItLjE0LDQzOC4wMy4xNCw0MC43OC4wOCw3OS44OC03LjIsMTE3LjEzLTIzLjY0LDUxLjQ0LTIyLjcsOTEuNi01OC4yNSwxMTkuNzUtMTA3LjA4LDE5LjE3LTMzLjI3LDI5Ljk3LTY5LjE0LDMzLjU2LTEwNy4zNSw0LjI0LTQ1LjEyLS42My04OS4xNy0xNi44LTEzMS40Ni0yOS4xNS03Ni4xOS04My4xMS0xMjUuOTUtMTYxLjc0LTE0OC41NS0zMC42OC04LjgxLTYyLjExLTExLjExLTkzLjc0LTkuMDMtNTAuMzEsMy4zMS05Ni41MiwxOC45LTEzNy4wOCw0OS40MS0yNi45OCwyMC4zLTQ4Ljg5LDQ1LjI3LTY1LjkxLDc0LjQ3LTIzLjY0LDQwLjU2LTM2LjIsODQuNTgtNDEuMzYsMTMxLTIuMDUsMTguNDItMi45OSwzNi44NS0yLjkzLDU1LjM4LjEzLDM4LjA3LjA0LDc2LjEzLjA0LDExNC4yLDAsMi4zNS4xLDQuNy0uMDgsNy4wNC0uMzYsNC44Ny0xLjIzLDUuNjktNi4yMiw2LjA4LTEuODIuMTQtMy42NS4wNy01LjQ3LjA3LTM3LjU1LDAtNzUuMDksMC0xMTIuNjQsMC0xLjU2LDAtMy4xMy4wNS00LjY5LS4wNC01Ljk2LS4zMi02Ljc1LTEuMDgtNy4xMS02LjgyLS4wNi0xLjA0LS4wNC0yLjA5LS4wNC0zLjEzLjAyLTQ1LjYzLS44NC05MS4yOC4yOC0xMzYuODgsMS44MS03My44NSwxNi43My0xNDQuODQsNTAuNTQtMjExLjE0LDIxLjE3LTQxLjUxLDQ4LjY0LTc4LjQsODMuMi0xMDkuNzEsNDEuMzktMzcuNDksODguOTYtNjQuMjcsMTQyLjM5LTgwLjcxLDMwLjU1LTkuNCw2MS43NC0xNS4zNSw5My41My0xNy42NSw4MC4yMS01Ljc5LDE1Ny4wNSw2Ljg1LDIyOC42LDQ0Ljg3LDYzLjExLDMzLjU0LDExMi4wMSw4MS44OCwxNDYuNTUsMTQ0LjU1LDI0LjczLDQ0Ljg3LDM5LjE3LDkyLjk2LDQ1LjU3LDE0My43MSwzLjcxLDI5LjM4LDQuMjIsNTguODcsMi4yOSw4OC4yMS00LjU0LDY5LjI2LTI1LjQxLDEzMy4zOS02NC41LDE5MS4xMS0zNS41MSw1Mi40Mi04MS43Miw5Mi44OC0xMzcuNjgsMTIyLjM4LTQ1LjQ5LDIzLjk4LTkzLjg4LDM4LjY1LTE0NC43NSw0NS4zNC0xOS4zOCwyLjU1LTM4Ljg3LDMuNzQtNTguNDYsMy43LTc0LjA1LS4xNi0xNDguMS0uMDYtMjIyLjE0LS4wNloiIHN0eWxlPSJmaWxsOiNlMGUwZTA7Ii8+PC9nPjwvc3ZnPg==)](https://github.com/parse-community/parse-server/releases)
[![Node Version](https://img.shields.io/badge/nodejs-18,_20,_22-green.svg?logo=node.js&style=flat)](https://nodejs.org)

[![npm latest version](https://img.shields.io/npm/v/@parse/s3-files-adapter.svg)](https://www.npmjs.com/package/@parse/s3-files-adapter)

---

The official AWS S3 file storage adapter for Parse Server. See [Parse Server S3 File Adapter Configuration](https://docs.parseplatform.org/parse-server/guide/#configuring-s3adapter) for more details. 

---

- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Compatibility](#compatibility)
    - [Parse Server](#parse-server)
    - [Node.js](#nodejs)
  - [AWS Credentials](#aws-credentials)
  - [Deprecated Configuration](#deprecated-configuration)
- [Usage with Parse Server](#usage-with-parse-server)
  - [Parameters](#parameters)
  - [Using a Config File](#using-a-config-file)
  - [Using Environment Variables](#using-environment-variables)
  - [Passing as an Instance](#passing-as-an-instance)
  - [Adding Metadata and Tags](#adding-metadata-and-tags)
- [Compatibility with other Storage Providers](#compatibility-with-other-storage-providers)
  - [Digital Ocean Spaces](#digital-ocean-spaces)
- [Migration Guide from 3.x to 4.x](#migration-guide-from-3x-to-4x)


# Getting Started

## Installation

`npm install --save @parse/s3-files-adapter`

## Compatibility

### Parse Server

Parse Server S3 Adapter is compatible with the following versions of Parse Server.

| Parse Server Version | End-of-Life   | Compatible |
|----------------------|---------------|------------|
| <=5                  | December 2023 | ❌ No       |
| 6                    | December 2024 | ❌ No       |
| <7.3.0               | December 2025 | ❌ No       |
| >=7.3.0              | December 2025 | ✅ Yes      |

### Node.js

Parse Server S3 Adapter is continuously tested with the most recent releases of Node.js to ensure compatibility. We follow the [Node.js Long Term Support plan](https://github.com/nodejs/Release) and only test against versions that are officially supported and have not reached their end-of-life date.

| Node.js Version | End-of-Life | Compatible |
|-----------------|-------------|------------|
| 18              | April 2025  | ✅ Yes      |
| 20              | April 2026  | ✅ Yes      |
| 22              | April 2027  | ✅ Yes      |

## AWS Credentials

⚠️ The ability to explicitly pass credentials to this adapter is deprecated and will be removed in a future release.

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

## Deprecated Configuration

Although it is not recommended, AWS credentials can be explicitly configured through an options
object, constructor string arguments or environment variables ([see below](#using-a-config-file)).
This option is provided for backward compatibility and will be removed in the forthcoming version 2.0 of this adapter.

The preferred method is to use the default AWS credentials pattern.  If no AWS credentials are explicitly configured, the AWS SDK will look for credentials in the standard locations used by all AWS SDKs and the AWS CLI. More info can be found in [the docs](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#config-settings-and-precedence).  For more information on AWS best practices, see [IAM Best Practices User Guide](http://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html).

# Usage with Parse Server

## Parameters

*(This list is still incomplete and in the works, in the meantime find more descriptions in the chapters below.)*

| Parameter             | Optional | Default value | Environment variable     | Description                                                                                                                                                                                                                                                                                                                                                                     |
|-----------------------|----------|---------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fileAcl`             | yes      | `undefined`   | S3_FILE_ACL              | Sets the [Canned ACL](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl) of the file when storing it in the S3 bucket. Setting this parameter overrides the file ACL that would otherwise depend on the `directAccess` parameter. Setting the value `'none'` causes any ACL parameter to be removed that would otherwise be set.                     |
| `presignedUrl`        | yes      | `false`       | S3_PRESIGNED_URL         | If `true` a [presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/dev/ShareObjectPreSignedURL.html) is returned when requesting the URL of file. The URL is only valid for a specified duration, see parameter `presignedUrlExpires`.                                                                                                                                     |
| `presignedUrlExpires` | yes      | `undefined`   | S3_PRESIGNED_URL_EXPIRES | Sets the duration in seconds after which the [presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/dev/ShareObjectPreSignedURL.html) of the file expires. If no value is set, the AWS S3 SDK default [Expires](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property) value applies. This parameter requires `presignedUrl` to be `true`. |

## Using a Config File

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
      "fileAcl": null, // default value
      "baseUrl": null, // default value
      "baseUrlDirect": false, // default value
      "signatureVersion": 'v4', // default value
      "globalCacheControl": null, // default value. Or 'public, max-age=86400' for 24 hrs Cache-Control
      "presignedUrl": false, // Optional. If true a presigned URL is returned when requesting the URL of file. The URL is only valid for a specified duration, see parameter `presignedUrlExpires`. Default is false.
      "presignedUrlExpires": null, // Optional. Sets the duration in seconds after which the presigned URL of the file expires. Defaults to the AWS S3 SDK default Expires value.
      "ServerSideEncryption": 'AES256|aws:kms', //AES256 or aws:kms, or if you do not pass this, encryption won't be done
      "validateFilename": null, // Default to parse-server FilesAdapter::validateFilename.
      "generateKey": null // Will default to Parse.FilesController.preserveFileName
    }
  }
}
```
***Note*** By default Parse.FilesController.preserveFileName will prefix all filenames with a random hex code.   You will want to disable that if you enable it here or wish to use S3 "directories".

## Using Environment Variables

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


## Passing as an Instance
```
var S3Adapter = require('@parse/s3-files-adapter');

var s3Adapter = new S3Adapter(
  'accessKey',
  'secretKey',
  'bucket',
  {
    region: 'us-east-1'
    bucketPrefix: '',
    directAccess: false,
    baseUrl: 'http://images.example.com',
    signatureVersion: 'v4',
    globalCacheControl: 'public, max-age=86400',  // 24 hrs Cache-Control.
    presignedUrl: false,
    presignedUrlExpires: 900,
    validateFilename: (filename) => {
      if (filename.length > 1024) {
          return 'Filename too long.';
        }
        return null; // Return null on success
    },
    generateKey: (filename) => {
      return `${Date.now()}_${filename}`; // unique prefix for every filename
    }
  }
);

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
  "globalCacheControl": null, // default value. Or 'public, max-age=86400' for 24 hrs Cache-Control
  "presignedUrl": false, // default value
  "presignedUrlExpires": 900, // default value (900 seconds)
  "validateFilename": () => null, // Anything goes!
  "generateKey": (filename) => filename,  // Ensure Parse.FilesController.preserveFileName is true!
}

var s3Adapter = new S3Adapter(s3Options);

var api = new ParseServer({
  appId: 'my_app',
  masterKey: 'master_key',
  filesAdapter: s3Adapter
})
```

## Adding Metadata and Tags

Use the optional options argument to add [Metadata](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/add-object-metadata.html) and/or [Tags](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/add-object-tags.html) to S3 objects

```


const S3Adapter = require('@parse/s3-files-adapter');

const s3Options = {}; // Add correct options
const s3Adapter = new S3Adapter(s3Options);

const filename = 'Fictional_Characters.txt';
const data = 'That\'s All Folks!';
const contentType = 'text/plain';
const tags = {
  createdBy: 'Elmer Fudd',
  owner: 'Popeye'
};
const metadata = {
  source: 'Mickey Mouse'
};
const options = { tags, metadata };
s3Adapter.createFile(filename, data, contentType, options);

```

**Note:** This adapter will **automatically** add the "x-amz-meta-" prefix to the beginning of metadata tags as stated in [S3 Documentation](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/add-object-metadata.html).


# Compatibility with other Storage Providers

## Digital Ocean Spaces

```js
var S3Adapter = require("@parse/s3-files-adapter");
var AWS = require("aws-sdk");

//Configure Digital Ocean Spaces EndPoint
var s3Options = {
  bucket: process.env.SPACES_BUCKET_NAME,
  baseUrl: process.env.SPACES_BASE_URL,
  region: process.env.SPACES_REGION,
  directAccess: true,
  globalCacheControl: "public, max-age=31536000",
  presignedUrl: false,
  presignedUrlExpires: 900,
  bucketPrefix: process.env.SPACES_BUCKET_PREFIX,
  s3overrides: {
    accessKeyId: process.env.SPACES_ACCESS_KEY,
    secretAccessKey: process.env.SPACES_SECRET_KEY,
    endpoint: process.env.SPACES_ENDPOINT
  }
};

var s3Adapter = new S3Adapter(s3Options);

var api = new ParseServer({
  databaseURI: process.env.DATABASE_URI || "mongodb://localhost:27017/dev",
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + "/cloud/main.js",
  appId: process.env.APP_ID || "myAppId",
  masterKey: process.env.MASTER_KEY || "",
  serverURL: process.env.SERVER_URL || "http://localhost:1337/parse",
  logLevel: process.env.LOG_LEVEL || "info",
  allowClientClassCreation: false,
  filesAdapter: s3Adapter
});
```


# Migration Guide from 3.x to 4.x

Due to the deprecation of the AWS SDK v2, Parse Server S3 Adapter 4.x adopts the AWS SDK v3. When upgrading from Parse Server S3 Adapter 3.x to 4.x, consider that S3 credentials are passed differently:

*Parse Server S3 Adapter 3.x:*

```js
const options = {
  bucket: '<AWS_S3_BUCKET>',
  s3overrides: {
    accessKeyId: '<AWS_ACCESS_KEY>',
    secretAccessKey: '<AWS_SECRET_KEY>'
  }
};
```

*Parse Server S3 Adapter 4.x:*

```js
const options = {
  bucket: '<AWS_S3_BUCKET>',
  s3overrides: {
    credentials: {
      accessKeyId: '<AWS_ACCESS_KEY>',
      secretAccessKey: '<AWS_SECRET_KEY>'
    }
  }
};
```

Alternatively, the credentials can be set on the root object:

```js
const options = {
  bucket: '<AWS_S3_BUCKET>',
  credentials: {
    accessKeyId: '<AWS_ACCESS_KEY>',
    secretAccessKey: '<AWS_SECRET_KEY>'
  }
};
```

> [!NOTE]
> It is best practice to not store credentials as environment variables, as they can be easily retrieved on a compromised machine. For Parse Server running in an AWS environment, use more secure alternatives like AWS Secrets Manager, or AWS Credential Identity Provider to access shared credentials:
>
> ```js
> import { fromIni } from 'aws-sdk/credential-providers';
>
> const options = {
>   bucket: '<AWS_S3_BUCKET>',
>   s3overrides: {
>     credentials: fromIni({ profile: '<AWS_CLIENT_PROFILE>' })
>   }
> };
> ```
