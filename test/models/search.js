var Search = require('../../lib/models/search');

describe('model/search', function() {

  it('search', function(done) {
    Search.search('villadora', function(err, res) {
      console.log(res, res.length);
      done(err);
    });
  });


  it.only('searchByKeyword', function(done) {
    Search.searchByKeyword(['fx', 'color'], function(err, res) {
      console.log(err, res[0].versions);
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