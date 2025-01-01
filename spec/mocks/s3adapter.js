const { Readable } = require('stream');
const S3Adapter = require('../../index.js');
const { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

function getMockS3Adapter(options) {
  const accessKey = process.env.TEST_S3_ACCESS_KEY || 'ACCESS_KEY';
  const secretKey = process.env.TEST_S3_SECRET_KEY || 'SECRET_KEY';
  const bucket = process.env.TEST_S3_BUCKET || 'BUCKET';
  const region = process.env.TEST_S3_REGION || 'us-east-1';

  const s3 = new S3Adapter(Object.assign({
    accessKey,
    secretKey,
    bucket,
  }, options));

  const objects = {};

  s3._s3Client = {
    // @ts-ignore
    send: command => {
      if (command instanceof PutObjectCommand) {
        const { Key, Body } = command.input;
        objects[Key] = Body;
        return Promise.resolve({ Location: `https://${bucket}.s3.${region}.amazonaws.com/${Key}` });
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
          // End of stream
          stream.push(null);
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

  return s3;
}

module.exports = { getMockS3Adapter };
