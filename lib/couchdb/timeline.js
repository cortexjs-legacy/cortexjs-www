var config = require('config').Couch;
var logger = require('../logger')('couchdb:timeline');
var util = require('util');

module.exports = function(couch) {

  var timeline = couch.timeline = couch.database(config.Timeline.database, {
    auth: config.Timeline.auth
  });

  couch.timeline.extend({
    load: function(ids, callback) {
      var single = !util.isArray(ids);
      ids = single ? [ids] : ids;

      if (ids && ids.length) {
        this.mfetch(ids, function(err, results) {
          if (err) return callback(err);

          if (single) callback(null, results[0]);
          else callback(null, results.map(function(rs) {
            return rs;
          }));
        });
      } else
        callback(null, []);
    },
    save: function(events, callback) {
      var single = !util.isArray(events);
      events = single ? [events] : events;
      this.bulkSave(events, function(err, results) {
        if (err) return callback(err);
        if (single) callback(null, results[0]);
        else callback(null, results);
      });
    }
  });

  return timeline;
};