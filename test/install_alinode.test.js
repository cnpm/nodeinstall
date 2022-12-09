'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const fsPromises = require('fs/promises');
const execSync = require('child_process').execSync;
const coffee = require('coffee');
const nodeinstall = path.join(__dirname, '../bin/nodeinstall');


const fixtures = path.join(__dirname, 'fixtures');

describe.skip('test/install_alinode.test.js', function() {
  let cwd;
  beforeEach(async function() {
    if (cwd) {
      await fsPromises.rm(path.join(cwd, 'node_modules'), { recursive: true, force: true });
    }
  });
  afterEach(async function() {
    if (cwd) {
      await fsPromises.rm(path.join(cwd, 'node_modules'), { recursive: true, force: true });
    }
  });

  it('should install alinode', async function() {
    this.timeout(1000000);

    cwd = path.join(fixtures, 'install-alinode');

    await coffee
      .fork(nodeinstall, [ '--install-alinode', '1.4.0' ], { cwd })
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
    assert(fs.realpathSync(nodeBinPath) === path.join(nodeDir, 'bin/node'));
    assert(fs.realpathSync(npmBinPath) === path.join(nodeDir, 'lib/node_modules/npm/bin/npm-cli.js'));
    assert(execSync(`${nodeBinPath} -p 'process.versions.alinode'`).toString() === '1.4.0\n');
    assert(execSync(`${npmBinPath} -v`).toString() === '2.14.12\n');
  });

});
