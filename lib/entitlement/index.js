var url = require('url');
var passport = require('passport');
var sanitizer = require('sanitizer');
var validator = require('validator');

var logger = require('../logger')('entitlement');
var ppsConfig = require('./passport-config');

module.exports = function(app) {
  logger.info('registry entitlement');

  ppsConfig();

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
      var redirectTo = req.redirectUrlAfterLogin || '/~';
      delete req.redirectUrlAfterLogin;
      res.redirect(redirectTo);
    });

  app.route('/logout').all(function(req, res) {
    req.session.destroy(function() {
      req.logout();
      res.redirect('/');
    });
  });


  app.route('/signup').post(function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect(req.redirectUrlAfterLogin || '/');
      delete req.redirectUrlAfterLogin;
    } else {
      var form = req.body || {};
      var username = form.signusername;
      var password = form.signpassword;
      var email = form.signemail;

      if (!username || !password || !email) {
        return res.render('error', {
          message: 'Please provide username and password'
        });
      }

      username = validator.toString(username);

      var validates = [];

      // validate
      if (username !== username.toLowerCase()) {
        validates.push({
          field: 'username',
          message: 'Name must be lower-case'
        });
      } else if (username !== encodeURIComponent(username)) {
        validates.push({
          field: 'username',
          message: 'Name cannot contain non-url-safe characters'
        });
      } else if (username.charAt(0) === '.') {
        validates.push({
          field: 'username',
          message: 'Name cannot start with .'
        });
      }

      if (!validator.isLength(password, 6)) {
        validates.push({
          field: 'password',
          message: 'Password'
        });
      }

      if (!validator.isEmail(email)) {
        validates.push({
          field: 'email',
          message: 'Email is in wrong format'
        });
      }


      if (validates.length) {
        return res.render('join', {
          signup: true,
          validates: validates,
          message: validates[0].message
        });
      }

      var user = ppsConfig.createUserDoc({
        username: username,
        password: password,
        email: email
      });


      require('../couchdb').regDB.users.newUser(user, function(err) {
        if (err) return done(err);
        req.login(user, function() {
          res.redirect('/~');
        });
      });
    }
  });

  app.route('/password').post(function(req, res) {
    if (!req.isAuthenticated())
      return res.redirect('/login');

    var form = req.body || {};
    var old_password = form.old_password;
    var password = form.password;

  });

  app.route('/login').get(function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect(req.redirectUrlAfterLogin || '/');
      delete req.redirectUrlAfterLogin;
    } else
      res.render('join');
  });

  app.route('/login-directly').post(function(req, res) {
    // get user from couchdb 

    var form = req.body || {};

    var username = form.username,
      password = form.password;

    if (!username || !password) {
      return res.render('join', {
        message: 'Please provide username and password'
      });
    }

    require('../couchdb').regDB.users.verifyUser(username, password, function(err, user) {
      if (err) {
        return res.render('join', {
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