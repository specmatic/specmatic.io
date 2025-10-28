/**
 * Create proper select control matching ControlSelect.vue
 */
function createBricksSelectControl(property, props) {
	try {
		const { useState, useEffect, useRef } = window.wp.element

		// Data processing
		const isMultiple = property.multiple === true
		const currentValue = props.attributes[property.id] || (isMultiple ? [] : '')
		const hasOptionsAjax = property.hasOwnProperty('optionsAjax')

		// State for AJAX options
		const [ajaxOptions, setAjaxOptions] = useState({})
		const [isLoading, setIsLoading] = useState(false) // Used in createDropdownPanel

		// Combine static and AJAX options
		const staticOptions = processOptions(property.options)
		const allOptions = hasOptionsAjax
			? [...staticOptions, ...processOptions(ajaxOptions)]
			: staticOptions
		const options = allOptions

		// Use our custom dropdown interface for both single and multiple
		const [isDropdownOpen, setIsDropdownOpen] = useState(false)
		const [searchTerm, setSearchTerm] = useState('')
		const controlRef = useRef(null)

		// AJAX search functionality
		const triggerAjaxSearch = async (withCurrentValues = false) => {
			if (!hasOptionsAjax) {
				return
			}

			setIsLoading(true)

			try {
				const data = { ...property.optionsAjax }

				// Add search term if provided and long enough
				if (searchTerm && searchTerm.length >= 3) {
					data.search = searchTerm
				}

				// Include current values if requested
				if (withCurrentValues && currentValue) {
					if (Array.isArray(currentValue) && currentValue.length > 0) {
						data.include = currentValue
					} else if (!Array.isArray(currentValue) && currentValue !== '') {
						data.include = [currentValue]
					}
				}

				// Build query parameters
				const params = new URLSearchParams()
				Object.keys(data).forEach((key) => {
					if (Array.isArray(data[key])) {
						data[key].forEach((value) => params.append(`${key}[]`, value))
					} else {
						params.append(key, data[key])
					}
				})

				// Add nonce if available
				if (window.bricksData?.nonce) {
					params.append('nonce', window.bricksData.nonce)
				}

				const response = await fetch(`${window.ajaxurl || '/wp-admin/admin-ajax.php'}?${params}`, {
					method: 'GET',
					credentials: 'same-origin'
				})

				if (response.ok) {
					const result = await response.json()
					if (result.success && result.data) {
						setAjaxOptions(result.data)
					} else {
						setAjaxOptions({})
					}
				}
			} catch (error) {
				console.error('AJAX search error:', error)
				setAjaxOptions({})
			} finally {
				setIsLoading(false)
			}
		}

		// Debounced search effect
		useEffect(() => {
			if (!hasOptionsAjax) return

			const timeoutId = setTimeout(() => {
				if (searchTerm && searchTerm.length >= 3) {
					triggerAjaxSearch(false)
				} else if (!searchTerm) {
					// Reset to initial options when search is cleared
					triggerAjaxSearch(true)
				}
			}, 500)

			return () => clearTimeout(timeoutId)
		}, [searchTerm, hasOptionsAjax])

		// Load initial AJAX options
		useEffect(() => {
			if (hasOptionsAjax) {
				triggerAjaxSearch(true)
			}
		}, [hasOptionsAjax])

		// Handle click outside to close dropdown
		useEffect(() => {
			const handleClickOutside = (event) => {
				if (controlRef.current && !controlRef.current.contains(event.target)) {
					setIsDropdownOpen(false)
				}
			}

			if (isDropdownOpen) {
				document.addEventListener('mousedown', handleClickOutside)
				return () => {
					document.removeEventListener('mousedown', handleClickOutside)
				}
			}
		}, [isDropdownOpen])

		const filteredOptions = searchTerm
			? options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
			: options

		const selectedOptions = options.filter((option) => {
			if (Array.isArray(currentValue)) {
				return currentValue.includes(option.value)
			} else {
				return currentValue === option.value
			}
		})

		const hasSelection = selectedOptions.length > 0

		// Use dropdown interface for consistent design
		return createDropdownInterface({
			property,
			currentValue,
			options,
			filteredOptions,
			selectedOptions,
			hasSelection,
			isDropdownOpen,
			setIsDropdownOpen,
			searchTerm,
			setSearchTerm,
			props,
			controlRef,
			isLoading
		})
	} catch (error) {
		return createErrorDisplay()
	}
}

// Helper: Process options from different formats
function processOptions(rawOptions) {
	const options = []

	if (!rawOptions) return options

	if (Array.isArray(rawOptions)) {
		rawOptions.forEach((option) => {
			if (option.value !== undefined && option.label !== undefined) {
				options.push({ label: option.label, value: option.value })
			}
		})
	} else if (typeof rawOptions === 'object') {
		Object.keys(rawOptions).forEach((key) => {
			if (!key.includes('GroupTitle')) {
				options.push({ label: rawOptions[key], value: key })
			}
		})
	}

	return options
}

