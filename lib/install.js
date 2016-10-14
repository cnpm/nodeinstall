'use strict';

const path = require('path');
const extend = require('extend');
const assert = require('assert');
const getNightlyVersion = require('./version').getNightlyVersion;
const config = require('./config');

const DEFAULT_OPTIONS = {
  cwd: process.cwd(),
  version: '',
  installNode: false,
  installNoderc: false,
  installAlinode: false,
  installNsolid: false,
  installNghtly: false,
  china: false,
  cache: false,
  distUrl: '',
};
const TYPES = Object.keys(config);

module.exports = function* (options) {
  options = extend({}, DEFAULT_OPTIONS, options);
  const isChina = options.china || process.env.NODEINSTALL_CHINA;
  const result = getTypeAndVersion(options);
  const type = result.type;
  let version = result.version;

  const installConfig = config[type];
  assert(installConfig, `type ${type} is not defined in ${TYPES}`);
  const distUrl = options.distUrl || (isChina ? installConfig.distMirrorUrl : installConfig.distUrl);
  const Installer = installConfig.installer;

  if (type === 'nightly') {
    // always get the latest version
    version = yield getNightlyVersion();
  }

  const installer = new Installer({
    cwd: options.cwd,
    distUrl,
    version,
  });
  yield installer.install();
};

function getTypeAndVersion(options) {
  const version = options.version;
  const type = getTypeFromOptions(options);

  if (type) {
    return { type, version };
  }

  const result = getTypeFromPackage(options);
  if (result) {
    return result;
  }

  return { type: 'node', version };
}

function getTypeFromOptions(options) {
  if (options.installNode) {
    return 'node';
  } else if (options.installNoderc) {
    return 'noderc';
  } else if (options.installAlinode) {
    return 'alinode';
  } else if (options.installNsolid) {
    return 'nsolid';
  } else if (options.installNightly) {
    return 'nightly';
  }
}

function getTypeFromPackage(options) {
  let engines;
  try {
    engines = require(path.join(options.cwd, 'package.json')).engines || {};
  } catch (e) {
    return;
  }

  let type;
  let version;
  for (const t of TYPES) {
    const name = `install-${t}`;
    if (!engines[name]) {
      continue;
    }
    type = t;
    version = engines[name];
  }

  if (type) {
    return { type, version };
  }
}
