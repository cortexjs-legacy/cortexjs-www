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
    findPackage: function(name, version, callback) {
      if (typeof version == 'function') {
        callback = version;
        version = undefined;
      }

      var url = rewriteAddress + '/' + name + version ? ('/' + version) : '';
      if (!version) {
        this.request({
          url: url
        }, function(err, res, body) {
          console.log(body);
        });
      }
    }
  });

  return couch;
};


module.exports.attach = function attach(req, res, next) {
  req.couch = createDB();

  next();
};



module.exports.regDB = createDB();