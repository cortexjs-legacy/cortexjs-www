var gravatarUser = require('./gravatar');
var LRU = require("lru-cache");

var db = require('./db');
var cache = LRU({
  max: 500,
  maxAge: 1000 * 60 * 60 * 12 // 12 hour
});


module.exports.invalidCache = function(id) {
  cache.del(id);
};


module.exports.load = function(user, callback, req) {
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
    process.nextTick(function() {
      callback(null, cache.get(id));
    });
  }

  db(req).users.doc(id).open(function(err, user) {
    // enhance
    if (err) return callback(err);

    if (user) {
      gravatarUser(user);
      cache.set(id, user);
    }

    console.log(user);

    callback(null, user);
  });
};