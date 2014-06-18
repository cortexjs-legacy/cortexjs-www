var passport = require('passport');

module.exports = function(app) {
  require('./passport-config')();


  app.route('/auth').
    .get('/github',
      passport.authenticate('github'));
    .get('/github/callback',
      passport.authenticate('github', {
        failureRedirect: '/login'
      }),
      function(req, res) {
        res.redirect('/');
      });
};