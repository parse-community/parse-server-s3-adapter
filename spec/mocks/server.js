const { ParseServer } = require('parse-server');
const MockEmailAdapterWithOptions = require('./MockEmailAdapterWithOptions');
const { makeS3Adapter } = require('./s3adapter-v2');

const port = 1327;
const mountPath = '/api/parse';
const serverURL = 'http://127.0.0.1:1327/api/parse';

const PARSE_APP_ID = 'app-id';
const PARSE_MASTER_KEY = 'master-key';

const S3Adapter = makeS3Adapter();

const defaultConfiguration = {
  databaseURI: 'mongodb://127.0.0.1:27017/s3-adapter',
  appId: PARSE_APP_ID,
  masterKey: PARSE_MASTER_KEY,
  serverURL,
  liveQuery: {
    classNames: [],
  },
  startLiveQueryServer: true,
  verbose: false,
  silent: true,
  fileUpload: {
    enableForPublic: true,
    enableForAnonymousUser: true,
    enableForAuthenticatedUser: true,
  },
  revokeSessionOnPasswordReset: false,
  allowCustomObjectId: false,
  allowClientClassCreation: true,
  encodeParseObjectInCloudFunction: true,
  masterKeyIps: ['0.0.0.0/0', '0.0.0.0', '::/0', '::'],
  emailAdapter: MockEmailAdapterWithOptions(),
  port,
  mountPath,
  filesAdapter: S3Adapter,
};

let parseServer;

const reconfigureServer = async () => {
  if (parseServer) {
    await parseServer.handleShutdown();
    await new Promise(resolve => parseServer.server.close(resolve));
    parseServer = undefined;
    return reconfigureServer();
  }

  parseServer = await ParseServer.startApp(defaultConfiguration);
  if (parseServer.config.state === 'initialized') {
    console.error('Failed to initialize Parse Server');
    return reconfigureServer();
  }

  return parseServer;
};

module.exports = {
  reconfigureServer,
  S3Adapter,
  port,
  mountPath,
  serverURL,
  PARSE_APP_ID,
  PARSE_MASTER_KEY,
};
