var LRU = require("lru-cache");
var crypto = require('crypto');
var gravatarUser = require('./gravatar');


var db = require('./db');
var cache = LRU({
  max: 500,
  maxAge: 1000 * 60 * 60 * 12 // 12 hour
});


module.exports.invalidCache = function(id) {
  cache.del(id);
};


module.exports.load = function(user, callback) {
  if (typeof user == 'string') {
    user = {
      _id: user
    };
  }

  var id = user._id;
  if (!(/^org\.couchdb\.user/.test(id))) {
    id = 'org.couchdb.user:' + id;
  }

  if (cache.has(id)) {
    return process.nextTick(function() {
      callback(null, cache.get(id));
    });
  }

  db().users.doc(id).open(function(err, user) {
    // enhance
    if (err) return callback(err);


    if (user) {
      gravatarUser(user);
      cache.set(id, user);
    }

    callback(null, user);
  });
};