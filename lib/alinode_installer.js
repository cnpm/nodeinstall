'use strict';

const getAlinodeVersion = require('./version').getAlinodeVersion;
const Installer = require('./installer');
const config = require('./config');

const DEFAULT_OPTIONS = {
  cwd: process.cwd(),
  version: '',
  distUrl: config.alinodeDistUrl,
};

class AlinodeInstaller extends Installer {

  constructor(options) {
    super(Object.assign({}, DEFAULT_OPTIONS, options, { name: 'alinode' }));
  }

  * getVersion() {
    return yield getAlinodeVersion(this.options);
  }
}

module.exports = AlinodeInstaller;
