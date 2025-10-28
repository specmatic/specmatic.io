/**
 * Create proper toggle control matching ControlToggle.vue
 */
function createBricksToggleControl(property, props) {
	try {
		const { ButtonGroup, Button, BaseControl } = window.wp.components
		const { createElement } = window.wp.element

		// Get options from property, or create default boolean options
		let options = property.options || {}
		let optionKeys = Object.keys(options)

		// If no options provided, create default boolean toggle options
		if (optionKeys.length === 0) {
			// Default Bricks toggle: true/"off" (not false)
			options = {
				true: window.bricksData.i18n.on,
				off: window.bricksData.i18n.off
			}
			optionKeys = Object.keys(options)
		}

		// Get current value and default (handle boolean values)
		let currentValue = props.attributes[property.id]
		let defaultValue = property.default

		// Convert boolean values to strings for comparison with option keys
		if (typeof currentValue === 'boolean') {
			currentValue = currentValue ? 'true' : 'off' // true -> "true", false -> "off"
		}
		if (typeof defaultValue === 'boolean') {
			defaultValue = defaultValue ? 'true' : 'off' // true -> "true", false -> "off"
		}

		// Fallback to 'off' if no default is specified
		if (defaultValue === undefined) {
			defaultValue = 'off'
		}

		const onToggle = function (optionKey) {
			try {
				const newAttributes = {}

				// For boolean toggles, we need to convert string back to boolean
				if (currentValue === optionKey) {
					// Deselect: Set to undefined (same as deleting in Vue)
					newAttributes[property.id] = undefined
				} else {
					// Select: Set the clicked option
					// Convert string values back to appropriate type
					let newValue = optionKey
					if (optionKey === 'true') {
						newValue = true
					} else if (optionKey === 'off') {
						newValue = 'off' // Keep "off" as string, not convert to false
					}
					newAttributes[property.id] = newValue
				}

				props.setAttributes(newAttributes)
			} catch (error) {}
		}

		// Create toggle switch (modern slider style)
		const isCurrentlyTrue = currentValue === 'true' || (!currentValue && defaultValue === 'true')

		const toggleSwitch = createElement(
			'div',
			{
				key: 'toggle-switch',
				onClick: function () {
					// Toggle between true and "off"
					const newOptionKey = isCurrentlyTrue ? 'off' : 'true'
					onToggle(newOptionKey)
				},
				style: {
					position: 'relative',
					width: '50px',
					height: '24px',
					backgroundColor: isCurrentlyTrue ? '#007cba' : '#ccc',
					borderRadius: '12px',
					cursor: 'pointer',
					transition: 'background-color 0.3s ease',
					display: 'inline-block'
				}
			},
			[
				// Sliding circle
				createElement('div', {
					key: 'toggle-circle',
					style: {
						position: 'absolute',
						top: '2px',
						left: isCurrentlyTrue ? '28px' : '2px',
						width: '20px',
						height: '20px',
						backgroundColor: '#fff',
						borderRadius: '50%',
						transition: 'left 0.3s ease',
						boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
					}
				})
			]
		)

		// Just use the toggle switch without labels
		const toggleContainer = toggleSwitch

		const result = createElement(
			BaseControl,
			{
				key: property.id,
				label: property.label,
				help: property.help || '',
				__nextHasNoMarginBottom: true
			},
			toggleContainer
		)
		return result
	} catch (error) {
		return createElement(
			'div',
			{
				style: { padding: '8px', border: '1px solid red', color: 'red' }
			},
			window.bricksData.i18n.errorCouldNotLoadToggle
		)
	}
}
