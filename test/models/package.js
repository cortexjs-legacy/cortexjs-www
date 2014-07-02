var Packages = require('../../lib/models/package');
var moment = require('moment');

describe('model/package', function() {
	it('recentlyUpdated', function(done) {
		Packages.recentlyUpdated(function(err, pkgs) {
			console.log(err, pkgs.map(function(pkg) {
				pkg.updated = moment(pkg.updated).fromNow();
				return pkg;
			}));

			done(err);
		});
	});
});