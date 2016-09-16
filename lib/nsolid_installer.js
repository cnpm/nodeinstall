'use strict';

const fs = require('fs');
const path = require('path');
const getNodeVersion = require('./version').getNodeVersion;
const Installer = require('./installer');
const config = require('./config');

const DEFAULT_OPTIONS = {
  cwd: process.cwd(),
  version: '',
  distUrl: config.nsolidDistUrl,
};

class NSolidInstaller extends Installer {

  constructor(options) {
    super(Object.assign({}, DEFAULT_OPTIONS, options, { name: 'nsolid' }));
  }

  * getVersion() {
    return yield getNodeVersion(this.options);
  }

  * install() {
    yield super.install();
    fs.symlinkSync(path.normalize('./node'), path.join(this.options.cwd, 'node_modules/.bin/nsolid'));
  }
}

module.exports = NSolidInstaller;
