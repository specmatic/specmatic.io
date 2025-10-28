/**
 * Create proper link control matching ControlLink.vue
 */
function createBricksLinkControl(property, props) {
	try {
		const { SelectControl, TextControl, CheckboxControl, BaseControl, Button } =
			window.wp.components
		const { MediaUpload, MediaUploadCheck } = window.wp.blockEditor
		const { createElement, useState, useEffect } = window.wp.element

		// Get current link value (should be Bricks link object or empty)
		const currentValue = props.attributes[property.id] || {}
		const hasLink =
			currentValue.type &&
			(currentValue.url ||
				currentValue.postId ||
				currentValue.taxonomy ||
				currentValue.useDynamicData)

		// State for taxonomies and terms
		const [taxonomies, setTaxonomies] = useState([])
		const [terms, setTerms] = useState([])
		const [loadingTerms, setLoadingTerms] = useState(false)

		const postSelectControl = window.createBricksSelectControl(
			{
				id: 'postId',
				label: window.bricksData.i18n.selectPost || window.bricksData.i18n.post,
				placeholder: window.bricksData.i18n.selectPost || window.bricksData.i18n.post,
				optionsAjax: {
					action: 'bricks_get_posts',
					postType: 'any',
					addLanguageToPostTitle: 'true'
				}
			},
			{
				...props,
				attributes: { ...props.attributes, postId: currentValue.postId || '' },
				setAttributes: (newAttrs) => {
					onChangePostId(newAttrs.postId)
				}
			}
		)

		// Exclusion system (matching ControlLink.vue exclude functionality)
		const exclude = Array.isArray(property.exclude) ? property.exclude : []

		// Link type options (matching ControlLink.vue)
		const allLinkTypes = [
			{ label: window.bricksData.i18n.selectLinkType, value: '' },
			{ label: window.bricksData.i18n.internal, value: 'internal' },
			{
				label: `${window.bricksData.i18n.taxonomy} (${window.bricksData.i18n.term})`,
				value: 'taxonomy'
			},
			{ label: window.bricksData.i18n.dynamicData, value: 'meta' },
			{ label: `${window.bricksData.i18n.customURL}`, value: 'external' },
			{ label: window.bricksData.i18n.media, value: 'media' }
		]

		// Add lightbox options if popup is enabled (check property config)
		if (property.popup !== false) {
			allLinkTypes.push(
				{ label: window.bricksData.i18n.lightboxImage, value: 'lightboxImage' },
				{ label: window.bricksData.i18n.lightboxVideo, value: 'lightboxVideo' }
			)
		}

		// Filter out excluded link types
		const linkTypes = allLinkTypes.filter((type) => !exclude.includes(type.value))

		// Helper function to check if a field should be shown
		const shouldShowField = (fieldName) => !exclude.includes(fieldName)

		const onChangeType = function (type) {
			try {
				const linkObject = type
					? {
							type: type,
							// Preserve existing relevant data based on type
							...(type === 'external' && currentValue.url ? { url: currentValue.url } : {}),
							...(type === 'internal' && currentValue.postId
								? { postId: currentValue.postId }
								: {}),
							...(currentValue.newTab ? { newTab: currentValue.newTab } : {}),
							...(currentValue.rel ? { rel: currentValue.rel } : {}),
							...(currentValue.ariaLabel ? { ariaLabel: currentValue.ariaLabel } : {}),
							...(currentValue.title ? { title: currentValue.title } : {})
						}
					: false // Return false when no type selected (matches Vue behavior)

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		const onChangeUrl = function (url) {
			try {
				const linkObject = {
					...currentValue,
					url: url
				}
				// Clean up incompatible properties
				delete linkObject.postId

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		const onChangePostId = function (postId) {
			try {
				const linkObject = {
					...currentValue,
					postId: postId
				}
				// Clean up incompatible properties
				delete linkObject.url

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		const onChangeNewTab = function (newTab) {
			try {
				const linkObject = {
					...currentValue,
					newTab: newTab
				}

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		const onChangeRel = function (rel) {
			try {
				const linkObject = {
					...currentValue,
					rel: rel || undefined
				}

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		const onChangeAriaLabel = function (ariaLabel) {
			try {
				const linkObject = {
					...currentValue,
					ariaLabel: ariaLabel || undefined
				}

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		const onChangeTitle = function (title) {
			try {
				const linkObject = {
					...currentValue,
					title: title || undefined
				}

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		const onChangeTaxonomy = function (taxonomy) {
			try {
				const linkObject = {
					...currentValue,
					taxonomy: taxonomy
				}
				// Clear term when taxonomy changes (matches Vue behavior)
				delete linkObject.term

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)

				// Load terms for the selected taxonomy
				if (taxonomy) {
					loadTermsForTaxonomy(taxonomy)
				} else {
					setTerms([])
				}
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		const onChangeTerm = function (term) {
			try {
				const linkObject = {
					...currentValue,
					term: term
				}

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		const onChangeDynamicData = function (useDynamicData) {
			try {
				const linkObject = {
					...currentValue,
					useDynamicData: useDynamicData || undefined
				}

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		const onChangeUrlParams = function (urlParams) {
			try {
				const linkObject = {
					...currentValue,
					urlParams: urlParams || undefined
				}

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		// Lightbox handlers
		const onChangeLightboxImage = function (media) {
			try {
				const linkObject = {
					...currentValue,
					lightboxImage: media || undefined
				}

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		const onChangeLightboxVideo = function (lightboxVideo) {
			try {
				const linkObject = {
					...currentValue,
					lightboxVideo: lightboxVideo || undefined
				}

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		const onChangeLightboxVideoNoControls = function (lightboxVideoNoControls) {
			try {
				const linkObject = {
					...currentValue,
					lightboxVideoNoControls: lightboxVideoNoControls || undefined
				}

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		const onChangeLightboxAnimationType = function (lightboxAnimationType) {
			try {
				const linkObject = {
					...currentValue,
					lightboxAnimationType: lightboxAnimationType || undefined
				}

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		const onChangeLightboxId = function (lightboxId) {
			try {
				const linkObject = {
					...currentValue,
					lightboxId: lightboxId || undefined
				}

				const newAttributes = {}
				newAttributes[property.id] = linkObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		const onClearLink = function () {
			try {
				const newAttributes = {}
				newAttributes[property.id] = false
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Link control error:', error)
			}
		}

		// Helper function to load taxonomies
		const loadTaxonomies = async () => {
			try {
				if (
					window.bricksData &&
					window.bricksData.controlOptions &&
					window.bricksData.controlOptions.taxonomies
				) {
					// Use pre-loaded taxonomies from Bricks data
					const taxonomyOptions = Object.entries(window.bricksData.controlOptions.taxonomies).map(
						([value, label]) => ({
							label,
							value
						})
					)
					setTaxonomies(taxonomyOptions)
				} else {
					// Fallback: load via WordPress REST API
					const response = await fetch('/wp-json/wp/v2/taxonomies')
					if (response.ok) {
						const taxonomiesData = await response.json()
						const taxonomyOptions = Object.entries(taxonomiesData)
							.filter(([, taxonomy]) => taxonomy.public)
							.map(([key, taxonomy]) => ({
								label: taxonomy.name,
								value: key
							}))
						setTaxonomies(taxonomyOptions)
					}
				}
			} catch (error) {
				console.error('Failed to load taxonomies:', error)
			}
		}

		// Helper function to load terms for a taxonomy
		const loadTermsForTaxonomy = async (taxonomy) => {
			try {
				setLoadingTerms(true)
				const response = await fetch(`/wp-json/wp/v2/${taxonomy}?per_page=100`)
				if (response.ok) {
					const termsData = await response.json()
					const termOptions = termsData.map((term) => ({
						label: term.name,
						value: term.id
					}))
					setTerms(termOptions)
				}
			} catch (error) {
				console.error('Failed to load terms:', error)
			} finally {
				setLoadingTerms(false)
			}
		}

		// Load taxonomies on component mount
		useEffect(() => {
			loadTaxonomies()
		}, [])

		// Load terms when taxonomy changes
		useEffect(() => {
			if (currentValue.taxonomy) {
				loadTermsForTaxonomy(currentValue.taxonomy)
			}
		}, [currentValue.taxonomy])

		// Build the control elements
		const controlElements = []

		// Link type selector
		controlElements.push(
			createElement(SelectControl, {
				__next40pxDefaultSize: true,
				__nextHasNoMarginBottom: true,
				key: 'type',
				label: window.bricksData.i18n.linkType,
				value: currentValue.type || '',
				options: linkTypes,
				onChange: onChangeType
			})
		)

		// Type-specific fields
		if (currentValue.type === 'external') {
			controlElements.push(
				createElement(TextControl, {
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
					key: 'url',
					label: window.bricksData.i18n.url,
					value: currentValue.url || '',
					placeholder: window.bricksData.i18n.httpsExampleCom,
					onChange: onChangeUrl
				})
			)
		}

		if (currentValue.type === 'internal') {
			// Use pre-created post select control to maintain hook order
			controlElements.push(postSelectControl)
		}

		if (currentValue.type === 'media') {
			controlElements.push(
				createElement(TextControl, {
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
					key: 'url',
					label: window.bricksData.i18n.mediaUrl,
					value: currentValue.url || '',
					placeholder: window.bricksData.i18n.httpsExampleComFile,
					help: window.bricksData.i18n.enterUrlOfMedia,
					onChange: onChangeUrl
				})
			)
		}

		// Taxonomy type fields
		if (currentValue.type === 'taxonomy') {
			// Taxonomy selector
			controlElements.push(
				createElement(SelectControl, {
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
					key: 'taxonomy',
					label: window.bricksData.i18n.taxonomy,
					value: currentValue.taxonomy || '',
					options: [{ label: window.bricksData.i18n.selectTaxonomy, value: '' }, ...taxonomies],
					onChange: onChangeTaxonomy
				})
			)

			// Term selector (only show if taxonomy is selected)
			if (currentValue.taxonomy) {
				controlElements.push(
					createElement(SelectControl, {
						__next40pxDefaultSize: true,
						__nextHasNoMarginBottom: true,
						key: 'term',
						label: window.bricksData.i18n.term,
						value: currentValue.term || '',
						options: [
							{
								label: loadingTerms
									? window.bricksData.i18n.loading
									: window.bricksData.i18n.selectTerm,
								value: ''
							},
							...terms
						],
						disabled: loadingTerms,
						onChange: onChangeTerm
					})
				)
			}
		}

		// Meta (Dynamic Data) type field
		if (currentValue.type === 'meta') {
			controlElements.push(
				createElement(TextControl, {
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
					key: 'useDynamicData',
					label: window.bricksData.i18n.dynamicData,
					value: currentValue.useDynamicData || '',
					placeholder: window.bricksData.i18n.dynamicData,
					help: window.bricksData.i18n.dynamicDataDescription,
					onChange: onChangeDynamicData
				})
			)
		}

		// URL Parameters for internal links
		if (currentValue.type === 'internal' && currentValue.postId) {
			controlElements.push(
				createElement(TextControl, {
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
					key: 'urlParams',
					label: window.bricksData.i18n.urlParameters,
					value: currentValue.urlParams || '',
					placeholder: '?source=brx#faq',
					onChange: onChangeUrlParams
				})
			)
		}

		// Lightbox Image fields
		if (currentValue.type === 'lightboxImage') {
			// Info message
			controlElements.push(
				createElement(
					'div',
					{
						key: 'lightbox-info',
						style: {
							padding: '8px 12px',
							backgroundColor: '#e7f3ff',
							border: '1px solid #8bb9de',
							borderRadius: '4px',
							marginBottom: '12px',
							fontSize: '12px',
							color: '#0073aa'
						}
					},
					window.bricksData.i18n.infoLightbox
				)
			)

			// Image selector
			controlElements.push(
				createElement(
					MediaUploadCheck,
					{ key: 'media-check-lightbox' },
					createElement(MediaUpload, {
						onSelect: onChangeLightboxImage,
						allowedTypes: ['image'],
						value: currentValue.lightboxImage?.id || '',
						render: ({ open }) => {
							return createElement(
								'div',
								{ key: 'lightbox-image-container' },
								[
									currentValue.lightboxImage?.url &&
										createElement('img', {
											key: 'preview',
											src: currentValue.lightboxImage.url,
											style: {
												maxWidth: '100%',
												height: '100px',
												objectFit: 'cover',
												marginBottom: '8px',
												borderRadius: '4px'
											}
										}),
									createElement(
										Button,
										{
											key: 'select-button',
											onClick: open,
											variant: currentValue.lightboxImage ? 'secondary' : 'primary',
											style: { width: '100%', marginBottom: '8px' }
										},
										currentValue.lightboxImage
											? window.bricksData.i18n.changeImage
											: window.bricksData.i18n.selectImage
									),
									currentValue.lightboxImage &&
										createElement(
											Button,
											{
												key: 'remove-button',
												onClick: () => onChangeLightboxImage(null),
												variant: 'secondary',
												isDestructive: true,
												style: { width: '100%' }
											},
											window.bricksData.i18n.removeImage
										)
								].filter(Boolean)
							)
						}
					})
				)
			)

			// Animation type
			if (window.bricksData.controlOptions?.lightboxAnimationTypes) {
				const animationOptions = Object.entries(
					window.bricksData.controlOptions.lightboxAnimationTypes
				).map(([value, label]) => ({
					label,
					value
				}))

				controlElements.push(
					createElement(SelectControl, {
						__next40pxDefaultSize: true,
						__nextHasNoMarginBottom: true,
						key: 'lightboxAnimationType',
						label: window.bricksData.i18n.lightboxAnimation,
						value: currentValue.lightboxAnimationType || '',
						options: [{ label: window.bricksData.i18n.zoom, value: '' }, ...animationOptions],
						onChange: onChangeLightboxAnimationType
					})
				)
			}

			// Lightbox ID
			controlElements.push(
				createElement(TextControl, {
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
					key: 'lightboxId',
					label: window.bricksData.i18n.lightboxId,
					value: currentValue.lightboxId || '',
					placeholder: window.bricksData.i18n.lightboxIdPlaceholder,
					onChange: onChangeLightboxId
				})
			)
		}

		// Lightbox Video fields
		if (currentValue.type === 'lightboxVideo') {
			// Info message
			controlElements.push(
				createElement(
					'div',
					{
						key: 'lightbox-video-info',
						style: {
							padding: '8px 12px',
							backgroundColor: '#e7f3ff',
							border: '1px solid #8bb9de',
							borderRadius: '4px',
							marginBottom: '12px',
							fontSize: '12px',
							color: '#0073aa'
						}
					},
					window.bricksData.i18n.infoLightbox
				)
			)

			// Video URL
			controlElements.push(
				createElement(TextControl, {
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
					key: 'lightboxVideo',
					label: window.bricksData.i18n.videoUrl,
					value: currentValue.lightboxVideo || '',
					placeholder: 'https://www.youtube.com/watch?v=...',
					help: window.bricksData.i18n.descriptionLightboxVideo,
					onChange: onChangeLightboxVideo
				})
			)

			// Video controls toggle
			if (currentValue.lightboxVideo) {
				controlElements.push(
					createElement(CheckboxControl, {
						__nextHasNoMarginBottom: true,
						key: 'lightboxVideoNoControls',
						label: `${window.bricksData.i18n.disable}: ${window.bricksData.i18n.controls}`,
						checked: currentValue.lightboxVideoNoControls || false,
						onChange: onChangeLightboxVideoNoControls
					})
				)
			}
		}

		// Common link attributes (show if type is selected and supports attributes)
		if (
			currentValue.type &&
			['external', 'internal', 'media', 'taxonomy', 'meta'].includes(currentValue.type)
		) {
			// New tab checkbox
			if (shouldShowField('newTab')) {
				controlElements.push(
					createElement(CheckboxControl, {
						__nextHasNoMarginBottom: true,
						key: 'newTab',
						label: window.bricksData.i18n.openInNewTab,
						checked: currentValue.newTab || false,
						onChange: onChangeNewTab
					})
				)
			}

			// Additional attributes in a styled container (only show if any attributes are allowed)
			const attributeFields = []

			if (shouldShowField('rel')) {
				attributeFields.push(
					createElement(TextControl, {
						__next40pxDefaultSize: true,
						__nextHasNoMarginBottom: true,
						key: 'rel',
						label: 'rel',
						value: currentValue.rel || '',
						placeholder: 'nofollow noopener',
						onChange: onChangeRel
					})
				)
			}

			if (shouldShowField('ariaLabel')) {
				attributeFields.push(
					createElement(TextControl, {
						__next40pxDefaultSize: true,
						__nextHasNoMarginBottom: true,
						key: 'ariaLabel',
						label: 'aria-label',
						value: currentValue.ariaLabel || '',
						onChange: onChangeAriaLabel
					})
				)
			}

			if (shouldShowField('title')) {
				attributeFields.push(
					createElement(TextControl, {
						__next40pxDefaultSize: true,
						__nextHasNoMarginBottom: true,
						key: 'link-title-control',
						label: 'title',
						value: currentValue.title || '',
						onChange: onChangeTitle
					})
				)
			}

			// Only show attributes container if there are fields to show
			if (attributeFields.length > 0) {
				controlElements.push(
					createElement(
						'div',
						{
							key: 'attributes',
							style: {
								marginTop: '16px',
								padding: '12px',
								backgroundColor: '#f9f9f9',
								border: '1px solid #e0e0e0',
								borderRadius: '4px'
							}
						},
						[
							createElement(
								'h4',
								{
									key: 'link-attributes-title',
									style: {
										margin: '0 0 8px 0',
										fontSize: '12px',
										fontWeight: '600',
										color: '#555'
									}
								},
								window.bricksData.i18n.linkAttributes
							),
							...attributeFields
						]
					)
				)
			}
		}

		// Link preview and clear button
		if (hasLink) {
			const linkPreview =
				currentValue.type === 'external' || currentValue.type === 'media'
					? currentValue.url
					: currentValue.type === 'internal'
						? `${window.bricksData.i18n.post}: ${currentValue.postId}`
						: window.bricksData.i18n.linkConfigured
			controlElements.push(
				createElement(
					'div',
					{
						key: 'link-preview',
						style: {
							marginTop: '12px',
							padding: '8px',
							border: '1px solid #ddd',
							borderRadius: '2px',
							backgroundColor: '#f8f9fa'
						}
					},
					[
						createElement(
							'div',
							{
								key: 'preview-header',
								style: {
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'flex-start',
									marginBottom: '4px'
								}
							},
							[
								createElement(
									'div',
									{
										key: 'preview-info',
										style: { flex: 1 }
									},
									[
										createElement(
											'div',
											{
												key: 'type',
												style: {
													fontSize: '11px',
													fontWeight: '600',
													color: '#666',
													textTransform: 'uppercase',
													marginBottom: '2px'
												}
											},
											currentValue.type
										),
										createElement(
											'div',
											{
												key: 'preview',
												style: {
													fontSize: '12px',
													color: '#333',
													wordBreak: 'break-all'
												}
											},
											linkPreview
										)
									]
								),
								createElement(
									Button,
									{
										key: 'clear',
										onClick: onClearLink,
										variant: 'secondary',
										size: 'small',
										isDestructive: true
									},
									window.bricksData.i18n.clear
								)
							]
						),

						// Show additional attributes if present
						currentValue.newTab || currentValue.rel || currentValue.ariaLabel || currentValue.title
							? createElement(
									'div',
									{
										key: 'attributes-preview',
										style: {
											marginTop: '8px',
											fontSize: '11px',
											color: '#666'
										}
									},
									[
										currentValue.newTab
											? createElement(
													'span',
													{ key: 'newtab', style: { marginRight: '8px' } },
													window.bricksData.i18n.newTab
												)
											: null,
										currentValue.rel
											? createElement(
													'span',
													{ key: 'rel', style: { marginRight: '8px' } },
													`rel="${currentValue.rel}"`
												)
											: null,
										currentValue.ariaLabel
											? createElement(
													'span',
													{ key: 'aria', style: { marginRight: '8px' } },
													`aria-label="${currentValue.ariaLabel}"`
												)
											: null,
										currentValue.title
											? createElement(
													'span',
													{ key: 'link-title-preview' },
													`title="${currentValue.title}"`
												)
											: null
									].filter(Boolean)
								)
							: null
					]
				)
			)
		}

		// Wrap everything in BaseControl for proper styling
		return createElement(
			BaseControl,
			{
				key: property.id,
				label: property.label,
				__nextHasNoMarginBottom: true
			},
			controlElements
		)
	} catch (error) {
		console.error('Link control error:', error)
		const { createElement } = window.wp.element
		return createElement(
			'div',
			{
				style: { padding: '8px', border: '1px solid red', color: 'red' }
			},
			window.bricksData.i18n.errorCouldNotLoadLink
		)
	}
}

// Make function available globally
window.createBricksLinkControl = createBricksLinkControl
