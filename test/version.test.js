'use strict';

const assert = require('power-assert');
const version = require('../lib/version');
const getDistUrl = require('./utils').getDistUrl;


describe('test/version.test.js', () => {

  describe('getNodeVersion', () => {
    const distUrl = getDistUrl('node');

    it('should get the latest version', function* () {
      const v = yield version.getNodeVersion({
        distUrl,
      });
      assert(v, '');
    });

    it('should get the real version that match semver', function* () {
      const v = yield version.getNodeVersion({
        version: '~4.1.0',
        distUrl,
      });
      assert(v === '4.1.2');
    });

    it('should get the real version', function* () {
      const v = yield version.getNodeVersion({
        version: '4.1.0',
        distUrl,
      });
      assert(v === '4.1.0');
    });
  });

  describe('getAlinodeVersion', () => {
    const distUrl = getDistUrl('alinode');

    it('should get the latest version', function* () {
      this.timeout(1000000);
      const v = yield version.getAlinodeVersion({
        distUrl,
      });
      assert(v, '');
    });

    it('should get the real version that match semver', function* () {
      this.timeout(1000000);
      const v = yield version.getAlinodeVersion({
        version: '~1.2.0',
        distUrl,
      });
      assert(v === '1.2.3');
    });

    it('should get the real version', function* () {
      this.timeout(1000000);
      const v = yield version.getAlinodeVersion({
        version: '1.5.6',
        distUrl,
      });
      assert(v === '1.5.6');
    });
  });

  describe('getSafeVersion', () => {});
});
