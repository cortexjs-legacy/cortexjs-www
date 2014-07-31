var $ = require('zepto');
var nav = require('../lib/nav');

nav.init();


var form = $('form.sign');

// TODO: add user name, email, password validate
console.log($('input[type="username"]', form));