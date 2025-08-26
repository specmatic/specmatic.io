/**
 * BricksGoogleMarker
 * A custom marker class for Google Maps that integrates with Bricks Builder.
 * This class extends google.maps.OverlayView to create a flexible marker
 *
 * @since 2.0
 */
class BricksGoogleMarker extends google.maps.OverlayView {
	constructor(options) {
		super()
		// Convert position to google.maps.LatLng if it's not already
		this.position =
			options.position instanceof google.maps.LatLng
				? options.position
				: new google.maps.LatLng(options.position.lat, options.position.lng)

		this.content = options.content
		this.map = options.map
		this.title = options.title || ''
		this.zIndex = options.zIndex || 1
		this.clickable = options.clickable !== false
		this.visible = options.visible !== false
		this.div = null
		this.clickListener = null
		this.keyUpListener = null

		// Custom properties for Bricks
		this.markerData = options.markerData || {}

		// Set the map
		this.setMap(this.map)
	}

	onAdd() {
		// Create the marker element
		this.div = document.createElement('div')
		this.div.className = 'brx-google-marker'
		this.div.style.position = 'absolute'
		this.div.style.cursor = this.clickable ? 'pointer' : 'default'
		this.div.style.zIndex = this.zIndex
		this.div.style.transform = 'translate(-50%, -100%)' // Center horizontally, bottom align

		this.div.title = this.title || 'Google Marker'

		// Accessibility attributes
		this.div.setAttribute('role', 'button')
		this.div.setAttribute('tabindex', '0')

		// Set visibility
		if (!this.visible) {
			this.div.style.display = 'none'
		}

		// Add the content
		if (typeof this.content === 'string') {
			this.div.innerHTML = this.content
		} else if (this.content instanceof HTMLElement) {
			this.div.appendChild(this.content)
		}

		// Add click listener if clickable
		if (this.clickable) {
			this.clickListener = () => {
				google.maps.event.trigger(this, 'click')
			}
			this.div.addEventListener('click', this.clickListener)
		}

		// Keyboard accessibility
		this.keyUpListener = (event) => {
			// Trigger click on Enter
			if (event.key === 'Enter') {
				event.preventDefault()
				google.maps.event.trigger(this, 'click')
			}

			// Automatically pan to the marker if Tab on marker
			else if (event.key === 'Tab') {
				this.map.panTo(this.getPosition())
			}

			// Close the marker on Escape
			else if (event.key === 'Escape') {
				event.preventDefault()
				if (this.markerData?.locationInfo?.infoBox) {
					// Trigger close event if info box is open
					google.maps.event.trigger(this.markerData.locationInfo.infoBox, 'closeclick')
					this.markerData.locationInfo.infoBox?.close()
				}
			}
		}
		this.div.addEventListener('keyup', this.keyUpListener)

		// Add the marker to the overlay layer
		const panes = this.getPanes()
		panes.overlayMouseTarget.appendChild(this.div)
	}

	draw() {
		if (!this.div) return

		// Get the pixel position of the marker
		const overlayProjection = this.getProjection()
		const position = overlayProjection.fromLatLngToDivPixel(this.position)

		// Position the marker
		if (position) {
			this.div.style.left = position.x + 'px'
			this.div.style.top = position.y + 'px'
		}
	}

	onRemove() {
		if (this.div) {
			// Remove click listener
			if (this.clickListener) {
				this.div.removeEventListener('click', this.clickListener)
			}

			// Remove keyboard accessibility listeners
			if (this.keyUpListener) {
				this.div.removeEventListener('keydown', this.keyUpListener)
			}

			// Remove from DOM
			if (this.div.parentNode) {
				this.div.parentNode.removeChild(this.div)
			}
			this.div = null
		}
	}

	// Public methods to match Google Maps Marker API
	getPosition() {
		// Ensure we return a google.maps.LatLng object
		return this.position instanceof google.maps.LatLng
			? this.position
			: new google.maps.LatLng(this.position.lat, this.position.lng)
	}

	setPosition(position) {
		// Convert to google.maps.LatLng if needed
		this.position =
			position instanceof google.maps.LatLng
				? position
				: new google.maps.LatLng(position.lat, position.lng)
		this.draw()
	}

	// Enhanced setVisible for clustering
	setVisible(visible) {
		this.visible = visible
		if (this.div) {
			this.div.style.display = visible ? 'block' : 'none'
		}
	}

	getVisible() {
		return this.visible
	}

	setMap(map) {
		super.setMap(map)
	}

	setContent(content) {
		this.content = content
		if (this.div) {
			if (typeof content === 'string') {
				this.div.innerHTML = content
			} else if (content instanceof HTMLElement) {
				this.div.innerHTML = ''
				this.div.appendChild(content)
			}
		}
	}

	setZIndex(zIndex) {
		this.zIndex = zIndex
		if (this.div) {
			this.div.style.zIndex = zIndex
		}
	}
}
