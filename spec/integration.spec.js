const { httpRequest } = require('./support/request');

const fileName = 'file.txt';
const fileData = 'hello world';

describe_only_parse_server_version('<=7')('Parse Server <=7 integration test', () => {
  it('stores a file', async () => {
    const base64 = Buffer.from(fileData).toString('base64');
    const file = new Parse.File(fileName, { base64 });
    await file.save();

    expect(file).toBeDefined();
    expect(file.url()).toMatch(/file.txt$/);
  });

  it('reads the contents of a file', async () => {
    const base64 = Buffer.from(fileData).toString('base64');
    const file = new Parse.File(fileName, { base64 });
    await file.save();
    const fileLink = file.url();

    const response = await httpRequest(fileLink);
    const text = response.toString();

    expect(text).toBe(fileData);
  });

  it('deletes a file', async () => {
    const base64 = Buffer.from(fileData).toString('base64');
    const file = new Parse.File(fileName, { base64 });
    await file.save();

    const fileLink = file.url();
    await file.destroy();

    await expectAsync(httpRequest(fileLink)).toBeRejectedWithError(
      'Request failed with status code 404'
    );
  });
});
