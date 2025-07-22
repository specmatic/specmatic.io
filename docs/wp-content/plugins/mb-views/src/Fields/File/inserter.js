export default function getFileText( modal, currentField, indents ) {
	const output = modal.querySelector( '#mbv-field-file-output' ).value;
	const file = currentField.id;

	return 'tag' === output ?
	`<a href="{{ ${file}.url }}">{{ ${file}.title }}</a>` :
	`{{ ${file}.${output} }}`;
}