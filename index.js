var express = require('express');
var logger = require('logger')('app');
var util = require('util');
var _ = require('underscore');

var config = require('config');

module.exports = function() {
  var app = express();


  app.use(require('express-bunyan-logger')(_.defaults(config.Logger, {
    name: config.App.name
  })));



  app.use(require('./lib').routes);

  var _listen = app.listen;

  app.listen = function(port) {
    if (typeof port ==='number') {
      logger.info(app.get('name') || 'server' + ' is listening on port: ' + port + '...');
    } else {
      logger.info(app.get('name') || 'server' + ' started');
    }

    _listen.apply(this, arguments);
  };

  return app;
};