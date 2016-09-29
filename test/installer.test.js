'use strict';

const path = require('path');
const rimraf = require('rimraf');
const assert = require('power-assert');
const execSync = require('child_process').execSync;
const NodeInstaller = require('..').NodeInstaller;
const fixtures = path.join(__dirname, 'fixtures');
const getDistUrl = require('./utils').getDistUrl;


describe('test/installer.test.js', function() {
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

  describe('unsafeVersions', function() {

    it('should match unsafeVersions', function* () {
      cwd = path.join(fixtures, 'install-node');
      const nodeBinPath = path.join(cwd, 'node_modules/.bin/node');
      const installer = new NodeInstaller({
        cwd,
        distUrl: getDistUrl('node'),
        version: '4.1.0',
        unsafeVersions: {
          '>= 1.0.0 < 4.4.4': '4.5.0',
        },
      });
      yield installer.install();
      assert(execSync(`${nodeBinPath} -v`).toString() === 'v4.5.0\n');
    });
  });

});
