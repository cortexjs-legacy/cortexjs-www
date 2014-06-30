var async = require('async');
var models = require('../models');
var Packages = models.Packages;
var Users = models.Users;
var redisClient = require('../redis');
var change = require('../change');
var couchdb = require('../couchdb');
var logger = require('../logger')('service:user');

var taggie = require('taggie').initWithRedisClient({
	client: redisClient
});

var feedie = require('feedie').initWithRedisClient({
	client: redisClient,
	maxSize: 200
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

exports.loadRecommendation = function(user, cb) {
	graph.user(user).recommendation(function(err, users) {
		if (err) return cb(err);
		async.map(users, function(user, done) {
			Users.load(user, function(err, profile) {
				done(err, profile)
			});
		}, cb);
	})
}


exports.sendPackageEvent = function(user, detail, cb) {
	couchdb.regDB.timeline.save({
		user: user,
		type: 'package',
		detail: detail,
		date: new Date()
	}, function(err, rs) {
		if (err) return cb(err);

		feedie.user(user).event(rs.id).broadcast(cb);
	})
}


exports.sendFollowEvent = function(user, detail, cb) {
	couchdb.regDB.timeline.save({
		user: user,
		type: 'follow',
		detail: detail,
		date: new Date()
	}, function(err, rs) {
		if (err) return cb(err);
		feedie.user(user).event(rs.id).sendTo(detail.target, cb);
	})
}

exports.loadTimeline = function(user, cb) {
	var feedList = [];
	feedie.user(user).feedList(1, 30, function(err, eventIds) {
		couchdb.regDB.timeline.load(eventIds, function(err, events) {
			if (err) return cb(err);
			async.map(events.map(function(evt) {
				return evt.doc;
			}), function(event, done) {
				populateEventWithUser(event, user, done);
			}, cb);
		});
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

	var v = doc.versions && doc.versions[version];

	var mt = v && v.maintainers && v.maintainers[0];

	if (!mt) return;

	exports.sendPackageEvent(mt.name, {
		action: 'update',
		name: doc.name,
		version: version
	}, function(err) {
		if (err) logger.error(err);
	});
});