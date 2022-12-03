'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const fsPromises = require('fs/promises');
const coffee = require('coffee');
const execSync = require('child_process').execSync;

const tnpm = path.join(__dirname, '..', 'bin', 'tnpm.js');
const fixtures = path.join(__dirname, 'fixtures');
const nodeinstall = path.join(__dirname, '../bin/nodeinstall');

function _trimEOL(str) {
  return str.replace('\r\n', '').replace('\n', '');
}

// specify corresponding node version and npm-cli version for env for npm.cmd
function getEnv(nodeBinPath) {
  return {
    NODE_EXE: nodeBinPath,
    NPM_PREFIX_NPM_CLI_JS: path.join(path.dirname(nodeBinPath), 'node_modules/npm/bin/npm-cli.js'),
  };
}

describe('test/install_node_win32.test.js', function() {
  let cwd = path.join(fixtures, 'install-node');
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

  it('should install node', async function() {
    cwd = path.join(fixtures, 'install-node');
    // zip file for windows provided started from nodejs 6.2.2
    await coffee
      .fork(nodeinstall, [ '6.2.2' ], { cwd })
      .debug()
      .expect('code', 0)
      .end();

    assert(fs.existsSync(path.join(cwd, 'node_modules')));
    const nodeBinPath = path.join(cwd, 'node_modules/.bin/node.exe');
    const npmBinPath = path.join(cwd, 'node_modules/.bin/npm.cmd');
    const nodeDir = path.join(cwd, 'node_modules/node');
    assert(fs.existsSync(nodeBinPath));
    assert(fs.existsSync(path.join(cwd, 'node_modules/.bin/npm.cmd')));
    assert(fs.existsSync(nodeDir));

    assert(_trimEOL(execSync(`${nodeBinPath} -v`).toString()) === 'v6.2.2');
    assert(_trimEOL(execSync(`\"${npmBinPath}\" -v`, { env: getEnv(nodeBinPath) }).toString()) === '3.9.5');
  });

  it('should install noderc', async function() {
    cwd = path.join(fixtures, 'install-node');
    await coffee
      .fork(nodeinstall, [ '--install-noderc', '6.9.2-rc.1' ], { cwd })
      .debug()
      .expect('code', 0)
      .end();

    assert(fs.existsSync(path.join(cwd, 'node_modules')));
    const nodeBinPath = path.join(cwd, 'node_modules/.bin/node.exe');
    // const npmBinPath = path.join(cwd, 'node_modules/.bin/npm.cmd');
    const nodeDir = path.join(cwd, 'node_modules/node');
    assert(fs.existsSync(nodeBinPath));
    assert(fs.existsSync(path.join(cwd, 'node_modules/.bin/npm')));
    assert(fs.existsSync(nodeDir));
    assert(_trimEOL(execSync(`${nodeBinPath} -v`).toString()) === 'v6.9.2-rc.1');
  });

  it('should install node nightly', async function() {
    cwd = path.join(fixtures, 'install-node');
    await coffee
      .fork(nodeinstall, [ '--install-nightly' ], { cwd })
      .debug()
      .expect('code', 0)
      .end();

    assert(fs.existsSync(path.join(cwd, 'node_modules')));
    const nodeBinPath = path.join(cwd, 'node_modules/.bin/node.exe');
    // const npmBinPath = path.join(cwd, 'node_modules/.bin/npm.cmd');
    const nodeDir = path.join(cwd, 'node_modules/node');
    assert(fs.existsSync(nodeBinPath));
    assert(fs.existsSync(path.join(cwd, 'node_modules/.bin/npm.cmd')));
    assert(fs.existsSync(nodeDir));

    assert(fs.existsSync(path.join(nodeDir, 'node_modules/npm/bin/npm-cli.js')));

    assert(/v\d+.\d+.\d+-nightly[a-z0-9]{18}/.test(
      _trimEOL(execSync(`${nodeBinPath} -v`).toString())
    ));
  });

  it.skip('should work with rc version install-node=0.10.41-rc.1', function(done) {
    cwd = path.join(fixtures, 'node-0.10');

    coffee
      .fork(tnpm, [ 'install', '--install-noderc=0.10.41-rc.1' ], { cwd })
      .debug()
      .expect('code', 0)
    // .expect('stdout', /node@0\.10\.41-rc\.1 installed/)
      .end(function(err) {
        assert.ifError(err);
        // package.json should exists
        const jsonFile = path.join(cwd, 'node_modules', 'node', 'package.json');
        JSON.parse(fs.readFileSync(jsonFile)).name.should.equal('node');
        done();
      });
  });

  it.skip('should work with install-node=4.3.0', function(done) {
    cwd = path.join(fixtures, 'node-4');

    coffee
      .fork(tnpm, [ 'install', '--install-node=4.3.0' ], { cwd })
      .debug()
      .expect('code', 0)
      .expect('stdout', /node@\d+\.\d+\.\d+ installed/)
      .end(function(err) {
        assert.ifError(err);
        // package.json should exists
        const jsonFile = path.join(cwd, 'node_modules', 'node', 'package.json');
        JSON.parse(fs.readFileSync(jsonFile)).name.should.equal('node');
        done();
      });
  });

  it.skip('should work with install-node=4', function(done) {
    cwd = path.join(fixtures, 'node-4');

    coffee
      .fork(tnpm, [ 'install', '--install-node=4' ], { cwd })
      .debug()
      .expect('code', 0)
      .expect('stdout', /node@\d+\.\d+\.\d+ installed/)
      .end(function(err) {
        assert.ifError(err);
        // package.json should exists
        const jsonFile = path.join(cwd, 'node_modules', 'node', 'package.json');
        JSON.parse(fs.readFileSync(jsonFile)).name.should.equal('node');
        // npm link exists on node_modules/.bin/npm
        if (process.platform === 'win32') {
          fs.existsSync(path.join(cwd, 'node_modules', '.bin', 'npm.cmd')).should.equal(true);
        } else {
          fs.existsSync(path.join(cwd, 'node_modules', '.bin', 'npm')).should.equal(true);
        }
        done();
      });
  });

  it.skip('should work with install-node=5.10', function(done) {
    cwd = path.join(fixtures, 'node-4');

    coffee
      .fork(tnpm, [ 'ii', '--install-node=5.10' ], { cwd })
      .debug()
      .expect('code', 0)
      .expect('stdout', /node@\d+\.\d+\.\d+ installed/)
      .end(function(err) {
        assert.ifError(err);
        // package.json should exists
        const jsonFile = path.join(cwd, 'node_modules', 'node', 'package.json');
        JSON.parse(fs.readFileSync(jsonFile)).name.should.equal('node');
        done();
      });
  });

  it.skip('should work with install-alinode=1.4.0', function(done) {
    cwd = path.join(fixtures, 'node-4');

    coffee
      .fork(tnpm, [ 'install', '--install-alinode=1.4.0' ], { cwd })
      .debug()
      .expect('code', 0)
      .expect('stdout', /node@\d+\.\d+\.\d+ \/ alinode@\d+\.\d+\.\d+ installed/)
      .end(function(err) {
        assert.ifError(err);
        // package.json should exists
        const jsonFile = path.join(cwd, 'node_modules', 'node', 'package.json');
        JSON.parse(fs.readFileSync(jsonFile)).name.should.equal('alinode');
        done();
      });
  });

  it.skip('should work with install-alinode=1', function(done) {
    cwd = path.join(fixtures, 'node-4');

    coffee
      .fork(tnpm, [ 'ii', '--install-alinode=1' ], { cwd })
      .debug()
      .expect('code', 0)
      .expect('stdout', /node@\d+\.\d+\.\d+ \/ alinode@\d+\.\d+\.\d+ installed/)
      .end(function(err) {
        assert.ifError(err);
        // package.json should exists
        const jsonFile = path.join(cwd, 'node_modules', 'node', 'package.json');
        JSON.parse(fs.readFileSync(jsonFile)).name.should.equal('alinode');
        done();
      });
  });

  it.skip('should install alinode-iojs: iojs-1', function(done) {
    cwd = path.join(fixtures, 'iojs-1');

    coffee
      .fork(tnpm, [ 'install' ], { cwd })
      .debug()
      .expect('code', 0)
      .end(done);
  });

  it.skip('should install alinode-iojs: iojs-2', function(done) {
    cwd = path.join(fixtures, 'iojs-2');

    coffee
      .fork(tnpm, [ 'install', '--production' ], { cwd })
      .debug()
      .expect('code', 0)
      .end(done);
  });

  it.skip('should install alinode-iojs: iojs-3', function(done) {
    cwd = path.join(fixtures, 'iojs-3');

    coffee
      .fork(tnpm, [ 'install' ], { cwd })
      .debug()
      .expect('code', 0)
      .end(done);
  });

  it.skip('should install install-node: node-4.1.1 show SECURITY tips', function(done) {
    cwd = path.join(fixtures, 'node-4.1.1-security-tips');

    coffee
      .fork(tnpm, [ 'install' ], { cwd })
      .debug()
      .expect('code', 0)
      .end(done);
  });

  it.skip('should install install-node: node-4', function(done) {
    cwd = path.join(fixtures, 'node-4');

    coffee
      .fork(tnpm, [ 'install' ], { cwd })
      .debug()
      .expect('code', 0)
      .end(done);
  });

  it.skip('should install alinode: alinode-1', function(done) {
    cwd = path.join(fixtures, 'alinode-1');

    coffee
      .fork(tnpm, [ 'install' ], { cwd })
      .debug()
      .expect('code', 0)
      .end(done);
  });

  it.skip('should install alinode: alinode-0.12.7', function(done) {
    cwd = path.join(fixtures, 'alinode-0.12.7');

    coffee
      .fork(tnpm, [ 'install' ], { cwd })
      .debug()
      .expect('code', 0)
      .end(done);
  });

  it.skip('should install alinode-iojs 2.5 from within a sub dir', function(done) {
    cwd = path.join(fixtures, 'from-within-sub-dir', 'subdir');

    coffee
      .fork(tnpm, [ 'install' ], { cwd })
      .debug()
      .expect('code', 0)
      .end(done);
  });

  // TODO: bin/npminstall 需要加判断？
  it.skip('should fail with --global option enabled', function(done) {
    cwd = path.join(fixtures, 'with-global-option');

    coffee
      .fork(tnpm, [ 'install', '--global', '--loglevel=http' ], { cwd })
      .debug()
      .notExpect('code', 0)
      .end(done);
  });

  it.skip('should install alinode-iojs wrong version', function(done) {
    cwd = path.join(fixtures, 'wrong_version');

    coffee
      .fork(tnpm, [ 'install' ], { cwd })
      .debug()
      .notExpect('code', 0)
      .end(done);
  });

  it.skip('should install alinode-iojs not exists version', function(done) {
    cwd = path.join(fixtures, 'not_exists_version');

    coffee
      .fork(tnpm, [ 'install' ], { cwd })
      .debug()
      .notExpect('code', 0)
      .end(done);
  });

  it.skip('should install install-node not exists iojs version', function(done) {
    cwd = path.join(fixtures, 'not_exist_iojs_version');

    coffee
      .fork(tnpm, [ 'install' ], { cwd })
      .debug()
      .notExpect('code', 0)
      .end(done);
  });

  it.skip('should install alinode not exists version', function(done) {
    cwd = path.join(fixtures, 'not_exists_alinode_version');

    coffee
      .fork(tnpm, [ 'install' ], { cwd })
      .debug()
      .notExpect('code', 0)
      .end(done);
  });

});
