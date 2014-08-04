"use strict";

var async = require('async');
var express = require('express');
var passport = require('passport');
var _ = require('underscore');
var request = require('request');
var url = require('url');
var crypto = require('crypto');
var util = require('util');

var GitHubStrategy = require('passport-github').Strategy;
var config = require('config');

var db = require('../couchdb');

module.exports = function() {
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(_id, done) {
    var priv = db.createPrivate(_id.split(":")[1]);
    priv.users.doc(_id).open(function(err, user) {
      require('../models/gravatar')(user);
      if (user)
        user.db = priv;

      done(err, user);
    });
  });

  var strategy = new GitHubStrategy({
      clientID: config.Auth.clientID,
      clientSecret: config.Auth.clientSecret,
      callbackURL: config.Auth.callbackURL,
      passReqToCallback: true,
      scope: ['user:email']
    },
    function(req, accessToken, refreshToken, profile, done) {
      if (req.user && req.isAuthenticated()) {
        // binding github account 
        req.user.db.users.updateGithub(req.user.name, profile.profileUrl, function(err, doc) {
          done(err, req.user);
        });
        return;
      }

      var user = parseGithubProfile(profile);
      user.secret = {
        accessToken: accessToken,
        refreshToken: refreshToken
      };


      var githubUrl = profile.profileUrl;
      db.regDB.users.findByGithub(githubUrl, function(err, rs) {
        if (err) return done(err);

        if (rs.length) {
          // has binding github account
          if (rs.length > 1) {
            return done(new Error('This github account binds to more than one user: ' + user.username));
          }

          // get user
          request(url.resolve(config.Couch.address, '/_users/' + encodeURIComponent('org.couchdb.user:' + rs[0].key[1])), {
              json: true
            },
            function(err, res, body) {
              if (err) return done(err);
              body.secret = user.secret;

              var md5 = crypto.createHash('md5');
              accessToken && md5.update(accessToken, 'utf8');
              var gPass = md5.digest('hex');

              db.regDB.users.verifyUser(user.username, gPass, function(err, rs) {
                if (!err) {
                  // default password
                  req.session.auth = {
                    accessToken: accessToken
                  };
                }

                return done(null, body);
              });
            });
        } else {
          // create default passwd with accessToke and refreshToken
          // for cmd login
          var md5 = crypto.createHash('md5');
          accessToken && md5.update(accessToken, 'utf8');
          var gPass = md5.digest('hex');



          var userAddress = url.resolve(config.Couch.address, '/_users/' + encodeURIComponent('org.couchdb.user:' + user.username));

          // no user found, create user
          var json = createUserDoc(_.defaults(user, {
            password: gPass
          }));

          request({
            method: 'PUT',
            url: userAddress,
            body: JSON.stringify(json),
            auth: null,
            json: true
          }, function(err, res, body) {
            if (err) return done(err);
            if (body && body.error) {
              if (body.error == 'conflict') {
                return done("The username has already been registered.\nIf you are the owner, please binding your account with github.");
              } else
                return done(body);
            }

            req.session.auth = {
              accessToken: accessToken
            };
            return done(null, user);
          });
        }

      });
    });


  // use github strategy
  passport.use(strategy);
};



function sha(s) {
  return crypto.createHash("sha1").update(s).digest("hex");
}


function parseGithubProfile(profile) {
  return {
    _id: 'org.couchdb.user:' + profile.username,
    username: profile.username,
    displayName: profile.displayName,
    email: profile.emails[0].value,
    github: profile.profileUrl,
    blog: profile._json.blog,
    company: profile._json.company,
    location: profile._json.location
  };
}

function createUserDoc(user) {
  var salt = crypto.randomBytes(30).toString('hex');
  var username = user.username;
  var email = user.email;
  var password = user.password;

  return _.defaults({
    name: username,
    salt: salt,
    password_sha: sha(password + salt),
    email: email,
    _id: 'org.couchdb.user:' + username,
    type: 'user',
    roles: [],
    date: new Date().toISOString()
  }, user);
}


module.exports.createUserDoc = createUserDoc;