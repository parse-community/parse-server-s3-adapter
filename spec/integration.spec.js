const { httpRequest } = require('./support/request');

describe('S3Adapter integration tests', () => {
  it('should create a file in Parse Server', async () => {
    const base64 = Buffer.from('1').toString('base64');
    const file = new Parse.File('file.txt', { base64 });
    await file.save();

    expect(file).toBeDefined();
    expect(file.url()).toMatch(/file.txt$/);
  });

  it('should read the contents of the file', async () => {
    const base64 = Buffer.from('1').toString('base64');
    const file = new Parse.File('file.txt', { base64 });
    await file.save();
    const fileLink = file.url();

    const response = await httpRequest(fileLink);
    const text = response.toString();

    expect(text).toBe('1');
  });

  it('should delete the file', async () => {
    const base64 = Buffer.from('1').toString('base64');
    const file = new Parse.File('file.txt', { base64 });
    await file.save();

    const fileLink = file.url();
    await file.destroy();

    await expectAsync(httpRequest(fileLink)).toBeRejectedWithError(
      'Request failed with status code 404'
    );
  });
});
