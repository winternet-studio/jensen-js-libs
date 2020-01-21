/*
This file contain Javascript functions related to links
Copyright © 2006-2020 WinterNet Studio, Allan Jensen (www.winternet.no). All rights reserved.
*/

(function( Jjs, $, undefined ) {

	Jjs.Link = {};
	var me = Jjs.Link;

	/**
	 * Set up event handler to call Javascript function before following the link on the clicked anchor tag (<a>)
	 *
	 * @param {string} selector - jQuery selector for anchor tags that should have this feature
	 * @param {callable} callback - Function to call before following the link. Passed one argument called `whenDone` which is a function to be called when the callback is completed.
	 * @param {object} options - Available options: none
	 * @return {void}
	 */
	me.bindActionBeforeFollowingLinks = function(selector, callback, options) {
		$('body').on('click', selector, function(ev) {  //NOTE: do it this way so that it also works for anchors that are added after the initial page setup
			var $anchor = $(this);
			aHref = $anchor.attr('href');

			// CONSIDER: should we exclude eg. like "mailto:" as well? (see https://www.w3schools.com/tags/att_a_href.asp)
			// CONSIDER: should we check for existing event handlers? (see https://stackoverflow.com/questions/14072042/how-to-check-if-element-has-click-handler)
			if (aHref && aHref.substr(0, 1) !== '#' && aHref.substr(0, 11) !== 'javascript:' && $anchor.attr('target') !== '_blank') {
				ev.preventDefault();

				callback(function() {
					window.location.href = aHref;
				});
				// console.log($(this)[0].outerHTML);
			}
		});
	};

}( window.Jjs = window.Jjs || {}, jQuery ));
