var gravatarUser = require('./gravatar');
var LRU = require("lru-cache");

var db = require('./db');
var cache = LRU({
  max: 500,
  maxAge: 1000 * 60 * 60 * 12 // 12 hour
});


module.exports.invalidCache = function(name, version) {
  if (!version) {
    cache.keys().forEach(function(key) {
      if (key.indexOf(name) == 0) {
        cache.del(key);
      }
    });
  } else
    cache.del(name + '@' + version);
};



module.exports.findByAuthor = function(author, callback, req) {
  db(req).registry.browseByAuthor(author, function(err, pkgs) {
    if (err) return callback(err);
    callback(null, pkgs);
  });
};

module.exports.load = function(name, range, callback, req) {
  if (typeof range == 'function') {
    req = callback;
    callback = range;
    range = undefined;
  }

  range = range || 'latest';

  var id = name + '@' + range;

  if (cache.has(id)) {
    process.nextTick(function() {
      callback(null, cache.get(id));
    });
  }

  db(req).packages.findPackage(name, range, function(err, pkg) {
    if (err) return callback(err);

    if (pkg.maitainers) {
      pkg.maitainers.forEach(function(user) {
        gravatarUser(user);
      });
    }

    // store range
    cache.set(id, pkg);

    // store version
    if (pkg.version)
      cache.set(name + '@' + pkg.version, pkg);

    callback(null, pkg);
  });
};