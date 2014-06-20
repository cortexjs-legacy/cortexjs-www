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



module.exports = function() {
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(_id, done) {
        require('../couchdb').regDB.users.doc(_id).open(function(err, user) {
            require('../models/gravatar')(user);
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


            var user = parseGithubProfile(profile);
            user.secret = {
                accessToken: accessToken,
                refreshToken: refreshToken
            };

            var userAddress = url.resolve(config.Couch.address, '/_users/' + encodeURIComponent(user._id));
            request(userAddress, {
                    json: true
                },
                function(err, res, body) {
                    if (err) return done(err);

                    // create default passwd with accessToke and refreshToken
                    var md5 = crypto.createHash('md5');
                    accessToken && md5.update(accessToken, 'utf8');
                    var gPass = md5.digest('hex');

                    if (res.statusCode == 200) {

                        // verify the user auth
                        var p = url.parse(config.Couch.address);
                        p.auth = encodeURIComponent(user.username) + ':' + gPass;

                        // try verify
                        request(url.format(p), function(err, res, body) {
                            if (err) return done(err);

                            if (res.statusCode == 401) {
                                // the same user
                                if (user.github == body.github) {
                                    // user has change password
                                    return strategy.res.render('/login', {
                                        message: 'You had change the password, please enter new password to login'
                                    });
                                } else {
                                    return done(new Error("username had already been taken"));
                                }
                            } else if (res.statusCode == 200) {
                                req.session.auth = {
                                    accessToken: accessToken
                                };

                                return done(null, user);
                            } else {
                                return done(new Error("request to registry failed with statusCode: " + res.statusCode));
                            }
                        });
                    } else if (res.statusCode == 404) {
                        // create user                    
                        var json = createUserDoc(_.defaults(user, {
                            password: gPass
                        }));

                        request({
                            method: 'PUT',
                            url: userAddress,
                            body: JSON.stringify(json),
                            auth: null
                        }, function(err, res, body) {
                            if (err) return done(err);
                            req.session.auth = {
                                accessToken: accessToken,
                                refershToken: refershToken
                            };
                            return done(null, user);
                        });
                    } else {
                        return done(new Error('request to registry failed with statusCode:' + res.statusCode));
                    }

                });


        });

    // use nedb to save/load association

    // strategy.saveAssociation(function(handle, provider, algorithm, secret, expiresIn, done) {
    //     persist.create().collection('openIdAssoc').insert({
    //         handle: handle,
    //         provider: provider,
    //         algorithm: algorithm,
    //         secret: secret,
    //         expiresIn: expiresIn
    //     }, function(err, assoc) {
    //         if (err) return done(err);
    //         done();
    //     });
    // });

    // strategy.loadAssociation(function(handle, done) {
    //     persist.create().collection('openIdAssoc').findOne({
    //         handle: handle
    //     }, function(err, assoc) {
    //         if (err) return done(err);
    //         console.log(assoc);
    //         return done(null, assoc.provider, assoc.algorithm, assoc.secret);
    //     });
    // });

    // use github strategy
    passport.use(strategy);
};



function sha(s) {
    return crypto.createHash("sha1").update(s).digest("hex");
};


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
};