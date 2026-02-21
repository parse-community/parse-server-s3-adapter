const http = require('http');
const { httpRequest } = require('./support/request');

const fileName = 'file.txt';
const fileData = 'hello world';

function streamUpload(serverUrl, appId, fileName, body) {
  const url = new URL(`${serverUrl}/files/${fileName}`);
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: 'POST',
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Upload-Mode': 'stream',
        'Content-Type': 'application/octet-stream',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Stream upload failed with status ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end(body);
  });
}

describe_only_parse_server_version('>=7')('Parse Server >=7 integration test', () => {
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

  it('stores and reads a file via streaming upload', async () => {
    const streamData = 'streamed content that differs from fileData';
    const result = await streamUpload(
      'http://127.0.0.1:1327/api/parse',
      'test',
      'stream-test.txt',
      streamData
    );

    expect(result.url).toMatch(/stream-test\.txt$/);
    expect(result.name).toMatch(/stream-test\.txt$/);

    const response = await httpRequest(result.url);
    expect(response.toString()).toBe(streamData);
  });
});
