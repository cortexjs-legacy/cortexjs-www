var express = require('express');
var async = require('async');
var crypto = require('crypto');
var fs = require('fs');
var router = require('dissociator')();
var models = require('../models');
var async = require('async');
var taggie = require('taggie').init({
  client: require('../redis')
});

var Users = models.Users;
var Packages = models.Packages;
var Search = models.Search;



router.get('/', require('./home'));

router.get('/search', require('./search'));


router.get('/package/:name', function(req, res, next) {
  Packages.load(req.params.name, function(err, pkg) {
    if (err) return next(err);
    res.render('package', {
      pkg: pkg,
      ufser: req.user
    });
  });
});


router.get('/package/:name/:version', function(req, res, next) {
  Packages.load(req.params.name, req.params.version, function(err, pkg) {
    if (err) return next(err);
    res.render('package', {
      pkg: pkg,
      user: req.user
    });
  });
});


// profile signed user
router.get('/(~)', function(req, res, next) {
  if (!req.isAuthenticated() || !req.user)
    return res.render('login', {
      message: 'Please login first to view your profile'
    });

  Users.load(req.user.name, function(err, profile) {
    if (err) return next(err);

    // own profile
    if (req.session && req.session.auth) {
      var auth = req.session.auth;
      var md5 = crypto.createHash('md5');
      auth.accessToken && md5.update(auth.accessToken, 'utf8');
      profile.gPass = md5.digest('hex');
    }

    Packages.findByAuthor(profile.name, function(err, pkgs) {
      if (err) pkgs = [];

      res.render('user', {
        profile: profile,
        pkgs: pkgs,
        user: req.user
      });
    });
  });

});

// user profile
router.get('/:name(~[a-zA-Z0-9]+)', function(req, res, next) {
  var name = req.params.name;
  if (!name)
    throw new Error('Please provide user name');

  name = name.slice(1);

  Users.load(name, function(err, profile) {
    if (err) return next(err);

    if (req.isAuthenticated() && req.user) {
      if (req.user.name == name) {
        // own profile
        if (req.session && req.session.auth) {
          var auth = req.session.auth;
          var md5 = crypto.createHash('md5');
          auth.accessToken && md5.update(auth.accessToken, 'utf8');
          profile.gPass = md5.digest('hex');
        }
      }
    }

    Packages.findByAuthor(profile.name, function(err, pkgs) {
      if (err) pkgs = [];

      res.render('user', {
        profile: profile,
        pkgs: pkgs,
        user: req.user
      });
    });
  });
})


// user collections
router.get('/collections', function(req, res, next) {
  if (!req.isAuthenticated() || !req.user)
    return res.render('login', {
      message: 'Please login first'
    });
  var user = req.user.name;

  var pkgs = [];

  async.waterfall([

    function loadAllPackage(done) {
      taggie.getAllItems(user, done)
    },
    function loadAllPackageDetail(items, done) {
      async.each(items, function(item, done) {
        Packages.load(item, 'latest', function(err, pkg) {
          pkgs.push(pkg);
          done();
        })
      }, function(err, res) {
        done()
      })
    }
  ], function() {
    taggie.getTags(user, function(err, tags) {
      res.render('collections', {
        tags: tags,
        pkgs: pkgs,
        user: req.user
      });
    })
  })



});


module.exports = router;