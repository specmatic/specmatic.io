/**
 * Create proper image gallery control matching ControlImageGallery.vue
 */
function createBricksGalleryControl(property, props) {
	try {
		const { Button, SelectControl, BaseControl, TextControl } = window.wp.components
		const { MediaUpload, MediaUploadCheck } = window.wp.blockEditor
		const { createElement, useState } = window.wp.element

		// Get current gallery value (should be Bricks gallery object or empty)
		let currentValue = props.attributes[property.id] || {}

		// Pre 0.9.2: Image gallery was an array of images: Convert to object with 'images' key
		if (Array.isArray(currentValue)) {
			currentValue = { images: currentValue }
		}

		const images = currentValue.images || []
		const hasImages = images.length > 0
		const useDynamicDataValue =
			currentValue?.useDynamicData?.name || currentValue?.useDynamicData || ''
		const hasDynamicData = property.hasOwnProperty('hasDynamicData')
			? property.hasDynamicData
			: 'image'

		// State for dynamic data and drag-and-drop
		const [dynamicData, setDynamicData] = useState(useDynamicDataValue)
		const [draggedIndex, setDraggedIndex] = useState(null)
		const [dragOverIndex, setDragOverIndex] = useState(null)

		// Available image sizes (WordPress standard sizes)
		// TODO: Add custom sizes
		const imageSizes = [
			{ label: window.bricksData.i18n.thumbnail150, value: 'thumbnail' },
			{ label: window.bricksData.i18n.medium300, value: 'medium' },
			{ label: window.bricksData.i18n.large1024, value: 'large' },
			{ label: window.bricksData.i18n.fullSize, value: 'full' }
		]

		const onSelectImages = function (mediaArray) {
			try {
				// Convert WordPress media objects to Bricks image format
				// Match ControlImageGallery.vue: images don't have individual size property
				const bricksImages = mediaArray.map((media) => ({
					id: media.id,
					url: media.url,
					filename: media.filename || media.title || ''
				}))

				const galleryObject = {
					images: bricksImages,
					size: currentValue.size || 'full' // Size is stored at gallery level
				}

				const newAttributes = {}
				newAttributes[property.id] = galleryObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Gallery selection error:', error)
			}
		}

		const onRemoveImage = function (indexToRemove) {
			try {
				const newImages = images.filter((_, index) => index !== indexToRemove)

				const galleryObject =
					newImages.length > 0
						? {
								images: newImages,
								size: currentValue.size || 'full'
							}
						: false

				const newAttributes = {}
				newAttributes[property.id] = galleryObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Gallery image removal error:', error)
			}
		}

		const onClearGallery = function () {
			try {
				const newAttributes = {}
				newAttributes[property.id] = false
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Gallery clear error:', error)
			}
		}

		const onChangeSize = function (size) {
			try {
				if (!hasImages) return

				// In Bricks, size is stored at the gallery level, not on individual images
				// This matches ControlImageGallery.vue behavior
				const galleryObject = {
					images: images, // Keep images as-is, don't modify individual image size
					size: size
				}

				const newAttributes = {}
				newAttributes[property.id] = galleryObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Gallery size change error:', error)
			}
		}

		const onChangeDynamicData = function (value) {
			try {
				setDynamicData(value)

				let galleryObject
				if (value) {
					galleryObject = {
						useDynamicData: value,
						size: currentValue.size || 'full'
					}
				} else {
					galleryObject = {}
				}

				const newAttributes = {}
				newAttributes[property.id] = galleryObject
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Gallery dynamic data change error:', error)
			}
		}

		// Drag and drop handlers
		const handleDragStart = (e, index) => {
			e.dataTransfer.effectAllowed = 'move'
			e.dataTransfer.setData('text/html', e.target.innerHTML)
			setDraggedIndex(index)
		}

		const handleDragOver = (e, index) => {
			e.preventDefault()
			e.dataTransfer.dropEffect = 'move'
			setDragOverIndex(index)
		}

		const handleDragLeave = () => {
			setDragOverIndex(null)
		}

		const handleDrop = (e, dropIndex) => {
			e.preventDefault()

			if (draggedIndex === null || draggedIndex === dropIndex) return

			const newImages = [...images]
			const draggedItem = newImages[draggedIndex]

			// Remove dragged item
			newImages.splice(draggedIndex, 1)

			// Insert at new position
			const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
			newImages.splice(insertIndex, 0, draggedItem)

			const galleryObject = {
				images: newImages,
				size: currentValue.size || 'full'
			}

			const newAttributes = {}
			newAttributes[property.id] = galleryObject
			props.setAttributes(newAttributes)

			// Reset drag state
			setDraggedIndex(null)
			setDragOverIndex(null)
		}

		const handleDragEnd = () => {
			setDraggedIndex(null)
			setDragOverIndex(null)
		}

		// Build the control elements
		const controlElements = []

		// No file clickable area (only when empty and not using dynamic data)
		if (!hasImages && !dynamicData) {
			controlElements.push(
				createElement(
					MediaUploadCheck,
					{
						key: 'no-file-check'
					},
					createElement(MediaUpload, {
						onSelect: onSelectImages,
						allowedTypes: ['image'],
						multiple: true,
						gallery: true,
						render: function ({ open }) {
							return createElement(
								'div',
								{
									onClick: open,
									style: {
										border: '2px dashed #ddd',
										padding: '20px',
										textAlign: 'center',
										cursor: 'pointer',
										opacity: 0.5,
										textTransform: 'uppercase',
										letterSpacing: '1px',
										fontSize: '12px',
										marginBottom: '12px',
										transition: 'opacity 0.2s ease',
										':hover': {
											opacity: 1
										}
									},
									onMouseEnter: (e) => {
										e.target.style.opacity = '1'
									},
									onMouseLeave: (e) => {
										e.target.style.opacity = '0.5'
									}
								},
								window.bricksData.i18n.selectImage
							)
						}
					})
				)
			)
		}

		// Gallery images grid
		if (hasImages) {
			controlElements.push(
				createElement(
					'div',
					{
						key: 'gallery-grid',
						style: {
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
							gap: '8px',
							marginBottom: '12px',
							padding: '8px',
							border: '1px solid #ddd',
							borderRadius: '4px',
							backgroundColor: '#f9f9f9'
						}
					},
					images.map((image, index) =>
						createElement(
							'div',
							{
								key: image.id || index,
								draggable: true,
								onDragStart: (e) => handleDragStart(e, index),
								onDragOver: (e) => handleDragOver(e, index),
								onDragLeave: handleDragLeave,
								onDrop: (e) => handleDrop(e, index),
								onDragEnd: handleDragEnd,
								style: {
									position: 'relative',
									aspectRatio: '1',
									overflow: 'hidden',
									borderRadius: '2px',
									border: '1px solid #ccc',
									cursor: 'move',
									opacity: draggedIndex === index ? 0.5 : 1,
									transform: dragOverIndex === index ? 'scale(1.05)' : 'scale(1)',
									transition: 'transform 0.2s ease'
								}
							},
							[
								createElement(
									MediaUploadCheck,
									{
										key: 'media-check'
									},
									createElement(MediaUpload, {
										onSelect: onSelectImages,
										allowedTypes: ['image'],
										multiple: true,
										gallery: true,
										value: images.map((img) => img.id).filter(Boolean),
										render: function ({ open }) {
											return createElement('img', {
												src: image.url,
												alt: image.alt || '',
												onClick: open,
												style: {
													width: '100%',
													height: '100%',
													objectFit: 'cover',
													display: 'block',
													cursor: 'pointer'
												}
											})
										}
									})
								),
								createElement(
									Button,
									{
										key: 'remove',
										onClick: () => onRemoveImage(index),
										variant: 'secondary',
										size: 'small',
										isDestructive: true,
										style: {
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											position: 'absolute',
											top: '2px',
											right: '2px',
											minWidth: '16px',
											width: '16px',
											height: '16px',
											padding: '0',
											fontSize: '10px',
											lineHeight: '1'
										}
									},
									'×'
								)
							]
						)
					)
				)
			)

			// Image size selector
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

		// Gallery actions (only when not using dynamic data)
		if (!dynamicData) {
			const actionElements = []

			// Add/Select images button
			actionElements.push(
				createElement(
					MediaUploadCheck,
					{
						key: 'upload-check'
					},
					createElement(MediaUpload, {
						key: 'upload',
						onSelect: onSelectImages,
						allowedTypes: ['image'],
						multiple: true,
						gallery: true,
						value: images.map((img) => img.id).filter(Boolean),
						render: function (obj) {
							return createElement(
								Button,
								{
									onClick: obj.open,
									variant: hasImages ? 'secondary' : 'primary',
									style: {
										width: '100%',
										marginBottom: hasImages ? '8px' : '0'
									}
								},
								hasImages ? window.bricksData.i18n.addImages : window.bricksData.i18n.selectImages
							)
						}
					})
				)
			)

			// Clear gallery button (only if images exist)
			if (hasImages) {
				actionElements.push(
					createElement(
						Button,
						{
							key: 'clear',
							onClick: onClearGallery,
							variant: 'secondary',
							isDestructive: true,
							style: {
								width: '100%'
							}
						},
						window.bricksData.i18n.clearGallery
					)
				)
			}

			controlElements.push(
				createElement(
					'div',
					{
						key: 'actions',
						style: {
							marginTop: hasImages ? '12px' : '0'
						}
					},
					actionElements
				)
			)
		}

		// Dynamic data input
		if (hasDynamicData) {
			controlElements.push(
				createElement(TextControl, {
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
					key: 'dynamic-data',
					placeholder: window.bricksData.i18n.dynamicData,
					value: dynamicData,
					onChange: onChangeDynamicData,
					style: {
						marginTop: '12px'
					}
				})
			)
		}

		// Wrap everything in BaseControl for proper styling
		return createElement(
			BaseControl,
			{
				key: property.id,
				label: property.label,
				help: property.help,
				__nextHasNoMarginBottom: true
			},
			controlElements
		)
	} catch (error) {
		const { createElement } = window.wp.element
		return createElement(
			'div',
			{
				style: { padding: '8px', border: '1px solid red', color: 'red' }
			},
			window.bricksData.i18n.errorCouldNotLoadGallery
		)
	}
}

// Make function available globally
window.createBricksGalleryControl = createBricksGalleryControl
