'use strict';

const semver = require('semver');
const assert = require('assert');
const debug = require('debug')('nodeinstall:version');
const request = require('./request');

exports.getAlinodeVersion = function* getAlinodeVersion(options) {
  options = options || {};
  const distUrl = options.distUrl;
  assert(distUrl, 'distUrl is required');
  const versions = yield getAlinodeVersions(distUrl);
  return yield _getNodeVersion(options.version, versions);
};

exports.getNodeVersion = function* getNodeVersion(options) {
  options = options || {};
  const distUrl = options.distUrl;
  assert(distUrl, 'distUrl is required');
  const versions = yield getNodeVersions(distUrl);
  return yield _getNodeVersion(options.version, versions);
};

function* _getNodeVersion(version, versions) {
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
  const res = yield request(distUrl + '/index.json');
  const versions = res.data
    .map(o => o.version.substring(1))
    .filter(v => semver.clean(v));
  debug('got node versions, %j', versions);
  return versions;
}

function* getAlinodeVersions(distUrl) {
  const res = yield request(distUrl + '/index.json');
  const versions = res.data.alinode_tab
    .map(o => o.version.substring(1))
    .filter(v => semver.clean(v));
  debug('got alinode versions, %j', versions);
  return versions;
}
