var elasticsearch = require('elasticsearch');
var gravatar = require('./gravatar');

var config = require('config').Elasticsearch;


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
      callback(err, res.hits.hits.map(function(obj) {
        var pkg = obj._source;
        pkg.author = pkg.maintainers[0];
        gravatar(pkg.author);
        return pkg;
      }));
    } else
      callback(err, []);
  });
};


module.exports.msearch = function(query, callback) {
  var body = [];

  if (query.name) {
    body.push({
      index: config.index
    });
    body.push({
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

module.exports.searchByName = function(name, callback) {
  client.search({
    index: config.index,
    body: {
      query: {
        match: {
          _id: name
        }
      }
    }
  }, function(err, res) {
    if (err) return callback(err);
    if (res && res.hits && res.hits.hits) {
      callback(err, res.hits.hits.map(function(obj) {
        var pkg = obj._source;
        pkg.author = pkg.maintainers[0];
        gravatar(pkg.author);
        return pkg;
      }));
    } else
      callback(err, []);
  });
};