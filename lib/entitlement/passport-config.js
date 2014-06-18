"use strict";

var express = require('express'),
    passport = require('passport'),
    util = require('util'),
    GitHubStrategy = require('passport-github').Strategy;

var config = require('config').Auth;

function getOrCreate(profile, done) {
    // user already exists

    var db = persist.create();
    db.users.get({
        email: profile.email
    }, function(err, user) {
        if (err) done(err);

        if (user) {
            if (!user.uid && !user.provider) {
                db.users.update({
                        email: profile.email
                    }, {
                        $set: {
                            uid: profile.uid,
                            provider: profile.provider,
                            name: profile.name,
                            role: user.role || Roles.READER
                        }
                    },
                    function(err, user) {
                        log.info({
                            err: err,
                            user: user
                        }, 'create user');
                        done(err, user);
                    });
            } else
                done(err, user);
        } else {
            db.users.addOrUpdate({
                uid: profile.uid,
                provider: profile.provider,
                email: profile.email,
                name: profile.name,
                role: Roles.READER // default role
            }, function(err, user) {
                log.info({
                    err: err,
                    user: user
                }, 'create user');
                done(err, user);
            });
        }
    });
};

module.exports = function() {

    // Passport session setup.
    //   To support persistent login sessions, Passport needs to be able to
    //   serialize users into and deserialize users out of the session.  Typically,
    //   this will be as simple as storing the user ID when serializing, and finding
    //   the user by ID when deserializing.  However, since this example does not
    //   have a database of user records, the complete GitHub profile is serialized
    //   and deserialized.
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    var strategy = new GitHubStrategy({
            clientID: config.clientID,
            clientSecret: config.clientSecret,
            callbackURL: config.callbackURL,
            scope: ['user:follow', 'user:email']
        },
        function(accessToken, refreshToken, profile, done) {
            // asynchronous verification, for effect...
            process.nextTick(function() {

                console.log(profile);
                // To keep the example simple, the user's GitHub profile is returned to
                // represent the logged-in user.  In a typical application, you would want
                // to associate the GitHub account with a user record in your database,
                // and return that user instead.
                return done(null, profile);
            });
        });

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