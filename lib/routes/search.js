var Search = require('../models').Search;

module.exports = function(req, res, next) {
  var query = req.query || {};

  var q = query.q;
  var name = query.name;
  var keyword = query.keyword;

  if (q) {
    Search.search(q, function(err, pkgs) {
      if (err) return next(err);

      res.render('search', {
        keyword: q,
        user: req.user,
        pkgs: pkgs
      });
    });
    return;
  }

  if (name && !keyword) {
    Search.searchByName(name, function(err, pkgs) {
      if (err) return next(err);
      res.render('search', {
        keyword: 'name:' + name,
        user: req.user,
        pkgs: pkgs
      });
    });
    return;
  }

  // view list
  if (keyword && !name) {
    keyword = keyword.split(',');
    Search.searchByKeyword(keyword, function(err, pkgs) {
      if (err) return next(err);
      res.render('search', {
        keyword: 'keyword:' + keyword.join(', '),
        user: req.user,
        pkgs: pkgs
      })
    });
    return;
  }

  // final
  next({
    status: 404,
    message: "Please provide at lease one search criteria"
  });

};