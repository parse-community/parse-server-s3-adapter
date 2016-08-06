'use strict';
let filesAdapterTests = require('parse-server-conformance-tests').files;

let S3Adapter = require('../index.js');
let optionsFromArguments = require('../lib/optionsFromArguments');

describe('S3Adapter tests', () => {

  it('should throw when not initialized properly', () => {
    expect(() => {
      var s3 = new S3Adapter();
    }).toThrow("S3Adapter requires option 'bucket' or env. variable S3_BUCKET")

    expect(() =>  {
      var s3 = new S3Adapter('accessKey', 'secretKey', {});
    }).toThrow(new Error('Failed to configure S3Adapter. Arguments don\'t make sense'));

    expect(() => {
      var s3 = new S3Adapter({ accessKey: 'accessKey' , secretKey: 'secretKey'});
    }).toThrow("S3Adapter requires option 'bucket' or env. variable S3_BUCKET")
  })

  it('should not throw when initialized properly', () => {
    expect(() => {
      var s3 = new S3Adapter('bucket');
    }).not.toThrow()

    expect(() => {
      var s3 = new S3Adapter({ bucket: 'bucket'});
    }).not.toThrow()
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
