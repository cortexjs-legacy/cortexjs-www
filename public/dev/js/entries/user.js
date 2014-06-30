var nav = require('../lib/nav');
var $ = require('zepto');

var ZeroClipboard = require('zeroclipboard');

var client = new ZeroClipboard($(".copy-button"));

client.on('ready', function(event) {

  client.on('aftercopy', function(event) {
    alert('Copied to clipboard');
  });
});


nav.init();
var followBtn = $('.btn-follow');
var user = followBtn.data('user');
var followed = followBtn.data('followed');
var followers = $('.followers');

followBtn.on('click', function() {
  if (followBtn.data('followed') == 0) {
    follow()
  } else {
    unfollow();
  }
})

function follow() {
  $.ajax({
    type: 'POST',
    url: '/api/user/follow',
    data: JSON.stringify({
      name: followBtn.data('user')
    }),
    contentType: 'application/json',
    success: function() {
      followBtn.html('UNFOLLOW')
      followBtn.data('followed', '1');
      followers.html(Number.parseInt(followers.html()) + 1);
    },
    error: function(xhr, type) {
      console.log('error')
    },
    complete: function() {

    }
  });

}

function unfollow() {
  $.ajax({
    type: 'POST',
    url: '/api/user/unfollow',
    data: JSON.stringify({
      name: followBtn.data('user')
    }),
    contentType: 'application/json',
    success: function() {
      followBtn.html('FOLLOW')
      followBtn.data('followed', '0')
      followers.html(Number.parseInt(followers.html()) - 1);
    },
    error: function(xhr, type) {
      console.log('error')
    },
    complete: function() {

    }
  });

}