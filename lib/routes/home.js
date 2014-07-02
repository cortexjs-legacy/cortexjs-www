var async = require('async');
var models = require('../models');

var Users = models.Users;
var Packages = models.Packages;
var Search = models.Search;
var Downloads = models.Downloads;


var FREQENCY = 1000 * 60;

var cache = {};


var change = require('../change');
change.on('package', function(id) {
  delete cache.recents;
});


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
    downloads: function(cb) {
      var downloads = readCache("downloads");
      if (downloads)
        return cb(null, downloads);

      Downloads.topWeek(8, function(err, downloads) {
        if (!err) {
          cache.downloads = {
            value: downloads,
            timestamp: Date.now()
          };
        }

        cb(err, downloads);
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
      topWeekDownloads: rs.downloads,
      recentlyUpdated: rs.recents,
      mostDependedUpon: rs.mosts,
      prolifics: rs.users
    });
  });
}