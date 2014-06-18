var url = require('url');
var passport = require('passport');
var logger = require('logger')('entitlement');

module.exports = function(app) {
  logger.info('registry entitlement');
  require('./passport-config')();

  app.route('/auth/github')
    .get(passport.authenticate('github'),
      function(req, res) {
        // The request will be redirected to GitHub for authentication, so this
        // function will not be called.
      });

  var callbackUrl = require('config').Auth.callbackUrl;
  app.route(url.parse(callbackUrl).pathname).get(passport.authenticate('github', {
      failureRedirect: '/login'
    }),
    function(req, res) {
      res.redirect('/');
    });
};