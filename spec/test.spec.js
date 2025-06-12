const { Readable } = require('stream');
const config = require('config');
const S3Adapter = require('../index');
const optionsFromArguments = require('../lib/optionsFromArguments');
const { GetObjectCommand, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } = require('@aws-sdk/client-s3');
const { getMockS3Adapter } = require('./mocks/s3adapter');
const rewire = require('rewire');


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
    }).toThrow(new Error("Failed to configure S3Adapter. Arguments don't make sense"));

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

  describe('bucket operations', () => {
    let s3, s3ClientMock;
    beforeEach(() => {
      const options = {
        bucket: 'bucket-1',
        bucketPrefix: 'test/',
      };
      s3ClientMock = jasmine.createSpyObj('S3Client', ['send']);
      s3ClientMock.send.and.returnValue(Promise.resolve());

      s3 = new S3Adapter(options);
      s3._s3Client = s3ClientMock;
    });

    it('should return early if _hasBucket is true', async () => {
      s3._hasBucket = true;

      await s3.createBucket();

      expect(s3ClientMock.send).not.toHaveBeenCalled();
    });

    it('should set _hasBucket to true if bucket exists', async () => {
      s3ClientMock.send.and.returnValue(Promise.resolve({}));

      await s3.createBucket();

      expect(s3ClientMock.send).toHaveBeenCalledWith(jasmine.any(HeadBucketCommand));
      expect(s3._hasBucket).toBe(true);
    });

    it('should attempt to create bucket if NotFound error occurs', async () => {
      const notFoundError = { name: 'NotFound' };
      s3ClientMock.send.and.returnValues(
        Promise.reject(notFoundError),
        Promise.resolve({})
      );

      await s3.createBucket();

      expect(s3ClientMock.send).toHaveBeenCalledTimes(2);
      expect(s3ClientMock.send).toHaveBeenCalledWith(jasmine.any(HeadBucketCommand));
      expect(s3ClientMock.send).toHaveBeenCalledWith(jasmine.any(CreateBucketCommand));
      expect(s3._hasBucket).toBe(true);
    });

    it('should handle BucketAlreadyExists error during creation', async () => {
      const notFoundError = { name: 'NotFound' };
      const bucketExistsError = { name: 'BucketAlreadyExists' };
      s3ClientMock.send.and.returnValues(
        Promise.reject(notFoundError),
        Promise.reject(bucketExistsError)
      );

      await s3.createBucket();

      expect(s3ClientMock.send).toHaveBeenCalledTimes(2);
      expect(s3ClientMock.send).toHaveBeenCalledWith(jasmine.any(HeadBucketCommand));
      expect(s3ClientMock.send).toHaveBeenCalledWith(jasmine.any(CreateBucketCommand));
      expect(s3._hasBucket).toBe(true);
    });

    it('should handle BucketAlreadyOwnedByYou error during creation', async () => {
      const notFoundError = { name: 'NotFound' };
      const bucketOwnedError = { name: 'BucketAlreadyOwnedByYou' };
      s3ClientMock.send.and.returnValues(
        Promise.reject(notFoundError),
        Promise.reject(bucketOwnedError)
      );

      await s3.createBucket();

      expect(s3ClientMock.send).toHaveBeenCalledTimes(2);
      expect(s3ClientMock.send).toHaveBeenCalledWith(jasmine.any(HeadBucketCommand));
      expect(s3ClientMock.send).toHaveBeenCalledWith(jasmine.any(CreateBucketCommand));
      expect(s3._hasBucket).toBe(true);
    });

    it('should throw non-NotFound errors during check', async () => {
      const otherError = { name: 'SomeOtherError' };
      s3ClientMock.send.and.returnValue(Promise.reject(otherError));

      await expectAsync(s3.createBucket())
        .toBeRejectedWith(otherError);
      expect(s3._hasBucket).toBe(false);
    });

    it('should throw unexpected errors during creation', async () => {
      const notFoundError = { name: 'NotFound' };
      const creationError = { name: 'CreationError' };
      s3ClientMock.send.and.returnValues(
        Promise.reject(notFoundError),
        Promise.reject(creationError)
      );

      await expectAsync(s3.createBucket())
        .toBeRejectedWith(creationError);
      expect(s3._hasBucket).toBe(false);
    });
  })

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

    it('should use credentials when provided', async () => {
      const mockCredentials = {
        accessKeyId: 'mockAccessKeyId',
        secretAccessKey: 'mockSecretAccessKey',
        sessionToken: 'mockSessionToken',
      };

      const options = {
        bucket: 'bucket-1',
        credentials: mockCredentials
      };

      const adapter = new S3Adapter(options);
      const credentials = await adapter._s3Client.config.credentials();

      expect(credentials.accessKeyId).toEqual(mockCredentials.accessKeyId);
      expect(credentials.secretAccessKey).toEqual(mockCredentials.secretAccessKey);
      expect(credentials.sessionToken).toEqual(mockCredentials.sessionToken);
    });

    it('should accept options and overrides as an option in args', () => {
      const confObj = {
        bucketPrefix: 'test/',
        bucket: 'bucket-1',
        secretKey: 'secret-1',
        accessKey: 'key-1',
        s3overrides: {
          secretAccessKey: 'secret-2',
          accessKeyId: 'key-2',
          params: { Bucket: 'bucket-2' },
        },
      };
      const s3 = new S3Adapter(confObj);
      expect(s3._s3Client.config.accessKeyId).toEqual('key-2');
      expect(s3._s3Client.config.secretAccessKey).toEqual('secret-2');
      expect(s3._s3Client.config.params.Bucket).toEqual('bucket-2');
      expect(s3._bucketPrefix).toEqual('test/');
    });

    it('should accept endpoint as an override option in args', async () => {
      const otherEndpoint = 'https://example.com:8080/path?foo=bar';
      const confObj = {
        bucketPrefix: 'test/',
        bucket: 'bucket-1',
        secretKey: 'secret-1',
        accessKey: 'key-1',
        s3overrides: { endpoint: otherEndpoint },
      };
      const s3 = new S3Adapter(confObj);
      expect(s3._endpoint).toEqual(otherEndpoint);
      const endpointFromConfig = await s3._s3Client.config.endpoint();
      expect(endpointFromConfig.protocol).toEqual('https:');
      expect(endpointFromConfig.path).toEqual('/path');
      expect(endpointFromConfig.port).toEqual(8080);
      expect(endpointFromConfig.hostname).toEqual('example.com');
      expect(endpointFromConfig.query.foo).toEqual('bar');
    });

    it("should have undefined endpoint if no custom endpoint is provided", async () => {
      const confObj = {
        bucketPrefix: 'test/',
        bucket: 'bucket-1',
        secretKey: 'secret-1',
        accessKey: 'key-1',
      };
      const s3 = new S3Adapter(confObj);
      const endpoint = await s3._s3Client.config.endpoint?.();
      expect(endpoint).toBeUndefined();
    });

    it('should accept options and overrides as args', () => {
      const confObj = {
        bucketPrefix: 'test/',
        bucket: 'bucket-1',
        secretKey: 'secret-1',
        accessKey: 'key-1',
      };
      const overridesObj = {
        secretAccessKey: 'secret-2',
        accessKeyId: 'key-2',
        params: { Bucket: 'bucket-2' },
      };
      const s3 = new S3Adapter(confObj, overridesObj);
      expect(s3._s3Client.config.accessKeyId).toEqual('key-2');
      expect(s3._s3Client.config.secretAccessKey).toEqual('secret-2');
      expect(s3._s3Client.config.params.Bucket).toEqual('bucket-2');
      expect(s3._bucketPrefix).toEqual('test/');
    });

    it('should accept overrides without params', () => {
      const confObj = {
        bucketPrefix: 'test/',
        bucket: 'bucket-1',
        secretKey: 'secret-1',
        accessKey: 'key-1',
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
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket');
      const s3ClientMock = jasmine.createSpyObj('S3Client', ['send']);
      const stream = new Readable();
      stream.push('hello world');
      stream.push(null);
      s3ClientMock.send.and.returnValue(Promise.resolve({ Body: stream }));
      s3._s3Client = s3ClientMock;

      const req = {
        get: () => 'bytes=0-1',
      };
      const resp = {
        writeHead: jasmine.createSpy('writeHead'),
        write: jasmine.createSpy('write'),
        end: jasmine.createSpy('end'),
      };
      s3.handleFileStream('test.mov', req, resp).then(data => {
        expect(data.toString('utf8')).toBe('hello world');
        expect(resp.writeHead).toHaveBeenCalled();
        expect(resp.write).toHaveBeenCalled();
        expect(resp.end).toHaveBeenCalled();
        expect(s3ClientMock.send).toHaveBeenCalledTimes(2);

        const commands = s3ClientMock.send.calls.all();
        expect(commands[0].args[0]).toBeInstanceOf(HeadBucketCommand);
        const commandArg = commands[1].args[0];
        expect(commandArg).toBeInstanceOf(GetObjectCommand);
        expect(commandArg.input.Range).toBe('bytes=0-1');
      });
    });

    it('should handle range bytes error', () => {
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket');
      const s3ClientMock = jasmine.createSpyObj('S3Client', ['send']);
      s3ClientMock.send.and.returnValue(Promise.reject('FileNotFound'));
      s3._s3Client = s3ClientMock;

      const req = {
        get: () => 'bytes=0-1',
      };
      const resp = {
        writeHead: jasmine.createSpy('writeHead'),
        write: jasmine.createSpy('write'),
        end: jasmine.createSpy('end'),
      };
      s3.handleFileStream('test.mov', req, resp).catch(error => {
        expect(error).toBe('FileNotFound');
        expect(resp.writeHead).not.toHaveBeenCalled();
        expect(resp.write).not.toHaveBeenCalled();
        expect(resp.end).not.toHaveBeenCalled();
      });
    });

    it('should handle range bytes no data', () => {
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket');
      const s3ClientMock = jasmine.createSpyObj('S3Client', ['send']);
      s3ClientMock.send.and.returnValue(Promise.resolve({}));
      s3._s3Client = s3ClientMock;

      const req = {
        get: () => 'bytes=0-1',
      };
      const resp = {
        writeHead: jasmine.createSpy('writeHead'),
        write: jasmine.createSpy('write'),
        end: jasmine.createSpy('end'),
      };
      s3.handleFileStream('test.mov', req, resp).catch(error => {
        expect(error.message).toBe('S3 object body is missing.');
        expect(resp.writeHead).not.toHaveBeenCalled();
        expect(resp.write).not.toHaveBeenCalled();
        expect(resp.end).not.toHaveBeenCalled();
      });
    });

    it('should handle stream errors', async () => {
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket');
      const s3ClientMock = jasmine.createSpyObj('S3Client', ['send']);

      const mockStream = {
        on: (event, callback) => {
          if (event === 'error') {
            callback(new Error('Mock S3 Body error'));
          }
        },
      };

      s3ClientMock.send.and.returnValue(Promise.resolve({
        Body: mockStream,
        AcceptRanges: 'bytes',
        ContentLength: 1024,
        ContentRange: 'bytes 0-1024/2048',
        ContentType: 'application/octet-stream',
      }));
      s3._s3Client = s3ClientMock;

      const mockReq = {
        get: () => 'bytes=0-1024',
      };
      const mockRes = {
        status: jasmine.createSpy('status'),
        send: jasmine.createSpy('send'),
        writeHead: jasmine.createSpy('writeHead'),
        write: jasmine.createSpy('write'),
        end: jasmine.createSpy('end'),
      };

      s3.handleFileStream('test.mov', mockReq, mockRes).catch(() => {
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith('Mock S3 Body error');
      });
    });
  });

  describe('getFileLocation with directAccess', () => {
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

    it('should get using the baseUrl', async () => {
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      await expectAsync(s3.getFileLocation(testConfig, 'test.png')).toBeResolvedTo(
        'http://example.com/files/foo/bar/test.png'
      );
    });

    it('should get direct to baseUrl', async () => {
      options.baseUrlDirect = true;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      await expectAsync(s3.getFileLocation(testConfig, 'test.png')).toBeResolvedTo(
        'http://example.com/files/test.png'
      );
    });

    it('should get without directAccess', async () => {
      options.directAccess = false;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      await expectAsync(s3.getFileLocation(testConfig, 'test.png')).toBeResolvedTo(
        'http://my.server.com/parse/files/xxxx/test.png'
      );
    });

    it('should go directly to amazon', async () => {
      delete options.baseUrl;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      await expectAsync(s3.getFileLocation(testConfig, 'test.png')).toBeResolvedTo(
        'https://my-bucket.s3.amazonaws.com/foo/bar/test.png'
      );
    });
  });
  describe('getFileLocation with baseUrl', () => {
    const testConfig = {
      mount: 'http://my.server.com/parse',
      applicationId: 'xxxx',
    };
    let options;

    beforeEach(() => {
      options = {
        directAccess: true,
        bucketPrefix: 'foo/bar/',
        baseUrl: (fileconfig, filename) => {
          if (filename.length > 12) {
            return 'http://example.com/files';
          }
          return 'http://example.com/files';
        },
      };
    });

    it('should get using the baseUrl', async () => {
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      await expectAsync(s3.getFileLocation(testConfig, 'test.png')).toBeResolvedTo(
        'http://example.com/files/foo/bar/test.png'
      );
    });

    it('should get direct to baseUrl', async () => {
      options.baseUrlDirect = true;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      await expectAsync(s3.getFileLocation(testConfig, 'test.png')).toBeResolvedTo(
        'http://example.com/files/test.png'
      );
    });

    it('should get without directAccess', async () => {
      options.directAccess = false;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      await expectAsync(s3.getFileLocation(testConfig, 'test.png')).toBeResolvedTo(
        'http://my.server.com/parse/files/xxxx/test.png'
      );
    });

    it('should go directly to amazon', async () => {
      delete options.baseUrl;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      await expectAsync(s3.getFileLocation(testConfig, 'test.png')).toBeResolvedTo(
        'https://my-bucket.s3.amazonaws.com/foo/bar/test.png'
      );
    });
  });
  describe('getFileLocation with presignedUrl', () => {
    const testConfig = {
      mount: 'http://my.server.com/parse',
      applicationId: 'xxxx',
    };
    let options;

    beforeEach(() => {
      options = {
        presignedUrl: false,
        directAccess: true,
        bucketPrefix: 'foo/bar/',
        baseUrl: 'http://example.com/files',
      };
    });

    it('should get using the baseUrl', async () => {
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      await expectAsync(s3.getFileLocation(testConfig, 'test.png')).toBeResolvedTo(
        'http://example.com/files/foo/bar/test.png'
      );
    });

    it('when use presigned URL should use S3 \'getObject\' operation', async () => {
      options.presignedUrl = true;
      const s3 = getMockS3Adapter(options);

      let getSignedUrlCommand = '';
      s3.getFileSignedUrl = (_, command) => {
        getSignedUrlCommand = command;
      };

      await s3.getFileLocation(testConfig, 'test.png');
      expect(getSignedUrlCommand).toBeInstanceOf(GetObjectCommand);
    });

    it('should get using the baseUrl and amazon using presigned URL', async () => {
      options.presignedUrl = true;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);

      const fileLocation = await s3.getFileLocation(testConfig, 'test.png');
      expect(fileLocation).toMatch(/^http:\/\/example.com\/files\/foo\/bar\/test.png\?/);
      expect(fileLocation).toMatch(
        /X-Amz-Credential=accessKey%2F\d{8}%2F\w{2}-\w{1,9}-\d%2Fs3%2Faws4_request/
      );
      expect(fileLocation).toMatch(/X-Amz-Date=\d{8}T\d{6}Z/);
      expect(fileLocation).toMatch(/X-Amz-Signature=.{64}/);
      expect(fileLocation).toMatch(/X-Amz-Expires=\d{1,6}/);
      expect(fileLocation).toContain('X-Amz-Algorithm=AWS4-HMAC-SHA256');
      expect(fileLocation).toContain('X-Amz-SignedHeaders=host');
    });

    it('should get direct to baseUrl', async () => {
      options.baseUrlDirect = true;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      await expectAsync(s3.getFileLocation(testConfig, 'test.png')).toBeResolvedTo(
        'http://example.com/files/test.png'
      );
    });

    it('should get without directAccess', async () => {
      options.directAccess = false;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      await expectAsync(s3.getFileLocation(testConfig, 'test.png')).toBeResolvedTo(
        'http://my.server.com/parse/files/xxxx/test.png'
      );
    });

    it('should go directly to amazon', async () => {
      delete options.baseUrl;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      await expectAsync(s3.getFileLocation(testConfig, 'test.png')).toBeResolvedTo(
        'https://my-bucket.s3.amazonaws.com/foo/bar/test.png'
      );
    });

    it('should go directly to amazon using presigned URL', async () => {
      delete options.baseUrl;
      options.presignedUrl = true;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);

      const fileLocation = await s3.getFileLocation(testConfig, 'test.png');
      expect(fileLocation).toMatch(
        /^https:\/\/my-bucket.s3.us-east-1.amazonaws.com\/foo\/bar\/test.png\?/
      );
      expect(fileLocation).toMatch(
        /X-Amz-Credential=accessKey%2F\d{8}%2Fus-east-1%2Fs3%2Faws4_request/
      );
      expect(fileLocation).toMatch(/X-Amz-Date=\d{8}T\d{6}Z/);
      expect(fileLocation).toMatch(/X-Amz-Signature=.{64}/);
      expect(fileLocation).toMatch(/X-Amz-Expires=\d{1,6}/);
      expect(fileLocation).toContain('X-Amz-Algorithm=AWS4-HMAC-SHA256');
      expect(fileLocation).toContain('X-Amz-SignedHeaders=host');
    });
  });

  describe('getFileLocation with async baseUrl', () => {
    const testConfig = {
      mount: 'http://example.com/parse',
      applicationId: 'xxxx',
    };
    let options;

    beforeEach(() => {
      options = {
        directAccess: true,
        bucketPrefix: 'foo/bar/',
        baseUrl: async () => {
          await Promise.resolve();
          return 'http://example.com/files';
        },
      };
    });

    it('should await async baseUrl', async () => {
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      await expectAsync(s3.getFileLocation(testConfig, 'test.png')).toBeResolvedTo(
        'http://example.com/files/foo/bar/test.png'
      );
    });

    it('should direct to async baseUrl when baseUrlDirect', async () => {
      options.baseUrlDirect = true;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      await expectAsync(s3.getFileLocation(testConfig, 'test.png')).toBeResolvedTo(
        'http://example.com/files/test.png'
      );
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
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      expect(s3.validateFilename === null).toBe(true);
    });

    it('should not allow directories when overridden', () => {
      options.validateFilename = filename => {
        if (filename.indexOf('/') !== -1) {
          return new Parse.Error(
            Parse.Error.INVALID_FILE_NAME,
            'Filename contains invalid characters.'
          );
        }
        return null;
      };
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      expect(s3.validateFilename('foo/bar') instanceof Parse.Error).toBe(true);
    });
  });

  describe('generateKey', () => {
    let options;
    const promises = [];

    beforeEach(() => {
      options = {
        bucketPrefix: 'test/',
        generateKey: filename => {
          let key = '';
          const lastSlash = filename.lastIndexOf('/');
          const prefix = `${Date.now()}_`;
          if (lastSlash > 0) {
            // put the prefix before the last component of the filename
            key +=
              filename.substring(0, lastSlash + 1) + prefix + filename.substring(lastSlash + 1);
          } else {
            key += prefix + filename;
          }
          return key;
        },
      };
    });

    it('should return a file with a date stamp inserted in the path', () => {
      const s3 = getMockS3Adapter(options);
      const fileName = 'randomFileName.txt';
      const response = s3.createFile(fileName, 'hello world', 'text/utf8').then(value => {
        const url = new URL(value.Location);
        expect(url.pathname.indexOf(fileName) > 13).toBe(true);
      });
      promises.push(response);
    });

    it('should do nothing when null', () => {
      options.generateKey = null;
      const s3 = getMockS3Adapter(options);
      const fileName = 'foo/randomFileName.txt';
      const response = s3.createFile(fileName, 'hello world', 'text/utf8').then(value => {
        const url = new URL(value.Location);
        expect(url.pathname.substring(1)).toEqual(options.bucketPrefix + fileName);
      });
      promises.push(response);
    });

    it('should add unique timestamp to the file name after the last directory when there is a path', () => {
      const s3 = getMockS3Adapter(options);
      const fileName = 'foo/randomFileName.txt';
      const response = s3.createFile(fileName, 'hello world', 'text/utf8').then(value => {
        const url = new URL(value.Location);
        expect(url.pathname.indexOf('foo/')).toEqual(6);
        expect(url.pathname.indexOf('random') > 13).toBe(true);
      });
      promises.push(response);
    });

    afterAll(() => Promise.all(promises));
  });

  describe('createFile', () => {
    let options, s3ClientMock;
    beforeEach(() => {
      options = {
        bucket: 'bucket-1',
        bucketPrefix: 'test/',
      };
      s3ClientMock = jasmine.createSpyObj('S3Client', ['send']);
      s3ClientMock.send.and.returnValue(Promise.resolve());
    });

    it('should save a file with right command', async () => {
      const s3 = new S3Adapter(options);
      s3._s3Client = s3ClientMock;

      await s3.createFile('file.txt', 'hello world', 'text/utf8', {});

      expect(s3ClientMock.send).toHaveBeenCalledTimes(2);
      expect(s3ClientMock.send).toHaveBeenCalledWith(jasmine.any(HeadBucketCommand));
      expect(s3ClientMock.send).toHaveBeenCalledWith(jasmine.any(PutObjectCommand));
    });

    it('should save a file with metadata added', async () => {
      const s3 = new S3Adapter(options);
      s3._s3Client = s3ClientMock;
      const metadata = { foo: 'bar' };

      await s3.createFile('file.txt', 'hello world', 'text/utf8', { metadata });
      expect(s3ClientMock.send).toHaveBeenCalledTimes(2);
      const commands = s3ClientMock.send.calls.all();
      expect(commands[0].args[0]).toBeInstanceOf(HeadBucketCommand);
      const commandArg = commands[1].args[0];
      expect(commandArg).toBeInstanceOf(PutObjectCommand);
      expect(commandArg.input.Metadata).toEqual({ foo: 'bar' });
    });

    it('should save a file with tags added', async () => {
      const s3 = new S3Adapter(options);
      s3._s3Client = s3ClientMock;
      const tags = { foo: 'bar', baz: 'bin' };

      await s3.createFile('file.txt', 'hello world', 'text/utf8', { tags });
      expect(s3ClientMock.send).toHaveBeenCalledTimes(2);
      const commands = s3ClientMock.send.calls.all();
      expect(commands[0].args[0]).toBeInstanceOf(HeadBucketCommand);
      const commandArg = commands[1].args[0];
      expect(commandArg).toBeInstanceOf(PutObjectCommand);
      expect(commandArg.input.Tagging).toBe('foo=bar&baz=bin');
    });

    it('should save a file with proper ACL with direct access', async () => {
      options.directAccess = true;
      const s3 = new S3Adapter(options);
      s3._s3Client = s3ClientMock;

      await s3.createFile('file.txt', 'hello world', 'text/utf8', {});
      expect(s3ClientMock.send).toHaveBeenCalledTimes(2);
      const commands = s3ClientMock.send.calls.all();
      expect(commands[0].args[0]).toBeInstanceOf(HeadBucketCommand);
      const commandArg = commands[1].args[0];
      expect(commandArg).toBeInstanceOf(PutObjectCommand);
      expect(commandArg.input.ACL).toBe('public-read');
    });

    it('should save a file with proper ACL without direct access', async () => {
      const s3 = new S3Adapter(options);
      s3._s3Client = s3ClientMock;

      await s3.createFile('file.txt', 'hello world', 'text/utf8', {});
      expect(s3ClientMock.send).toHaveBeenCalledTimes(2);
      const commands = s3ClientMock.send.calls.all();
      expect(commands[0].args[0]).toBeInstanceOf(HeadBucketCommand);
      const commandArg = commands[1].args[0];
      expect(commandArg).toBeInstanceOf(PutObjectCommand);
      expect(commandArg.input.ACL).toBeUndefined();
    });

    it('should save a file and override ACL with direct access', async () => {
      options.directAccess = true;
      options.fileAcl = 'private';
      const s3 = new S3Adapter(options);
      s3._s3Client = s3ClientMock;

      await s3.createFile('file.txt', 'hello world', 'text/utf8', {});
      expect(s3ClientMock.send).toHaveBeenCalledTimes(2);
      const commands = s3ClientMock.send.calls.all();
      expect(commands[0].args[0]).toBeInstanceOf(HeadBucketCommand);
      const commandArg = commands[1].args[0];
      expect(commandArg).toBeInstanceOf(PutObjectCommand);
      expect(commandArg.input.ACL).toBe('private');
    });

    it('should save a file and remove ACL with direct access', async () => {
      // Create adapter
      options.directAccess = true;
      options.fileAcl = 'none';
      const s3 = new S3Adapter(options);
      s3._s3Client = s3ClientMock;

      await s3.createFile('file.txt', 'hello world', 'text/utf8', {});
      expect(s3ClientMock.send).toHaveBeenCalledTimes(2);
      const commands = s3ClientMock.send.calls.all();
      expect(commands[0].args[0]).toBeInstanceOf(HeadBucketCommand);
      const commandArg = commands[1].args[0];
      expect(commandArg).toBeInstanceOf(PutObjectCommand);
      expect(commandArg.input.ACL).toBeUndefined();
    });
  });

  describe('handleFileStream', () => {
    const filename = 'file.txt';
    let s3;

    beforeAll(async () => {
      s3 = getMockS3Adapter({ bucketPrefix: 'test-prefix/' });
      const testFileContent = 'hello world! This is a test file for S3 streaming.';
      await s3.createFile(filename, testFileContent, 'text/plain', {});
    });

    afterAll(async () => {
      await s3.deleteFile(filename);
    });

    it('should get stream bytes correctly', async () => {
      const req = {
        get: jasmine.createSpy('get').and.callFake(header => {
          if (header === 'Range') { return 'bytes=0-10'; }
          return null;
        }),
      };
      const res = {
        writeHead: jasmine.createSpy('writeHead'),
        write: jasmine.createSpy('write'),
        end: jasmine.createSpy('end'),
      };
      const data = await s3.handleFileStream(filename, req, res);

      expect(data.toString('utf8')).toBe('hello world');
      expect(res.writeHead).toHaveBeenCalled();
      expect(res.write).toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
    });
  });

  describe('credentials', () => {
    let s3ClientMock, S3Adapter;

    beforeEach(() => {
      S3Adapter = rewire("../index");

      s3ClientMock = jasmine.createSpy("S3Client").and.callFake(function (config) {
        this.config = config;
      });

      S3Adapter.__set__("S3Client", s3ClientMock);
    });

    it('should use direct credentials', async () => {
      const options = {
        bucket: 'bucket-1',
        accessKey: 'access-key',
        secretKey: 'secret-key'
      };
      const s3 = new S3Adapter(options);

      expect(s3._s3Client.config.credentials).toEqual({
        accessKeyId: 'access-key',
        secretAccessKey: 'secret-key'
      });
    });

    it('should use credentials', async () => {
      const options = {
        bucket: 'bucket-1',
        credentials: {
          accessKeyId: 'access-key',
          secretAccessKey: 'secret-key'
        }
      };
      const s3 = new S3Adapter(options);

      expect(s3._s3Client.config.credentials).toEqual({
        accessKeyId: 'access-key',
        secretAccessKey: 'secret-key'
      });
    });

    it('should use s3overrides credentials', async () => {
      const options = {
        bucket: 'bucket-1',
        s3overrides: {
          credentials: {
            accessKeyId: 'access-key',
            secretAccessKey: 'secret-key'
          }
        }
      };
      const s3 = new S3Adapter(options);

      expect(s3._s3Client.config.credentials).toEqual({
        accessKeyId: 'access-key',
        secretAccessKey: 'secret-key'
      });
    });

    it('should handle custom credential provider', async () => {
      const customCredentials = {
        getCredentials: () => Promise.resolve({
          accessKeyId: 'custom-key',
          secretAccessKey: 'custom-secret'
        })
      };
      const options = {
        bucket: 'bucket-1',
        credentials: customCredentials
      };
      const s3 = new S3Adapter(options);

      expect(s3._s3Client.config.credentials).toBe(customCredentials);
    });
  });
});
