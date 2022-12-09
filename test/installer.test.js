'use strict';

const path = require('path');
const fsPromises = require('fs/promises');
const assert = require('assert');
const execSync = require('child_process').execSync;
const NodeInstaller = require('..').NodeInstaller;
const fixtures = path.join(__dirname, 'fixtures');
const getDistUrl = require('./utils').getDistUrl;


describe('test/installer.test.js', function() {
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

  describe('unsafeVersions', function() {

    it('should match unsafeVersions', async function() {
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
      await installer.install();
      assert(execSync(`${nodeBinPath} -v`).toString() === 'v4.5.0\n');
    });
  });

});
