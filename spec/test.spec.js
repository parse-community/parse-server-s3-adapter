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

    var s3 = new S3Adapter('accessKey', 'secretKey', 'myBucket', {directAccess: true});
    expect(s3._directAccess).toBe(true);
    expect(s3._region).toBe('us-east-1');
    expect(s3.getFileLocation({}, 'file.txt')).toEqual('https://myBucket.s3.amazonaws.com/file.txt')

    s3 = new S3Adapter('accessKey', 'secretKey', 'myBucket', {directAccess: true, baseUrl: 'http://images.example.com'});
    expect(s3._directAccess).toBe(true);
    expect(s3._region).toBe('us-east-1');
    expect(s3.getFileLocation({}, 'file.txt')).toEqual('http://images.example.com/file.txt')

    s3 = new S3Adapter({'accessKey':'accessKey', 'secretKey': 'secretKey', 'bucket': 'myBucket', directAccess: false, 'region': 'us-east-2'});
    expect(s3._directAccess).toBe(false);
    expect(s3._region).toBe('us-east-2');
    expect(s3.getFileLocation({mount: 'http://my.server.com/parse', applicationId: 'xxxx'}, 'file.txt')).toEqual('http://my.server.com/parse/files/xxxx/file.txt')
  })

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
