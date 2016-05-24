'use strict';
let filesAdapterTests = require('parse-server-conformance-tests').files;

let S3Adapter = require('../index.js');

describe('S3Adapter tests', () => {

  it('should throw when not initialized properly', () => {
    expect(() => {
      var s3 = new S3Adapter();
    }).toThrow("S3Adapter requires option 'accessKey' or env. variable S3_ACCESS_KEY")

    expect(() => {
      var s3 = new S3Adapter('accessKey');
    }).toThrow("S3Adapter requires option 'secretKey' or env. variable S3_SECRET_KEY")

    expect(() => {
      var s3 = new S3Adapter('accessKey', 'secretKey');
    }).toThrow("S3Adapter requires option 'bucket' or env. variable S3_BUCKET")

    expect(() => {
      var s3 = new S3Adapter({ accessKey: 'accessKey'});
    }).toThrow("S3Adapter requires option 'secretKey' or env. variable S3_SECRET_KEY")
    expect(() => {
      var s3 = new S3Adapter({ accessKey: 'accessKey' , secretKey: 'secretKey'});
    }).toThrow("S3Adapter requires option 'bucket' or env. variable S3_BUCKET")
  })

  it('should not throw when initialized properly', () => {
    expect(() => {
      var s3 = new S3Adapter('accessKey', 'secretKey', 'bucket');
    }).not.toThrow()

    expect(() => {
      var s3 = new S3Adapter({ accessKey: 'accessKey' , secretKey: 'secretKey', bucket: 'bucket'});
    }).not.toThrow()
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
