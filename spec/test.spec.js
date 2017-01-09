'use strict';

const config = require('config');
const filesAdapterTests = require('parse-server-conformance-tests').files;
const S3Adapter = require('../index.js');
const optionsFromArguments = require('../lib/optionsFromArguments');

describe('S3Adapter tests', () => {
  beforeEach(() => {
    delete process.env.S3_BUCKET;
    delete process.env.S3_REGION;
  });

  it('should throw when not initialized properly', () => {
    expect(() => {
      new S3Adapter();
    }).toThrow("S3Adapter requires option 'bucket' or env. variable S3_BUCKET");

    expect(() => {
      new S3Adapter('accessKey', 'secretKey', {});
    }).toThrow(new Error('Failed to configure S3Adapter. Arguments don\'t make sense'));

    expect(() => {
      new S3Adapter({ accessKey: 'accessKey' , secretKey: 'secretKey'});
    }).toThrow("S3Adapter requires option 'bucket' or env. variable S3_BUCKET")
  })

  it('should not throw when initialized properly', () => {
    expect(() => {
      new S3Adapter('bucket');
    }).not.toThrow()

    expect(() => {
      new S3Adapter({ bucket: 'bucket'});
    }).not.toThrow()

    expect(() => {
      new S3Adapter({}, { params:{ Bucket: 'bucket'}});
    }).not.toThrow()
  });

  it('should accept environment for required', () => {
    const TEST_BUCKET = 'testBucket';
    process.env.S3_BUCKET = TEST_BUCKET;
    const s3 = new S3Adapter();
    expect(s3._bucket).toBe(TEST_BUCKET);
  });

  describe('configured with immutable values', () => {
    describe('not initialized properly', () => {
      it('should fail with two string arguments', () => {
        expect(() => {
          new S3Adapter(config.get('accessKey'), config.get('secretKey'), {});
        }).toThrow(new Error('Failed to configure S3Adapter. Arguments don\'t make sense'));
      });

      it('should fail when passed an object without a bucket', () => {
        expect(() => {
          new S3Adapter(config.get('insufficientOptions'));
        }).toThrow("S3Adapter requires option 'bucket' or env. variable S3_BUCKET")
      });
    });


    describe('should not throw when initialized properly', () => {
      it('should accept a string bucket', () => {
        expect(() => {
          new S3Adapter(config.get('bucket'));
        }).not.toThrow()
      });

      it('should accept an object with a bucket', () => {
        expect(() => {
          new S3Adapter(config.get('objectWithBucket'));
        }).not.toThrow()
      });

      it('should accept a second argument of object with a params object with a bucket', () => {
        expect(() => {
          new S3Adapter(config.get('emptyObject'), config.get('paramsObjectWBucket'));
        }).not.toThrow()
      });

      it('should accept environment over default', () => {
        const TEST_REGION = 'test';
        process.env.S3_REGION = TEST_REGION;
        const s3 = new S3Adapter(config.get('bucket'));
        expect(s3._region).toBe(TEST_REGION);
      });
    });
  });

  describe('to find the right arg in the right place', () => {
    it('should accept just bucket as first string arg', () => {
      var args = ['bucket'];
      var options = optionsFromArguments(args);
      expect(options.bucket).toEqual('bucket');
    });

    it('should accept bucket and options', () => {
      var confObj = { bucketPrefix: 'test/' };
      var args = ['bucket', confObj];
      var options = optionsFromArguments(args);
      expect(options.bucket).toEqual('bucket');
      expect(options.bucketPrefix).toEqual('test/');
    });

    it('should accept key, secret, and bucket as args', () => {
      var args = ['key', 'secret', 'bucket'];
      var options = optionsFromArguments(args);
      expect(options.accessKey).toEqual('key');
      expect(options.secretKey).toEqual('secret');
      expect(options.bucket).toEqual('bucket');
    });

    it('should accept key, secret, bucket, and options object as args', () => {
      var confObj = { bucketPrefix: 'test/' };
      var args = ['key', 'secret', 'bucket', confObj];
      var options = optionsFromArguments(args);
      expect(options.accessKey).toEqual('key');
      expect(options.secretKey).toEqual('secret');
      expect(options.bucket).toEqual('bucket');
      expect(options.bucketPrefix).toEqual('test/');
    });

    it('should accept options and overrides as args', () => {
      var confObj = { bucketPrefix: 'test/', bucket: 'bucket-1', secretKey: 'secret-1', accessKey: 'key-1' };
      var overridesObj = { secretAccessKey: 'secret-2', accessKeyId: 'key-2', params: { Bucket: 'bucket-2' }};
      var s3 = new S3Adapter(confObj, overridesObj);
      expect(s3._s3Client.config.accessKeyId).toEqual('key-2');
      expect(s3._s3Client.config.secretAccessKey).toEqual('secret-2');
      expect(s3._s3Client.config.params.Bucket).toEqual('bucket-2');
      expect(s3._bucketPrefix).toEqual('test/');
    });

    it('should accept overrides without params', () => {
      var confObj = { bucketPrefix: 'test/', bucket: 'bucket-1', secretKey: 'secret-1', accessKey: 'key-1' };
      var overridesObj = { secretAccessKey: 'secret-2'};
      var s3 = new S3Adapter(confObj, overridesObj);
      expect(s3._s3Client.config.accessKeyId).toEqual('key-1');
      expect(s3._s3Client.config.secretAccessKey).toEqual('secret-2');
      expect(s3._s3Client.config.params.Bucket).toEqual('bucket-1');
      expect(s3._bucketPrefix).toEqual('test/');
    });
  });

  describe('getFileLocation', () => {
    var config = {
      mount: 'http://my.server.com/parse',
      applicationId: 'xxxx'
    };
    var options;

    beforeEach(() => {
      options = {
        directAccess: true,
        bucketPrefix:'foo/bar/',
        baseUrl: 'http://example.com/files'
      };
    });

    it('should get using the baseUrl', () => {
      var s3 = new S3Adapter('accessKey', 'secretKey', 'myBucket', options);
      expect(s3.getFileLocation(config, 'test.png')).toEqual('http://example.com/files/foo/bar/test.png');
    });

    it('should get direct to baseUrl', ()=> {
      options.baseUrlDirect = true;
      var s3 = new S3Adapter('accessKey', 'secretKey', 'myBucket', options);
      expect(s3.getFileLocation(config, 'test.png')).toEqual('http://example.com/files/test.png');
    });

    it('should get without directAccess', () => {
      options.directAccess = false;
      var s3 = new S3Adapter('accessKey', 'secretKey', 'myBucket', options);
      expect(s3.getFileLocation(config, 'test.png')).toEqual('http://my.server.com/parse/files/xxxx/test.png');
    });

    it('should go directly to amazon', () => {
      delete options.baseUrl;
      var s3 = new S3Adapter('accessKey', 'secretKey', 'myBucket', options);
      expect(s3.getFileLocation(config, 'test.png')).toEqual('https://myBucket.s3.amazonaws.com/foo/bar/test.png');
    });
  });


  if (process.env.TEST_S3_ACCESS_KEY && process.env.TEST_S3_SECRET_KEY && process.env.TEST_S3_BUCKET) {
    // Should be initialized from the env
    let s3 = new S3Adapter({
      accessKey: process.env.TEST_S3_ACCESS_KEY,
      secretKey: process.env.TEST_S3_SECRET_KEY,
      bucket: process.env.TEST_S3_BUCKET
    });
    filesAdapterTests.testAdapter("S3Adapter", s3);
  }
})
