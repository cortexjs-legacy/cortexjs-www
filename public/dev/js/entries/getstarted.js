var scrollnav = require('scrollnav');
var sticky = require('sticky');



exports.init = function(){
  sticky(".aside",{top:20});
  scrollnav(".aside .anchor",".main h2",{
      activeClass:"cur",
      offsetTop:90
  });
}