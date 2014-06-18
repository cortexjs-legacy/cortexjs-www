var express = require('express');
var async = require('async');

var dissociator = require('dissociator');
var router = dissociator();

router.get('/package/:name', function() {

});

router.get('/package/:name', function() {

});


router.get('/:user', function(req, res) {

});

router.get('/search', function(req, res) {
  res.send('search');
});

module.exports = router.routing();