'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('power-assert');
const rimraf = require('rimraf');
const execSync = require('child_process').execSync;
const installNsolid = require('../lib/install_nsolid');
const config = require('../lib/config');

const fixtures = path.join(__dirname, 'fixtures');
const distUrl = config.nsolidDistUrl;


describe.only('test/install_nsolid.test.js', function() {
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

  it('should install-nsolid', function* () {
    cwd = path.join(fixtures, 'install-nsolid');
    yield installNsolid({
      cwd,
      distUrl,
      version: '1.3.2',
    });

    assert(fs.existsSync(path.join(cwd, 'node_modules')));
    const nodeBinPath = path.join(cwd, 'node_modules/.bin/node');
    const npmBinPath = path.join(cwd, 'node_modules/.bin/npm');
    const nodeDir = path.join(cwd, 'node_modules/node');
    assert(fs.existsSync(nodeBinPath));
    assert(fs.existsSync(path.join(cwd, 'node_modules/.bin/npm')));
    assert(fs.existsSync(nodeDir));
    assert(fs.realpathSync(nodeBinPath) === path.join(nodeDir, 'bin/nsolid'));
    assert(fs.realpathSync(npmBinPath) === path.join(nodeDir, 'lib/node_modules/npm/bin/npm-cli.js'));
    assert(execSync(`${nodeBinPath} -p 'process.versions.nsolid'`).toString() === '1.3.2\n');
    assert(execSync(`${npmBinPath} -v`).toString() === '2.15.5\n');
  });

});
