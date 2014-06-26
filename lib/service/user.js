var async = require('async');
var models = require('../models');
var Packages = models.Packages;
var Users = models.Users;
var redisClient = require('../redis');
var change = require('../change');

var taggie = require('taggie').initWithRedisClient({
	client: redisClient
});

var feedie = require('feedie').initWithRedisClient({
	client: redisClient,
	maxSize: 10
});

var graph = require('user-graph').initWithRedisClient({
	client: redisClient
});



exports.addTag = function(user, tag, item, cb) {
	taggie.user(user).item(item).addTag(tag, function(err, res) {
		cb(err, res);
	})
}

exports.removeTag = function(user, tag, item, cb) {
	taggie.user(user).item(item).removeTag(tag, function(err, res) {
		cb(err, res);
	})
}

exports.loadCollections = function(user, cb) {
	var pkgs = [];
	async.waterfall([

		function loadAllPackage(done) {
			taggie.user(user).item().allItems(done)
		},
		function loadAllPackageDetail(items, done) {
			if (!items) {
				return done();
			}
			async.each(items, function(item, done) {
				Packages.load(item, 'latest', function(err, pkg) {
					pkgs.push(pkg);
					done(err);
				})
			}, function(err, res) {
				done(err)
			})
		}
	], function(err) {
		if (err) return cb(err);
		taggie.user(user).tag().allTags(function(err, tags) {
			cb(err, {
				tags: tags,
				pkgs: pkgs
			});
		})
	})
}

exports.loadCollectionsByUnitonTags = function(user, tags, cb) {
	taggie.user(user).tag(tags).itemsByUnion(function(err, items) {
		cb(err, items);
	})
}

exports.loadPackageTags = function(user, packageName, cb) {
	taggie.user(user).item(packageName).allTags(function(err, tags) {
		cb(err, tags);
	})
}

exports.follow = function(user, target, cb) {
	exports.sendFollowEvent(user, {
		action: 'follows',
		target: target
	}, function() {});
	graph.user(user).follow(target, cb);
}

exports.unfollow = function(user, target, cb) {
	graph.user(user).unfollow(target, cb);
}

exports.loadFollowInfo = function(user, me, cb) {
	async.parallel({
			followingCount: function(done) {
				graph.user(user).followingCount(done);
			},
			followersCount: function(done) {
				graph.user(user).followersCount(done);
			},
			isFollowed: function(done) {
				graph.user(user).isFollowedBy(me, done);
			}
		},
		function(err, results) {
			cb(err, results);
		});
}

var events = {}

function saveEvent(event, cb) {
	var id = Math.floor((Math.random() * 10000) + 1);
	events[id] = event;
	cb(null, id);
}

function loadEvent(eventId, cb) {
	var event = events[eventId];
	cb(null, event);
}

exports.sendPackageEvent = function(user, detail, cb) {
	saveEvent({
		user: user,
		type: 'package',
		detail: detail,
		date: new Date()
	}, function(err, eventId) {
		if (err) return cb(err);
		feedie.user(user).event(eventId).broadcast(cb);
	})
}


exports.sendFollowEvent = function(user, detail, cb) {
	saveEvent({
		user: user,
		type: 'follow',
		detail: detail,
		date: new Date()
	}, function(err, eventId) {
		if (err) return cb(err);
		feedie.user(user).event(eventId).sendTo(detail.target, cb);
	})
}

exports.loadTimeline = function(user, cb) {
	var feedList = []
	feedie.user(user).feedList(1, 100, function(err, eventIds) {
		async.map(eventIds, function(eventId, done) {
			var event = loadEvent(eventId, function(err, event) {
				if ( err || !event) {
					return done();
				}
				populateEventWithUser(event, user, done);
			})
		}, function(err, result) {
			cb(err, result);
		})
	});
}

function populateEventWithUser(event, user, cb) {
	Users.load(event.user, function(err, profile) {
		if (err) return cb(err);
		event.user = profile;
		if (event.type == 'package') {
			taggie.user(user).item(event.detail.name).allTags(function(err, tags) {
				event.detail.tags = tags;
				cb(err, event);
			})
		} else {
			cb(err, event);
		}
	})
}

// follow couchdb change
change.on('package', function(id, doc, change) {
	console.log(doc)
	var version;
	if (!doc || !doc.time) {
		return;
	}
	var modified = doc.time.modified;
	for (key in doc.time) {
		if (key == 'modified') continue;
		if (doc.time[key] == modified) {
			version = key;
			break;
		}
	}
	if (!version) {
		return;
	}
	exports.sendPackageEvent(doc.author.name, {
		action: 'update',
		name: doc.name,
		version: version
	}, function() {})
})

exports.sendPackageEvent('kael', {
	action: 'create',
	name: 'mbox',
	version: '1.0.0'
}, function() {})

exports.sendFollowEvent('villadora', {
	action: 'follows',
	target: 'ltebean'
}, function() {})

exports.sendPackageEvent('kael', {
	action: 'update',
	name: 'util',
	version: '1.0.4'
}, function() {})

exports.sendPackageEvent('kael', {
	action: 'create',
	name: 'mbox',
	version: '1.0.0'
}, function() {})

exports.sendPackageEvent('villadora', {
	action: 'update',
	name: 'jquery',
	version: '2.0.0'
}, function() {})

exports.sendFollowEvent('kael', {
	action: 'follows',
	target: 'ltebean'
}, function() {});

exports.sendPackageEvent('villadora', {
	action: 'update',
	name: 'angularjs',
	version: '1.3.0'
}, function() {})

exports.sendPackageEvent('kael', {
	action: 'create',
	name: 'json',
	version: '1.0.0'
}, function() {})

exports.sendPackageEvent('villadora', {
	action: 'update',
	name: 'zeptp',
	version: '2.1.0'
}, function() {})