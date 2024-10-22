const semver = require('semver');

const satisfiesParseServerVersion = version => {
  const envVersion = process.env.PARSE_SERVER_VERSION;
  console.log(`satisfiesParseServerVersion: envVersion: ${version}`);
  console.log(`satisfiesParseServerVersion: version: ${envVersion}`);
  return !envVersion || semver.satisfies(envVersion, version);
}

global.it_only_parse_server_version = version => satisfiesParseServerVersion(version) ? it : xit;
global.fit_only_parse_server_version = version => satisfiesParseServerVersion(version) ? fit : xit;
global.describe_only_parse_server_version = version => satisfiesParseServerVersion(version) ? describe : xdescribe;
global.fdescribe_only_parse_server_version = version => satisfiesParseServerVersion(version) ? fdescribe : xdescribe;