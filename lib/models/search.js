var elasticsearch = require('elasticsearch');
var gravatar = require('./gravatar');

var config = require('config').Elasticsearch;


var SOURCE = {
  // "include": ["vesions.*"]
  "exclude": ["readme", "dependencies", "devDependencies"]
};


var client = new elasticsearch.Client({
  host: config.address,
  apiVersion: '1.1',
  log: 'error'
});


module.exports.search = function(q, callback) {
  client.search({
    index: config.index,
    q: q
  }, function(err, res) {
    if (err) return callback(err);
    if (res && res.hits && res.hits.hits) {
      callback(err, res.hits.hits.map(pkgTrans));
    } else
      callback(err, []);
  });
};


module.exports.filterdByAuthor = function(q, author, callback) {

};

module.exports.msearch = function(query, callback) {
  var body = [];

  if (query.name) {
    body.push({
      index: config.index
    });
    body.push({
      _source: SOURCE,
      query: {
        match: {
          _id: name
        }
      }
    });
  }

  if (query.keyword) {

  }


  client.msearch({
      body: [{
        index: config.index
      }, {
        _source: SOURCE,
        query: {
          query_string: {
            query: q
          }
        }
      }]
    },
    function(err, res) {
      callback(err, res);
    });
};



module.exports.searchByKeyword = function(keywords, callback) {
  if (typeof keywords == 'string')
    keywords = [keywords];

  client.search({
    index: config.index,
    body: {
      _source: SOURCE,
      query: {
        terms: {
          "keywords": keywords
        }
      }
    }
  }, function(err, res) {
    if (err) return callback(err);
    if (res && res.hits && res.hits.hits) {
      callback(err, res.hits.hits.map(pkgTrans));
    } else
      callback(err, []);
  });
};

module.exports.searchByName = function(name, callback) {
  client.search({
    index: config.index,
    body: {
      _source: SOURCE,
      query: {
        match: {
          _id: name
        }
      }
    }
  }, function(err, res) {
    if (err) return callback(err);
    if (res && res.hits && res.hits.hits) {
      callback(err, res.hits.hits.map(pkgTrans));
    } else
      callback(err, []);
  });
};

module.exports.searchByAuthor = function(author, callback) {
  client.search({
    index: config.index,
    body: {
      query: {

      }
    }
  }, function(err, res) {

  });
};


function pkgTrans(obj) {
  var pkg = obj._source;
  pkg.author = pkg.maintainers[0];
  gravatar(pkg.author);
  pkg.version = pkg['dist-tags'].latest;
  return pkg;
}