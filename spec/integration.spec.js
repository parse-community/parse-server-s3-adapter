const { httpRequest } = require('./support/request');

describe('S3Adapter integration tests', () => {
  it('stores a file', async () => {
    const base64 = Buffer.from('1').toString('base64');
    const file = new Parse.File('file.txt', { base64 });
    await file.save();

    expect(file).toBeDefined();
    expect(file.url()).toMatch(/file.txt$/);
  });

  it('reads the contents of a file', async () => {
    const base64 = Buffer.from('1').toString('base64');
    const file = new Parse.File('file.txt', { base64 });
    await file.save();
    const fileLink = file.url();

    const response = await httpRequest(fileLink);
    const text = response.toString();

    expect(text).toBe('1');
  });

  it('deletes a file', async () => {
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
