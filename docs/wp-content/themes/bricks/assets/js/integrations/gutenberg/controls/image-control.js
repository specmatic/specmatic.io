/**
 * Create proper image control matching ImageControl.vue
 */
function createBricksImageControl(property, props) {
	try {
		const { Button, SelectControl, TextControl, BaseControl } = window.wp.components
		const { MediaUpload, MediaUploadCheck } = window.wp.blockEditor
		const { createElement } = window.wp.element

		// Get current image value (should be Bricks image object or empty)
		const currentValue = props.attributes[property.id] || {}

		const hasImage = currentValue.url || currentValue.id

		// Available image sizes (WordPress standard sizes)
		// TODO: Add custom sizes
		const imageSizes = [
			{ label: window.bricksData.i18n.thumbnail150, value: 'thumbnail' },
			{ label: window.bricksData.i18n.medium300, value: 'medium' },
			{ label: window.bricksData.i18n.large1024, value: 'large' },
			{ label: window.bricksData.i18n.fullSize, value: 'full' }
		]

		const onSelectImage = function (media) {
			try {
				// Create Bricks-compatible image object
				const imageObject = {
					id: media.id,
					url: media.url,
					filename: media.filename || media.title || '',
					size: currentValue.size || 'full'
				}

				// Update the URL to match the selected size if available
				if (media.sizes && media.sizes[imageObject.size]) {
					imageObject.url = media.sizes[imageObject.size].url
				}

				const newAttributes = {}
				newAttributes[property.id] = imageObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Image selection error:', error)
			}
		}

		const onRemoveImage = function () {
			try {
				const newAttributes = {}
				newAttributes[property.id] = {}
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Image removal error:', error)
			}
		}

		const onChangeSize = function (size) {
			try {
				if (!hasImage || !currentValue.id) return

				// Create updated image object with new size
				const imageObject = {
					...currentValue,
					size: size
				}

				// Note: We can't easily get the new URL for the size in Gutenberg
				// The PHP side will handle URL resolution based on size

				const newAttributes = {}
				newAttributes[property.id] = imageObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Image size change error:', error)
			}
		}

		const onChangeExternalUrl = function (url) {
			try {
				if (url) {
					// Create external image object
					const imageObject = {
						url: url,
						external: url,
						filename: url.split('/').pop() || ''
					}

					const newAttributes = {}
					newAttributes[property.id] = imageObject
					props.setAttributes(newAttributes)
				} else {
					onRemoveImage()
				}
			} catch (error) {
				console.error('External URL change error:', error)
			}
		}

		// Build the control elements
		const controlElements = []

		// Main image selection/display
		if (hasImage) {
			// Show current image with remove button
			controlElements.push(
				createElement(
					'div',
					{
						key: 'image-preview',
						style: {
							marginBottom: '8px',
							border: '1px solid #ddd',
							borderRadius: '2px',
							padding: '8px',
							position: 'relative'
						}
					},
					[
						createElement('img', {
							key: 'img',
							src: currentValue.url,
							alt: currentValue.filename || '',
							style: {
								maxWidth: '100%',
								height: 'auto',
								display: 'block'
							}
						}),
						createElement(
							'div',
							{
								key: 'actions',
								style: {
									marginTop: '8px',
									display: 'flex',
									gap: '8px'
								}
							},
							[
								// Replace image button
								createElement(
									MediaUploadCheck,
									{
										key: 'upload-check'
									},
									createElement(MediaUpload, {
										key: 'upload',
										onSelect: onSelectImage,
										allowedTypes: ['image'],
										value: currentValue.id,
										render: function (obj) {
											return createElement(
												Button,
												{
													onClick: obj.open,
													variant: 'secondary',
													size: 'small'
												},
												window.bricksData.i18n.replaceImage
											)
										}
									})
								),
								// Remove image button
								createElement(
									Button,
									{
										key: 'remove',
										onClick: onRemoveImage,
										variant: 'secondary',
										size: 'small',
										isDestructive: true
									},
									window.bricksData.i18n.remove
								)
							]
						)
					]
				)
			)

			// Image size selector (only for WordPress media, not external)
			if (currentValue.id && !currentValue.external) {
				controlElements.push(
					createElement(SelectControl, {
						__next40pxDefaultSize: true,
						__nextHasNoMarginBottom: true,
						key: 'size-select',
						label: window.bricksData.i18n.imageSize,
						value: currentValue.size || 'full',
						options: imageSizes,
						onChange: onChangeSize
					})
				)
			}
		} else {
			// Show upload button when no image
			controlElements.push(
				createElement(
					MediaUploadCheck,
					{
						key: 'upload-check-empty'
					},
					createElement(MediaUpload, {
						key: 'upload-empty',
						onSelect: onSelectImage,
						allowedTypes: ['image'],
						render: function (obj) {
							return createElement(
								Button,
								{
									onClick: obj.open,
									variant: 'secondary',
									style: {
										width: '100%',
										marginBottom: '8px'
									}
								},
								window.bricksData.i18n.selectImage
							)
						}
					})
				)
			)
		}

		// External URL input (only shown when no media library image is selected)
		if (!currentValue.id) {
			controlElements.push(
				createElement(TextControl, {
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
					key: 'external-url',
					label: window.bricksData.i18n.externalUrl,
					value:
						currentValue.external && currentValue.external !== true ? currentValue.external : '',
					placeholder: 'https://example.com/image.jpg',
					onChange: onChangeExternalUrl
				})
			)
		}

		// Wrap everything in BaseControl for proper styling
		return createElement(
			BaseControl,
			{
				key: property.id,
				label: property.label,
				help: property.help || '',
				__nextHasNoMarginBottom: true
			},
			controlElements
		)
	} catch (error) {
		console.error('Image control creation error:', error)
		const { createElement } = window.wp.element
		return createElement(
			'div',
			{
				style: { padding: '8px', border: '1px solid red', color: 'red' }
			},
			window.bricksData.i18n.errorCouldNotLoadImage
		)
	}
}

// Make function available globally
window.createBricksImageControl = createBricksImageControl
