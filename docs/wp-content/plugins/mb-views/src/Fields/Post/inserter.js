import trimParams from '../../../assets/js/params.js';

export default function getPostText( modal, currentField, indents ) {
	const output = modal.querySelector( '#mbv-field-post-output' ).value;
	const post = currentField.id;

	if ( 'tag' === output ) {
		return `<a href="{{ ${post}.url }}">{{ ${post}.title }}</a>`;
	}

	if ( ['date', 'modified_date'].includes( output ) ) {
		let format = modal.querySelector( '#mbv-field-post-date-format' ).value;
		if ( 'custom' === format ) {
			format = modal.querySelector( '#mbv-field-post-date-custom-format' ).value;
		}

		return `{{ ${post}.${output} | date( '${format}' ) }}`;
	}

	if ( 'thumbnail' === output ) {
		const size = modal.querySelector( '#mbv-field-post-thumbnail-size' ).value;
		const thumbnailOutput = modal.querySelector( '#mbv-field-post-thumbnail-output' ).value;

		let prepend = '',
			image = '';

		if ( /^[a-z][^-]*/.test( size ) ) {
			image = `${post}.thumbnail.${size}`;
		} else {
			prepend = `{% set item = attribute( ${post}.thumbnail, '${size}' ) %}`;
			if ( currentField.clone ) {
				prepend += indents;
			}
			image = 'item';
		}

		return 'tag' === thumbnailOutput ?
		`${prepend}<img src="{{ ${image}.url }}" width="{{ ${image}.width }}" height="{{ ${image}.height }}" alt="{{ ${image}.alt }}">` :
		`${prepend}{{ ${image}.${thumbnailOutput} }}`;
	}

	if ( 'terms' === output ) {
		const params = trimParams( [
			'#mbv-field-post-terms-taxonomy',
			'#mbv-field-post-terms-before',
			'#mbv-field-post-terms-separator',
			'#mbv-field-post-terms-after'
		] );

		return `{{ mb.get_the_term_list( ${post}.ID, ${params} ) }}`;
	}

	return `{{ ${post}.${output} }}`;
}