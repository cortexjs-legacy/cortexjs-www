module.exports = function(req) {
  var db = req && req.couch;

  return db || require('couchdb').regDB;
};