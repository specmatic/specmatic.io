import trimParams from '../../../assets/js/params.js';

export default function getMapText( modal, currentField ) {
	const output = modal.querySelector( '#mbv-field-map-output' ).value;

	if ( 'map_default' === output ) {
		return `{{ ${currentField.id}.rendered }}`;
	}
	if ( 'map_custom' !== output ) {
		return `{{ ${currentField.id}.${output} }}`;
	}

	const params = trimParams( [
		'#mbv-field-map-width',
		'#mbv-field-map-height',
		'#mbv-field-map-zoom',
		'#mbv-field-map-marker-icon',
		'#mbv-field-map-marker-title',
		'#mbv-field-map-info-window'
	] );

	return `{{ mb.map( '${currentField.id}', ${params} ) }}`;
}