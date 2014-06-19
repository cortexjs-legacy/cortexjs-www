var couchdb = require('couch-db');
var config = require('config').Couch;


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

  });

  return couch;
};


module.exports.attach = function attach(req, res, next) {
  req.couch = createDB();

  next();
};



module.exports.regDB = createDB();