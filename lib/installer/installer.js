'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs');
const bytes = require('bytes');
const urlparse = require('url').parse;
const ProgressBar = require('progress');
const crypto = require('crypto');
const mkdirp = require('mz-modules/mkdirp');
const debug = require('debug')('nodeinstall');
const assert = require('assert');
const zlib = require('zlib');
const tar = require('tar');
const compressing = require('compressing');
const request = require('../request');
const cache = require('../cache');
const getLocalNodeVersion = require('../version').getLocalNodeVersion;
const getSafeVersion = require('../version').getSafeVersion;

const install = Symbol('install');
const installWindows = Symbol('installWindows');
const download = Symbol('download');
const getVersion = Symbol('getVersion');


class Installer {

  constructor(options) {
    assert(options, 'options is required');
    assert(options.name, 'options.name is required');
    assert(options.cwd, 'options.cwd is required');
    assert(options.distUrl, 'options.distUrl is required');
    assert(options.version, 'options.version is required');
    debug('Start install %s@%s, options: %j', options.name, options.version, options);
    this.options = options;
  }

  * install() {
    const cwd = this.options.cwd;
    const version = yield this[getVersion]();
    if (!version) return;

    yield mkdirp(path.join(cwd, 'node_modules/.bin'));

    if (process.platform === 'win32') return yield this[installWindows](version);
    yield this[install](version);
  }

  * getVersion() {
    return this.options.version;
  }

  * [install](version) {
    const cwd = this.options.cwd;
    const name = this.options.name;
    const distUrl = this.options.distUrl;

    const nodeDir = path.join(cwd, 'node_modules/node');
    const nodeLink = path.join(cwd, 'node_modules/.bin/node');
    const npmLink = path.join(cwd, 'node_modules/.bin/npm');
    const extension = 'tar.gz';
    const platform = process.platform;
    const arch = os.arch() === 'x64' ? 'x64' : 'x86';
    const shaUrl = `${distUrl}/v${version}/SHASUMS256.txt`;
    const tgzUrl = `${distUrl}/v${version}/${name}-v${version}-${platform}-${arch}.${extension}`;

    yield this[download](tgzUrl, shaUrl, nodeDir);

    if (!fs.existsSync(nodeLink)) {
      fs.symlinkSync(path.normalize('../node/bin/node'), nodeLink);
    }
    if (!fs.existsSync(npmLink)) {
      fs.symlinkSync(path.normalize('../node/bin/npm'), npmLink);
    }
    const packageJsonFile = path.join(nodeDir, 'package.json');
    fs.writeFileSync(packageJsonFile, JSON.stringify({
      name: this.options.name,
      version: this.options.version,
    }, null, 2));
  }

  * [installWindows]() {
    console.log(1);
  }

  * [getVersion]() {
    let version = yield this.getVersion();

    try {
      version = getSafeVersion(version, this.options.unsafeVersions);
    } catch (e) {
      version = e.safeVersion;
      console.error('[nodeinstall]', e.message);
    }

    try {
      // process.versions from installed node
      const versions = yield getLocalNodeVersion(this.options.cwd);
      if (version === versions[name]) {
        console.info('%s has been installed, version %s', name, version);
        return;
      }
    } catch (e) {
      if (e.name !== 'NodeNotInstalledError') {
        throw e;
      }
    }
    return version;
  }

  * [download](srcUrl, shaUrl, targetDir) {
    // use cache or not
    const cacheStrategy = cache.getStrategy();
    debug('cacheStrategy, %j', cacheStrategy);
    const targetName = path.basename(urlparse(srcUrl).pathname);
    const targetFile = path.join(cacheStrategy.cache, targetName);

    try {
      // download tarball if cache is disabled or cache file is not exist,
      // otherwise use cache
      if (cacheStrategy.disable || !fs.existsSync(targetFile)) {
        yield downloadTgz(srcUrl, shaUrl, targetFile);
      }

      // extract tarball to $cwd/node_modules
      yield extract(targetFile, targetDir);
    } catch (err) {
      if (fs.existsSync(targetFile)) {
        fs.unlinkSync(targetFile);
      }
      throw err;
    }
  }

}

