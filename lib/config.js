'use strict';

const NodeInstaller = require('./installer/node_installer');
const AlinodeInstaller = require('./installer/alinode_installer');
const NSolidInstaller = require('./installer/nsolid_installer');

module.exports = {
  node: {
    installer: NodeInstaller,
    distUrl: 'https://nodejs.org/dist',
    distMirrorUrl: 'https://npmmirror.com/mirrors/node',
  },
  alinode: {
    installer: AlinodeInstaller,
    distUrl: 'http://alinode.aliyun.com/dist/new-alinode',
    distMirrorUrl: 'https://npmmirror.com/mirrors/alinode',
  },
  nsolid: {
    installer: NSolidInstaller,
    distUrl: 'https://nsolid-download.nodesource.com/download/nsolid-node/release',
    distMirrorUrl: 'https://npmmirror.com/mirrors/nsolid',
  },
  noderc: {
    installer: NodeInstaller,
    distUrl: 'https://nodejs.org/download/rc',
    distMirrorUrl: 'https://npmmirror.com/mirrors/node-rc',
  },
  nightly: {
    installer: NodeInstaller,
    distUrl: 'https://nodejs.org/download/nightly',
    distMirrorUrl: 'https://npmmirror.com/mirrors/node-nightly',
  },
};
