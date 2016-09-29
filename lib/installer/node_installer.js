'use strict';

const getNodeVersion = require('../version').getNodeVersion;
const Installer = require('./installer');

class NodeInstaller extends Installer {

  constructor(options) {
    options = Object.assign({}, options, { name: 'node' });
    super(options);
  }

  * getVersion() {
    return yield getNodeVersion(this.options);
  }
}

module.exports = NodeInstaller;