// Helper: Create dropdown interface for large lists
function createDropdownInterface({
	property,
	currentValue,
	options,
	filteredOptions,
	selectedOptions,
	hasSelection,
	isDropdownOpen,
	setIsDropdownOpen,
	searchTerm,
	setSearchTerm,
	props,
	controlRef,
	isLoading
}) {
	const { createElement } = window.wp.element
	const { BaseControl } = window.wp.components

	const handleOptionToggle = (optionValue, isSelected) => {
		const isMultiple = property.multiple === true
		let newValue

		if (isMultiple) {
			// Multiple select logic
			newValue = Array.isArray(currentValue) ? [...currentValue] : []

			if (isSelected) {
				newValue = newValue.filter((val) => val !== optionValue)
			} else {
				if (!newValue.includes(optionValue)) {
					newValue.push(optionValue)
				}
			}
		} else {
			// Single select logic
			newValue = isSelected ? '' : optionValue
			setIsDropdownOpen(false) // Close dropdown after selection
		}

		const newAttributes = {}
		newAttributes[property.id] =
			isMultiple && Array.isArray(newValue)
				? newValue.length > 0
					? newValue
					: [] // Empty array for multiple select, not undefined
				: newValue || undefined
		props.setAttributes(newAttributes)
	}

	const clearSelection = () => {
		const isMultiple = property.multiple === true
		const newAttributes = {}
		newAttributes[property.id] = isMultiple ? [] : undefined // Empty array for multiple, undefined for single
		props.setAttributes(newAttributes)
	}

	// Create the control container with proper positioning context
	const controlContainer = createElement(
		'div',
		{
			key: 'bricks-select-control',
			ref: controlRef,
			style: {
				position: 'relative' // This provides positioning context for dropdown
			},
			'data-control': 'select'
		},
		[
			// Selection trigger elements
			...createSelectionTrigger(
				selectedOptions,
				hasSelection,
				isDropdownOpen,
				setIsDropdownOpen,
				property,
				clearSelection
			),

			// Dropdown panel - positioned absolutely within this container
			isDropdownOpen &&
				createDropdownPanel(
					options,
					filteredOptions,
					currentValue,
					searchTerm,
					setSearchTerm,
					handleOptionToggle,
					setIsDropdownOpen,
					property,
					isLoading
				)
		].filter(Boolean)
	)

	return createElement(
		BaseControl,
		{
			key: property.id,
			label: property.label,
			help: property.help || '',
			__nextHasNoMarginBottom: true
		},
		controlContainer
	)
}

// Helper: Create selection trigger display
function createSelectionTrigger(
	selectedOptions,
	hasSelection,
	isDropdownOpen,
	setIsDropdownOpen,
	property,
	clearSelection
) {
	const isMultiple = property.multiple === true
	const { createElement } = window.wp.element
	const { Button } = window.wp.components

	// No wrapper needed - the trigger is the main input

	const inputStyle = {
		border: '1px solid #949494',
		borderRadius: '2px',
		padding: '8px 12px',
		minHeight: '40px',
		cursor: 'pointer',
		backgroundColor: '#fff',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		fontSize: '13px'
	}

	const selectedItemsDisplay = hasSelection
		? isMultiple
			? createElement(
					'div',
					{
						key: 'selected-items',
						style: { display: 'flex', flexWrap: 'wrap', gap: '4px' }
					},
					selectedOptions.map((option, index) =>
						createElement(
							'span',
							{
								key: `selected-${option.value}-${index}`,
								style: {
									backgroundColor: '#0073aa',
									color: '#fff',
									padding: '2px 6px',
									borderRadius: '2px',
									fontSize: '11px',
									display: 'inline-block'
								}
							},
							option.label
						)
					)
				)
			: createElement(
					'span',
					{
						key: 'selected-value',
						style: { color: '#000' }
					},
					selectedOptions[0]?.label || ''
				)
		: createElement(
				'span',
				{
					key: 'placeholder',
					style: { color: '#757575' }
				},
				property.placeholder || window.bricksData.i18n.select
			)

	const dropdownArrow = createElement(
		'span',
		{
			key: 'dropdown-arrow',
			style: {
				marginLeft: '8px',
				transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
				transition: 'transform 0.2s'
			}
		},
		'▼'
	)

	const clearButton = hasSelection
		? createElement(
				Button,
				{
					key: 'clear-button',
					onClick: (e) => {
						e.stopPropagation()
						clearSelection()
					},
					variant: 'secondary',
					size: 'small',
					style: {
						position: 'absolute',
						right: '30px',
						top: '50%',
						transform: 'translateY(-50%)',
						minHeight: '24px',
						padding: '0 6px'
					}
				},
				'×'
			)
		: null

	return [
		createElement(
			'div',
			{
				key: 'selection-trigger',
				onClick: () => setIsDropdownOpen(!isDropdownOpen),
				style: {
					...inputStyle,
					marginBottom: '8px'
				}
			},
			[
				createElement(
					'div',
					{
						key: 'selection-content',
						style: { flex: 1 }
					},
					selectedItemsDisplay
				),
				dropdownArrow
			]
		),
		clearButton
	].filter(Boolean)
}

