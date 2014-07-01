var moment = require('moment');
var LRU = require("lru-cache");
var url = require('url');

var logger = require('../logger')('models/package');

var db = require('./db');
var cache = LRU({
  max: 100,
  maxAge: 1000 * 60 * 60 * 12 // 24 hour
});



module.exports.get = function(name, callback) {
  if (cache.has(name))
    return process.nextTick(function() {
      callback(null, cache.get(name));
    });

  db().downloads.load(name, 20, function(err, data) {
    if (err) return callback();

    var downloads;

    data.forEach(function(d) {
      cache.set(d.name, d.downloads);
      if (d.name == name)
        downloads = d.downloads;
    });

    callback(null, downloads);
  });
};


module.exports.downloads = function(names, callback) {

};