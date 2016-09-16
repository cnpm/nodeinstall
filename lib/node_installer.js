'use strict';

const getNodeVersion = require('./version').getNodeVersion;
const Installer = require('./installer');
const config = require('./config');

const DEFAULT_OPTIONS = {
  cwd: process.cwd(),
  version: '',
  distUrl: config.nodeDistUrl,
};

class NodeInstaller extends Installer {

  constructor(options) {
    options = Object.assign({}, DEFAULT_OPTIONS, options, { name: 'node' });
    super(options);
  }

  * getVersion() {
    return yield getNodeVersion(this.options);
  }
}

module.exports = NodeInstaller;
