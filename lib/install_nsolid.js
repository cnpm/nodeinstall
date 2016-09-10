'use strict';

const fs = require('fs');
const path = require('path');
const getNodeVersion = require('./version').getNodeVersion;
const install = require('./install');
const config = require('./config');

const DEFAULT_OPTIONS = {
  cwd: process.cwd(),
  version: '',
  distUrl: config.nsolidDistUrl,
};

module.exports = function* installNsolid(options) {
  options = Object.assign({}, DEFAULT_OPTIONS, options, { name: 'nsolid' });
  options.version = yield getNodeVersion(options);
  yield install(options);
  fs.symlinkSync(path.normalize('./node'), path.join(options.cwd, 'node_modules/.bin/nsolid'));
};
