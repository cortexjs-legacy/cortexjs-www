#!/usr/bin/env node

// replicate just enough records to be useful for testing.
// around 1000 packages, plus some known popular ones, and all

var replicate = require('replicate');
var Replicator = replicate.Replicator;
var request = require('request');
var fs = require('fs');

var crypto = require('crypto');

function hash(id) {
  return crypto.createHash('sha1').update(id).digest('hex')
}

function filterPackage(id, rev) {
  return !!(hash(id).match(/^00/) ||
    id.match(/^(request|underscore|util|async)$/))
}

// add some more once we've got the first batch
function filterPackageMore(id, rev) {
  return !!(hash(id).match(/^0/))
}

function filterUser(id, rev) {
  return id !== 'org.couchdb.user:admin'
}

var didMorePackages = false;

// replicate packages, then when we don't see any
// updates for a full second, do the users.

function replicatePackages() {
  console.error('replicate packages (around 1/256th of the registry)')
  new Replicator({
    from: 'http://couch.ctx.io/registry',
    to: 'http://admin:admin@localhost:15984/registry',
    filter: filterPackage
  }).push(function() {
    if (didMorePackages) return
    clearTimeout(morePackagesTimer)
    morePackagesTimer = setTimeout(morePackages, 1000)
  })
}

var morePackagesTimer;


// now replicate more packages.  by this time, the site has
// probably started up if you did `npm run dev`, but we can
// back-fill to get more interesting stuff.

var doneTimer;

function morePackages() {
  if (didMorePackages) return
  didMorePackages = true
  console.error('even more packages (around 1/16th of the registry)')
  new Replicator({
    from: 'http://couch.ctx.io/registry',
    to: 'http://admin:admin@localhost:15984/registry',
    filter: filterPackageMore
  }).push(function() {
    // this one we just let continue indefinitely.
  })
}

// start it going
replicatePackages()
