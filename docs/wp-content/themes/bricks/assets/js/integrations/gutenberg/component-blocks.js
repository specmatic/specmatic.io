/**
 * Validate and convert property value based on expected type
 */
function validatePropertyValue(value, propertyType) {
	// Handle arrays - only certain types should accept arrays
	if (Array.isArray(value)) {
		const arrayTypes = ['class', 'image-gallery']

		if (arrayTypes.includes(propertyType)) {
			return value // Keep as array
		} else {
			// Convert array to string for text-like properties
			if (['text', 'editor', 'textarea'].includes(propertyType)) {
				return value.length > 0 ? value.join(', ') : ''
			}
			// For other types, take first value or empty string
			return value.length > 0 ? value[0] : ''
		}
	}

	// Handle objects - only certain types should accept objects
	if (typeof value === 'object' && value !== null) {
		const objectTypes = ['image', 'icon', 'link', 'query', 'image-gallery']

		if (objectTypes.includes(propertyType)) {
			return value // Keep as object
		} else {
			// Convert object to string for text-like properties
			if (['text', 'editor', 'textarea'].includes(propertyType)) {
				// Try to extract a meaningful string from the object
				if (value.url) return value.url
				if (value.name) return value.name
				if (value.label) return value.label
				return JSON.stringify(value)
			}
			// For other types, return empty string
			return ''
		}
	}

	// For primitive values, return as-is
	return value
}

/**
 * Create unified property update function
 */
function createPropertyUpdater(props, component) {
	return function updateProperty(propertyId, value) {
		const currentProperties = props.attributes.properties || {}
		const newProperties = { ...currentProperties }

		// Find property definition to get its type
		let propertyType = 'text' // Default fallback
		if (component && component.properties) {
			const propertyDef = component.properties.find((prop) => prop.id === propertyId)
			if (propertyDef) {
				propertyType = propertyDef.type
			}
		}

		// Remove property if value is empty/null/undefined
		if (value === null || value === undefined || value === '') {
			delete newProperties[propertyId]
		}
		// Remove empty arrays
		else if (Array.isArray(value) && value.length === 0) {
			delete newProperties[propertyId]
		}
		// Remove empty objects
		else if (
			typeof value === 'object' &&
			!Array.isArray(value) &&
			Object.keys(value).length === 0
		) {
			delete newProperties[propertyId]
		}
		// Validate and set the value
		else {
			const validatedValue = validatePropertyValue(value, propertyType)
			newProperties[propertyId] = validatedValue
		}

		props.setAttributes({ properties: newProperties })
	}
}

/**
 * Create appropriate Gutenberg control based on property type
 */
function bricksCreatePropertyControl(property, props, component) {
	try {
		// Create unified property updater with component context for type validation
		const updateProperty = createPropertyUpdater(props, component)

		// Create wrapper props that work with the new system
		const controlProps = {
			attributes: {
				[property.id]: (props.attributes.properties || {})[property.id]
			},
			setAttributes: function (newAttrs) {
				const value = newAttrs[property.id]
				updateProperty(property.id, value)
			}
		}

		switch (property.type) {
			case 'text':
				return window.createBricksTextControl(property, controlProps)

			case 'editor':
				return window.createBricksRichTextControl(property, controlProps)

			case 'select':
				return window.createBricksSelectControl(property, controlProps)

			case 'toggle':
				return window.createBricksToggleControl(property, controlProps)

			case 'icon':
				return window.createBricksIconControl(property, controlProps)

			case 'image':
				return window.createBricksImageControl(property, controlProps)

			case 'image-gallery':
				return window.createBricksGalleryControl(property, controlProps)

			case 'link':
				return window.createBricksLinkControl(property, controlProps)

			case 'query':
				return window.createBricksQueryControl(property, controlProps)

			case 'class':
				return window.createBricksClassControl(property, controlProps)

			default:
				// Fallback to text control
				return window.createBricksTextControl(property, controlProps)
		}
	} catch (error) {
		// Return a simple text control as fallback
		const fallbackProps = {
			attributes: {
				[property.id]: (props.attributes.properties || {})[property.id]
			},
			setAttributes: function (newAttrs) {
				const updateProperty = createPropertyUpdater(props, component)
				updateProperty(property.id, newAttrs[property.id])
			}
		}
		return window.createBricksTextControl(property, fallbackProps)
	}
}

