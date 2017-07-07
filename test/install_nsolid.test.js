'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const rimraf = require('mz-modules/rimraf');
const execSync = require('child_process').execSync;
const coffee = require('coffee');

const fixtures = path.join(__dirname, 'fixtures');
const nodeinstall = path.join(__dirname, '../bin/nodeinstall');


describe('test/install_nsolid.test.js', function() {
  // don't support Windows
  if (process.platform === 'win32') return;

  let cwd;
  beforeEach(function* () {
    if (cwd) yield rimraf(path.join(cwd, 'node_modules'));
  });
  afterEach(function* () {
    if (cwd) yield rimraf(path.join(cwd, 'node_modules'));
  });

  it('should install-nsolid', function* () {
    cwd = path.join(fixtures, 'install-nsolid');

    yield coffee
      .fork(nodeinstall, [ '--install-nsolid', '1.3.2' ], { cwd })
      .debug()
      .expect('code', 0)
      .end();

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
