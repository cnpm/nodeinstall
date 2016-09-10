'use strict';

const urllib = require('urllib');

module.exports = function* request(url, options) {
  options = options || {};
  const retry = Number(options.retry) || 0;
  return yield _request(url, options, retry);
};

function* _request(url, options, retry) {
  try {
    return yield urllib.request(url, options);
  } catch (e) {
    if (retry > 0) {
      retry--;
      return yield _request(url, options, retry);
    }
    throw e;
  }
}
