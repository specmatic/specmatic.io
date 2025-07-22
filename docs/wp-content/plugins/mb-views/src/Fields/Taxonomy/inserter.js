export default function getTaxonomyText( modal, currentField, indents ) {
	const output = modal.querySelector( '#mbv-field-taxonomy-output' ).value;
	const term = currentField.id;

	return 'tag' === output ?
		`<a href="{{ ${term}.url }}">{{ ${term}.name }}</a>` :
		`{{ ${term}.${output} }}`;
}