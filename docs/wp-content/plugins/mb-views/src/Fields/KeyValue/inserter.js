export default function getKeyValueText( modal, currentField ) {
	return `{{ ${currentField.id}.0 }}: {{ ${currentField.id}.1 }}`;
}