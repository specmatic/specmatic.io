export default function getVideoText( modal, currentField, indents ) {
	const output = modal.querySelector( '#mbv-field-video-output' ).value;
	return `{{ ${currentField.id}.${output} }}`;
}