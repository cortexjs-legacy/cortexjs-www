var express = require('express');
var logger = require('./lib/logger')('app');
var util = require('util');
var passport = require('passport');
var serveStatic = require('serve-static');
var path = require('path');
var bodyParser = require('body-parser')

var _ = require('underscore');

var config = require('config');

module.exports = function() {
  var app = express();
  app.set('views', path.join(__dirname, 'public/dev/views'));
  app.set('view engine', 'jade');

  app.locals.moment = require('moment');
  app.locals.marked = require('marked');
  app.locals.pretty = config.Server.pretty || false;

  // add logger
  app.use(require('express-bunyan-logger')(_.defaults(config.Logger, {
    name: config.App.name
  })));


  app.use(require('cookie-parser')(config.Server.secret));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());
  app.use(require('method-override')());
  app.use(require('express-session')({
    secret: config.Server.secret
  }));


  require('./lib').entitled(app);

  app.use(require('./lib').routes);

  app.use(serveStatic('public/build', {}));

  app.use(require('./lib').errorHandler());

  var _listen = app.listen;

  app.listen = function(port) {
    if (typeof port === 'number') {
      logger.info(app.get('name') || 'server' + ' is listening on port: ' + port + '...');
    } else {
      logger.info(app.get('name') || 'server' + ' started');
    }

    _listen.apply(this, arguments);
  };

  return app;
};