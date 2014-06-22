var async = require('async');
var models = require('../models');

var Users = models.Users;
var Packages = models.Packages;
var Search = models.Search;


var FREQENCY = 1000 * 60;

var cache = {};


function readCache(entry) {
  if (cache[entry] && cache[entry].timestamp - Date.now() < FREQENCY) {
    return cache[entry].value;
  }
}


module.exports = function(req, res, next) {
  async.parallel({
    users: function(cb) {
      var users = readCache('usrs');
      if (users)
        return cb(null, users);

      Users.prolificUsers(1000 * 60 * 60 * 24 * 30, function(err, users) {
        if (!err) {
          // update cache
          cache.users = {
            value: users,
            timestamp: Date.now()
          };
        }

        cb(err, users);
      });
    },
    recents: function(cb) {
      var recents = readCache('recents');
      if (recents)
        return cb(null, recents);

      Packages.recentlyUpdated(function(err, recents) {
        if (!err) {
          cache.recents = {
            value: recents,
            timestamp: Date.now()
          };
        }

        cb(err, recents);
      });
    },
    mosts: function(cb) {
      var mosts = readCache('mosts');
      if (mosts)
        return cb(null, mosts);

      Packages.mostDependedUpon(function(err, mosts) {
        if (!err) {
          cache.mosts = {
            value: mosts,
            timestamp: Date.now()
          };
        }

        cb(err, mosts);
      });
    }
  }, function(err, rs) {
    if (err) return next(err);

    res.render('index', {
      user: req.user,
      recentlyUpdated: rs.recents,
      mostDependedUpon: rs.mosts,
      prolifics: rs.users
    });
  });
}