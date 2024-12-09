const { Readable } = require('stream');
const config = require('config');
const S3Adapter = require('../index');
const optionsFromArguments = require('../lib/optionsFromArguments');
const { GetObjectCommand, PutObjectCommand, CreateBucketCommand } = require('@aws-sdk/client-s3');
const { getMockS3Adapter } = require('./mocks/s3adapter');


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
      const otherEndpoint = 'https://test.com:8080/path?foo=bar';
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
      expect(endpointFromConfig.hostname).toEqual('test.com');
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
        const commands = s3ClientMock.send.calls.all();
        expect(commands.length).toBe(2);
        expect(commands[0].args[0]).toBeInstanceOf(CreateBucketCommand);
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
      expect(await s3.getFileLocation(testConfig, 'test.png')).toEqual(
        'http://example.com/files/foo/bar/test.png'
      );
    });

    it('should get direct to baseUrl', async () => {
      options.baseUrlDirect = true;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      expect(await s3.getFileLocation(testConfig, 'test.png')).toEqual(
        'http://example.com/files/test.png'
      );
    });

    it('should get without directAccess', async () => {
      options.directAccess = false;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      expect(await s3.getFileLocation(testConfig, 'test.png')).toEqual(
        'http://my.server.com/parse/files/xxxx/test.png'
      );
    });

    it('should go directly to amazon', async () => {
      delete options.baseUrl;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      expect(await s3.getFileLocation(testConfig, 'test.png')).toEqual(
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
      expect(await s3.getFileLocation(testConfig, 'test.png')).toEqual(
        'http://example.com/files/foo/bar/test.png'
      );
    });

    it('should get direct to baseUrl', async () => {
      options.baseUrlDirect = true;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      expect(await s3.getFileLocation(testConfig, 'test.png')).toEqual(
        'http://example.com/files/test.png'
      );
    });

    it('should get without directAccess', async () => {
      options.directAccess = false;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      expect(await s3.getFileLocation(testConfig, 'test.png')).toEqual(
        'http://my.server.com/parse/files/xxxx/test.png'
      );
    });

    it('should go directly to amazon', async () => {
      delete options.baseUrl;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      expect(await s3.getFileLocation(testConfig, 'test.png')).toEqual(
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
      expect(await s3.getFileLocation(testConfig, 'test.png')).toEqual(
        'http://example.com/files/foo/bar/test.png'
      );
    });

    it("when use presigned URL should use S3 'getObject' operation", async () => {
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
      expect(await s3.getFileLocation(testConfig, 'test.png')).toEqual(
        'http://example.com/files/test.png'
      );
    });

    it('should get without directAccess', async () => {
      options.directAccess = false;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      expect(await s3.getFileLocation(testConfig, 'test.png')).toEqual(
        'http://my.server.com/parse/files/xxxx/test.png'
      );
    });

    it('should go directly to amazon', async () => {
      delete options.baseUrl;
      const s3 = new S3Adapter('accessKey', 'secretKey', 'my-bucket', options);
      expect(await s3.getFileLocation(testConfig, 'test.png')).toEqual(
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
        bucketPrefix: 'test/',
      };
      s3ClientMock = jasmine.createSpyObj('S3Client', ['send']);
      s3ClientMock.send.and.returnValue(Promise.resolve());
    });

    it('should save a file with right command', async () => {
      const s3 = getMockS3Adapter(options);
      s3._s3Client = s3ClientMock;

      await s3.createFile('file.txt', 'hello world', 'text/utf8', {});
      expect(s3ClientMock.send.calls.all().length).toBe(2);
      expect(s3ClientMock.send).toHaveBeenCalledWith(jasmine.any(CreateBucketCommand));
      expect(s3ClientMock.send).toHaveBeenCalledWith(jasmine.any(PutObjectCommand));
    });

    it('should save a file with metadata added', async () => {
      const s3 = getMockS3Adapter(options);
      s3._s3Client = s3ClientMock;
      const metadata = { foo: 'bar' };

      await s3.createFile('file.txt', 'hello world', 'text/utf8', { metadata });
      const commands = s3ClientMock.send.calls.all();
      expect(commands.length).toBe(2);
      expect(commands[0].args[0]).toBeInstanceOf(CreateBucketCommand);
      const commandArg = commands[1].args[0];
      expect(commandArg).toBeInstanceOf(PutObjectCommand);
      expect(commandArg.input.Metadata).toEqual({ foo: 'bar' });
    });

    it('should save a file with tags added', async () => {
      const s3 = getMockS3Adapter(options);
      s3._s3Client = s3ClientMock;
      const tags = { foo: 'bar', baz: 'bin' };

      await s3.createFile('file.txt', 'hello world', 'text/utf8', { tags });
      const commands = s3ClientMock.send.calls.all();
      expect(commands.length).toBe(2);
      expect(commands[0].args[0]).toBeInstanceOf(CreateBucketCommand);
      const commandArg = commands[1].args[0];
      expect(commandArg).toBeInstanceOf(PutObjectCommand);
      expect(commandArg.input.Tagging).toBe('foo=bar&baz=bin');
    });

    it('should save a file with proper ACL with direct access', async () => {
      options.directAccess = true;
      const s3 = getMockS3Adapter(options);
      s3._s3Client = s3ClientMock;

      await s3.createFile('file.txt', 'hello world', 'text/utf8', {});
      const commands = s3ClientMock.send.calls.all();
      expect(commands.length).toBe(2);
      expect(commands[0].args[0]).toBeInstanceOf(CreateBucketCommand);
      const commandArg = commands[1].args[0];
      expect(commandArg).toBeInstanceOf(PutObjectCommand);
      expect(commandArg.input.ACL).toBe('public-read');
    });

    it('should save a file with proper ACL without direct access', async () => {
      const s3 = getMockS3Adapter(options);
      s3._s3Client = s3ClientMock;

      await s3.createFile('file.txt', 'hello world', 'text/utf8', {});
      const commands = s3ClientMock.send.calls.all();
      expect(commands.length).toBe(2);
      expect(commands[0].args[0]).toBeInstanceOf(CreateBucketCommand);
      const commandArg = commands[1].args[0];
      expect(commandArg).toBeInstanceOf(PutObjectCommand);
      expect(commandArg.input.ACL).toBeUndefined();
    });

    it('should save a file and override ACL with direct access', async () => {
      options.directAccess = true;
      options.fileAcl = 'private';
      const s3 = getMockS3Adapter(options);
      s3._s3Client = s3ClientMock;

      await s3.createFile('file.txt', 'hello world', 'text/utf8', {});
      const commands = s3ClientMock.send.calls.all();
      expect(commands.length).toBe(2);
      expect(commands[0].args[0]).toBeInstanceOf(CreateBucketCommand);
      const commandArg = commands[1].args[0];
      expect(commandArg).toBeInstanceOf(PutObjectCommand);
      expect(commandArg.input.ACL).toBe('private');
    });

    it('should save a file and remove ACL with direct access', async () => {
      // Create adapter
      options.directAccess = true;
      options.fileAcl = 'none';
      const s3 = getMockS3Adapter(options);
      s3._s3Client = s3ClientMock;

      await s3.createFile('file.txt', 'hello world', 'text/utf8', {});
      const commands = s3ClientMock.send.calls.all();
      expect(commands.length).toBe(2);
      expect(commands[0].args[0]).toBeInstanceOf(CreateBucketCommand);
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
});
