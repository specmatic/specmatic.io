export default function getPaginationText( modal, currentField, indents ) {
	const type = modal.querySelector( '#mbv-field-pagination-type' ).value;
	return 'numeric' === type ? `{{ mb.get_the_posts_pagination() }}` : `{{ mb.get_the_posts_navigation() }}`;
}