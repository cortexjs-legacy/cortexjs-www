var follow = require('follow');
var config = require('config').Couch
var logger = require('../logger')('couch-sync');
var path = require('path');
var fs = require('fs');
var util = require('util');

var EventEmitter = require('events').EventEmitter;


function Change() {
  EventEmitter.call(this);

  var self = this;


  follow({
    db: config.address + '/registry',
    since: 'now'
  }, function(err, change) {
    if (err) {
      logger.error(error);
    } else {
      self.emit('package', change.id);
    }
  });

  follow({
    db: config.address + '/_users',
    since: 'now'
  }, function(err, change) {
    if (err) {
      logger.error(error);
    } else {
      self.emit('users', change.id);
    }
  });
}


util.inherits(Change, EventEmitter);

module.exports = new Change();