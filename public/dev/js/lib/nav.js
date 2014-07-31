var $ = require('zepto');

function init() {
  var nav = $('.nav');
  var searchInput = nav.find('.search-box input');
  var clearBtn = nav.find('.search-box .icon-close');
  var user = nav.find('.user');
  var dropdown = nav.find('ul.dropdown');


  searchInput.on('keyup', function(event) {
    if (searchInput.val().length)
      clearBtn.removeClass('hide');
    else
      clearBtn.addClass('hide');
  });

  searchInput.on('keydown', function(event) {
    if (event.which != 13) return;
    var input = searchInput.val().trim();
    if (input.indexOf(':') == -1) {
      searchByQuery(input);
    } else {
      searchByCriteria(input);
    }

  });

  clearBtn.on('click', function(e) {
    e.stopPropagation();
    searchInput.val('');
    clearBtn.addClass('hide');
  });


  user.on('mouseenter', function() {
    dropdown.removeClass('hide');
  });

  user.on('mouseleave', function(event) {
    if (event.y < 60) {
      dropdown.addClass('hide');
    }
  });

  dropdown.on('mouseleave', function(event) {
    dropdown.addClass('hide');
  });
}

function searchByQuery(input) {
  var queryString = toQueryString({
    q: input
  });
  location.href = '/search?' + queryString;
}

function searchByCriteria(input) {
  var queryObject = {};
  var field = input.split('\|');
  for (var i = field.length - 1; i >= 0; i--) {
    var query = field[i].split(':').map(function(slice) {
      return slice.trim();
    });
    //['keyword':'ajax']
    queryObject[query[0]] = query[1];
  }

  location.href = '/search?' + toQueryString(queryObject);

}

function toQueryString(obj) {
  var parts = [];
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
    }
  }
  return parts.join("&");
}

exports.init = init;