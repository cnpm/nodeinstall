'use strict';

module.exports = {
  write: true,
  prefix: '^',
   test: [
     'test',
     'benchmark',
   ],
  devdep: [
    'egg-ci',
    'egg-bin',
    'autod',
    'eslint',
    'eslint-config-egg',
  ],
  exclude: [
    './test/fixtures',
  ],
  semver: [
    'egg-bin@1',
    'tar@2',
  ],
};
