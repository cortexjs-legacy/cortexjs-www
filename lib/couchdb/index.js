var crypto = require('crypto');
var _ = require('underscore');
var couchdb = require('couch-db');
var util = require('util');

var config = require('config').Couch;

var logger = require('../logger')('couchdb');

var rewriteAddress = require('url').resolve(config.address, config.rewrite);

var DAY = 1000 * 60 * 60 * 24;

var createDB = module.exports = function(options) {
  var couch = couchdb(config.address, options);

  couch.users = couch.database('_users');

  couch.users.extend({
    existsUser: function(username, callback) {
      var id = 'org.couchdb.user:' + username;
      this.doc(id).exists(callback);
    },
    verifyUser: function(username, password, callback) {
      var id = 'org.couchdb.user:' + username;
      this.doc(id, {
        auth: {
          user: username,
          pass: password
        }
      }).open(callback);
    }
  });

  couch.bind('registry');


  couch.registry.extend({
    prolificUsers: function(age, limit, callback) {
      if (typeof limit == 'function') {
        callback = limit;
        limit = undefined;
      }

      var start = new Date(Date.now() - age - DAY);
      var startkey = [start.toISOString().substr(0, 10)];


      // read all for current
      startkey = ["0"];
      this.view('app/browseAuthorsRecent').query().groupLevel(2).startkey(startkey).exec(function(err, rows) {
        if (err) return callback(err);

        var users = [];
        var res = {};
        if (rows && rows.length) {
          users = rows.map(function(row) {
            row.key.shift();
            return row;
          }).reduce(function(set, row) {
            if (res[row.key[0]])
              res[row.key[0]].value += row.value;
            else {
              set.push(row);
              res[row.key[0]] = row;
            }
            return set;
          }, []).map(function(row) {
            return {
              name: row.key[0],
              count: row.value
            };
          }).sort(function(a, b) {
            return b.count - a.count;
          }).slice(0, limit);
        }

        callback(null, users);
      });
    },
    mostDependedUpon: function(limit, callback) {
      if (typeof limit == 'function') {
        callback = limit;
        limit = undefined;
      }

      this.view('app/dependedUpon').query().groupLevel(1).exec(function(err, rows) {
        if (err) return callback(err);

        var pkgs = [];
        if (rows && rows.length) {
          pkgs = rows.map(function(row) {
            return {
              name: row.key[0],
              count: row.value
            };
          }).sort(function(a, b) {
            return b.count - a.count;
          }).slice(0, limit || 8);
        }

        callback(null, pkgs);
      });
    },
    recentlyUpdated: function(limit, callback) {
      if (typeof limit == 'function') {
        callback = limit;
        limit = undefined;
      }

      this.view('app/browseUpdated').query().limit(limit || 8).groupLevel(2).descending(true).exec(function(err, rows) {
        if (err) return callback(err);
        var pkgs = [];
        if (rows && rows.length) {
          pkgs = rows.map(function(row) {
            return {
              name: row.key[1],
              updated: row.key[0]
            };
          });
        }

        callback(null, pkgs);
      });
    },
    findPackage: function(name, range, callback) {
      if (typeof range == 'function') {
        callback = range;
        range = undefined;
      }

      var url = rewriteAddress + '/' + name + (range ? ('/' + range) : '');
      this._get(url, function(err, body) {
        callback(err, body);
      });
    },
    browseByAuthor: function(author, callback) {
      this.view('app/browseAuthors').query().groupLevel(5).betweenKeys([author], [author, {}]).exec(function(err, rows) {
        if (err) return callback(err);
        var pkgs = [];
        if (rows && rows.length) {
          pkgs = rows.map(function(row) {
            return {
              name: row.key[1],
              description: row.key[2],
              version: row.key[4],
              modified: row.key[3]
            };
          });
        }

        callback(err, pkgs);
      });
    },
    dependents: function(name, limit, cb) {
      if (typeof limit == 'function') {
        cb = limit;
        limit = undefined;
      }

      this.view('app/dependedUpon').query().startkey([name]).endkey([name, {}])
        .limit(limit || 100).groupLevel(3)
        .exec(function(err, data) {
          if (!data) {
            logger.warn('no dependents?', name, data, limit);
            data = [];
          } else {
            data = data.map(function(row) {
              return {
                name: row.key[1],
                description: row.key[2],
                url: '/package/' + row.key[1]
              };
            });
          }

          cb(err, data);
        });
    }
  });

  require('./timeline')(couch);

  require('./download')(couch);

  return couch;
};


module.exports.createPrivate = function(username, options) {
  if (!username)
    throw new Error("username must be provided");

  var token = crypto.createHmac('sha1', config.proxySecret).update(username).digest('hex');

  options = _.extend(options || {}, {
    headers: {
      'X-Auth-CouchDB-Roles': "user",
      "X-Auth-CouchDB-UserName": username,
      "X-Auth-CouchDB-Token": token
    }
  });


  return createDB(options);
};

module.exports.regDB = createDB();