/**
 * Register Bricks components as Gutenberg blocks using ServerSideRender
 */
function bricksRegisterComponentBlocks() {
	if (!window?.wp?.blocks || !window.bricksGutenbergData?.components) {
		return
	}

	const { registerBlockType } = window.wp.blocks
	const { createElement } = window.wp.element
	const { Placeholder } = window.wp.components
	const ServerSideRender = window.wp.serverSideRender || window.wp.components.ServerSideRender

	// Register block category
	window.wp.blocks.setCategories([
		...window.wp.blocks.getCategories(),
		{
			slug: 'bricks',
			title: `Bricks: ${window.bricksData.i18n.components}`
		}
	])

	// Get enabled component IDs from PHP
	const enabledComponentIds = window.bricksGutenbergData.enabledComponentIds || []

	// Register each component as a block, if enabled
	window.bricksGutenbergData.components.forEach(function (component) {
		if (!component.id || !component.elements || !component.elements.length) {
			return
		}

		// Only register enabled components
		if (!enabledComponentIds.includes(component.id)) {
			return
		}

		// Get component name from first element or use ID
		const componentName =
			component.elements[0].label || window.bricksData.i18n.component + ' ' + component.id
		const blockName = 'bricks-components/' + component.id

		const attributes = {
			componentId: {
				type: 'string',
				default: component.id
			},
			properties: {
				type: 'object',
				default: {}
			},
			blockId: {
				type: 'string',
				default: ''
			}
		}

		try {
			registerBlockType(blockName, {
				title: componentName,
				category: 'bricks',
				description: component.description,
				icon: createElement(
					'svg',
					{
						viewBox: '0 0 24 24',
						xmlns: 'http://www.w3.org/2000/svg',
						style: { fill: 'currentColor' }
					},
					createElement('path', {
						d: 'M7.94514768,0 L8.35021097,0.253164557 L8.35021097,7.29113924 C9.77919139,6.34598684 11.3600476,5.87341772 13.092827,5.87341772 C15.5907298,5.87341772 17.6610326,6.74542025 19.3037975,8.48945148 C20.9240587,10.2334827 21.7341772,12.382547 21.7341772,14.9367089 C21.7341772,17.5021225 20.9184329,19.6511868 19.2869198,21.3839662 C17.6441549,23.1279975 15.579478,24 13.092827,24 C10.9212268,24 9.06470532,23.2236365 7.52320675,21.6708861 L7.52320675,23.5780591 L3,23.5780591 L3,0.556962025 L7.94514768,0 Z M12.2320675,10.4472574 C11.0393752,10.4472574 10.0436046,10.8523166 9.24472574,11.6624473 C8.44584692,12.4950815 8.0464135,13.5864911 8.0464135,14.9367089 C8.0464135,16.2869266 8.44584692,17.3727104 9.24472574,18.1940928 C10.0323527,19.0154753 11.0281234,19.4261603 12.2320675,19.4261603 C13.5035225,19.4261603 14.5330481,18.9985978 15.3206751,18.1434599 C16.0970503,17.2995738 16.4852321,16.2306675 16.4852321,14.9367089 C16.4852321,13.6427502 16.0914245,12.5682181 15.3037975,11.7130802 C14.5161705,10.8691941 13.4922707,10.4472574 12.2320675,10.4472574 Z'
					})
				),
				keywords: ['bricks', window.bricksData.i18n.component],
				attributes: attributes,
				supports: {
					align: ['wide', 'full'],
					customClassName: false,
					html: false,
					anchor: false,
					className: false
				},
				edit: function (props) {
					try {
						const { InspectorControls } = window.wp.blockEditor || window.wp.editor
						const { PanelBody } = window.wp.components
						const { useEffect, useState, useRef, useMemo } = window.wp.element

						// Set blockId on first render if not already set
						useEffect(() => {
							if (!props.attributes.blockId && props.clientId) {
								props.setAttributes({ blockId: props.clientId })
							}
						}, [props.clientId, props.attributes.blockId])

						// Track last successful render for smooth loading transitions
						const [lastRender, setLastRender] = useState('')
						const renderRef = useRef(null)
						const [debouncedAttributes, setDebouncedAttributes] = useState(props.attributes)

						// Debounce attribute changes to prevent multiple ServerSideRender calls per keystroke
						useEffect(() => {
							const timeoutId = setTimeout(() => {
								setDebouncedAttributes(props.attributes)
							}, 300) // 300ms delay

							return () => clearTimeout(timeoutId)
						}, [JSON.stringify(props.attributes)])

						// Pass componentId, blockId and properties
						const memoizedSafeAttributes = useMemo(() => {
							const safeAttributes = {
								componentId: debouncedAttributes.componentId,
								blockId: debouncedAttributes.blockId
							}

							// Only include properties if they exist and have content
							const properties = debouncedAttributes.properties || {}
							if (Object.keys(properties).length > 0) {
								// Clean up empty values
								const cleanProperties = {}
								Object.keys(properties).forEach((key) => {
									const value = properties[key]
									if (value !== null && value !== undefined && value !== '') {
										// For arrays, only include if not empty
										if (Array.isArray(value)) {
											if (value.length > 0) {
												cleanProperties[key] = value
											}
										}
										// For objects, only include if not empty
										else if (typeof value === 'object') {
											if (Object.keys(value).length > 0) {
												cleanProperties[key] = value
											}
										}
										// For primitives, include as-is
										else {
											cleanProperties[key] = value
										}
									}
								})

								if (Object.keys(cleanProperties).length > 0) {
									safeAttributes.properties = cleanProperties
								}
							}

							return safeAttributes
						}, [JSON.stringify(debouncedAttributes)])

						// Create stable cached content to prevent image flashing
						const cachedContent = useMemo(() => {
							if (!lastRender) return null

							return createElement('div', {
								key: `cached-content-${lastRender.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '')}`, // Stable key based on content
								'data-cached': 'true',
								style: { opacity: 0.98 },
								dangerouslySetInnerHTML: { __html: lastRender }
							})
						}, [lastRender])

						// Capture content only when attributes actually change - single delayed capture
						useEffect(() => {
							const timeoutId = setTimeout(() => {
								if (renderRef.current) {
									const serverRenderDiv =
										renderRef.current.querySelector('[class*="wp-block"]:not([data-cached])') ||
										renderRef.current.querySelector('div > div:not([data-cached])')

									if (serverRenderDiv) {
										const content = serverRenderDiv.outerHTML

										// More strict content validation to avoid unnecessary updates
										if (
											content &&
											content.trim() &&
											content.length > 50 &&
											!content.includes(window.bricksData.i18n.loadingComponentPreview) &&
											!content.includes(window.bricksData.i18n.componentPreviewError) &&
											!content.includes('data-cached') &&
											content !== lastRender
										) {
											// Only update if actually different
											setLastRender(content)
										}
									}
								}
							}, 1500) // Wait 1.5 seconds for ServerSideRender to complete

							return () => clearTimeout(timeoutId)
						}, [memoizedSafeAttributes]) // ONLY run when attributes change - removed lastRender from deps!

						// Separate initial content capture on mount
						useEffect(() => {
							const timeoutId = setTimeout(() => {
								if (renderRef.current && !lastRender) {
									const serverRenderDiv =
										renderRef.current.querySelector('[class*="wp-block"]:not([data-cached])') ||
										renderRef.current.querySelector('div > div:not([data-cached])')

									if (serverRenderDiv) {
										const content = serverRenderDiv.outerHTML
										if (
											content &&
											content.trim() &&
											content.length > 50 &&
											!content.includes(window.bricksData.i18n.loadingComponentPreview) &&
											!content.includes(window.bricksData.i18n.componentPreviewError) &&
											!content.includes('data-cached')
										) {
											setLastRender(content)
										}
									}
								}
							}, 2000) // Initial load takes longer

							return () => clearTimeout(timeoutId)
						}, []) // Only run once on mount

						if (!ServerSideRender) {
							return createElement(
								'div',
								{
									style: { padding: '20px', border: '2px dashed #ccc', textAlign: 'center' }
								},
								window.bricksData.i18n.serverSideRenderNotAvailable
							)
						}

						// Build property controls (only for properties with connections)
						let propertyControls = []
						if (component.properties && Array.isArray(component.properties)) {
							component.properties.forEach(function (property) {
								if (property.id && property.label) {
									// Skip properties that don't have connections to any elements
									if (
										!property.connections ||
										typeof property.connections !== 'object' ||
										Object.keys(property.connections).length === 0
									) {
										return
									}

									const control = bricksCreatePropertyControl(property, props, component)
									if (control) {
										propertyControls.push(control)
									}
								}
							})
						}

						// Create the editor UI
						const editorElements = []

						// Add property controls in inspector (sidebar)
						if (propertyControls.length > 0 && InspectorControls) {
							editorElements.push(
								createElement(
									InspectorControls,
									{ key: 'inspector' },
									createElement(
										PanelBody,
										{
											title: window.bricksData.i18n.properties,
											initialOpen: true
										},
										propertyControls
									)
								)
							)
						}

						// Memoize the ServerSideRender component to prevent unnecessary re-creation
						const serverSideRenderComponent = useMemo(() => {
							return createElement(ServerSideRender, {
								key: 'render',
								block: blockName,
								attributes: memoizedSafeAttributes,
								httpMethod: 'POST', // Use POST for better security - no attributes in URL
								// Add error handling
								LoadingResponsePlaceholder: function () {
									// Use memoized cached content to prevent image flashing
									if (cachedContent) {
										return cachedContent
									}

									// First load - show minimal loading
									return createElement(
										'div',
										{
											style: { minHeight: '20px', opacity: 0.5 }
										},
										window.bricksData.i18n.loadingComponentPreview
									)
								},
								ErrorResponsePlaceholder: function () {
									return createElement(
										'div',
										{
											style: {
												padding: '20px',
												border: '2px dashed #e65100',
												textAlign: 'center',
												color: '#e65100',
												backgroundColor: '#fff3e0'
											}
										},
										[
											createElement(
												'p',
												{ key: 'error-title', style: { fontWeight: 'bold', margin: '0 0 8px 0' } },
												window.bricksData.i18n.componentPreviewError
											),
											createElement(
												'p',
												{ key: 'message', style: { margin: '0', fontSize: '12px' } },
												window.bricksData.i18n.componentConfiguredButPreview
											)
										]
									)
								}
							})
						}, [memoizedSafeAttributes, !!cachedContent]) // Only recreate when attributes or cached content availability changes

						// Add the memoized ServerSideRender component with error boundary
						try {
							editorElements.push(
								createElement(
									'div',
									{
										key: 'render-wrapper',
										ref: renderRef
									},
									serverSideRenderComponent
								)
							)
						} catch (renderError) {
							console.error('ServerSideRender Error:', renderError)
							console.error('Block Name:', blockName)
							console.error('Safe Attributes:', memoizedSafeAttributes)
							editorElements.push(
								createElement(
									'div',
									{
										key: 'render-error',
										style: {
											padding: '20px',
											border: '2px solid #d32f2f',
											textAlign: 'center',
											color: '#d32f2f',
											backgroundColor: '#ffebee'
										}
									},
									[
										createElement(
											'div',
											{ key: 'render-error-title' },
											window.bricksData.i18n.componentPreviewUnavailable
										),
										createElement(
											'div',
											{ key: 'details', style: { fontSize: '12px', marginTop: '8px' } },
											renderError.message
										)
									]
								)
							)
						}

						return editorElements
					} catch (error) {
						console.error('Bricks Gutenberg Block Error:', error)
						console.error('Component ID:', component.id)
						console.error('Props:', props)
						return createElement(
							'div',
							{
								style: {
									padding: '20px',
									border: '2px dashed #ccc',
									textAlign: 'center',
									color: '#666'
								}
							},
							[
								createElement(
									'div',
									{ key: 'block-error-title' },
									window.bricksData.i18n.errorRenderingComponent
								),
								createElement(
									'div',
									{ key: 'details', style: { fontSize: '12px', marginTop: '8px' } },
									error.message
								)
							]
						)
					}
				},
				save: function () {
					// Return null for server-side rendering
					return null
				}
			})
		} catch (error) {
			console.error('Error registering block:', blockName, error)
		}
	})

	// Register placeholder blocks for disabled components immediately
	// This is more reliable than overriding getBlockType
	window.bricksGutenbergData.components.forEach(function (component) {
		if (!component.id || !component.elements || !component.elements.length) {
			return
		}

		// If component is NOT enabled, register it as a placeholder
		if (!enabledComponentIds.includes(component.id)) {
			const blockName = 'bricks-components/' + component.id
			const componentName =
				component.elements[0].label || `${window.bricksData.i18n.component} ${component.id}`

			registerBlockType(blockName, {
				title: componentName,
				category: 'bricks',
				icon: createElement(
					'svg',
					{
						viewBox: '0 0 24 24',
						xmlns: 'http://www.w3.org/2000/svg',
						style: { fill: 'currentColor', opacity: 0.5 }
					},
					createElement('path', {
						d: 'M7.94514768,0 L8.35021097,0.253164557 L8.35021097,7.29113924 C9.77919139,6.34598684 11.3600476,5.87341772 13.092827,5.87341772 C15.5907298,5.87341772 17.6610326,6.74542025 19.3037975,8.48945148 C20.9240587,10.2334827 21.7341772,12.382547 21.7341772,14.9367089 C21.7341772,17.5021225 20.9184329,19.6511868 19.2869198,21.3839662 C17.6441549,23.1279975 15.579478,24 13.092827,24 C10.9212268,24 9.06470532,23.2236365 7.52320675,21.6708861 L7.52320675,23.5780591 L3,23.5780591 L3,0.556962025 L7.94514768,0 Z M12.2320675,10.4472574 C11.0393752,10.4472574 10.0436046,10.8523166 9.24472574,11.6624473 C8.44584692,12.4950815 8.0464135,13.5864911 8.0464135,14.9367089 C8.0464135,16.2869266 8.44584692,17.3727104 9.24472574,18.1940928 C10.0323527,19.0154753 11.0281234,19.4261603 12.2320675,19.4261603 C13.5035225,19.4261603 14.5330481,18.9985978 15.3206751,18.1434599 C16.0970503,17.2995738 16.4852321,16.2306675 16.4852321,14.9367089 C16.4852321,13.6427502 16.0914245,12.5682181 15.3037975,11.7130802 C14.5161705,10.8691941 13.4922707,10.4472574 12.2320675,10.4472574 Z'
					})
				),
				keywords: ['bricks', window.bricksData.i18n.component],
				attributes: {
					componentId: {
						type: 'string',
						default: component.id
					},
					properties: {
						type: 'object',
						default: {}
					}
				},
				supports: {
					customClassName: false,
					html: false,
					anchor: false,
					className: false,
					inserter: false // Don't show in inserter
				},
				edit: function () {
					return createElement(Placeholder, {
						icon: 'warning',
						label: `${window.bricksData.i18n.blockNotAvailable}: ${componentName} [BRICKS]`,
						instructions: window.bricksData.i18n.componentNotEnabledInstructions,
						className: 'bricks-disabled-component-placeholder'
					})
				},
				save: function () {
					return null
				}
			})
		}
	})
}

// Export the registration function to global scope
window.bricksRegisterComponentBlocks = bricksRegisterComponentBlocks

document.addEventListener('DOMContentLoaded', function () {
	bricksRegisterComponentBlocks()
})
