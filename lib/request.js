'use strict';

const urllib = require('urllib');

module.exports = async function request(url, options) {
  options = options || {};
  const retry = Number(options.retry) || 0;
  return await _request(url, options, retry);
};

async function _request(url, options, retry) {
  try {
    return await urllib.request(url, options);
  } catch (e) {
    if (retry > 0) {
      retry--;
      return await _request(url, options, retry);
    }
    throw e;
  }
}
