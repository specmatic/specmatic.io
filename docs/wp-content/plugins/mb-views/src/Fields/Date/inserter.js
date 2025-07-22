export default function getDateText( modal, currentField ) {
	let format = modal.querySelector( '#mbv-field-date-format' ).value;
	if ( 'custom' === format ) {
		format = modal.querySelector( '#mbv-field-date-custom-format' ).value;
	}

	return `{{ ${currentField.id} | date( '${format}' ) }}`;
}