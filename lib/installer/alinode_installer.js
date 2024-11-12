'use strict';

const getAlinodeVersion = require('../version').getAlinodeVersion;
const Installer = require('./installer');


class AlinodeInstaller extends Installer {

  constructor(options) {
    super({
      ...options,
      name: 'alinode',
    });
  }

  async getVersion() {
    return await getAlinodeVersion(this.options);
  }
}

module.exports = AlinodeInstaller;
