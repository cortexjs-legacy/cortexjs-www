var express = require('express');
var async = require('async');
var fs=require('fs');
var router = require('dissociator')();


var user=JSON.parse(fs.readFileSync(__dirname+'/user.json'))

router.get('/', function(req,res) {
  res.render('index',{
    user:user
  });
});

router.get('/package/:name', function(req,res) {
  var pkg=JSON.parse(fs.readFileSync(__dirname+'/package-data.json'))
  res.render('package',{
    pkg:pkg,
    user:user
  });
});

router.get('/search', function(req,res) {
  var result=JSON.parse(fs.readFileSync(__dirname+'/search-result.json'))
  res.render('search',{
    keyword:'commonjs',
    result:result,
    user:user
  });
});

router.get('/user/:name',function(req,res){
  var pkgs=JSON.parse(fs.readFileSync(__dirname+'/search-result.json'))
  res.render('user',{
    user:user,
    pkgs:pkgs
  })
})


module.exports = router;