var url = require('url');
var passport = require('passport');
var logger = require('../logger')('entitlement');

module.exports = function(app) {
  logger.info('registry entitlement');

  require('./passport-config')();

  app.use(passport.initialize());
  app.use(passport.session());

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
      // req.couchdb add auth login
      // 
      var redirectTo = req.redirectUrlAfterLogin || '/~';
      delete req.redirectUrlAfterLogin;
      res.redirect(redirectTo);
    });

  app.route('/logout').all(function(req, res) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
  });

  app.route('/login').get(function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect(req.redirectUrlAfterLogin || '/');
      delete req.redirectUrlAfterLogin;
    } else
      res.render('login');
  });

  app.route('/login-directly').post(function(req, res) {
    // get user from couchdb 

    var form = req.body || {};

    var username = form.username,
      password = form.password;

    if (!username || !password) {
      return res.render('login', {
        message: 'Please provide username and password'
      });
    }

    require('../couchdb').regDB.users.verifyUser(username, password, function(err, user) {
      if (err) {
        return res.render('login', {
          message: err.reason
        });
      }

      delete user.password_sha;
      delete user.salt;

      req.login(user, function() {
        res.redirect('/~');
      });
    });

  });
};


module.exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  req.redirectUrlAfterLogin = req.url;
  res.redirect('/login');
};