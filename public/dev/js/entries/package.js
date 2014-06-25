var $ = require('zepto');
var nav = require('../lib/nav');
var tabs = require('../lib/tabs');

// init nav bar
nav.init();

// init dependency tabs
tabs('.dependency-info');

// tags
var tags = $('.tag');
var addTagBtn = $('.add-tag');
var tagInput = $('.tag-input');

addTagBtn.on('click', function() {
	tagInput.removeClass('hide');
	addTagBtn.addClass('hide');
	addTagBtn.removeClass('animated');
});

tagInput.on('keydown', function(event) {
	if (event.which != 13) return;
	var tagName = tagInput.val().trim();
	if (!tagName) {
		return;
	}
	$.ajax({
		type: 'POST',
		url: '/api/collections/addtag',
		data: JSON.stringify({
			tag:tagName,
			pkg:$('.top-area .info').html().trim()
		}),
		contentType: 'application/json',
		success: function(items) {
			addTagToList(tagName)
		},
		error: function(xhr, type) {
			console.log('error')
		},
		complete:function(){
			tagInput.val('')
			tagInput.addClass('hide');
			addTagBtn.removeClass('hide');
		}
	});
});

function addTagToList(tagName){
	var tag=$('<a/>').html(tagName).addClass('tag');
	tag.appendTo($('.tags'));
	tag.addClass('animated flipInY')
}