var $ = require('zepto');

function tabs(selector) {
  var container=$(selector)
  var tabs = container.find('.tab');
  var panes = container.find('.tab-pane');

  tabs.each(function(i, tab) {
    $(tab).on('click', function(e) {
      activate(tabs, i);
      activate(panes, i);
    });
  })

  function activate(tabs, index) {
    tabs.each(function(i, tab) {
      if (i != index) {
        $(tab).removeClass('active');
      } else {
        $(tab).addClass('active');
      }
    });
  }
}

module.exports=tabs