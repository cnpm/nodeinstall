'use strict';

const debug = require('debug')('nodeinstall:node');
const getNodeVersion = require('./version').getNodeVersion;
const install = require('./install');
const config = require('./config');

const DEFAULT_OPTIONS = {
  cwd: process.cwd(),
  version: '',
  distUrl: config.nodeDistUrl,
};

module.exports = function* installNode(options) {
  options = Object.assign({}, DEFAULT_OPTIONS, options, { name: 'node' });
  options.version = yield getNodeVersion(options);
  debug('Start install %j', options);
  yield install(options);
};
