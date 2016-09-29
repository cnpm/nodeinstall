'use strict';

const fs = require('fs');
const path = require('path');
const getNodeVersion = require('../version').getNodeVersion;
const Installer = require('./installer');

class NSolidInstaller extends Installer {

  constructor(options) {
    super(Object.assign({}, options, { name: 'nsolid' }));
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
