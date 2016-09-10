'use strict';

const path = require('path');
const debug = require('debug')('nodeinstall:node');
const getNodeVersion = require('./version').getNodeVersion;
const getLocalNodeVersion = require('./version').getLocalNodeVersion;
const download = require('./download');

const DEFAULT_OPTIONS = {
  cwd: process.cwd(),
  version: '',
  distUrl: 'https://nodejs.org/dist',
};

module.exports = function* installNode(options) {
  options = Object.assign({}, DEFAULT_OPTIONS, options, { name: 'node' });

  process.env.INSTALL_NODE_BIN_DIR = path.join(options.cwd, 'node_modules', 'node', 'bin');
  process.env.PATH = process.env.INSTALL_NODE_BIN_DIR + path.delimiter + process.env.PATH;

  options.version = yield getNodeVersion(options);

  try {
    // process.versions from installed node
    const versions = getLocalNodeVersion(options.cwd);
    if (options.version === versions.node) {
      console.info('Node has been installed, version %s', versions.node);
      return;
    }
  } catch (e) {
    if (e.name !== 'NodeNotInstalledError') {
      throw e;
    }
  }

  debug('Start download %j', options);
  yield download(options);
};
