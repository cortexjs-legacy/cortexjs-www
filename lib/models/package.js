var gravatarUser = require('./gravatar');
var moment = require('moment');
var LRU = require("lru-cache");
var sanitizer = require('sanitizer');
var marked = require('marked');
var url = require('url');

var logger = require('../logger')('models/package');

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


module.exports.mostDependedUpon = function(callback) {
  db().registry.mostDependedUpon(callback);
};

module.exports.recentlyUpdated = function(callback) {
  db().registry.recentlyUpdated(8, function(err, pkgs) {
    if (err) return callback(err);

    pkgs.forEach(function(pkg) {
      pkg.updated = moment(pkg.updated).fromNow();
    });


    callback(err, pkgs);
  });
};


module.exports.findByAuthor = function(author, callback) {
  db().registry.browseByAuthor(author, function(err, pkgs) {
    if (err) return callback(err);
    callback(null, pkgs);
  });
};

module.exports.load = function(name, range, callback) {
  if (typeof range == 'function') {
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

  db().registry.findPackage(name, range, function(err, pkg) {
    if (err) {
      if (err.statusCode == 404) {
        err.message = "Can not found package: " + name + (range ? ('@' + range) : '');
      }

      return callback(err);
    }

    pkg.name = name;

    pkg.author = pkg.maintainers[0];

    if (pkg.maintainers) {
      pkg.maintainers.forEach(function(user) {
        gravatarUser(user);
      });
    }

    // enhance readme
    if (pkg.readme) {
      pkg.readmeSrc = pkg.readme;
      pkg.readme = parseReadme(pkg);
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

    db().registry.dependents(name, function(err, dependents) {
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



function parseReadme(data) {
  var p;
  if (typeof data.readmeFilename !== 'string' ||
    (data.readmeFilename.match(/\.(m?a?r?k?d?o?w?n?)$/i) && !data.readmeFilename.match(/\.$/))) {
    // is markdown
    try {
      p = marked.parse(data.readme);
    } catch (er) {
      logger.warn(er);
      return 'error parsing readme';
    }
  } else {
    var p = data.readme
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return sanitizer.sanitizeWithPolicy(p, tagPolicy);
}

var origTagPolicy = sanitizer.makeTagPolicy(urlPolicy);

function tagPolicy(tagName, attribs) {
  if (tagName == 'img' && attribs.length) {
    var src;
    for (var i = 0; i < attribs.length; i += 2) {
      if (attribs[i] == 'src') {
        src = attribs[i + 1];
        break;
      }
    }

    if (src) {
      var u = url.parse(src);
      if (u) {
        if (u.hostname.match(/^travis-ci.org$/)) {
          var attrs = sanitizer.sanitizeAttribs(tagName, attribs, urlPolicy);
          attrs.push('src');
          attrs.push(url.format(u));

          return {
            attribs: attrs
          };
        }
      }
    }
  }
  // console.log(tagName, attribs);
  return origTagPolicy.call(this, tagName, attribs);
}


function urlPolicy(u) {
  if (!u) return null;
  if (u.protocol === 'http:' &&
    (u.hostname && u.hostname.match(/gravatar.com$/))) {
    // use encrypted gravatars                                                                                                                                
    return url.format('https://secure.gravatar.com' + u.pathname);
  }
  return url.format(u);
}



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