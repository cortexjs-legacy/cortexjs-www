var _ = require('underscore');
var bunyan = require('bunyan');
var config = require('config');


module.exports = function(name) {
  if (!this.__logger) {
    return bunyan.createLogger(_.chain(config.Logger).clone().defaults({
      name: name || config.App.name
    }).value());
  }

  return this.__logger.child({
    widget_type: name
  });
};


(function processLogger() {
  var bunyanOptions = _.chain(config.Logger).clone().defaults({
    name: config.App.name
  }).value();

  if (bunyanOptions.streams) {
    // bunyan logger's bug during cluster
    bunyanOptions.streams.forEach(function(s) {
      if (s.path) {
        s.path = s.path.replace("#{process.pid}", process.pid);
      }
    });

    if (config.Logger.stdout) {
      bunyanOptions.streams.push({
        'level': 'info',
        'stream': process.stdout
      });
    }

  }
  module.exports.__logger = bunyan.createLogger(bunyanOptions);
})();