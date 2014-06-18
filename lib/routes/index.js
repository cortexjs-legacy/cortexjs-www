var express = require('express');
var async = require('async');
var fs=require('fs');
var router = require('dissociator')();


router.get('/package/:name', function(req,res) {
  var pkg=JSON.parse(fs.readFileSync(__dirname+'/package-data.json'))
  res.render('package',{
    pkg:pkg,
    user:{
      name:'ltebean',
      avatarMedium:'https://secure.gravatar.com/avatar/0c63668a9481496b32642b7eb6b3af9a?s=100&amp;d=mm'
    }
  });
});




router.get('/search', function(req, res) {
  res.send('search');
});

module.exports = router;