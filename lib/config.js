'use strict';

const NodeInstaller = require('./installer/node_installer');
const AlinodeInstaller = require('./installer/alinode_installer');
const NSolidInstaller = require('./installer/nsolid_installer');

module.exports = {
  node: {
    installer: NodeInstaller,
    distUrl: 'https://nodejs.org/dist',
    distMirrorUrl: 'https://npm.taobao.org/mirrors/node',
  },
  alinode: {
    installer: AlinodeInstaller,
    distUrl: 'http://alinode.aliyun.com/dist/new-alinode',
    distMirrorUrl: 'https://npm.taobao.org/mirrors/alinode',
  },
  nsolid: {
    installer: NSolidInstaller,
    distUrl: 'https://nsolid-download.nodesource.com/download/nsolid-node/release',
    distMirrorUrl: 'https://npm.taobao.org/mirrors/nsolid',
  },
  noderc: {
    installer: NodeInstaller,
    distUrl: 'https://nodejs.org/download/rc',
    distMirrorUrl: 'https://npm.taobao.org/mirrors/node-rc',
  },
  nightly: {
    installer: NodeInstaller,
    distUrl: 'https://nodejs.org/download/nightly',
    distMirrorUrl: 'https://npm.taobao.org/mirrors/node-nightly',
  },
};
