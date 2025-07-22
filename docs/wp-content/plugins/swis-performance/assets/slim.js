if(window.addEventListener){
	window.addEventListener('DOMContentLoaded',swisSlimLoad);
}
function swisSlimLoad() {
jQuery(document).ready(function($) {
	// Back-end processing...
	$('#swis-slim-rules').on('click', '.swis-slim-rule-actions .button-link-edit', function() {
		var swis_slim_container = $(this).closest('.swis-slim-rule');
		swis_slim_container.find('.swis-slim-rule-actions').hide();
		swis_slim_container.find('.swis-slim-pretty-rule').hide();
		swis_slim_container.find('.swis-slim-hidden').show();
	});
	$('#swis-slim-rules').on('click', '.swis-slim-rule-save', function() {
		var swis_slim_container = $(this).closest('.swis-slim-rule');
		var swis_slim_rule_id = swis_slim_container.attr('data-slim-rule-id');
		var error_container = swis_slim_container.find('.swis-slim-error-message');
		error_container.hide();
		var swis_slim_handle = swis_slim_container.attr('data-slim-handle');
		var swis_slim_button_text = $(this).text();
		var swis_slim_button = $(this);
		swis_slim_button.text(swisperformance_vars.saving_message);
		swis_slim_button.prop('disabled', true);
		var swis_slim_rule_data = {
			action: 'swis_slim_rule_edit',
			swis_slim_action: 'update',
			swis_wpnonce: swisperformance_vars._wpnonce,
			swis_slim_handle: swis_slim_handle,
			swis_slim_rule_type: 'disable',
			swis_slim_exclusions: swis_slim_container.find('.swis-slim-raw-rule input').val(),
			swis_slim_mode: swis_slim_container.find('input[name=swis_slim_mode_' + swis_slim_rule_id + ']:checked').val(),
		};
		console.log(swis_slim_rule_data);
		$.post(ajaxurl, swis_slim_rule_data, function(response) {
			try {
				var swis_response = JSON.parse(response);
			} catch ( err ) {
				error_container.html(swisperformance_vars.invalid_response);
				error_container.show();
				console.log(err);
				console.log(response);
				swis_slim_button.text(swis_slim_button_text);
				swis_slim_button.prop('disabled', false);
				return false;
			}
			if (swis_response.success) {
				swis_slim_container.replaceWith(swis_response.message);
			} else {
				error_container.html(swis_response.error);
				error_container.show();
				swis_slim_button.text(swis_slim_button_text);
				swis_slim_button.prop('disabled', false);
			}
		});
		return false;
	});
	$('#swis-slim-rules').on('click', '.swis-slim-rule-actions .button-link-delete', function() {
		var swis_slim_container = $(this).closest('.swis-slim-rule');
		var swis_slim_rule_id = swis_slim_container.attr('data-slim-rule-id');
		var error_container = swis_slim_container.find('.swis-slim-error-message');
		error_container.hide();
                var swis_slim_handle = swis_slim_container.attr('data-slim-handle');
		var swis_slim_button_text = $(this).text();
		var swis_slim_button = $(this);
                var really_remove = confirm(swisperformance_vars.remove_rule);
		if (really_remove) {
			swis_slim_button.text(swisperformance_vars.removing_message);
			swis_slim_button.prop('disabled', true);
			var swis_slim_rule_data = {
				action: 'swis_slim_rule_edit',
				swis_slim_action: 'delete',
				swis_wpnonce: swisperformance_vars._wpnonce,
				swis_slim_handle: swis_slim_handle,
				swis_slim_rule_type: 'disable',
				swis_slim_mode: swis_slim_container.find('input[name=swis_slim_mode_' + swis_slim_rule_id + ']:checked').val(),
			};
			console.log(swis_slim_rule_data);
			$.post(ajaxurl, swis_slim_rule_data, function(response) {
				try {
					var swis_response = JSON.parse(response);
				} catch ( err ) {
					error_container.html(swisperformance_vars.invalid_response);
					error_container.show();
					console.log(err);
					console.log(response);
					swis_slim_button.text(swis_slim_button_text);
					swis_slim_button.prop('disabled', false);
					return false;
				}
				if (swis_response.success) {
					swis_slim_container.fadeOut('slow').remove();
				} else {
					error_container.html(swis_response.error);
					error_container.show();
					swis_slim_button.text(swis_slim_button_text);
					swis_slim_button.prop('disabled', false);
				}
			});
		}
		return false;
	});
	$('#swis-slim-add-rule .swis-slim-rule-add').on('click', function() {
		var swis_slim_container = $(this).closest('#swis-slim-add-rule');
		var error_container = swis_slim_container.find('.swis-slim-error-message');
		error_container.hide();
		var swis_slim_button_text = $(this).text();
		var swis_slim_button = $(this);
		swis_slim_button.text(swisperformance_vars.saving_message);
		swis_slim_button.prop('disabled', true);
		var swis_slim_rule_data = {
			action: 'swis_slim_rule_edit',
			swis_slim_action: 'create',
			swis_wpnonce: swisperformance_vars._wpnonce,
			swis_slim_handle: $('#swis_slim_new_handle').val(),
			swis_slim_rule_type: 'disable',
			swis_slim_exclusions: $('#swis_slim_new_exclusions').val(),
			swis_slim_mode: $("input[name='swis_slim_new_mode']:checked").val(),
		};
		console.log(swis_slim_rule_data);
		$.post(ajaxurl, swis_slim_rule_data, function(response) {
			try {
				var swis_response = JSON.parse(response);
			} catch ( err ) {
				error_container.html(swisperformance_vars.invalid_response);
				error_container.show();
				console.log(err);
				console.log(response);
				swis_slim_button.text(swis_slim_button_text);
				swis_slim_button.prop('disabled', false);
				return false;
			}
			if (swis_response.success) {
				$('#swis-slim-rules').append(swis_response.message);
				$('#swis_slim_new_handle').val('');
				$('#swis_slim_new_exclusions').val('');
				$('#swis_slim_new_mode_all').prop('checked', true);
			} else {
				error_container.html(swis_response.error);
				error_container.show();
			}
			swis_slim_button.text(swis_slim_button_text);
			swis_slim_button.prop('disabled', false);
		});
		return false;
	});
	// Front-end processing...
	if (typeof swisJSErrors !== 'undefined' && swisJSErrors.length) {
		console.log(swisJSErrors);
		for (var i = 0; i < swisJSErrors.length; i++) {
			var swisJSError = '<p>' + i + ': ' + swisJSErrors[i][0] + '<br><a href="' + swisJSErrors[i][1] + '">' + swisJSErrors[i][1] + ':' + swisJSErrors[i][2] + '</a></p>';
			$('.swis-slim-error-log').append(swisJSError);
		}
		$('.swis-slim-caught-errors').show();
	}
	$('.swis-slim-show-errors').on('click', function() {
		$(this).hide();
		$('.swis-slim-hide-errors').show();
		$('.swis-slim-error-log').show();
	});
	$('.swis-slim-hide-errors').on('click', function() {
		$(this).hide();
		$('.swis-slim-show-errors').show();
		$('.swis-slim-error-log').hide();
	});
	if (typeof swis_slim_more_assets !== 'undefined') {
		$('#swis-slim-processing').show();
		var swis_slim_assets_data = {
			action: 'swis_slim_get_assets_html',
			swis_wpnonce: swisperformance_vars._wpnonce,
			swis_slim_assets: swis_slim_more_assets,
			swis_slim_current_page: $('#swis-slim-current-page').text(),
		};
		$.post(swisperformance_vars.ajaxurl, swis_slim_assets_data, function(response) {
			try {
				var swis_response = JSON.parse(response);
			} catch ( err ) {
				$('#swis-slim-processing').html(swisperformance_vars.invalid_response);
				console.log(err);
				console.log(response);
			}
			if (swis_response.success) {
				for (var i = 0; i < swis_response.message.length; i++) {
					var slim_asset = swis_response.message[i];
					$('table#swis-slim-assets-' + slim_asset.type).append(slim_asset.html);
				}
				if (swisperformance_vars.check_assets) {
					slimVerifyAssets();
				} else {
					$('#swis-slim-processing').hide();
				}
			} else {
				$('#swis-slim-processing').html(swis_response.error);
			}
		});
	}
	function slimVerifyAssets() {
		$('#swis-slim-processing').show();
		var current_page = $('#swis-slim-current-page').text();
		var swis_slim_assets_data = {
			action: 'swis_slim_check_assets',
			swis_wpnonce: swisperformance_vars._wpnonce,
			swis_slim_current_page: $('#swis-slim-current-page').text(),
		};
		$.post(swisperformance_vars.ajaxurl, swis_slim_assets_data, function(response) {
			try {
				var swis_response = JSON.parse(response);
			} catch ( err ) {
				$('#swis-slim-processing').html(swisperformance_vars.invalid_response);
				console.log(err);
				console.log(response);
			}
			if (swis_response.error) {
				$('#swis-slim-processing').html(swis_response.error);
			} else {
				$('#swis-slim-assets-pane tr[data-slim-handle]').each(function(){
					console.log('Slim looking for ' + $(this).attr('data-slim-handle'));
					for (var i = 0; i < swis_response.length; i++) {
						var slim_handle = swis_response[i];
						console.log('Slim comparing ' + slim_handle);
						if (slim_handle === $(this).attr('data-slim-handle')) {
							console.log('got a match!');
							return true;
						}
					}
					console.log('no match... hiding');
					$('#swis-slim-show-all-assets').show();
					$(this).hide();
					$(this).find('.swis-slim-asset-status').append('<div class="dashicons dashicons-lock"></div>');
				});
				$('#swis-slim-processing').hide();
			}
		});
	}
	$('#swis-slim-show-all-assets').on('click', function() {
		$('#swis-slim-assets-pane tr[data-slim-handle]').show();
	});
	$('.swis-slim-assets').on('click', '.swis-slim-mode-all', function() {
		var swis_slim_rule_exclusions = $(this).closest('form.swis-slim-rule').find('.swis-slim-rule-exclusions');
		swis_slim_rule_exclusions.prop('disabled', true);
	});
	$('.swis-slim-assets').on('click', '.swis-slim-mode-exclude,.swis-slim-mode-include', function() {
		var swis_slim_rule_exclusions = $(this).closest('form.swis-slim-rule').find('.swis-slim-rule-exclusions');
		swis_slim_rule_exclusions.prop('disabled', false);
	});
	$('.swis-slim-assets').on('click', '.swis-slim-rule-customize', function() {
		var swis_slim_container = $(this).closest('.swis-slim-rule');
		swis_slim_container.find('input[type=text]').show();
		swis_slim_container.find('label').show();
		$(this).hide();
	});
	$('.swis-slim-assets').on('click', '.swis-slim-rule-actions .button-link-edit', function() {
		var swis_slim_container = $(this).closest('.swis-slim-rule');
		swis_slim_container.find('.swis-slim-rule-actions').hide();
		swis_slim_container.find('.swis-slim-pretty-rule').hide();
		swis_slim_container.find('.swis-slim-hidden').show();
	});
	$('.swis-slim-assets').on('click', '.swis-slim-rule-add', function() {
		var swis_slim_container = $(this).closest('.swis-slim-rule');
		var swis_slim_rule_id = swis_slim_container.attr('data-slim-rule-id');
		var error_container = swis_slim_container.find('.swis-slim-error-message');
		error_container.hide();
		var swis_slim_handle = swis_slim_container.attr('data-slim-handle');
		var swis_slim_rule_type = swis_slim_container.attr('data-slim-rule-type');
		var swis_slim_button_text = $(this).text();
		var swis_slim_button = $(this);
		swis_slim_button.text(swisperformance_vars.saving_message);
		swis_slim_button.prop('disabled', true);
		var swis_slim_rule_data = {
			action: 'swis_slim_rule_edit',
			swis_slim_action: 'create',
			swis_wpnonce: swisperformance_vars._wpnonce,
			swis_slim_current_page: $('#swis-slim-current-page').text(),
			swis_slim_handle: swis_slim_handle,
			swis_slim_rule_type: swis_slim_rule_type,
			swis_slim_exclusions: swis_slim_container.find('.swis-slim-raw-rule input').val(),
			swis_slim_mode: swis_slim_container.find('input[name=swis_slim_mode_' + swis_slim_rule_id + ']:checked').val(),
			swis_slim_asset_type: swis_slim_container.find('input[name=swis_slim_asset_type]').val(),
			swis_slim_frontend: 1,
		};
		console.log(swis_slim_rule_data);
		$.post(swisperformance_vars.ajaxurl, swis_slim_rule_data, function(response) {
			try {
				var swis_response = JSON.parse(response);
			} catch ( err ) {
				error_container.html(swisperformance_vars.invalid_response);
				error_container.show();
				console.log(err);
				console.log(response);
				swis_slim_button.text(swis_slim_button_text);
				swis_slim_button.prop('disabled', false);
				return false;
			}
			if (swis_response.success) {
				swis_slim_container.closest('tr').find('.swis-slim-asset-status').html(swis_response.status);
				swis_slim_container.replaceWith(swis_response.message);
			} else {
				error_container.html(swis_response.error);
				error_container.show();
				swis_slim_button.text(swis_slim_button_text);
				swis_slim_button.prop('disabled', false);
			}
		});
		return false;
	});
	$('.swis-slim-assets').on('click', '.swis-slim-rule-save', function() {
		var swis_slim_container = $(this).closest('.swis-slim-rule');
		var swis_slim_rule_id = swis_slim_container.attr('data-slim-rule-id');
		var error_container = swis_slim_container.find('.swis-slim-error-message');
		error_container.hide();
                var swis_slim_handle = swis_slim_container.attr('data-slim-handle');
                var swis_slim_rule_type = swis_slim_container.attr('data-slim-rule-type');
		var swis_slim_button_text = $(this).text();
		var swis_slim_button = $(this);
		swis_slim_button.text(swisperformance_vars.saving_message);
		swis_slim_button.prop('disabled', true);
		var swis_slim_rule_data = {
			action: 'swis_slim_rule_edit',
			swis_slim_action: 'update',
			swis_wpnonce: swisperformance_vars._wpnonce,
			swis_slim_current_page: $('#swis-slim-current-page').text(),
			swis_slim_handle: swis_slim_handle,
			swis_slim_rule_type: swis_slim_rule_type,
			swis_slim_exclusions: swis_slim_container.find('.swis-slim-raw-rule input').val(),
			swis_slim_mode: swis_slim_container.find('input[name=swis_slim_mode_' + swis_slim_rule_id + ']:checked').val(),
			swis_slim_asset_type: swis_slim_container.find('input[name=swis_slim_asset_type]').val(),
			swis_slim_frontend: 1,
		};
		console.log(swis_slim_rule_data);
		$.post(swisperformance_vars.ajaxurl, swis_slim_rule_data, function(response) {
			try {
				var swis_response = JSON.parse(response);
			} catch ( err ) {
				error_container.html(swisperformance_vars.invalid_response);
				error_container.show();
				console.log(err);
				console.log(response);
				swis_slim_button.text(swis_slim_button_text);
				swis_slim_button.prop('disabled', false);
				return false;
			}
			if (swis_response.success) {
				swis_slim_container.closest('tr').find('.swis-slim-asset-status').html(swis_response.status);
				swis_slim_container.replaceWith(swis_response.message);
			} else {
				error_container.html(swis_response.error);
				error_container.show();
				swis_slim_button.text(swis_slim_button_text);
				swis_slim_button.prop('disabled', false);
			}
		});
		return false;
	});
	$('.swis-slim-assets').on('click', '.button-link-delete', function() {
		var swis_slim_container = $(this).closest('.swis-slim-rule');
		var swis_slim_rule_id = swis_slim_container.attr('data-slim-rule-id');
		var error_container = swis_slim_container.find('.swis-slim-error-message');
		error_container.hide();
                var swis_slim_handle = swis_slim_container.attr('data-slim-handle');
                var swis_slim_rule_type = swis_slim_container.attr('data-slim-rule-type');
		var swis_slim_button_text = $(this).text();
		var swis_slim_button = $(this);
                var really_remove = confirm(swisperformance_vars.remove_rule);
		if (!really_remove) {
			return false;
		}
		swis_slim_button.text(swisperformance_vars.removing_message);
		swis_slim_button.prop('disabled', true);
		var swis_slim_rule_data = {
			action: 'swis_slim_rule_edit',
			swis_slim_action: 'delete',
			swis_wpnonce: swisperformance_vars._wpnonce,
			swis_slim_current_page: $('#swis-slim-current-page').text(),
			swis_slim_handle: swis_slim_handle,
			swis_slim_rule_type: swis_slim_rule_type,
			swis_slim_mode: swis_slim_container.find('input[name=swis_slim_mode_' + swis_slim_rule_id + ']:checked').val(),
			swis_slim_asset_type: swis_slim_container.find('input[name=swis_slim_asset_type]').val(),
			swis_slim_frontend: 1,
		};
		console.log(swis_slim_rule_data);
		$.post(swisperformance_vars.ajaxurl, swis_slim_rule_data, function(response) {
			try {
				var swis_response = JSON.parse(response);
			} catch ( err ) {
				error_container.html(swisperformance_vars.invalid_response);
				error_container.show();
				console.log(err);
				console.log(response);
				swis_slim_button.text(swis_slim_button_text);
				swis_slim_button.prop('disabled', false);
				return false;
			}
			if (swis_response.success) {
				swis_slim_container.closest('tr').find('.swis-slim-asset-status').html(swis_response.status);
				swis_slim_container.replaceWith(swis_response.message);
			} else {
				error_container.html(swis_response.error);
				error_container.show();
				swis_slim_button.text(swis_slim_button_text);
				swis_slim_button.prop('disabled', false);
			}
		});
		return false;
	});
	// Front-end triggers for editing and (re)generating Critical CSS.
	$('#swis-slim-assets-pane').on('click', '.swis-ccss-actions .button-link-generate', function() {
		$('.swis-ccss-spinner').addClass('swis-ccss-show-inline');
		$('.swis-ccss-error-message').hide();
		$('.swis-ccss-success-message').hide();
		var swis_ccss_generate_data = {
			action: 'swis_url_generate_page_css',
			swis_generate_css_nonce: swisccss_vars._wpnonce,
			types: swis_ccss_types,
			page_url: swis_ccss_url,
		}
		$.post(swisperformance_vars.ajaxurl, swis_ccss_generate_data, function(response) {
			try {
				var swis_response = JSON.parse(response);
			} catch (err) {
				$('.swis-ccss-error-message').html(swisperformance_vars.invalid_response);
				$('.swis-ccss-error-message').show();
				console.log(err);
				console.log(response);
				$('.swis-ccss-spinner').removeClass('swis-ccss-show-inline');
				return false;
			}
			if (swis_response.error) {
				if (swis_response.info) {
					$('.swis-ccss-error-message').html(swis_response.error + ': ' + swis_response.info);
				} else {
					$('.swis-ccss-error-message').html(swis_response.error);
				}
				$('.swis-ccss-error-message').show();
				$('.swis-ccss-spinner').removeClass('swis-ccss-show-inline');
				return false;
			} else if (swis_response.pending > 0) {
				setTimeout(function() {
					pendingCCSSSingle(swis_response.pending);
				}, 8000);
				return false;
			} else {
				$('.swis-ccss-error-message').html(swisperformance_vars.invalid_response);
				$('.swis-ccss-error-message').show();
				console.log(response);
				$('.swis-ccss-spinner').removeClass('swis-ccss-show-inline');
				return false;
			}
		});
		return false;
	});
	function pendingCCSSSingle(pending_id) {
		var swis_ccss_generate_data = {
			action: 'swis_url_generate_page_css',
			swis_generate_css_nonce: swisccss_vars._wpnonce,
			pending_id: pending_id,
		}
		$.post(swisperformance_vars.ajaxurl, swis_ccss_generate_data, function(response) {
			try {
				var swis_response = JSON.parse(response);
			} catch (err) {
				$('.swis-ccss-error-message').html(swisperformance_vars.invalid_response);
				$('.swis-ccss-error-message').show();
				console.log(err);
				console.log(response);
				$('.swis-ccss-spinner').removeClass('swis-ccss-show-inline');
				return false;
			}
			if (swis_response.error) {
				if (swis_response.info) {
					$('.swis-ccss-error-message').html(swis_response.error + ': ' + swis_response.info);
				} else {
					$('.swis-ccss-error-message').html(swis_response.error);
				}
				$('.swis-ccss-error-message').show();
				$('.swis-ccss-spinner').removeClass('swis-ccss-show-inline');
			} else if (swis_response.pending > 0) {
				setTimeout(function() {
					pendingCCSSSingle(swis_response.pending);
				}, 8000);
			} else if (swis_response.info.length > 0){
				$('#swis-active-critical-css').replaceWith(swis_response.info);
			} else {
				$('.swis-ccss-error-message').html(swisperformance_vars.invalid_response);
				$('.swis-ccss-error-message').show();
				console.log(response);
				$('.swis-ccss-spinner').removeClass('swis-ccss-show-inline');
				return false;
			}
		});
	}
	$('#swis-slim-assets-pane').on('click', '.swis-ccss-actions .button-link-add', function() {
		$('#swis-active-critical-css .swis-ccss-add').toggle();
		$('#swis-active-critical-css .swis-ccss-edit-template').hide();
		return false;
	});
	$('#swis-slim-assets-pane').on('click', '.swis-ccss-actions .button-link-edit-template', function() {
		$('#swis-active-critical-css .swis-ccss-edit-template').toggle();
		$('#swis-active-critical-css .swis-ccss-add').hide();
		return false;
	});
	$('#swis-slim-assets-pane').on('click', '.swis-ccss-actions .button-link-edit', function() {
		$('#swis-active-critical-css .swis-ccss-edit').toggle();
		return false;
	});
	$('#swis-slim-assets-pane').on('click', '.swis-ccss-add .button-link-save', function() {
		// Adding/saving page-specific CSS.
		var swis_ccss_code = $('#swis-critical-css-code').val();
		var swis_ccss_save_data = {
			action: 'swis_save_ccss',
			swis_generate_css_nonce: swisccss_vars._wpnonce,
			swis_ccss_code: swis_ccss_code,
			swis_ccss_type: 'page',
			page_url: swis_ccss_url,
		}
		$(this).prop('disabled', true);
		$(this).text(swisccss_vars.saving_message);
		saveCCSSFile(swis_ccss_save_data, $(this));
		return false;
	});
	$('#swis-slim-assets-pane').on('click', '.swis-ccss-edit .button-link-save', function() {
		// Saving page-specific css.
		var swis_ccss_code = $('#swis-critical-css-page-code').val();
		var swis_ccss_save_data = {
			action: 'swis_save_ccss',
			swis_generate_css_nonce: swisccss_vars._wpnonce,
			swis_ccss_code: swis_ccss_code,
			swis_ccss_type: 'page',
			page_url: swis_ccss_url,
		}
		$(this).prop('disabled', true);
		$(this).text(swisccss_vars.saving_message);
		saveCCSSFile(swis_ccss_save_data, $(this));
		return false;
	});
	$('#swis-slim-assets-pane').on('click', '.swis-ccss-edit-template .button-link-save', function() {
		// Saving template CSS.
		var swis_ccss_code = $('#swis-critical-css-template-code').val();
		var swis_ccss_save_data = {
			action: 'swis_save_ccss',
			swis_generate_css_nonce: swisccss_vars._wpnonce,
			swis_ccss_code: swis_ccss_code,
			swis_ccss_type: 'template',
			swis_ccss_template: swis_ccss_type,
			page_url: swis_ccss_url,
		}
		$(this).prop('disabled', true);
		$(this).text(swisccss_vars.saving_message);
		saveCCSSFile(swis_ccss_save_data, $(this));
		return false;
	});
	function saveCCSSFile(swis_ccss_save_data,save_button) {
		$('.swis-ccss-success-message').hide();
		$('.swis-ccss-error-message').hide();
		$.post(swisperformance_vars.ajaxurl, swis_ccss_save_data, function(response) {
			try {
				var swis_response = JSON.parse(response);
			} catch (err) {
				$('.swis-ccss-error-message').html(swisperformance_vars.invalid_response);
				$('.swis-ccss-error-message').show();
				console.log(err);
				console.log(response);
				return false;
			}
			if (swis_response.error) {
				$('.swis-ccss-error-message').html(swis_response.error);
				$('.swis-ccss-error-message').show();
				save_button.prop('disabled', false);
				save_button.text(swisccss_vars.save_message)
			} else if (swis_response.success && swis_response.replace){
				$('#swis-active-critical-css').replaceWith(swis_response.success);
			} else if (swis_response.success){
				save_button.prop('disabled', false);
				save_button.text(swisccss_vars.save_message)
				$('#swis-active-critical-css-template-code').val(swis_response.css);
				$('.swis-ccss-success-message').html(swis_response.success);
				$('.swis-ccss-success-message').show().delay(10000).fadeOut('slow');
			} else {
				save_button.prop('disabled', false);
				save_button.text(swisccss_vars.save_message)
				$('.swis-ccss-error-message').html(swisperformance_vars.invalid_response);
				$('.swis-ccss-error-message').show();
				console.log(response);
			}
		});
	}
});
}
