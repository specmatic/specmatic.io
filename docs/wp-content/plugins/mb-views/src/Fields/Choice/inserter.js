export default function getChoiceText( modal, currentField ) {
	const output = modal.querySelector( '#mbv-field-choice-output' ).value;
	return `{{ ${currentField.id}.${output} }}`;
}