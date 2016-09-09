'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs');
const childprocess = require('child_process');

module.exports = function* getLocalNodeVersion() {
  const nodeBinDir = process.env.INSTALL_NODE_BIN_DIR;
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
};
