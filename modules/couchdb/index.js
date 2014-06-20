var couchdb = require('couch-db');
var config = require('config').Couch;

var logger = require('logger')('couchdb');

var rewriteAddress = require('url').resolve(config.address, config.rewrite);

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

  return couch;
};



module.exports.attach = function attach(req, res, next) {
  req.couch = createDB();

  next();
};

module.exports.regDB = createDB();