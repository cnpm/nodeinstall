'use strict';

const fs = require('fs');
const path = require('path');
const getNodeVersion = require('../version').getNodeVersion;
const Installer = require('./installer');

class NSolidInstaller extends Installer {

  constructor(options) {
    super({
      ...options,
      name: 'nsolid',
    });
  }

  async getVersion() {
    return await getNodeVersion(this.options);
  }

  async install() {
    await super.install();
    fs.symlinkSync(path.normalize('./node'), path.join(this.options.cwd, 'node_modules/.bin/nsolid'));
  }
}

module.exports = NSolidInstaller;
