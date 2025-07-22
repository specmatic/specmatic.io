//Reset License
jQuery(document).ready(function($) {
	$('#seopress_pro_license_reset').on('click', function() {
		$.ajax({
			method : 'GET',
			url : seopressAjaxResetLicense.seopress_request_reset_license,
			data : {
				action: 'seopress_request_reset_license',
				_ajax_nonce: seopressAjaxResetLicense.seopress_nonce,
			},
			success : function( data ) {
				var url_location = data.data.url;
				if ($(location).attr('href') == url_location) {
					window.location.reload(true);
				} else {
					$(location).attr('href',url_location);
				}
			},
		});
	});
	$('#seopress_pro_license_reset').on('click', function() {
		$(this).attr("disabled", "disabled");
		$( '.spinner2' ).css( "visibility", "visible" );
		$( '.spinner2' ).css( "float", "none" );
	});
});