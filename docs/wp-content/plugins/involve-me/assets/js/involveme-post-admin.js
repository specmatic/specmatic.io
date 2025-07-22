(function ($) {
	$(document).ready(function () {
		$('.involveme-color-field').wpColorPicker();

		var clipboard = new ClipboardJS('#involve_me_copy_shortcode_button');
		clipboard.on('success', function (e) {
			let $button = $('#involve_me_copy_shortcode_button');
			$button.text($button.data('copied-text'))
			setTimeout(function(){
				$button.text($button.data('default-text'))
			}, 5000);
		});


		onTypeChange();
		onShowChange();
		toggles();

		$('input:radio[name=involveme_iframe_embed_mode]').change(function() {
			onTypeChange();
			onShowChange()
		});
		$('input:checkbox[name=involveme_iframe_close_popup_on_completion]').change(function() {
			toggleTimeDelay();
		});
		$('input:checkbox[name=involveme_iframe_stop_showing_once_completed]').change(function() {
			toggleStopShowing();
		});

		$('input:checkbox[name=involveme_iframe_hide_once_viewed]').change(function() {
			toggleHideViewedDuration();
		});

		$('input:checkbox[name=involveme_iframe_transparent_background]').change(function() {
			toggleBackgroundColor();
		});

		$('select[name=involveme_iframe_show_popup_side]').change(function() {
			onShowChange();
		});
		$('select[name=involveme_iframe_show_popup]').change(function() {
			onShowChange();
		});
		// should be after the disableOptionsOnFullPageEmbedMode one

	});

	function onTypeChange(){
		var selectedMode = getSelectedMode();

		var showElementsConfig = {
			'standard':[
					'transparent_background',
					'dynamic_height_resize',
					'minimal_height',
					'width',
				],
			'full-page':[

				],
			'popup':[
				'show_popup',
				'popup_size',
				'close_popup_on_completion',
				'stop_showing_once_completed',
			],
			'chatButton':[
				'popup_size',
				'icon',
				'button_color',
				'hide_once_viewed',
				'close_popup_on_completion',
				'stop_showing_once_completed',

			],
			'sidePanel':[
				'show_popup_side',
				'position',
				'popup_size',
				'close_popup_on_completion',
				'stop_showing_once_completed',
			],
			'sideTab':[
				'show_popup_side',
				'position',
				'popup_size',
				'close_popup_on_completion',
				'stop_showing_once_completed',
			],
		}
		var alwaysShow = ['background_color']

		var showElements = showElementsConfig[selectedMode];

		$('.involveme_setting').each(function(){
			var $option = $(this);
			var optionId = $option.attr('id');
			optionId = optionId.replace('involveme_iframe_', '');
			if(showElements.indexOf(optionId) !== -1 || alwaysShow.indexOf(optionId) !== -1){
				$option.parents('tr').show();
			}else{
				$option.parents('tr').hide();
			}
		});

		toggles();
	}

	function onShowChange(){
		var selectedShow = getSelectedShowValue();

		if(!selectedShow){
			// the type change already hides what is not needed.
			return;
		}
		var dynamicVisibleConfig = {
			'button':[
				'button_text',
			],
			'exit':[
				'stop_showing_once_completed',
				'hide_once_viewed',
			],
			'load':[
				'stop_showing_once_completed',
				'hide_once_viewed',
			],
			'timer':[
				'stop_showing_once_completed',
				'hide_once_viewed',
				'trigger_delay'
			],
			'fixedButton':[
				'stop_showing_once_completed',
				'hide_once_viewed',
				'icon_side',
				'button_text',
				'button_color',
			],
		}

		for (const property in dynamicVisibleConfig) {
			if(property !== selectedShow){
				dynamicVisibleConfig[property].forEach(function(optionId){
					$('#involveme_iframe_'+optionId).parents('tr').hide();
				});
			}
		}
		dynamicVisibleConfig[selectedShow].forEach(function(optionId){
			$('#involveme_iframe_'+optionId).parents('tr').show();
		});

		toggles();
	}

	function toggles(){
		toggleTimeDelay();
		toggleStopShowing();
		toggleBackgroundColor();
		toggleHideViewedDuration();
	}

	function toggleTimeDelay(){
		if ($('#involveme_iframe_close_popup_on_completion').is(":checked") && $('#involveme_iframe_close_popup_on_completion').is(":visible")) {
			$('#involveme_iframe_time_delay_to_close').parents('tr').show();
			$('#involveme_iframe_close_popup_on_completion_warning').show();
		}else{
			$('#involveme_iframe_time_delay_to_close').parents('tr').hide();
			$('#involveme_iframe_close_popup_on_completion_warning').hide();
		}
	}


	function toggleStopShowing(){
		if ($('#involveme_iframe_stop_showing_once_completed').is(":checked") && $('#involveme_iframe_stop_showing_once_completed').is(":visible")) {
			$('#involveme_iframe_stop_showing_duration').parents('tr').show();
			$('#involveme_iframe_stop_showing_once_completed_warning').show();
		}else{
			$('#involveme_iframe_stop_showing_duration').parents('tr').hide();
			$('#involveme_iframe_stop_showing_once_completed_warning').hide();
		}
	}

	function toggleHideViewedDuration(){
		if ($('#involveme_iframe_hide_once_viewed').is(":checked") && $('#involveme_iframe_hide_once_viewed').is(":visible")) {
			$('#involveme_iframe_hide_once_viewed_duration').parents('tr').show();
			$('#involveme_iframe_hide_once_viewed_warning').show();
		}else{
			$('#involveme_iframe_hide_once_viewed_duration').parents('tr').hide();
			$('#involveme_iframe_hide_once_viewed_warning').hide();
		}
	}

	function toggleBackgroundColor(){
		if ($('#involveme_iframe_transparent_background').is(":checked") && $('#involveme_iframe_transparent_background').is(":visible")) {
			$('#involveme_iframe_background_color').parents('tr').hide();
		}else{
			$('#involveme_iframe_background_color').parents('tr').show();
		}
	}

	function getSelectedMode(){

		if ($('#involveme_iframe_standard').is(":checked")) {
			return 'standard';
		}

		if ($('#involveme_iframe_full_page').is(":checked")) {
			return 'full-page';
		}

		if ($('#involveme_iframe_popup').is(":checked")) {
			return 'popup';
		}

		if ($('#involveme_iframe_chatButton').is(":checked")) {
			return 'chatButton';
		}

		if ($('#involveme_iframe_sidePanel').is(":checked")) {
			return 'sidePanel';
		}

		if ($('#involveme_iframe_sideTab').is(":checked")) {
			return 'sideTab';
		}
	}

	function getSelectedShowValue(){
		var selectedMode = getSelectedMode();

		if(selectedMode === 'chatButton' || selectedMode === 'standard' || selectedMode === 'full-page') {
			return false;
		}

		if(selectedMode === 'sidePanel' || selectedMode === 'sideTab'){
			return $('#involveme_iframe_show_popup_side').val();
		}

		return $('#involveme_iframe_show_popup').val()

	}

})(jQuery);


