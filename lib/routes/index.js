var express = require('express');
var async = require('async');
var fs = require('fs');
var router = require('dissociator')();
var models = require('../models');

var Users = models.Users;


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

router.get('/package/:name', function(req, res) {
  res.render('package', {
    pkg: pkg,
    user: user
  });
});

router.get('/search', function(req, res) {
  res.render('search', {
    keyword: 'commonjs',
    pkgs: pkgs,
    user: user
  });
});

router.get('/(~)', function(req, res) {
  if (!req.user)
    return res.render('login', {
      message: 'Please login first to view your profile'
    });

  Users.load(req.user, function(err, user) {
    if (err) throw err;
    res.render('user', {
      user: user,
      pkgs: []
    });
  });
});

router.get('/:name(~[a-zA-Z0-9]+)', function(req, res) {
  var name = req.params.name;
  if (!name)
    throw new Error('Please provide user name');

  name = name.slice(1);

  res.render('user', {
    user: user,
    pkgs: pkgs
  })
})


module.exports = router;