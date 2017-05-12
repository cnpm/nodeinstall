#!/usr/bin/env node

'use strict';

const co = require('co');
const install = require('../lib/install');
const program = require('commander');
const only = require('only');


program
  .version(require('../package.json').version)
  .usage('[options] version')
  .option('--install-node', 'install node')
  .option('--install-noderc', 'install node rc')
  .option('--install-alinode', 'install alinode')
  .option('--install-nsolid', 'install nsolid')
  .option('--install-nightly', 'install node nightly')
  .option('--dist-url [url]', 'use your own distUrl')
  .option('--china', 'using mirror of registry in china')
  .option('--no-cache', 'disable cache')
  .parse(process.argv);

if (!(program.args[0] || program.installNightly)) {
  program.help();
  process.exit(1);
}

co(function* () {
  const options = only(program, [
    'installNode',
    'installNoderc',
    'installAlinode',
    'installNsolid',
    'installNightly',
    'china',
    'cache',
    'distUrl',
  ]);
  options.version = program.args[0];
  yield install(options);
}).catch(err => {
  console.error(err.stack);
  process.exit(1);
});
