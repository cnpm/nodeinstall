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
    'supertest',
    'power-assert',
    'intelli-espower-loader',
    'egg-view-nunjucks',
  ],
  exclude: [
    './test/fixtures',
  ],
};

