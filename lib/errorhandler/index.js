var accepts = require('accepts')
var logger = require('logger')('onerror');

var config = require('config').Error;


function errorMessage(err) {
  if (err && err.message)
    return err.message;

  if (config.showStack)
    return String(err);

  return "Internal Error";
}

exports = module.exports = function errorHandler() {
  return function errorHandler(err, req, res, next) {

    // respect err.status
    if (err.status) {
      res.statusCode = err.status
    }

    // default status code to 500
    if (res.statusCode < 400) {
      res.statusCode = 500
    }

    // write error to console
    logger.error({
      err: err,
      url: req.url
    }, String(err));

    // cannot actually respond
    if (res._header) {
      return req.socket.destroy()
    }

    // negotiate
    var accept = accepts(req)
    var type = accept.types('html', 'json', 'text')

    // Security header for content sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff')

    if (type === 'html') { // html
      var error = {
        statusCode: res.statusCode,
        error: errorMessage(err)
      };

      if (config.showStack)
        error.stack = err.stack;

      // design error page
      res.render('error', error);

    } else if (type === 'json') { // json
      var error = {
        message: errorMessage(err)
      };

      for (var prop in err) error[prop] = err[prop];

      if (!config.showStack)
        delete error.stack;

      var json = JSON.stringify({
        error: error
      });

      res.setHeader('Content-Type', 'application/json');
      res.end(json);

    } else { // plain text
      res.setHeader('Content-Type', 'text/plain');
      res.end(errorMessage(err));
    }
  };
};