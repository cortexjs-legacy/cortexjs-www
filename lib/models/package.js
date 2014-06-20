var gravatarUser = require('./gravatar');
var LRU = require("lru-cache");

var db = require('./db');
var cache = LRU({
  max: 500,
  maxAge: 1000 * 60 * 60 * 12 // 12 hour
});


module.exports.invalidCache = function(name, version) {
  if (!version) {
    cache.keys().forEach(function(key) {
      if (key.indexOf(name) == 0) {
        cache.del(key);
      }
    });
  } else {
    cache.del(name + '@' + version);
  }
};



module.exports.findByAuthor = function(author, callback, req) {
  db(req).registry.browseByAuthor(author, function(err, pkgs) {
    if (err) return callback(err);
    callback(null, pkgs);
  });
};

module.exports.load = function(name, range, callback, req) {
  if (typeof range == 'function') {
    req = callback;
    callback = range;
    range = undefined;
  }

  range = range || 'latest';

  var id = name + '@' + range;

  if (cache.has(id)) {
    return process.nextTick(function() {
      callback(null, cache.get(id));
    });
  }

  db(req).registry.findPackage(name, range, function(err, pkg) {
    if (err) return callback(err);

    pkg.name = name;

    pkg.author = pkg.maintainers[0];

    if (pkg.maintainers) {
      pkg.maintainers.forEach(function(user) {
        gravatarUser(user);
      });
    }

    // set license
    setLicense(pkg);

    // parse homepage
    if (pkg.homepage && typeof pkg.homepage !== 'string') {
      if (Array.isArray(pkg.homepage))
        pkg.homepage = pkg.homepage[0]
      if (typeof pkg.homepage !== 'string')
        delete pkg.homepage
    }

    db(req).registry.dependents(name, function(err, dependents) {
      if (err) {
        dependents = [];
      }

      pkg.dependents = dependents;

      // store range
      cache.set(id, pkg);

      // store version
      if (pkg.version && pkg.version != range)
        cache.set(name + '@' + pkg.version, pkg);

      callback(null, pkg);
    });
  });
};



function setLicense(info) {
  var license;

  if (info.license)
    license = info.license;
  else if (info.licenses)
    license = info.licenses;
  else if (info.licence)
    license = info.licence;
  else if (info.licences)
    license = info.licences;
  else
    return;

  info.license = {};

  if (Array.isArray(license)) license = license[0];

  if (typeof license === 'object') {
    if (license.type) info.license.name = license.type;
    if (license.name) info.license.name = license.name;
    if (license.url) info.license.url = license.url;
  }

  if (typeof license === 'string') {
    if (license.match(/(http|https)(:\/\/)/ig)) {
      info.license.url = info.license.type = license;
    } else {
      info.license.url = getOssLicenseUrlFromName(license);
      info.license.name = license;
    }
  }
}

function getOssLicenseUrlFromName(name) {
  var base = 'http://opensource.org/licenses/';

  var licenseMap = {
    'bsd': 'BSD-2-Clause',
    'mit': 'MIT',
    'x11': 'MIT',
    'mit/x11': 'MIT',
    'apache 2.0': 'Apache-2.0',
    'apache2': 'Apache-2.0',
    'apache 2': 'Apache-2.0',
    'apache-2': 'Apache-2.0',
    'apache': 'Apache-2.0',
    'gpl': 'GPL-3.0',
    'gplv3': 'GPL-3.0',
    'gplv2': 'GPL-2.0',
    'gpl3': 'GPL-3.0',
    'gpl2': 'GPL-2.0',
    'lgpl': 'LGPL-2.1',
    'lgplv2.1': 'LGPL-2.1',
    'lgplv2': 'LGPL-2.1'
  };

  return licenseMap[name.toLowerCase()] ? base + licenseMap[name.toLowerCase()] : base + name;
}