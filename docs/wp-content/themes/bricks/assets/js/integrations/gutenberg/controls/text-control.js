/**
 * Create text control matching ControlText.vue
 */
function createBricksTextControl(property, props) {
	try {
		const { TextControl } = window.wp.components
		const { createElement } = window.wp.element

		return createElement(TextControl, {
			__next40pxDefaultSize: true,
			__nextHasNoMarginBottom: true,
			key: property.id,
			label: property.label,
			value: props.attributes[property.id] || '',
			placeholder: property.placeholder || property.default,
			onChange: function (value) {
				try {
					const newAttributes = {}
					newAttributes[property.id] = value
					props.setAttributes(newAttributes)
				} catch (error) {}
			}
		})
	} catch (error) {
		return null
	}
}
