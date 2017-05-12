// Access Key ID:
//     AKIAJFZDKSZK5NMTWMAA
// Secret Access Key:
//     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

var secretKey = 'YAyGMEMheHKCjGYlJB27TF4UEHfbpyIlJuyV5/3W';
var secretKeyId = 'AKIAJFZDKSZK5NMTWMAA';
var S3Adapter = require('./index');
var fs = require('fs');

var s3Adapter = new S3Adapter(
     secretKeyId,
     secretKey,
     'yasdad', {
      region: 'us-west-2',
      bucketPrefix: '',
      directAccess: false,
      baseUrl: 'http://images.example.com',
      signatureVersion: 'v4',
      globalCacheControl: 'public, max-age=86400', // 24 hrs Cache-Control.
        ServerSideEncryption: 'aws:kms'
    });


var file = fs.readFileSync('./sdl_logo.png');


s3Adapter.createFile('l_logo.png', file, 'image/png').then(function (resolve, reject) {
  if(resolve){
    console.log('resolve '+resolve);

  }
  if(reject){
    console.log('reject '+reject);
  }
})
