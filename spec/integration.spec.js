const Parse = require('parse/node');
const { TestUtils } = require('parse-server');
const { PARSE_APP_ID, PARSE_MASTER_KEY, reconfigureServer, serverURL } = require('./mocks/server');
const { httpRequest } = require('./support/request');

const fileData = 'hello world';

describe('S3Adapter integration tests', () => {
  beforeEach(async () => {
    process.env.TESTING = true;

    await reconfigureServer();

    Parse.initialize(PARSE_APP_ID);
    Parse.serverURL = serverURL;
    Parse.CoreManager.set('SERVER_URL', serverURL);
    Parse.CoreManager.set('MASTER_KEY', PARSE_MASTER_KEY);
  }, 60 * 1000);

  afterAll(async () => {
    Parse.Storage._clear();
    await TestUtils.destroyAllDataPermanently(true);
  });

  it('should create a file in Parse Server', async () => {
    const fileName = 'test-1.txt';

    const base64 = Buffer.from(fileData).toString('base64');
    const file = new Parse.File(fileName, { base64 });

    await file.save();

    expect(file).toBeDefined();
    expect(file.url()).toContain(fileName);
  });

  it(
    'should read the contents of the file',
    async () => {
      const fileName = 'test-2.txt';
      const base64 = Buffer.from(fileData).toString('base64');
      const file = new Parse.File(fileName, { base64 });
      await file.save();
      const fileLink = file.url();

      const response = await httpRequest(fileLink);
      const text = response.toString();

      expect(text).toBe(fileData); // Check if the contents match the original data
    },
    60 * 1000
  );

  it(
    'should delete the file',
    async () => {
      const fileName = 'test-3.txt';

      const base64 = Buffer.from(fileData).toString('base64');
      const file = new Parse.File(fileName, { base64 });
      await file.save();

      const fileLink = file.url();
      await file.destroy();

      return expectAsync(httpRequest(fileLink)).toBeRejectedWithError(
        'Request failed with status code 404'
      );
    },
    60 * 1000
  );
});
