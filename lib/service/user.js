var async = require('async');
var models = require('../models');
var Packages = models.Packages;
var Users = models.Users;
var redisClient = require('../redis');

var taggie = require('taggie').initWithRedisClient({
	client: redisClient
});

var feedie = require('feedie').initWithRedisClient({
	client: redisClient,
	maxSize:10
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
			isFollowed: function(done) {
				graph.user(user).isFollowedBy(me, done);
			}
		},
		function(err, results) {
			cb(err, results);
		});
}

var events = {}

exports.sendPackageEvent = function(user, event, cb) {
	var id = Math.floor((Math.random() * 10000) + 1);
	console.log(id)
	events[id] = {
		user: user,
		type: 'package',
		detail: event,
		date: new Date()
	}
	feedie.user(user).event(id).broadcast(cb);
}

exports.sendFollowEvent = function(user, event, cb) {
	var id = Math.floor((Math.random() * 10000) + 1);
	console.log(id)
	events[id] = {
		user: user,
		type: 'follow',
		detail: event,
		date: new Date()
	}
	feedie.user(user).event(id).sendTo(event.target, cb);
}

exports.loadTimeline = function(user, cb) {
	var feedList = []
	feedie.user(user).feedList(1, 100, function(err, eventIds) {
		async.map(eventIds, function(eventId, done) {
			var event = events[eventId];
			if(!event){
				return done()
			}
			Users.load(event.user, function(err, profile) {
				event.user = profile;
				done(err, event);
			})
		}, function(err, result) {
			cb(err, result);
		})
	});
}

exports.sendPackageEvent('kael',{
	action:'create',
	name:'mbox',
	version:'1.0.0'
},function(){})

exports.sendFollowEvent('villadora',{
	action:'follows',
	target:'ltebean'
},function(){})

exports.sendPackageEvent('kael',{
	action:'update',
	name:'util',
	version:'1.0.4'
},function(){})

exports.sendPackageEvent('kael',{
	action:'create',
	name:'mbox',
	version:'1.0.0'
},function(){})

exports.sendPackageEvent('villadora',{
	action:'update',
	name:'jquery',
	version:'2.0.0'
},function(){})

exports.sendFollowEvent('kael',{
	action:'follows',
	target:'ltebean'
},function(){});

exports.sendPackageEvent('villadora',{
	action:'update',
	name:'angularjs',
	version:'1.3.0'
},function(){})

exports.sendPackageEvent('kael',{
	action:'create',
	name:'json',
	version:'1.0.0'
},function(){})

exports.sendPackageEvent('villadora',{
	action:'update',
	name:'zeptp',
	version:'2.1.0'
},function(){})

