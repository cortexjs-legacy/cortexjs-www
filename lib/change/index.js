var follow = require('follow');
var url = require('url');
var config = require('config').Couch;
var path = require('path');
var fs = require('fs');
var util = require('util');
var logger = require('../logger')('couch-sync');

var EventEmitter = require('events').EventEmitter;


function Change() {
  EventEmitter.call(this);

  var self = this;

  follow({
    db: config.address + '/registry',
    since: 'now',
    include_docs: true
  }, function(err, change) {
    if (err) {
      logger.error(err);
    } else {

      self.emit('package', change.id, change.doc, change);
    }
  });


  var address = config.address + '/_users';
  var p = url.parse(address);
  p.auth = config.admin.user + ':' + config.admin.pass;

  // user follow
  follow({
    db: url.format(p),
    since: 'now'
  }, function(err, change) {
    if (err) {
      logger.error(err);
    } else {
      self.emit('users', change.id);
    }
  });
}


util.inherits(Change, EventEmitter);

module.exports = new Change();