module.exports = Installer;

function* downloadTgz(tgzUrl, shaUrl, targetFile) {
  debug('download %s to %s', tgzUrl, targetFile);
  const ret = yield request(tgzUrl, {
    timeout: 20000,
    streaming: true,
    followRedirect: true,
    retry: 3,
  });
  const res = ret.res;

  if (res.statusCode !== 200) {
    const err = new Error('GET ' + tgzUrl + ' got ' + res.statusCode);
    err.statusCode = res.statusCode;
    err.headers = res.headers;
    throw err;
  }

  yield mkdirp(path.dirname(targetFile));
  yield writeFile(res, targetFile);
  yield verifyChecksum(shaUrl, targetFile);
}

function* verifyChecksum(shaUrl, targetFile) {
  const ret = yield request(shaUrl);
  const res = ret.res;

  if (res.statusCode !== 200) {
    const err = new Error('GET ' + shaUrl + ' got ' + res.statusCode);
    err.statusCode = res.statusCode;
    throw err;
  }

  const tgzName = path.basename(targetFile);
  const refSha = getShaByTgzName(ret.data.toString(), tgzName);
  const actualSha = calcSha(fs.readFileSync(targetFile));
  if (refSha !== actualSha) {
    const err = new Error(`Checksum verification failed. Reference checksum is ${refSha.slice(0, 7)}, but the actual checksum is ${actualSha.slice(0, 7)}`);
    err.name = 'ChecksumError';
    throw err;
  }
  debug('checksum success %s', refSha);
}

function* extract(targetFile, nodeDir) {
  if (path.extname(targetFile) === '.zip') {
    return yield compressing.zip.uncompress(targetFile, nodeDir, { strip: 1 });
  }
  yield extractTgz(targetFile, nodeDir);
  // yield compressing.tgz.uncompress(targetFile, nodeDir, { ignoreBase: true });
}

function extractTgz(targetFile, nodeDir) {
  return new Promise((resolve, reject) => {
    const gunzip = zlib.createGunzip();
    gunzip.on('error', reject);
    const extracter = tar.Extract({ path: nodeDir, strip: 1 });
    extracter.on('error', reject);
    extracter.on('end', resolve);
    fs.createReadStream(targetFile).pipe(gunzip).pipe(extracter);
  });
}

function writeFile(res, targetFile) {
  return new Promise(function(resolve, reject) {
    const ws = fs.createWriteStream(targetFile)
      .on('error', reject)
      .on('finish', resolve);
    showProgress(res);
    res.on('error', reject);
    res.pipe(ws);
  });
}

function showProgress(res) {
  const bar = new ProgressBar('[nodeinstall] downloading [:bar] :percent :etas/:elapseds :current/:total :speed/s', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: parseInt(res.headers['content-length'] || 1024 * 1024 * 30),
  });

  let start = Date.now();
  let size = 0;
  let speed = 0;
  res.on('data', chunk => {
    size += chunk.length;
    const use = Date.now() - start;
    // 每秒钟计算一次
    if (use >= 1000) {
      speed = size / use * 1000;
      start = Date.now();
      size = 0;
    }
    bar.tick(chunk.length, {
      speed: bytes(speed || size),
    });
  });
}

function getShaByTgzName(content, tarName) {
  let sha = '';
  for (const line of content.split('\n')) {
    if (line.indexOf(tarName) > -1) {
      sha = line.split(/\s/)[0];
      break;
    }
  }
  return sha;
}

function calcSha(file) {
  return crypto.createHash('sha256').update(file).digest('hex');
}

// support .zip on Windows when node >= 6.2.1
