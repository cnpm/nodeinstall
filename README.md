# Nodeinstall

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/nodeinstall.svg?style=flat-square
[npm-url]: https://npmjs.org/package/nodeinstall
[travis-image]: https://img.shields.io/travis/cnpm/nodeinstall.svg?style=flat-square
[travis-url]: https://travis-ci.org/cnpm/nodeinstall
[codecov-image]: https://codecov.io/gh/cnpm/nodeinstall/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/cnpm/nodeinstall
[david-image]: https://img.shields.io/david/cnpm/nodeinstall.svg?style=flat-square
[david-url]: https://david-dm.org/cnpm/nodeinstall
[snyk-image]: https://snyk.io/test/npm/nodeinstall/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/nodeinstall
[download-image]: https://img.shields.io/npm/dm/nodeinstall.svg?style=flat-square
[download-url]: https://npmjs.org/package/nodeinstall

Another node installer that bundle node with application.

## Why

Nodeinstall is not a node version switcher, it will install node locally(in node_modules). Then you can deploy application everywhere without Node installed.

You can start application with `npm start` easily, npm will find node from `$PWD/node_modules/.bin/node`

Nodeinstall let application use the same node version in every environment(local development for production).

## Installation

```shell
$ npm install nodeinstall -g
```

## Feature

- ✔︎ Install Node to Local
- ✔︎ Support [Alinode] and [NSolid]
- ✔︎ Support RC and nighly
- ✔︎ Package Define
- ✔︎ Ignore Unsafe Versions

## Usage

Install node to node_modules

```shell
$ nodeinstall 6.0.0
$ ./node_modules/.bin/node -v
```

You can use semver range to match the real version

```shell
$ nodeinstall ^6.0.0
$ ./node_modules/.bin/node -v
```

You can also use nodeinstall to install [Alinode] or [NSolid]

```shell
$ nodeinstall --install-alinode 1.6.0
$ ./node_modules/.bin/node -p 'process.versions.alinode'
$ nodeinstall --install-nsolid 1.6.0
$ ./node_modules/.bin/node -p 'process.versions.nsolid'
```

You can define version in package.json

```json
{
  "engines": {
    "install-node": "^6.0.0"
  }
}
```

Also support

- `install-alinode` for [Alinode]
- `install-nsolid` for [NSolid]
- `install-noderc`
- `install-nightly`

**If you are in China, you can use `--china` flag to speed up.**

## API

```js
const co = require('co');
const install = require('nodeinstall').install;
co(function* () {
  yield install({
    version: '^6.0.0',
  });
});
```

### Options

#### cwd

The current directory, default is `process.cwd`.

#### version

The version that you want to install, it also can be semver range that get the right version automatically.

Version matching is based on distUrl.

#### distUrl

The url where to donwload the tarball, You can find all distUrl in [config.js](https://github.com/cnpm/nodeinstall/blob/master/lib/config.js).

#### china

Use the mirror distUrl in china for speed.

#### cache

#### unsafeVersions

The Map contains the unsafe version and the safe version.

For example, if you install 4.0.0 that is defined in unsafeVersions as an unsafe version, it will install 4.5.0 instead.

```
const unsafeVersions = {
  '>= 1.0.0 < 4.4.4': '4.5.0',
};
```

#### installNode

Install Node, it's a default options. Ignore when package define matched..

#### installNoderc

Install Node RC, ignore when package define matched.

#### installAlinode

Install Alinode, ignore when package define matched.

#### installNsolid

Install NSolid, ignore when package define matched.

#### installNightly

Install Node nightly, always be the latest version, ignore when package define matched.

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## Lisence

MIT

## Contributors

[![](https://ergatejs.implements.io/badges/contributors/cnpm/nodeinstall.svg?size=96)](https://github.com/cnpm/nodeinstall/graphs/contributors)


[Alinode]: http://alinode.aliyun.com/
[NSolid]: https://nodesource.com/products/nsolid/
