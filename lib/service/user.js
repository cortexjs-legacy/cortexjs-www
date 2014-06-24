var async = require('async');
var models = require('../models');
var Packages = models.Packages;

var taggie = require('taggie').init({
	client: require('../redis')
});



exports.addTag = function(user, tag, item, cb) {
	taggie.tag(user, tag, item, function(err, res) {
		cb(err, res);
	})
}

exports.removeTag = function(user, tag, item, cb) {
	taggie.untag(user, tag, item, function(err, res) {
		cb(err, res);
	})
}

exports.loadCollections = function(user, cb) {
	var pkgs = [];
	async.waterfall([

		function loadAllPackage(done) {
			taggie.getAllItems(user, done)
		},
		function loadAllPackageDetail(items, done) {
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
		taggie.getTags(user, function(err, tags) {
			cb(err, {
				tags: tags,
				pkgs: pkgs
			});
		})
	})
}

exports.loadCollectionsByUnitonTags = function(user, tags, cb) {
	taggie.getItemsByUnionTags(user, tags, function(err, items) {
		cb(err,items);
	})
}

exports.loadPackageTags = function(user, packageName, cb) {
	taggie.getItemTags(user, packageName, function(err, tags) {
		cb(err, tags);
	})
}