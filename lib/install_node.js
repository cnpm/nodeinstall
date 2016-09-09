'use strict';

const path = require('path');
const version = require('./version');
const download = require('./download');
const getLocalNodeVersion = require('./get_local_node_version');

const DEFAULT_OPTIONS = {
  cwd: process.cwd(),
  version: '',
  distUrl: 'https://nodejs.org/dist',
  alinodeVersion: '',
  alinodeDistUrl: 'http://alinode.aliyun.com/dist/new-alinode',
  nightlyDistUrl: '',
};

module.exports = function* installNode(options) {
  options = Object.assign({}, DEFAULT_OPTIONS, options);

  process.env.INSTALL_NODE_BIN_DIR = path.join(options.cwd, 'node_modules', 'node', 'bin');
  process.env.PATH = process.env.INSTALL_NODE_BIN_DIR + path.delimiter + process.env.PATH;

  const requestOptions = {};
  requestOptions.distUrl = options.distUrl;
  requestOptions.version = yield version.getNodeVersion({
    version: options.version,
    distUrl: options.distUrl,
  });

  try {
    const versions = getLocalNodeVersion();
    if (requestOptions.version === versions.node) {
      // has been installed
      return;
    }
  } catch (e) {
    if (e.name !== 'NodeNotInstalledError') {
      throw e;
    }
  }

  yield download(requestOptions);

};
