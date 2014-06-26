#!/usr/local/env node

var sendPackageEvent = require('./lib/service/user').sendPackageEvent;

sendPackageEvent('kael', {
  action: 'create',
  name: 'mbox',
  version: '1.0.0'
}, function() {})

sendFollowEvent('villadora', {
  action: 'follows',
  target: 'ltebean'
}, function() {})

sendPackageEvent('kael', {
  action: 'update',
  name: 'util',
  version: '1.0.4'
}, function() {})

sendPackageEvent('kael', {
  action: 'create',
  name: 'mbox',
  version: '1.0.0'
}, function() {})

sendPackageEvent('villadora', {
  action: 'update',
  name: 'jquery',
  version: '2.0.0'
}, function() {})

sendFollowEvent('kael', {
  action: 'follows',
  target: 'ltebean'
}, function() {});

sendPackageEvent('villadora', {
  action: 'update',
  name: 'angularjs',
  version: '1.3.0'
}, function() {})

sendPackageEvent('kael', {
  action: 'create',
  name: 'json',
  version: '1.0.0'
}, function() {})

sendPackageEvent('villadora', {
  action: 'update',
  name: 'zeptp',
  version: '2.1.0'
}, function() {})