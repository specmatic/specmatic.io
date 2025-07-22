export default function getImageText( modal, currentField, indents ) {
	const size = modal.querySelector( '#mbv-field-image-size' ).value;
	const output = modal.querySelector( '#mbv-field-image-output' ).value;

	let prepend = '',
		image = '';

	if ( /^[a-zA-Z][^-]*$/.test( size ) ) {
		image = `${currentField.id}.${size}`;
	} else {
		prepend = `{% set item = attribute( ${currentField.id}, '${size}' ) %}`;
		if ( currentField.clone ) {
			prepend += indents;
		}
		image = 'item';
	}

	return 'tag' === output ?
	`${prepend}<img src="{{ ${image}.url }}" width="{{ ${image}.width }}" height="{{ ${image}.height }}" alt="{{ ${image}.alt }}">` :
	`${prepend}{{ ${image}.${output} }}`;
}