var gravatar = require('gravatar').url;
var LRU = require("lru-cache");

var db = require('./db');
var cache = LRU({
  max: 500,
  maxAge: 1000 * 60 * 60 * 12 // 12 hour
});



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

    user && gravatarUser(user);

    console.log(user);

    callback(null, user);
  });
};


function gravatarUser(user) {
  if (!user || typeof user !== 'object') {
    return;
  }

  user.avatar = gravatar(user.email || '', {
    s: 50,
    d: 'mm'
  }, true);

  user.avatarMedium = gravatar(user.email || '', {
    s: 100,
    d: 'mm'
  }, true);

  user.avatarLarge = gravatar(user.email || '', {
    s: 496,
    d: 'mm'
  }, true);
}