const http = require('http');
const https = require('https');

/**
 * Makes an HTTP or HTTPS request.
 * @param {string} url - The URL to request.
 * @returns {Promise<string>} - A promise that resolves with the response data or rejects with an error.
 */
function httpRequest(url) {
  return new Promise((resolve, reject) => {
    // Determine the appropriate module to use based on the URL protocol
    const client = url.startsWith('https') ? https : http;

    // Make the request
    client
      .get(url, response => {
        let data = '';

        // Collect the data chunks
        response.on('data', chunk => {
          data += chunk;
        });

        // When the response ends, resolve or reject the promise
        response.on('end', () => {
          if (response.statusCode && response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
            resolve(data); // Resolve with the collected data
          } else {
            reject(new Error(`Request failed with status code ${response.statusCode}`));
          }
        });
      })
      .on('error', error => {
        reject(new Error(`Error making request: ${error.message}`)); // Reject on error
      });
  });
}

module.exports = { httpRequest };
