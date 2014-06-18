var express = require('express');
var async = require('async');
var fs=require('fs');
var router = require('dissociator')();


var user=JSON.parse(fs.readFileSync(__dirname+'/user.json'))
var pkgs=JSON.parse(fs.readFileSync(__dirname+'/package-list.json'))
var pkg=JSON.parse(fs.readFileSync(__dirname+'/package-data.json'))

router.get('/', function(req,res) {
  res.render('index',{
    user:user,
    recentlyUpdated:pkgs,
    mostDependedUpon:pkgs,
    mostStared:pkgs
  });
});

router.get('/package/:name', function(req,res) {
  res.render('package',{
    pkg:pkg,
    user:user
  });
});

router.get('/search', function(req,res) {
  res.render('search',{
    keyword:'commonjs',
    pkgs:pkgs,
    user:user
  });
});

router.get('/user/:name',function(req,res){
  res.render('user',{
    user:user,
    pkgs:pkgs
  })
})


module.exports = router;