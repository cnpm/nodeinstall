'use strict';

const config = require('../lib/config');

exports.getDistUrl = function getDistUrl(type) {
  let installConfig = config[type];
  if (!installConfig) {
    installConfig = config.node;
  }
  return process.env.NODEINSTALL_CHINA ? installConfig.distMirrorUrl : installConfig.distUrl;
};