// Helper: Create dropdown panel with options
function createDropdownPanel(
	options,
	filteredOptions,
	currentValue,
	searchTerm,
	setSearchTerm,
	handleOptionToggle,
	setIsDropdownOpen,
	property,
	isLoading = false
) {
	const { createElement } = window.wp.element
	const { TextControl } = window.wp.components

	const panelStyle = {
		position: 'absolute',
		top: '100%',
		left: 0,
		right: 0,
		backgroundColor: '#fff',
		border: '1px solid #949494',
		borderBottomLeftRadius: '2px',
		borderBottomRightRadius: '2px',
		boxShadow: '0 6px 12px rgba(0, 0, 0, 0.25)',
		zIndex: 1000,
		maxHeight: 'calc(40px * 13.5)', // Match Vue component max height
		overflow: 'hidden'
	}

	// Show search input if: has AJAX options, searchable property is true, or has many options
	const shouldShowSearch =
		property.hasOwnProperty('optionsAjax') || property.searchable === true || options.length > 10

	const searchInput = shouldShowSearch
		? createElement(
				'div',
				{
					key: 'search-container',
					style: { padding: '8px', borderBottom: '1px solid #ddd' }
				},
				createElement(TextControl, {
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
					key: 'search-input',
					placeholder: window.bricksData.i18n.searchOptions,
					value: searchTerm,
					onChange: setSearchTerm,
					autoFocus: true
				})
			)
		: null

	const optionsList = createElement(
		'div',
		{
			key: 'options-list',
			style: { maxHeight: '240px', overflowY: 'auto' }
		},
		isLoading
			? createElement(
					'div',
					{
						key: 'loading',
						style: { padding: '12px', textAlign: 'center', color: '#757575', fontSize: '13px' }
					},
					window.bricksData.i18n.loading
				)
			: filteredOptions.length > 0
				? filteredOptions.map((option) =>
						createOptionItem(option, currentValue, handleOptionToggle, property.multiple)
					)
				: createElement(
						'div',
						{
							key: 'no-results',
							style: { padding: '12px', textAlign: 'center', color: '#757575', fontSize: '13px' }
						},
						searchTerm && searchTerm.length > 0 && searchTerm.length < 3
							? window.bricksData.i18n.typeToSearch
							: window.bricksData.i18n.noOptionsFound
					)
	)

	return createElement('div', { key: 'dropdown-panel', style: panelStyle }, [
		searchInput,
		optionsList
	])
}

// Helper: Create individual option item
function createOptionItem(option, currentValue, handleOptionToggle, isMultiple) {
	const { createElement } = window.wp.element
	const isSelected = Array.isArray(currentValue)
		? currentValue.includes(option.value)
		: currentValue === option.value

	const itemStyle = {
		padding: '8px 12px',
		cursor: 'pointer',
		backgroundColor: isSelected ? '#0073aa' : 'transparent',
		color: isSelected ? '#fff' : '#000',
		display: 'flex',
		alignItems: 'center',
		fontSize: '13px',
		borderBottom: '1px solid #f0f0f0'
	}

	return createElement(
		'div',
		{
			key: option.value,
			onClick: () => handleOptionToggle(option.value, isSelected),
			style: itemStyle,
			onMouseEnter: (e) => {
				if (!isSelected) e.target.style.backgroundColor = '#f0f0f0'
			},
			onMouseLeave: (e) => {
				if (!isSelected) e.target.style.backgroundColor = 'transparent'
			}
		},
		[
			isMultiple &&
				createElement('input', {
					key: 'checkbox',
					type: 'checkbox',
					checked: isSelected,
					onChange: () => {}, // Handled by parent click
					style: { marginRight: '8px' }
				}),
			createElement('span', { key: 'label' }, option.label)
		].filter(Boolean)
	)
}

// Helper: Create error display
function createErrorDisplay() {
	const { createElement } = window.wp.element

	return createElement(
		'div',
		{
			style: { padding: '8px', border: '1px solid red', color: 'red' }
		},
		window.bricksData.i18n.errorCouldNotLoadSelect
	)
}
