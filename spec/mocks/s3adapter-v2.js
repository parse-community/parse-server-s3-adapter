const S3Adapter = require('../../index.js');

function getMockS3Adapter(options) {
  const accessKey = process.env.TEST_S3_ACCESS_KEY || 'ACCESS_KEY';
  const secretKey = process.env.TEST_S3_SECRET_KEY || 'SECRET_KEY';
  const bucket = process.env.TEST_S3_BUCKET || 'BUCKET';

  const s3 = new S3Adapter(Object.assign({
    accessKey,
    secretKey,
    bucket,
  }, options));

  const objects = {};

  s3._s3Client = {
    createBucket: callback =>
      // @ts-ignore
      setTimeout(callback, 100),

    upload: (params, callback) =>
      // @ts-ignore
      setTimeout(() => {
        const { Key, Body } = params;
        objects[Key] = Body;
        callback(null, { Location: `https://${bucket}.s3.amazonaws.com/${Key}` });
      }, 100),

    deleteObject: (params, callback) =>
      // @ts-ignore
      setTimeout(() => {
        const { Key } = params;
        delete objects[Key];
        // @ts-ignore
        callback(null, {});
      }, 100),

    getObject: (params, callback) =>
      // @ts-ignore
      setTimeout(() => {
        const { Key } = params;

        if (objects[Key]) {
          // @ts-ignore
          callback(null, { Body: Buffer.from(objects[Key], 'utf8') });
        } else {
          // @ts-ignore
          callback(new Error('Not found'));
        }
      }, 100),
  };

  return s3;
}

module.exports = { getMockS3Adapter };
