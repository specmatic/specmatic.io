/**
 * Create comprehensive icon control matching ControlIcon.vue functionality
 */
function createBricksIconControl(property, props) {
	try {
		const { SelectControl, TextControl, BaseControl, Button, Modal } = window.wp.components
		const { createElement, useState, useMemo, Fragment } = window.wp.element

		// Get Bricks data
		const bricksData = window.bricksData || {}
		const gutenbergData = window.bricksGutenbergData || {}
		const i18n = bricksData.i18n || {}

		// Get current icon value (should be Bricks icon object or empty)
		const currentValue = props.attributes[property.id] || {}
		const hasIcon =
			currentValue.library && (currentValue.icon || currentValue.svg || currentValue.dynamicData)

		// State for search and popup
		const [searchTerm, setSearchTerm] = useState('')
		const [showPopup, setShowPopup] = useState(false)
		const [dynamicDataValue, setDynamicDataValue] = useState(currentValue.dynamicData || '')

		// Build icon data structures (matching ControlIcon.vue created() logic)
		const iconData = useMemo(() => {
			// Import the dedicated icon font files
			const FontAwesomeBrands = window.FontAwesomeBrands || []
			const FontAwesomeRegular = window.FontAwesomeRegular || []
			const FontAwesomeSolid = window.FontAwesomeSolid || []
			const IoniconsClassNames = window.IoniconsClassNames || []
			const ThemifyClassNames = window.ThemifyClassNames || []

			const icons = {
				fontawesomeBrands: {},
				fontawesomeRegular: {},
				fontawesomeSolid: {},
				ionicons: {},
				themify: {}
			}

			// Build FontAwesome brands icons array for select dropdown
			FontAwesomeBrands.forEach((className) => {
				const fullClassName = `fab ${className}`
				icons.fontawesomeBrands[fullClassName] = {
					html: `<i class="${fullClassName}"></i>`,
					title: fullClassName
				}
			})

			// Build FontAwesome regular icons array for select dropdown
			FontAwesomeRegular.forEach((className) => {
				const fullClassName = `far ${className}`
				icons.fontawesomeRegular[fullClassName] = {
					html: `<i class="${fullClassName}"></i>`,
					title: fullClassName
				}
			})

			// Build FontAwesome solid icons array for select dropdown
			FontAwesomeSolid.forEach((className) => {
				const fullClassName = `fas ${className}`
				icons.fontawesomeSolid[fullClassName] = {
					html: `<i class="${fullClassName}"></i>`,
					title: fullClassName
				}
			})

			// Build Ionicons icons array for select dropdown
			IoniconsClassNames.forEach((className) => {
				icons.ionicons[className] = {
					html: `<i class="${className}"></i>`,
					title: className
				}
			})

			// Build Themify icons array for select dropdown
			ThemifyClassNames.forEach((className) => {
				icons.themify[className] = {
					html: `<i class="${className}"></i>`,
					title: className
				}
			})

			return icons
		}, [])

		// Get available libraries (matching ControlIcon.vue availableLibraries computed)
		const getAvailableLibraries = () => {
			const disabledSets = gutenbergData.disabledIconSets || []
			let libraries = {}

			// Add placeholder option
			libraries[''] = i18n.selectIconSet || i18n.selectIconLibrary

			// Define built-in libraries (if not custom requested)
			if (property.libraries !== 'custom') {
				libraries = {
					...libraries,
					fontawesomeBrands: i18n.fontAwesomeBrands,
					fontawesomeRegular: i18n.fontAwesomeRegular,
					fontawesomeSolid: i18n.fontAwesomeSolid,
					ionicons: i18n.ionicons,
					themify: i18n.themify
				}
			}

			// Get current library from the selected icon
			const currentLibrary = currentValue.library

			// Filter out disabled built-in libraries, but keep the current one if it's in use
			Object.keys(libraries).forEach((key) => {
				if (key !== '' && disabledSets.includes(key) && key !== currentLibrary) {
					delete libraries[key]
				}
			})

			// Built-in icon sets active: Prepend group title to libraries
			if (Object.keys(libraries).length > 1) {
				libraries = {
					'': libraries[''], // Keep placeholder first
					builtInGroupTitle: i18n.builtInIconSets,
					...Object.fromEntries(Object.entries(libraries).filter(([key]) => key !== ''))
				}
			}

			// Add custom icon sets group title
			let customIconSets = {
				customGroupTitle: i18n.customIconSets
			}

			// Add custom icon sets that aren't disabled or are currently in use
			const iconSets = gutenbergData.iconSets || []
			const customIcons = gutenbergData.customIcons || []

			iconSets.forEach((set) => {
				const customSetKey = `custom_${set.id}`
				// Skip this set if it's disabled and not currently in use
				if (disabledSets.includes(set.id) && customSetKey !== currentLibrary) {
					return
				}

				// Skip empty icon sets (unless it's the current library)
				const hasIcons = customIcons.some((icon) => icon.setId === set.id)

				if (hasIcons || customSetKey === currentLibrary) {
					customIconSets[customSetKey] = set.name
				}
			})

			// Add custom icon sets to libraries
			if (Object.keys(customIconSets).length > 1) {
				libraries = {
					...libraries,
					...customIconSets
				}
			}

			// Add SVG & DD options to libraries if not custom requested
			if (property.libraries !== 'custom') {
				// Add "iconSource" group title
				libraries['iconSourceGroupTitle'] = i18n.iconSource

				// Add SVG library
				libraries.svg = 'SVG'

				// Add dynamic data option
				libraries.dynamicData = i18n.dynamicData
			}

			return libraries
		}

		// Get current options (matching ControlIcon.vue options computed)
		const getCurrentOptions = () => {
			let currentOptions = {}

			if (currentValue.library) {
				if (currentValue.library.startsWith('custom_')) {
					// Handle custom icon set
					const setId = currentValue.library.replace('custom_', '')
					const customIcons = gutenbergData.customIcons || []
					const icons = customIcons.filter((icon) => icon.setId === setId)
					icons.forEach((icon) => {
						currentOptions[icon.id] = {
							html: `<img src="${icon.url}" title="${icon.name}" />`,
							title: icon.name
						}
					})
				} else {
					// Handle built-in icon sets
					currentOptions = iconData[currentValue.library] || {}
				}
			} else {
				currentOptions = iconData.ionicons || {}
			}

			return currentOptions
		}

		// Filter icons based on search term (matching ControlIcon.vue options computed)
		const filteredIcons = useMemo(() => {
			const currentOptions = getCurrentOptions()
			let filteredOptions = { ...currentOptions }

			// Filter icons based on search input
			const searchFor = searchTerm ? searchTerm.toLowerCase() : ''
			if (searchFor) {
				Object.keys(filteredOptions).forEach((key) => {
					const iconName = filteredOptions[key]?.title || key
					if (!iconName.toLowerCase().includes(searchFor)) {
						delete filteredOptions[key]
					}
				})
			}

			return filteredOptions
		}, [currentValue.library, searchTerm])

		// Handle library change (matching ControlIcon.vue setLibrary method)
		const onChangeLibrary = (library) => {
			const newValue = { ...currentValue }

			if (library) {
				newValue.library = library
				// Clear icon data when changing library (matching ControlIcon.vue watch)
				if (library !== 'svg' && library !== 'dynamicData') {
					delete newValue.svg
					delete newValue.dynamicData
					delete newValue.icon
				}
			} else {
				// Clear all icon data
				props.setAttributes({ [property.id]: {} })
				return
			}

			props.setAttributes({ [property.id]: newValue })
			setSearchTerm('') // Reset search when library changes
		}

		// Handle icon selection (matching ControlIcon.vue updateIcon method)
		const onSelectIcon = (iconKey) => {
			const newValue = { ...currentValue }

			// Is custom icon set (SVG)
			if (currentValue.library && currentValue.library.startsWith('custom_')) {
				// Get custom icon data
				const customIcons = gutenbergData.customIcons || []
				const iconData = customIcons.find((iconData) => iconData.id === iconKey)
				if (iconData) {
					newValue.svg = {
						id: iconData.attachment_id,
						icon_id: iconData.id,
						url: iconData.url
					}
					delete newValue.icon
				}
			}
			// Is icon font
			else {
				newValue.icon = iconKey
				delete newValue.svg
			}

			props.setAttributes({ [property.id]: newValue })
			setShowPopup(false)
		}

		// Handle dynamic data change
		const onChangeDynamicData = (value) => {
			setDynamicDataValue(value)
			const newValue = { ...currentValue, dynamicData: value }
			props.setAttributes({ [property.id]: newValue })
		}

		// Handle SVG change
		const onChangeSvg = (key, value) => {
			const newValue = { ...currentValue }
			if (!newValue.svg) newValue.svg = {}
			newValue.svg[key] = value
			props.setAttributes({ [property.id]: newValue })
		}

		// Clear icon
		const onClearIcon = () => {
			props.setAttributes({ [property.id]: {} })
			setShowPopup(false)
		}

		// Check if the current icon is a custom icon (matching ControlIcon.vue computed)
		const isCustomIcon = () => {
			return (
				currentValue.icon &&
				currentValue.icon.startsWith('icon_') &&
				currentValue.library &&
				currentValue.library.startsWith('custom_')
			)
		}

		// Get icon source URL (matching ControlIcon.vue iconSrc computed)
		const getIconSrc = () => {
			if (currentValue.svg) {
				return currentValue.svg.url
			} else if (isCustomIcon()) {
				const iconId = currentValue.icon
				const customIcons = gutenbergData.customIcons || []
				const icon = customIcons.find((icon) => icon.id === iconId)
				return icon ? icon.url : ''
			}
			return ''
		}

		// Get icon preview element (matching ControlIcon.vue template logic)
		const getIconPreview = () => {
			// Check if it's a custom icon (SVG)
			if (currentValue.svg || isCustomIcon()) {
				const iconSrc = getIconSrc()
				if (iconSrc) {
					return createElement('img', {
						src: iconSrc,
						alt: '',
						style: { maxWidth: '100%', maxHeight: '100%' }
					})
				}
			}
			// Dynamic data preview
			else if (currentValue.library === 'dynamicData' && currentValue.dynamicData) {
				return createElement('div', {
					className: 'dynamic-data-preview',
					dangerouslySetInnerHTML: { __html: currentValue.dynamicData }
				})
			}
			// Font icon
			else if (currentValue.icon) {
				return createElement('i', { className: currentValue.icon })
			}
			return null
		}

		// Get custom icon set background color (matching ControlIcon.vue computed)
		const getIconSetBackgroundColor = () => {
			if (!currentValue.library || !currentValue.library.startsWith('custom_')) {
				return {}
			}

			const setId = currentValue.library.replace('custom_', '')
			const customIconSet = (gutenbergData.iconSets || []).find((set) => set.id === setId)

			return customIconSet?.backgroundColor
				? { backgroundColor: customIconSet.backgroundColor }
				: {}
		}

		// Build the control (matching ControlIcon.vue template structure)
		return createElement(
			BaseControl,
			{
				key: property.id,
				label: property.label,
				help: property.help || i18n.selectAnIconLibrary,
				__nextHasNoMarginBottom: true
			},
			[
				// Icon preview button that opens popup (matching ControlIcon.vue bricks-control-preview)
				createElement(
					'div',
					{
						key: 'preview-wrapper',
						style: { marginBottom: '8px' }
					},
					createElement(
						Button,
						{
							key: 'preview-button',
							onClick: () => setShowPopup(true),
							className: `bricks-control-preview ${!hasIcon ? 'empty' : ''} ${
								currentValue.svg ? 'svg' : ''
							}`,
							style: {
								...getIconSetBackgroundColor(),
								width: '60px',
								height: '60px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								border: '1px solid #ddd',
								borderRadius: '2px',
								fontSize: '24px',
								cursor: 'pointer'
							}
						},
						hasIcon ? getIconPreview() : createElement('span', { style: { color: '#999' } }, '+')
					)
				),

				// Popup/Modal for icon selection (matching ControlIcon.vue panel-control-popup)
				showPopup &&
					createElement(
						Modal,
						{
							key: 'icon-modal',
							title: i18n.selectIcon,
							onRequestClose: () => setShowPopup(false),
							style: { maxWidth: '90%', width: '800px' }
						},
						[
							// Library selector wrapper (matching ControlIcon.vue control-select-wrapper)
							createElement(
								'div',
								{
									key: 'control-select-wrapper',
									style: { marginBottom: '16px' }
								},
								createElement(SelectControl, {
									key: 'library',
									label: i18n.source,
									value: currentValue.library || '',
									options: Object.keys(getAvailableLibraries()).map((key) => ({
										label: getAvailableLibraries()[key],
										value: key,
										disabled: key.includes('GroupTitle')
									})),
									onChange: onChangeLibrary
								})
							),

							// Icon selection for font libraries (matching ControlIcon.vue icons-wrapper)
							currentValue.library &&
								currentValue.library !== 'svg' &&
								currentValue.library !== 'dynamicData' &&
								createElement('div', { key: 'icons-wrapper', style: { marginBottom: '16px' } }, [
									// Search input (matching ControlIcon.vue)
									createElement(TextControl, {
										__next40pxDefaultSize: true,
										__nextHasNoMarginBottom: true,
										key: 'search',
										label: i18n.searchFor,
										value: searchTerm,
										onChange: setSearchTerm,
										placeholder: i18n.searchFor,
										style: { marginBottom: '10px' }
									}),

									// Icons list (matching ControlIcon.vue ul)
									Object.keys(filteredIcons).length > 0
										? createElement(
												'ul',
												{
													key: 'icons-list',
													style: {
														display: 'grid',
														gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
														gap: '10px',
														maxHeight: '400px',
														overflowY: 'auto',
														padding: '10px',
														border: '1px solid #ddd',
														borderRadius: '2px',
														listStyle: 'none',
														margin: 0
													}
												},
												// Icon items (matching ControlIcon.vue li)
												Object.keys(filteredIcons).map((iconKey) => {
													const option = filteredIcons[iconKey]
													const isActive =
														iconKey === currentValue.icon ||
														(currentValue.svg?.icon_id && currentValue.svg.icon_id === iconKey)

													return createElement(
														'li',
														{
															key: iconKey,
															onClick: () => onSelectIcon(iconKey),
															className: isActive ? 'active' : '',
															title: option?.title || iconKey,
															style: {
																...getIconSetBackgroundColor(),
																width: '60px',
																height: '60px',
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
																border: `2px solid ${isActive ? '#007cba' : '#ddd'}`,
																borderRadius: '2px',
																cursor: 'pointer',
																fontSize: '20px',
																transition: 'border-color 0.2s ease'
															}
														},
														// Render custom icon or font icon (matching ControlIcon.vue template)
														currentValue.library?.startsWith('custom_')
															? createElement('div', {
																	className: 'custom-icon',
																	style: getIconSetBackgroundColor(),
																	dangerouslySetInnerHTML: { __html: option.html }
																})
															: createElement('i', {
																	className: iconKey,
																	title: option?.title || iconKey
																})
													)
												})
											)
										: createElement(
												'div',
												{
													key: 'no-icons',
													style: { padding: '20px', textAlign: 'center', color: '#666' }
												},
												i18n.nothingFound
											)
								]),

							// Dynamic Data input (matching ControlIcon.vue dynamic-data)
							currentValue.library === 'dynamicData' &&
								createElement(
									'div',
									{ key: 'dynamic-data', style: { marginBottom: '16px' } },
									createElement(TextControl, {
										__next40pxDefaultSize: true,
										__nextHasNoMarginBottom: true,
										key: 'dynamic-data-input',
										label: i18n.dynamicData,
										value: dynamicDataValue,
										onChange: onChangeDynamicData,
										placeholder: i18n.dynamicDataTag,
										help: window.bricksData.i18n.enterDynamicDataTagIconFields
									})
								),

							// SVG controls (matching ControlIcon.vue svg-wrapper)
							currentValue.library === 'svg' &&
								createElement('div', { key: 'svg-wrapper', style: { marginBottom: '16px' } }, [
									createElement(TextControl, {
										__next40pxDefaultSize: true,
										__nextHasNoMarginBottom: true,
										key: 'svg-url',
										label: window.bricksData.i18n.svgUrl,
										value: currentValue.svg?.url,
										onChange: (value) => onChangeSvg('url', value),
										placeholder: window.bricksData.i18n.enterSvgUrl
									}),
									createElement(TextControl, {
										__next40pxDefaultSize: true,
										__nextHasNoMarginBottom: true,
										key: 'height',
										label: i18n.height,
										value: currentValue.height,
										onChange: (value) => {
											const newValue = { ...currentValue, height: value }
											props.setAttributes({ [property.id]: newValue })
										}
									}),
									createElement(TextControl, {
										__next40pxDefaultSize: true,
										__nextHasNoMarginBottom: true,
										key: 'width',
										label: i18n.width,
										value: currentValue.width,
										onChange: (value) => {
											const newValue = { ...currentValue, width: value }
											props.setAttributes({ [property.id]: newValue })
										}
									}),
									createElement(TextControl, {
										__next40pxDefaultSize: true,
										__nextHasNoMarginBottom: true,
										key: 'stroke-width',
										label: i18n.strokeWidth,
										value: currentValue.strokeWidth,
										onChange: (value) => {
											const newValue = { ...currentValue, strokeWidth: value }
											props.setAttributes({ [property.id]: newValue })
										}
									}),
									createElement(TextControl, {
										__next40pxDefaultSize: true,
										__nextHasNoMarginBottom: true,
										key: 'stroke',
										label: i18n.strokeColor,
										value: currentValue.stroke,
										onChange: (value) => {
											const newValue = { ...currentValue, stroke: value }
											props.setAttributes({ [property.id]: newValue })
										},
										placeholder: '#000000'
									}),
									createElement(TextControl, {
										__next40pxDefaultSize: true,
										__nextHasNoMarginBottom: true,
										key: 'fill',
										label: i18n.fill,
										value: currentValue.fill,
										onChange: (value) => {
											const newValue = { ...currentValue, fill: value }
											props.setAttributes({ [property.id]: newValue })
										},
										placeholder: '#000000'
									})
								]),

							// Clear button (matching ControlIcon.vue actions)
							hasIcon &&
								createElement(
									'div',
									{
										key: 'actions',
										style: { marginTop: '20px', textAlign: 'right' }
									},
									createElement(
										Button,
										{
											key: 'clear',
											onClick: onClearIcon,
											isDestructive: true,
											variant: 'secondary'
										},
										i18n.clear
									)
								)
						]
					)
			]
		)
	} catch (error) {
		console.error('Icon control error:', error)
		const { createElement } = window.wp.element
		return createElement(
			'div',
			{
				style: { padding: '8px', border: '1px solid red', color: 'red' }
			},
			bricksData?.i18n?.errorCouldNotLoadIcon
		)
	}
}

// Make function available globally
window.createBricksIconControl = createBricksIconControl
