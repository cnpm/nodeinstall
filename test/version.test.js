'use strict';

const assert = require('power-assert');
const version = require('../lib/version');

describe('test/version.test.js', () => {

  describe('getNodeVersion', () => {
    it('should get the latest version', function* () {
      const v = yield version.getNodeVersion({
        distUrl: 'https://npm.taobao.org/mirrors/node',
      });
      assert(v, '');
    });

    it('should get the real version that match semver', function* () {
      const v = yield version.getNodeVersion({
        version: '~4.1.0',
        distUrl: 'https://npm.taobao.org/mirrors/node',
      });
      assert(v === '4.1.2');
    });

    it('should get the real version', function* () {
      const v = yield version.getNodeVersion({
        version: '4.1.0',
        distUrl: 'https://npm.taobao.org/mirrors/node',
      });
      assert(v === '4.1.0');
    });
  });

  describe('getAlinodeVersion', () => {
    it('should get the latest version', function* () {
      const v = yield version.getAlinodeVersion({
        distUrl: 'http://alinode.aliyun.com/dist/new-alinode',
      });
      assert(v, '');
    });

    it('should get the real version that match semver', function* () {
      const v = yield version.getAlinodeVersion({
        version: '~1.2.0',
        distUrl: 'http://alinode.aliyun.com/dist/new-alinode',
      });
      assert(v === '1.2.3');
    });

    it('should get the real version', function* () {
      const v = yield version.getAlinodeVersion({
        version: '1.5.6',
        distUrl: 'http://alinode.aliyun.com/dist/new-alinode',
      });
      assert(v === '1.5.6');
    });
  });
});
