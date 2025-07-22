export default function getAvatarText( modal, currentUser, indents ) {
	const size = modal.querySelector( '#mbv-field-avatar-size' ).value;
	return `{{ mb.get_avatar( ${currentUser}.ID, ${size} ) }}`;
}