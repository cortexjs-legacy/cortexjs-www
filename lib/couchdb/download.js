var config = require('config').Couch;
var moment = require('moment');
var logger = require('../logger')('couchdb:downloads');
var util = require('util');

module.exports = function(couch) {
  var downloads = couch.downloads = couch.database('downloads', {
    auth: config.Timeline.auth
  });

  couch.downloads.extend({
    top: function(age, limit, cb) {
      if (typeof limit == 'function') {
        cb = limit;
        limit = undefined;
      }

      var start = moment().startOf('day').valueOf() - age;

      this.view('app/groupTime').query().startkey([start]).groupLevel(2)
        .exec(function(err, data) {
          if (!data) {
            logger.warn('no downloads?', age);
            data = [];
          }

          var agg = {};
          data.forEach(function(row) {
            var name = row.key[1];
            var val = row.value;
            agg[name] = agg[name] ? (agg[name] + val) : val;
          });

          var rs = Object.keys(agg).map(function(name) {
            return {
              name: name,
              count: agg[name]
            };
          }).sort(function(a, b) {
            return b.count - a.count;
          }).slice(0, limit);

          cb(null, rs);
        });
    },
    load: function(start, limit, cb) {
      this.view('app/downloads').query().startkey([start]).groupLevel(1)
        .exec(function(err, data) {
          if (!data) {
            logger.warn('no downloads?', start);
            data = [];
          } else {
            data = data.map(function(row) {
              return {
                name: row.key[0],
                downloads: row.value
              };
            });
          }

          cb(err, data);
        });
    },
    pick: function(keys, cb) {
      var single = !util.isArray(keys);
      keys = single ? [keys] : keys;

      this.view('app/downloads').query().keys(keys).groupLevel(1)
        .exec(function(err, data) {
          if (!data) {
            logger.warn('no downloads?', keys);
            data = [];
          } else {
            data = data.map(function(row) {
              return {
                name: row.key[0],
                downloads: row.value
              };
            });
          }

          if (!single)
            cb(err, data);
          else
            cb(err, data.length ? data[0].downloads : 0);
        });

    }
  });

  return downloads;
};
