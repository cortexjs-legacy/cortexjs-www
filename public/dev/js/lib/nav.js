var $ = require('zepto')

function init(){
	var nav=$('.nav');
	var searchInput=nav.find('.search-box input');
	var clearBtn=nav.find('.search-box .icon-close');
	var user=nav.find('.user');
	var dropdown=nav.find('ul.dropdown');

	searchInput.on('keydown',function(event){
		if(event.which!=13) return;
		location.href='/search?keyword=' + searchInput.val();
	});

	clearBtn.on('click',function(){
		searchInput.val('');
	});

	user.on('mouseenter',function(){
		dropdown.removeClass('hide');
	});

	user.on('mouseleave',function(event){
		console.log(event)
		if(event.y<60){
			dropdown.addClass('hide')
		}
	});

	dropdown.on('mouseleave',function(event){
		dropdown.addClass('hide');
	});
}

exports.init=init;