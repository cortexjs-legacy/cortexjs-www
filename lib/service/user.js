var async = require('async');
var models = require('../models');
var Packages = models.Packages;
var redisClient = require('../redis');

var taggie = require('taggie').initWithRedisClient({
	client: redisClient
});

var feedie = require('feedie').initWithRedisClient({
	client: redisClient
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
			isFollowed:function(done){
				graph.user(user).isFollowedBy(me,done);
			}
		},
		function(err, results) {
			cb(err,results);
		});
}