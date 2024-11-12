'use strict';

const getNodeVersion = require('../version').getNodeVersion;
const Installer = require('./installer');

class NodeInstaller extends Installer {

  constructor(options) {
    super({
      ...options,
      name: 'node',
    });
  }

  async getVersion() {
    return await getNodeVersion(this.options);
  }
}

module.exports = NodeInstaller;
