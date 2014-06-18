var express = require('express');
var async = require('async');

var routington = require('routington')
var router = routington()


router.use = function(path, middleware) {
  var nodes = router.define(path);
  nodes.forEach(function(node) {
    node.mws = node.mws || [];
    node.mws.push(middleware);
  });
};


['get', 'put', 'post', 'delete', 'head'].forEach(function(method) {
  var M = method.toUpperCase();

  router[method] = function(path, handler) {
    var nodes = router.define(path);
    nodes.forEach(function(node) {
      node[M] = node[M] || []
      node[M].push(handler)
    });
  };
});


router.get('/package/:name', function() {

});

router.get('/package/:name', function() {

});


router.get('/~:user', function(req, res) {

});

router.get('/search', function(req, res) {
  res.send('search');
});

module.exports = function dispatcher(req, res, next) {
  var match = router.match(url.parse(req.url).pathname)
  if (!match)
    return next();

  req.params = match.params;

  var node = match.node
  var mws = node.mws || [];
  var callbacks = node[req.method]
  var stacks = mws.concat(callbacks);

  if (stacks && stackslength) {
    async.series(stacks.map(function(fn) {
      return function(cb) {
        try {
          fn(req, res, cb);
        } catch (e) {
          cb(e);
        }
      }
    }), function(err) {
      next(err);
    });
  } else {
    next();
  }
};