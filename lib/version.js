'use strict';

const semver = require('semver');
const assert = require('assert');
const os = require('os');
const path = require('path');
const fs = require('fs');
const childprocess = require('child_process');
const debug = require('debug')('nodeinstall:version');
const nodeNightlyVersion = require('node-nightly-version');
const request = require('./request');


module.exports = {

  * getAlinodeVersion(options) {
    options = options || {};
    const distUrl = options.distUrl;
    assert(distUrl, 'distUrl is required');
    const versions = yield getAlinodeVersions(distUrl);
    return _getNodeVersion(options.version, versions);
  },

  * getNodeVersion(options) {
    options = options || {};
    const distUrl = options.distUrl;
    assert(distUrl, 'distUrl is required');
    const versions = yield getNodeVersions(distUrl);
    return _getNodeVersion(options.version, versions);
  },

  * getLocalNodeVersion(cwd) {
    const nodeBinDir = path.join(cwd, 'node_modules', 'node', 'bin');
    let nodebin;
    if (os.platform() === 'win32') {
      nodebin = path.join(nodeBinDir, 'node.exe');
    } else {
      nodebin = path.join(nodeBinDir, 'node');
    }
    // Node has't installed in local
    if (!fs.existsSync(nodebin)) {
      const err = new Error(`${nodebin} isn't not installed`);
      err.name = 'NodeNotInstalledError';
      throw err;
    }
    const cmd = nodebin + ' -e "process.stdout.write(JSON.stringify(process.versions))"';
    const stdout = childprocess.execSync(cmd);
    return JSON.parse(stdout);
  },

  * getNightlyVersion() {
    return yield nodeNightlyVersion();
  },

  getSafeVersion(version, unsafeVersions) {
    if (!unsafeVersions) {
      return version;
    }

    for (const versionRange in unsafeVersions) {
      if (semver.satisfies(version, versionRange)) {
        const safeVersion = unsafeVersions[versionRange];
        const err = new Error(`Version ${version} is vul, use safe version ${safeVersion} instead`);
        err.safeVersion = safeVersion;
        throw err;
      }
    }

    return version;
  },

};


function _getNodeVersion(version, versions) {
  if (!version) {
    return versions[0];
  }

  const range = semver.validRange(version);
  if (!range) {
    throw new Error(`Unknown version ${version}`);
  }

  version = semver.maxSatisfying(versions, range);
  if (version) {
    return version;
  }
  throw new Error(`${version} is not matched`);
}

function* getNodeVersions(distUrl) {
  const res = yield request(distUrl + '/index.json', {
    method: 'GET',
    followRedirect: true,
    dataType: 'json',
    gzip: true,
  });
  const versions = res.data
    .map(o => o.version.substring(1))
    .filter(v => semver.clean(v));
  debug('got node versions, %j', versions);
  return versions;
}

function* getAlinodeVersions(distUrl) {
  const res = yield request(distUrl + '/index.tab', {
    timeout: 10000,
    method: 'GET',
    followRedirect: true,
    dataType: 'text',
    gzip: true,
  });
  const versions = res.data
    .split('\n')
    // ignore first line
    .slice(1)
    .map(line => line.replace(/^v(\d+.\d+.\d+).*$/, '$1'))
    .filter(v => semver.clean(v));
  debug('got alinode versions, %j', versions);
  return versions;
}
