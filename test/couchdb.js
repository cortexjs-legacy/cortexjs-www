describe('coucdb', function() {
  var db = require('../modules/couchdb').regDB;

  describe('packages', function() {

    it('browseByAuthor', function(done) {
      db.registry.browseByAuthor('test', function(err, pkgs) {
        assert(pkgs);
        done(err);
      });
    });


    it('findPackage with latest', function(done) {
      db.registry.findPackage('domready', function(err, pkg) {
        assert(pkg);
        done(err);
      });
    });

    it('findPackage with version', function(done) {
      db.registry.findPackage('assert', '1.0.4', function(err, pkg) {
        asssert(pkg);
        done(err);
      });
    });

    it('findPackage with range', function(done) {
      db.registry.findPackage('assert', '~1.0.0', function(err, pkg) {
        asssert(pkg);
        done(err);
      });
    });

  });
});