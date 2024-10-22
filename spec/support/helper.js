'use strict';
const { SpecReporter } = require('jasmine-spec-reporter');
const { startServer, stopServer, reconfigureServer } = require('./server');

// Setup jasmine
jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.TESTING_TIMEOUT || "360000";
jasmine.getEnv().addReporter(new SpecReporter());

beforeAll(async () => {
  await startServer();
});

afterAll(async () => {
  await stopServer();
});

beforeEach(async () => {
  await reconfigureServer();
});
