var express = require('express');
var async = require('async');

var router = require('dissociator')();


router.get('/package/:name', function(req,res) {
	console.log('haha')
	res.send(200,'ok')
});


router.get('/:user', function(req, res) {

});

router.get('/search', function(req, res) {
  res.send('search');
});

module.exports = router;