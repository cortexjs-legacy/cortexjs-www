var $ = require('zepto');

function tabs(selector) {
	var container=$(selector)
	var tabs = container.find('.tab');
	var panes = container.find('.tab-pane');

	tabs.each(function(i, tab) {
		$(tab).attr('data-tab-index', i);
		$(tab).on('click', function(e) {
			var index = $(this).attr('data-tab-index');
			activate(tabs, index);
			activate(panes, index);
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