'use strict';

const urllib = require('urllib');

module.exports = function* request(url, options) {
  options = Object.assign({}, {
    method: 'GET',
    followRedirect: true,
    dataType: 'json',
    gzip: true,
    timeout: 10000,
  }, options);
  return yield urllib.request(url, options);
};
