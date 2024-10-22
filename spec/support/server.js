const { ParseServer } = require('parse-server');
const express = require('express');
const http = require('http');
const { makeS3Adapter } = require('../mocks/s3adapter-v2');
const Config = require('../../node_modules/parse-server/lib/Config.js');

const expressApp = express();
const S3Adapter = makeS3Adapter();

let serverState = {};

const defaultConfig = {
  databaseURI: 'mongodb://127.0.0.1:27017/s3-adapter',
  appId: 'test',
  masterKey: 'test',
  serverURL: 'http://127.0.0.1:1327/api/parse',
  port: 1327,
  mountPath: '/api/parse',
  verbose: false,
  silent: true,
  fileUpload: {
    enableForPublic: true,
    enableForAnonymousUser: true,
    enableForAuthenticatedUser: true,
  },
  filesAdapter: S3Adapter,
  verifyUserEmails: false,
};

async function startServer(config = {}) {
  if (!process.env.TESTING) {
    throw 'requires test environment to run';
  }

  // Compose server config
  const serverConfig = Object.assign({}, config, defaultConfig);

  // Launch parse server
  const parseServer = ParseServer(serverConfig);
  await parseServer.start();
  expressApp.use(serverConfig.mountPath, parseServer.app);

  // Launch http server
  const httpServer = http.createServer(expressApp);
  await new Promise((resolve, reject) => {
    httpServer.listen(serverConfig.port)
      .once('listening', resolve)
      .once('error', e => reject(e));
  }).catch(e => {
    console.log(`parse-server failed to launch with error: ${e}`);
  });

  // Update server state
  Object.assign(serverState, {
    parseServer,
    httpServer,
    serverConfig,
  });
}

async function stopServer() {
  if (!process.env.TESTING) {
    throw 'requires test environment to run';
  }

  // Clear database
  await Parse.User.logOut();
  const app = Config.get(defaultConfig.appId);
  await app?.database.deleteEverything(true);

  // Stop server
  const { httpServer } = serverState;
  await new Promise(resolve => httpServer.close(resolve));
  serverState = {};
}

async function reconfigureServer(config = {}) {
  await stopServer();
  return await startServer(config);
}

module.exports = {
  reconfigureServer,
  startServer,
  stopServer,
};
