export default function getUserText( modal, currentField, indents ) {
	const output = modal.querySelector( '#mbv-field-user-output' ).value;
	const size = modal.querySelector( '#mbv-field-user-avatar-size' ).value;
	const user = currentField.id;

	if ( 'avatar' !== output ) {
		return `{{ ${user}.${output} }}`;
	}

	return `{{ mb.get_avatar( ${user}.ID, ${size} ) }}`;
}