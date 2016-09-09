'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const rimraf = require('rimraf');
const coffee = require('coffee');
const installNode = require('../lib/install_node');

const tnpm = path.join(__dirname, '..', 'bin', 'tnpm.js');
const fixtures = path.join(__dirname, 'fixtures');

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

  it.only('should install-node', function* () {
    cwd = path.join(fixtures, 'install-tnpm');
    yield installNode({
      version: '4.0.0',
      distUrl: 'https://npm.taobao.org/mirrors/node',
    });
  });

  it('should work with rc version install-node=0.10.41-rc.1', function(done) {
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

  it('should work with install-node=4.3.0', function(done) {
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

  it('should work with install-node=4', function(done) {
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

  it('should work with install-node=5.10', function(done) {
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

  it('should work with install-alinode=1.4.0', function(done) {
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

  it('should work with install-alinode=1', function(done) {
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

  it('should install alinode-iojs: iojs-1', function(done) {
    cwd = path.join(fixtures, 'iojs-1');

    coffee
    .fork(tnpm, [ 'install' ], { cwd })
    .debug()
    .expect('code', 0)
    .end(done);
  });

  it('should install alinode-iojs: iojs-2', function(done) {
    cwd = path.join(fixtures, 'iojs-2');

    coffee
    .fork(tnpm, [ 'install', '--production' ], { cwd })
    .debug()
    .expect('code', 0)
    .end(done);
  });

  it('should install alinode-iojs: iojs-3', function(done) {
    cwd = path.join(fixtures, 'iojs-3');

    coffee
    .fork(tnpm, [ 'install' ], { cwd })
    .debug()
    .expect('code', 0)
    .end(done);
  });

  it('should install install-node: node-4.1.1 show SECURITY tips', function(done) {
    cwd = path.join(fixtures, 'node-4.1.1-security-tips');

    coffee
    .fork(tnpm, [ 'install' ], { cwd })
    .debug()
    .expect('code', 0)
    .end(done);
  });

  it('should install install-node: node-4', function(done) {
    cwd = path.join(fixtures, 'node-4');

    coffee
    .fork(tnpm, [ 'install' ], { cwd })
    .debug()
    .expect('code', 0)
    .end(done);
  });

  it('should install alinode: alinode-1', function(done) {
    cwd = path.join(fixtures, 'alinode-1');

    coffee
    .fork(tnpm, [ 'install' ], { cwd })
    .debug()
    .expect('code', 0)
    .end(done);
  });

  it('should install alinode: alinode-0.12.7', function(done) {
    cwd = path.join(fixtures, 'alinode-0.12.7');

    coffee
    .fork(tnpm, [ 'install' ], { cwd })
    .debug()
    .expect('code', 0)
    .end(done);
  });

  it('should install alinode-iojs 2.5 from within a sub dir', function(done) {
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

  it('should install alinode-iojs wrong version', function(done) {
    cwd = path.join(fixtures, 'wrong_version');

    coffee
    .fork(tnpm, [ 'install' ], { cwd })
    .debug()
    .notExpect('code', 0)
    .end(done);
  });

  it('should install alinode-iojs not exists version', function(done) {
    cwd = path.join(fixtures, 'not_exists_version');

    coffee
    .fork(tnpm, [ 'install' ], { cwd })
    .debug()
    .notExpect('code', 0)
    .end(done);
  });

  it('should install install-node not exists iojs version', function(done) {
    cwd = path.join(fixtures, 'not_exist_iojs_version');

    coffee
    .fork(tnpm, [ 'install' ], { cwd })
    .debug()
    .notExpect('code', 0)
    .end(done);
  });

  it('should install alinode not exists version', function(done) {
    cwd = path.join(fixtures, 'not_exists_alinode_version');

    coffee
    .fork(tnpm, [ 'install' ], { cwd })
    .debug()
    .notExpect('code', 0)
    .end(done);
  });

});
