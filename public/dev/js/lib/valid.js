var $ = require('zepto');

module.exports = function(form) {
  form = $(form);

  var fields = $('input', form);
  var fvalids = fields.map(function(idx, input) {
    var name = input.val('name');
    var type = input.val('type');
    return function() {
      console.log(name, type);
    };
  });


  form.on('submit', function() {
    var errors = false;
    for (var i = 0, len = fields.length; i < len; ++i) {
      if (!fvalids[i]()) {
        errors = true;
      }
    }

    if (errors) {
      return false;
    }
  });
};