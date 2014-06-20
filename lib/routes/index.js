var express = require('express');
var async = require('async');
var crypto = require('crypto');
var fs = require('fs');
var router = require('dissociator')();
var models = require('../models');

var Users = models.Users;
var Packages = models.Packages;
var Search = models.Search;

var user = JSON.parse(fs.readFileSync(__dirname + '/user.json'))
var pkgs = JSON.parse(fs.readFileSync(__dirname + '/package-list.json'))
var pkg = JSON.parse(fs.readFileSync(__dirname + '/package-data.json'))

router.get('/', function(req, res) {



  res.render('index', {
    user: req.user,
    recentlyUpdated: pkgs,
    mostDependedUpon: pkgs,
    mostStared: pkgs
  });
});


router.get('/search', function(req, res) {
  var query = req.query || {};

  var q = query.q;
  var name = query.name;
  var keyword = query.keyword;

  if (q) {
    Search.search(q, function(err, pkgs) {
      if (err) throw err;
      res.render('search', {
        keyword: q,
        user: req.user,
        pkgs: pkgs
      });
    });
  }


  if (name && !keyword) {
    Search.searchByName(name, function(err, pkg) {
      if (err) throw err;
      res.render('search', {
        keyword: 'name:' + name,
        user: req.user,
        pkgs: pkgs
      });
    });
  }

  // view list


});


router.get('/package/:name', function(req, res) {
  Packages.load(req.params.name, function(err, pkg) {
    if (err) throw err;
    res.render('package', {
      pkg: pkg,
      ufser: req.user
    });
  });
});


router.get('/package/:name/:version', function(req, res) {
  Packages.load(req.params.name, req.params.version, function(err, pkg) {
    if (err) throw err;
    res.render('package', {
      pkg: pkg,
      user: req.user
    });
  });
});


// profile signed user
router.get('/(~)', function(req, res) {
  if (!req.isAuthenticated() || !req.user)
    return res.render('login', {
      message: 'Please login first to view your profile'
    });

  res.redirect('/~' + req.user.name);
});

// user profile
router.get('/:name(~[a-zA-Z0-9]+)', function(req, res) {
  var name = req.params.name;
  if (!name)
    throw new Error('Please provide user name');

  name = name.slice(1);

  Users.load(name, function(err, profile) {
    if (err) throw err;

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


module.exports = router;