var async = require('async');
var models = require('../models');
var Packages = models.Packages;

var taggie = require('taggie').initWithRedisClient({
	client: require('../redis')
});

exports.addTag = function(user, tag, item, cb) {
	taggie.user(user).item(item).addTag(tag,function(err, res) {
		cb(err, res);
	})
}

exports.removeTag = function(user, tag, item, cb) {
	taggie.user(user).item(item).removeTag(tag,function(err, res) {
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
			if(!items){
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
		cb(err,items);
	})
}

exports.loadPackageTags = function(user, packageName, cb) {
	taggie.user(user).item(packageName).allTags(function(err, tags) {
		cb(err, tags);
	})
}