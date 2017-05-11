'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const rimraf = require('rimraf');
const coffee = require('coffee');
const execSync = require('child_process').execSync;

const tnpm = path.join(__dirname, '..', 'bin', 'tnpm.js');
const fixtures = path.join(__dirname, 'fixtures');
const nodeinstall = path.join(__dirname, '../bin/nodeinstall');

describe('test/install_node.test.js', function() {
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

  it('should install node', function* () {
    cwd = path.join(fixtures, 'install-node');
    yield coffee
      .fork(nodeinstall, [ '4.0.0' ], { cwd })
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
    assert(execSync(`${nodeBinPath} -v`).toString() === 'v4.0.0\n');
    assert(execSync(`${npmBinPath} -v`).toString() === '2.14.2\n');
  });

  it('should install noderc', function* () {
    cwd = path.join(fixtures, 'install-node');
    yield coffee
      .fork(nodeinstall, [ '--install-noderc', '6.0.0-rc.3' ], { cwd })
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
    assert(execSync(`${nodeBinPath} -v`).toString() === 'v6.0.0-rc.3\n');
  });


  it('should install node nightly', function* () {
    cwd = path.join(fixtures, 'install-node');
    yield coffee
      .fork(nodeinstall, [ '--install-nightly' ], { cwd })
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
    assert(/v\d+.\d+.\d+-nightly[a-z0-9]{18}\n/.test(execSync(`${nodeBinPath} -v`)));
  });

  it.skip('should work with rc version install-node=0.10.41-rc.1', function(done) {
    cwd = path.join(fixtures, 'node-0.10');

    coffee
    .fork(tnpm, [ 'install', '--install-node=0.10.41-rc.1' ], { cwd })
    .debug()
    .expect('code', 0)
    .expect('stdout', /node@0\.10\.41-rc\.1 installed/)
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
