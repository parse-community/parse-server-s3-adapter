const AWS = require('aws-sdk');
const config = require('config');
const filesAdapterTests = require('parse-server-conformance-tests').files;
const Parse = require('parse').Parse;
const S3Adapter = require('../index.js');
const optionsFromArguments = require('../lib/optionsFromArguments');

describe('S3Adapter tests', () => {
  beforeEach(() => {
    delete process.env.S3_BUCKET;
    delete process.env.S3_REGION;
    spyOn(console, 'warn').and.returnValue();
  });

  it('should throw when not initialized properly', () => {
    expect(() => {
      new S3Adapter();
    }).toThrow(new Error("S3Adapter requires option 'bucket' or env. variable S3_BUCKET"));

    expect(() => {
      new S3Adapter('accessKey', 'secretKey', {});
    }).toThrow(new Error('Failed to configure S3Adapter. Arguments don\'t make sense'));

    expect(() => {
      new S3Adapter({ accessKey: 'accessKey', secretKey: 'secretKey' });
    }).toThrow(new Error("S3Adapter requires option 'bucket' or env. variable S3_BUCKET"));
  });

  it('should not throw when initialized properly', () => {
    expect(() => {
      new S3Adapter('bucket');
    }).not.toThrow();

    expect(() => {
      new S3Adapter({ bucket: 'bucket' });
    }).not.toThrow();

    expect(() => {
      new S3Adapter({}, { params: { Bucket: 'bucket' } });
    }).not.toThrow();
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
        }).toThrow(new Error("S3Adapter requires option 'bucket' or env. variable S3_BUCKET"));
      });
    });


    describe('should not throw when initialized properly', () => {
      it('should accept a string bucket', () => {
        expect(() => {
          new S3Adapter(config.get('bucket'));
        }).not.toThrow();
      });

      it('should accept an object with a bucket', () => {
        expect(() => {
          new S3Adapter(config.get('objectWithBucket'));
        }).not.toThrow();
      });

      it('should accept a second argument of object with a params object with a bucket', () => {
        expect(() => {
          new S3Adapter(config.get('emptyObject'), config.get('paramsObjectWBucket'));
        }).not.toThrow();
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
      const args = ['bucket'];
      const options = optionsFromArguments(args);
      expect(options.bucket).toEqual('bucket');
    });

    it('should accept bucket and options', () => {
      const confObj = { bucketPrefix: 'test/' };
      const args = ['bucket', confObj];
      const options = optionsFromArguments(args);
      expect(options.bucket).toEqual('bucket');
      expect(options.bucketPrefix).toEqual('test/');
    });

    it('should accept key, secret, and bucket as args', () => {
      const args = ['key', 'secret', 'bucket'];
      const options = optionsFromArguments(args);
      expect(options.accessKey).toEqual('key');
      expect(options.secretKey).toEqual('secret');
      expect(options.bucket).toEqual('bucket');
    });

    it('should accept key, secret, bucket, and options object as args', () => {
      const confObj = { bucketPrefix: 'test/' };
      const args = ['key', 'secret', 'bucket', confObj];
      const options = optionsFromArguments(args);
      expect(options.accessKey).toEqual('key');
      expect(options.secretKey).toEqual('secret');
      expect(options.bucket).toEqual('bucket');
      expect(options.bucketPrefix).toEqual('test/');
    });

    it('should accept options and overrides as an option in args', () => {
      const confObj = {
        bucketPrefix: 'test/', bucket: 'bucket-1', secretKey: 'secret-1', accessKey: 'key-1', s3overrides: { secretAccessKey: 'secret-2', accessKeyId: 'key-2', params: { Bucket: 'bucket-2' } },
      };
      const s3 = new S3Adapter(confObj);
      expect(s3._s3Client.config.accessKeyId).toEqual('key-2');
      expect(s3._s3Client.config.secretAccessKey).toEqual('secret-2');
      expect(s3._s3Client.config.params.Bucket).toEqual('bucket-2');
      expect(s3._bucketPrefix).toEqual('test/');
    });

    it('should accept endpoint as an override option in args', () => {
      const otherEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
      const confObj = {
        bucketPrefix: 'test/',
        bucket: 'bucket-1',
        secretKey: 'secret-1',
        accessKey: 'key-1',
        s3overrides: { endpoint: otherEndpoint },
      };
      const s3 = new S3Adapter(confObj);
      expect(s3._s3Client.endpoint.protocol).toEqual(otherEndpoint.protocol);
      expect(s3._s3Client.endpoint.host).toEqual(otherEndpoint.host);
      expect(s3._s3Client.endpoint.port).toEqual(otherEndpoint.port);
      expect(s3._s3Client.endpoint.hostname).toEqual(otherEndpoint.hostname);
      expect(s3._s3Client.endpoint.pathname).toEqual(otherEndpoint.pathname);
      expect(s3._s3Client.endpoint.path).toEqual(otherEndpoint.path);
      expect(s3._s3Client.endpoint.href).toEqual(otherEndpoint.href);
    });

    it('should accept options and overrides as args', () => {
      const confObj = {
        bucketPrefix: 'test/', bucket: 'bucket-1', secretKey: 'secret-1', accessKey: 'key-1',
      };
      const overridesObj = { secretAccessKey: 'secret-2', accessKeyId: 'key-2', params: { Bucket: 'bucket-2' } };
      const s3 = new S3Adapter(confObj, overridesObj);
      expect(s3._s3Client.config.accessKeyId).toEqual('key-2');
      expect(s3._s3Client.config.secretAccessKey).toEqual('secret-2');
      expect(s3._s3Client.config.params.Bucket).toEqual('bucket-2');
      expect(s3._bucketPrefix).toEqual('test/');
    });

    it('should accept overrides without params', () => {
      const confObj = {
        bucketPrefix: 'test/', bucket: 'bucket-1', secretKey: 'secret-1', accessKey: 'key-1',
      };
      const overridesObj = { secretAccessKey: 'secret-2' };
      const s3 = new S3Adapter(confObj, overridesObj);
      expect(s3._s3Client.config.accessKeyId).toEqual('key-1');
      expect(s3._s3Client.config.secretAccessKey).toEqual('secret-2');
      expect(s3._s3Client.config.params.Bucket).toEqual('bucket-1');
      expect(s3._bucketPrefix).toEqual('test/');
    });
  });

  describe('getFileStream', () => {
    it('should handle range bytes', () => {
      const s3 = new S3Adapter('accessKey', 'secretKey', 'myBucket');
      s3._s3Client = {
        createBucket: (callback) => callback(),
        getObject: (params, callback) => {
          const { Range } = params;

          expect(Range).toBe('bytes=0-1');

          const data = {
            Body: Buffer.from('hello world', 'utf8'),
          };
          callback(null, data);
        },
      };
      const req = {
        get: () => 'bytes=0-1',
      };
      const resp = {
        writeHead: jasmine.createSpy('writeHead'),
        write: jasmine.createSpy('write'),
        end: jasmine.createSpy('end'),
      };
      s3.handleFileStream('test.mov', req, resp).then((data) => {
        expect(data.toString('utf8')).toBe('hello world');
        expect(resp.writeHead).toHaveBeenCalled();
        expect(resp.write).toHaveBeenCalled();
        expect(resp.end).toHaveBeenCalled();
      });
    });

    it('should handle range bytes error', () => {
      const s3 = new S3Adapter('accessKey', 'secretKey', 'myBucket');
      s3._s3Client = {
        createBucket: (callback) => callback(),
        getObject: (params, callback) => {
          callback('FileNotFound', null);
        },
      };
      const req = {
        get: () => 'bytes=0-1',
      };
      const resp = {
        writeHead: jasmine.createSpy('writeHead'),
        write: jasmine.createSpy('write'),
        end: jasmine.createSpy('end'),
      };
      s3.handleFileStream('test.mov', req, resp).catch((error) => {
        expect(error).toBe('FileNotFound');
        expect(resp.writeHead).not.toHaveBeenCalled();
        expect(resp.write).not.toHaveBeenCalled();
        expect(resp.end).not.toHaveBeenCalled();
      });
    });

    it('should handle range bytes no data', () => {
      const s3 = new S3Adapter('accessKey', 'secretKey', 'myBucket');
      const data = { Error: 'NoBody' };
      s3._s3Client = {
        createBucket: (callback) => callback(),
        getObject: (params, callback) => {
          callback(null, data);
        },
      };
      const req = {
        get: () => 'bytes=0-1',
      };
      const resp = {
        writeHead: jasmine.createSpy('writeHead'),
        write: jasmine.createSpy('write'),
        end: jasmine.createSpy('end'),
      };
      s3.handleFileStream('test.mov', req, resp).catch((error) => {
        expect(error).toBe(data);
        expect(resp.writeHead).not.toHaveBeenCalled();
        expect(resp.write).not.toHaveBeenCalled();
        expect(resp.end).not.toHaveBeenCalled();
      });
    });
  });

  describe('getFileLocation', () => {
    const testConfig = {
      mount: 'http://my.server.com/parse',
      applicationId: 'xxxx',
    };
    let options;

    beforeEach(() => {
      options = {
        directAccess: true,
        bucketPrefix: 'foo/bar/',
        baseUrl: 'http://example.com/files',
      };
    });

    it('should get using the baseUrl', () => {
      const s3 = new S3Adapter('accessKey', 'secretKey', 'myBucket', options);
      expect(s3.getFileLocation(testConfig, 'test.png')).toEqual('http://example.com/files/foo/bar/test.png');
    });

    it('should get direct to baseUrl', () => {
      options.baseUrlDirect = true;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'myBucket', options);
      expect(s3.getFileLocation(testConfig, 'test.png')).toEqual('http://example.com/files/test.png');
    });

    it('should get without directAccess', () => {
      options.directAccess = false;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'myBucket', options);
      expect(s3.getFileLocation(testConfig, 'test.png')).toEqual('http://my.server.com/parse/files/xxxx/test.png');
    });

    it('should go directly to amazon', () => {
      delete options.baseUrl;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'myBucket', options);
      expect(s3.getFileLocation(testConfig, 'test.png')).toEqual('https://myBucket.s3.amazonaws.com/foo/bar/test.png');
    });
  });

  describe('validateFilename', () => {
    let options;

    beforeEach(() => {
      options = {
        validateFilename: null,
      };
    });

    it('should be null by default', () => {
      const s3 = new S3Adapter('accessKey', 'secretKey', 'myBucket', options);
      expect(s3.validateFilename === null).toBe(true);
    });

    it('should not allow directories when overridden', () => {
      options.validateFilename = (filename) => {
        if (filename.indexOf('/') !== -1) {
          return new Parse.Error(
            Parse.Error.INVALID_FILE_NAME,
            'Filename contains invalid characters.',
          );
        }
        return null;
      };
      const s3 = new S3Adapter('accessKey', 'secretKey', 'myBucket', options);
      expect(s3.validateFilename('foo/bar') instanceof Parse.Error).toBe(true);
    });
  });

  function makeS3Adapter(options) {
    let s3;

    if (
      process.env.TEST_S3_ACCESS_KEY
      && process.env.TEST_S3_SECRET_KEY
      && process.env.TEST_S3_BUCKET) {
      // Should be initialized from the env
      s3 = new S3Adapter(Object.assign({
        accessKey: process.env.TEST_S3_ACCESS_KEY,
        secretKey: process.env.TEST_S3_SECRET_KEY,
        bucket: process.env.TEST_S3_BUCKET,
      }, options));
    } else {
      const bucket = 'FAKE_BUCKET';

      s3 = new S3Adapter('FAKE_ACCESS_KEY', 'FAKE_SECRET_KEY', bucket, options);

      const objects = {};

      s3._s3Client = {
        createBucket: (callback) => setTimeout(callback, 100),
        upload: (params, callback) => setTimeout(() => {
          const { Key, Body } = params;

          objects[Key] = Body;

          callback(null, {
            Location: `https://${bucket}.s3.amazonaws.com/${Key}`,
          });
        }, 100),
        deleteObject: (params, callback) => setTimeout(() => {
          const { Key } = params;

          delete objects[Key];

          callback(null, {});
        }, 100),
        getObject: (params, callback) => setTimeout(() => {
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

  describe('generateKey', () => {
    let options;
    const promises = [];

    beforeEach(() => {
      options = {
        bucketPrefix: 'test/',
        generateKey: (filename) => {
          let key = '';
          const lastSlash = filename.lastIndexOf('/');
          const prefix = `${Date.now()}_`;
          if (lastSlash > 0) {
            // put the prefix before the last component of the filename
            key += filename.substring(0, lastSlash + 1) + prefix
                + filename.substring(lastSlash + 1);
          } else {
            key += prefix + filename;
          }
          return key;
        },
      };
    });

    it('should return a file with a date stamp inserted in the path', () => {
      const s3 = makeS3Adapter(options);
      const fileName = 'randomFileName.txt';
      const response = s3.createFile(fileName, 'hello world', 'text/utf8').then((value) => {
        const url = new URL(value.Location);
        expect(url.pathname.indexOf(fileName) > 13).toBe(true);
      });
      promises.push(response);
    });

    it('should do nothing when null', () => {
      options.generateKey = null;
      const s3 = makeS3Adapter(options);
      const fileName = 'foo/randomFileName.txt';
      const response = s3.createFile(fileName, 'hello world', 'text/utf8').then((value) => {
        const url = new URL(value.Location);
        expect(url.pathname.substring(1)).toEqual(options.bucketPrefix + fileName);
      });
      promises.push(response);
    });

    it('should add unique timestamp to the file name after the last directory when there is a path', () => {
      const s3 = makeS3Adapter(options);
      const fileName = 'foo/randomFileName.txt';
      const response = s3.createFile(fileName, 'hello world', 'text/utf8').then((value) => {
        const url = new URL(value.Location);
        expect(url.pathname.indexOf('foo/')).toEqual(6);
        expect(url.pathname.indexOf('random') > 13).toBe(true);
      });
      promises.push(response);
    });

    afterAll(() => Promise.all(promises));
  });

  filesAdapterTests.testAdapter('S3Adapter', makeS3Adapter({}));
});
