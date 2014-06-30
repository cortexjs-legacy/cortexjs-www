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

function getPkg(){
  return $('.top-area .info').html().trim();
}

tags.each(function(i,tag){
  initTag(tag);
});

addTagBtn.on('click', function() {
  tagInput.removeClass('hide');
  addTagBtn.addClass('hide');
  addTagBtn.removeClass('animated');
  tagInput.focus()
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
    data: {
      tag: tagName,
      pkg: getPkg()
    },
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


function initTag(tag){
  tag = $(tag);
  var tagName = tag.html().trim();
  var closeBtn = $('<span />').html('x').addClass('close');

  closeBtn.appendTo(tag)
  closeBtn.on('click',function(){
    $.ajax({
      type:'POST',
      url: '/api/collections/removetag',
      data: {
        tag: tagName,
        pkg: getPkg()
      },
      success: function(items) {
        tag.remove();
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
  })
  closeBtn.hide();

  tag.on('mouseenter',function(){
    closeBtn.show();
    tag.css('z-index',2).css('padding-right',25);
  }).on('mouseleave',function(){
    closeBtn.hide();
    tag.css('z-index','').css('padding-right','');;
  });
}

function addTagToList(tagName){
  var tag=$('<a/>').html(tagName).addClass('tag');

  tag.appendTo($('.tags'));
  tag.addClass('animated flipInY');

  initTag(tag);
}