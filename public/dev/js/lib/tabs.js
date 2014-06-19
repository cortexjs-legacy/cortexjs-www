var $=require('zepto');

module.exports = function tabs(selector) {
	var container = $(selector);
	var tabs = container.find('.tab');
	var panes = container.find('.tab-pane');

	tabs.each(function(tab) {
		tab.on('click', function(e) {
			var target = e.target.getAttribute('data-target');
			activate(target);
		});
	})

	function activate(target) {
		tabs.each(function(i,tab) {
			if (tab.getAttribute('data-target') != target) {
				removeClass(tab, 'active')
			} else {
				addClass(tab, 'active')
			}
		});
		panes.each(function(i,pane) {
			if (pane.getAttribute('data-content') != target) {
				removeClass(pane, 'active')
			} else {
				addClass(pane, 'active')
			}
		});
	}
}