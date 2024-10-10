const { Readable } = require('stream');
const S3Adapter = require('../../index.js');
const { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

function makeS3Adapter(options) {
  let s3;

  if (
    process.env.TEST_S3_ACCESS_KEY &&
    process.env.TEST_S3_SECRET_KEY &&
    process.env.TEST_S3_BUCKET
  ) {
    // Should be initialized from the env
    s3 = new S3Adapter(
      Object.assign(
        {
          accessKey: process.env.TEST_S3_ACCESS_KEY,
          secretKey: process.env.TEST_S3_SECRET_KEY,
          bucket: process.env.TEST_S3_BUCKET,
          region: process.env.TEST_S3_REGION,
        },
        options
      )
    );
  } else {
    const bucket = 'FAKE_BUCKET';
    const region = 'us-east-1';

    s3 = new S3Adapter('FAKE_ACCESS_KEY', 'FAKE_SECRET_KEY', bucket, options);

    const objects = {};

    s3._s3Client = {
      send: command => {
        if (command instanceof PutObjectCommand) {
          const { Key, Body } = command.input;

          objects[Key] = Body;

          return Promise.resolve({
            Location: `https://${bucket}.s3.${region}.amazonaws.com/${Key}`,
          });
        }
        if (command instanceof DeleteObjectCommand) {
          const { Key } = command.input;

          delete objects[Key];

          return Promise.resolve({});
        }
        if (command instanceof GetObjectCommand) {
          const { Key } = command.input;

          if (objects[Key]) {
            const stream = new Readable();
            stream.push('hello world');
            stream.push(null); // End of stream

            return {
              Body: stream,
              AcceptRanges: 'bytes',
              ContentLength: 36,
              ContentRange: 'bytes 0-35/36',
              ContentType: 'text/plain',
            };
          } else {
            return Promise.reject(new Error('Not found'));
          }
        }
        return Promise.resolve();
      },
    };
  }
  return s3;
}

module.exports = {makeS3Adapter}
