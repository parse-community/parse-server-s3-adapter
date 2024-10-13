const S3Adapter = require('../../index.js');

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
        },
        options
      )
    );
  } else {
    const bucket = 'FAKE_BUCKET';

    s3 = new S3Adapter('FAKE_ACCESS_KEY', 'FAKE_SECRET_KEY', bucket, options);

    const objects = {};

    s3._s3Client = {
      createBucket: callback => setTimeout(callback, 100),
      upload: (params, callback) =>
        setTimeout(() => {
          const { Key, Body } = params;

          objects[Key] = Body;

          callback(null, {
            Location: `https://${bucket}.s3.amazonaws.com/${Key}`,
          });
        }, 100),
      deleteObject: (params, callback) =>
        setTimeout(() => {
          const { Key } = params;

          delete objects[Key];

          callback(null, {});
        }, 100),
      getObject: (params, callback) =>
        setTimeout(() => {
          const { Key } = params;

          if (objects[Key]) {
            callback(null, {
              Body: Buffer.from(objects[Key], 'utf8'),
            });
          } else {
            callback(new Error('Not found'));
          }
        }, 100),
    };
  }
  return s3;
}

module.exports = { makeS3Adapter };
