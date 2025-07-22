jQuery(document).ready(function($) {
	$('#swis_cache').on('click', function() {
		if($(this).prop('checked')) {
			$('#swis_cache_expires_container').show();
			$('#swis_cache_webp_container').show();
			$('#swis_cache_exclusions_container').show();
		} else {
			$('#swis_cache_expires_container').hide();
			$('#swis_cache_webp_container').hide();
			$('#swis_cache_exclusions_container').hide();
		}
	});
	$('#swis_defer_css').on('click', function() {
		if($(this).prop('checked')) {
			$('#swis_defer_css_exclude_container').show();
		} else {
			$('#swis_defer_css_exclude_container').hide();
		}
	});
	$('#swis_minify_css').on('click', function() {
		if($(this).prop('checked')) {
			$('#swis_minify_css_exclude_container').show();
		} else {
			$('#swis_minify_css_exclude_container').hide();
		}
	});
	$('#swis_defer_js').on('click', function() {
		if($(this).prop('checked')) {
			$('#swis_defer_js_exclude_container').show();
		} else {
			$('#swis_defer_js_exclude_container').hide();
		}
	});
	$('#swis_minify_js').on('click', function() {
		if($(this).prop('checked')) {
			$('#swis_minify_js_exclude_container').show();
		} else {
			$('#swis_minify_js_exclude_container').hide();
		}
	});
	$('#swis_optimize_fonts').on('click', function() {
		if($(this).prop('checked')) {
			$('#swis_optimize_fonts_css_container').show();
			$('#swis_optimize_fonts_list_container').show();
		} else {
			$('#swis_optimize_fonts_css_container').hide();
			$('#swis_optimize_fonts_list_container').hide();
		}
	});
	$('#swis-copy-debug').on('click', function() {
		selectText('swis-debug-info');
		try {
			var successful = document.execCommand('copy');
			if ( successful ) {
				$('#swis-copy-debug-success').show().delay(1000).fadeOut(1000);
				unselectText();
			}
		} catch(err) {
			$('#swis-copy-debug-fail').show();
			console.log('browser cannot copy');
			console.log(err);
		}
	});
	if (typeof(Beacon) !== 'undefined' ) {
		Beacon( 'on', 'ready', function() {
			$('.swis-docs-overrides').on('click', function() {
				event.preventDefault();
				Beacon('article', '5f5266d546e0fb00179ed25f', { type: 'modal' });
			});
			$('.swis-docs-root').on('click', function() {
				event.preventDefault();
				Beacon('navigate', '/answers/')
				Beacon('open');
			});
			$('.swis-contact-link').on('click', function() {
				event.preventDefault();
				Beacon('navigate', '/ask/')
				Beacon('open');
			});
			$('.swis-help-beacon-multi').on('click', function() {
				var hsids = $(this).attr('data-beacon-articles');
				hsids = hsids.split(',');
				event.preventDefault();
				Beacon('suggest', hsids);
				Beacon('navigate', '/answers/');
				Beacon('open');
			});
			$('.swis-help-beacon-single').on('click', function() {
				var hsid = $(this).attr('data-beacon-article');
				event.preventDefault();
				Beacon('article', hsid, { type: 'modal' });
			});
		});
	}
	function selectText(containerid) {
		var debug_node = document.getElementById(containerid);
		if (document.selection) {
			var range = document.body.createTextRange();
			range.moveToElementText(debug_node);
			range.select();
		} else if (window.getSelection) {
			window.getSelection().selectAllChildren(debug_node);
		}
	}
	function unselectText() {
		var sel;
		if ( (sel = document.selection) && sel.empty) {
			sel.empty();
		} else if (window.getSelection) {
			window.getSelection().removeAllRanges();
		}
	}
	if (swisperformance_vars.preload_running) {
		var swisPreloadInterval = setInterval(updateSWISPreloadStatus, 15000);
		function updateSWISPreloadStatus() {
			var swis_cache_preload_status_data = {
				action: 'swis_cache_preload_status',
				swis_cache_preload_nonce: swisperformance_vars.preload_nonce,
			};
			$.post(ajaxurl, swis_cache_preload_status_data, function(response) {
				try {
					var swis_response = JSON.parse(response);
				} catch ( err ) {
					console.log(err);
					console.log(response);
					clearInterval(swisPreloadInterval);
					return false;
				}
				if ( swis_response.error ) {
					$('#swis-preload-queue-info').html('<strong>' + swis_response.error + '</strong>');
					clearInterval(swisPreloadInterval);
					return false;
				} else if ( swis_response.html ) {
					$('#swis-preload-queue-info').html(swis_response.html);
				} else {
					clearInterval(swisPreloadInterval);
					return false;
				}
			});
		}
	}
	$('#swis-cache-preload-start').on('click', function() {
		var swis_cache_preload_data = {
			action: 'swis_cache_preload_init',
			swis_cache_preload_nonce: swisperformance_vars.preload_nonce,
		};
		$('#swis-cache-preload-start-container').hide();
		$('#swis-cache-preload-status-container').show();
		$('#swis-cache-preload-warning').show();
		$.post(ajaxurl, swis_cache_preload_data, function(response) {
			try {
				var swis_response = JSON.parse(response);
			} catch ( err ) {
				$('#swis-cache-preload-message').html('<span style="color: red"><b>' + swisperformance_vars.invalid_response + '</b></span>');
				console.log(err);
				console.log(response);
				$('#swis-cache-preload-spinner').hide();
				$('#swis-cache-preload-warning').hide();
				return false;
			}
			if ( swis_response.success > 0 ) {
				$('#swis-cache-preload-message').html(swis_response.message);
				SWISPreloadURL();
			} else {
				$('#swis-cache-preload-message').html(swisperformance_vars.no_preload_pages);
				$('#swis-cache-preload-spinner').hide();
				$('#swis-cache-preload-warning').hide();
				return false;
			}
		});
		return false;
	});
	function SWISPreloadURL() {
		var swis_cache_preload_data = {
			action: 'swis_cache_preload_url',
			swis_cache_preload_nonce: swisperformance_vars.preload_nonce,
		};
		$.post(ajaxurl, swis_cache_preload_data, function(response) {
			try {
				var swis_response = JSON.parse(response);
			} catch ( err ) {
				$('#swis-cache-preload-message').html('<span style="color: red"><b>' + swisperformance_vars.invalid_response + '</b></span>');
				console.log(err);
				console.log(response);
				$('#swis-cache-preload-spinner').hide();
				$('#swis-cache-preload-warning').hide();
				return false;
			}
			if ( swis_response.success > 0 ) {
				$('#swis-cache-preload-message').html(swis_response.message);
				SWISPreloadURL();
			} else {
				$('#swis-cache-preload-message').html(swisperformance_vars.preload_complete);
				$('#swis-cache-preload-spinner').hide();
				$('#swis-cache-preload-warning').hide();
				return false;
			}
		});
	}
	// Auto-refresh Critical CSS queue status if the async process is currently running.
	if (swisperformance_vars.ccss_running) {
		var swisGenerateCSSInterval = setInterval(updateSWISGenerateCSSStatus, 15000);
		function updateSWISGenerateCSSStatus() {
			var swis_generate_css_status_data = {
				action: 'swis_generate_css_status',
				swis_generate_css_nonce: swisperformance_vars.ccss_nonce,
			};
			$.post(ajaxurl, swis_generate_css_status_data, function(response) {
				try {
					var swis_response = JSON.parse(response);
				} catch ( err ) {
					console.log(err);
					console.log(response);
					clearInterval(swisGenerateCSSInterval);
					return false;
				}
				if ( swis_response.error ) {
					$('#swis-generate-css-queue-info').html('<strong>' + swis_response.error + '</strong>');
					clearInterval(swisGenerateCSSInterval);
					return false;
				} else if ( swis_response.html ) {
					$('#swis-generate-css-queue-info').html(swis_response.html);
				} else {
					clearInterval(swisGenerateCSSInterval);
					return false;
				}
			});
		}
	}
	// Admin-side function to start AJAX-driven Critical CSS process.
	$('#swis-generate-css-start').on('click', function() {
		var swis_generate_css_data = {
			action: 'swis_generate_css_init',
			swis_generate_css_nonce: swisperformance_vars.ccss_nonce,
		};
		$('#swis-generate-css-start-container').hide();
		$('#swis-generate-css-status-container').show();
		$('#swis-generate-css-warning').show();
		$.post(ajaxurl, swis_generate_css_data, function(response) {
			try {
				var swis_response = JSON.parse(response);
			} catch ( err ) {
				$('#swis-generate-css-message').html('<span style="color: red"><b>' + swisperformance_vars.invalid_response + '</b></span>');
				console.log(err);
				console.log(response);
				$('#swis-generate-css-spinner').hide();
				$('#swis-generate_css-warning').hide();
				return false;
			}
			if (swis_response.success > 0 && swis_response.message.length > 0) {
				$('#swis-generate-css-message').html(swis_response.message);
				SWISGenerateCSSforURL();
			} else {
				$('#swis-generate-css-message').html(swisperformance_vars.no_ccss_pages);
				$('#swis-generate-css-spinner').hide();
				$('#swis-generate-css-warning').hide();
				return false;
			}
		});
		return false;
	});
	function SWISGenerateCSSforURL() {
		var swis_generate_css_data = {
			action: 'swis_url_generate_css',
			swis_generate_css_nonce: swisperformance_vars.ccss_nonce,
		};
		$.post(ajaxurl, swis_generate_css_data, function(response) {
			try {
				var swis_response = JSON.parse(response);
			} catch ( err ) {
				$('#swis-generate-css-message').html('<span style="color: red"><b>' + swisperformance_vars.invalid_response + '</b></span>');
				console.log(err);
				console.log(response);
				$('#swis-generate-css-spinner').hide();
				$('#swis-generate-css-warning').hide();
				return false;
			}
			if ( swis_response.error.length > 0 ) {
				$('#swis-generate-css-error-log').append('<p><i>' + swis_response.url + '</i><br>' + '<strong>' + swis_response.error + ':</strong> ' + swis_response.info + '</p>');
				$('#swis-generate-css-error-log').show();
			} else if ( swis_response.info.length > 0 ) {
				$('#swis-generate-css-last-info').html('<p><i>' + swis_response.url + '</i><br>' + swis_response.info + '</p>');
				$('#swis-generate-css-last-info').show();
			}
			if ( swis_response.count > 0 ) {
				var timer = 8000;
				if ( ! swis_response.pending ) {
					timer = 1000;
				}
				$('#swis-generate-css-message').html(swis_response.message);
				setTimeout(function() {
					SWISGenerateCSSforURL();
				}, timer);
			} else {
				$('#swis-generate-css-message').html(swisperformance_vars.ccss_complete);
				$('#swis-generate-css-spinner').hide();
				$('#swis-generate-css-warning').hide();
				setTimeout(function() {
					$('#swis-generate-css-last-info').fadeOut();
				}, 10000);
				return false;
			}
		});
	}
});
