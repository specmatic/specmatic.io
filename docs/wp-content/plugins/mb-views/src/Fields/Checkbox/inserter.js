import trimParams from '../../../assets/js/params.js';

export default function getCheckboxText( modal, currentField ) {
	const output = modal.querySelector( '#mbv-field-checkbox-output' ).value;

	if ( 'raw' === output ) {
		return `{{ ${currentField.id} }}`;
	}

	const params = trimParams( [
		'#mbv-field-checkbox-checked',
		'#mbv-field-checkbox-unchecked'
	] );

	return `{{ mb.checkbox( ${currentField.id}, ${params} ) }}`;
}