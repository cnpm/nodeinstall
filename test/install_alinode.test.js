'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('power-assert');
const rimraf = require('rimraf');
const execSync = require('child_process').execSync;
const installAlinode = require('../lib/install_alinode');
const config = require('../lib/config');

const fixtures = path.join(__dirname, 'fixtures');
const distUrl = config.alinodeDistUrlMirror;

describe('test/install_alinode.test.js', function() {
  let cwd;
  beforeEach(function() {
    if (cwd) {
      rimraf.sync(path.join(cwd, 'node_modules'));
    }
  });
  afterEach(function() {
    if (cwd) {
      rimraf.sync(path.join(cwd, 'node_modules'));
    }
  });

  it('should install-node', function* () {
    cwd = path.join(fixtures, 'install-alinode');
    yield installAlinode({
      cwd,
      distUrl,
      version: '1.4.0',
    });

    assert(fs.existsSync(path.join(cwd, 'node_modules')));
    const nodeBinPath = path.join(cwd, 'node_modules/.bin/node');
    const npmBinPath = path.join(cwd, 'node_modules/.bin/npm');
    const nodeDir = path.join(cwd, 'node_modules/node');
    assert(fs.existsSync(nodeBinPath));
    assert(fs.existsSync(path.join(cwd, 'node_modules/.bin/npm')));
    assert(fs.existsSync(nodeDir));
    assert(fs.realpathSync(nodeBinPath) === path.join(nodeDir, 'bin/node'));
    assert(fs.realpathSync(npmBinPath) === path.join(nodeDir, 'lib/node_modules/npm/bin/npm-cli.js'));
    assert(execSync(`${nodeBinPath} -p 'process.versions.alinode'`).toString() === '1.4.0\n');
    assert(execSync(`${npmBinPath} -v`).toString() === '2.14.12\n');
  });

});
