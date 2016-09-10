'use strict';

const getAlinodeVersion = require('./version').getAlinodeVersion;
const install = require('./install');
const config = require('./config');

const DEFAULT_OPTIONS = {
  cwd: process.cwd(),
  version: '',
  distUrl: config.alinodeDistUrl,
};

module.exports = function* installAlinode(options) {
  options = Object.assign({}, DEFAULT_OPTIONS, options, { name: 'alinode' });
  options.version = yield getAlinodeVersion(options);
  yield install(options);
};
