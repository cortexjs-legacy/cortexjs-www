var express = require('express');
var async = require('async');
var fs = require('fs');
var router = require('dissociator')();
var models = require('../models');

var Users = models.Users;
var Packages = models.Packages;

var user = JSON.parse(fs.readFileSync(__dirname + '/user.json'))
var pkgs = JSON.parse(fs.readFileSync(__dirname + '/package-list.json'))
var pkg = JSON.parse(fs.readFileSync(__dirname + '/package-data.json'))

router.get('/', function(req, res) {
  res.render('index', {
    user: user,
    recentlyUpdated: pkgs,
    mostDependedUpon: pkgs,
    mostStared: pkgs
  });
});


router.get('/search', function(req, res) {
  res.render('search', {
    keyword: 'commonjs',
    pkgs: pkgs,
    user: user
  });
});


router.get('/package/:name', function(req, res) {

});

router.get('/package/:name/:version', function(req, res) {
  Packages.load(req.params.name, req.params.version, function(err, pkg) {
    res.render('package', {
      pkg: pkg,
      user: req.user
    });
  });
});



// profile signed user
router.get('/(~)', function(req, res) {
  if (!req.user)
    return res.render('login', {
      message: 'Please login first to view your profile'
    });

  Users.load(req.user, function(err, user) {
    if (err) throw err;
    Packages.findByAuthor(user.name, function(err, pkgs) {
      if (err) pkgs = [];

      res.render('user', {
        profile: req.user,
        user: user,
        pkgs: pkgs
      });
    });
  }, req);
});

// user profile
router.get('/:name(~[a-zA-Z0-9]+)', function(req, res) {
  var name = req.params.name;
  if (!name)
    throw new Error('Please provide user name');

  name = name.slice(1);

  Users.load(name, function(err, user) {
    if (err) throw err;

    Packages.findByAuthor(user.name, function(err, pkgs) {
      if (err) pkgs = [];

      res.render('user', {
        profile: user,
        pkgs: pkgs,
        user: req.user
      });
    });
  });
})


module.exports = router;