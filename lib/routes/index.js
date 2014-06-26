var express = require('express');
var async = require('async');
var crypto = require('crypto');
var fs = require('fs');
var router = require('dissociator')();
var models = require('../models');
var async = require('async');
var userService = require('../service/user');

var Users = models.Users;
var Packages = models.Packages;
var Search = models.Search;



router.get('/', require('./home'));

router.get('/search', require('./search'));


router.get('/package/:name', function(req, res, next) {
  Packages.load(req.params.name, function(err, pkg) {
    if (err) return next(err);
    if (req.isAuthenticated()) {
      userService.loadPackageTags(req.user.name, pkg.name, function(err, tags) {
        if (err) return next(err);
        return render(tags);
      })
    } else {
      return render([]);
    }

    function render(tags) {
      res.render('package', {
        pkg: pkg,
        user: req.user,
        tags: tags
      });
    }
  });
});


router.get('/package/:name/:version', function(req, res, next) {
  Packages.load(req.params.name, req.params.version, function(err, pkg) {
    if (err) return next(err);
    res.render('package', {
      pkg: pkg,
      user: req.user
    });
  });
});


// profile signed user
router.get('/(~)', function(req, res, next) {
  if (!req.isAuthenticated() || !req.user)
    return res.render('login', {
      message: 'Please login first to view your profile'
    });

  Users.load(req.user.name, function(err, profile) {
    if (err) return next(err);

    // own profile
    if (req.session && req.session.auth) {
      var auth = req.session.auth;
      var md5 = crypto.createHash('md5');
      auth.accessToken && md5.update(auth.accessToken, 'utf8');
      profile.gPass = md5.digest('hex');
    }

    Packages.findByAuthor(profile.name, function(err, pkgs) {
      if (err) pkgs = [];
      userService.loadFollowInfo(profile.name,req.user.name, function(err, result) {
        profile.followingCount = result.followingCount;
        profile.followersCount = result.followersCount;
        profile.isFollowed=result.isFollowed;
        userService.loadTimeline(req.user.name,function(err,result){
          if (err) return next(err);
          var events=[];
          result.forEach(function(event){
            if(event) events.push(event)
          })
          res.render('timeline', {
            profile: profile,
            pkgs: pkgs,
            user: req.user,
            events:events
          });
        })
      })
    });
  });

});

// user profile
router.get('/:name(~[a-zA-Z0-9]+)', function(req, res, next) {
  var name = req.params.name;
  if (!name)
    throw new Error('Please provide user name');

  name = name.slice(1);

  Users.load(name, function(err, profile) {
    if (err) return next(err);

    if (req.isAuthenticated() && req.user) {
      if (req.user.name == name) {
        // own profile
        if (req.session && req.session.auth) {
          var auth = req.session.auth;
          var md5 = crypto.createHash('md5');
          auth.accessToken && md5.update(auth.accessToken, 'utf8');
          profile.gPass = md5.digest('hex');
        }
      }
    }

    Packages.findByAuthor(profile.name, function(err, pkgs) {
      if (err) pkgs = [];
      userService.loadFollowInfo(profile.name,req.user.name, function(err, result) {
        profile.followingCount = result.followingCount;
        profile.followersCount = result.followersCount;
        profile.isFollowed=result.isFollowed;
        res.render('user', {
          profile: profile,
          pkgs: pkgs,
          user: req.user
        });
      })
    });
  });
})


// get collections
router.get('/collections', function(req, res, next) {
  if (!req.isAuthenticated() || !req.user) {
    return res.render('login', {
      message: 'Please login first'
    });
  }

  var user = req.user.name;

  userService.loadCollections(user, function(err, result) {
    if (err) return next(err);
    if (!result.tags || result.tags.length == 0) {
      res.render('error', {
        statusCode: 'oops',
        error: 'you have not collected any package',
        user: req.user
      });

    } else {
      res.render('collections', {
        tags: result.tags,
        pkgs: result.pkgs,
        user: req.user
      });
    }

  })
});

// get items in the specified collections
router.post('/api/collections', function(req, res, next) {
  if (!req.isAuthenticated() || !req.user) {
    return res.render('login', {
      message: 'Please login first'
    });
  }
  var user = req.user.name;
  userService.loadCollectionsByUnitonTags(user, req.body, function(err, items) {
    if (err) return next(err);
    res.send(items);
  })
});

// tag a package
router.post('/api/collections/addtag', function(req, res, next) {
  if (!req.isAuthenticated() || !req.user) {
    return res.send(403);
  }
  var user = req.user.name;
  userService.addTag(user, req.body.tag, req.body.pkg, function(err, items) {
    if (err) {
      return res.send(500, err.message);
    }
    res.send(200);
  })
});

// untag a package
router.post('/api/collections/removetag', function(req, res, next) {
  if (!req.isAuthenticated() || !req.user) {
    return res.send(403);
  }
  var user = req.user.name;
  userService.removeTag(user, req.body.tag, req.body.pkg, function(err, items) {
    if (err) {
      return res.send(500, err.message);
    }
    res.send(200);
  })
});

// follow
router.post('/api/user/follow', function(req, res, next) {
  if (!req.isAuthenticated() || !req.user) {
    return res.send(403);
  }
  var user = req.user.name;
  userService.follow(user, req.body.name, function(err, items) {
    if (err) {
      return res.send(500, err.message);
    }
    res.send(200);
  })
});

// unfollow
router.post('/api/user/unfollow', function(req, res, next) {
  if (!req.isAuthenticated() || !req.user) {
    return res.send(403);
  }
  var user = req.user.name;
  userService.unfollow(user, req.body.name, function(err, items) {
    if (err) {
      return res.send(500, err.message);
    }
    res.send(200);
  })
});


router.get('/get-started', function(req, res, next) {
  fs.readFile(__dirname + '/get-started.md', 'utf8', function(err, content) {
    if (err) return next(err);
    res.render('getstarted', {
      user: req.user,
      content: require('marked')(content)
    });
  });
})


module.exports = router;