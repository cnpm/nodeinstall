'use strict';

const os = require('os');
const path = require('path');

let homedir = process.env.HOME;
// for Windows HOME
if (!homedir) {
  homedir = process.env.HOMEDRIVE + process.env.HOMEPATH;
}
if (!homedir) {
  homedir = os.tmpdir();
}

const tmpdir = path.join(homedir, '.tmp');
let cachedir = process.env.NODEINSTALL_CACHE;
if (!cachedir) {
  if (process.platform === 'win32') {
    cachedir = path.join(process.env.APPDATA || tmpdir, '.nodeinstall');
  } else {
    cachedir = path.join(process.env.HOME || tmpdir, '.nodeinstall');
  }
}

// 获取缓存策略
exports.getStrategy = function() {
  // 避免网络问题导致 tnpm install 变慢，默认在本地开发环境开启 cache 功能。
  let disable = false;
  if (process.argv.indexOf('--production') >= 0) {
    disable = true;
  }
  if (process.env.NODE_ENV) {
    // NODE_ENV 这个环境变量存在，代表当前运行环境是服务器，关闭 cache
    disable = true;
  }

  let cache = cachedir;
  if (disable) {
    // 一次性缓存目录
    // tnpm.$yyyy-MM-dd.$pid.$timestamp
    const now = new Date();
    const yyyyMMdd = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    cache = path.join(tmpdir, 'nodeinstall.' + yyyyMMdd + '.' + process.pid + '.' + Date.now());
  }
  return { disable, cache };
};
