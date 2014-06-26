var assert = require('chai').assert;

describe('coucdb', function() {
  var db = require('../lib/couchdb').regDB;

  describe('timeline', function() {
    it('save && load', function(done) {
      db.timeline.save({
        user: 'kael',
        type: 'package',
        detail: {
          action: 'create',
          name: 'mbox',
          version: '1.0.0'
        },
        date: new Date()
      }, function(err, rs) {
        if (err) return done(err);
        db.timeline.load(rs.id, function(err, event) {
          if (!err) {
            assert.equal(event.id, rs.id);
            assert.equal(event.doc.user, 'kael');
            assert.equal(event.doc.type, 'package');
          }

          db.timeline.doc({
            _id: rs.id,
            _rev: rs.rev
          }).destroy(function(err2) {
            if (err) return done(err);
            done(err2);
          });
        });
      });
    });
  });

  describe('packages', function() {
    it('browseByAuthor', function(done) {
      db.registry.browseByAuthor('test', function(err, pkgs) {
        assert(pkgs);
        done(err);
      });
    });


    it('findPackage with latest', function(done) {
      db.registry.findPackage('assert', function(err, pkg) {
        assert(pkg);
        done(err);
      });
    });

    it('findPackage with version', function(done) {
      db.registry.findPackage('assert', '1.0.4', function(err, pkg) {
        assert(pkg);
        done(err);
      });
    });

    it('findPackage with range', function(done) {
      db.registry.findPackage('assert', '~1.0.0', function(err, pkg) {
        assert(pkg);
        done(err);
      });
    });

  });
});