'use strict';

const getAlinodeVersion = require('../version').getAlinodeVersion;
const Installer = require('./installer');


class AlinodeInstaller extends Installer {

  constructor(options) {
    super(Object.assign({}, options, { name: 'alinode' }));
  }

  * getVersion() {
    return yield getAlinodeVersion(this.options);
  }
}

module.exports = AlinodeInstaller;
