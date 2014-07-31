var $ = require('zepto');

var nav = require('../lib/nav');

nav.init();

var container = $('.container');
var login = $('.container .login');
var signup = $('.container .signup');

$('.tosignup', login).on('click', function() {
  var currentHeight = container.height();
  container.css('height', currentHeight);
  login.addClass('animated fadeOut');

  container.animate({
    "height": currentHeight + 32
  }, 500, 'linear', function() {
    $('.message').remove(); // remove message after switch mode
    login.addClass('hide').removeClass('animted fadeOut');
    signup.removeClass('hide').addClass('animated fadeIn');
  });

  return false;
});

$('.tologin', signup).on('click', function(e) {
  var currentHeight = container.height();
  container.css('height', currentHeight);
  signup.addClass('animated fadeOut');

  container.animate({
    "height": currentHeight - 32
  }, 500, 'linear', function() {
    $('.message').remove(); // remove message after switch mode
    login.removeClass('hide').addClass('animated fadeIn');
    signup.addClass('hide').removeClass('animted fadeOut');
  });

  return false;
});