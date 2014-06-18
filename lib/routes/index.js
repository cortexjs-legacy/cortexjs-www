var express = require('express');
var async = require('async');
var fs=require('fs');
var router = require('dissociator')();


router.get('/package/:name', function(req,res) {
  var pkg=JSON.parse(fs.readFileSync(__dirname+'/package-data.json'))
  res.render('package',{
    pkg:pkg
  });
});




router.get('/search', function(req, res) {
  res.send('search');
});

module.exports = router;