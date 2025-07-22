const ProPreviewImage = ( { image, isChildren = false } ) => {
	if ( ! image ) {
		console.error( __( 'Please add a preview image.', 'spectra-pro' ) ); // eslint-disable-line no-console, no-undef
	}

	let imgUrl = spectra_pro_blocks_info.spectra_pro_url;
	imgUrl += '/assets/images/block-previews/';
	if ( isChildren ) {
		imgUrl += 'children/';
	}
	imgUrl += image + '.svg';
	return <img width="100%" src={ imgUrl } alt="" />;
};

export default ProPreviewImage;
