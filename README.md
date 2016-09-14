# Nodeinstall

Another node installer that bundle node with application.

## Why

Nodeinstall is not a node version switcher, it will install node locally(in node_modules). Then you can deploy it everywhere without Node installed.

```
PATH=./node_modules/.bin:$PATH npm start
```

Nodeinstall let application use the same node version in every environment.

## Installation

```shell
$ npm install nodeinstall -g
```

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

You can also use nodeinstall to install Alinode or NSolid

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

Use `install-alinode` to install Alinode and `install-nsolid` to install NSolid.

**If you are in China, you can use `--china` flag to speed up.**

## API

### installNode

Install Node.js, you can use [Options](#options).

```
const co = require('co');
const installNode = require('nodeinstall').installNode;
co(function* () {
  yield installNode({
    version: '^6.0.0',
  });
});
```

### installAlinode

Install Alinode, you can use [Options](#options).

```
const co = require('co');
const installNode = require('nodeinstall').installNode;
co(function* () {
  yield installNode({
    version: '^6.0.0',
  });
});
```

### installNSolid

Install NSolid, you can use [Options](#options).

```
const co = require('co');
const installNode = require('nodeinstall').installNode;
co(function* () {
  yield installNode({
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

The url where to donwload the tarball, You can find all distUrl in [config.js]().

#### unsafeVersions

The Map contains the unsafe version and the safe version.

For example, if you install 4.0.0 that is defined in unsafeVersions as an unsafe version, it will install 4.5.0 instead.

```
const unsafeVersions = {
  '>= 1.0.0 < 4.4.4': '4.5.0',
};
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## Lisence

MIT
