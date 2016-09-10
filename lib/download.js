'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs');
const bytes = require('bytes');
const urlparse = require('url').parse;
const ProgressBar = require('progress');
const crypto = require('crypto');
const zlib = require('zlib');
const tar = require('tar');
const mkdirp = require('mkdirp');
const debug = require('debug')('nodeinstall:download');
const request = require('./request');
const cache = require('./cache');


module.exports = function* download(options) {
  const distUrl = options.distUrl;
  const version = options.version;
  const name = options.name;
  const cwd = options.cwd;

  const nodeModulesDir = path.join(cwd, 'node_modules');
  const nodeDir = path.join(nodeModulesDir, 'node');
  const nodeLinkDir = path.join(nodeModulesDir, '.bin');
  const nodeLink = path.join(nodeLinkDir, 'node');
  const npmLink = path.join(nodeLinkDir, 'npm');

  const platform = process.env.MOCK_OS_PLATFORM || os.platform();
  const arch = os.arch() === 'x64' ? 'x64' : 'x86';
  const shaUrl = distUrl + '/v' + version + '/SHASUMS256.txt';
  const tgzName = `${name}-v${version}-${platform}-${arch}.tar.gz`;
  const tgzUrl = distUrl + '/v' + version + '/' + tgzName;

  const cacheStrategy = cache.getStrategy(process.argv);
  debug('cacheStrategy, %j', cacheStrategy);
  const targetName = path.basename(urlparse(tgzUrl).pathname);
  const targetFile = path.join(cacheStrategy.cache, targetName);

  // download tarball if
  // 1. cache is disabled
  // 2. cache file is not exist
  if (cacheStrategy.disable || fs.existsSync(targetFile)) {
    yield downloadTgz(tgzUrl, shaUrl, targetFile);
  }

  yield extract(targetFile, nodeDir);

  mkdirp.sync(nodeLinkDir);
  fs.symlinkSync(path.normalize('../node/bin/node'), nodeLink);
  if (!fs.existsSync(npmLink)) {
    fs.symlinkSync(path.normalize('../node/bin/npm'), npmLink);
  }
  const packageJsonFile = path.join(nodeDir, 'package.json');
  fs.writeFileSync(packageJsonFile, JSON.stringify({ name, version }, null, 2));
};

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
  const shas = ret.data.toString();
  const refSha = getShaByTgzName(shas, tgzName);
  const actualSha = calcSha(fs.readFileSync(targetFile));
  if (refSha !== actualSha) {
    const err = new Error(`Checksum verification failed. Reference checksum is ${refSha.slice(0, 7)}, but the actual checksum is ${actualSha.slice(0, 7)}`);
    err.name = 'ChecksumError';
    throw err;
  }
}

function extract(targetFile, nodeDir) {
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
  mkdirp.sync(path.dirname(targetFile));
  return new Promise(function(resolve, reject) {
    const ws = fs.createWriteStream(targetFile);
    showProgress(res);
    res.pipe(ws);
    ws.on('error', err => {
      // 将缓存文件也删除了
      if (fs.existsSync(targetFile)) {
        fs.unlinkSync(targetFile);
      }
      reject(err);
    }).on('finish', resolve);
  });
}

function showProgress(res) {
  const bar = new ProgressBar('[tnpm] downloading [:bar] :percent :etas/:elapseds :current/:total :speed/s', {
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
  content.split('\n').forEach(function(line) {
    if (line.indexOf(tarName) > -1) {
      sha = line.split(/\s/)[0];
      return false;
    }
  });
  return sha;
}

function calcSha(file) {
  return crypto.createHash('sha256').update(file).digest('hex');
}
