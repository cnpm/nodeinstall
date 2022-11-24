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
const child_process = require('child_process');

const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const debug = require('debug')('nodeinstall');
const assert = require('assert');
const AdmZip = require('adm-zip');

const request = require('../request');
const cache = require('../cache');
const getLocalNodeVersion = require('../version').getLocalNodeVersion;
const getSafeVersion = require('../version').getSafeVersion;

class Installer {

  constructor(options) {
    assert(options, 'options is required');
    assert(options.name, 'options.name is required');
    assert(options.cwd, 'options.cwd is required');
    assert(options.distUrl, 'options.distUrl is required');
    assert(options.version, 'options.version is required');
    this.options = options;
    debug('Start install %s@%s, options: %j', options.name, options.version, options);
  }

  * install() {
    const cwd = this.options.cwd;
    const name = this.options.name;
    const distUrl = this.options.distUrl;

    const nodeModulesDir = path.join(cwd, 'node_modules');
    const nodeDir = path.join(nodeModulesDir, 'node');
    const nodeLinkDir = path.join(nodeModulesDir, '.bin');
    const nodeLink = path.join(nodeLinkDir, 'node');
    const npmLink = path.join(nodeLinkDir, 'npm');

    let version = yield this.getVersion();

    try {
      version = getSafeVersion(version, this.options.unsafeVersions);
    } catch (e) {
      version = e.safeVersion;
      console.error('[nodeinstall]', e.message);
    }

    try {
      // process.versions from installed node
      const versions = getLocalNodeVersion(cwd);
      if (version === versions[name]) {
        console.info('%s has been installed, version %s', name, version);
        return;
      }
    } catch (e) {
      if (e.name !== 'NodeNotInstalledError') {
        throw e;
      }
    }

    let platform = process.env.MOCK_OS_PLATFORM || os.platform();
    if (platform === 'win32') platform = 'win';
    const arch = os.arch() === 'ia32' ? 'x86' : os.arch();
    const shaUrl = `${distUrl}/v${version}/SHASUMS256.txt`;
    const pkgUrl = `${distUrl}/v${version}/${name}-v${version}-${platform}-${arch}.${platform === 'win' ? 'zip' : 'tar.gz'}`;

    // use cache or not
    const cacheStrategy = cache.getStrategy();
    debug('cacheStrategy, %j', cacheStrategy);
    const targetName = path.basename(urlparse(pkgUrl).pathname);
    const targetFile = path.join(cacheStrategy.cache, targetName);

    try {
      // download tarball if cache is disabled or cache file is not exist,
      // otherwise use cache
      if (cacheStrategy.disable || !fs.existsSync(targetFile)) {
        yield downloadFile(pkgUrl, shaUrl, targetFile);
      }

      // extract tarball/zip to $cwd/node_modules
      if (platform === 'win') {
        const entryDir = path.basename(targetFile, '.zip');
        const destDir = path.resolve(nodeLinkDir, entryDir);
        rimraf.sync(destDir);

        try {
          yield unzipFile(targetFile, path.dirname(destDir));
        } catch (e) {
          console.error('[install] extract zip error:', e);
        }

        rimraf.sync(nodeDir);
        cpWin32(destDir, nodeDir, false);
      } else {
        yield extract(targetFile, nodeDir);
      }
    } catch (err) {
      if (fs.existsSync(targetFile)) {
        fs.unlinkSync(targetFile);
      }
      throw err;
    }

    mkdirp.sync(nodeLinkDir);
    if (platform === 'win') {
      putBinaryWin32(nodeDir, nodeLinkDir);
    } else {
      if (!fs.existsSync(nodeLink)) {
        fs.symlinkSync(path.normalize('../node/bin/node'), nodeLink);
      }
      if (!fs.existsSync(npmLink)) {
        fs.symlinkSync(path.normalize('../node/bin/npm'), npmLink);
      }
    }
    const packageJsonFile = path.join(nodeDir, 'package.json');
    fs.writeFileSync(packageJsonFile, JSON.stringify({
      name: this.options.name,
      version: this.options.version,
    }, null, 2));
  }

  * getVersion() {
    return this.options.version;
  }
}

module.exports = Installer;

function* downloadFile(url, shaUrl, targetFile) {
  debug('download %s to %s', url, targetFile);
  const ret = yield request(url, {
    timeout: 20000,
    streaming: true,
    followRedirect: true,
    retry: 3,
  });
  const res = ret.res;

  if (res.statusCode !== 200) {
    const err = new Error('GET ' + url + ' got ' + res.statusCode);
    err.statusCode = res.statusCode;
    err.headers = res.headers;
    throw err;
  }

  yield writeFile(res, targetFile);
  yield verifyChecksum(shaUrl, targetFile);
}

function* verifyChecksum(shaUrl, targetFile) {
  const ret = yield request(shaUrl, {
    followRedirect: true,
  });
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

function unzipFile(zipFile, targetDir) {
  if (typeof zipFile === 'string') {
    if (!zipFile || !fs.existsSync(zipFile) || !fs.statSync(zipFile).isFile()) { throw new Error('[unzipFile] zipFile should be one existed filename!'); }
  } else if (!Buffer.isBuffer(zipFile)) {
    throw new Error('[unzipFile] zipFile should be buffer or filename!');
  }

  const zipInst = new AdmZip(zipFile);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { mode: '777', recursive: true });
  } else if (!fs.statSync(targetDir).isDirectory()) {
    throw new Error('[unzipFile] targetDir should be directory!');
  }

  return new Promise(function(resolve, reject) {
    try {
      zipInst.extractAllTo(targetDir, true);
      resolve();
    } catch (e) {
      reject(e);
    }

  });
}

function cpWin32(source, target, keepbase = false) {
  if (keepbase) {
    child_process.execSync(`xcopy \"${source}\" \"${target}\" /e /c /h /r /k /o /y`);
  } else {
    child_process.execSync(`xcopy \"${source}\" \"${target}\" /e /c /h /i`);
  }
}

function putBinaryWin32(nodeDir, projectBinDir) {
  [
    'node.exe',
    'npm.cmd',
    'npm',
    'node_modules',
  ].forEach(function(file) {
    const source = path.resolve(nodeDir, file);
    const target = path.resolve(projectBinDir, file);
    if (fs.existsSync(target)) rimraf.sync(target);

    if (!fs.statSync(source).isDirectory()) {
      cpWin32(source, projectBinDir, true);
    } else {
      cpWin32(source, target, false);
    }
  });
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
