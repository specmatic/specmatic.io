import trimParams from '../../../assets/js/params.js';

export default function getTermsText( modal, currentField, indents ) {
	const params = trimParams( [
		'#mbv-field-terms-taxonomy',
		'#mbv-field-terms-before',
		'#mbv-field-terms-separator',
		'#mbv-field-terms-after'
	] );

	return `{{ mb.get_the_term_list( post.ID, ${params} ) }}`;
}