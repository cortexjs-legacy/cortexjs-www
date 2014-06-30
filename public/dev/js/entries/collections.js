var nav = require('../lib/nav');
var $ = require('zepto');

nav.init();

var tags = $('.tag');
var all = $('.all');
var pkgs = $('.package-info');

all.on('click',function(){
  location.reload()
})

tags.on('click', function() {
  var selected = $(this).data('name');
  all.removeClass('active');
  $(this).toggleClass('active');
  var selectedTags = getSelectedTags();
  refreshItemsByTags(selectedTags);
});

function getSelectedTags() {
  if (all.hasClass('active')) {
    return null;
  }
  var selectedTags = []
  tags.each(function(i, tag) {
    var tag = $(tag);
    if (tag.hasClass('active')) {
      selectedTags.push(tag.data('name'));
    };
  });
  return selectedTags
}

function refreshItemsByTags(tags) {
  $.ajax({
    type: 'POST',
    url: '/api/collections',
    data: JSON.stringify(tags),
    contentType: 'application/json',
    success: function(items) {
      refreshPage(items);
    },
    error: function(xhr, type) {
      console.log('error')
    }
  });
}

function refreshPage(items) {
  pkgs.each(function(i, p) {
    var pkg=$(p);
    if (items.indexOf(pkg.data('name'))!=-1) {
      pkg.removeClass('hide');
    } else {
      pkg.addClass('hide')
    }
  })
}