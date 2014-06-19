var couchdb = require('couch-db');
var config = require('config').Couch;

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
      if (typeof version == 'function') {
        callback = version;
        version = undefined;
      }

      var url = rewriteAddress + '/' + name + (range ? ('/' + range) : '');
      if (!version) {
        this._get(url, function(err, body) {
          callback(err, body);
        });
      }
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
              latest: row.key[4],
              modified: row.key[3]
            };
          });
        }

        callback(err, pkgs);
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