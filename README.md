# cortexjs-www [![NPM version](https://badge.fury.io/js/cortexjs-www.svg)](http://badge.fury.io/js/cortexjs-www) [![Build Status](https://travis-ci.org/cortexjs/cortexjs-www.svg?branch=master)](https://travis-ci.org/cortexjs/cortexjs-www) [![Dependency Status](https://gemnasium.com/cortexjs/cortexjs-www.svg)](https://gemnasium.com/cortexjs/cortexjs-www)

Website for cortex site [ctx.io](http://ctx.io)


## Install

First, clone the repository from github:

```bash
git clone git@github.com/cortexjs/cortexjs-www
```

Before start the server, you should make should that you have service following:

* couchdb see [cortex-registry-server](http://github.com/cortexjs/cortex-registry-server) to start and init the registry server, you can use [replicate](http://npmjs.org/package/replicate)
* redis used for session and events sever
* elasticsearch install [elasticsearch-river-couchdb](https://github.com/elasticsearch/elasticsearch-river-couchdb) to sync with couchdb

Run following command to start local server:

```bash
npm start
```

## Configuration

see [developement.yml](./config/development.yml) as example.

## Licence

MIT
<!-- do not want to make nodeinit to complicated, you can edit this whenever you want. -->
