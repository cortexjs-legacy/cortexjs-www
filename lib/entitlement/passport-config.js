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

    // Passport session setup.
    //   To support persistent login sessions, Passport needs to be able to
    //   serialize users into and deserialize users out of the session.  Typically,
    //   this will be as simple as storing the user ID when serializing, and finding
    //   the user by ID when deserializing.  However, since this example does not
    //   have a database of user records, the complete GitHub profile is serialized
    //   and deserialized.
    passport.serializeUser(function(user, done) {
        return done(null, user);

        // get username which is _id in couchdb
        done(null, 'org.couchdb.user:' + user.username);
    });

    passport.deserializeUser(function(_id, done) {
        return done(null, _id);

        // get data from couchdb
        var user = {};
        done(null, user);
    });

    var strategy = new GitHubStrategy({
            clientID: config.Auth.clientID,
            clientSecret: config.Auth.clientSecret,
            callbackURL: config.Auth.callbackURL,
            scope: ['user:email']
        },
        function(accessToken, refreshToken, profile, done) {
            var user = parseGithubProfile(profile);
            user.secret = {
                accessToken: accessToken,
                refreshToken: refreshToken
            };

            var userAddress = url.resolve(config.Couch.address, '/_users/' + encodeURIComponent(user._id));
            request(userAddress, function(err, res, body) {
                if (err) return done(err);


                // create default passwd with accessToke and refershToken
                var md5 = crypto.createHash('md5');
                accessToken && md5.update(accessToken, 'utf8');
                refreshToken && md5.update(refreshToken, 'utf8');
                var gPass = md5.digest('hex');
                console.log(gPass);

                if (res.statusCode == 200) {
                    // verify the user auth
                    var p = url.parse(config.Couch.address);
                    p.auth = encodeURIComponent(user._id) + ':' + gPass;

                    console.log(url.format(p));
                    // try verify
                    request(url.format(p), function(err, res, body) {
                        if (err) return done(err);

                        console.log(err, res.statusCode, body);

                        if (res.statusCode == 401) {
                            // username is already taken or user has changed the password
                            return done(new Error("username had already been taken ,or you had changed the password or reinvoked from github by hand"));
                        } else if (res.statusCode == 200) {
                            // right password
                            return done(null, user);
                        } else {
                            return done(new Error("request to registry failed with statusCode: " + res.statusCode));
                        }
                    });
                } else if (res.statusCode == 404) {
                    // create user                    
                    user.password = gPass;

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
                        console.log(body, res.statusCode);
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
        email: profile.emails[0].value,
        github: profile.profileUrl,
        blog: profile._json.blog,
        company: profile._json.company
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