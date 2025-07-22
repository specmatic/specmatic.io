export default function getBackgroundText( modal, currentField ) {
	const output = modal.querySelector( '#mbv-field-background-output' ).value;
	return 'css' === output ? `{{ ${currentField.id}.rendered }}` : `{{ ${currentField.id}.${output} }}`;
}