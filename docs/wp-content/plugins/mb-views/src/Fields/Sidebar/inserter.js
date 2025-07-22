export default function getSidebarText( modal, currentField ) {
	const output = modal.querySelector( '#mbv-field-sidebar-output' ).value;
	return `{{ ${currentField.id}.${output} }}`;
}