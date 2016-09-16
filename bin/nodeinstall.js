#!/usr/bin/env node

'use strict';

const co = require('co');
const path = require('path');
const program = require('commander');
const NodeInstaller = require('..').NodeInstaller;
const AlinodeInstaller = require('..').AlinodeInstaller;
const NSolidInstaller = require('..').NSolidInstaller;
const config = require('../lib/config');

const installers = {
  node: NodeInstaller,
  alinode: AlinodeInstaller,
  nsolid: NSolidInstaller,
};
const distUrls = {
  node: config.nodeDistUrl,
  alinode: config.alinodeDistUrl,
  nsolid: config.nsolidDistUrl,
};
const distMirrorUrls = {
  node: config.nodeDistUrlMirror,
  alinode: config.alinodeDistUrlMirror,
  nsolid: config.nsolidDistUrlMirror,
};

program
  .option('--install-node')
  .option('--install-alinode')
  .option('--install-nsolid')
  .option('--dist-url [url]')
  .option('--china')
  .option('--cacha')
  .parse(process.argv);

co(function* () {
  const options = getOptions();
  if (!options) {
    return;
  }

  if (program.distUrl) {
    options.distUrl = program.distUrl;
  } else {
    options.distUrl = program.china || process.env.NODEINSTALL_CHINA ?
      distMirrorUrls[options.name] : distUrls[options.name];
  }
  options.cwd = process.cwd();
  const Installer = installers[options.name];
  if (Installer) {
    const installer = new Installer(options);
    yield installer.install();
  }
}).catch(err => {
  console.error(err.stack);
});

function getOptions() {
  const names = [ 'node', 'alinode', 'nsolid' ];
  const version = program.args[0];
  if (version) {
    for (const name of names) {
      const key = `install${capFirst(name)}`;
      if (program[key]) {
        return {
          name,
          version,
        };
      }
    }
    return {
      name: 'node',
      version,
    };
  }

  let engines;
  try {
    engines = require(path.join(process.cwd(), 'package.json')).engines || {};
  } catch (e) {
    return;
  }

  for (const name of names) {
    const key = `install-${name}`;
    if (engines[key]) {
      return {
        name,
        version: engines[key],
      };
    }
  }

}

function capFirst(str) {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
}
