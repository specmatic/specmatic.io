export default function getOembedText( modal, currentField ) {
	const output = modal.querySelector( '#mbv-field-oembed-output' ).value;
	return `{{ ${currentField.id}.${output} }}`;
}