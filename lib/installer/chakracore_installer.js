'use strict';

const getNodeVersion = require('../version').getNodeVersion;
const Installer = require('./installer');

class ChakracoreInstaller extends Installer {
  constructor(options) {
    super(Object.assign({}, options, { name: 'chakracore' }));
  }

  * getVersion() {
    return yield getNodeVersion(this.options);
  }
}

module.exports = ChakracoreInstaller;
