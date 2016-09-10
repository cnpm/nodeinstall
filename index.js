'use strict';

const co = require('co');
exports.install = co(require('./lib/install'));
exports.installNode = co(require('./lib/install_node'));
exports.installAlinode = co(require('./lib/install_alinode'));
exports.installNsolid = co(require('./lib/install_nsolid'));
