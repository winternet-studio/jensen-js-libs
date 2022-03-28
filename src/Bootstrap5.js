/**
 * Bootstrap 5 related methods
 *
 * For the purpose of using simple pure Javascript features without having to deal with DOM.
 *
 * @copyright 2006-2018 WinterNet Studio, Allan Jensen (www.winternet.no). All rights reserved.
 */

(function( Jjs, $, undefined ) {

	Jjs.Bootstrap5 = {};
	var me = Jjs.Bootstrap5;

	me.Toast = {
		show: function(message) {
			var $toast = $('#ws-bt5-toast');
			if ($toast.length == 0) {
				$toast = $('<div>').addClass('toast show  position-absolute top-50 start-50 translate-middle').attr('data-bs-delay', 2000).append(
					$('<div>').addClass('toast-header')
					.append(
						$('<strong>').addClass('me-auto').html('Information')
					)
					.append(
						$('<small>').html('')  //text could be added here
					)
					.append(
						$('<button>').attr({type: 'button', 'data-bs-dismiss': 'toast'}).addClass('btn-close')
					)
				).append(
					$('<div>').addClass('toast-body').html(message)
				);

				$('body').append($toast);
			}
			var t = new bootstrap.Toast($toast[0]);
		},
	};

}( window.Jjs = window.Jjs || {}, jQuery ));
