/**
 * Create comprehensive class control for Bricks global classes
 * Leverages the modular createBricksSelectControl for consistency
 */
function createBricksClassControl(property, props) {
	try {
		// Get global classes from Bricks data
		const globalClasses = window.bricksGutenbergData?.globalClassesNamesIds || []

		// Determine control mode
		const hasLimitedOptions = property.options && Array.isArray(property.options)

		// Transform class control property to work with select control
		const selectProperty = {
			...property,
			options: hasLimitedOptions
				? property.options.map((option) => {
						let label = option.label

						// If label is empty, find the global class name by the actual class ID
						if (!label || label.trim() === '') {
							const classId = Array.isArray(option.value) ? option.value[0] : option.value
							const globalClass = globalClasses.find((cls) => cls.id === classId)
							label = globalClass ? globalClass.name : classId
						}

						return {
							value: option.id || option.value,
							label: label
						}
					})
				: globalClasses.map((cls) => ({
						value: cls.id,
						label: cls.name
					})),
			placeholder:
				property.placeholder ||
				(property.multiple
					? window.bricksData.i18n.selectClasses
					: window.bricksData.i18n.selectClass)
		}

		// Use our modular select control
		return window.createBricksSelectControl(selectProperty, props)
	} catch (error) {
		console.error('Class control error:', error)
		const { createElement } = window.wp.element

		return createElement(
			'div',
			{
				style: { padding: '8px', border: '1px solid red', color: 'red' }
			},
			window.bricksData.i18n.errorCouldNotLoadClass
		)
	}
}
