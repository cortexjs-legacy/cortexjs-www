var Search = require('../../lib/models/search');

describe('model/search', function() {
  it.only('search', function(done) {
    Search.search('villadora', function(err, res) {
      console.log(res, res.length);
      done(err);
    });
  });

  it('searchByName', function(done) {
    Search.searchByName('hexrgb', function(err, res) {
      console.log(res);
      done(err);
    });
  });
});