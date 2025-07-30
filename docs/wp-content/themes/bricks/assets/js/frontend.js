/**
 * Scroll into view via IntersectionObserver
 *
 * Fallback for IE9+ included.
 */
class BricksIntersect {
	constructor(options = {}) {
		let element = options.element || false
		let callback = options.callback || false
		let runOnce = options.hasOwnProperty('once') ? options.once : true
		let trigger = options.hasOwnProperty('trigger') ? options.trigger : false

		// Create Intersection Observer
		if ('IntersectionObserver' in window) {
			let enableLeaveViewTrigger = false
			let observerInstance = new IntersectionObserver(
				(entries, observer) => {
					entries.forEach((entry) => {
						// Check if element is intersecting based on trigger type
						let bricksIsIntersecting =
							trigger === 'leaveView'
								? !entry.isIntersecting && enableLeaveViewTrigger
								: entry.isIntersecting

						if (trigger === 'leaveView' && entry.isIntersecting) {
							// Trigger is 'leaveView' & element is intersecting: Enable the trigger (@since 1.10)
							// This is to prevent the callback from running when the element is not visible on page load
							enableLeaveViewTrigger = true
						}

						if (bricksIsIntersecting) {
							// Run callback function
							if (element && callback) {
								callback(entry.target)
							}

							// Run only once: Stop observing element
							if (runOnce) {
								observer.unobserve(entry.target)
							}
						}
					})
				},
				{
					threshold: options.threshold || 0,
					root: options.root || null,
					rootMargin: options?.rootMargin || '0px'
				}
			)

			// Start observer
			if (element instanceof Element) {
				observerInstance.observe(element)
			}
		}

		// Fallback: Internet Explorer 9+
		else {
			let active = false

			let ieIntersectObserver = () => {
				if (active === false) {
					active = true

					if (
						element.getBoundingClientRect().top <= window.innerHeight &&
						element.getBoundingClientRect().bottom >= 0 &&
						window.getComputedStyle(element).display !== 'none'
					) {
						// Run callback function
						if (element && callback) {
							callback(element)
						}
					}

					active = false
				}
			}

			// Init IE intersect observer fallback function
			ieIntersectObserver()

			document.addEventListener('scroll', ieIntersectObserver)
			window.addEventListener('resize', ieIntersectObserver)
			window.addEventListener('orientationchange', ieIntersectObserver)
		}
	}
}

/**
 * Check if element is in the viewport
 *
 * @since 1.5
 *
 * @param {Element} element
 * @returns {boolean}
 */
function BricksIsInViewport(element) {
	const rect = element.getBoundingClientRect()
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	)
}

/**
 * Convert foundNodeList to array (as IE does not support forEach loop on NodeList)
 *
 * @param {Element} parentNode Node to search within.
 * @param {array, string} selector CSS selector(s) to search for.
 *
 * @returns {array}
 */
function bricksQuerySelectorAll(parentNode, selector) {
	// Multiple selectors
	if (Array.isArray(selector)) {
		let nodes = []

		selector.forEach((sel) => {
			nodes = nodes.concat(Array.prototype.slice.apply(parentNode.querySelectorAll(sel)))
		})

		return nodes
	}

	// One selector (string)
	return Array.prototype.slice.apply(parentNode.querySelectorAll(selector))
}

/**
 * Bricks Utilities functions
 *
 * @since 1.8
 */
const bricksUtils = {
	/**
	 * Subscribe to multiple events
	 * @param {*} object Example: document, window, element
	 * @param {*} eventNames Array of event names
	 * @param {*} callback
	 */
	subscribeEvents: (object, eventNames, callback) => {
		eventNames.forEach((eventName) => {
			object.addEventListener(eventName, (event) => {
				callback(event)
			})
		})
	},
	/**
	 * Subscribe to multiple jQuery events
	 *
	 * @param {*} object
	 * @param {*} eventNames
	 * @param {*} callback
	 *
	 * @since 1.9.2
	 */
	subscribejQueryEvents: (object, eventNames, callback) => {
		if (typeof jQuery === 'undefined') {
			return
		}

		eventNames.forEach((eventName) => {
			jQuery(object).on(eventName, (event) => {
				callback(event)
			})
		})
	},

	/**
	 * Check if interaction should run bricksInteractionCallbackExecution based on runOnce setting
	 *
	 * Only use this if listening to an event that cannot simply use once: true as requires some checking
	 *
	 * (e.g, 'bricks/ajax/start', 'bricks/form/error')
	 *
	 * @since 1.9.2
	 */
	maybeRunOnceInteractions: (sourceEl, interaction) => {
		// Get interaction from window.bricksData.interactions
		let interactionIndex = window.bricksData.interactions.findIndex((interactionPool) => {
			return interactionPool === interaction
		})

		// If interactionIndex is not found, return
		if (interactionIndex === -1) {
			return
		}

		// Remove interaction from window.bricksData.interactions after running the callback
		if (interaction?.runOnce) {
			window.bricksData.interactions.splice(interactionIndex, 1)
		}

		// STEP: Execute callback
		bricksInteractionCallbackExecution(sourceEl, interaction)
	},

	/**
	 * Conditionally hide or show load more buttons based on queryLoopInstance status
	 *
	 * @param {*} queryId || 'all'
	 * @since 1.9.5
	 */
	hideOrShowLoadMoreButtons: (queryId) => {
		// Get queryLoopInstance from window.bricksData.queryLoopInstances
		const queryLoopInstance = window.bricksData.queryLoopInstances[queryId] || false

		// Exit if no queryLoopInstance or queryId is 'all'
		if (!queryLoopInstance && queryId !== 'all') {
			return
		}

		if (queryId === 'all') {
			// Loop through all queryLoopInstances
			for (const queryId in window.bricksData.queryLoopInstances) {
				if (window.bricksData.queryLoopInstances.hasOwnProperty(queryId)) {
					bricksUtils.hideOrShowLoadMoreButtons(queryId) // Recursive
				}
			}
		}

		// Get all interactions where action is 'loadMore' and loadMoreQuery is the same as queryId
		const loadMoreInteractions = window.bricksData.interactions.filter((interaction) => {
			return interaction.action === 'loadMore' && interaction.loadMoreQuery === queryId
		})

		// Loop through all loadMoreInteractions
		if (loadMoreInteractions.length) {
			let shouldShow = parseInt(queryLoopInstance.page) < parseInt(queryLoopInstance.maxPages)
			loadMoreInteractions.forEach((interaction) => {
				if (shouldShow) {
					interaction.el.classList.remove('brx-load-more-hidden')
				} else {
					interaction.el.classList.add('brx-load-more-hidden')
				}
			})
		}
	},

	updateIsotopeInstance: (elementId) => {
		// Find the isotope instance from window.bricksData.isotopeInstances
		const isotopeInstance = window.bricksData.isotopeInstances[elementId] || false

		// Exit if no isotopeInstance
		if (!isotopeInstance) {
			return
		}

		/**
		 * Enhancement for masonry-element, with smoother animation
		 *
		 * @since 1.11.1
		 */
		if (isotopeInstance.elementName === 'masonry-element') {
			// Some items already removed and not exist in the DOM, must remove them from the isotope instance
			let removeItems = isotopeInstance.instance.items.filter((item) => !item.element.isConnected)
			if (removeItems.length > 0) {
				isotopeInstance.instance.remove(removeItems)
			}

			// Maybe triggered by Bricks Lazy Load (@since 1.12)
			isotopeInstance.instance.layout()

			// Add new items to the isotope instance
			let masonryItems = isotopeInstance.instance.element.querySelectorAll(
				':scope > *:not(.bricks-isotope-sizer):not(.bricks-gutter-sizer)'
			)
			if (masonryItems.length > 0) {
				// Check if the new items are already in the isotope instance
				masonryItems.forEach((newItem) => {
					// Append new items to the isotope instance if not exists
					if (!isotopeInstance.instance.items.find((item) => item.element === newItem)) {
						isotopeInstance.instance.appended(newItem)
					}
				})
			}

			// Handle images loaded in the new items (@since 1.12)
			bricksUtils.updateIsotopeOnImageLoad(elementId)

			return
		}

		/**
		 * Update the isotope elements, maybe newly added via AJAX or deleted
		 * 1. Reload all items
		 * 2. Recalculate and update the layout (@since 1.10)
		 * 3. Arrange items according to current sorting/filtering
		 * 4. Update isotope on image load (#86c44c5a0; @since 2.0)
		 */
		isotopeInstance.instance?.reloadItems()
		isotopeInstance.instance?.layout()
		isotopeInstance.instance?.arrange()
		bricksUtils.updateIsotopeOnImageLoad(elementId)
	},

	/**
	 * Helper function to trigger Isotope layout update based on image load progress
	 *
	 * @since 1.12
	 */
	updateIsotopeOnImageLoad: (elementId) => {
		if (!document.body.classList.contains('bricks-is-frontend')) {
			return
		}

		// Find the isotope instance from window.bricksData.isotopeInstances
		const isotopeInstance = window.bricksData.isotopeInstances[elementId] || false

		// Exit if no isotopeInstance
		if (!isotopeInstance) {
			return
		}

		/**
		 * Handle native browser loading="lazy" attribute
		 *
		 * @since 2.0: Only track images that are not loaded yet.
		 * Otherwise the more images added to the instance.element,
		 * the bigger the trigger and visitor might see many unstyle images (Infinite Scroll).
		 */
		const unloadedImages = Array.from(
			isotopeInstance.instance.element.querySelectorAll('img')
		).filter((img) => {
			return !img.complete || img.naturalHeight === 0
		})

		if (unloadedImages.length === 0) {
			// Trigger once if no images to load
			isotopeInstance.instance.layout()
			return
		}

		let loadedCount = 0
		let layoutScheduled = false

		/**
		 * Schedule layout update using requestAnimationFrame
		 * Without requestAnimationFrame, multiple images loading simultaneously could trigger excessive layout calculations, causing janky animations and poor performance.
		 * @since 2.0
		 */
		const scheduleLayout = () => {
			if (!layoutScheduled) {
				layoutScheduled = true
				requestAnimationFrame(() => {
					isotopeInstance.instance.layout()
					layoutScheduled = false
				})
			}
		}

		/**
		 * Calculate N images to wait for before forcing an update
		 * To prevents layout instability while balancing performance vs responsiveness.
		 *
		 * Formula breakdown:
		 * - Divide total unloaded images by 5 (aiming for ~20% intervals)
		 * - Round up to ensure we get a whole number (Math.ceil)
		 * - Ensure minimum of 1 image (never wait for 0 images)
		 * - Cap maximum at 3 images (prevent waiting too long for large galleries)
		 *
		 * Examples:
		 * - 2 images  → forceUpdateEvery = 1  (50% intervals)
		 * - 10 images → forceUpdateEvery = 2 (20% intervals)
		 * - > 10 images → forceUpdateEvery = 3 (12% intervals, capped)
		 *
		 */
		const forceUpdateEvery = Math.min(3, Math.max(1, Math.ceil(unloadedImages.length / 5)))
		const maxWaitTime = 500 // 500ms
		let lastForceUpdate = Date.now()

		unloadedImages.forEach((img) => {
			// Force update every N images, or every 500ms, or on last image load
			const handleImageLoad = () => {
				loadedCount++
				const now = Date.now()

				// Force update conditions
				const shouldForceUpdate =
					loadedCount % forceUpdateEvery === 0 || // Every N images
					now - lastForceUpdate > maxWaitTime || // Or every 500ms
					loadedCount === unloadedImages.length // Or last image

				if (shouldForceUpdate) {
					// Immediate update
					isotopeInstance.instance.layout()
					lastForceUpdate = now
				} else {
					// Batched update
					scheduleLayout()
				}

				// Cleanup event listeners
				img.removeEventListener('load', handleImageLoad)
				img.removeEventListener('error', handleImageLoad)
			}

			if (img.complete && img.naturalHeight !== 0) {
				// This still needed even if unloadedImages is filtered, because the image might be loaded before reaching this point)
				loadedCount++
				scheduleLayout()
			} else {
				img.addEventListener('load', handleImageLoad)
				img.addEventListener('error', handleImageLoad)
			}
		})
	},

	/**
	 * Helper function for toggle element and toggle offcanvas interaction
	 *
	 * @since 1.11
	 */
	toggleAction: (toggle, customOptions = {}) => {
		// Toggle selector, attribute, and value
		let toggleSelector = toggle.dataset?.selector || '.brxe-offcanvas'
		let toggleAttribute = toggle.dataset?.attribute || 'class'
		let toggleValue = toggle.dataset?.value || 'brx-open'

		if (customOptions) {
			toggleSelector = customOptions?.selector || toggleSelector
			toggleAttribute = customOptions?.attribute || toggleAttribute
			toggleValue = customOptions?.value || toggleValue
		}

		let toggleElement = toggleSelector ? document.querySelector(toggleSelector) : false

		// Element: nav-nested
		if (!toggleElement) {
			toggleElement = toggle.closest('.brxe-nav-nested')
		}

		// Element: offcanvas
		if (!toggleElement) {
			toggleElement = toggle.closest('.brxe-offcanvas')
		}

		if (!toggleElement) {
			return
		}

		// Re-calculcate mega menu position & width to prevent scrollbars
		if (document.querySelector('.brx-has-megamenu')) {
			// If not close toggle inside offcanvas with offset effect
			// Changed from event.target to the element node, should have same result (@since 1.11)
			if (!toggle.closest('[data-effect="offset"]')) {
				bricksSubmenuPosition(0)
			}
		}

		// STEP: Check if the target element is expanded (@since 1.11)
		let expanded = false
		if (toggleAttribute === 'class') {
			expanded = toggleElement.classList.contains(toggleValue)
		} else {
			expanded = toggleElement.getAttribute(toggleAttribute) === toggleValue
		}

		// STEP: Toggle 'aria-expanded' & .is-active on the toggle
		toggle.setAttribute('aria-expanded', !expanded)

		if (expanded) {
			// Closing now
			toggle.classList.remove('is-active')
		} else {
			// Opening now
			toggle.classList.add('is-active')

			// STEP: Set data-toggle-script-id as selector to focus back to toggle when closing via ESC key
			// toggleScriptId should follow the last triggered id (@since 1.11)
			if (toggle.dataset?.scriptId || toggle.dataset?.interactionId) {
				toggleElement.dataset.toggleScriptId =
					toggle.dataset?.scriptId || toggle.dataset?.interactionId
			}
		}

		// STEP: Toggle class OR other attribute
		let toggleElementCurrentState = 'off' // @since 2.0
		if (toggleAttribute === 'class') {
			// Close .brx-open after 200ms to prevent mobile menu styles from unsetting while mobile menu fades out
			if (
				toggle.closest('.brxe-nav-nested') &&
				toggleValue === 'brx-open' &&
				toggleElement.classList.contains('brx-open')
			) {
				toggleElementCurrentState = 'on'
				toggleElement.classList.add('brx-closing')
				setTimeout(() => {
					toggleElement.classList.remove('brx-closing')
					toggleElement.classList.remove('brx-open')
				}, 200)
			} else {
				// Check the current state of the toggle element
				if (toggleElement.classList.contains(toggleValue)) {
					toggleElementCurrentState = 'on'
				} else {
					toggleElementCurrentState = 'off'
				}
				toggleElement.classList.toggle(toggleValue)
			}
		} else {
			if (toggleElement.getAttribute(toggleAttribute)) {
				toggleElementCurrentState = 'on'
				toggleElement.removeAttribute(toggleAttribute)
			} else {
				toggleElementCurrentState = 'off'
				toggleElement.setAttribute(toggleAttribute, toggleValue)
			}
		}

		let disableAutoFocus = false

		// Check for Offcanvas element disableAutoFocus attribute (@since 1.10.2)
		if (toggleElement.classList.contains('brxe-offcanvas')) {
			disableAutoFocus = toggleElement.dataset?.noAutoFocus === 'true' || false
			toggleElement.classList.remove('brx-closing') // We can remove the closing class here (@since 2.0)
		}

		// Nestable nav: disable auto focus as there is another logic in bricksNavNested(), or it will be flickering
		if (toggleElement.classList.contains('brxe-nav-nested')) {
			disableAutoFocus = true
		}

		// Only auto focus if the target toggle is going to be opened (@since 2.0)
		if (!disableAutoFocus && toggleElementCurrentState === 'off') {
			bricksFocusOnFirstFocusableElement(toggleElement)
		}
	},

	/**
	 * Helper debounce function, to prevent multiple calls at once
	 * NOTE: Previoulsy defined in filters.js, but that file is not loaded on all pages.
	 *
	 * @param {*} func Function to run, when debounce is over
	 * @param {*} wait Time to wait before running the function
	 * @param {*} immediate  Run the function immediately
	 * @returns {function} Debounced function
	 *
	 * @since 1.12
	 */

	debounce: (func, wait, immediate) => {
		let timeout
		return function () {
			let context = this,
				args = arguments
			let later = function () {
				timeout = null
				if (!immediate) func.apply(context, args)
			}
			let callNow = immediate && !timeout
			clearTimeout(timeout)
			timeout = setTimeout(later, wait)
			if (callNow) func.apply(context, args)
		}
	},

	/**
	 * Return true if the xhr is still running and abort it
	 * This is to prevent multiple xhr requests running at the same time
	 *
	 * @param {string} queryId
	 * @returns boolean
	 *
	 * @since 1.12
	 */
	maybeAbortXhr: (queryId) => {
		// Get queryLoopInstance from window.bricksData.queryLoopInstances
		const queryLoopInstance = window.bricksData.queryLoopInstances[queryId] || false

		// Exit if no queryLoopInstance
		if (!queryLoopInstance) {
			return queryLoopInstance.xhrAborted
		}

		// Abort the XHR request if it is still running
		if (queryLoopInstance.xhr) {
			queryLoopInstance.xhr.abort()
			queryLoopInstance.xhrAborted = true
		}

		return queryLoopInstance.xhrAborted
	},

	// Get page number from URL (@since 1.11)
	getPageNumberFromUrl: (href) => {
		// Set clickedPageNumber to 1
		let pageNumber = 1

		// Get the page number from href /page/3/, ?paged=2
		const url = new URL(href)
		// Check if the href has page query
		if (url.searchParams.has('paged')) {
			pageNumber = parseInt(url.searchParams.get('paged'))
		} else {
			// Check if the href has page path
			const pagePath = url.pathname.split('/')
			// Remove all empty string from pagePath
			const pagePathFiltered = pagePath.filter((path) => {
				return path !== ''
			})

			// Get the last item from pagePathFiltered
			pageNumber = pagePathFiltered[pagePathFiltered.length - 1]

			// If clickedPageNumber is NaN, set it to 1
			if (isNaN(pageNumber)) {
				pageNumber = 1
			}
		}

		// Convert pageNumber to integer
		pageNumber = parseInt(pageNumber)

		return pageNumber
	},

	/**
	 * Updated query_results_count, query_results_count_filter in the DOM
	 *
	 * @param {string} queryId
	 * @param {string} type 'query' or 'dom'
	 * @param {*} data
	 *
	 * @since 1.12.2
	 */
	updateQueryResultStats: (queryId, type, data) => {
		const foundStats = {
			count: 0,
			start: 0,
			end: 0
		}

		if (type === 'dom') {
			// STEP: Find any query results count, start, and end in the DOM

			// Get from data-brx-qr-count (query_results_count_filter dynamic tag)
			const domResultsCount = data.querySelector(`span[data-brx-qr-count="${queryId}"]`)
			if (domResultsCount) {
				foundStats.count = domResultsCount.innerHTML
			}

			// Get from query results summary element in the DOM that is targetting the queryId
			const queryResultsSummaryElement = data.querySelector(
				`.brxe-query-results-summary[data-brx-qr-stats="${queryId}"]`
			)
			if (queryResultsSummaryElement) {
				// Extract the start, end and total from data-brx-qr-stats-data
				const statsData = queryResultsSummaryElement.dataset?.brxQrStatsData || false
				if (statsData) {
					const statsDataObj = JSON.parse(statsData)

					if (statsDataObj?.start !== undefined) {
						foundStats.start = statsDataObj.start
					}

					if (statsDataObj?.end !== undefined) {
						foundStats.end = statsDataObj.end
					}

					if (statsDataObj?.count !== undefined) {
						foundStats.count = statsDataObj.count
					}
				}
			}
		} else {
			// 'query' type
			if (data?.count !== undefined) {
				foundStats.count = data.count
			}

			if (data?.start !== undefined) {
				foundStats.start = data.start
			}

			if (data?.end !== undefined) {
				foundStats.end = data.end
			}
		}

		// Count / Total found
		if (foundStats?.count !== undefined) {
			const qrTotal = parseInt(foundStats.count || 0)
			const posStart = parseInt(foundStats.start || 0)
			const posEnd = parseInt(foundStats.end || 0)

			/**
			 * STEP: Replace any existing span[data-brx-qr-count] innerHTML with the updated count
			 *
			 * {query_results_count} DD
			 */
			const queryResultsCounts = document.querySelectorAll(`span[data-brx-qr-count="${queryId}"]`)
			queryResultsCounts.forEach((count) => {
				count.innerHTML = qrTotal
			})

			/**
			 * STEP: Handle query results summary element in the DOM that is targetting the queryId
			 *
			 * @since 1.12.2
			 */
			const queryResultsSummaryElement = document.querySelectorAll(
				`.brxe-query-results-summary[data-brx-qr-stats="${queryId}"]`
			)

			queryResultsSummaryElement.forEach((stats) => {
				// Extract statsFormat, oneResultText, noResultsText from data-brx-qr-stats-data
				const statsData = stats.dataset?.brxQrStatsData || false
				if (statsData) {
					const statsDataObj = JSON.parse(statsData)
					const statsFormat = statsDataObj?.statsFormat || false
					const oneResultText = statsDataObj?.oneResultText || false
					const noResultsText = statsDataObj?.noResultsText || false

					if (qrTotal < 1) {
						// Use noResultsText if no results found
						stats.innerHTML = noResultsText
					} else if (qrTotal === 1) {
						// Use oneResultText if only 1 result found
						stats.innerHTML = oneResultText
					} else {
						// Use statsFormat if more than 1 result found
						// Replace %start%, %end%, %total% with the actual values
						let statsText = statsFormat
							.replace('%start%', posStart) // Replace %start% with the actual start position
							.replace('%end%', posEnd) // Replace %end% with the actual end position
							.replace('%total%', qrTotal) // Replace %total% with the actual total count

						stats.innerHTML = statsText
					}
				}
			})
		}
	},

	/**
	 * Use by Bricks Interaction to toggle infoBox on Google Map
	 * @since 2.0
	 */
	toggleMapInfoBox: (config) => {
		// Ensure google is loaded
		if (!window.google || !window.google.maps) return

		const { el: sourceEl, action } = config
		if (!sourceEl) return

		const addressId = sourceEl.dataset?.brxInfoboxOpen || false
		const mapId = sourceEl.dataset?.brxInfoboxMapId || false

		if (!addressId || !mapId) return

		const googleMapInstance = window.bricksData.googleMapInstances[mapId]
		if (!googleMapInstance) return

		const location = googleMapInstance.locations.find((loc) => loc.id === addressId)
		if (!location || !location.marker) return

		// Reach here, we have the location and marker
		const { infoBox } = location
		if (action === 'openAddress') {
			// Show infoBox if it is not open
			if (!infoBox || !infoBox?.div_) {
				google.maps.event.trigger(location.marker, 'click')
			}
		} else {
			// Hide infoBox if it is open
			if (infoBox && infoBox?.div_) {
				google.maps.event.trigger(infoBox, 'closeclick')
				infoBox.close()
			}
		}
	},

	/**
	 * Close all submenus
	 * Previously located in bricksSubmenuListener()
	 * @since 1.11
	 *
	 * @since 2.0
	 */
	closeAllSubmenus: (element) => {
		// STEP: Hide closest submenu & focus on parent
		let openSubmenu = element.closest('.open')
		let multilevel = element.closest('.brx-has-multilevel')

		if (openSubmenu && !multilevel) {
			let toggle = openSubmenu.querySelector('.brx-submenu-toggle button[aria-expanded]')

			if (toggle) {
				bricksSubmenuToggle(toggle, 'remove')

				// Focus on parent
				if (toggle) {
					toggle.focus()
				}
			}
		}

		// STEP: Close all open submenus (multilevel)
		else {
			let openSubmenuToggles = bricksQuerySelectorAll(
				document,
				'.brx-submenu-toggle > button[aria-expanded="true"]'
			)

			openSubmenuToggles.forEach((toggle) => {
				if (toggle) {
					bricksSubmenuToggle(toggle, 'remove')
				}
			})
		}
	}
}

/**
 * BricksFunction class
 *
 * @since 1.8
 */
class BricksFunction {
	// Store custom functions on class init
	_customRun = null
	_customEachElement = null
	_customListenerHandler = null
	_customAddEventListeners = null

	// Store default settings
	_settings = {}

	// Store initialized elements
	_initializedElements = new Set()

	constructor(options) {
		// Default settings
		const defaultSettings = {
			parentNode: document,
			selector: '',
			subscribeEvents: [
				'bricks/ajax/pagination/completed',
				'bricks/ajax/load_page/completed',
				'bricks/ajax/popup/loaded',
				'bricks/ajax/query_result/displayed'
			],
			subscribejQueryEvents: [],
			forceReinit: false,
			frontEndOnly: false,
			windowVariableCheck: [],
			additionalActions: []
		}

		// Merge options with default settings when init the class
		Object.assign(defaultSettings, options)

		// Set default settings as class properties
		this._settings = defaultSettings

		// Assign custom functions if any (these functions are overrideable on class init)
		this._customRun = options?.run ?? null
		this._customEachElement = options?.eachElement ?? null
		this._customListenerHandler = options?.listenerHandler ?? null
		this._customAddEventListeners = options?.addEventListeners ?? null

		// Bind functions to class
		this.cleanUpInitElements = this.cleanUpInitElements.bind(this)
		this.run = this.run.bind(this)
		this.eachElement = this.eachElement.bind(this)
		this.listenerHandler = this.listenerHandler.bind(this)
		this.addEventListeners = this.addEventListeners.bind(this)

		document.addEventListener('DOMContentLoaded', () => {
			// Add event listeners (only add once)
			this.addEventListeners()

			// Run additional actions: Not define as a function to avoid overriding (no functionCanRun check here)
			if (this._settings.additionalActions.length) {
				for (const action of this._settings.additionalActions) {
					// Check if action is a function
					if (typeof action === 'function') {
						action.call(this)
					}
				}
			}
		})

		/**
		 * Save the class instance in the window.bricksFunctions object
		 *
		 * For bricksRunAllFunctions() to run all functions
		 *
		 * @since 1.11
		 */
		if (!window.bricksFunctions) {
			window.bricksFunctions = []
		}

		window.bricksFunctions.push(this)
	}

	/**
	 * Helper: Based on window variable and frontEndOnly setting, check if function can run
	 */
	functionCanRun() {
		// Check: frontEndOnly is set and we are not in the front end
		if (this._settings.frontEndOnly) {
			// Can't use bricksIsFrontend here as this function is called before 'bricksIsFrontend' is set (and this is inside a class)
			if (!document.body.classList.contains('bricks-is-frontend')) {
				return false
			}
		}

		// Check: Does required window variables exist
		if (this._settings.windowVariableCheck.length) {
			for (const variable of this._settings.windowVariableCheck) {
				/**
				 * Support checking different variable types:
				 * - Splide
				 * - bricksWooCommerce.useQtyInLoop
				 * - abc.cde.efg
				 *
				 * If the variable found but is false, consider it as not exist
				 *
				 * @since 1.9.2
				 */
				const variableParts = variable.split('.')
				let variableValue = window

				for (const variablePart of variableParts) {
					if (variableValue.hasOwnProperty(variablePart)) {
						variableValue = variableValue[variablePart]
					} else {
						variableValue = false
						break
					}
				}

				if (!variableValue) {
					return false
				}
			}
		}

		return true
	}

	/**
	 * Helper: Clean up initialized elements set: Remove elements that are no longer in the DOM
	 */
	cleanUpInitElements() {
		// Remove elements from _initializedElements if they are no longer in the DOM
		for (const element of this._initializedElements) {
			if (!element.isConnected) {
				this._initializedElements.delete(element)
			}
		}
	}

	/**
	 * Run logic on each element
	 */
	eachElement(element) {
		// Execute custom _customEachElement function if defined in constructor
		if (this._customEachElement && typeof this._customEachElement === 'function') {
			this._customEachElement.call(this, element)
			return
		}

		// Default customEachElement function: Do nothing
	}

	/**
	 * Entry point:
	 * Using functionCanRun as a guard, clean up initialized elements.
	 * By default, find all elements based on parent node and selector, and run the eachElement function on each element.
	 */
	run(customSettings) {
		if (!this.functionCanRun()) {
			return
		}

		// Must run cleanUpInitElements before custom run function
		this.cleanUpInitElements()

		// Execute custom run function if defined in constructor
		if (this._customRun && typeof this._customRun === 'function') {
			this._customRun.call(this, customSettings)
			return
		}

		// Default run function

		// Clone settings (to avoid modifying them)
		const currentSettings = Object.assign({}, this._settings)

		// Set custom settings to current settings
		if (customSettings) {
			Object.keys(customSettings).forEach((key) => {
				if (currentSettings.hasOwnProperty(key)) {
					currentSettings[key] = customSettings[key]
				}
			})
		}

		const elementInstances = bricksQuerySelectorAll(
			currentSettings.parentNode,
			currentSettings.selector
		)

		// Exit if no element found
		if (!elementInstances.length) {
			return
		}

		elementInstances.forEach((element, index) => {
			// Store the element in the _initializedElements set
			// forceReinit, ignore the set and run the eachElement function
			if (currentSettings.forceReinit) {
				// If forceReinit is a callback, run it
				const reinit =
					typeof currentSettings.forceReinit === 'function'
						? currentSettings.forceReinit.call(this, element, index)
						: currentSettings.forceReinit

				if (reinit) {
					this.eachElement(element, index)
					// Continue to next element
					return
				}
			}

			// Check if the element is already initialized
			if (!this._initializedElements.has(element)) {
				// Add element to initialized elements set
				this._initializedElements.add(element)

				// Run eachElement function
				this.eachElement(element, index)
			} else {
				// Maybe the element inside the set is not the same as the current element, so we need to check
				// Get the element from the set
				const elementFromSet = Array.from(this._initializedElements).find((el) => el === element)

				// If it is not connected, remove it from the set and run the eachElement function
				if (!elementFromSet.isConnected) {
					this._initializedElements.delete(elementFromSet)
					// Add element to initialized elements set
					this._initializedElements.add(element, index)
					this.eachElement(element, index)
				}
			}
		})
	}

	/**
	 * Once subscribed to events, run the listenerHandler function
	 * By default, we will change the parent node based on the event type, and execute the run function again
	 */
	listenerHandler(event) {
		// Execute custom listenerHandler function if defined in constructor
		if (this._customListenerHandler && typeof this._customListenerHandler === 'function') {
			this._customListenerHandler.call(this, event)
			return
		}

		// Default listenerHandler function
		if (event?.type) {
			switch (event.type) {
				// Can add more cases here if needed for different events
				// Maybe can change the parent node or selector based on the event type

				default:
					this.run()
					break
			}
		}
	}

	/**
	 * By default, subscribe to events defined in the settings, and set listenerHandler as the callback
	 * Using functionCanRun as a guard
	 */
	addEventListeners() {
		if (!this.functionCanRun()) {
			return
		}

		// Execute custom addEventListeners function if defined in constructor
		if (this._customAddEventListeners && typeof this._customAddEventListeners === 'function') {
			this._customAddEventListeners.call(this)
			return
		}

		// Default addEventListeners function
		if (this._settings.subscribeEvents.length) {
			bricksUtils.subscribeEvents(document, this._settings.subscribeEvents, this.listenerHandler)
		}

		// jQuery events (@since 1.9.2)
		if (this._settings.subscribejQueryEvents.length) {
			bricksUtils.subscribejQueryEvents(
				document,
				this._settings.subscribejQueryEvents,
				this.listenerHandler
			)
		}
	}
}

/**
 * Frontend: Lazy load when target element enters viewport
 *
 * Video lazy load via bricksBackgroundVideoInit()
 *
 * https://developers.google.com/web/fundamentals/performance/lazy-loading-guidance/images-and-video/
 */
const bricksLazyLoadFn = new BricksFunction({
	parentNode: document,
	selector: '.bricks-lazy-hidden',
	subscribejQueryEvents: ['updated_cart_totals'],
	eachElement: (el) => {
		// Lazy Load function
		let lazyLoad = (el) => {
			// Replace element attributes by setting 'src' with 'data-src'

			// Show base64 preloader SVG
			el.classList.add('wait')

			// Image
			if (el.dataset.src) {
				el.src = el.dataset.src
				delete el.dataset.src

				// Once image loaded, trigger isotope layout (@since 1.12)
				if (el.closest('.bricks-masonry')) {
					let isotopeId = el.closest('.bricks-masonry').getAttribute('data-script-id') ?? false
					if (isotopeId) {
						el.addEventListener('load', () => {
							bricksUtils.updateIsotopeInstance(isotopeId)
						})
					}
				}
			}

			// Image (data-sizes @since 1.5.1 due to W3 Validator error)
			if (el.dataset.sizes) {
				el.sizes = el.dataset.sizes
				delete el.dataset.sizes
			}

			if (el.dataset.srcset) {
				el.srcset = el.dataset.srcset
				delete el.dataset.srcset
			}

			// Background image (e.g. slider)
			if (el.dataset.style) {
				let style = el.getAttribute('style') || ''
				style += el.dataset.style
				el.setAttribute('style', style)

				// Keep 'data-style' attribute for when splide.js re-initializes on window resize, etc.
				if (!el.classList.contains('splide__slide')) {
					delete el.dataset.style
				}
			}

			el.classList.remove('bricks-lazy-hidden')
			el.classList.remove('wait')

			if (el.classList.contains('bricks-lazy-load-isotope')) {
				bricksIsotope()
			}
		}

		// Lazy load offet: 300px default (customisable via Bricks setting 'offsetLazyLoad')
		const rootMargin = window.bricksData.offsetLazyLoad || 300

		new BricksIntersect({
			element: el,
			callback: (el) => {
				lazyLoad(el)
			},
			rootMargin: `${rootMargin}px`
		})
	},
	listenerHandler: (event) => {
		// No need to change parentNode, but need some delay to allow for new elements to be added to the DOM (e.g. swiper, carousel, testimonial, etc.)
		setTimeout(() => {
			bricksLazyLoadFn.run()
		}, 100)
	}
})

function bricksLazyLoad() {
	bricksLazyLoadFn.run()
}

/**
 * Animate.css element animation
 */
const bricksAnimationFn = new BricksFunction({
	parentNode: document,
	selector: '.brx-animated',
	removeAfterMs: 3000, // removeAfterMs not used anymore (@since 1.8)
	eachElement: (el) => {
		new BricksIntersect({
			element: el,
			callback: (el) => {
				let animation = el.dataset.animation
				if (animation) {
					// Start animation
					el.classList.add(`brx-animate-${animation}`)

					// Remove attribute to prevent hiding element after "in" animations (see _animate.scss)
					el.removeAttribute('data-animation')

					// Remove animation class on 'animationend' event instead of setTimeout below (@since 1.8)
					el.addEventListener(
						'animationend',
						() => {
							el.classList.remove(`brx-animate-${animation}`)

							// If this is .brx-popup-content, and animation includes 'Out', execute bricksClosePopup() after animation
							if (el.classList.contains('brx-popup-content') && animation.includes('Out')) {
								const popupNode = el.closest('.brx-popup')
								if (popupNode) {
									bricksClosePopup(popupNode)
								}
							}

							// animationId = data-animation-id
							const animationId = el.dataset?.animationId

							// Remove data-animation-id and style: animation-duration to not affect next animation (@since 2.0)
							el.style.animationDuration = ''

							if (animationId) {
								// @since 1.8.4 - Trigger custom event for bricks/animation/end/{animationId}, provide element
								const bricksAnimationEvent = new CustomEvent(
									`bricks/animation/end/${animationId}`,
									{ detail: { el } }
								)
								document.dispatchEvent(bricksAnimationEvent)
							}
						},
						{ once: true }
					)
				}
			}
		})
	},
	run: (customSettings) => {
		const self = bricksAnimationFn

		// Use customSettings.elementsToAnimate if defined
		const elementsToAnimate =
			customSettings?.elementsToAnimate ||
			bricksQuerySelectorAll(self._settings.parentNode, self._settings.selector)

		// Use customSettings.removeAfterMs if defined
		self.removeAfterMs = customSettings?.removeAfterMs || self.removeAfterMs

		elementsToAnimate.forEach((el) => {
			self.eachElement(el)
		})
	}
})

function bricksAnimation() {
	bricksAnimationFn.run()
}

/**
 * Populate the queries instances variable to be used for infinite scroll and load more
 *
 * @since 1.6
 */
const bricksInitQueryLoopInstancesFn = new BricksFunction({
	parentNode: document,
	selector: '.brx-query-trail',
	subscribeEvents: ['bricks/ajax/load_page/completed'],
	eachElement: (el) => {
		const observerMargin = el.dataset?.observerMargin || '1px' // 0px doesn't trigger properly every time
		const observerDelay = el.dataset?.observerDelay || 0 // Infinite scroll delay in milliseconds (@since 1.12)
		const componentId = el.dataset?.queryComponentId || false
		const queryElementId = el.dataset?.queryElementId
		const queryVars = el.dataset?.queryVars
		const originalQueryVars = el.dataset?.originalQueryVars || '[]' // DD parsed and before merge with Query Filter's query var (@since 1.11.1)
		const isPostsElement = el.classList.contains('bricks-isotope-sizer')
		const isInfiniteScroll = el.classList.contains('brx-infinite-scroll')
		const ajaxLoader = el.dataset?.brxAjaxLoader
		const isLiveSearch = el.dataset?.brxLiveSearch
		const disableUrlParams = el.dataset?.brxDisableUrlParams

		// Find the <[data-brx-loop-start]> element (@since 1.12.3)
		const loopMarker = document.querySelector(`[data-brx-loop-start="${queryElementId}"]`)

		if (!loopMarker) {
			// Query Loop Marker not found, this query didn't define no results message
			el.insertAdjacentHTML('beforebegin', `<!--brx-loop-start-${queryElementId}-->`)
		} else {
			// Create comment and insert right before the loopMarker
			loopMarker?.insertAdjacentHTML('beforebegin', `<!--brx-loop-start-${queryElementId}-->`)
			loopMarker.removeAttribute('data-brx-loop-start')
		}

		// STEP: Store results container
		let resultsContainer = loopMarker?.parentNode || el.parentNode

		window.bricksData.queryLoopInstances[queryElementId] = {
			componentId: componentId,
			start: el.dataset.start,
			end: el.dataset.end,
			page: el.dataset.page,
			maxPages: el.dataset.maxPages,
			queryVars,
			originalQueryVars,
			observerMargin,
			observerDelay, // @since 1.12
			infiniteScroll: isInfiniteScroll,
			isPostsElement: isPostsElement,
			ajaxLoader,
			isLiveSearch,
			disableUrlParams, // @since 2.0
			resultsContainer,
			xhr: null, // Store the xhr object for each query instance (@since 1.12)
			xhrAborted: false // Store the xhr abort status (@since 1.12)
		}

		/**
		 * Posts element: Query trail is the isotope sizer
		 * For the Query Loop the trail is the last loop element.
		 *
		 * @since 1.7.1: Exclude popup elements
		 */
		let selectorId = componentId ? componentId : queryElementId

		// If selectorId contains dash, just get the first part
		if (selectorId.includes('-')) {
			selectorId = selectorId.split('-')[0]
		}

		let queryTrail = isPostsElement
			? el.previousElementSibling
			: Array.from(resultsContainer.querySelectorAll(`.brxe-${selectorId}:not(.brx-popup)`)).pop()

		// Cleanup unnecessary data attributes (@since 1.12.3)
		el.removeAttribute('data-query-vars')
		el.removeAttribute('data-original-query-vars')

		// Remove the trail in case it is not a Posts element
		if (!isPostsElement) {
			el.remove()
		}

		if (queryTrail && isInfiniteScroll) {
			queryTrail.dataset.queryElementId = queryElementId

			new BricksIntersect({
				element: queryTrail,
				callback: (el) => bricksQueryLoadPage(el),
				once: 1,
				rootMargin: observerMargin
			})
		}
	}
})

function bricksInitQueryLoopInstances() {
	bricksInitQueryLoopInstancesFn.run()
}

/**
 * AJAX loader - Add and remove ajax loader on ajax start and end
 *
 * @since 1.9
 */
function bricksAjaxLoader() {
	const getLoaderHTML = (animation) => {
		let html = ''
		switch (animation) {
			case 'default':
				html =
					'<div class="brx-loading-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>'
				break
			case 'ellipsis':
				html =
					'<div class="brx-loading-ellipsis"><div></div><div></div><div></div><div></div></div>'
				break
			case 'ring':
				html = '<div class="brx-loading-ring"><div></div><div></div><div></div><div></div></div>'
				break
			case 'dual-ring':
				html = '<div class="brx-loading-dual-ring"></div>'
				break
			case 'facebook':
				html = '<div class="brx-loading-facebook"><div></div><div></div><div></div></div>'
				break
			case 'roller':
				html =
					'<div class="brx-loading-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>'
				break
			case 'ripple':
				html = '<div class="brx-loading-ripple"><div></div><div></div></div>'
				break
			case 'spinner':
				html =
					'<div class="brx-loading-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>'
				break
		}
		return html
	}
	// Add ajax loader
	document.addEventListener('bricks/ajax/start', (event) => {
		// Get the queryId from the event
		const queryId = event.detail.queryId || false

		if (!queryId) {
			return
		}

		// Find the queryLoopInstance from bricksData.queryLoopInstances
		const queryLoopConfig = window.bricksData.queryLoopInstances[queryId] || false

		// Exit if no queryLoopConfig
		if (!queryLoopConfig) {
			return
		}

		const ajaxLoader = JSON.parse(queryLoopConfig?.ajaxLoader || false)
		const loaderAnimation = ajaxLoader?.animation || false

		// Exit if no loader animation
		if (!loaderAnimation) {
			return
		}

		// STEP: Determine where to insert the AJAX loader HTML
		let targetElement = ajaxLoader?.selector ? document.querySelector(ajaxLoader.selector) : false

		// Fallback/default: Get the last element of the query trail
		if (!targetElement) {
			// targetElementOld = queryLoopConfig.isPostsElement
			// 	? document.querySelector(`.bricks-isotope-sizer[data-query-element-id="${queryId}"]`)
			// 			?.previousElementSibling
			// 	: Array.from(document.querySelectorAll(`.brxe-${queryId}:not(.brx-popup)`)).pop()

			// No result will cause the loader unable to detect the last element (@since 1.9.6)
			targetElement =
				Array.from(
					queryLoopConfig.resultsContainer?.querySelectorAll(`.brxe-${queryId}:not(.brx-popup)`)
				).pop() ?? queryLoopConfig.resultsContainer
		}

		// STEP: Insert the AJAX loader HTML
		if (targetElement) {
			let nodeName = targetElement.nodeName.toLowerCase()
			let loadingHTML = document.createElement(nodeName)
			loadingHTML.classList.add('brx-loading-animation')
			loadingHTML.dataset.ajaxLoaderQueryId = queryId // data attribute identifies the queryId

			// Add custom color
			if (ajaxLoader?.color) {
				loadingHTML.style.setProperty('--brx-loader-color', ajaxLoader.color)
			}

			// Add custom size
			if (ajaxLoader?.scale) {
				loadingHTML.style.transform = `scale(${ajaxLoader.scale})`
			}

			loadingHTML.innerHTML = getLoaderHTML(loaderAnimation)

			// Custom selector: Insert at the end of selector node, otherwise insert after last query trail element
			targetElement.insertAdjacentElement(
				ajaxLoader?.selector ? 'beforeend' : 'afterend',
				loadingHTML
			)
		}
	})

	// STEP: Remove all AJAX loaders
	document.addEventListener('bricks/ajax/end', (event) => {
		// Use querySelectorAll to remove all loaders related to the queryId
		const loadingAnimations = event?.detail?.queryId
			? document.querySelectorAll(
					`.brx-loading-animation[data-ajax-loader-query-id="${event.detail.queryId}"]`
				)
			: []

		// Remove all loaders
		loadingAnimations.forEach((el) => el.remove())
	})

	// Add AJAX loader - Popup (@since 1.9.4)
	document.addEventListener('bricks/ajax/popup/start', (event) => {
		// Get the popupId from the event
		const popupElement = event.detail.popupElement || false

		if (!popupElement) {
			return
		}

		const ajaxLoader = JSON.parse(popupElement.dataset?.brxAjaxLoader || false)
		const loaderAnimation = ajaxLoader?.animation || false

		// Exit if no loader animation
		if (!loaderAnimation) {
			return
		}

		// STEP: Determine where to insert the AJAX loader HTML
		let targetElement = ajaxLoader?.selector ? document.querySelector(ajaxLoader.selector) : false

		// Fallback/default: Get the .brx-popup-content element
		if (!targetElement) {
			targetElement = popupElement.querySelector('.brx-popup-content')
		}

		// STEP: Insert the AJAX loader HTML
		if (targetElement) {
			let nodeName = targetElement.nodeName.toLowerCase()
			let loadingHTML = document.createElement(nodeName)
			loadingHTML.classList.add('brx-loading-animation')
			loadingHTML.dataset.ajaxLoaderPopupId = popupElement.dataset.popupId // data attribute identifies the popupId

			// Add custom color
			if (ajaxLoader?.color) {
				loadingHTML.style.setProperty('--brx-loader-color', ajaxLoader.color)
			}

			// Add custom size
			if (ajaxLoader?.scale) {
				loadingHTML.style.transform = `scale(${ajaxLoader.scale})`
			}

			loadingHTML.innerHTML = getLoaderHTML(loaderAnimation)

			// Insert inside the targetElement
			targetElement.insertAdjacentElement('afterbegin', loadingHTML)
		}
	})

	// STEP: Remove all AJAX loaders - popup (@since 1.9.4)
	document.addEventListener('bricks/ajax/popup/end', (event) => {
		// Use querySelectorAll to remove all loaders related to the popupId
		const loadingAnimations = event?.detail?.popupId
			? document.querySelectorAll(
					`.brx-loading-animation[data-ajax-loader-popup-id="${event.detail.popupId}"]`
				)
			: []

		// Remove all loaders
		loadingAnimations.forEach((el) => el.remove())
	})
}

/**
 * Bricks query load page elements
 *
 * @param {HTMLElement} el
 * @param {boolean} noDelay (@since 1.12.2)
 * @param {boolean} nonceRefreshed (@since 1.11)
 *
 * @since 1.5
 */
function bricksQueryLoadPage(el, noDelay = false, nonceRefreshed = false) {
	return new Promise(function (resolve, reject) {
		const queryElementId = el.dataset.queryElementId
		const queryInfo = window.bricksData.queryLoopInstances?.[queryElementId]

		if (!queryInfo || (queryInfo?.isLoading && !nonceRefreshed)) {
			return
		}

		const componentId = queryInfo?.componentId || false

		let page = parseInt(queryInfo.page || 1) + 1
		const maxPages = parseInt(queryInfo.maxPages || 1)

		if (page > maxPages) {
			// Don't remove instance as we still need it when filter or show/hide load more buttons
			resolve({ page, maxPages })
			return
		}

		let url = window.bricksData.restApiUrl.concat('load_query_page')

		let queryData = {
			postId: window.bricksData.postId,
			queryElementId: queryElementId,
			componentId: componentId,
			queryVars: queryInfo.queryVars,
			page: page,
			nonce: window.bricksData.nonce,
			lang: window.bricksData.language || false,
			mainQueryId: window.bricksData.mainQueryId || false // Record the main query ID (@since 2.0)
		}

		// Check if useQueryFilter is ON
		if (
			window.bricksData.useQueryFilter === '1' &&
			typeof window.bricksUtils.getFiltersForQuery === 'function' &&
			typeof window.bricksUtils.getSelectedFiltersForQuery === 'function'
		) {
			let filterIds = []
			// Find all filters with the same targetQueryId, bricksData.filterInstances is Object
			if (
				window.bricksData.filterInstances &&
				Object.keys(window.bricksData.filterInstances).length > 0
			) {
				const filterIntances = Object.values(window.bricksData.filterInstances).filter((filter) => {
					return filter.targetQueryId === queryElementId
				})

				filterIds = filterIntances.map((filter) => filter.filterId)
			}

			if (filterIds.length) {
				// Build allFilters array, no key is needed, just need each filter's ID
				let allFilters = window.bricksUtils.getFiltersForQuery(queryElementId, 'filterId')
				let selectedFilters = window.bricksUtils.getSelectedFiltersForQuery(queryElementId)
				// Get active filters tags for the query (@since 2.0)
				let afTags = window.bricksUtils.getDynamicTagsForParse(queryElementId)
				let originalQueryVars =
					queryInfo?.originalQueryVars === '[]'
						? queryInfo?.queryVars
						: queryInfo?.originalQueryVars
				// Set queryData
				queryData = {
					postId: window.bricksData.postId,
					queryElementId: queryElementId,
					originalQueryVars: originalQueryVars, // for query filters retrieve original DD parsed query vars (@since 1.11.1)
					pageFilters: window.bricksData.pageFilters || false,
					filters: allFilters, // for dynamic filter update
					infinitePage: page, // Set the latest page number
					selectedFilters: selectedFilters, // for active filter update (@since 1.11)
					afTags: afTags, // for active filters tags update (@since 2.0)
					nonce: window.bricksData.nonce,
					baseUrl: window.bricksData.baseUrl,
					lang: window.bricksData.language || false,
					mainQueryId: window.bricksData.mainQueryId || false // Record the main query ID (@since 2.0)
				}

				// Change the url to use the filter endpoint
				url = window.bricksData.restApiUrl.concat('query_result')
			}
		}

		// Set isLoading flag
		window.bricksData.queryLoopInstances[queryElementId].isLoading = 1

		// AJAX start event - AJAX loader purposes (@since 1.9)
		if (!nonceRefreshed) {
			document.dispatchEvent(
				new CustomEvent('bricks/ajax/start', { detail: { queryId: queryElementId } })
			)
		}

		// Add Get lang parameter for WPML if current url has lang parameter (@since 1.9.9)
		if (
			window.bricksData.multilangPlugin === 'wpml' &&
			(window.location.search.includes('lang=') || window.bricksData.wpmlUrlFormat != 3)
		) {
			// use window.bricksData.language to get the current language
			url = url.concat('?lang=' + window.bricksData.language)
		}

		let xhr = new XMLHttpRequest()
		xhr.open('POST', url, true)
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
		xhr.setRequestHeader('X-WP-Nonce', window.bricksData.wpRestNonce)

		// Successful response
		xhr.onreadystatechange = function () {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				let status = xhr.status
				let res

				try {
					res = JSON.parse(xhr.response)
				} catch (e) {
					// If response is not JSON, set res to null
					res = null
				}

				// Success
				if (status === 0 || (status >= 200 && status < 400)) {
					let html = res?.html || false
					const styles = res?.styles || false

					// Popups HTML (@since 1.7.1)
					const popups = res?.popups || false

					const updatedQuery = res?.updated_query || false // (@since 1.12.2)

					if (html) {
						// Remove <!--brx-loop-start-QUERYID--> comment from html string or it will be double (@since 1.12.2)
						html = html.replace(/<!--brx-loop-start-.*?-->/g, '')

						el.insertAdjacentHTML('afterend', html)
					}

					if (popups) {
						// Add popups HTML at the end of the body (@since 1.7.1)
						document.body.insertAdjacentHTML('beforeend', popups)
					}

					// Emit bricks/ajax/nodes_added (@since 1.11.1), move after popups added
					document.dispatchEvent(
						new CustomEvent('bricks/ajax/nodes_added', { detail: { queryId: queryElementId } })
					)

					if (styles) {
						// Add the page styles at the end of body
						document.body.insertAdjacentHTML('beforeend', styles)
					}

					// (@since 1.12.2)
					if (updatedQuery) {
						// Load more action, the start should use the original start value
						updatedQuery.start = parseInt(queryInfo.start)
						bricksUtils.updateQueryResultStats(queryElementId, 'query', updatedQuery)
					}

					// Update Page on query info
					window.bricksData.queryLoopInstances[queryElementId].page = page
				} else if (status === 403 && res?.code === 'rest_cookie_invalid_nonce' && !nonceRefreshed) {
					// Nonce might be invalid, try to regenerate and retry
					bricksRegenerateNonceAndRetryQueryLoadPage(el).then(resolve).catch(reject)

					// Exit early to prevent further processing
					return
				} else {
					console.error(`Request failed with status ${status}`)
				}

				// These actions should happen regardless of success or failure
				// Reset isLoading flag
				window.bricksData.queryLoopInstances[queryElementId].isLoading = 0

				resolve({ page, maxPages })

				// STEP: Show or hide "Load more" buttons (@since 1.9.4)
				bricksUtils.hideOrShowLoadMoreButtons(queryElementId)

				// Ajax end event - ajax loader purposes (@since 1.9)
				document.dispatchEvent(
					new CustomEvent('bricks/ajax/end', { detail: { queryId: queryElementId } })
				)

				setTimeout(() => {
					// Set the new query trail
					let newQueryTrail =
						componentId && !queryInfo.isPostsElement
							? Array.from(
									queryInfo.resultsContainer?.querySelectorAll(
										`.brxe-${componentId}:not(.brx-popup)`
									)
								).pop()
							: Array.from(
									queryInfo.resultsContainer?.querySelectorAll(
										`.brxe-${queryElementId}:not(.brx-popup)`
									)
								).pop()

					// Emit event
					document.dispatchEvent(
						new CustomEvent('bricks/ajax/load_page/completed', {
							detail: { queryTrailElement: newQueryTrail, queryId: queryElementId }
						})
					)

					// Is infinite scroll?
					if (queryInfo.infiniteScroll) {
						newQueryTrail.dataset.queryElementId = queryElementId

						// Check if the query trail is still visible, if yes, triggers the next page
						if (BricksIsInViewport(newQueryTrail)) {
							bricksQueryLoadPage(newQueryTrail)
						}

						// Add a new observer
						else {
							new BricksIntersect({
								element: newQueryTrail,
								callback: (el) => bricksQueryLoadPage(el),
								once: true,
								rootMargin: queryInfo.observerMargin
							})
						}
					}
				}, 250)
			}
		}

		/**
		 * Infinite scroll delay the AJAX request to support "fake" delay (@since 1.12)
		 * noDelay = true: when loadMore interaction, no delay (@since 1.12.2)
		 * noDelay = true: when regenerating nonce, no delay (@since 1.12.2)
		 */
		if (noDelay) {
			xhr.send(JSON.stringify(queryData))
		} else {
			setTimeout(() => {
				xhr.send(JSON.stringify(queryData))
			}, parseInt(queryInfo.observerDelay))
		}
	})
}

/**
 * Regenerate nonce and retry query load page
 *
 * @param {*} el
 * @since 1.11
 */
function bricksRegenerateNonceAndRetryQueryLoadPage(el) {
	return new Promise((resolve, reject) => {
		let xhrNonce = new XMLHttpRequest()
		xhrNonce.open('POST', window.bricksData.ajaxUrl, true)
		xhrNonce.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

		xhrNonce.onreadystatechange = function () {
			if (xhrNonce.readyState === XMLHttpRequest.DONE) {
				if (xhrNonce.status >= 200 && xhrNonce.status < 400) {
					let response
					try {
						response = JSON.parse(xhrNonce.responseText)
					} catch (e) {
						reject('Invalid response from server when regenerating nonce')
						return
					}

					if (response.success && response.data) {
						window.bricksData.nonce = response.data.bricks_nonce
						window.bricksData.wpRestNonce = response.data.rest_nonce
						bricksQueryLoadPage(el, true, true).then(resolve).catch(reject)
					} else {
						reject('Failed to regenerate nonces: Invalid response structure')
					}
				} else {
					reject('Failed to regenerate nonce')
				}
			}
		}

		xhrNonce.send('action=bricks_regenerate_query_nonce')
	})
}

/**
 * Bricks query pagination elements (AJAX)
 *
 * @since 1.5
 */
const bricksQueryPaginationFn = new BricksFunction({
	parentNode: document,
	selector: '.brx-ajax-pagination a',
	subscribeEvents: ['bricks/ajax/pagination/completed', 'bricks/ajax/query_result/displayed'],
	eachElement: (el) => {
		/**
		 * Check if we should use AJAX pagination logic or Filter logic
		 *
		 * Must run this check inside click event as filterInstance is not available on page load.
		 * bricksQueryPaginationFn is earlier than bricksPaginationFilterFn.
		 *
		 * @param {*} el
		 * @returns boolean
		 */
		const isAjaxPagination = (el) => {
			let isAjax = true
			if (
				!window.bricksData.useQueryFilter ||
				typeof window.bricksUtils.getFiltersForQuery !== 'function'
			) {
				return isAjax
			}
			const paginationElement = el.closest('.brx-ajax-pagination')
			const queryId = paginationElement?.dataset?.queryElementId || false

			if (queryId) {
				let allFilters = bricksUtils.getFiltersForQuery(queryId)
				// Exclude all pagination filters
				allFilters = allFilters.filter((filter) => {
					return filter.filterType !== 'pagination'
				})
				if (allFilters.length > 0) {
					isAjax = false
				}
			}
			return isAjax
		}

		// STEP: Add event listener for normal AJAX pagination
		if (!el.dataset?.ajaxPagination) {
			el.dataset.ajaxPagination = 1
			el.addEventListener('click', function (e) {
				const targetEl = e.currentTarget
				const href = targetEl.getAttribute('href')
				const targetPaginationEl = targetEl.closest('.brx-ajax-pagination')
				const queryId = targetPaginationEl?.dataset?.queryElementId

				// Check if we shoud use AJAX pagination logic (@since 1.10)
				if (!isAjaxPagination(targetPaginationEl)) {
					return
				}

				let clickedPageNumber = parseInt(bricksUtils.getPageNumberFromUrl(href))

				// Skip, if clickedPageNumber is less than 1
				if (clickedPageNumber < 1) {
					return
				}

				e.preventDefault()

				// Refactor to use bricksAjaxPagination (@since 1.12.2)
				bricksAjaxPagination(targetEl, queryId, clickedPageNumber)
			})
		}
	}
})

/**
 * AJAX pagination
 * - New logic to use load_query_page endpoint like Infinite Scroll
 * - Previously use GET request to clicked page URL but encountered issues like unable to retrieve the correct selectors if using components because many same selectors in same page
 *
 * @since 1.12.2
 */
function bricksAjaxPagination(targetEl, queryId, clickedPageNumber, nonceRefreshed = false) {
	return new Promise((resolve, reject) => {
		if (!queryId) {
			reject('Query ID is missing')
			return
		}

		const href = targetEl.getAttribute('href')
		const queryInstance = window.bricksData.queryLoopInstances[queryId] || false
		const targetPaginationEl = targetEl.closest('.brx-ajax-pagination')
		const queryComponentId = queryInstance?.componentId || false
		const resultsContainer = queryInstance?.resultsContainer || false

		if (!queryInstance || !resultsContainer) {
			reject('Query instance not found')
			return
		}

		let url = window.bricksData.restApiUrl.concat('load_query_page')

		let queryData = {
			postId: window.bricksData.postId,
			queryElementId: queryId,
			componentId: queryInstance.componentId || false,
			queryVars: queryInstance.queryVars,
			page: clickedPageNumber,
			nonce: window.bricksData.nonce,
			paginationId: targetPaginationEl.dataset.paginationId,
			baseUrl: window.bricksData.baseUrl,
			lang: window.bricksData.language || false,
			mainQueryId: window.bricksData.mainQueryId || false // Record the main query ID (@since 2.0)
		}

		// AJAX start event - AJAX loader purposes (@since 1.9)
		if (!nonceRefreshed) {
			document.dispatchEvent(new CustomEvent('bricks/ajax/start', { detail: { queryId } }))
		}

		// Add Get lang parameter for WPML if current url has lang parameter (@since 1.9.9)
		if (
			window.bricksData.multilangPlugin === 'wpml' &&
			(window.location.search.includes('lang=') || window.bricksData.wpmlUrlFormat != 3)
		) {
			// use window.bricksData.language to get the current language
			url = url.concat('?lang=' + window.bricksData.language)
		}

		let xhr = new XMLHttpRequest()
		xhr.open('POST', url, true)
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
		xhr.setRequestHeader('X-WP-Nonce', window.bricksData.wpRestNonce)

		xhr.onreadystatechange = function () {
			if (this.readyState === XMLHttpRequest.DONE) {
				let status = this.status
				let res

				try {
					res = JSON.parse(xhr.response)
				} catch (e) {
					// If response is not JSON, set res to null
					res = null
				}

				// Success
				if (status === 0 || (status >= 200 && status < 400)) {
					const html = res?.html || false
					const styles = res?.styles || false
					const popups = res?.popups || false
					const pagination = res?.pagination || false
					const updatedQuery = res?.updated_query || false

					// selectorId to be used for looping elements, use queryComponentId if available (@since 1.12.2)
					let selectorId = queryComponentId ? queryComponentId : queryId

					// If selectorId contains dash, just get the first part
					if (selectorId.includes('-')) {
						selectorId = selectorId.split('-')[0]
					}

					// Keep a copy of the bricks-gutter-sizer from the results container (posts element)
					const gutterSizer = resultsContainer.querySelector('.bricks-gutter-sizer')
					const isotopSizer = resultsContainer.querySelector('.bricks-isotope-sizer')

					const actualLoopDOM = resultsContainer.querySelectorAll(
						`.brxe-${selectorId}, .bricks-posts-nothing-found`
					)

					// Find the HTML comment <!--brx-loop-start-QUERYID-->
					const loopStartComment = document
						.createNodeIterator(resultsContainer, NodeFilter.SHOW_COMMENT, {
							acceptNode: function (node) {
								return node.nodeValue === `brx-loop-start-${queryId}`
							}
						})
						.nextNode()

					const hasOldResults = actualLoopDOM.length > 0 || loopStartComment

					if (hasOldResults) {
						/**
						 * - Remove all brxe-<targetQueryId> nodes, and .bricks-posts-nothing-found div from the results container
						 */
						resultsContainer
							.querySelectorAll(`.brxe-${selectorId}, .bricks-posts-nothing-found`)
							.forEach((el) => el.remove())
					}

					if (html) {
						// Replace the old page elements

						// Add new HTML inside the queryParentElement
						if (hasOldResults) {
							// Find the HTML comment <!--brx-loop-start-QUERYID--> and insert the HTML string right after it
							if (loopStartComment) {
								// Check if the first HTML tag is a <td> or <tr>
								const firstTag = html.match(/<\s*([a-z0-9]+)([^>]+)?>/i)
								let tempDiv = null

								// Special case for <td> and <tr> tags
								if (firstTag && (firstTag[1] === 'td' || firstTag[1] === 'tr')) {
									tempDiv = document.createElement('tbody')
								} else {
									tempDiv = document.createElement('div')
								}

								// Insert the HTML string inside the temp div (Browser will parse the HTML string to DOM nodes and auto correct any invalid HTML tags)
								tempDiv.innerHTML = html

								// Get the child nodes of the temp div
								let newNodes = Array.from(tempDiv.childNodes)

								//reverse the array to insert the nodes in the correct order
								newNodes.reverse()

								newNodes.forEach((node) => {
									if (loopStartComment.nextSibling) {
										loopStartComment.parentNode?.insertBefore(node, loopStartComment.nextSibling)
									} else {
										loopStartComment.parentNode?.appendChild(node)
									}
								})
								// Remove the temp div
								tempDiv.remove()
							}
						} else {
							resultsContainer.insertAdjacentHTML('beforeend', html)
						}
					}

					// Restore the bricks-gutter-sizer
					if (gutterSizer) {
						resultsContainer.appendChild(gutterSizer)
					}

					// Restore the bricks-isotope-sizer
					if (isotopSizer) {
						resultsContainer.appendChild(isotopSizer)
					}

					// Remove old query looping popup elements (use queryId even if componentId is available)
					const oldLoopPopupNodes = document.querySelectorAll(
						`.brx-popup[data-popup-loop="${queryId}"]`
					)
					oldLoopPopupNodes.forEach((el) => el.remove())

					if (popups) {
						// Add popups HTML at the end of the body (@since 1.7.1)
						document.body.insertAdjacentHTML('beforeend', popups)
					}

					// Update pagination if available
					if (pagination) {
						const parser = new DOMParser()
						const doc = parser.parseFromString(pagination, 'text/html')
						const newPagination = doc.querySelector('.bricks-pagination')
						if (newPagination) {
							targetPaginationEl.innerHTML = ''
							targetPaginationEl.appendChild(newPagination)
						}
					}

					// Emit bricks/ajax/nodes_added (@since 1.11.1), move after popups and pagination added
					document.dispatchEvent(
						new CustomEvent('bricks/ajax/nodes_added', { detail: { queryId: queryId } })
					)

					if (styles) {
						// Create a style element if not exists
						let styleElement = document.querySelector(`#brx-query-styles-${queryId}`)

						if (!styleElement) {
							styleElement = document.createElement('style')
							styleElement.id = `brx-query-styles-${queryId}`
							// Add style element to footer
							document.body.appendChild(styleElement)
						}

						// Add styles to the style element
						styleElement.innerHTML = styles
					}

					if (updatedQuery) {
						// AJAX pagination, Update the query start value to make it compatible with infinite scroll or loadMore (@since 1.12.3)
						if (updatedQuery?.start !== undefined) {
							window.bricksData.queryLoopInstances[queryId].start = parseInt(updatedQuery.start)
						}

						// Update Query Result Stats (@since 1.12.2)
						bricksUtils.updateQueryResultStats(queryId, 'query', updatedQuery)
					}

					// Update Page on query info
					window.bricksData.queryLoopInstances[queryId].page = clickedPageNumber

					// Update the history
					window.history.pushState({}, '', href)
				} else if (status === 403 && res?.code === 'rest_cookie_invalid_nonce' && !nonceRefreshed) {
					// Nonce might be invalid, try to regenerate and retry
					bricksRegenerateNonceAndRetryAjaxPagination(targetEl, queryId, clickedPageNumber)
						.then(resolve)
						.catch(reject)

					// Exit early to prevent further processing
					return
				} else {
					console.error(`Request failed with status ${status}`)
				}

				resolve()

				// AJAX end event - AJAX loader purposes (@since 1.9)
				document.dispatchEvent(new CustomEvent('bricks/ajax/end', { detail: { queryId } }))

				// @since 1.8 - Emit event
				document.dispatchEvent(
					new CustomEvent('bricks/ajax/pagination/completed', { detail: { queryId } })
				)

				// STEP: Show or hide "Load more" buttons
				bricksUtils.hideOrShowLoadMoreButtons(queryId)
			}
		}

		xhr.send(JSON.stringify(queryData))
	})
}

function bricksRegenerateNonceAndRetryAjaxPagination(targetEl, queryId, clickedPageNumber) {
	return new Promise((resolve, reject) => {
		let xhrNonce = new XMLHttpRequest()
		xhrNonce.open('POST', window.bricksData.ajaxUrl, true)
		xhrNonce.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

		xhrNonce.onreadystatechange = function () {
			if (xhrNonce.readyState === XMLHttpRequest.DONE) {
				if (xhrNonce.status >= 200 && xhrNonce.status < 400) {
					let response
					try {
						response = JSON.parse(xhrNonce.responseText)
					} catch (e) {
						reject('Invalid response from server when regenerating nonce')
						return
					}

					if (response.success && response.data) {
						window.bricksData.nonce = response.data.bricks_nonce
						window.bricksData.wpRestNonce = response.data.rest_nonce
						bricksAjaxPagination(targetEl, queryId, clickedPageNumber, true)
							.then(resolve)
							.catch(reject)
					} else {
						reject('Failed to regenerate nonces: Invalid response structure')
					}
				} else {
					reject('Failed to regenerate nonce')
				}
			}
		}

		xhrNonce.send('action=bricks_regenerate_query_nonce')
	})
}

function bricksQueryPagination() {
	bricksQueryPaginationFn.run()
}

function bricksStickyHeader() {
	let stickyHeaderEl = document.querySelector('#brx-header.sticky')

	if (!stickyHeaderEl) {
		return
	}

	let logo = document.querySelector('.bricks-site-logo')
	let logoDefault
	let logoInverse
	let lastScrolled = -1 // -1 to make sure that the first time bricksStickyHeaderOnScroll() runs it doesn't slide up
	let headerSlideUpAfter = stickyHeaderEl.hasAttribute('data-slide-up-after')
		? stickyHeaderEl.getAttribute('data-slide-up-after')
		: 0

	if (logo) {
		logoDefault = logo.getAttribute('data-bricks-logo')
		logoInverse = logo.getAttribute('data-bricks-logo-inverse')
	}

	const bricksStickyHeaderOnScroll = () => {
		// Return: body has .no-scroll class (@since 1.11)
		if (document.body.classList.contains('no-scroll')) {
			return
		}

		let scrolled = window.scrollY // @since 1.11 (use scrollY instead of depricated pageYOffset)

		if (scrolled > 0) {
			stickyHeaderEl.classList.add('scrolling')

			if (logo && logoInverse && logo.src !== logoInverse) {
				logo.src = logoInverse
				logo.srcset = ''
			}
		} else {
			stickyHeaderEl.classList.remove('scrolling')

			if (logo && logoDefault && logo.src !== logoDefault) {
				logo.src = logoDefault
			}
		}

		/**
		 * Slide up
		 *
		 * @since 1.9 - Add .sliding to prevent horizontal scrollbar (e.g. Offcanvas mini cart in header)
		 */
		if (headerSlideUpAfter && !document.querySelector('.bricks-search-overlay.show')) {
			if (scrolled > lastScrolled && lastScrolled >= 0) {
				// Scolling down
				if (scrolled > headerSlideUpAfter) {
					// If it's not .slide-up and we slide down, add .sliding class to prevent horizontal scrollbar (@since 1.11)
					if (!stickyHeaderEl.classList.contains('slide-up')) {
						stickyHeaderEl.classList.add('sliding')
					}
					stickyHeaderEl.classList.add('slide-up')
				}
			} else {
				// If it's .slide-up and we slide up, add .sliding class to prevent horizontal scrollbar  (@since 1.11)
				if (stickyHeaderEl.classList.contains('slide-up')) {
					stickyHeaderEl.classList.add('sliding')
				}
				// Scrolling up
				stickyHeaderEl.classList.remove('slide-up')
			}
		}

		lastScrolled = scrolled
	}

	// Transform completed: Remove .sliding class (@since 1.11)
	stickyHeaderEl.addEventListener('transitionend', (e) => {
		if (e.propertyName === 'transform') {
			stickyHeaderEl.classList.remove('sliding')
		}
	})

	// Set sticky header logo inverse & slide up
	window.addEventListener('scroll', bricksStickyHeaderOnScroll)

	// Run it once on page load to set the .scrolling class if page is aready scrolled down
	bricksStickyHeaderOnScroll()
}

/**
 * Frontend: One Page Navigation (in builder via dynamic Vue component)
 */
function bricksOnePageNavigation() {
	let onePageNavigationWrapper = document.getElementById('bricks-one-page-navigation')

	if (!bricksIsFrontend || !onePageNavigationWrapper) {
		return
	}

	let rootElements = bricksQuerySelectorAll(document, '#brx-content > *')
	let elementIds = []
	let elementId = ''
	let onePageLink = ''
	let onePageItem = ''

	if (!rootElements) {
		return
	}

	rootElements.forEach((element) => {
		elementId = element.getAttribute('id')

		if (!elementId) {
			return
		}

		elementIds.push(elementId)
		onePageItem = document.createElement('li')
		onePageLink = document.createElement('a')
		onePageLink.classList.add(`bricks-one-page-${elementId}`)
		onePageLink.setAttribute('href', `#${elementId}`)

		onePageItem.appendChild(onePageLink)
		onePageNavigationWrapper.appendChild(onePageItem)
	})

	function onePageScroll() {
		let scrolled = window.scrollY

		elementIds.forEach((elementId) => {
			let element = document.getElementById(elementId)
			let elementTop = element.offsetTop
			let elementBottom = elementTop + element.offsetHeight

			if (scrolled >= elementTop - 1 && scrolled < elementBottom - 1) {
				document.querySelector(`.bricks-one-page-${elementId}`).classList.add('active')
			} else {
				document.querySelector(`.bricks-one-page-${elementId}`).classList.remove('active')
			}
		})
	}

	// Add load, resize, scroll event listeners
	window.addEventListener('load', onePageScroll)
	window.addEventListener('resize', onePageScroll)
	document.addEventListener('scroll', onePageScroll)
}

/**
 * Search element: Toggle overlay search
 */
function bricksSearchToggle() {
	let searchElements = bricksQuerySelectorAll(document, '.brxe-search')

	searchElements.forEach((searchElement) => {
		let toggle = searchElement.querySelector('.toggle')
		let overlay = searchElement.querySelector('.bricks-search-overlay')

		if (!toggle || !overlay) {
			return
		}

		let searchInputOrIcon = overlay.previousElementSibling

		document.addEventListener('keyup', (e) => {
			if (e.key === 'Escape') {
				// Close search overlay on ESC key if visible (offsetParent not working on fixed positioned node)
				let overlayStyles = window.getComputedStyle(overlay)

				if (overlayStyles.visibility === 'visible') {
					overlay.classList.remove('show')
					searchInputOrIcon.focus()
					searchInputOrIcon.setAttribute('aria-expanded', false)
				}
			}
		})

		toggle.addEventListener('click', () => {
			overlay.classList.toggle('show')

			toggle.setAttribute('aria-expanded', toggle.getAttribute('aria-expanded') === 'false')

			setTimeout(() => {
				searchElement.querySelector('input[type=search]').focus()
			}, 200)
		})

		overlay.querySelector('.close').addEventListener('click', () => {
			overlay.classList.remove('show')
			searchInputOrIcon.focus()
			searchInputOrIcon.setAttribute('aria-expanded', false)
		})
	})
}

/**
 * Dismiss alert element
 */
const bricksAlertDismissFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-alert svg',
	eachElement: (dismissable) => {
		dismissable.addEventListener('click', () => {
			let alertEl = dismissable.closest('.brxe-alert')
			alertEl.remove()
		})
	}
})

function bricksAlertDismiss() {
	bricksAlertDismissFn.run()
}

/**
 * Element: Tabs
 */
const bricksTabsFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-tabs, .brxe-tabs-nested',
	forceReinit: (element, index) => {
		// Builder: Force reinit for adding new tab title/pane in the builder
		return !bricksIsFrontend
	},
	eachElement: (tabElement) => {
		let hash = window.location.hash

		const openTabsOnEvent = tabElement.getAttribute('data-open-on') || 'click'

		// Get first .tab-title & all it's siblings (allows for custom tab title element structure)
		let firstTitle = tabElement.querySelector('.tab-title')
		let titles = firstTitle
			? Array.from(firstTitle.parentNode.children).filter((el) =>
					el.classList.contains('tab-title')
				)
			: []

		// Get first .tab-pane & all it's siblings (allows for custom tab pane element structure)
		let firstPane = tabElement.querySelector('.tab-pane')
		let panes = firstPane
			? Array.from(firstPane.parentNode.children).filter((el) => el.classList.contains('tab-pane'))
			: []

		if (!titles.length || !panes.length) {
			return
		}

		titles.forEach((title, index) => {
			// Create tab title click listener
			title.addEventListener(openTabsOnEvent, () => {
				let activeTitle = null
				let activePane = null
				titles.forEach((t, i) => {
					// Add .brx-open to tab title
					if (i === index) {
						t.classList.add('brx-open')
						t.setAttribute('aria-selected', 'true')
						t.setAttribute('tabindex', '0')
						activeTitle = title
					}

					// Remove .brx-open from other title
					else {
						// Remove .brx-open from other title and set ARIA attributes
						t.classList.remove('brx-open')
						t.setAttribute('aria-selected', 'false')
						t.setAttribute('tabindex', '-1')
					}
				})

				panes.forEach((pane, i) => {
					// Add .brx-open to tab content
					if (i === index) {
						pane.classList.add('brx-open')
						activePane = pane
					}

					// Remove .brx-open from other content
					else {
						pane.classList.remove('brx-open')
					}
				})

				/**
				 * Add or remove URL hash
				 *
				 * @since 1.9.3: use replaceState to prevent browser from storing history with each accordion item click
				 *
				 * @since 1.8.6
				 */
				let anchorId =
					title?.id && !title.id.startsWith('brxe-') && !title.id.startsWith('brx-')
						? `#${title.id}`
						: ''
				if (anchorId) {
					history.replaceState(null, null, anchorId)
				} else {
					history.replaceState(null, null, ' ')
				}

				// Trigger custom event "bricks/tabs/changed" (#86bwtqc4j)
				document.dispatchEvent(
					new CustomEvent('bricks/tabs/changed', {
						detail: {
							elementId: tabElement.getAttribute('data-script-id'),
							activeIndex: index,
							activeTitle,
							activePane
						}
					})
				)
			})

			// Keydown listener for arrow keys (@since 1.11)
			title.addEventListener('keydown', (event) => {
				let newIndex
				if (event.key === 'ArrowRight') {
					newIndex = index + 1 === titles.length ? 0 : index + 1
				} else if (event.key === 'ArrowLeft') {
					newIndex = index - 1 < 0 ? titles.length - 1 : index - 1
				} else if (event.key === 'Home') {
					event.preventDefault() // Prevent page scroll
					newIndex = 0
				} else if (event.key === 'End') {
					event.preventDefault() // Prevent page scroll
					newIndex = titles.length - 1
				} else {
					return
				}
				titles[newIndex].focus()
				titles[newIndex].click()
			})
		})

		// STEP: Open tab title and content based on URL hash or fallback to first tab
		let activeIndex = tabElement.getAttribute('data-open-tab') || 0

		// URL hash found
		if (hash) {
			// Get the index of the tab title that matches the hash
			let tempIndex = titles.findIndex(
				(title) => title?.id && !title.id.startsWith('brxe-') && title.id === hash.replace('#', '')
			)
			activeIndex = tempIndex !== -1 ? tempIndex : 0
		}

		// Set title to open (fallback: first item)
		if (titles[activeIndex]) {
			titles[activeIndex].classList.add('brx-open')
		} else {
			titles[0].classList.add('brx-open')
		}

		// Set content to open (fallback: first item)
		if (panes[activeIndex]) {
			panes[activeIndex].classList.add('brx-open')
		} else {
			panes[0].classList.add('brx-open')
		}

		// Set initial aria attributes after brx-open class is added (@since 1.11.1)
		titles.forEach((title) => {
			if (title.classList.contains('brx-open')) {
				title.setAttribute('aria-selected', 'true')
				title.setAttribute('tabindex', '0')
			} else {
				title.setAttribute('aria-selected', 'false')
				title.setAttribute('tabindex', '-1')
			}
		})
	}
})

function bricksTabs() {
	bricksTabsFn.run()
}

/**
 * Element - Video: Play video on overlay, icon click or thumbnail preview click
 */
const bricksVideoOverlayClickDetectorFn = new BricksFunction({
	parentNode: document,
	selector: '.bricks-video-overlay, .bricks-video-overlay-icon, .bricks-video-preview-image',
	frontEndOnly: true,
	eachElement: (overlay) => {
		const onOverlayAction = (e) => {
			let videoWrapper = e.target.closest('.brxe-video')

			if (!videoWrapper) {
				return
			}

			// STEP: Convert thumbnail preview into iframe

			// Get thumbnail preview element
			const thumbnailPreviewElement = videoWrapper.querySelector('.bricks-video-preview-image')

			if (thumbnailPreviewElement) {
				// Convert thumbnail preview into iframe together with all attributes (youtube/vimeo)
				const iframeElement = document.createElement('iframe')
				const attributes = [...thumbnailPreviewElement.attributes]
				attributes.forEach((attr) => {
					// Skip the class attribute and style attribute
					if (attr.name === 'class' || attr.name === 'style') {
						return
					}

					// Change the data-src attribute to src
					if (attr.name === 'data-iframe-src') {
						iframeElement.setAttribute('src', attr.value)
						return
					}

					// Add all other attributes to the iframe element
					iframeElement.setAttribute(attr.name, attr.value)
				})

				thumbnailPreviewElement.replaceWith(iframeElement)
			}

			// STEP: Start iframe/video

			// Get iframe element (video type: YouTube, Vimeo)
			const iframeElement = videoWrapper.querySelector('iframe')

			if (iframeElement && iframeElement.getAttribute('src')) {
				iframeElement.src += '&autoplay=1'
			}

			// If there is iframe, remove tabindex to allow keyboard navigation (@since 1.11)
			if (iframeElement) {
				iframeElement.removeAttribute('tabindex')
			}

			// Get <video> element (video type: media, file URL)
			const videoElement = videoWrapper.querySelector('video')

			if (videoElement) {
				videoElement.play()

				// remove tabindex to allow keyboard navigation (@since 1.11)
				videoElement.removeAttribute('tabindex')

				// Focus on the video element in next tick to prevent the browser from scrolling to the video element (@since 1.11)
				// This is to ensure that tabindex is removed before focusing on the video element
				setTimeout(() => {
					videoElement.focus()
				}, 0)
			}
		}

		overlay.addEventListener('click', onOverlayAction)

		// Add keydown event listener for accessibility (Space key and Enter key) (@since 1.11)
		overlay.addEventListener('keydown', (event) => {
			if (event.key === ' ' || event.key === 'Enter') {
				event.preventDefault()
				onOverlayAction(event)
			}
		})
	}
})
function bricksVideoOverlayClickDetector() {
	bricksVideoOverlayClickDetectorFn.run()
}

/**
 * Background video (supported: YouTube and file URLs)
 * Also allows Vimeo or YouTube video ID, instead of full link (@since 1.12.2)
 */
const bricksBackgroundVideoInitFn = new BricksFunction({
	parentNode: document,
	selector: '.bricks-background-video-wrapper',
	forceReinit: (element, index) => {
		// Builder: Force reinit as the URL parameter is not yet set (@since 1.8)
		return !bricksIsFrontend
	},
	eachElement: (videoWrapper) => {
		if (videoWrapper.classList.contains('loaded')) {
			return
		}

		let videoId
		let videoUrl = videoWrapper.getAttribute('data-background-video-url')

		// STEP: Convert Vimeo or YouTube video ID into full URL (@since 1.12.2)
		if (videoUrl && !videoUrl.includes('http')) {
			// Patterns
			const youtubeIdPattern = /^[a-zA-Z0-9_-]{11}$/
			const vimeoIdPattern = /^[0-9]{6,10}$/

			// YouTube ID
			if (youtubeIdPattern.test(videoUrl)) {
				videoUrl = `https://www.youtube.com/watch?v=${videoUrl}`
			}

			// Vimeo ID
			else if (vimeoIdPattern.test(videoUrl)) {
				videoUrl = `https://vimeo.com/${videoUrl}`
			}
		}

		// Return: No videoUrl provided
		if (!videoUrl) {
			return
		}

		/**
		 * STEP: Start playing video on breakpoint and up
		 *
		 * Setting 'videoPlayBreakpoint' stored in data attribute 'data-background-video-show-at-breakpoint'.
		 *
		 * @since 1.8.5
		 */
		let videoPlayBreakpoint = parseInt(
			videoWrapper.getAttribute('data-background-video-show-at-breakpoint')
		)

		// Return: Viewport width is smaller than breakpoint width
		if (videoPlayBreakpoint && window.innerWidth < videoPlayBreakpoint) {
			return
		}

		let videoScale = videoWrapper.getAttribute('data-background-video-scale')
		let videoAspectRatio = videoWrapper.getAttribute('data-background-video-ratio') || '16:9'
		let videoAspectRatioX = parseInt(videoAspectRatio.split(':')[0] || 16)
		let videoAspectRatioY = parseInt(videoAspectRatio.split(':')[1] || 9)

		let startTime = parseInt(videoWrapper.getAttribute('data-background-video-start')) || 0
		let endTime = parseInt(videoWrapper.getAttribute('data-background-video-end')) || 0
		let videoLoop = videoWrapper.getAttribute('data-background-video-loop') == 1

		// Poster settings (@since 1.11)
		const posterImageCustom = videoWrapper.getAttribute('data-background-video-poster')
		const posterImageYouTubeSize = videoWrapper.getAttribute('data-background-video-poster-yt-size')

		// End time must be greater than start time: If not, don't use it
		if (endTime < startTime) {
			endTime = 0
		}

		let isIframe = false // YouTube and Vimeo iframe embed
		let isYoutube = false
		let isVimeo = false

		/**
		 * YouTube embed
		 *
		 * NOTE: Error "Failed to execute 'postMessage' on 'DOMWindow'" when origin is not HTTPS
		 *
		 * Adding 'host' or 'origin' does not fix this error.
		 *
		 * @since 1.12.3: Supports short YouTube url (e.g. https://youtu.be/VIDEO_ID)
		 * @since 2.0: Support Youtube shorts and live videos and a change to the way video ID is extracted, now using a regex pattern
		 */
		if (videoUrl.indexOf('youtube.com') !== -1 || videoUrl.indexOf('youtu.be') !== -1) {
			isIframe = true
			isYoutube = true

			const videoData = bricksGetYouTubeVideoLinkData(videoUrl)
			videoId = videoData.id
			videoUrl = videoData.url
		}

		/**
		 * Vimeo embed
		 *
		 * @since 2.0: VideoUrl should not include '/progressive_redirect/' as that is direct link to file
		 *
		 * https://help.vimeo.com/hc/en-us/articles/360001494447-Using-Player-Parameters
		 */
		if (videoUrl.indexOf('vimeo.com') !== -1 && videoUrl.indexOf('/progressive_redirect/') === -1) {
			isIframe = true
			isVimeo = true

			// Transform Vimeo video URL into valid embed URL
			if (videoUrl.indexOf('player.vimeo.com/video') === -1) {
				videoUrl = videoUrl.replace('vimeo.com', 'player.vimeo.com/video')
			}
		}

		// Returns poster image element (@since 1.11)
		const getPosterImageElement = () => {
			const posterImage = document.createElement('img')
			posterImage.classList.add('bricks-video-poster-image')

			let hasPosterImage = false

			// YouTube support custom image or auto image
			if (isYoutube) {
				// First we try to set default image
				if (posterImageYouTubeSize) {
					posterImage.src = `https://img.youtube.com/vi/${videoId}/${posterImageYouTubeSize}.jpg`
					hasPosterImage = true
				}
				// If auto image is not set, we try custom image
				else if (posterImageCustom) {
					posterImage.src = posterImageCustom
					hasPosterImage = true
				}
			}

			// Vimeo support custom image only
			if (isVimeo && posterImageCustom) {
				posterImage.src = posterImageCustom
				hasPosterImage = true
			}

			// Return false if no poster image is set
			if (!hasPosterImage) {
				return false
			}

			return posterImage
		}

		const removePosterImageElement = () => {
			const posterImageElement = videoWrapper.querySelector('.bricks-video-poster-image')
			if (posterImageElement) {
				posterImageElement.remove()
			}
		}

		let videoElement

		// STEP: YouTuvbe and Vimeo <iframe> embed
		if (isIframe) {
			if (isYoutube) {
				// Check if YouTube API script is already added
				if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
					// Create script tag for YouTube IFrame API
					let tag = document.createElement('script')

					// Builder: Compatible with Cloudflare Rocket Loader (@since 2.0)
					if (!bricksIsFrontend && window.bricksData?.builderCloudflareRocketLoader) {
						tag.setAttribute('data-cfasync', 'false')
					}

					// Set source to YouTube IFrame API URL
					tag.src = 'https://www.youtube.com/iframe_api'

					// Find the first script tag on your page
					let firstScriptTag = document.getElementsByTagName('script')[0]

					// Insert new script tag before the first script tag
					firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
				}

				videoElement = document.createElement('div')

				// Remove <video> element (present in the DOM due to Chrome compatibility)
				if (bricksIsFrontend && videoWrapper.querySelector('video')) {
					videoWrapper.removeChild(videoWrapper.querySelector('video'))
				}

				// Append videoElement to the videoWrapper before initializing the player
				videoWrapper.appendChild(videoElement)

				// append image to videoWrapper, if exists (@since 1.11)
				const posterImageElement = getPosterImageElement()
				if (posterImageElement) {
					videoWrapper.appendChild(posterImageElement)
				}

				// Wait for YouTube IFrame Player API to load
				let playerCheckInterval = setInterval(function () {
					if (window.YT && YT.Player) {
						clearInterval(playerCheckInterval)

						let player = new YT.Player(videoElement, {
							width: '640',
							height: '360',
							videoId: videoId,
							playerVars: {
								autoplay: 1,
								controls: 0,
								start: startTime || undefined,
								// end: endTime || undefined, // Check endTime manually below to pause video instead of stopping it
								mute: 1,
								rel: 0,
								showinfo: 0,
								modestbranding: 1,
								cc_load_policy: 0,
								iv_load_policy: 3,
								autohide: 0,
								loop: 0, // Handle loop manually below according to startTime & endTime
								playlist: videoId,
								enablejsapi: 1
							},
							events: {
								onReady: function (event) {
									// Check every second if video endTime is reached
									if (endTime) {
										let endTimeCheckInterval = setInterval(function () {
											if (player.getCurrentTime() >= endTime) {
												// Loop or pause video
												if (videoLoop) {
													player.seekTo(startTime || 0, true)
												} else {
													player.pauseVideo()
													clearInterval(endTimeCheckInterval)
												}
											}
										}, 1000)
									}
								},

								onStateChange: function (event) {
									if (videoLoop) {
										// Video ended naturally: Restart at start time
										if (event.data == YT.PlayerState.ENDED) {
											player.seekTo(startTime || 0, true)
										}
									}

									if (event.data == YT.PlayerState.PLAYING) {
										// Remove poster image (@since 1.11)
										removePosterImageElement()
									}
								}
							}
						})
					}
				}, 100)
			}

			if (isVimeo) {
				// Check if Vimeo Player API script is already added
				if (!document.querySelector('script[src="https://player.vimeo.com/api/player.js"]')) {
					// STEP: Create script tag for Vimeo Player API
					let tag = document.createElement('script')

					// Builder: Compatible with Cloudflare Rocket Loader (@since 2.0)
					if (!bricksIsFrontend && window.bricksData?.builderCloudflareRocketLoader) {
						tag.setAttribute('data-cfasync', 'false')
					}

					// Set source to Vimeo Player API URL
					tag.src = 'https://player.vimeo.com/api/player.js'

					// Find the first script tag on page
					let firstScriptTag = document.getElementsByTagName('script')[0]

					// Insert new script tag before the first script tag
					firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
				}

				// Remove <video> element (present in the DOM due to Chrome compatibility)
				if (bricksIsFrontend && videoWrapper.querySelector('video')) {
					videoWrapper.removeChild(videoWrapper.querySelector('video'))
				}

				// Create a div for the Vimeo player
				videoElement = document.createElement('div')

				// append image to videoWrapper, if exists (@since 1.11)
				const posterImageElement = getPosterImageElement()
				if (posterImageElement) {
					videoWrapper.appendChild(posterImageElement)
				}

				// Append videoElement to the videoWrapper before initializing the player
				videoWrapper.appendChild(videoElement)

				// Extract Vimeo video ID
				const vimeoVideoId = videoUrl.split('/').pop()

				// Wait for Vimeo Player API to load
				let playerCheckInterval = setInterval(function () {
					if (window.Vimeo && Vimeo.Player) {
						clearInterval(playerCheckInterval)

						// STEP: Initialize new Vimeo Player
						let player = new Vimeo.Player(videoElement, {
							id: vimeoVideoId,
							width: 640,
							autoplay: true,
							controls: false,
							background: true,
							loop: videoLoop && !startTime // Handle loop manually if startTime set (as loop set to true always starts video at 0 sec)
						})

						if (posterImageElement) {
							player.on('play', function () {
								// Remove poster image(@since 1.11)
								removePosterImageElement()
							})
						}

						// Player is loaded: Start the video at the startTime
						if (startTime) {
							player.on('loaded', function () {
								player.setCurrentTime(startTime)
							})
						}

						// EndTime reached: Pause or loop video
						if (endTime) {
							player.on('timeupdate', function (data) {
								if (data.seconds >= endTime) {
									if (videoLoop) {
										player.setCurrentTime(startTime || 0)
										player.play()
									} else {
										player.pause()
									}
								}
							})
						}

						// End of video reached
						player.on('ended', () => {
							// Restart video at startTime
							if (videoLoop) {
								player.setCurrentTime(startTime || 0).then(function (seconds) {
									player.play()
								})
							}
						})
					}
				}, 100)
			}
		}

		// STEP: Get the <video> element (present in the DOM due to Chrome compatibility)
		else {
			videoElement = videoWrapper.querySelector('video')

			if (videoElement) {
				let elementId = videoElement.closest('[data-script-id]')?.getAttribute('data-script-id')

				// Play once: Remove 'loop' attribute
				if (!videoLoop) {
					videoElement.removeAttribute('loop')
				} else if (!videoElement.hasAttribute('loop')) {
					videoElement.setAttribute('loop', '')
				}

				// Re-init startTime in builder
				if (!bricksIsFrontend) {
					videoElement.currentTime = startTime || 0
				}

				if (!window.bricksData.videoInstances?.[elementId]) {
					window.bricksData.videoInstances[elementId] = {}
				}

				// Store on window to update in builder :)
				window.bricksData.videoInstances[elementId].startTime = startTime
				window.bricksData.videoInstances[elementId].endTime = endTime
				window.bricksData.videoInstances[elementId].videoLoop = videoLoop

				// Set custom start time & play video
				let loadedmetadata = function () {
					if (window.bricksData.videoInstances[elementId].startTime) {
						this.currentTime = window.bricksData.videoInstances[elementId].startTime
						this.play()
					}
				}

				// Current playback time is greater than or equal to end time OR video duration
				let timeupdate = function () {
					// NOTE: media controller position changes ever 15 to 250ms (we use 250ms)
					if (
						this.currentTime >=
						(window.bricksData.videoInstances[elementId].endTime || this.duration) - 0.25
					) {
						// Loop disabled: Pause video
						if (window.bricksData.videoInstances[elementId].videoLoop) {
							// Reset to start time
							this.currentTime = window.bricksData.videoInstances[elementId].startTime

							// Video is not playing: Play it
							if (videoElement.paused) {
								this.play()
							}
						} else {
							this.pause()
						}
					}
				}

				// Set custom start time & play video
				let ended = function () {
					if (
						window.bricksData.videoInstances[elementId].videoLoop &&
						window.bricksData.videoInstances[elementId].startTime
					) {
						this.currentTime = window.bricksData.videoInstances[elementId].startTime
						this.play()
					}
				}

				/**
				 * Custom start and/or end time set
				 *
				 * Add event listeners to the video element (if not already added; check via .listening class)
				 */
				if (!videoElement.classList.contains('listening') && (startTime || endTime)) {
					videoElement.classList.add('listening')

					videoElement.addEventListener('loadedmetadata', loadedmetadata)
					videoElement.addEventListener('timeupdate', timeupdate)
					videoElement.addEventListener('ended', ended)
				}
			}
		}

		if (videoScale) {
			videoElement.style.transform = `translate(-50%, -50%) scale(${videoScale})`
		}

		// STEP: Lazy load video (frontend only)
		if (bricksIsFrontend) {
			if (videoWrapper.classList.contains('bricks-lazy-video')) {
				new BricksIntersect({
					element: videoWrapper,
					callback: (el) => {
						el.classList.remove('bricks-lazy-video')

						if (isIframe) {
							el.appendChild(videoElement)
						} else {
							videoElement.src = videoUrl
						}
					}
				})
			}
		} else {
			if (isIframe) {
				videoWrapper.appendChild(videoElement)
			} else {
				videoElement.src = videoUrl
			}
		}

		videoWrapper.classList.add('loaded')

		let resizeObserver = new ResizeObserver((entries) => {
			for (let entry of entries) {
				let videoWidth

				if (entry.contentBoxSize) {
					// Firefox implements `contentBoxSize` as a single content rect, rather than an array
					let contentBoxSize = Array.isArray(entry.contentBoxSize)
						? entry.contentBoxSize[0]
						: entry.contentBoxSize
					videoWidth = contentBoxSize.inlineSize
				} else {
					videoWidth = entry.contentRect.width
				}

				let elementHeight = videoWrapper.clientHeight

				let videoHeight = (videoWidth * videoAspectRatioY) / videoAspectRatioX

				if (videoHeight < elementHeight) {
					videoHeight = elementHeight
					videoWidth = (elementHeight * videoAspectRatioX) / videoAspectRatioY
				}

				videoElement.style.width = `${videoWidth}px`
				videoElement.style.height = `${videoHeight}px`
			}
		})

		resizeObserver.observe(videoWrapper)
	}
})

function bricksBackgroundVideoInit() {
	bricksBackgroundVideoInitFn.run()
}

/**
 * Photoswipe 5 lightbox
 *
 * For accessibility reasons the <a> is required by default: https://photoswipe.com/getting-started/#required-html-markup
 * If you want to use different markup there is a domItemData filter: https://photoswipe.com/data-sources/#custom-html-markup
 *
 * @since 1.8
 */
const bricksPhotoswipeFn = new BricksFunction({
	parentNode: document,
	selector: '.bricks-lightbox',
	windowVariableCheck: ['PhotoSwipeLightbox'],
	eachElement: (lightboxElement) => {
		let gallery = lightboxElement
		let children = lightboxElement.tagName === 'A' ? '' : 'a'
		let lightboxId =
			lightboxElement.getAttribute('data-pswp-id') ||
			lightboxElement.getAttribute('data-lightbox-id') // For Image Gallery

		// Can be set to 'none' to avoid jumpy animation between different aspect ratios (@since 1.8.4)
		let animationType = lightboxElement.getAttribute('data-animation-type') || 'zoom'

		// Get all lightbox elements with the same ID (@since 1.7.2)
		if (lightboxId) {
			children = bricksQuerySelectorAll(document, `[data-pswp-id="${lightboxId}"]`)
		}

		// https://photoswipe.com/styling/
		let closeSVG =
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'

		let options = {
			mainClass: 'brx', // To distinguish from Photoswipe 4 (used on single product page by Woo core)
			gallery: gallery,
			counter: !gallery.classList.contains('brxe-carousel'), // Hide wrong carousel count for carousel loop (due to swiperJS-generated slide duplicates)
			children: children,
			pswpModule: PhotoSwipe5, // NOTE: Rename class from 'PhotoSwipe' to 'PhotoSwipe5' to avoid conflict with Photoswipe 4 that WooCommerce core uses!
			closeSVG: closeSVG,
			showHideAnimationType: animationType
		}

		// Element, that contains thumbnail settings, in case if we have multiple galleries connected (@since 1.12)
		let thumbnailElement = null
		let paddingElement = null
		let captionElement = null

		// Get frist element with "thumbnail" settings (@since 1.12)
		if (lightboxId) {
			// check "children" elements, if they or their ancestors have thumbnails
			children.forEach((child) => {
				// Thumbnails
				if (child.classList.contains('has-lightbox-thumbnails')) {
					thumbnailElement = child // update thumbnailsElement
				} else {
					let parent = child.closest('.has-lightbox-thumbnails')
					if (parent) {
						thumbnailElement = parent // update thumbnailsElement
					}
				}

				// Padding
				if (child.getAttribute('data-lightbox-padding')) {
					paddingElement = child
				} else {
					let parent = child.closest('[data-lightbox-padding]')
					if (parent) {
						paddingElement = parent
					}
				}

				// Caption
				if (child.classList.contains('has-lightbox-caption')) {
					captionElement = child
				} else {
					let parent = child.closest('.has-lightbox-caption')
					if (parent) {
						captionElement = parent
					}
				}
			})
		}
		// If we don't have lightboxId, check the current element
		else if (lightboxElement.classList.contains('has-lightbox-thumbnails')) {
			thumbnailElement = lightboxElement
		}

		// Lightbox padding (@since 1.10)
		// Check elements in the following order: thumbnailElement, paddingElement, lightboxElement
		let padding = (thumbnailElement || paddingElement || lightboxElement).getAttribute(
			'data-lightbox-padding'
		)

		if (padding) {
			options.padding = JSON.parse(padding)
		}

		// Image click action (@since 1.10)
		let imageClickAction = lightboxElement.getAttribute('data-lightbox-image-click')

		if (imageClickAction) {
			options.imageClickAction = imageClickAction
		}

		const lightbox = new PhotoSwipeLightbox(options)

		// Remove content placeholder if animation type is 'none' to avoid weird animation (#86bwb5vtj; @since 2.0)
		if (animationType === 'none') {
			lightbox.addFilter('useContentPlaceholder', (useContentPlaceholder, content) => {
				return false
			})
		}

		/**
		 * Lightbox caption
		 *
		 * Carousel, Image, Image Gallery.
		 *
		 * https://github.com/dimsemenov/photoswipe-dynamic-caption-plugin
		 *
		 * @since 1.10
		 */
		if (
			typeof PhotoSwipeDynamicCaption !== 'undefined' &&
			// Check elements in the following order: captionElement, lightboxElement (@since 1.12)
			(captionElement || lightboxElement).classList.contains('has-lightbox-caption')
		) {
			let lightboxCaption = new PhotoSwipeDynamicCaption(lightbox, {
				type: 'below', // auto, below, aside
				captionContent: (slide) => {
					return slide.data.element.getAttribute('data-lightbox-caption')
				}
			})
		}

		/**
		 * Lightbox: Thumbnail navigation
		 *
		 * https://photoswipe.com/adding-ui-elements/
		 *
		 * @since 1.10
		 */
		if (thumbnailElement) {
			// Register thumbnail navigation and add images to the DOM
			lightbox.on('uiRegister', function () {
				lightbox.pswp.ui.registerElement({
					name: 'thumbnail-navigation',
					className: 'pswp__thumbnail-nav-wrapper',
					appendTo: 'wrapper', // or 'bar'
					onInit: (el, pswp) => {
						const thumbnailNav = document.createElement('div')
						thumbnailNav.className = 'pswp__thumbnail-nav'

						let lightboxImageNodes = []

						// lightboxElement has lightbox id, get all nodes with the same lightbox id (@since 1.12)
						if (lightboxId) {
							lightboxImageNodes = bricksQuerySelectorAll(
								document,
								`[data-pswp-id="${lightboxId}"][data-pswp-src]`
							)
						}
						// else: Get all nodes with 'data-pswp-src' attribute
						else {
							lightboxImageNodes = lightboxElement.querySelectorAll('a[data-pswp-src]')
						}

						let lightboxImageUrls = []

						lightboxImageNodes.forEach((item) => {
							// Skip duplicate slides
							if (item.parentNode.classList.contains('swiper-slide-duplicate')) {
								return
							}

							let src = item.getAttribute('href')

							if (src && !lightboxImageUrls.includes(src)) {
								lightboxImageUrls.push(src)
							}
						})

						// Add images to the thumbnail navigation
						lightboxImageUrls.forEach((url, index) => {
							const thumbImg = document.createElement('img')
							thumbImg.src = url
							thumbImg.dataset.index = index

							// Thumbnail size
							let thumbnailSize = thumbnailElement.getAttribute('data-lightbox-thumbnail-size')

							if (thumbnailSize) {
								thumbImg.style.width = isNaN(thumbnailSize) ? thumbnailSize : thumbnailSize + 'px'
							}

							thumbnailNav.appendChild(thumbImg)
						})

						el.appendChild(thumbnailNav)

						// Go to thumbnail index
						thumbnailNav.addEventListener('click', (e) => {
							let imageIndex = parseInt(e.target.getAttribute('data-index'))
							if (Number.isInteger(imageIndex)) {
								thumbnailNav.setAttribute('data-active-index', imageIndex)

								// NOTE: Hack needed when loop is enabled to go to correct index
								if (options?.loop) {
									imageIndex += 2
								}

								/**
								 * For Carousel: Find the correct index
								 *
								 * Why: SwiperJS duplicates slides with 'loop' setting enabled, so first slide is not always index 0.
								 *
								 * @since 1.12.2
								 */
								if (gallery.classList.contains('brxe-carousel')) {
									let swiperId = gallery.getAttribute('data-script-id')

									// Get all slides in an array
									let tempArr = bricksData.swiperInstances[swiperId].slides
										// Map the data we need
										.map((slide, index) => {
											return {
												slide,
												index,
												pswpIndex: Number(slide.dataset.swiperSlideIndex)
											}
										})

										// Filter out all duplicates and find correct index
										.filter(
											(item) =>
												!item.slide.classList.contains('swiper-slide-duplicate') &&
												item.pswpIndex === imageIndex
										)

									if (tempArr.length) {
										imageIndex = tempArr[0].index
									}
								}

								pswp.goTo(imageIndex)
							}
						})
					}
				})
			})

			// Update thumbnail navigation on init && slide change
			lightbox.on('change', function () {
				const thumbnailNav = document.querySelector('.pswp__thumbnail-nav')
				if (thumbnailNav) {
					let activeImage = thumbnailNav.querySelector('.active')
					// Remove 'active' class from the old active thumbnail image
					if (activeImage) {
						activeImage.classList.remove('active')
					}

					// Get the active image index
					let currentIndex =
						lightbox.pswp.currSlide.data.element.dataset.pswpIndex || lightbox.pswp.currIndex

					// Add 'active' class to the now current thumbnail image
					activeImage = thumbnailNav.querySelector(`img[data-index="${currentIndex}"`)

					if (activeImage) {
						activeImage.classList.add('active')

						let activeImageRect = activeImage.getBoundingClientRect()
						let marginLeft =
							thumbnailNav.offsetWidth / 2 - activeImage.offsetLeft - activeImageRect.width / 2
						marginLeft += (window.innerWidth - thumbnailNav.offsetWidth) / 2

						thumbnailNav.style.transform = 'translateX(' + marginLeft + 'px)'
					}
				}
			})
		}

		/**
		 * Lightbox video (not supported in Photoswipe natively)
		 *
		 * Supported units: px, %, vw, vh
		 *
		 * Generate HTML for YouTube, Vimeo, and <video> embeds.
		 *
		 * https://photoswipe.com/data-sources/
		 */
		lightbox.on('itemData', (e) => {
			let photoswipeInitialised = document.querySelector('.brx .pswp__container') // Add .brx class to avoid conflict with Woo pwsp (@since 1.12.2)
			let videoUrl = lightboxElement.getAttribute('data-pswp-video-url')
			let width = lightboxElement.getAttribute('data-pswp-width')
			let height = lightboxElement.getAttribute('data-pswp-height')
			let controls = lightboxElement.getAttribute('data-no-controls') == 1 ? 0 : 1

			// width in '%' or 'vh'
			if (width && (width.includes('%') || width.includes('vw'))) {
				width = window.innerWidth * (parseInt(width) / 100)
			}

			// height in '%' or 'vw'
			if (height && (height.includes('%') || height.includes('vh'))) {
				height = window.innerHeight * (parseInt(height) / 100)
			}

			// Default width: 1280px
			if (!width) {
				width = 1280
			}

			// Auto-height (16:9)
			if (!height || height == 720) {
				height = Math.round((width / 16) * 9)
			}

			if (!photoswipeInitialised && videoUrl) {
				let html = bricksGetLightboxVideoNode(videoUrl, controls)

				e.itemData = {
					html: html.outerHTML, // Convert DOM node to HTML string
					width: width,
					height: height
				}
			}
		})

		// Content added to the DOM: Autoplay <video> after lightbox is opened
		lightbox.on('contentAppend', ({ content }) => {
			if (content.element) {
				let photoswipeVideo = content.element.querySelector('video')

				if (photoswipeVideo) {
					photoswipeVideo.play()
				}
			}
		})

		// Fix 'loop' type carousel element requires double clicks on last slide (due to swiperJS-generated slide duplicates)
		if (gallery.classList.contains('brxe-carousel')) {
			let swiperId = gallery.getAttribute('data-script-id')

			// Correct the number of items as swiperJS duplicates slides with 'loop' setting enabled
			if (bricksData.swiperInstances?.[swiperId]?.loopedSlides) {
				// https://photoswipe.com/filters/#numitems
				lightbox.addFilter('numItems', (numItems, dataSource) => {
					// Lightbox has no children: Return original numItems
					if (dataSource.gallery) {
						let duplicateSlides = 0

						if (dataSource.gallery.classList.contains('brxe-carousel')) {
							// Carousel
							duplicateSlides =
								dataSource.gallery.querySelectorAll('.swiper-slide-duplicate').length
						}
						// Something wrong if duplicateSlides more than original numItems, so return original numItems
						numItems = numItems > duplicateSlides ? numItems - duplicateSlides : numItems
					}

					return numItems
				})

				// Modify 'clickedIndex' as 'numItems' has been modified
				lightbox.addFilter('clickedIndex', (clickedIndex, e) => {
					let currentSlide = e.target.closest('.swiper-slide')

					if (currentSlide) {
						// Store all slides in an array
						let tempArr = bricksData.swiperInstances[swiperId].slides
							.map((slide, index) => {
								return { slide, index }
							})
							.filter(Boolean)

						if (tempArr.length) {
							// Current clicked swiper slide index from data-swiper-slide-index attribute
							let currentSwiperSlideIndex = parseInt(currentSlide.dataset.swiperSlideIndex)

							// Find first result whehre data-swiper-slide-index is equal to currentSlideIndex as numItems changed
							let simulateSlide = tempArr.filter(
								(x) => x.slide.dataset.swiperSlideIndex == currentSwiperSlideIndex
							)

							if (simulateSlide.length) {
								// Get the index of the first result
								clickedIndex = simulateSlide[0].index
							}
						}
					}

					return clickedIndex
				})
			}
		}

		lightbox.init()
	}
})

function bricksPhotoswipe() {
	bricksPhotoswipeFn.run()
}

/**
 * Return iframe or video DOM node for lightbox video
 *
 * @param {string} videoUrl
 * @param {boolean} controls @since 1.10.3
 *
 * @returns iframe or video DOM node
 *
 * @since 1.7.2
 * @since 2.0: Change the way we parse YouTube video, to also support live and shorts videos.
 */
function bricksGetLightboxVideoNode(videoUrl, controls) {
	if (videoUrl) {
		hasContent = true

		let isIframe = false // For YouTube and Vimeo embeds

		if (videoUrl.indexOf('youtube.com') !== -1 || videoUrl.indexOf('youtu.be') !== -1) {
			isIframe = true

			const videoData = bricksGetYouTubeVideoLinkData(videoUrl)
			videoUrl = videoData.url

			if (videoData.id) {
				// Add parameters
				videoUrl += '?autoplay=1'
				videoUrl += '&rel=0'

				// Hide YouTube controls
				if (!controls) {
					videoUrl += '&controls=0'
				}
			}
		}

		if (videoUrl.indexOf('vimeo.com') !== -1) {
			isIframe = true

			// Transform Vimeo video URL into valid embed URL
			if (videoUrl.indexOf('player.vimeo.com/video') === -1) {
				videoUrl = videoUrl.replace('vimeo.com', 'player.vimeo.com/video')
			}

			videoUrl += '?autoplay=1'

			// Hide Vimeo controls
			if (!controls) {
				videoUrl += '&controls=0'
			}
		}

		if (isIframe) {
			// Create <iframe> for YouTube/Vimeo video
			let iframeElement = document.createElement('iframe')

			iframeElement.setAttribute('src', videoUrl)
			iframeElement.setAttribute('allow', 'autoplay')
			iframeElement.setAttribute('allowfullscreen', 1)

			return iframeElement
		}

		// Create <video> element (trigger autoplay in Photoswipe)
		let videoElement = document.createElement('video')
		videoElement.setAttribute('src', videoUrl)

		if (controls) {
			videoElement.setAttribute('controls', 1)
		}

		videoElement.setAttribute('playsinline', 1)

		return videoElement
	}
}

/**
 * Element: Accordion
 */
const bricksAccordionFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-accordion, .brxe-accordion-nested',
	/**
	 * Force reinit as the items might increase/decrease inside nested accordions.
	 *
	 * Each item has .listening class to avoid multiple event listeners
	 *
	 * @since 1.9.4
	 */
	forceReinit: true,
	eachElement: (accordion) => {
		const slideUp = (target, duration = 200) => {
			target.style.display = 'block' // Ensure target is visible even without brx-open class (@since 1.12)
			target.style.transitionProperty = 'height, margin, padding'
			target.style.transitionDuration = `${duration}ms`
			target.style.height = `${target.offsetHeight}px`
			target.offsetHeight
			target.style.overflow = 'hidden'
			target.style.height = 0
			target.style.paddingTop = 0
			target.style.paddingBottom = 0
			target.style.marginTop = 0
			target.style.marginBottom = 0

			// Get the accordion item, target is the .accordion-content-wrapper
			let item = target.parentNode

			// Remove .brx-open class without delay (@since 1.12)
			item.classList.remove('brx-open')

			window.setTimeout(() => {
				target.style.display = 'none'
				target.style.removeProperty('height')
				target.style.removeProperty('padding-top')
				target.style.removeProperty('padding-bottom')
				target.style.removeProperty('margin-top')
				target.style.removeProperty('margin-bottom')
				target.style.removeProperty('overflow')
				target.style.removeProperty('transition-duration')
				target.style.removeProperty('transition-property')

				// Trigger custom event "bricks/accordion/close" (#86bwtqc4j)
				document.dispatchEvent(
					new CustomEvent('bricks/accordion/close', {
						detail: {
							elementId: accordion.getAttribute('data-script-id'),
							closeItem: item
						}
					})
				)
			}, duration)
		}

		const slideDown = (target, duration = 200) => {
			target.style.removeProperty('display')

			let display = window.getComputedStyle(target).display

			if (display === 'none') {
				display = 'block'
			}

			target.style.display = display

			let height = target.offsetHeight

			target.style.overflow = 'hidden'
			target.style.height = 0
			target.style.paddingTop = 0
			target.style.paddingBottom = 0
			target.style.marginTop = 0
			target.style.marginBottom = 0
			target.offsetHeight
			target.style.transitionProperty = 'height, margin, padding'
			target.style.transitionDuration = `${duration}ms`
			target.style.height = `${height}px`
			target.style.removeProperty('padding-top')
			target.style.removeProperty('padding-bottom')
			target.style.removeProperty('margin-top')
			target.style.removeProperty('margin-bottom')

			// Get the accordion item, target is the .accordion-content-wrapper
			let item = target.parentNode

			// Add .brx-open class without delay (@since 1.12)
			item.classList.add('brx-open')

			window.setTimeout(() => {
				target.style.removeProperty('height')
				target.style.removeProperty('overflow')
				target.style.removeProperty('transition-duration')
				target.style.removeProperty('transition-property')

				// Trigger custom event "bricks/accordion/open" (#86bwtqc4j)
				document.dispatchEvent(
					new CustomEvent('bricks/accordion/open', {
						detail: {
							elementId: accordion.getAttribute('data-script-id'),
							openItem: item
						}
					})
				)
			}, duration)
		}

		const slideToggle = (target, duration = 200) => {
			if (window.getComputedStyle(target).display === 'none') {
				return slideDown(target, duration)
			} else {
				return slideUp(target, duration)
			}
		}

		const expandItem = (item) => {
			item.classList.add('brx-open')
			let title = item.querySelector('.accordion-title-wrapper') ?? false
			if (title) {
				title.setAttribute('aria-expanded', 'true')
			}
		}

		let items = Array.from(accordion.children)
		let duration = accordion.hasAttribute('data-transition')
			? isNaN(accordion.dataset.transition)
				? 0
				: accordion.dataset.transition
			: 200
		let expandFirstItem = accordion.dataset.scriptArgs?.includes('expandFirstItem')
		let independentToggle = accordion.dataset.scriptArgs?.includes('independentToggle')

		// Get index of item to expand (@since 1.12)
		let expandItemIndexes = expandFirstItem ? ['0'] : false
		if (expandItemIndexes === false && accordion.hasAttribute('data-expand-item')) {
			expandItemIndexes = accordion.getAttribute('data-expand-item').split(',') // Split by ",", to get an array (@since 2.0)
		}

		let hash = window.location.hash || '' // Hash with # prefix

		// Only recognise nestables as accordion items
		items = items.filter(
			(item) =>
				item.classList.contains('brxe-section') ||
				item.classList.contains('brxe-container') ||
				item.classList.contains('brxe-block') ||
				item.classList.contains('brxe-div') ||
				item.classList.contains('accordion-item')
		)

		items.forEach((item, index) => {
			// Expand item by index (@since 1.12)
			// NOTE: expandItemIndexes is an array of strings, so we need to convert index to string (@since 2.0)
			if (expandItemIndexes && expandItemIndexes.includes(index.toString())) {
				expandItem(item)
			}

			// Expand accordion item if 'id' matches URL hash (@since 1.8.6)
			let anchorId = item?.id && !item.id.startsWith('brxe-') ? `#${item.id}` : ''
			if (anchorId && anchorId === hash) {
				expandItem(item)
			}

			if (item.classList.contains('listening')) {
				return
			}

			// Ensure click event listener is only added once
			item.classList.add('listening')

			/**
			 * Init title click listener
			 *
			 * Listen on accordion item also allows to re-run script in builder without having to setup any custom destroy()
			 */
			item.addEventListener('click', (e) => {
				let title = e.target.closest('.accordion-title-wrapper')

				if (!title) {
					return
				}

				let item = title.parentNode

				if (!item) {
					return
				}

				let content = item.querySelector('.accordion-content-wrapper')

				if (!content) {
					return
				}

				/**
				 * Builder: Return if selector detector is active
				 *
				 * @since 2.0
				 */
				const selectorDetectorActive = e.target.closest('.bricks-active-selector-detector')
				if (selectorDetectorActive) {
					return
				}

				// Stop propagation to avoid triggering nested accordion items
				e.stopPropagation()

				// No independent toggle: slideUp .open item (if it's currently not open)
				if (!independentToggle) {
					let openItems = accordion.querySelectorAll('.brx-open')

					if (openItems.length) {
						openItems.forEach((openItem) => {
							let openContent = openItem.querySelector('.accordion-content-wrapper')

							if (openContent && openContent !== content) {
								slideUp(openContent, duration)

								// Update the aria-label and aria-expanded attributes (@since 1.11)
								openContent.previousElementSibling.setAttribute(
									'aria-label',
									window.bricksData.i18n.openAccordion
								)
								openContent.previousElementSibling.setAttribute('aria-expanded', 'false')
							}
						})
					}
				}

				// Check if item is currently going to be opened (must be captured before slideToggle)
				let openingItem = !item.classList.contains('brx-open')

				/**
				 * Add or remove URL hash
				 *
				 * @since 1.9.3: use replaceState to prevent browser from storing history with each accordion item click
				 *
				 * @since 1.8.6
				 */
				if (anchorId && openingItem) {
					history.replaceState(null, null, anchorId)
				} else {
					history.replaceState(null, null, ' ')
				}

				// slideToggle target accordion content
				slideToggle(content, duration)

				// Update the aria-label and aria-expanded attributes
				if (item.classList.contains('brx-open')) {
					// brx-open class added/removed without delay (@since 1.12)
					title.setAttribute('aria-expanded', 'true')
				} else {
					// brx-open class added/removed without delay (@since 1.12)
					title.setAttribute('aria-expanded', 'false')
				}
			})

			// Add keyboard support for nested accordions (@since 1.11)
			let titleWrapper = item.querySelector('.accordion-title-wrapper') || item
			if (titleWrapper.getAttribute('role') === 'button') {
				titleWrapper.addEventListener('keydown', (e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						titleWrapper.click()
					}
				})
			}
		})
	}
})

function bricksAccordion() {
	bricksAccordionFn.run()
}

/**
 * Element: Animated Typing
 */
const bricksAnimatedTypingFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-animated-typing',
	windowVariableCheck: ['Typed'],
	eachElement: (element) => {
		let scriptId = element.dataset.scriptId
		let scriptArgs

		try {
			scriptArgs = JSON.parse(element.dataset.scriptArgs)
		} catch (e) {
			return false
		}

		let typedElement = element.querySelector('.typed')

		if (!typedElement) {
			return
		}

		/**
		 * Destroy typing animation
		 *
		 * @since 1.8.5: If not inside a splideJS slider (#862jz1gtn)
		 */
		if (
			window.bricksData.animatedTypingInstances[scriptId] &&
			!element.closest('.brxe-slider-nested.splide')
		) {
			window.bricksData.animatedTypingInstances[scriptId].destroy()
		}

		if (!scriptArgs.hasOwnProperty('strings') || !scriptArgs.strings) {
			return
		}

		if (Array.isArray(scriptArgs.strings) && !scriptArgs.strings.toString()) {
			return
		}

		window.bricksData.animatedTypingInstances[scriptId] = new Typed(typedElement, scriptArgs)

		/**
		 * Inside popup: Restart animation when the popup is opened
		 *
		 * @since 1.10.1
		 */
		const closestPopup = element.closest('.brx-popup:not([data-popup-ajax])') // Only if not an AJAX popup
		if (closestPopup) {
			document.addEventListener('bricks/popup/open', (event) => {
				if (event.detail.popupElement === closestPopup) {
					// Correct popup is opened: Restart the typing animation
					window.bricksData.animatedTypingInstances[scriptId].reset()
				}
			})
		}
	}
})

function bricksAnimatedTyping() {
	bricksAnimatedTypingFn.run()
}

/**
 * Element: Audio
 */
const bricksAudioFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-audio',
	windowVariableCheck: ['MediaElementPlayer'],
	eachElement: (element) => {
		let audioElement = element.querySelector('audio')

		if (audioElement) {
			let mediaElementPlayer = new MediaElementPlayer(audioElement)
		}
	}
})
function bricksAudio() {
	bricksAudioFn.run()
}

/**
 * Element: Post Reading Time (of #brx-content text)
 *
 * @since 1.8.5
 */
const bricksPostReadingTimeFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-post-reading-time',
	eachElement: (element) => {
		let wordsPerMinute = element.getAttribute('data-wpm')
		let charactersPerMinute = element.getAttribute('data-cpm')

		/**
		 * Return: No words/characters per minute set means we are inside a query loop (with no 'contentSelector' set)
		 *
		 * Reading time is calculated on the server side and added to HTML in element's render() function.
		 *
		 * @since 1.10
		 */
		if (!wordsPerMinute && !charactersPerMinute) {
			return
		}

		let contentSelector = element.dataset.contentSelector || '.brxe-post-content'
		let closestQueryLoop = element.closest('[data-query-loop-index]') // NOTE: Only works if query loop element has CSS settings
		let content = closestQueryLoop
			? closestQueryLoop.querySelector(contentSelector)
			: document.querySelector(contentSelector)

		// Fallback to #brx-content
		if (!content) {
			content = document.querySelector('#brx-content')
		}

		if (!content) {
			return
		}

		let prefix = element.getAttribute('data-prefix') || ''
		let suffix = element.getAttribute('data-suffix') || ''

		/**
		 * Define chunk size for long words (used for non-Chinese and non-Japanese text)
		 * NOTE: These values are magic numbers so if there's a need we can provide a setting to adjust them
		 *
		 * @since 1.10
		 */
		let longWordChunkSize = 5
		let longWordThreshold = 15

		let articleText = content.textContent

		/**
		 * Define average characters per word for Chinese and Japanese
		 * NOTE: These values are approximate and may not be accurate for all text
		 *
		 * @since 1.10
		 */
		const averageCharactersPerWord = {
			chinese: 1.5, // Average characters per word for Chinese
			japanese: 2.5 // Average characters per word for Japanese
		}

		// Function to detect language based on text
		function detectLanguage(char) {
			if (/[\u4e00-\u9fa5]/.test(char)) {
				return 'chinese'
			} else if (/[\u3040-\u30FF]/.test(char)) {
				return 'japanese'
			} else {
				return 'other'
			}
		}

		// Function to split long words into chunks
		function splitLongWords(text, chunkSize, longWordThreshold) {
			const regex = new RegExp(`\\S{${longWordThreshold},}`, 'g')
			return text.replace(regex, (longWord) => {
				return longWord.match(new RegExp(`.{1,${chunkSize}}`, 'g')).join(' ')
			})
		}

		// Function to count words based on language
		function countWords(text) {
			let totalWordCount = 0
			let chineseCharacterCount = 0
			let japaneseCharacterCount = 0
			let otherText = ''

			for (const char of text) {
				const lang = detectLanguage(char)
				if (lang === 'chinese') {
					chineseCharacterCount++
				} else if (lang === 'japanese') {
					japaneseCharacterCount++
				} else {
					otherText += char
				}
			}

			// Calculate words for Chinese and Japanese characters
			const chineseWordCount = chineseCharacterCount / averageCharactersPerWord['chinese']
			const japaneseWordCount = japaneseCharacterCount / averageCharactersPerWord['japanese']

			// Split long words in the other text
			otherText = splitLongWords(otherText, longWordChunkSize, longWordThreshold)

			// Split the other text by spaces to count words
			const otherWordCount = otherText.split(/\s+/).filter((word) => word.length > 0).length

			// Sum up all the word counts
			totalWordCount = chineseWordCount + japaneseWordCount + otherWordCount

			return totalWordCount
		}

		// Calculate reading time
		let readingTime
		if (charactersPerMinute) {
			let characterCount = articleText.replace(/\s+/g, '').length
			readingTime = Math.ceil(characterCount / parseInt(charactersPerMinute))
		} else {
			let totalWordCount = countWords(articleText)
			readingTime = Math.ceil(totalWordCount / parseInt(wordsPerMinute))
		}

		element.textContent = prefix + readingTime + suffix
	}
})

function bricksPostReadingTime() {
	bricksPostReadingTimeFn.run()
}

/**
 * Element: Countdown
 */
const bricksCountdownFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-countdown',
	eachElement: (element) => {
		// Countdown logic
		countdown = (element, settings, init) => {
			// STEP: Get timezone from settings
			let timezoneSign = settings.timezone[3] === '+' ? 1 : -1
			let timezoneHours = parseInt(settings.timezone.substring(4, 6))
			let timezoneMinutes = parseInt(settings.timezone.substring(7, 9))

			// Convert hours and minutes to minutes
			let countdownCreatorTimezone = timezoneSign * (timezoneHours * 60 + timezoneMinutes)

			// Convert timezone to milliseconds
			let countdownCreatorTimezoneMs = countdownCreatorTimezone * 60000

			// Get timezone offset of visitor in minutes
			let viewerOffsetMinutes = new Date().getTimezoneOffset()

			// Convert to millisecond and flip the sign here because getTimezoneOffset() returns the offset with an opposite sign
			let viewerOffsetMs = -viewerOffsetMinutes * 60000

			let date = settings.date.replace(' ', 'T') // Replace needed for iOS Safari (NaN)

			// Get time of the target date in milliseconds
			let targetDate = new Date(date).getTime()

			// STEP: Adjust the target date for the visitors' timezone offset and the timezone setting offset
			let targetDateAdjusted = targetDate + viewerOffsetMs - countdownCreatorTimezoneMs

			// Get current date and time in UTC milliseconds
			let now = new Date().getTime()

			// Calculate the difference in milliseconds
			let diff = targetDateAdjusted - now

			// Countdown date reached
			if (diff <= 0) {
				// Stop countdown
				clearInterval(element.dataset.bricksCountdownId)

				if (settings.action === 'hide') {
					element.innerHTML = ''
					return
				} else if (settings.action === 'text') {
					element.innerHTML = settings.actionText
					return
				}
			}

			// Add HTML nodes for each field (spans: .prefix, .format, .suffix)
			if (init) {
				// Builder: Remove HTML from previous instance
				element.innerHTML = ''

				settings.fields.forEach((field) => {
					if (!field.format) {
						return
					}

					let fieldNode = document.createElement('div')
					fieldNode.classList.add('field')

					if (field.prefix) {
						let prefixNode = document.createElement('span')
						prefixNode.classList.add('prefix')
						prefixNode.innerHTML = field.prefix
						fieldNode.appendChild(prefixNode)
					}

					let formatNode = document.createElement('span')
					formatNode.classList.add('format')
					fieldNode.appendChild(formatNode)

					if (field.suffix) {
						let suffixNode = document.createElement('span')
						suffixNode.classList.add('suffix')
						suffixNode.innerHTML = field.suffix
						fieldNode.appendChild(suffixNode)
					}

					element.appendChild(fieldNode)
				})
			}

			let fieldNodes = bricksQuerySelectorAll(element, '.field')

			let days = Math.floor(diff / (1000 * 60 * 60 * 24))
			let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
			let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
			let seconds = Math.floor((diff % (1000 * 60)) / 1000)

			settings.fields.forEach((field, index) => {
				if (!field.format || !fieldNodes[index]) {
					return
				}

				let format = field.format.toLowerCase()

				// Add leading zero if format is uppercase & one digit (e.g. %D and value less than 10)

				// DAYS
				if (format.includes('%d')) {
					if (field.format.includes('%D')) {
						days <= 9 ? (days = `0${days}`) : days
					}

					fieldNodes[index].querySelector('.format').innerHTML = format.replace(
						'%d',
						diff <= 0 ? 0 : days
					)
				}

				// HOURS
				else if (format.includes('%h')) {
					if (field.format.includes('%H')) {
						hours <= 9 ? (hours = `0${hours}`) : hours
					}

					fieldNodes[index].querySelector('.format').innerHTML = format.replace(
						'%h',
						diff <= 0 ? 0 : hours
					)
				}

				// MINUTES
				else if (format.includes('%m')) {
					if (field.format.includes('%M')) {
						minutes <= 9 ? (minutes = `0${minutes}`) : minutes
					}

					fieldNodes[index].querySelector('.format').innerHTML = format.replace(
						'%m',
						diff <= 0 ? 0 : minutes
					)
				}

				// SECONDS
				else if (format.includes('%s')) {
					if (field.format.includes('%S')) {
						seconds <= 9 ? (seconds = `0${seconds}`) : seconds
					}

					fieldNodes[index].querySelector('.format').innerHTML = format.replace(
						'%s',
						diff <= 0 ? 0 : seconds
					)
				}
			})
		}

		let settings = element.dataset.bricksCountdownOptions

		try {
			settings = JSON.parse(settings)
		} catch (e) {
			return false
		}

		if (settings.hasOwnProperty('date') && settings.hasOwnProperty('fields')) {
			// Get existing countdownId
			let countdownId = element.dataset.bricksCountdownId

			// Destroy existing instance by clearing the interval
			if (countdownId) {
				clearInterval(countdownId)
			}

			// Init countdown
			countdown(element, settings, true)

			// Call countdown every second (= 1000ms)
			countdownId = setInterval(countdown, 1000, element, settings, false)

			element.dataset.bricksCountdownId = countdownId
		}
	}
})

function bricksCountdown() {
	bricksCountdownFn.run()
}

/**
 * Element: Counter
 * With custom run function, because we need to forceReinit only for counter inside popup
 */
const bricksCounterFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-counter',
	subscribeEvents: [
		'bricks/popup/open',
		'bricks/ajax/pagination/completed',
		'bricks/ajax/load_page/completed',
		'bricks/ajax/query_result/displayed'
	],
	forceReinit: (element, index) => {
		// Force reinit if counter is inside popup
		return element.closest('.brx-popup')
	},
	eachElement: (element) => {
		let settings = element.dataset.bricksCounterOptions

		try {
			settings = JSON.parse(settings)
		} catch (e) {
			return false
		}

		let countNode = element.querySelector('.count')
		let countFrom = settings.hasOwnProperty('countFrom') ? parseInt(settings.countFrom) : 0
		let countTo = settings.hasOwnProperty('countTo') ? parseInt(settings.countTo) : 100
		let durationInMs = settings.hasOwnProperty('duration') ? parseInt(settings.duration) : 1000
		let separator = settings?.separator

		// Min. duration: 500ms
		if (durationInMs < 500) {
			durationInMs = 500
		}

		let diff = countTo - countFrom
		let timeout = durationInMs / diff
		let incrementBy = 1

		// Min. timeout: 16ms ()= typical screen refresh rate (60fps))
		let minTimeout = 16
		if (timeout < minTimeout) {
			incrementBy = Math.ceil(minTimeout / timeout)
			timeout = minTimeout
		}

		// Vanilla JS countUp function
		let countUp = () => {
			// Get current count (locale string back to number)
			let count = countNode.innerText.replace(/\D/g, '')
			count = isNaN(count) ? countFrom : parseInt(count)

			// Calculate new count: Make sure we don't run over max. count
			let newCount = count + incrementBy < countTo ? count + incrementBy : countTo

			// countTo reached yet: Stop interval
			if (count >= countTo) {
				clearInterval(countNode.dataset.counterId)
				delete countNode.dataset.counterId
				return
			}

			if (settings.thousands && separator) {
				// Force locale to en-US to ensure separator is comma so we can replace it with user defined separator (@since 1.9.3)
				countNode.innerText = newCount.toLocaleString('en-US').replaceAll(',', separator)
			} else if (settings.thousands) {
				// For previous version, we don't touch the toLocaleString() function as users locale can be different
				countNode.innerText = newCount.toLocaleString()
			} else {
				countNode.innerText = newCount
			}
		}

		let callback = () => {
			// Reset count
			countNode.innerText = countFrom

			// Interval not yet running: Start interval
			if (countNode.dataset.counterId == undefined) {
				countNode.dataset.counterId = setInterval(countUp, timeout)
			}
		}

		// Run countUp() when popup is open (has no .hide class)
		let popup = countNode.closest('.brx-popup')
		if (popup) {
			if (!popup.classList.contains('hide')) {
				callback()
			}
		}

		// Run countUp() when element enters viewport
		else {
			new BricksIntersect({
				element: element,
				callback: callback
			})
		}
	},
	listenerHandler: (event) => {
		if (event?.type) {
			switch (event.type) {
				case 'bricks/popup/open':
					// Change parentNode to the opened popup
					let settings = {
						parentNode: event.details?.popupElement ? event.details.popupElement : document
					}
					bricksCounterFn.run(settings)
					break
				default:
					bricksCounterFn.run()
					break
			}
		}
	}
})

function bricksCounter() {
	bricksCounterFn.run()
}

/**
 * Element: Post Table of Contents (tocbot)
 *
 * @since 1.8.5
 */
const bricksTableOfContentsFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-post-toc',
	forceReinit: true, // Force reinit so eachElement will be called again on Bricks AJAX events, no double init as tocbot is singleton (#86c463v6t; @since 2.0)
	eachElement: (toc) => {
		// Check if toc is visible
		const isVisible =
			toc.offsetParent !== null &&
			!!(toc.offsetWidth || toc.offsetHeight || toc.getClientRects().length)

		// If visible, initialize immediately
		if (isVisible) {
			initializeTocbot(toc)
			return
		}

		// If not visible, create observer to initialize when it becomes visible
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						// Element is visible, initialize tocbot
						initializeTocbot(toc)
						// Disconnect observer since we only need to initialize once
						observer.disconnect()
					}
				})
			},
			{
				threshold: 0.1 // Trigger when at least 10% is visible
			}
		)

		// Start observing the ToC element
		observer.observe(toc)

		function initializeTocbot(toc) {
			// Always destroy tocbot first (#86c463v6t)
			if (window.tocbot) {
				window.tocbot.destroy()
			}

			const scriptId = toc.dataset.scriptId

			// STEP: Create IDs for each heading in the content (if heading has no 'id')
			let contentSelector = toc.dataset.contentSelector || '.brxe-post-content'
			let content = document.querySelector(contentSelector)

			// Fallback to #brx-content
			if (!content) {
				content = document.querySelector('#brx-content')

				if (content) {
					contentSelector = '#brx-content'
				}
			}

			if (!content) {
				return
			}

			let headingSelectors = toc.dataset.headingSelectors || 'h2, h3'
			let headings = content.querySelectorAll(headingSelectors)
			let headingMap = {}

			// STEP: Generate unique element 'id' for each heading
			headings.forEach((heading) => {
				// Heading already has an 'id': Add ID to map & continue with next heading
				if (heading.id && !headingMap[heading.id]) {
					headingMap[heading.id] = 1
					return
				}

				let generatedId = generateIDFromTextContent(heading.textContent, scriptId)

				// Generated ID already exists: Append index (e.g.: #heading-1, #heading-2, etc.)
				if (headingMap[generatedId]) {
					headingMap[generatedId]++
					generatedId = `${generatedId}-${headingMap[generatedId]}`
				}

				// Add ID to map
				else {
					headingMap[generatedId] = 1
				}

				// Assign the generated ID to the heading and track it.
				heading.id = generatedId
			})

			function generateIDFromTextContent(text, scriptId) {
				let baseId = text
					.trim()
					.toLowerCase()
					.normalize('NFD') // Remove accents
					.replace(/[\u0300-\u036f]/g, '') // Remove accents
					.replace(/[!@#$%^&*()=:;,.„“"'`]/gi, '') // Remove special characters
					.replace(/\//gi, '-') // Replace slashes with dashes
					.split(' ')
					.join('-')

				// ID starts with a number: Prefix required (CSS.escape works too, but looks so ugly)
				if (/^\d/.test(baseId)) {
					return `${scriptId}-${baseId}`
				}

				return baseId
			}

			let headingsOffset = parseInt(toc.dataset.headingsOffset) || 0

			// Smooth scroll enabled via Bricks settings
			let scrollSmooth = toc.hasAttribute('data-smooth-scroll')

			// STEP: tocbot options (https://tscanlin.github.io/tocbot/#api)
			let options = {
				tocSelector: `.brxe-post-toc[data-script-id="${scriptId}"]`,
				contentSelector: contentSelector,
				headingSelector: headingSelectors,
				ignoreSelector: toc.dataset.ignoreSelector || '.toc-ignore',
				hasInnerContainers: false,
				linkClass: 'toc-link',
				extraLinkClasses: '',
				activeLinkClass: 'is-active-link',
				listClass: 'toc-list',
				extraListClasses: '',
				isCollapsedClass: 'is-collapsed',
				collapsibleClass: 'is-collapsible',
				listItemClass: 'toc-list-item',
				activeListItemClass: 'is-active-li',
				collapseDepth: toc.dataset.collapseInactive ? 0 : 6,
				scrollSmooth: headingsOffset,
				scrollSmoothDuration: scrollSmooth && headingsOffset ? 420 : 0,
				scrollSmoothOffset: headingsOffset ? -headingsOffset : 0,
				headingsOffset: headingsOffset,
				throttleTimeout: 0,
				positionFixedSelector: null,
				positionFixedClass: 'is-position-fixed',
				fixedSidebarOffset: 'auto',
				includeHtml: false,
				includeTitleTags: false,
				orderedList: false, // TODO: Add "Numbered" setting
				scrollContainer: null,
				skipRendering: false,
				headingLabelCallback: false,
				ignoreHiddenElements: false,
				headingObjectCallback: null,
				basePath: '',
				disableTocScrollSync: false,
				tocScrollOffset: 0
			}

			// Init tocbot
			window.tocbot.init(options)

			// NOTE: Not needed as tocbot is a singleton that only allows one instance (@since 1.11.1)
			// window.bricksData.activeToc = scriptId
		}
	}
})

function bricksTableOfContents() {
	bricksTableOfContentsFn.run()
}

/**
 * Element: Form
 *
 * Init recaptcha explicit on Google reCAPTCHA callback.
 */
const bricksFormFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-form',
	eachElement: (form) => {
		let elementId = form.getAttribute('data-element-id')

		// Disable form validation on blur, input (@since 1.12)
		const validationDisabledOn = JSON.parse(form.getAttribute('data-validation-disabled-on')) || []

		// Validate required checkboxes
		let checkboxes = bricksQuerySelectorAll(form, 'input[type="checkbox"]')

		checkboxes.forEach((checkbox) => {
			if (checkbox.required) {
				checkbox.addEventListener('click', (event) => {
					let cbName = checkbox.getAttribute('name')
					let group = bricksQuerySelectorAll(form, `input[name="${cbName}"]`)

					let atLeastOneChecked = false
					group.forEach((item) => {
						if (item.checked === true) {
							atLeastOneChecked = true
						}
					})

					if (atLeastOneChecked) {
						group.forEach((item) => {
							item.required = false
						})
					} else {
						group.forEach((item) => {
							item.required = true
						})
					}
				})
			}
		})

		/**
		 * Listen to field blur/input events to validate form fields
		 *
		 * If field has data-error-message attribute, add event listener.
		 *
		 * @since 1.9.2
		 */
		const inputFields = form.querySelectorAll(
			'input:not([type="hidden"]):not([type="file"]), textarea'
		)

		inputFields.forEach((inputField) => {
			if (inputField.getAttribute('data-error-message') && bricksIsFrontend) {
				// Attach event listeners for initial validation and subsequent changes (@since 1.12)

				// Only check for errors, if the error message trigger doesn't include "input"
				if (!validationDisabledOn.includes('input')) {
					inputField.addEventListener(
						'input',

						// Debounce the input event for performance reasons (@since 1.12)
						window.bricksUtils.debounce(() => {
							validateInput(inputField)
						}, 300)
					)
				}

				// Only check for errors, if the error message trigger doesn't includes "blur"
				if (!validationDisabledOn.includes('blur')) {
					inputField.addEventListener(
						'blur',

						// Debounce the blur event for performance reasons (@since 1.12)
						window.bricksUtils.debounce(() => {
							validateInput(inputField)
						}, 300)
					)
				}
			}
		})

		/**
		 * Function to validate input fields
		 */
		function validateInput(inputField) {
			const value = inputField.value.trim()
			const errorMsg = inputField.getAttribute('data-error-message')

			// Find the closest parent form group and then find the error message div within it
			let formGroup = inputField.closest('.form-group')
			let showError = false

			// Required & empty
			if (inputField.hasAttribute('required') && !value) {
				showError = true
			}

			// Validate number input
			if (inputField.type === 'number') {
				const min = parseFloat(inputField.getAttribute('min'))
				const max = parseFloat(inputField.getAttribute('max'))
				const valueAsNumber = parseFloat(value)

				if ((min !== null && valueAsNumber < min) || (max !== null && valueAsNumber > max)) {
					showError = true
				}
			}

			// Validate email
			if (inputField.type === 'email') {
				showError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
			}

			// Validate URL
			if (inputField.type === 'url') {
				showError = !/^(https?:\/\/)?([\w.-]+)\.([a-z.]{2,6})([\/\w.-]*)*\/?$/.test(value)
			}

			// Not required & empty
			if (!inputField.hasAttribute('required') && value == '') {
				showError = false
			}

			// Insert error message div.form-group-error-message inside .form-group
			let errorDiv = formGroup.querySelector('.form-group-error-message')

			if (!errorDiv) {
				errorDiv = document.createElement('div')
				errorDiv.classList.add('form-group-error-message')
				formGroup.appendChild(errorDiv)
			}

			if (showError) {
				errorDiv.innerText = errorMsg
				errorDiv.classList.add('show')
			} else {
				errorDiv.innerText = '' // Clear error message when input is valid
				errorDiv.classList.remove('show') // Hide error message when input is valid
			}

			return !showError
		}

		// STEP: Handle password toggle buttons (@since 1.12)
		const passwordToggles = form.querySelectorAll('.password-toggle')

		passwordToggles.forEach((toggle) => {
			const input = toggle.previousElementSibling

			// Skip if no valid input found
			if (!input || !input.type.match(/password|text/)) {
				return
			}

			toggle.addEventListener('click', () => {
				const isPassword = input.type === 'password'
				input.type = isPassword ? 'text' : 'password'

				// Update aria-label based on next action available
				toggle.setAttribute(
					'aria-label',
					isPassword ? window.bricksData.i18n.hidePassword : window.bricksData.i18n.showPassword
				)

				// Toggle show/hide password icon
				toggle.querySelector('.show-password').classList.toggle('hide')
				toggle.querySelector('.hide-password').classList.toggle('hide')
			})
		})

		// Init datepicker
		let flatpickrElements = bricksQuerySelectorAll(form, '.flatpickr')

		flatpickrElements.forEach((flatpickrElement) => {
			let flatpickrOptions = flatpickrElement.dataset.bricksDatepickerOptions

			if (flatpickrOptions) {
				flatpickrOptions = JSON.parse(flatpickrOptions)

				// Disable native mobile date input as it looks different from all other fields
				// @since 1.7 (https://flatpickr.js.org/mobile-support/)
				flatpickrOptions.disableMobile = true

				flatpickrOptions.onReady = (a, b, fp) => {
					if (fp.altInput) {
						let ariaLabel = fp.altInput.previousElementSibling
							? fp.altInput.previousElementSibling.getAttribute('aria-label')
							: 'Date'
						fp.altInput.setAttribute('aria-label', ariaLabel || 'Date')
					}
				}

				flatpickr(flatpickrElement, flatpickrOptions)
			}
		})

		// Init file input, to validate files on user selection
		let files = {}
		let fileInputInstances = bricksQuerySelectorAll(form, 'input[type=file]')

		fileInputInstances.forEach((input) => {
			let inputRef = input.getAttribute('data-files-ref')
			let maxSize = input.getAttribute('data-maxsize') || false
			let maxLength = input.getAttribute('data-limit') || false

			maxSize = maxSize ? parseInt(maxSize) * 1024 * 1024 : false

			input.addEventListener('change', (e) => {
				let fileList = e.target.files
				let fileListLength = fileList.length
				let inputName = input.getAttribute('name')

				if (!fileListLength) {
					return
				}

				let fileResultEl = form.querySelector(`.file-result[data-files-ref="${inputRef}"]`)

				for (let i = 0; i < fileListLength; i++) {
					let file = fileList[i]
					let error = false

					// Populate upload HTML
					let resultEl = fileResultEl.cloneNode(true)

					// Erorro: Max. number of files exceeded
					if (
						maxLength &&
						files.hasOwnProperty(inputName) &&
						files[inputName].length >= maxLength
					) {
						error = 'limit'
					}

					// Error: File exceeds size limit
					if (maxSize && file.size > maxSize) {
						error = 'size'
					}

					resultEl.classList.add('show')

					if (error) {
						resultEl.classList.add('danger')

						// Remove text and button elements
						resultEl.querySelector('.text').remove()
						resultEl.querySelector('.remove').remove()

						const closeIcon = resultEl.querySelector('svg')

						// Insert error message as first child
						const errorMessage = resultEl
							.getAttribute(`data-error-${error}`)
							.replace('%s', file.name)

						resultEl.insertAdjacentHTML('afterbegin', errorMessage)

						// Add onClick event to close the error message
						closeIcon.addEventListener('click', () => {
							resultEl.remove()
						})
					}

					// Add file
					else {
						if (!files.hasOwnProperty(inputName)) {
							files[inputName] = []
						}

						files[inputName].push(file)

						let resultText = resultEl.querySelector('.text')
						let resultRemove = resultEl.querySelector('.remove')

						// Remove svg icon
						resultEl.querySelector('svg').remove()

						resultText.innerHTML = file.name
						resultRemove.setAttribute('data-name', file.name)
						resultRemove.setAttribute('data-field', inputName)

						// Remove file listener
						resultRemove.addEventListener('click', (e) => {
							let fileName = e.target.getAttribute('data-name')
							let fieldName = e.target.getAttribute('data-field')
							let fieldFiles = files[fieldName]

							for (let k = 0; k < fieldFiles.length; k++) {
								if (fieldFiles[k].name === fileName) {
									files[inputName].splice(k, 1)
									break
								}
							}

							resultEl.remove()
						})
					}

					// Add result
					fileResultEl.parentNode.insertBefore(resultEl, fileResultEl.nextSibling)
				}
			})
		})

		// Form submit
		form.addEventListener('submit', (event) => {
			event.preventDefault()

			if (!bricksIsFrontend) {
				return
			}

			/**
			 * STEP: Validate all input fields before submission
			 *
			 * @since 1.11
			 */
			let isValid = true

			inputFields.forEach((inputField) => {
				if (inputField.getAttribute('data-error-message') && bricksIsFrontend) {
					// We have to skip check for "validationNeeded", otherwise it will return true, if the field was already validated
					isValid = isValid && validateInput(inputField)
				}
			})

			// Abort submission if form is not valid
			if (!isValid) {
				return
			}

			// Get hCaptcha widget ID (necessary when using multiple forms on one page)
			let hcaptchaIframe = form.querySelector('[data-hcaptcha-widget-id]')
			let widgetId = hcaptchaIframe ? hcaptchaIframe.getAttribute('data-hcaptcha-widget-id') : ''

			/**
			 * STEP Invisible hCaptcha
			 *
			 * Trigger hcaptcha.execute() programmatically as 'data-callback' function can't contain any arguments.
			 *
			 * https://docs.hcaptcha.com/configuration/#hcaptchaexecutewidgetid
			 *
			 * @since 1.9.2
			 */
			if (
				typeof window?.hcaptcha?.execute === 'function' &&
				document.querySelector('.h-captcha[data-size="invisible"]')
			) {
				hcaptcha
					.execute(widgetId, { async: true })
					.then(() => {
						// Success: Submit form
						bricksSubmitForm(elementId, form, files, null)
					})
					.catch((err) => {
						console.warn(err)
					})

				return
			}

			// STEP: reCAPTCHA (Google)
			let recaptchaElement = document.getElementById(`recaptcha-${elementId}`)
			let recaptchaErrorEl = form.querySelector('.recaptcha-error')

			if (!recaptchaElement) {
				bricksSubmitForm(elementId, form, files, null)

				return
			}

			let recaptchaSiteKey = recaptchaElement.getAttribute('data-key')

			if (!recaptchaSiteKey) {
				recaptchaErrorEl.classList.add('show')

				return
			}

			try {
				grecaptcha.ready(() => {
					try {
						grecaptcha
							.execute(recaptchaSiteKey, { action: 'bricks_form_submit' })
							.then((token) => {
								recaptchaErrorEl.classList.remove('show')

								bricksSubmitForm(elementId, form, files, token)
							})
							.catch((error) => {
								recaptchaErrorEl.classList.add('show')
								form.querySelector('.alert').innerText = `Google reCaptcha ${error}`
							})
					} catch (error) {
						recaptchaErrorEl.classList.add('show')
						form.querySelector('.alert').innerText = `Google reCaptcha ${error}`
					}
				})
			} catch (error) {
				recaptchaErrorEl.classList.add('show')
				form.querySelector('.alert').innerText = `Google reCaptcha ${error}`
			}
		})
	}
})

function bricksForm() {
	bricksFormFn.run()
}

function bricksSubmitForm(elementId, form, files, recaptchaToken, nonceRefreshed) {
	// Is WordPress password form: Do a regular form submission (@since 1.11.1)
	if (form.action && form.action.includes('action=postpass')) {
		form.submit()
		return
	}

	let submitButton = form.querySelector('button[type=submit]')
	submitButton.classList.add('sending')

	// Form inside loop: Get the post ID from the form (@since 1.11.1)
	const loopId = form.dataset.loopObjectId ? form.dataset.loopObjectId : window.bricksData.postId

	let formData = new FormData(form)
	formData.append('action', 'bricks_form_submit')
	formData.append('loopId', loopId) // To render dynamic data (@since 1.11.1)
	formData.append('postId', window.bricksData.postId)
	formData.append('formId', elementId)
	formData.append('recaptchaToken', recaptchaToken || '')
	formData.append('nonce', window.bricksData.formNonce)
	formData.append('referrer', location.toString())

	// Get and parse notice data (@since 1.11.1)
	const noticeData = JSON.parse(form.getAttribute('data-notice'))

	// Submit current URL params (@since 1.11)
	let params = {}
	window.location.search
		.substring(1)
		.split('&')
		.forEach((param) => {
			let pair = param.split('=')
			params[pair[0]] = decodeURIComponent(pair[1])
		})

	formData.append('urlParams', JSON.stringify(params))

	// Global element ID
	let globalId = form.getAttribute('data-global-id')
	if (globalId) {
		formData.append('globalId', globalId)
	}

	// Append files
	for (let inputName in files) {
		files[inputName].forEach((file) => {
			formData.append(`${inputName}[]`, file, file.name)
		})
	}

	// Form submit event (@since 1.9.2)
	document.dispatchEvent(new CustomEvent('bricks/form/submit', { detail: { elementId, formData } }))

	let url = window.bricksData.ajaxUrl
	let xhr = new XMLHttpRequest()

	xhr.open('POST', url, true)

	// Successful response
	xhr.onreadystatechange = function () {
		let getResponse = (data) => {
			try {
				return JSON.parse(data)
			} catch (e) {
				return null
			}
		}

		let res = getResponse(xhr.response)

		if (window.bricksData.debug) {
			console.warn('bricks_form_submit', xhr, res)
		}

		// Return: No response or response not yet DONE (@since 1.9.6)
		if (!res || xhr?.readyState != 4) {
			return
		}

		/**
		 * Form success/error event
		 *
		 * error: res.success = false or res.data.type = 'error'
		 * success: res.success = true and res.data.type = 'success'
		 *
		 * res.data.type = 'redirect' nothing happens
		 *
		 * @since 1.9.2
		 */

		let formEventName

		// Check for invalid nonce (@since 1.9.6)
		if (res?.data?.code === 'invalid_nonce') {
			// Refresh form nonce and resubmit form (if refresh has not yet been attempted)
			if (!nonceRefreshed) {
				bricksRegenerateNonceAndResubmit(elementId, form, files, recaptchaToken)
				return
			}
		} else {
			if (res.success && res.data?.type === 'success') {
				formEventName = 'bricks/form/success'
			} else if (!res.success || res.data?.type === 'error') {
				formEventName = 'bricks/form/error'
			}
		}

		if (formEventName) {
			document.dispatchEvent(
				new CustomEvent(formEventName, { detail: { elementId, formData, res } })
			)
		}

		// Google Tag Manager: Newsletter signup (action: 'mailchimp' or 'sendgrid')
		if (res.success && (res.data?.action === 'mailchimp' || res.data?.action === 'sendgrid')) {
			window.dataLayer = window.dataLayer || []
			window.dataLayer.push({ event: 'bricksNewsletterSignup' })
		}

		// Redirect after successful form submit
		if (res.success && res.data?.redirectTo) {
			setTimeout(
				() => {
					window.location.href = res.data.redirectTo
				},
				parseInt(res.data?.redirectTimeout) || 0
			)
		} else if (res.success && res.data?.refreshPage) {
			// Refresh page after successful form submit (@since 1.11.1)
			setTimeout(
				() => {
					window.location.reload()
				},
				1000 // Wait for one second before refreshing to allow user to see the success message
			)
		}

		// Generate form submit message HTML
		if (form.querySelector('.message')) {
			form.querySelector('.message').remove()
		}

		// Create message element
		let messageEl = document.createElement('div')
		messageEl.classList.add('message')

		let messageText = document.createElement('div')
		messageText.classList.add('text')

		// Show form response message
		if (res.data?.message) {
			if (res.data.message?.errors) {
				// User login/registration errors
				let errors = res.data.message.errors
				let errorKeys = Object.keys(errors)

				errorKeys.forEach((errorKey) => {
					messageText.innerHTML += errors[errorKey][0] + '<br>'
				})
			} else {
				messageText.innerHTML = res.data.message
			}
		}

		messageEl.appendChild(messageText)

		if (res.data?.info) {
			let submitInfoInner = document.createElement('div')

			let submitInfoText = document.createElement('div')
			submitInfoText.innerHTML = res.data.info.join('<br>')

			messageEl.appendChild(submitInfoInner)
			submitInfoInner.appendChild(submitInfoText)
		} else {
			messageEl.classList.add(res.data.type)
		}

		// @since 1.11.1: Add notice controls (auto-close, close with button)
		if (noticeData) {
			const closeNotice = () => {
				// To add fade out effect
				messageEl.classList.add('closing')

				// Remove message element after animation
				setTimeout(() => {
					messageEl?.remove()
				}, 200) // Animation duration is defined in CSS
			}

			// Add close button
			if (noticeData.closeButton) {
				let closeButton = document.createElement('button')
				closeButton.classList.add('close')
				closeButton.innerHTML =
					'<svg version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke-linecap="round" stroke-width="2" stroke="currentcolor" fill="none" stroke-linejoin="round"><path d="M0.5,0.5l23,23"></path><path d="M23.5,0.5l-23,23"></path></g><path fill="none" d="M0,0h24v24h-24Z"></path></svg>'

				messageEl.appendChild(closeButton)

				closeButton.addEventListener('click', (e) => {
					e.preventDefault()
					closeNotice()
				})
			}

			// Auto-close notice after .. ms
			const noticeCloseAfter = noticeData?.closeAfter
			if (noticeCloseAfter) {
				setTimeout(() => {
					closeNotice()
				}, parseInt(noticeCloseAfter))
			}
		}

		form.appendChild(messageEl)

		submitButton.classList.remove('sending')

		// Clear form data
		if (res.success) {
			form.reset()

			for (let inputName in files) {
				delete files[inputName]
			}

			let fileResults = bricksQuerySelectorAll(form, '.file-result.show')

			if (fileResults !== null) {
				fileResults.forEach((resultEl) => {
					resultEl.remove()
				})
			}

			/**
			 * Close WP login modal (in builder and wp-admin area)
			 *
			 * Go to top window and trigger click on button.wp-auth-check-close.
			 *
			 * @since 1.10.2
			 * @since 1.11.1 Unlock password protection form will not close the login modal
			 */
			if (window.top != window.self && !form.querySelector('input[name="brx_pp_temp_id"]')) {
				let closeLoginModelButton = window.top.document.querySelector('button.wp-auth-check-close')
				if (closeLoginModelButton) {
					closeLoginModelButton.click()
				}
			}
		} else {
			let turnstileElement = form.querySelector('.cf-turnstile')
			let turnstileIframe = turnstileElement ? turnstileElement.querySelector('iframe') : null
			let turnstileWidgetId = turnstileIframe ? turnstileIframe.id : null

			// Reset Turnstile widget if form submit failed (@since 1.9.5)
			if (turnstileWidgetId) {
				turnstile.reset(turnstileWidgetId)
			}

			// Remove file result errors
			let fileResultErrors = bricksQuerySelectorAll(form, '.file-result.show.danger')

			if (fileResultErrors !== null) {
				fileResultErrors.forEach((resultEl) => {
					resultEl.remove()
				})
			}
		}
	}

	xhr.send(formData)
}

/**
 * Regenerate nonce and resubmit form
 *
 * Needed for form submissions that require a valid/fresh nonce on cached pages.
 *
 * @since 1.9.6
 */
function bricksRegenerateNonceAndResubmit(elementId, form, files, recaptchaToken) {
	let xhrNonce = new XMLHttpRequest()
	xhrNonce.open('POST', window.bricksData.ajaxUrl + '?t=' + new Date().getTime(), true) // Add timestamp to avoid caching
	xhrNonce.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

	xhrNonce.onreadystatechange = function () {
		if (xhrNonce.readyState === XMLHttpRequest.DONE) {
			let newNonce = xhrNonce.responseText
			window.bricksData.formNonce = newNonce // Update the nonce in the global bricksData object
			bricksSubmitForm(elementId, form, files, recaptchaToken, true) // Resubmit with new nonce
		}
	}

	xhrNonce.send('action=bricks_regenerate_form_nonce')
}

/**
 * IsotopeJS (Image Gallery & Posts)
 */
const bricksIsotopeFn = new BricksFunction({
	parentNode: document,
	selector: '.bricks-layout-wrapper.isotope',
	forceReinit: true, // To update Isotope instance (@since 1.9.8)
	windowVariableCheck: ['Isotope'],
	eachElement: (el) => {
		let elementId = false
		let elementName = ''

		if (el.classList.contains('bricks-masonry')) {
			// masonry-layout element (@since 1.11.1)
			elementId = el.getAttribute('data-script-id')
			elementName = 'masonry-element'
		} else if (el.classList.contains('brxe-image-gallery')) {
			// image-gallery element
			elementId = el.getAttribute('data-script-id')
			elementName = 'image-gallery'
		} else {
			// posts element
			elementId = el.closest('.brxe-posts')?.getAttribute('data-script-id')
			elementName = 'posts'
		}

		if (!elementId || !elementName) {
			return
		}

		// Check if Isotope instance already exists (@since 1.9.8)
		if (bricksIsFrontend && window.bricksData.isotopeInstances[elementId]) {
			if (window.bricksData.isotopeInstances[elementId].element?.isConnected) {
				// The element is still in the DOM, Run update function
				bricksUtils.updateIsotopeInstance(elementId)
				return
			} else {
				// Maybe the element was removed from the DOM (Inside AJAX Popup) (@since 1.12)
				window.bricksData.isotopeInstances[elementId].instance.destroy()

				// Remove instance from global object
				delete window.bricksData.isotopeInstances[elementId]
			}
		} else if (window.bricksData.isotopeInstances[elementId]) {
			// In builder always destroy the instance and reinitialize it or it will be multiple instances (@since 2.0)
			window.bricksData.isotopeInstances[elementId].instance.destroy()

			// Remove instance from global object
			delete window.bricksData.isotopeInstances[elementId]
		}

		// isotopeInstance options
		let options = {}
		let layout = el.getAttribute('data-layout')

		if (elementName === 'masonry-element') {
			// masonry-layout element
			layout = 'masonry'
			let brxMasonryData = el.getAttribute('data-brx-masonry-json') || '{}'
			let brxMasonrySettings = {}
			try {
				brxMasonrySettings = JSON.parse(brxMasonryData)
			} catch (e) {
				console.error('Bricks: Invalid JSON data for Masonry element')
			}

			let transitionDuration = brxMasonrySettings?.transitionDuration || '0.4s'
			let transitionMode = brxMasonrySettings?.transitionMode || 'scale'

			options = {
				itemSelector: '.bricks-masonry > *:not(.bricks-isotope-sizer):not(.bricks-gutter-sizer)',
				percentPosition: true,
				masonry: {
					columnWidth: '.bricks-isotope-sizer',
					gutter: '.bricks-gutter-sizer',
					horizontalOrder: brxMasonrySettings?.horizontalOrder || false //@since 2.0
				},
				transitionDuration: transitionDuration
			}

			if (transitionDuration === '0s' || transitionDuration === '0') {
				// User might want to disable isotope animation and use CSS animations for the child elements
				options.hiddenStyle = {
					opacity: 1
				}

				options.visibleStyle = {
					opacity: 1
				}

				options.instantLayout = true
			} else {
				// Use Brick's transition mode
				switch (transitionMode) {
					case 'fade':
						options.hiddenStyle = {
							opacity: 0
						}
						options.visibleStyle = {
							opacity: 1
						}
						break

					case 'slideLeft':
						options.hiddenStyle = {
							opacity: 0,
							transform: 'translateX(-50%)'
						}
						options.visibleStyle = {
							opacity: 1,
							transform: 'translateX(0)'
						}
						break

					case 'slideRight':
						options.hiddenStyle = {
							opacity: 0,
							transform: 'translateX(50%)'
						}
						options.visibleStyle = {
							opacity: 1,
							transform: 'translateX(0)'
						}
						break

					case 'skew':
						options.hiddenStyle = {
							opacity: 0,
							transform: 'skew(20deg)'
						}
						options.visibleStyle = {
							opacity: 1,
							transform: 'skew(0)'
						}

					default:
						// 'scale' is isotopes default
						break
				}
			}
		} else {
			// posts or image-gallery element
			options = {
				itemSelector: '.bricks-layout-item',
				percentPosition: true
			}

			if (layout === 'grid') {
				options.layoutMode = 'fitRows'
				options.fitRows = {
					gutter: '.bricks-gutter-sizer'
				}
			} else if (layout === 'masonry' || layout === 'metro') {
				options.masonry = {
					columnWidth: '.bricks-isotope-sizer',
					gutter: '.bricks-gutter-sizer'
				}
			}
		}

		let isotopeInstance = new Isotope(el, options)

		/**
		 * Add isotope-before-init class for isotope elements to avoid unstyled content on initial load. Remove the class after init Isotope.
		 *
		 * Cannot use layoutComplete as certain elements not triggered if instantLayout is enabled
		 *
		 * @since 1.12
		 */
		setTimeout(() => {
			el.classList.remove('isotope-before-init')
		}, 250)

		// Isotope filtering (https://isotope.metafizzy.co/filtering.html)
		// TODO Make it work on grid & list layout as well (those don't have .isotope class)
		let filters = el.parentNode.querySelector('.bricks-isotope-filters')

		if (filters) {
			filters.addEventListener('click', (e) => {
				let filterValue = e.target.getAttribute('data-filter')
				let activeFilter = filters.querySelector('li.active')

				if (!filterValue || !bricksIsFrontend) {
					return
				}

				if (activeFilter) {
					activeFilter.classList.remove('active')
				}

				e.target.classList.add('active')

				// Example: https://codepen.io/desandro/pen/BgcCD
				isotopeInstance.arrange({
					filter: filterValue
				})
			})
		}

		// Store isotopeInstance in window.bricksData.isotopeInstances
		window.bricksData.isotopeInstances[elementId] = {
			elementId: elementId,
			instance: isotopeInstance,
			layout: layout,
			filters: filters,
			options: options,
			element: el,
			elementName: elementName
		}

		/**
		 * Handle native browser loading="lazy" attribute
		 *
		 * Ensure layout updates after every 20% progress and once done.
		 *
		 * @since 1.9.9
		 */
		bricksUtils.updateIsotopeOnImageLoad(elementId)
	},
	listenerHandler: (event) => {
		// Need some delay to allow for new elements to be added to the DOM (e.g. after Query filters DOM added) (@since 1.9.8)
		setTimeout(() => {
			bricksIsotopeFn.run()
		}, 100)
	}
})

function bricksIsotope() {
	bricksIsotopeFn.run()
}

/**
 * Update Isotope instance on certain events
 *
 * Centralize usage of bricksUtils.updateIsotopeInstance in one function.
 *
 * Listening to: bricks/tabs/changed, bricks/accordion/open
 * Not listening to: bricks/ajax/end or bricks/ajax/query_result/displayed (might cause double execution)
 *
 * @since 1.9.8
 * @since 1.10: Listening to window onload to ensure isotopes are updated after all CSS are loaded
 */
function bricksIsotopeListeners() {
	// Tab change event: Pane with isotope will be visible after tab change
	document.addEventListener('bricks/tabs/changed', (event) => {
		const tabActivePane = event.detail?.activePane || false

		if (tabActivePane) {
			// Check if the pane contains an isotope instance
			const isotopeElements = tabActivePane.querySelectorAll(
				'.bricks-layout-wrapper.isotope[data-script-id]'
			)
			if (isotopeElements.length) {
				isotopeElements.forEach((el) => {
					const isotopeId = el.getAttribute('data-script-id')
					// setTimeout 0 for smoother transition
					setTimeout(() => {
						bricksUtils.updateIsotopeInstance(isotopeId)
					}, 0)
				})
			}
		}
	})

	// Accordion change event: Pane with isotope will be visible after accordion change
	document.addEventListener('bricks/accordion/open', (event) => {
		const openItem = event.detail?.openItem || false

		if (openItem) {
			// Check if the item contains an isotope instance
			const isotopeElements = openItem.querySelectorAll(
				'.bricks-layout-wrapper.isotope[data-script-id]'
			)
			if (isotopeElements.length) {
				isotopeElements.forEach((el) => {
					const isotopeId = el.getAttribute('data-script-id')
					// setTimeout 0 for smoother transition
					setTimeout(() => {
						bricksUtils.updateIsotopeInstance(isotopeId)
					}, 0)
				})
			}
		}
	})

	/**
	 * New nodes added to the DOM event
	 *
	 * Update Isotope instance immediately or the new nodes will be visible for a short time.
	 *
	 * @since 1.11.1
	 */
	document.addEventListener('bricks/ajax/nodes_added', (event) => {
		const queryId = event?.detail?.queryId
		if (!queryId) {
			return
		}

		// Get query Instance
		const queryInstance = window.bricksData.queryLoopInstances[queryId] || false

		if (!queryInstance) {
			return
		}

		// Check results container has bricks-masonry or isotope instance has been initialized
		const parentIsMasonry =
			queryInstance.resultsContainer?.classList?.contains('bricks-masonry') ||
			window.bricksData.isotopeInstances[queryId]

		if (parentIsMasonry) {
			if (window.bricksData.isotopeInstances[queryId]) {
				bricksUtils.updateIsotopeInstance(queryId)
			} else {
				bricksUtils.updateIsotopeInstance(
					queryInstance.resultsContainer?.getAttribute('data-script-id')
				)
			}
		}
	})

	/**
	 * When megamenu is repositioned, update isotope instance (#86c3wdmpd)
	 *
	 * @since 2.0
	 */
	document.addEventListener('bricks/megamenu/repositioned', (event) => {
		const submenu = event.detail?.submenu || false
		if (submenu) {
			// Check if the submenu contains an isotope instance
			const isotopeElements = submenu.querySelectorAll(
				'.bricks-layout-wrapper.isotope[data-script-id]'
			)

			if (isotopeElements.length) {
				isotopeElements.forEach((el) => {
					const isotopeId = el.getAttribute('data-script-id')
					// setTimeout 0 for smoother transition
					setTimeout(() => {
						bricksUtils.updateIsotopeInstance(isotopeId)
					}, 0)
				})
			}
		}
	})

	// Ensure each Isotope instance runs updateIsotopeInstance after all CSS are loaded (@since 1.10)
	window.addEventListener('load', () => {
		bricksIsotope()
	})
}

/**
 * Element: Pie Chart
 */
const bricksPieChartFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-pie-chart',
	windowVariableCheck: ['EasyPieChart'],
	eachElement: (element) => {
		new BricksIntersect({
			element: element,
			callback: (el) => {
				// HTMLCollection of canvas (grab first one)
				let canvas = el.getElementsByTagName('canvas')

				// Remove canvas first, before EasyPieChart init
				if (canvas.length) {
					canvas[0].remove()
				}

				/**
				 * Extract the value of a CSS variable from a given string
				 *
				 * If the string is a CSS variable (in the format 'var(--variable-name)'),
				 * retrieve the variable value from the computed styles of the element.
				 * Otherwise, it returns the original string.
				 *
				 * @since 1.9.4
				 */
				const extractCSSVar = (cssVarString) => {
					const cssVarPattern = /var\((--[^)]+)\)/
					const match = cssVarString.match(cssVarPattern)

					if (match) {
						// Extract the variable name from the match and get its value
						const varName = match[1]
						return getComputedStyle(el).getPropertyValue(varName).trim()
					}

					// Return the original string if it's not a CSS variable
					return cssVarString
				}

				const barColor = extractCSSVar(el.dataset.barColor)
				const trackColor = extractCSSVar(el.dataset.trackColor)

				new EasyPieChart(el, {
					size: el.dataset.size && el.dataset.size > 0 ? el.dataset.size : 160,
					lineWidth: el.dataset.lineWidth,
					barColor: barColor,
					trackColor: trackColor,
					lineCap: el.dataset.lineCap,
					scaleColor: el.dataset.scaleColor,
					scaleLength: el.dataset.scaleLength,
					rotate: 0
				})
			},
			threshold: 1
		})
	}
})

function bricksPieChart() {
	bricksPieChartFn.run()
}

/**
 * Element: Pricing Tables (Pricing toggle)
 */
const bricksPricingTablesFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-pricing-tables',
	eachElement: (element) => {
		let tabs = bricksQuerySelectorAll(element, '.tab')
		let pricingTables = bricksQuerySelectorAll(element, '.pricing-table')

		tabs.forEach((tab) => {
			if (tab.classList.contains('listening')) {
				return
			}

			tab.classList.add('listening')

			tab.addEventListener('click', () => {
				// Return if selected tab is .active
				if (tab.classList.contains('active')) {
					return
				}

				// Toggle pricing table .active
				pricingTables.forEach((pricingTable) => {
					pricingTable.classList.toggle('active')
				})

				// Toggle .active tab
				tabs.forEach((tab) => {
					tab.classList.remove('active')
				})

				tab.classList.add('active')
			})
		})
	}
})

function bricksPricingTables() {
	bricksPricingTablesFn.run()
}

/**
 * Element: Post Reading Progress Bar
 *
 * @since 1.8.5
 */
const bricksPostReadingProgressBarFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-post-reading-progress-bar',
	eachElement: (element) => {
		// Get content element
		let contentEl = element.dataset.contentSelector
			? document.querySelector(element.dataset.contentSelector)
			: false

		window.addEventListener('scroll', () => {
			// Scrolled from document top
			let scrolled = window.scrollY

			// Document height minus the visible part of the window
			let height = document.documentElement.scrollHeight - document.documentElement.clientHeight

			// STEP: Calculate scroll position of specific element
			if (contentEl) {
				let rect = contentEl.getBoundingClientRect()
				height = rect.height
				scrolled = rect.top > 0 ? 0 : -rect.top
			}

			// Calculate the percentage of the document or contentEl that has been scrolled from the top
			element.setAttribute('value', Math.ceil((scrolled / height) * 100))
		})
	}
})

function bricksPostReadingProgressBar() {
	bricksPostReadingProgressBarFn.run()
}

/**
 * Element: Progress Bar (animate fill-up bar)
 */
const bricksProgressBarFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-progress-bar .bar span',
	eachElement: (bar) => {
		new BricksIntersect({
			element: bar,
			callback: () => {
				if (bar.dataset.width) {
					setTimeout(() => {
						bar.style.width = bar.dataset.width
					}, 'slow')
				}
			},
			threshold: 1
		})
	}
})

function bricksProgressBar() {
	bricksProgressBarFn.run()
}

/**
 * SplideJS: For all nestable elements
 *
 * @since 1.5
 */
const bricksSplideFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-slider-nested.splide',
	windowVariableCheck: ['Splide'],
	forceReinit: (element, index) => {
		// Allow force reinit inside builder
		return !bricksIsFrontend
	},
	eachElement: (splideElement) => {
		// Add .splide__slide to individual slide (perfect for in/builder)
		let slides = bricksQuerySelectorAll(splideElement, [
			'.splide__list > .brxe-container',
			'.splide__list > .brxe-block',
			'.splide__list > .brxe-div'
		])

		slides.forEach((slide) => {
			slide.classList.add('splide__slide')
			slide.dataset.id = slide.id
		})

		let scriptId = splideElement.dataset.scriptId

		// Destroy existing splideJS instance
		if (window.bricksData.splideInstances.hasOwnProperty(scriptId)) {
			window.bricksData.splideInstances[scriptId].destroy()
		}

		// Init & mount splideJS
		let splideInstance = new Splide(splideElement)

		// https://splidejs.com/guides/apis/#go
		splideInstance.mount()

		let splideOptions = {}

		try {
			splideOptions = JSON.parse(splideElement.dataset.splide)

			// Add i18n configuration (@since 1.12.2)
			// See: https://splidejs.com/guides/i18n/#default-texts
			splideOptions.i18n = {
				prev: window.bricksData.i18n.prevSlide,
				next: window.bricksData.i18n.nextSlide,
				first: window.bricksData.i18n.firstSlide,
				last: window.bricksData.i18n.lastSlide,
				slideX: window.bricksData.i18n.slideX,
				pageX: window.bricksData.i18n.slideX, // Reuse slideX for pageX
				play: window.bricksData.i18n.play,
				pause: window.bricksData.i18n.pause,
				carousel: window.bricksData.i18n.splide.carousel,
				select: window.bricksData.i18n.splide.select,
				slide: window.bricksData.i18n.splide.slide,
				slideLabel: window.bricksData.i18n.splide.slideLabel
			}
		} catch (e) {
			console.warn('bricksSplide: Error parsing JSON of data-script-args', scriptId)
		}

		// Set auto height
		if (splideOptions?.autoHeight) {
			let updateHeight = () => {
				try {
					// Ensure splideInstance and Components are defined
					let slidesComponent = splideInstance?.Components?.Slides
					if (!slidesComponent) {
						console.error('Slides component is undefined:', scriptId)
						return
					}

					let slideObject = slidesComponent.getAt(splideInstance.index)

					// Ensure slideObject and slide are defined
					let slide = slideObject?.slide
					if (!slide) {
						console.error('Slide is undefined:', scriptId)
						return
					}

					// Ensure slide.parentElement is defined before setting style
					let parentElement = slide.parentElement
					if (!parentElement) {
						console.error('Parent element is undefined:', scriptId)
						return
					}

					// Get height of largest visible slide (in case "Items to show" > 1)
					let autoHeight = 0
					slides.forEach((slide) => {
						if (slide.classList.contains('is-visible') && slide.offsetHeight > autoHeight) {
							autoHeight = slide.offsetHeight
						}
					})

					if (!autoHeight) {
						autoHeight = slide.offsetHeight
					}

					parentElement.style.height = `${autoHeight}px`
				} catch (error) {
					// Log any other unexpected errors
					console.error('An error occurred while updating the height:', error, scriptId)
				}
			}

			// Call updateHeight if splideInstance is defined
			if (splideInstance) {
				updateHeight()

				// Attach event listeners if splideInstance.on is a function
				if (typeof splideInstance.on === 'function') {
					splideInstance.on('move resize', updateHeight)
					splideInstance.on('moved', updateHeight) // Needed when "Items to show" > 1 to get visible slides
				} else {
					console.error('splideInstance.on is not a function')
				}
			} else {
				console.error('splideInstance is undefined')
			}
		}

		// Store splideJS instance in bricksData to destroy and re-init
		window.bricksData.splideInstances[scriptId] = splideInstance

		// NOTE: To ensure Bricks element ID is used (important also for builder), and not the randomly by splide generated ID (see: slide.js:mount())
		// Improvement: Tweak CSS selector for 'bricksSplide' elements to use #parent.id > .{slide-class}
		slides.forEach((slide, index) => {
			if (slide.dataset.id) {
				slide.id = slide.dataset.id

				// Set 'aria-controls' value to slide.id
				let pagination = splideElement.querySelector('.splide__pagination')

				if (pagination) {
					let paginationButton = pagination.querySelector(
						`li:nth-child(${index + 1}) .splide__pagination__page`
					)

					if (paginationButton) {
						paginationButton.setAttribute('aria-controls', slide.id)
					}
				}
			}

			// Get & set background-image added via lazy load through 'data-style' attribute inside query loop
			if (!slide.classList.contains('bricks-lazy-hidden')) {
				let style = slide.getAttribute('style') || ''

				if (slide.dataset.style) {
					style += slide.dataset.style
					slide.setAttribute('style', style)
				}
			}
		})

		// Listen to bricks/tabs/changed event to update splideJS instance (@since 1.11.1)
		if (splideElement.closest('.tab-pane')) {
			document.addEventListener('bricks/tabs/changed', (event) => {
				splideInstance.refresh()
			})
		}
	}
})

function bricksSplide() {
	bricksSplideFn.run()
}

/**
 * SwiperJS touch slider: Carousel, Slider, Testimonials
 */
const bricksSwiperFn = new BricksFunction({
	parentNode: document,
	selector: '.bricks-swiper-container',
	windowVariableCheck: ['Swiper'],
	forceReinit: (element, index) => {
		// Allow Force reinit inside Builder (@since 1.8.2)
		return !bricksIsFrontend
	},
	eachElement: (swiperElement) => {
		let scriptArgs

		try {
			scriptArgs = JSON.parse(swiperElement.dataset.scriptArgs)
		} catch (e) {
			console.warn('bricksSwiper: Error parsing JSON of data-script-args', swiperElement)

			scriptArgs = {}
		}

		let element = swiperElement.classList.contains('[class*=brxe-]')
			? swiperElement
			: swiperElement.closest('[class*=brxe-]')

		if (!element) {
			return
		}

		// @since 1.5: Nestable elements: Add .swiper-slide to individual slide (perfect for in/builder)
		let slides = bricksQuerySelectorAll(swiperElement, [
			'.splide__list > .brxe-container',
			'.splide__list > .brxe-block',
			'.splide__list > .brxe-div'
		])

		slides.forEach((slide) => slide.classList.add('swiper-slide'))

		let scriptId = element.dataset.scriptId

		let swiperInstance = window.bricksData.swiperInstances.hasOwnProperty(scriptId)
			? window.bricksData.swiperInstances[scriptId]
			: undefined

		if (swiperInstance) {
			swiperInstance.destroy()
		}

		scriptArgs.observer = false // Not working and not necessary (= set to false)
		scriptArgs.observeParents = true
		scriptArgs.resizeObserver = true

		// Defaults
		scriptArgs.slidesToShow = scriptArgs.hasOwnProperty('slidesToShow')
			? scriptArgs.slidesToShow
			: 1
		scriptArgs.slidesPerGroup = scriptArgs.hasOwnProperty('slidesPerGroup')
			? scriptArgs.slidesPerGroup
			: 1
		scriptArgs.speed = scriptArgs.hasOwnProperty('speed') ? parseInt(scriptArgs.speed) : 300
		scriptArgs.effect = scriptArgs.hasOwnProperty('effect') ? scriptArgs.effect : 'slide'
		scriptArgs.spaceBetween = scriptArgs.hasOwnProperty('spaceBetween')
			? scriptArgs.spaceBetween
			: 0
		scriptArgs.initialSlide = scriptArgs.hasOwnProperty('initialSlide')
			? scriptArgs.initialSlide
			: 0

		// Enable keyboard control when in viewport (only on frontend as it messes with contenteditable in builder)
		scriptArgs.keyboard = {
			enabled: bricksIsFrontend,
			onlyInViewport: true,
			pageUpDown: false
		}

		// Disabled & hide navigation buttons when there are not enough slides for sliding
		scriptArgs.watchOverflow = true

		// Effect: Flip
		if (scriptArgs.hasOwnProperty('effect') && scriptArgs.effect === 'flip') {
			scriptArgs.flipEffect = {
				slideShadows: false
			}
		}

		// Set crossFade to true to avoid seeing content behind or underneath slide (https://swiperjs.com/swiper-api#fade-effect)
		if (scriptArgs.hasOwnProperty('effect') && scriptArgs.effect === 'fade') {
			scriptArgs.fadeEffect = { crossFade: true }
		}

		// Arrows
		if (scriptArgs.navigation) {
			scriptArgs.navigation = {
				prevEl: element.querySelector('.bricks-swiper-button-prev'),
				nextEl: element.querySelector('.bricks-swiper-button-next')
			}
		}

		// Dots
		if (scriptArgs.pagination) {
			scriptArgs.pagination = {
				el: element.querySelector('.swiper-pagination'),
				type: 'bullets',
				clickable: true
			}

			if (scriptArgs.dynamicBullets == true) {
				delete scriptArgs.dynamicBullets

				scriptArgs.pagination.dynamicBullets = true
				// scriptArgs.pagination.dynamicMainBullets = 1
			}
		}

		// Add a11y configuration (@since 1.12.2)
		// See: https://swiperjs.com/swiper-api#accessibility-parameters
		scriptArgs.a11y = {
			prevSlideMessage: window.bricksData.i18n.prevSlide,
			nextSlideMessage: window.bricksData.i18n.nextSlide,
			firstSlideMessage: window.bricksData.i18n.firstSlide,
			lastSlideMessage: window.bricksData.i18n.lastSlide,
			paginationBulletMessage: window.bricksData.i18n.slideX,
			slideLabelMessage: window.bricksData.i18n.swiper.slideLabelMessage
		}

		swiperInstance = new Swiper(swiperElement, scriptArgs)

		// Store swiper instance in bricksData to destroy and re-init
		window.bricksData.swiperInstances[scriptId] = swiperInstance
	}
})

function bricksSwiper() {
	bricksSwiperFn.run()
}

/**
 * Element: Video (YouTube, Vimeo, File URL)
 */
const bricksVideoFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-video',
	eachElement: (element) => {
		// Remove overlay & icon
		if (bricksIsFrontend) {
			const onElementAction = () => {
				let videoOverlay = element.querySelector('.bricks-video-overlay')
				let videoOverlayIcon = element.querySelector('.bricks-video-overlay-icon')

				if (videoOverlay) {
					videoOverlay.remove()
				}

				if (videoOverlayIcon) {
					videoOverlayIcon.remove()
				}
			}
			element.addEventListener('click', onElementAction)

			// Remove overlay & icon on keydown (Enter/Space) (@since 1.11)
			element.addEventListener('keydown', (event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					onElementAction()
				}

				// Prevent default action (e.g. scrolling down on space), if there is no VIDEO elements inside the element
				if (!element.querySelector('video') && (event.key === 'Enter' || event.key === ' ')) {
					event.preventDefault()
				}
			})
		}

		// 'video' HTML (videoType: media, file, meta)
		let videoElement = element.querySelector('video')

		if (!videoElement) {
			return
		}

		// Init custom HTML5 <video> player (https://plyr.io)
		if (window.hasOwnProperty('Plyr')) {
			let elementId = element.dataset.scriptId
			let video = element.querySelector('.bricks-plyr')
			let player = window.bricksData?.videoInstances?.[elementId] || undefined

			if (player) {
				player.destroy()
			}

			if (video) {
				// 'autoplay' only runs if video is 'muted'
				player = new Plyr(video)
			}

			window.bricksData.videoInstances[elementId] = player
		}

		// Necessary for autoplaying in iOS (https://webkit.org/blog/6784/new-video-policies-for-ios/)
		if (videoElement.hasAttribute('autoplay')) {
			videoElement.setAttribute('playsinline', true)
		}
	}
})
function bricksVideo() {
	bricksVideoFn.run()
}

/**
 * Load Facebook SDK & render Facebook widgets
 *
 * https://developers.facebook.com/docs/javascript/reference/FB.init/v3.3
 *
 * @since 1.4 Use XMLHttpRequest instead of jquery.ajax()
 */

function bricksFacebookSDK() {
	// Return: Page has no Facebook Page element
	let facebookPageElement = document.querySelector('.brxe-facebook-page')

	if (!facebookPageElement) {
		return
	}

	let locale = window.bricksData.hasOwnProperty('locale') ? window.bricksData.locale : 'en_US'
	let facebookAppId = window.bricksData.hasOwnProperty('facebookAppId')
		? window.bricksData.facebookAppId
		: null
	let facebookSdkUrl = `https://connect.facebook.net/${locale}/sdk.js`

	let xhr = new XMLHttpRequest()
	xhr.open('GET', facebookSdkUrl)

	// Successful response: Create & add FB script to DOM and run function to generate Facebook Page HTML
	xhr.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			let fbScript = document.createElement('script')

			// Builder: Compatible with Cloudflare Rocket Loader (@since 2.0)
			if (!bricksIsFrontend && window.bricksData?.builderCloudflareRocketLoader) {
				fbScript.setAttribute('data-cfasync', 'false')
			}

			fbScript.type = 'text/javascript'
			fbScript.id = 'bricks-facebook-page-sdk'
			fbScript.appendChild(document.createTextNode(xhr.responseText))
			document.body.appendChild(fbScript)

			FB.init({
				appId: facebookAppId,
				version: 'v3.3',
				xfbml: true // render
			})
		}
	}

	xhr.send()
}

/**
 * Prettify <pre> and <code> HTML tags
 *
 * https://github.com/googlearchive/code-prettify
 */
const bricksPrettifyFn = new BricksFunction({
	parentNode: document,
	selector: '.prettyprint.prettyprinted',
	run: () => {
		if (!window.hasOwnProperty('PR')) {
			return
		}

		PR.prettyPrint()

		// Builder: Re-init prettify
		let prettyprinted = bricksQuerySelectorAll(document, '.prettyprint.prettyprinted')

		if (!bricksIsFrontend && prettyprinted.length) {
			prettyprinted.forEach((prettyprint) => {
				prettyprint.classList.remove('prettyprinted')
				PR.prettyPrint()
			})
		}
	}
})

function bricksPrettify() {
	bricksPrettifyFn.run()
}

/**
 * Improve a11y keyboard navigation by making sure after skipping to the content, the next tab hit continues down the content
 *
 * https://axesslab.com/skip-links/
 */
function bricksSkipLinks() {
	let skipLinks = bricksQuerySelectorAll(document, '.skip-link')

	if (!skipLinks) {
		return
	}

	skipLinks.forEach((link) => {
		link.addEventListener('click', (e) => {
			e.preventDefault()

			let toElement = document.getElementById(link.href.split('#')[1])

			if (toElement) {
				toElement.setAttribute('tabindex', '-1')

				toElement.addEventListener(
					'blur',
					() => {
						toElement.removeAttribute('tabindex')
					},
					{ once: true }
				)

				toElement.focus()
			}
		})
	})
}

/**
 * Bind element interactions to elements (frontend only)
 *
 * @since 1.6
 */
const bricksInteractionsFn = new BricksFunction({
	parentNode: document,
	selector: '[data-interactions]',
	frontEndOnly: true,
	eachElement: (sourceEl) => {
		let interactions = []

		try {
			interactions = JSON.parse(sourceEl.dataset.interactions)
		} catch (e) {
			console.info('error:bricksInteractions', e)
			return false
		}

		let interactionGroupId = sourceEl.dataset?.interactionId || false

		if (!interactions || !interactionGroupId) {
			return
		}

		interactions.forEach((interaction) => {
			let bindToDocument = false

			if (!interaction?.trigger) {
				return
			}

			// trigger: 'click', 'mouseover', 'scroll', etc.
			if (interaction.trigger === 'scroll') {
				let scrollOffset = 0

				if (interaction?.scrollOffset) {
					scrollOffset = interaction?.scrollOffset.replace('px', '')

					if (scrollOffset.includes('%')) {
						let documentHeight = Math.max(
							document.body.scrollHeight,
							document.documentElement.scrollHeight,
							document.body.offsetHeight,
							document.documentElement.offsetHeight,
							document.body.clientHeight,
							document.documentElement.clientHeight
						)

						scrollOffset = (documentHeight / 100) * parseInt(scrollOffset)
					} else if (scrollOffset.includes('vh')) {
						scrollOffset = (window.innerHeight / 100) * parseInt(scrollOffset)
					}
				}

				interaction.scrollOffset = scrollOffset
			} else if (interaction.trigger === 'mouseleaveWindow') {
				interaction.trigger = 'mouseleave'
				bindToDocument = true
			}

			// Return: No more sourceEl
			if (!sourceEl) {
				return
			}

			// STEP: store the source element
			interaction.el = sourceEl

			// STEP: Interaction group Id
			interaction.groupId = bindToDocument ? 'document' : interactionGroupId

			// STEP: Store interaction
			if (!window.bricksData?.interactions) {
				window.bricksData.interactions = []
			}

			window.bricksData.interactions.push(interaction)

			// STEP: Create interaction event listeners
			switch (interaction.trigger) {
				case 'click':
				case 'mouseover':
				case 'mouseenter':
				case 'mouseleave':
				case 'focus':
				case 'blur':
					let attachEl = bindToDocument ? document.documentElement : sourceEl

					attachEl.addEventListener(
						interaction.trigger,
						(e) => bricksInteractionCallback(e, interaction),
						{
							once: interaction?.runOnce
						}
					)
					break

				// @since 1.8.4
				case 'animationEnd':
					let targetAnimationId = interaction?.animationId || false

					// Target animation not set: Find last previous animation interaction (action is 'startAnimation'), and must be in the same interaction group
					if (!targetAnimationId) {
						let previousInteraction = window.bricksData.interactions.filter((int) => {
							return (
								int.groupId === interactionGroupId &&
								int.action === 'startAnimation' &&
								int.id !== interaction.id
							)
						})

						if (previousInteraction.length) {
							targetAnimationId = previousInteraction[previousInteraction.length - 1].id
						}
					}

					// @since 1.8.4 - Listen to `bricks/animation/end/${animationId}`
					if (targetAnimationId && targetAnimationId !== interaction.id) {
						document.addEventListener(
							`bricks/animation/end/${targetAnimationId}`,
							(evt) => {
								bricksInteractionCallbackExecution(sourceEl, interaction)
							},
							{
								once: interaction?.runOnce
							}
						)
					}
					break

				case 'contentLoaded':
					let delay = interaction?.delay || 0

					if (delay && delay.includes('ms')) {
						delay = parseInt(delay)
					} else if (delay && delay.includes('s')) {
						delay = parseFloat(delay) * 1000
					}

					setTimeout(() => {
						bricksInteractionCallbackExecution(sourceEl, interaction)
					}, delay)
					break

				case 'enterView':
					new BricksIntersect({
						element: sourceEl,
						callback: (sourceEl) => bricksInteractionCallbackExecution(sourceEl, interaction),
						once: interaction?.runOnce,
						trigger: interaction?.trigger,
						rootMargin: interaction?.rootMargin // @since 2.0
					})
					break

				/**
				 * Don't use rootMargin
				 *
				 * Because if element has enterView & leaveView interactions, the leaveView will be ignored when scrolling up
				 *
				 * @see #38ve0he
				 *
				 * @since 1.6.2
				 */
				case 'leaveView':
					new BricksIntersect({
						element: sourceEl,
						callback: (sourceEl) => bricksInteractionCallbackExecution(sourceEl, interaction),
						once: interaction?.runOnce,
						trigger: interaction?.trigger
					})
					break

				/**
				 * Show/Hide popup trigger
				 * @since 1.8.2
				 */
				case 'showPopup':
				case 'hidePopup':
					let listenEvent =
						interaction.trigger === 'showPopup' ? 'bricks/popup/open' : 'bricks/popup/close'
					document.addEventListener(listenEvent, (event) => {
						let popupElement = event.detail?.popupElement || false

						// Only run if this popup is the sourceEl
						if (!popupElement || popupElement !== sourceEl) {
							return
						}

						// STEP: Handle runOnce - As we are listening to a specific popup event, we cannot set once: true on addEventListener
						bricksUtils.maybeRunOnceInteractions(sourceEl, interaction)
					})
					break

				/**
				 * Bricks AJAX trigger (AJAX pagination, infinite scroll)
				 *
				 * @since 1.9
				 */
				case 'ajaxStart':
				case 'ajaxEnd':
					let ajaxEvent =
						interaction.trigger === 'ajaxStart' ? 'bricks/ajax/start' : 'bricks/ajax/end'
					let ajaxQueryId = interaction?.ajaxQueryId || false

					// Return: No ajaxQueryId
					if (!ajaxQueryId) {
						return
					}

					document.addEventListener(ajaxEvent, (event) => {
						let queryId = event.detail?.queryId || false

						// Return: No queryId
						if (!queryId) {
							return
						}

						// Only run if this ajaxQueryId is the sourceEl
						if (queryId !== ajaxQueryId) {
							return
						}

						// STEP: Handle runOnce - As we are listening to a specific ajax event, we cannot set once: true on addEventListener
						bricksUtils.maybeRunOnceInteractions(sourceEl, interaction)
					})

					break

				// Form submit events (@since 1.9.2)
				case 'formSubmit':
				case 'formSuccess':
				case 'formError':
					let targetFormId = interaction?.formId

					// Return: No targetFormId
					if (!targetFormId) {
						return
					}

					// Set formEvent, based on interaction.trigger (eg. formSubmit => bricks/form/submit)
					let formEvent = `bricks/form/${interaction.trigger.replace('form', '').toLowerCase()}`

					document.addEventListener(formEvent, (event) => {
						let formId = event.detail?.elementId

						// Return: No elementFormId
						if (!formId) {
							return
						}

						targetFormId = targetFormId.replace('#', '')
						targetFormId = targetFormId.replace('brxe-', '')

						// Return: formId not equal to targetFormId
						if (formId !== targetFormId) {
							return
						}

						// STEP: Handle runOnce - As we are listening to a specific form event, we cannot set once: true on addEventListener
						bricksUtils.maybeRunOnceInteractions(sourceEl, interaction)
					})

					break

				// Filter interactions (@since 1.11)
				case 'filterOptionEmpty':
				case 'filterOptionNotEmpty':
					let filterElementId = interaction?.filterElementId || false

					// Return: No filterElementId
					if (!filterElementId) {
						return
					}

					// In case user uses #brxe- prefix
					filterElementId = filterElementId.replace('#', '')
					filterElementId = filterElementId.replace('brxe-', '')

					// Set filterEvent, based on interaction.trigger (eg. filterOptionEmpty => bricks/filter/option/empty)
					let filterEvent = `bricks/filter/option/${interaction.trigger
						.replace('filterOption', '')
						.toLowerCase()}`

					document.addEventListener(filterEvent, (event) => {
						let elementIds = event.detail?.filterElementIds || []

						// Return: No elementIds or filterElementId not in elementIds
						if (!elementIds.length || !elementIds.includes(filterElementId)) {
							return
						}

						// STEP: Handle runOnce - As we are listening to a specific filter event, we cannot set once: true on addEventListener
						bricksUtils.maybeRunOnceInteractions(sourceEl, interaction)
					})

					break

				// Interactions for WooCommerce events (@since 2.0)
				case 'wooAddedToCart':
				case 'wooAddingToCart':
				case 'wooRemovedFromCart':
				case 'wooUpdateCart':
				case 'wooCouponApplied':
				case 'wooCouponRemoved':
					if (typeof jQuery === 'undefined') {
						return
					}

					let wooEvent = null

					if (interaction.trigger === 'wooAddedToCart') {
						wooEvent = 'added_to_cart'
					} else if (interaction.trigger === 'wooAddingToCart') {
						wooEvent = 'adding_to_cart'
					} else if (interaction.trigger === 'wooRemovedFromCart') {
						wooEvent = 'item_removed_from_classic_cart'
					} else if (interaction.trigger === 'wooUpdateCart') {
						wooEvent = 'updated_cart_totals'
					} else if (interaction.trigger === 'wooCouponApplied') {
						wooEvent = 'applied_coupon applied_coupon_in_checkout'
					} else if (interaction.trigger === 'wooCouponRemoved') {
						wooEvent = 'removed_coupon removed_coupon_in_checkout'
					}

					if (wooEvent) {
						jQuery(document.body).on(wooEvent, (event) => {
							bricksUtils.maybeRunOnceInteractions(sourceEl, interaction)
						})
					}
					break
			}
		})

		// After all interactions are added, check if any load more button should be hidden
		bricksUtils.hideOrShowLoadMoreButtons('all')
	}
})

function bricksInteractions() {
	bricksInteractionsFn.run()
}

/**
 * Trap focus inside an element
 *
 * bricksNavNested, bricksNavMenuMobile, bricksPopups, bricksOffcanvas
 *
 * @param {*} event
 * @param {*} node
 *
 * @since 1.11
 */
function bricksTrapFocus(event, node) {
	if (event.key === 'Tab') {
		const focusableElements = bricksGetVisibleFocusables(node)
		const firstFocusableElement = focusableElements[0]
		const lastFocusableElement = focusableElements[focusableElements.length - 1]

		if (event.shiftKey) {
			// Shift + Tab
			if (document.activeElement === firstFocusableElement) {
				lastFocusableElement.focus()
				event.preventDefault()
			}
		} else {
			// Tab
			if (document.activeElement === lastFocusableElement) {
				firstFocusableElement.focus()
				event.preventDefault()
			}
		}
	}
}

/**
 * Focus on first focusable element inside an element
 *
 * Example: bricksNavMenuMobile, bricksPopups
 *
 * @param {*} node
 * @since 1.11
 */
function bricksFocusOnFirstFocusableElement(node, waitForVisible = true) {
	let focusableElements = bricksGetFocusables(node)
	let firstFocusableElement = focusableElements[0]

	if (!firstFocusableElement) return

	if (!waitForVisible) {
		// For NestedNav avoid breaking change (#86c31fdvz)
		firstFocusableElement.focus()
		return
	}

	// Enhance logic to consider the element's visibility to solve OffCanvas issues (@since 2.0)
	// Check if the element is focusable
	let maxTries = 60 // ~1s of attempts (60 frames)
	let tries = 0

	function canReceiveFocus(element) {
		// Check if element is visible, not hidden, not covered
		const style = window.getComputedStyle(element)

		if (
			style.display === 'none' ||
			style.visibility !== 'visible' ||
			parseFloat(style.opacity) < 0.1
		) {
			return false
		}

		const rect = element.getBoundingClientRect()
		if (rect.width === 0 || rect.height === 0) return false

		// Optional: check if element is off-screen
		if (
			rect.bottom < 0 ||
			rect.top > window.innerHeight ||
			rect.right < 0 ||
			rect.left > window.innerWidth
		) {
			return false
		}

		return true
	}

	function tryFocus() {
		if (canReceiveFocus(firstFocusableElement)) {
			firstFocusableElement.focus()
		} else if (tries++ < maxTries) {
			requestAnimationFrame(tryFocus)
		} else {
			console.warn('Element never became focusable:', firstFocusableElement)
		}
	}

	requestAnimationFrame(tryFocus)
}

/**
 * Popups
 *
 * @since 1.6
 * @since 1.11: Trap focus via bricksTrapFocus
 */
function bricksPopups() {
	let lastFocusedElement = null

	const escClosePopup = (event, popupElement) => {
		if (event.key === 'Escape') {
			bricksClosePopup(popupElement)
		}
	}

	const backdropClosePopup = (event, popupElement) => {
		if (event.target.classList.contains('brx-popup-backdrop')) {
			bricksClosePopup(popupElement)
		}

		// Backdrop disabled: Close popup when clicking outside popup
		else if (event.target.classList.contains('brx-popup')) {
			bricksClosePopup(popupElement)
		}
	}

	/**
	 * Listen to document bricks/popup/open event
	 *
	 * event.detail.popupElement: Popup element
	 * event.detail.popupId: Popup id
	 * - Not for Map infobox popup (@since 2.0)
	 * @since 1.7.1
	 */
	document.addEventListener('bricks/popup/open', (event) => {
		// STEP: Get popup element
		const popupElement = event.detail?.popupElement || false

		if (!popupElement || !bricksIsFrontend) {
			return
		}

		// Do not execute this logic if the opened popup is AJAX infobox (@since 2.0)
		if (popupElement.classList.contains('brx-infobox-popup')) {
			return
		}

		// STEP: Add close event listeners for popup
		// Moved on top, to always run (@since 1.12.3)
		const popupCloseOn = popupElement.dataset?.popupCloseOn || 'backdrop-esc'

		if (popupCloseOn.includes('esc')) {
			// STEP: Listen for ESC key pressed to close popup
			const escEventHandler = (event) => escClosePopup(event, popupElement)

			document.addEventListener('keyup', escEventHandler)

			// Remove the ESC event listener when popup is closed
			document.addEventListener('bricks/popup/close', () => {
				document.removeEventListener('keyup', escEventHandler)
			})
		}

		if (popupCloseOn.includes('backdrop')) {
			// STEP: Listen for click outside popup to close popup
			const backdropEventHandler = (event) => backdropClosePopup(event, popupElement)

			document.addEventListener('click', backdropEventHandler)

			// Remove the backdrop event listener when popup is closed
			document.addEventListener('bricks/popup/close', () => {
				document.removeEventListener('click', backdropEventHandler)
			})
		}

		// Store the last focused element before opening the popup (@since 1.11.1)
		lastFocusedElement = document.activeElement

		// STEP: Scroll to top of popup content (@since 1.8.4)
		// Moved outside of timeout, to prevent popup content jump (@since 1.12.2)
		if (popupElement.dataset?.popupScrollToTop) {
			popupElement.querySelector('.brx-popup-content')?.scrollTo(0, 0)
		}

		// STEP: Try to scroll to fist focusable element, before popup is opened (@since 1.12.2)
		if (!popupElement.dataset?.popupDisableAutoFocus) {
			// STEP: Find first focusable element inside popup
			const focusables = bricksGetFocusables(popupElement)
			const firstFocusable = focusables.length > 0 ? focusables[0] : null

			// Only run the code, if there is at least one focusable element (@since 1.12.3)
			if (firstFocusable) {
				// To prevent wrong calculation, scroll to top of popup content
				popupElement.querySelector('.brx-popup-content')?.scrollTo(0, 0)

				// Get the element's position relative to the container
				const elementRect = firstFocusable.getBoundingClientRect()
				const containerRect = popupElement
					.querySelector('.brx-popup-content')
					.getBoundingClientRect()

				// Calculate the scroll position needed
				const scrollTop = elementRect.top - containerRect.top + popupElement.scrollTop - 10 // Add some padding at the top

				// Scroll the container
				popupElement.querySelector('.brx-popup-content').scrollTo({
					top: scrollTop
				})
			}
		}

		// Timeout is necessary to allow popup to be fully rendered & focusable (e.g. opening animation set)
		setTimeout(() => {
			//STEP: Autofocus on first focusable element inside popup
			if (!popupElement.dataset?.popupDisableAutoFocus) {
				bricksFocusOnFirstFocusableElement(popupElement)
			}

			// STEP: Scroll to top of popup content
			if (popupElement.dataset?.popupScrollToTop) {
				popupElement
					.querySelector('.brx-popup-content')
					?.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
			}
		}, 100)

		// STEP: Add focus trap - Not allowing to tab outside popup
		const focusTrapEventHandler = (event) => bricksTrapFocus(event, popupElement)

		document.addEventListener('keydown', focusTrapEventHandler)

		// Remove the focus trap event listener when popup is closed
		document.addEventListener('bricks/popup/close', () => {
			document.removeEventListener('keydown', focusTrapEventHandler)

			// Restore focus to the last focused element (@since 1.11.1)
			if (lastFocusedElement) {
				lastFocusedElement.focus()
			}
		})
	})
}

/**
 * Scroll interaction listener
 *
 * @since 1.9.5 - Remove debounce 100ms(#86bwp4aax)
 *
 * @since 1.6
 */
function bricksScrollInteractions() {
	// Get scroll interactions anew on every scroll (new interactions could have been added via AJAX pagination or infinite scroll)
	let interactions = Array.isArray(window.bricksData?.interactions)
		? window.bricksData.interactions
		: []
	let scrolled = window.scrollY
	let runOnceIndexToRemove = []

	interactions.forEach((interaction, index) => {
		// Skip non-scroll interactions
		if (interaction?.trigger !== 'scroll') {
			return
		}

		if (scrolled >= interaction.scrollOffset) {
			bricksInteractionCallbackExecution(interaction.el, interaction)

			// Push interaction.id instead of index (@since 1.10) to remove from window.bricksData.interactions below
			if (interaction?.runOnce) {
				runOnceIndexToRemove.push(interaction.id)
			}
		}
	})

	// Remove interaction from window.bricksData.interactions after looping over all interactions
	runOnceIndexToRemove.forEach((interactionId) => {
		window.bricksData.interactions = window.bricksData.interactions.filter(
			(interaction) => interaction.id !== interactionId
		)
	})
}

/**
 * Interactions callback
 *
 * @param {Event} event - The event that triggered the interaction
 * @param {Object} interaction - The interaction configuration object (@since 2.0)
 *
 * @since 1.6
 */
function bricksInteractionCallback(event, interaction) {
	if (event?.type === 'click') {
		// Return: Don't run interaction when clicking on an anchor ID (except for # itself)
		if (
			event.target.tagName === 'A' &&
			event.target.getAttribute('href') !== '#' &&
			event.target.getAttribute('href')?.startsWith('#')
		) {
			return
		}

		// Only prevent default if it's not disabled (@since 2.0)
		if (!interaction?.disablePreventDefault) {
			event.preventDefault()
		}
	}

	// Run interaction callback execution (@since 2.0.1)
	bricksInteractionCallbackExecution(interaction.el, interaction)
}

/**
 * Interaction action execution
 *
 * @since 1.6
 */
function bricksInteractionCallbackExecution(sourceEl, config) {
	const targetMode = config?.target || 'self'

	let target

	switch (targetMode) {
		case 'custom':
			if (config?.targetSelector) {
				target = bricksQuerySelectorAll(document, config.targetSelector)
			}
			break

		case 'popup':
			if (config?.templateId) {
				// Target looping popup by matching 'data-interaction-loop-id' with 'data-popup-loop-id' + templateId (@since 1.8.4)
				if (sourceEl.dataset?.interactionLoopId) {
					target = bricksQuerySelectorAll(
						document,
						`.brx-popup[data-popup-id="${config.templateId}"][data-popup-loop-id="${sourceEl.dataset.interactionLoopId}"]`
					)
				}

				// No popup found: Try finding popup by 'data-popup-id'
				if (!target || !target.length) {
					target = bricksQuerySelectorAll(
						document,
						`.brx-popup[data-popup-id="${config.templateId}"]`
					)
				}
			}
			break

		case 'offcanvas':
			if (config?.offCanvasSelector) {
				// Ensure offCanvasSelector is set
				target = sourceEl
			}
			break

		default:
			target = sourceEl // = self
	}

	if (!target) {
		return
	}

	target = Array.isArray(target) ? target : [target]

	// Interaction condition not fulfilled
	if (!bricksInteractionCheckConditions(config)) {
		// Execute logic if condition unmet (@since 1.9.6)
		switch (config?.action) {
			case 'startAnimation':
				target.forEach((el) => {
					// Remove 'data-interaction-hidden-on-load' attribute or else element will be hidden (#86bwvh3hv)
					el.removeAttribute('data-interaction-hidden-on-load')
				})
				break
		}

		// Return: Don't run interaction
		return
	}

	switch (config?.action) {
		case 'show':
		case 'hide':
			target.forEach((el) => {
				// Popup
				if (el?.classList.contains('brx-popup')) {
					if (config.action === 'show') {
						// Extra params for AJAX popup - @since 1.9.4
						let extraParams = {}

						if (config?.popupContextId) {
							// User defined popupContextId
							extraParams.popupContextId = config.popupContextId
						}

						if (config?.popupContextType) {
							// User defined popupContextType
							extraParams.popupContextType = config.popupContextType
						}

						if (sourceEl.dataset?.interactionLoopId) {
							// Interaction has loopId: it's a looping popup
							extraParams.loopId = sourceEl.dataset.interactionLoopId
						}

						bricksOpenPopup(el, 0, extraParams)
					} else if (config.action === 'hide') {
						bricksClosePopup(el)
					}
				}

				// Regular element
				else {
					// Hide
					if (config.action === 'hide') {
						el.style.display = 'none'
					}

					// Show (remove display: none & only set display: block as a fallback)
					else {
						if (el.style.display === 'none') {
							el.style.display = null

							// Check if element is still hidden (e.g. display: none set by CSS)
							let styles = window.getComputedStyle(el)

							if (styles.display === 'none') {
								el.style.display = 'block'
							}
						} else {
							el.style.display = 'block'
						}
					}
				}
			})
			break

		case 'setAttribute':
		case 'removeAttribute':
		case 'toggleAttribute':
			const attributeKey = config?.actionAttributeKey

			if (attributeKey) {
				target.forEach((el) => {
					let attributeValue = config?.actionAttributeValue || ''

					// Attribute 'class'
					if (attributeKey === 'class') {
						let classNames = attributeValue ? attributeValue.split(' ') : []

						classNames.forEach((className) => {
							if (config.action === 'setAttribute') {
								el.classList.add(className)
							} else if (config.action === 'removeAttribute') {
								el.classList.remove(className)
							} else {
								el.classList.toggle(className)
							}
						})
					}

					// All other attributes
					else {
						if (config.action === 'setAttribute') {
							el.setAttribute(attributeKey, attributeValue)
						} else if (config.action === 'removeAttribute') {
							el.removeAttribute(attributeKey)
						} else {
							// Toggle attribute
							if (el.hasAttribute(attributeKey)) {
								el.removeAttribute(attributeKey)
							} else {
								el.setAttribute(attributeKey, attributeValue)
							}
						}
					}
				})
			}
			break

		// @since 1.9.2
		case 'scrollTo':
			const scrollTarget = target[0]

			// Return: No scroll target
			if (!scrollTarget || !scrollTarget.scrollIntoView) {
				return
			}

			// Offset & timeout as set by user
			let offset = config?.scrollToOffset || 0
			let delay = config?.scrollToDelay || 1 // (1ms to allow DOM to update)

			setTimeout(() => {
				// Remove 'px' from offset if is a string
				if (typeof offset === 'string') {
					offset = offset.replace('px', '')
				}

				// Get the offsetTop of the target element
				let targetOffsetTop = scrollTarget.getBoundingClientRect().top

				// Scroll to target element with offset
				window.scrollBy(0, targetOffsetTop - parseInt(offset))
			}, parseInt(delay))

			break

		// Clears all form fields (@since 2.0)
		case 'clearForm':
			const formSelector = config?.targetFormSelector
			let formElements = null

			// If trigger is one of the 'formSubmit', 'formSuccess', 'formError', use form element itself
			if (['formSubmit', 'formSuccess', 'formError'].includes(config.trigger)) {
				let formSelectorId = config?.formId
				formSelectorId = formSelectorId.replace('#', '')
				formSelectorId = formSelectorId.replace('brxe-', '')
				formElements = document.querySelectorAll(`.brxe-form[data-element-id="${formSelectorId}"]`)
			}
			// If formSelector is set, use "form" as selector
			else if (!formSelector) {
				formElements = document.querySelectorAll('form')
			} else {
				formElements = document.querySelectorAll(formSelector)
			}

			if (formElements && formElements.length) {
				// Clear all form fields
				formElements.forEach((form) => {
					const inputs = form.querySelectorAll('input, textarea, select')
					inputs.forEach((input) => {
						if (input.tagName === 'SELECT') {
							input.selectedIndex = 0
						} else if (input.tagName === 'TEXTAREA') {
							input.value = ''
						} else if (input.type === 'checkbox' || input.type === 'radio') {
							input.checked = false
						} else {
							input.value = ''
						}
					})

					// Search for all file results buttons and click on them, to clear them
					const fileResults = form.querySelectorAll('.file-result.show > .bricks-button.remove')
					fileResults.forEach((fileResult) => {
						fileResult.click()
					})
				})
			}

			break
		case 'storageAdd':
		case 'storageRemove':
		case 'storageCount':
			const storageType = config?.storageType
			const storageKey = config?.actionAttributeKey
			const storageValue = config.hasOwnProperty('actionAttributeValue')
				? config.actionAttributeValue
				: 0

			if (storageType && storageKey) {
				if (config.action === 'storageAdd') {
					bricksStorageSetItem(storageType, storageKey, storageValue)
				} else if (config.action === 'storageRemove') {
					bricksStorageRemoveItem(storageType, storageKey)
				} else if (config.action === 'storageCount') {
					let counter = bricksStorageGetItem(storageType, storageKey)

					counter = counter ? parseInt(counter) : 0

					bricksStorageSetItem(storageType, storageKey, counter + 1)
				}
			}
			break

		case 'startAnimation':
			const animationType = config?.animationType

			if (animationType) {
				let animationDelay = 0

				// Calculating animation delay, so we can timout the animation below (@since 2.0)
				if (config?.animationDelay) {
					if (config.animationDelay.includes('ms')) {
						animationDelay = parseInt(config.animationDelay)
					} else if (config.animationDelay.includes('s')) {
						animationDelay = parseFloat(config.animationDelay) * 1000
					}
				}

				// Delay the action execution (@since 2.0)
				setTimeout(() => {
					target.forEach((el) => {
						// Default animation duration: 1s
						let removeAnimationAfterMs = 1000
						let isPopup = el?.classList.contains('brx-popup')

						// Apply animation to popup content (@since 1.8)
						if (isPopup) {
							el = el.querySelector('.brx-popup-content')
						}

						// Get custom animation-duration
						if (config?.animationDuration) {
							el.style.animationDuration = config.animationDuration

							if (config.animationDuration.includes('ms')) {
								removeAnimationAfterMs = parseInt(config.animationDuration)
							} else if (config.animationDuration.includes('s')) {
								removeAnimationAfterMs = parseFloat(config.animationDuration) * 1000
							}
						}

						// Get custom animation-delay
						if (config?.animationDelay) {
							// Here we can just add the adnimationDelay, as we already calculated it above (@since 2.0)
							removeAnimationAfterMs += animationDelay
						}

						/**
						 * Animate popup
						 *
						 * @since 1.7 - Popup use removeAnimationAfterMs for setTimeout duration)
						 * @since 1.8.5 - Check config.trigger to avoid recursive error (#866aqzzwf)
						 */
						if (isPopup && config.trigger !== 'showPopup' && config.trigger !== 'hidePopup') {
							let popupNode = el.parentNode // el = .brx-popup-content
							let extraParams = {} // Extra parameters for popup is required for looping popup interaction (@since 1.11)

							if (sourceEl.dataset?.interactionLoopId) {
								// Interaction has loopId: It's a looping popup
								extraParams.loopId = sourceEl.dataset.interactionLoopId
							}

							// Animate: open popup (if animationType includes 'In')
							if (animationType.includes('In')) {
								bricksOpenPopup(popupNode, removeAnimationAfterMs, extraParams)
							}
						}

						el.classList.add('brx-animated')

						el.setAttribute('data-animation', animationType)

						el.setAttribute('data-animation-id', config.id || '')

						// Remove animation class after animation duration + delay to run again
						bricksAnimationFn.run({
							elementsToAnimate: [el],
							removeAfterMs: removeAnimationAfterMs
						})
					})
				}, animationDelay)
			}
			break

		case 'loadMore':
			const queryId = config?.loadMoreQuery

			const queryConfig = window.bricksData.queryLoopInstances?.[queryId]

			if (!queryConfig) {
				return
			}

			// Support Component (@since 1.12.2)
			const componentId = queryConfig?.componentId || false
			let selectorId = componentId ? componentId : queryId

			// If selectorId contains dash, just get the first part
			if (selectorId.includes('-')) {
				selectorId = selectorId.split('-')[0]
			}

			// Query trail is the last element of the results container
			const queryTrail = Array.from(
				queryConfig.resultsContainer?.querySelectorAll(`.brxe-${selectorId}:not(.brx-popup)`)
			).pop()

			if (queryTrail) {
				if (!sourceEl.classList.contains('is-loading')) {
					// Add "is-loading" class to the source element so we could style some spinner animation
					sourceEl.classList.add('is-loading')

					// Add the query ID to the trail so that the load page could fetch the query config
					queryTrail.dataset.queryElementId = queryId
					if (componentId) {
						queryTrail.dataset.queryComponentId = componentId
					}

					// No delay for load more interaction (@since 1.12.2)
					bricksQueryLoadPage(queryTrail, true).then((data) => {
						sourceEl.classList.remove('is-loading')

						// Hide or show the "Load More" buttons
						bricksUtils.hideOrShowLoadMoreButtons(queryId)
					})
				}
			}
			break

		// Execute the function (since 1.9.5)
		case 'javascript':
			if (config?.jsFunction) {
				let userFunction = window[config.jsFunction] ?? false

				// jsFunction is a string, maybe the function stored in an object, separated by dot (.)
				if (config.jsFunction.includes('.')) {
					const jsFunctionParts = config.jsFunction.split('.')
					let tempFunctionTest = window
					// Loop through the parts, and get the function
					jsFunctionParts.forEach((part) => {
						tempFunctionTest = tempFunctionTest[part]
					})

					// Check if the function exists
					if (typeof tempFunctionTest === 'function') {
						userFunction = tempFunctionTest
					}
				}

				// Run the function if it exists
				if (userFunction && typeof userFunction === 'function') {
					// Default brxParams
					let brxParams = {
						source: sourceEl,
						targets: target
					}
					// Build actual parameters
					let customParams = {}
					if (config?.jsFunctionArgs) {
						// jsFunctionArgs is an array
						if (Array.isArray(config.jsFunctionArgs)) {
							config.jsFunctionArgs.forEach((arg, index) => {
								if (arg?.jsFunctionArg && arg?.id) {
									let key = arg.id
									let value = arg.jsFunctionArg

									// If the jsFunctionArg is %brx%, replace it with brxParams
									if (arg.jsFunctionArg === '%brx%') {
										key = arg.jsFunctionArg
										value = brxParams
									}

									// Add the parameter to the customParams object
									customParams[key] = value
								}
							})
						}
					}

					target.forEach((el) => {
						// Add current el as target to %brx% parameter
						if (customParams?.['%brx%']) {
							customParams['%brx%'].target = el
						}

						// Run the function, pass the parameters only if customParams is not empty
						if (Object.keys(customParams).length) {
							// Each customParam key is a parameter
							userFunction(...Object.keys(customParams).map((key) => customParams[key]))
						} else {
							userFunction()
						}
					})
				} else {
					console.error(
						`Bricks interaction: Custom JavaScript function "${config.jsFunction}" not found.`
					)
				}
			}
			break

		// toggleOffCanvas (@since 1.11)
		case 'toggleOffCanvas':
			const offCanvasSelector = config?.offCanvasSelector || false

			if (!offCanvasSelector) {
				return
			}

			// Don't use the target, just pass the selector to the function
			bricksUtils.toggleAction(sourceEl, { selector: offCanvasSelector })
			break

		// openAddress, closeAddress (@since 2.0)
		case 'openAddress':
		case 'closeAddress':
			target.forEach((el) => {
				bricksUtils.toggleMapInfoBox(config)
			})

			break
	}
}

/**
 * Open Bricks popup (frontend only)
 *
 * @param {obj} object Popup element node or popup ID
 * @param {int} timeout Timeout in ms to run counter
 * @param {obj} additionalParam Additional parameters (@since 1.9.4)
 * @since 1.7.1
 */
function bricksOpenPopup(object, timeout = 0, additionalParam = {}) {
	if (!bricksIsFrontend) {
		return
	}

	let popupElement

	// Check: Popup is element node OR popup ID
	if (object) {
		if (object.nodeType === Node.ELEMENT_NODE) {
			popupElement = object
		}

		// Check: object is the popup ID
		else if (object) {
			popupElement = document.querySelector(`.brx-popup[data-popup-id="${object}"]`)
		}
	}

	// Return: no popup element found
	if (!popupElement) {
		return
	}

	const popupId = popupElement.dataset.popupId

	// Return: Popup limit reached
	if (!bricksPopupCheckLimit(popupElement)) {
		return
	}

	// Return: Don't shown popup on this breakpoint (@since 1.9.4)
	if (!bricksPopupCheckBreakpoint(popupElement)) {
		return
	}

	// Show popup
	popupElement.classList.remove('hide')

	// @since 1.7.1 - Add "no-scroll" class to the body if 'data-popup-body-scroll' is not set
	if (!popupElement.dataset.popupBodyScroll) {
		document.body.classList.add('no-scroll')
	}

	// Set popup height to viewport height (@since 1.8.2)
	bricksSetVh()

	// Fecth popup content (promise), maybe it was loaded via AJAX (@since 1.9.4)
	bricksFetchPopupContent(popupElement, additionalParam).then((content) => {
		// Replace popup content with fetched content (only AJAX popups has content)
		if (content !== '') {
			popupElement.querySelector('.brx-popup-content').innerHTML = content

			// Popup AJAX content loaded new DOM added (@since 1.9.4)
			const popupContentLoadedEvent = new CustomEvent('bricks/ajax/popup/loaded', {
				detail: { popupId, popupElement }
			})

			document.dispatchEvent(popupContentLoadedEvent)
		}

		// @since 1.7.1 - Trigger custom event for the "bricks/popup/open" trigger, Provide the popup ID and the popup element
		const showPopupEvent = new CustomEvent('bricks/popup/open', {
			detail: { popupId, popupElement }
		})

		document.dispatchEvent(showPopupEvent)

		// Run counter after timeout animation finishes (delay + duration)
		setTimeout(() => {
			bricksCounter()
		}, timeout)

		// Store the number of times this popup was shown
		bricksPopupCounter(popupElement)
	})
}

/**
 * Fetch popup content (promise), maybe content should fetch via AJAX
 *
 * Return empty string if popup content is not loaded via AJAX or error.
 *
 * @since 1.9.4
 */
function bricksFetchPopupContent(popupElement, additionalParam = {}, nonceRefreshed = false) {
	return new Promise((resolve, reject) => {
		const isAjax = popupElement.dataset?.popupAjax || false

		// Return: Popup content is not loaded via AJAX
		if (!isAjax) {
			resolve('')
			return
		}

		// Clear popup content
		popupElement.querySelector('.brx-popup-content').innerHTML = ''

		let popupElementId = popupElement.dataset.popupId

		let ajaxData = {
			postId: window.bricksData.postId,
			popupId: popupElementId,
			nonce: window.bricksData.nonce,
			popupContextId: false,
			popupContextType: 'post',
			isLooping: false,
			popupLoopId: false,
			queryElementId: false,
			lang: window.bricksData.language || false, // @since 2.0
			mainQueryId: window.bricksData.mainQueryId || false // Record the main query ID (@since 2.0)
		}

		// Popup is looping
		if (additionalParam?.loopId) {
			ajaxData.isLooping = true
		}

		// Set templateContext
		if (additionalParam?.popupContextId) {
			// Use user defined context
			ajaxData.popupContextId = additionalParam.popupContextId

			// Set popupContextType (only use if popupContextId is set)
			if (additionalParam?.popupContextType) {
				ajaxData.popupContextType = additionalParam.popupContextType
			}
		}

		// If loopId is set but no popupContextId, use default current context
		if (additionalParam?.loopId && !ajaxData.popupContextId) {
			// Try to get the queryElementId from the loopId, loopId is combination of queryElementId:loopIndex:loopObjectType:loopObjectId
			let loopParts = additionalParam.loopId.split(':')
			// loopParts.length at least 4 (top loop), 6 (nested loop) (@since 1.12)
			if (loopParts.length >= 4 && loopParts[0].length >= 6) {
				ajaxData.queryElementId = loopParts[0]
				ajaxData.popupLoopId = additionalParam.loopId
			}
		}

		let url = window.bricksData.restApiUrl.concat('load_popup_content')

		// Add Get lang parameter for WPML if current url has lang parameter (@since 2.0)
		if (
			window.bricksData.multilangPlugin === 'wpml' &&
			(window.location.search.includes('lang=') || window.bricksData.wpmlUrlFormat != 3)
		) {
			// use window.bricksData.language to get the current language
			url = url.concat('?lang=' + window.bricksData.language)
		}

		// AJAX popup start event - AJAX loader purposes (@since 1.9.4)
		document.dispatchEvent(
			new CustomEvent('bricks/ajax/popup/start', {
				detail: { popupId: popupElementId, popupElement: popupElement }
			})
		)

		// Support dynamic style in Popup settings (looping popup) (@since 1.12)
		if (ajaxData.isLooping) {
			popupElement.querySelector('.brx-popup-backdrop')?.removeAttribute('data-query-loop-index')
		}

		let xhr = new XMLHttpRequest()
		xhr.open('POST', url, true)
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
		xhr.setRequestHeader('X-WP-Nonce', window.bricksData.wpRestNonce)

		// Successful response
		xhr.onreadystatechange = function () {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				let status = xhr.status
				let popupContent = ''
				let res

				try {
					res = JSON.parse(xhr.response)
				} catch (e) {
					console.error('Error parsing response:', e)
				}

				// Success
				if (status === 0 || (status >= 200 && status < 400)) {
					const html = res?.html || false
					const styles = res?.styles || false
					const popups = res?.popups || false
					const error = res?.error || false
					const contentClasses = res?.contentClasses || false

					if (error) {
						console.error('error:bricksFetchPopupContent', error)
					}

					if (html) {
						popupContent = html
					}

					if (styles) {
						// Combine the styles into popupContent
						popupContent += styles
					}

					if (contentClasses) {
						// Remove all classes except brx-popup-content, brxe-container, brx-woo-quick-view (@since 1.10.2)
						const popupContentNode = popupElement.querySelector(
							'.brx-popup-content.brx-woo-quick-view'
						)

						if (popupContentNode) {
							let classesToKeep = ['brx-popup-content', 'brxe-container', 'brx-woo-quick-view']

							popupContentNode.classList.forEach((className) => {
								if (!classesToKeep.includes(className)) {
									popupContentNode.classList.remove(className)
								}
							})

							// Add classes to the popup content, contentClasses is an array of classes
							popupContentNode.classList.add(...contentClasses)

							if (!document.body.classList.contains('woocommerce')) {
								// Add woocommerce class into popup content if no woocommerce class in body, ensure styles rely on .woocommerce are applied
								popupContentNode.classList.add('woocommerce')
							}
						}
					}

					if (popups && Object.keys(popups).length) {
						/**
						 * Some of the popups already exist on the page, only add if it's not already there
						 * popups is object array, key is popupId, value is popupHtml
						 */
						Object.entries(popups).forEach(([popupId, popupHtml]) => {
							if (!document.querySelector(`.brx-popup[data-popup-id="${popupId}"]`)) {
								document.body.insertAdjacentHTML('beforeend', popupHtml)
							}
						})
					}

					// Support dynamic style in Popup settings (looping popup) (@since 1.12)
					if (ajaxData.isLooping) {
						popupElement
							.querySelector('.brx-popup-backdrop')
							?.setAttribute('data-query-loop-index', 0)
					}
				} else if (res?.code === 'rest_cookie_invalid_nonce' && !nonceRefreshed) {
					// Refresh nonce and retry (@since 1.11)
					bricksRegenerateNonceAndRetryPopup(popupElement, additionalParam)
						.then(resolve)
						.catch(reject)
					return
				}

				resolve(popupContent)

				// AJAX popup end event - AJAX loader purposes (@since 1.9.4)
				document.dispatchEvent(
					new CustomEvent('bricks/ajax/popup/end', {
						detail: { popupId: popupElementId, popupElement: popupElement }
					})
				)
			}
		}
		xhr.send(JSON.stringify(ajaxData))
	})
}

/**
 * Regenerate nonce and retry fetching popup content
 *
 * @param {*} popupElement
 * @param {*} additionalParam
 * @returns
 *
 * @since 1.11
 */
function bricksRegenerateNonceAndRetryPopup(popupElement, additionalParam) {
	return new Promise((resolve, reject) => {
		let xhrNonce = new XMLHttpRequest()
		xhrNonce.open('POST', window.bricksData.ajaxUrl, true)
		xhrNonce.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

		xhrNonce.onreadystatechange = function () {
			if (xhrNonce.readyState === XMLHttpRequest.DONE) {
				if (xhrNonce.status >= 200 && xhrNonce.status < 400) {
					let response
					try {
						response = JSON.parse(xhrNonce.responseText)
					} catch (e) {
						reject('Invalid response from server when regenerating nonce')
						return
					}

					if (response.success && response.data) {
						window.bricksData.nonce = response.data.bricks_nonce
						window.bricksData.wpRestNonce = response.data.rest_nonce
						bricksFetchPopupContent(popupElement, additionalParam, true).then(resolve).catch(reject)
					} else {
						reject('Failed to regenerate nonces: Invalid response structure')
					}
				} else {
					reject('Failed to regenerate nonce')
				}
			}
		}

		xhrNonce.send('action=bricks_regenerate_query_nonce')
	})
}

/**
 * Close Bricks popup (frontend only)
 *
 * @param object Popup element node or popup ID
 *
 * @since 1.7.1
 */
function bricksClosePopup(object) {
	if (!bricksIsFrontend) {
		return
	}

	let popupElement

	// Check: Popup is element node OR popup ID
	if (object) {
		if (object.nodeType === Node.ELEMENT_NODE) {
			popupElement = object
		}

		// Check: object is the popup ID
		else if (object) {
			popupElement = document.querySelector(`.brx-popup[data-popup-id="${object}"]`)
		}
	}

	// Fallback: Get first popup on the page
	// else {popupElement = document.querySelector(`.brx-popup[data-popup-id]`)}

	if (!popupElement) {
		return
	}

	const popupId = popupElement.dataset.popupId

	popupElement.classList.add('hide')

	// @since 1.7.1 - Remove "no-scroll" class to the body if 'data-popup-body-scroll' is not set
	if (!popupElement.dataset.popupBodyScroll) {
		/**
		 * Going to remove the no-scroll class, but check if there are other popups opened and the body should not scroll
		 *
		 * @since 1.9.4
		 */
		if (!document.querySelectorAll('.brx-popup:not(.hide):not([data-popup-body-scroll])').length) {
			document.body.classList.remove('no-scroll')
		}
	}

	// @since 1.7.1 - Trigger custom event for the "bricks/popup/close" trigger, Provide the popup ID and the popup element
	const hidePopupEvent = new CustomEvent('bricks/popup/close', {
		detail: { popupId, popupElement }
	})

	document.dispatchEvent(hidePopupEvent)
}

/**
 * Popups: Check show up limits
 *
 * true:  ok
 * false: limit overflow
 *
 * NOTE: Limits are stored in "brx_popup_${popupId}_total"
 *
 * @since 1.6
 */
function bricksPopupCheckLimit(element) {
	let limits = element?.dataset?.popupLimits
	let popupId = element?.dataset?.popupId

	if (!limits) {
		return true
	}

	try {
		limits = JSON.parse(limits)
	} catch (e) {
		console.info('error:bricksPopupCheckLimit', e)
		return true
	}

	let overflow = false
	let now = Date.now()

	Object.entries(limits).forEach(([key, value]) => {
		if (key === 'timeStorageInHours') {
			let lastShown = parseInt(
				bricksStorageGetItem('localStorage', `brx_popup_${popupId}_lastShown`)
			)
			let nextAllowedShowTime = lastShown + value * 3600000 // hours to milliseconds
			if (now < nextAllowedShowTime) {
				overflow = true
			}
		} else {
			let counter = bricksStorageGetItem(key, `brx_popup_${popupId}_total`)
			counter = counter ? parseInt(counter) : 0
			overflow = overflow || counter >= value
		}
	})

	if (!overflow && limits.timeStorageInHours) {
		bricksStorageSetItem('localStorage', `brx_popup_${popupId}_lastShown`, now.toString())
	}

	return !overflow
}

/**
 * Popups: Check breakpoint
 *
 * true:  ok
 * false: breakpoint not met
 *
 * @since 1.9.4
 */
function bricksPopupCheckBreakpoint(popupElement) {
	// If this is not a popup, retrun false so this unexpected element won't be shown
	if (!popupElement?.classList?.contains('brx-popup')) {
		return false
	}

	// STEP: Check for the breakpoint data attribute
	const popupBreakpoint = parseInt(popupElement.getAttribute('data-popup-show-at'))

	// STEP: Show at breakpoint width
	if (popupBreakpoint) {
		// Viewport width is smaller than breakpoint width: Set 'hide' class & return
		if (window.innerWidth < popupBreakpoint) {
			return false
		}
	}

	// STEP: Extract array of widths from data attribute for multi-select
	const attributeValue = popupElement.getAttribute('data-popup-show-on-widths')
	const showOnWidthRanges = attributeValue ? attributeValue.split(',') : []

	// Check against selected breakpoints to determine if the popup should be displayed for the current viewport width
	if (showOnWidthRanges.length) {
		const withinSelectedBreakpoints = showOnWidthRanges.some((range) => {
			const [min, max] = range.split('-').map((value) => {
				const numberValue = Number(value)
				if (isNaN(numberValue)) {
					console.error(`Invalid width value: ${value}`)
					return 0
				}

				return numberValue
			})

			return window.innerWidth >= min && window.innerWidth <= max
		})

		if (!withinSelectedBreakpoints) {
			return false
		}
	}

	// Reached here: Breakpoint check passed
	return true
}

/**
 * Popups: Store how many times popup was displayed
 *
 * NOTE: limits are stored in "brx_popup_${popupId}_total"
 *
 * @since 1.6
 */
function bricksPopupCounter(element) {
	let limits = element?.dataset?.popupLimits
	let popupId = element?.dataset?.popupId

	if (!limits) {
		return
	}

	try {
		limits = JSON.parse(limits)
	} catch (e) {
		console.info('error:bricksPopupCounter', e)
		return true
	}

	Object.entries(limits).forEach(([key, value]) => {
		let counter = bricksStorageGetItem(key, `brx_popup_${popupId}_total`)

		counter = counter ? parseInt(counter) : 0

		bricksStorageSetItem(key, `brx_popup_${popupId}_total`, counter + 1)
	})
}

/**
 * Check interactions conditions
 *
 * @since 1.6
 */
function bricksInteractionCheckConditions(config) {
	// STEP: No conditions
	if (!Array.isArray(config?.interactionConditions)) {
		return true
	}

	let relation = config?.interactionConditionsRelation || 'and'

	// Start with true if relation is 'and', false otherwise ('or')
	let runInteraction = relation === 'and'

	/**
	 * Convert storage value to number to be used in >=, <=, >, < conditions
	 *
	 * @see #862j9fr6y
	 *
	 * @since 1.7.1
	 */
	const convertToNumber = (value) => (!isNaN(value) ? parseFloat(value) : 0)

	// STEP: Check the interaction conditions
	config.interactionConditions.forEach((condition) => {
		let conditionType = condition?.conditionType
		let storageKey = condition?.storageKey || false
		let runCondition = false

		if (conditionType && storageKey) {
			let storageCompare = condition?.storageCompare || 'exists'
			let storageCompareValue = condition?.storageCompareValue

			let storageValue = bricksStorageGetItem(conditionType, storageKey)

			switch (storageCompare) {
				case 'exists':
					runCondition = storageValue !== null
					break

				case 'notExists':
					runCondition = storageValue === null
					break

				case '==':
					runCondition = storageValue == storageCompareValue
					break

				case '!=':
					runCondition = storageValue != storageCompareValue
					break

				case '>=':
					runCondition = convertToNumber(storageValue) >= convertToNumber(storageCompareValue)
					break

				case '<=':
					runCondition = convertToNumber(storageValue) <= convertToNumber(storageCompareValue)
					break

				case '>':
					runCondition = convertToNumber(storageValue) > convertToNumber(storageCompareValue)
					break

				case '<':
					runCondition = convertToNumber(storageValue) < convertToNumber(storageCompareValue)
					break
			}
		} else {
			runCondition = true
		}

		runInteraction =
			relation === 'and' ? runInteraction && runCondition : runInteraction || runCondition
	})

	return runInteraction
}

/**
 * Storage helper function to get value stored under a specific key
 *
 * @since 1.6
 */
function bricksStorageGetItem(type, key) {
	if (!key) {
		return
	}

	let value

	try {
		switch (type) {
			// Per page load
			case 'windowStorage':
				value = window.hasOwnProperty(key) ? window[key] : null
				break

			// Per session
			case 'sessionStorage':
				value = sessionStorage.getItem(key)
				break

			// Across sessions
			case 'localStorage':
				value = localStorage.getItem(key)
				break
		}
	} catch (e) {
		console.info('error:bricksStorageGetItem', e)
	}

	return value
}

/**
 * Storage helper function to set value for a specific storage key
 *
 * @since 1.6
 */
function bricksStorageSetItem(type, key, value) {
	if (!key) {
		return
	}

	try {
		switch (type) {
			case 'windowStorage':
				window[key] = value
				break

			case 'sessionStorage':
				sessionStorage.setItem(key, value)
				break

			case 'localStorage':
				localStorage.setItem(key, value)
				break
		}
	} catch (e) {
		console.info('error:bricksStorageSetItem', e)
	}
}

/**
 * Storage helper function to remove a specific storage key
 *
 * @since 1.6
 */
function bricksStorageRemoveItem(type, key) {
	if (!key) {
		return
	}

	try {
		switch (type) {
			case 'windowStorage':
				delete window[key]
				break

			case 'sessionStorage':
				sessionStorage.removeItem(key)
				break

			case 'localStorage':
				localStorage.removeItem(key)
				break
		}
	} catch (e) {
		console.info('error:bricksStorageRemoveItem', e)
	}
}

/**
 * Nav nested
 *
 * Mobile menu toggle
 *
 * Listeners:
 * - press ESC key to close .brx-nav-nested-items & auto-focus on mobile menu toggle
 * - press ENTER or SPACE to open .brxe-nav-nested-inner
 * - press TAB to trap focus inside .brx-nav-nested-items
 *
 * NOTE: Mobile menu toggle via .brx-toggle-div listener
 *
 * @since 1.8
 */
function bricksNavNested() {
	// Return: Builder has its own logic for showing the brx-nav-nested-items while editing
	if (!bricksIsFrontend) {
		return
	}

	let navNestedObserver = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
				let navNested = mutation.target

				// STEP: Open navNested
				if (
					navNested.classList.contains('brx-open') &&
					!navNested.classList.contains('brx-closing')
				) {
					// Set popup height to viewport height (@since 1.8.2)
					bricksSetVh() // Nav nested mobile menu uses 'top' & 'bottom' 0 instead of 100vh, though

					// Trap focus inside navNested (@since 1.11)
					let navNestedItems = navNested.querySelector('.brx-nav-nested-items')
					if (navNestedItems) {
						navNestedItems.addEventListener('keydown', (event) =>
							bricksTrapFocus(event, navNestedItems)
						)
					}

					// Add class to body to prevent scrolling
					document.body.classList.add('no-scroll')

					// Close toggle inside navNested is open
					let toggleInside = navNested.querySelector('.brx-nav-nested-items button.brxe-toggle')

					if (toggleInside) {
						setTimeout(() => {
							toggleInside.classList.add('is-active')
							toggleInside.setAttribute('aria-expanded', true)
							toggleInside.focus()
						}, 100)
					}

					// Auto-focus on first focusable element inside .brxe-nav-nested
					else {
						bricksFocusOnFirstFocusableElement(navNested, false) // Check (#86c31fdvz)
					}
				}

				// STEP: Close nav nested
				else {
					// Remove class to body to prevent scrolling
					document.body.classList.remove('no-scroll')

					// Focus on toggle element that opened the nav nested ([data-toggle-script-id])
					let toggleScriptId = navNested.dataset.toggleScriptId
					let toggleNode = document.querySelector(
						`button[data-script-id="${toggleScriptId}"],[data-interaction-id="${toggleScriptId}"][data-brx-toggle-offcanvas]`
					)

					if (toggleNode) {
						toggleNode.setAttribute('aria-expanded', false)
						toggleNode.classList.remove('is-active')
						toggleNode.focus()
					}
				}
			}
		})
	})

	let navNestedElements = bricksQuerySelectorAll(document, '.brxe-nav-nested')

	if (!navNestedElements.length) {
		return
	}

	// STEP: Observe class list changes on .brxe-nav-nested
	navNestedElements.forEach((navNested) => {
		navNestedObserver.observe(navNested, {
			attributes: true,
			attributeFilter: ['class']
		})

		navNested.addEventListener('keydown', (event) => {
			const focusedElement = document.activeElement
			const isTopLevel =
				focusedElement.closest(
					'.brx-nav-nested-items > li, .brx-nav-nested-items > .brxe-dropdown'
				) !== null
			const isInDropdown = focusedElement.closest('.brx-dropdown-content') !== null
			const isInSubmenuToggle = focusedElement.closest('.brx-submenu-toggle') !== null

			bricksHandleMenuKeyNavigation(event, {
				isTopLevel,
				isInDropdown,
				isInSubmenuToggle,
				getNextFocusable: bricksGetNextMenuFocusableInSubmenuToggle,
				getPreviousFocusable: bricksGetPreviousMenuFocusableInSubmenuToggle,
				getLastFocusableInSubmenuToggle: bricksMenuGetLastFocusableInSubmenuToggle,
				focusNextElement: (el) => bricksMenuFocusNextElement(el, '.brx-nav-nested-items'),
				focusPreviousElement: (el) => bricksMenuFocusPreviousElement(el, '.brx-nav-nested-items'),
				focusFirstElement: bricksMenuFocusFirstElement,
				focusLastElement: bricksMenuFocusLastElement,
				closeSubmenu: (toggleButton) => bricksSubmenuToggle(toggleButton, 'remove')
			})
		})
	})

	// STEP: ESC key pressed: Close mobile menu
	document.addEventListener('keyup', (e) => {
		if (e.key === 'Escape') {
			bricksNavNestedClose()
		}
	})

	// STEP: Click outside of .brxe-nav-nested && not on a toggle: Close mobile menu
	document.addEventListener('click', (e) => {
		let navNested = e.target.closest('.brxe-nav-nested')
		let clickOnToggle = e.target.closest('.brxe-toggle')

		if (!navNested && !clickOnToggle) {
			bricksNavNestedClose()
		}
	})
}

/**
 * Nav nested: Close mobile menu
 */
function bricksNavNestedClose() {
	let navNestedOpen = bricksQuerySelectorAll(document, '.brxe-nav-nested.brx-open')

	navNestedOpen.forEach((navNested) => {
		navNested.classList.add('brx-closing')

		// Close .brx-open after 200ms to prevent mobile menu styles from unsetting while mobile menu fades out
		setTimeout(() => {
			navNested.classList.remove('brx-closing')
			navNested.classList.remove('brx-open')
		}, 200)
	})
}

/**
 * Nav menu element
 *
 * @since 1.11.1
 */
const bricksNavMenuFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-nav-menu',
	eachElement: (element) => {
		element.addEventListener('keydown', (event) => {
			const focusedElement = document.activeElement
			const isTopLevel = focusedElement.closest('.bricks-nav-menu > li') !== null
			const isInDropdown = focusedElement.closest('.sub-menu') !== null
			const isInSubmenuToggle = focusedElement.closest('.brx-submenu-toggle') !== null

			bricksHandleMenuKeyNavigation(event, {
				isTopLevel,
				isInDropdown,
				isInSubmenuToggle,
				getNextFocusable: bricksGetNextMenuFocusableInSubmenuToggle,
				getPreviousFocusable: bricksGetPreviousMenuFocusableInSubmenuToggle,
				getLastFocusableInSubmenuToggle: bricksMenuGetLastFocusableInSubmenuToggle,
				focusNextElement: (el) => bricksMenuFocusNextElement(el, '.bricks-nav-menu'),
				focusPreviousElement: (el) => bricksMenuFocusPreviousElement(el, '.bricks-nav-menu'),
				focusFirstElement: bricksMenuFocusFirstElement,
				focusLastElement: bricksMenuFocusLastElement,
				closeSubmenu: (toggleButton) => {
					toggleButton.setAttribute('aria-expanded', 'false')
					toggleButton.closest('.menu-item-has-children').classList.remove('open')
				}
			})
		})
	}
})

function bricksNavMenu() {
	bricksNavMenuFn.run()
}

/**
 * Handles arrow key navigation for menu structures
 * Supports both Nav Nested and Nav Menu elements
 *
 * @since 1.11.1
 *
 * @param {Event} event - The keydown event
 * @param {Object} options - Configuration options
 */
function bricksHandleMenuKeyNavigation(event, options) {
	const {
		isTopLevel,
		isInDropdown,
		isInSubmenuToggle,
		getNextFocusable,
		getPreviousFocusable,
		getLastFocusableInSubmenuToggle,
		focusNextElement,
		focusPreviousElement,
		focusFirstElement,
		focusLastElement,
		closeSubmenu
	} = options

	const key = event.key
	const focusedElement = document.activeElement

	if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(key)) {
		event.preventDefault()
	}

	// Determine RTL status based on the document or element direction
	const isRTL =
		document.dir === 'rtl' ||
		document.documentElement.dir === 'rtl' ||
		focusedElement.closest('[dir="rtl"]') !== null

	const nextKey = isRTL ? 'ArrowLeft' : 'ArrowRight'
	const prevKey = isRTL ? 'ArrowRight' : 'ArrowLeft'

	switch (key) {
		case 'ArrowDown':
			if (isTopLevel) {
				if (isInSubmenuToggle) {
					const submenuToggle = focusedElement.closest('.brx-submenu-toggle')
					const dropdown = submenuToggle.nextElementSibling
					const toggleButton = submenuToggle.querySelector('button[aria-expanded]')

					if (
						dropdown &&
						(dropdown.classList.contains('brx-dropdown-content') ||
							dropdown.classList.contains('sub-menu')) &&
						toggleButton &&
						toggleButton.getAttribute('aria-expanded') === 'true'
					) {
						const firstLink = dropdown.querySelector('a, button')
						if (firstLink) {
							firstLink.focus()
						}
					} else {
						focusNextElement(focusedElement)
					}
				} else {
					focusNextElement(focusedElement)
				}
			} else if (isInDropdown) {
				focusNextElement(focusedElement)
			}
			break

		case nextKey:
			if (isTopLevel) {
				if (isInSubmenuToggle) {
					const nextFocusable = getNextFocusable(focusedElement, isRTL)
					if (nextFocusable) {
						nextFocusable.focus()
					} else {
						// Move to the next menu item
						focusNextElement(focusedElement.closest('.brxe-dropdown, .menu-item'))
					}
				} else {
					focusNextElement(focusedElement)
				}
			}
			break

		case 'ArrowUp':
			if (isTopLevel) {
				focusPreviousElement(focusedElement)
			} else if (isInDropdown) {
				const prevElement = focusPreviousElement(focusedElement)
				if (!prevElement) {
					const parentToggle = focusedElement
						.closest('.brxe-dropdown')
						.querySelector('.brx-submenu-toggle')
					if (parentToggle) {
						const focusTarget = getLastFocusableInSubmenuToggle(parentToggle, isRTL)
						if (focusTarget) focusTarget.focus()
					}
				}
			}
			break

		case prevKey:
			if (isTopLevel) {
				if (isInSubmenuToggle) {
					const prevFocusable = getPreviousFocusable(focusedElement, isRTL)
					if (prevFocusable) {
						prevFocusable.focus()
					} else {
						focusPreviousElement(focusedElement.closest('.brxe-dropdown, .menu-item'))
					}
				} else {
					focusPreviousElement(focusedElement)
				}
			} else if (isInDropdown) {
				const prevElement = focusPreviousElement(focusedElement)
				if (!prevElement) {
					const parentToggle = focusedElement
						.closest('.brxe-dropdown')
						.querySelector('.brx-submenu-toggle')
					if (parentToggle) {
						const focusTarget = getLastFocusableInSubmenuToggle(parentToggle, isRTL)
						if (focusTarget) focusTarget.focus()
					}
				}
			}
			break

		case 'Home':
			focusFirstElement(
				isInDropdown
					? focusedElement.closest('.sub-menu, .brx-dropdown-content')
					: focusedElement.closest('.bricks-nav-menu, .brx-nav-nested-items')
			)
			break

		case 'End':
			focusLastElement(
				isInDropdown
					? focusedElement.closest('.sub-menu, .brx-dropdown-content')
					: focusedElement.closest('.bricks-nav-menu, .brx-nav-nested-items')
			)
			break
	}
}

/**
 * Focuses on the next element in a menu
 *
 * @since 1.11.1
 *
 * @param {HTMLElement} currentElement - The current focused element
 * @param {string} menuSelector - The selector for the menu container
 * @returns {HTMLElement|null} - The newly focused element or null
 */
function bricksMenuFocusNextElement(currentElement, menuSelector) {
	if (!currentElement) {
		return null
	}

	const parent = currentElement.closest('ul') || currentElement.closest(menuSelector)

	if (!parent) {
		return null
	}

	const items = Array.from(parent.children).filter((item) =>
		item.querySelector('a, button, .brx-submenu-toggle')
	)
	const currentIndex = items.findIndex((item) => item.contains(currentElement))
	const nextItem = items[currentIndex + 1]

	// If there's no next item, return null instead of wrapping around
	if (!nextItem) {
		return null
	}

	let focusTarget
	if (nextItem.querySelector('.brx-submenu-toggle')) {
		const submenuToggle = nextItem.querySelector('.brx-submenu-toggle')
		const link = submenuToggle.querySelector('a')
		const button = submenuToggle.querySelector('button')

		// Always focus on the link first, regardless of RTL or LTR
		focusTarget = link || button
	} else {
		focusTarget = nextItem.querySelector('a') || nextItem.querySelector('button')
	}

	if (focusTarget) {
		focusTarget.focus()
	}

	return focusTarget
}

/**
 * Focuses on the previous element in a menu
 *
 * @since 1.11.1
 *
 * @param {HTMLElement} currentElement - The current focused element
 * @param {string} menuSelector - The selector for the menu container
 * @returns {HTMLElement|null} - The newly focused element or null
 */
function bricksMenuFocusPreviousElement(currentElement, menuSelector) {
	if (!currentElement) {
		return null
	}

	const parent = currentElement.closest('ul') || currentElement.closest(menuSelector)

	if (!parent) {
		return null
	}

	const items = Array.from(parent.children).filter((item) =>
		item.querySelector('a, button, .brx-submenu-toggle')
	)
	const currentIndex = items.findIndex((item) => item.contains(currentElement))
	const prevItem = items[currentIndex - 1]

	if (!prevItem) return null

	let focusTarget
	if (prevItem.querySelector('.brx-submenu-toggle')) {
		// If the previous item has a submenu toggle, focus on the button first
		focusTarget =
			prevItem.querySelector('.brx-submenu-toggle button') ||
			prevItem.querySelector('.brx-submenu-toggle a')
	} else {
		focusTarget =
			prevItem.querySelector('a') ||
			prevItem.querySelector('button') ||
			prevItem.querySelector('.brx-submenu-toggle')
	}

	if (focusTarget) {
		focusTarget.focus()
	}

	return focusTarget
}

/**
 * Focuses on the first element in a menu
 *
 * @since 1.11.1
 *
 * @param {HTMLElement} container - The container element
 */
function bricksMenuFocusFirstElement(container) {
	const focusableElements = bricksGetFocusables(container)
	if (focusableElements.length > 0) {
		const firstElement = focusableElements[0]
		if (firstElement.classList.contains('brx-submenu-toggle')) {
			const firstFocusableInToggle = firstElement.querySelector('a, button')
			if (firstFocusableInToggle) firstFocusableInToggle.focus()
		} else {
			firstElement.focus()
		}
	}
}

/**
 * Focuses on the last visible element in a menu
 *
 * @since 1.11.1
 *
 * @param {HTMLElement} container - The container element
 */
function bricksMenuFocusLastElement(container) {
	const focusableElements = bricksGetFocusables(container)
	if (focusableElements.length > 0) {
		for (let i = focusableElements.length - 1; i >= 0; i--) {
			const element = focusableElements[i]
			if (bricksIsElementVisible(element)) {
				if (element.classList.contains('brx-submenu-toggle')) {
					const lastFocusableInToggle =
						element.querySelector('button') || element.querySelector('a')
					if (lastFocusableInToggle && bricksIsElementVisible(lastFocusableInToggle)) {
						lastFocusableInToggle.focus()
						return
					}
				} else {
					element.focus()
					return
				}
			}
		}
	}
}

/**
 * Gets the next focusable element in a submenu toggle
 *
 * @since 1.11.1
 *
 * @param {HTMLElement} element - The current element
 * @param {boolean} isRTL - Whether the layout is right-to-left
 * @returns {HTMLElement|null} - The next focusable element or null
 */
function bricksGetNextMenuFocusableInSubmenuToggle(element, isRTL) {
	const submenuToggle = element.closest('.brx-submenu-toggle')
	const focusables = Array.from(submenuToggle.querySelectorAll('a, button'))

	// Always go from link to button, regardless of RTL or LTR
	if (element.tagName.toLowerCase() === 'a') {
		return focusables[1] // Return the button (second element)
	}
	// If on the button, signal to move to the next menu item
	return null
}

/**
 * Gets the previous focusable element in a submenu toggle
 *
 * @since 1.11.1
 *
 * @param {HTMLElement} element - The current element
 * @param {boolean} isRTL - Whether the layout is right-to-left
 * @returns {HTMLElement|null} - The previous focusable element or null
 */
function bricksGetPreviousMenuFocusableInSubmenuToggle(element, isRTL) {
	const submenuToggle = element.closest('.brx-submenu-toggle')
	const focusables = Array.from(submenuToggle.querySelectorAll('a, button'))

	// Always go from button to link, regardless of RTL or LTR
	if (element.tagName.toLowerCase() === 'button') {
		const link = focusables.find((el) => el.tagName.toLowerCase() === 'a')
		return link || null // Return null if no link exists, allowing navigation to previous menu item
	}

	// If on the link, signal to move to the previous menu item
	return null
}

/**
 * Gets the last focusable element in a submenu toggle
 *
 * @since 1.11.1
 *
 * @param {HTMLElement} submenuToggle - The submenu toggle element
 * @param {boolean} isRTL - Whether the layout is right-to-left
 * @returns {HTMLElement|null} - The last focusable element or null
 */
function bricksMenuGetLastFocusableInSubmenuToggle(submenuToggle, isRTL) {
	const focusables = Array.from(submenuToggle.querySelectorAll('a, button'))
	return isRTL ? focusables[0] : focusables[focusables.length - 1]
}

/**
 * Checks if an element is visible
 *
 * @since 1.11.1
 *
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} - Whether the element is visible
 */
function bricksIsElementVisible(element) {
	const rect = element.getBoundingClientRect()
	const style = window.getComputedStyle(element)
	return (
		rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
	)
}

/**
 * Offcanvas element
 *
 * - Show by adding .show (click on toggle)
 * - Close by removeing .show (backdrop click/ESC key press)
 *
 * @since 1.8
 */
function bricksOffcanvas() {
	if (!bricksIsFrontend) {
		return
	}

	let offcanvasElements = bricksQuerySelectorAll(document, '.brxe-offcanvas')

	if (!offcanvasElements.length) {
		return
	}

	// STEP: Figure out if we should skip transition of body (in case the offcanvas is open on page load + offset effect)
	let isOffsetOnPageLoad = offcanvasElements.some((offcanvas) => {
		return offcanvas.classList.contains('brx-open') && offcanvas.dataset.effect === 'offset'
	})

	// Extract this to own function, as we use it in multiple places (@since 2.0)
	const offcanvasAction = (offcanvas) => {
		let inner = offcanvas.querySelector('.brx-offcanvas-inner')
		let transitionDuration = inner
			? (transitionDuration =
					parseFloat(window.getComputedStyle(inner).getPropertyValue('transition-duration')) * 1000)
			: 200

		// STEP: Open offcanvas
		if (offcanvas.classList.contains('brx-open')) {
			// Set popup height to viewport height (@since 1.8.2)
			bricksSetVh()

			// Offset body by height/width of offcanvas
			if (offcanvas.dataset.effect === 'offset') {
				if (inner) {
					// Get CSS transition value of .brx-offcanvas-inner
					let direction = offcanvas.getAttribute('data-direction')
					let transition = window.getComputedStyle(inner).getPropertyValue('transition')

					document.body.style.margin = '0'

					// Only set transition on body if it's not on page load (@since 2.0)
					if (!isOffsetOnPageLoad) {
						document.body.style.transition = transition.replace('transform', 'margin')
					}

					// Offset body by height/width of offcanvas
					const isRTL = document.dir === 'rtl' || document.documentElement.dir === 'rtl'

					// Horizontal (top/bottom)
					if (direction === 'top') {
						document.body.style.marginTop = `${inner.offsetHeight}px`
					} else if (direction === 'bottom') {
						document.body.style.marginTop = `-${inner.offsetHeight}px`
					}

					// Vertical (left/right)
					else if (direction === 'left') {
						if (isRTL) {
							// Use negative marginRight for RTL instead of marginLeft (@since 1.11)
							document.body.style.marginRight = `-${inner.offsetWidth}px`
						} else {
							document.body.style.marginLeft = `${inner.offsetWidth}px`
						}

						document.body.style.overflowX = 'hidden'
					} else if (direction === 'right') {
						// Use marginRight for RTL (@since 1.11)
						if (isRTL) {
							document.body.style.marginRight = `${inner.offsetWidth}px`
						} else {
							document.body.style.marginLeft = `-${inner.offsetWidth}px`
						}

						document.body.style.overflowX = 'hidden'
					}

					// If it's offset on page load, we need to set the transition on body after the offset/margin is applied to body (@since 2.0)
					if (isOffsetOnPageLoad) {
						setTimeout(() => {
							document.body.style.transition = transition.replace('transform', 'margin')
						}, 0)
					}

					isOffsetOnPageLoad = false
				}
			}

			// Trap focus inside offcanvas (@since 1.11)
			offcanvas.addEventListener('keydown', (event) => bricksTrapFocus(event, offcanvas))

			// Disable body scroll
			if (offcanvas.dataset.noScroll) {
				document.body.classList.add('no-scroll')
			}

			// Auto-focus not disabled (@since 1.10.2)
			if (offcanvas.dataset?.noAutoFocus !== 'true') {
				// Auto-focus on first focusable element inside .brx-offcanvas
				bricksFocusOnFirstFocusableElement(offcanvas)
			}

			if (offcanvas.dataset?.scrollToTop === 'true') {
				// Auto Scroll to top of offcanvas (@since 1.10.2)
				let offcanvasInner = offcanvas.querySelector('.brx-offcanvas-inner')

				if (offcanvasInner) {
					offcanvasInner.scrollTop = 0
				}
			}

			// Toggle inside offcanvas is open
			let offcanvasToggles = offcanvas.querySelectorAll(
				'.brx-offcanvas-inner button.brxe-toggle, .brx-offcanvas-inner [data-brx-toggle-offcanvas="true"]'
			)

			if (offcanvasToggles.length) {
				offcanvasToggles.forEach((offcanvasToggle) => {
					let isTargetCurrentOffcanvas = false
					const targetSelector = offcanvasToggle.dataset?.selector || '.brxe-offcanvas'
					if (targetSelector) {
						const targetElements = document.querySelectorAll(targetSelector) || []
						// Check if it's targetting current offcanvas
						isTargetCurrentOffcanvas = Array.from(targetElements).includes(offcanvas)
					} else {
						// Without selector, it's meant for current offcanvas
						isTargetCurrentOffcanvas = true
					}

					// Only set is-active and aria-expanded on the correct toggle element (@since 2.0)
					if (isTargetCurrentOffcanvas) {
						offcanvasToggle.classList.add('is-active')
						offcanvasToggle.setAttribute('aria-expanded', true)
					}
				})
			}
		}

		// STEP: Close offcanvas
		else {
			offcanvas.classList.add('brx-closing') // Moved visibility style to class, and improve MutationObserver to prevent infinite loop (@since 2.0)

			// Focus on toggle element that opened the offcanvas ([data-toggle-script-id])
			let toggleScriptId = offcanvas.dataset.toggleScriptId
			let toggleNode = document.querySelector(
				`button[data-script-id="${toggleScriptId}"], [data-interaction-id="${toggleScriptId}"][data-brx-toggle-offcanvas]`
			)

			if (toggleNode) {
				toggleNode.setAttribute('aria-expanded', false)
				toggleNode.classList.remove('is-active')
				toggleNode.focus()
			}

			if (offcanvas.dataset.effect === 'offset') {
				if (document.body.style.marginTop) {
					document.body.style.margin = '0'
				}

				setTimeout(() => {
					document.body.style.margin = null
					document.body.style.overflow = null
					document.body.style.transition = null
				}, transitionDuration)
			}

			setTimeout(() => {
				// Remove .brx-closing class, as the offcanvas is closed (@since 2.0)
				offcanvas.classList.remove('brx-closing')

				// Re-enable body scroll
				if (offcanvas.dataset.noScroll) {
					document.body.classList.remove('no-scroll')
					bricksSubmenuPosition()
				}
			}, transitionDuration)
		}
	}

	let offcanvasObserver = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
				// STEP: Don't run mutation, if we add or remove .brx-closing class
				const oldValue = mutation.oldValue || ''
				const newValue = mutation.target.classList

				const oldClasses = oldValue.split(' ')
				const newClasses = Array.from(newValue)

				// Skip if we contain "brx-closing"
				if (oldClasses.includes('brx-closing') || newClasses.includes('brx-closing')) {
					return
				}

				offcanvasAction(mutation.target)
			}
		})
	})

	offcanvasElements.forEach((offcanvas) => {
		// STEP: Observe class list changes on .brxe-offcanvas
		offcanvasObserver.observe(offcanvas, {
			attributes: true,
			attributeFilter: ['class'],
			attributeOldValue: true // To get the old value of the class attribute (@since 2.0)
		})

		// STEP: Close offcanvas when clicking on backdrop
		let backdrop = offcanvas.querySelector('.brx-offcanvas-backdrop')

		if (backdrop) {
			backdrop.addEventListener('click', (e) => {
				bricksOffcanvasClose('backdrop')
			})
		}

		// STEP: If offcanvas is open by default, update (@since 2.0)
		if (offcanvas.classList.contains('brx-open')) {
			offcanvasAction(offcanvas)
		}
	})

	// STEP: ESC key pressed: Close offcanvas & focus on offcanvas toggle button
	document.addEventListener('keyup', (e) => {
		if (e.key === 'Escape') {
			bricksOffcanvasClose('esc')
		}
	})
}

/**
 * Close all open offcanvas elements
 *
 * @since 1.9.3: event 'force' closes the offcanvas without checking the trigger event (e.g. click on anchor link that's located outside the offcanvas)
 *
 * @since 1.8
 */
function bricksOffcanvasClose(event) {
	let openOffcanvasElements = bricksQuerySelectorAll(document, '.brxe-offcanvas.brx-open')

	openOffcanvasElements.forEach((openOffcanvas) => {
		// STEP: Close offcanvas on backdrop (click) OR (ESC) key press (@since 1.9.1)
		const closeOn = openOffcanvas.dataset?.closeOn || 'backdrop-esc'

		if (closeOn.includes(event) || event === 'force') {
			openOffcanvas.classList.remove('brx-open')
		}

		// STEP: Remove is-active class and set aria-expanded to false for all toggles inside the offcanvas (@since 1.11)
		let offcanvasToggles = openOffcanvas.querySelectorAll(
			'.brx-offcanvas-inner > button.brxe-toggle, .brx-offcanvas-inner > [data-brx-toggle-offcanvas="true"]'
		)

		if (offcanvasToggles.length) {
			offcanvasToggles.forEach((offcanvasToggle) => {
				offcanvasToggle.classList.remove('is-active')
				offcanvasToggle.setAttribute('aria-expanded', false)
			})
		}
	})
}

/**
 * Toggle mobile menu open inside "Div" inside .brx-nav-nested-items
 *
 * Set diplay on div according to toggle display (initially and on window resize).
 *
 * @since 1.8
 */
function bricksToggleDisplay() {
	let toggleElements = bricksQuerySelectorAll(document, '.brxe-toggle')

	if (!toggleElements.length) {
		return
	}

	toggleElements.forEach((toggle) => {
		// Mobile menu close toggle inside 'div' inside .brx-nav-nested-items: Hide div
		if (
			toggle.closest('.brx-nav-nested-items') &&
			!toggle.parentNode.classList.contains('brx-nav-nested-items') &&
			!toggle.parentNode.classList.contains('brx-toggle-div')
		) {
			// Hide parent div if toggle is hidden
			let toggleStyles = window.getComputedStyle(toggle)

			if (toggleStyles.display === 'none') {
				toggle.parentNode.style.display = 'none'

				// Close mobile menu (@since 1.11)
				bricksNavNestedClose()
			} else {
				toggle.parentNode.style.display = null
			}
		}
	})
}

/**
 * Close Nav menu element mobile menu on window resize
 *
 * @since 1.11
 */
function bricksNavMenuMobileToggleDisplay() {
	let navMenuMobileToggles = bricksQuerySelectorAll(document, '.bricks-mobile-menu-toggle')

	navMenuMobileToggles.forEach((toggle) => {
		// Mobile menu is open
		if (toggle.parentNode.classList.contains('show-mobile-menu')) {
			let toggleStyles = window.getComputedStyle(toggle)
			// Mobile menu toggle not visible: Close mobile menu (@since 1.11)
			if (toggleStyles.display === 'none') {
				toggle.click()
			}
		}
	})
}

/**
 * Toggle element
 *
 * Click event listener added here centrally to avoid multiple event listeners.
 *
 * @since 1.9.8
 */
const bricksToggleFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-toggle',
	frontEndOnly: true,
	eachElement: (toggle) => {
		toggle.addEventListener('click', (e) => {
			e.preventDefault()

			// Refactor to use bricksUtils.toggleAction(toggle) (@since 1.11)
			bricksUtils.toggleAction(toggle)
		})
	}
})

/**
 * Toggle element
 *
 * Default toggles:
 *
 * - Nav nested mobile menu (.brxe-nav-nested)
 * - Offcanvas element (.brxe-offcanvas)
 *
 * @since 1.8
 */
function bricksToggle() {
	if (!bricksIsFrontend) {
		return
	}

	bricksToggleDisplay()
	bricksToggleFn.run()
}

/**
 * Toggle sub menu: Nav menu, Dropdown
 *
 * Toggle:
 * - click on dropdown toggle
 * - press ENTER key
 * - press SPACE key
 *
 * Hide:
 * - click outside dropdown
 * - click on another dropdown toggle
 * - press ESC key
 * - press TAB key to tab out of dropdown
 *
 * Not added:
 * - press ARROR UP/DOWN key to navigate dropdown items (prevents page scroll)
 *
 * @since 1.8
 */
function bricksSubmenuToggle(toggle, action = 'toggle') {
	// Menu item: Parent of .brx-submenu-toggle (@since 1.8 to allow usage of non 'li' HTML tag on dropdown element)
	let menuItem = toggle.parentNode.classList.contains('brx-submenu-toggle')
		? toggle.parentNode.parentNode
		: false

	// Return: No menu item found
	if (!menuItem) {
		return
	}

	// STEP: Multilevel menu
	let multilevel = toggle.closest('.brx-has-multilevel')

	if (multilevel) {
		// Hide currently active parent menu item (if it's not a megamenu)
		let activeMenuItem = menuItem.parentNode.closest('.active')
		if (activeMenuItem && !activeMenuItem.classList.contains('brx-has-megamenu')) {
			activeMenuItem.classList.remove('active')
		}

		// Focus on first focusable element in submenu (small timoute required)
		setTimeout(() => {
			let submenu = menuItem.querySelector('ul') || menuItem.querySelector('.brx-dropdown-content')
			if (submenu) {
				bricksFocusOnFirstFocusableElement(submenu)
			}
		}, 100)
	}

	// add, remove, toggle .open class (& add/remove .active class)
	if (action === 'add') {
		menuItem.classList.add('open')
		menuItem.classList.add('active')
	} else if (action === 'remove') {
		menuItem.classList.remove('open')
		menuItem.classList.remove('active')
	} else {
		menuItem.classList.toggle('open')
	}

	// STEP: Update ::before pseudo element width and height (@since 1.11.1)
	const hasDropdown = menuItem.classList.contains('brxe-dropdown')

	if (hasDropdown) {
		const dropdownContent = menuItem.querySelector('.brx-dropdown-content')

		if (dropdownContent) {
			// Only execute this, if we are opening the dropdown (@since 1.12)
			if (menuItem.classList.contains('open')) {
				// Create own function for updating the gap height (@since 1.12)
				const updateGapHeight = (e) => {
					// Do not recalculate if we transitioned a property that does not affect the gap height
					const skipEvents = [
						'color',
						'background-color',
						'border-color',
						'box-shadow',
						'visibility',
						'opacity',
						'filter'
					]

					if (e?.propertyName && skipEvents.includes(e.propertyName)) {
						return
					}

					const menuItemRect = menuItem.getBoundingClientRect()
					const dropdownContentRect = dropdownContent.getBoundingClientRect()

					// Calculate properties we need
					const contentBorder = parseFloat(window.getComputedStyle(dropdownContent).borderTopWidth)
					const contentTopPos = dropdownContentRect.top + contentBorder
					const menuItemBottomPos = menuItemRect.bottom

					const totalValue = contentTopPos - menuItemBottomPos

					// Set height of ::before pseudo element (difference between dropdown content top and menu item bottom)
					menuItem.style.setProperty('--brx-dropdown-height-before', `${totalValue}px`)
				}

				// Only add event listener, if there is no propety --brx-dropdown-height-before set
				if (!menuItem.style.getPropertyValue('--brx-dropdown-height-before')) {
					dropdownContent.addEventListener('transitionend', updateGapHeight)
				}

				// Immediate update, even before transitions are done (@since 1.12)
				updateGapHeight()
			}
		}
	}

	// Set 'aria-expanded'
	toggle.setAttribute('aria-expanded', menuItem.classList.contains('open'))

	// Re-position submenu on every toggle
	// bricksSubmenuPosition(100)
}

/**
 *
 * Sub menu event listeners (Nav menu, Dropdown)
 *
 * mouseenter: Open submenu
 * mouseleave: Close submenu
 * Escape key pressed: Close all open sub menus outside non-active element
 * Click outside submenu: Close all open sub menus
 *
 * @since 1.8
 */
const bricksSubmenuListenersFn = new BricksFunction({
	parentNode: document,
	selector: '.bricks-nav-menu .menu-item-has-children, .brxe-dropdown',
	eachElement: (submenuItem) => {
		// Skip mouse listeners: Static, Multilevel, active menu item
		let skipMouseListeners =
			submenuItem.closest('[data-static]') ||
			submenuItem.closest('.brx-has-multilevel') ||
			submenuItem.classList.contains('active')

		if (skipMouseListeners) {
			return
		}

		// Open submenu on mouseenter
		submenuItem.addEventListener('mouseenter', function (e) {
			// Return: Mobile menu (Nav menu, Nav nested)
			if (
				submenuItem.closest('.show-mobile-menu') ||
				submenuItem.closest('.brxe-nav-nested.brx-open')
			) {
				return
			}

			// Return: Toggle on "click"
			if (submenuItem.getAttribute('data-toggle') === 'click') {
				return
			}

			let toggle = e.target.querySelector('[aria-expanded="false"]')

			if (toggle) {
				// Only close submenus if the toggle is the top-level menu item (@since 1.11.1.1)
				if (!toggle.closest('.brxe-dropdown.open') && !toggle.closest('.bricks-menu-item.open')) {
					bricksUtils.closeAllSubmenus(toggle) // Close all open submenus (@since 1.11.1)
				}

				bricksSubmenuToggle(toggle)
			}
		})

		// Close submenu on mouseleave
		submenuItem.addEventListener('mouseleave', function (e) {
			// Skip mobile menu (Nav menu, Nav nested)
			if (
				submenuItem.closest('.show-mobile-menu') ||
				submenuItem.closest('.brxe-nav-nested.brx-open')
			) {
				return
			}

			// Return: Toggle on "click"
			if (submenuItem.getAttribute('data-toggle') === 'click') {
				return
			}

			let toggle = e.target.querySelector('[aria-expanded="true"]')

			if (toggle) {
				// Return: If submenu is .active (opened manually via toggle click)
				let menuItem = toggle.closest('.menu-item')

				if (!menuItem) {
					menuItem = toggle.closest('.brxe-dropdown')
				}

				if (menuItem && menuItem.classList.contains('active')) {
					return
				}

				bricksSubmenuToggle(toggle)
			}
		})
	}
})

function bricksSubmenuListeners() {
	bricksSubmenuListenersFn.run() // (@since 2.0)

	document.addEventListener('keyup', function (e) {
		if (e.key === 'Escape') {
			bricksUtils.closeAllSubmenus(e.target)
		}

		// STEP: Tabbed out of menu item: Close menu item (if it does not contain the active element)
		else if (e.key === 'Tab') {
			setTimeout(() => {
				let openToggles = bricksQuerySelectorAll(document, '[aria-expanded="true"]')

				// NOTE: Can't listen to tabbing out of window (in case there is no focusable element after the last open submenu on the page)
				openToggles.forEach((toggle) => {
					let menuItem = toggle.closest('.menu-item')

					if (!menuItem) {
						menuItem = toggle.closest('.brxe-dropdown')
					}

					if (
						(menuItem && !menuItem.contains(document.activeElement)) ||
						document.activeElement.tagName === 'BODY'
					) {
						bricksSubmenuToggle(toggle, 'remove') // Close submenu (@since 1.12)
					}
				})
			}, 0)
		}
	})

	document.addEventListener('click', (e) => {
		let target = e.target
		let linkUrl = null

		// If target is not an anchor link: Get closest anchor link
		if (target && target.nodeName !== 'A') {
			target = target.closest('a[href]')
		}

		// Get link URL
		if (target) {
			linkUrl = target.getAttribute('href')
		}

		if (linkUrl && linkUrl.includes('#')) {
			// Prevent default on anchor link (#)
			if (linkUrl === '#' || linkUrl === '/#') {
				e.preventDefault()
			}

			// Click on section anchor link (e.g. #section)
			else {
				// Get element 'id' to scroll to from the hash URL (@since 1.9.2)
				let scrollToElementId = linkUrl.split('#')[1]

				// Inside offcanvas: Close offcanvas
				let offcanvas = e.target.closest('.brxe-offcanvas')
				if (offcanvas) {
					bricksOffcanvasClose('force')
				}

				// Inside mobile menu: Close mobile menu (@since 1.8.4)
				let isMobileMenu = e.target.closest('.brxe-nav-nested.brx-open')
				if (isMobileMenu) {
					bricksNavNestedClose()

					// Scroll to anchor link (after 200ms when mobile menu is closed)
					let element = document.getElementById(scrollToElementId)

					if (element) {
						setTimeout(() => {
							element.scrollIntoView()
						}, 200)
					}
				}

				let hashTarget = document.getElementById(scrollToElementId)

				if (hashTarget) {
					let isProductTabs = hashTarget.classList.contains('woocommerce-Tabs-panel')

					// Hash ID is Accordion title: Open accordion/tab (@since 1.9)
					let accordionTitle =
						hashTarget.firstChild &&
						hashTarget.firstChild.classList &&
						hashTarget.firstChild.classList.contains('accordion-title-wrapper')
							? hashTarget.firstChild
							: null
					if (accordionTitle && !isProductTabs) {
						accordionTitle.click()
						return
					}

					// Hash ID is Tab title: Open accordion/tab (@since 1.9)
					let tabTitle = hashTarget.closest('.tab-title')
					if (tabTitle && !isProductTabs) {
						tabTitle.click()
					}

					// Target outside popup: Close popup (@since 1.9)
					let popup = e.target.closest('.brx-popup')
					if (popup && !popup.contains(hashTarget)) {
						bricksClosePopup(popup)
					}
				}
			}
		}

		/**
		 * STEP: Toggle submenu button click (default) OR entire .brx-submenu-toggle on click (if 'toggleOn' set to: click, or both)
		 * @since 2.0: Target the dropdown itslef, but skip all clicks inside dropdown content (#86c21pqmy)
		 */
		const submenuToggle = e.target.closest('.brx-submenu-toggle')
		const dropdown = e.target.closest('.brxe-dropdown')
		const dropdownContent = e.target.closest('.brx-dropdown-content')

		if (dropdown && (!dropdownContent || dropdownContent.parentNode !== dropdown)) {
			// This is a Dropdown element
			handleDropdownToggle(dropdown, e, true)
		} else if (submenuToggle) {
			// This is submenu toggle inside Nav Menu
			handleDropdownToggle(submenuToggle, e, false)
		}

		// STEP: Click outside submenu: Close open sub menus
		let openSubmenuButtons = bricksQuerySelectorAll(
			document,
			'.brx-submenu-toggle > button[aria-expanded="true"]'
		)

		openSubmenuButtons.forEach((toggleButton) => {
			let menuItem = toggleButton.closest('li')

			if (!menuItem) {
				menuItem = toggleButton.closest('.brxe-dropdown')
			}

			if (!menuItem || menuItem.contains(e.target)) {
				return
			}

			bricksSubmenuToggle(toggleButton)
			menuItem.classList.remove('active')
		})
	})

	/**
	 * Helper function to handle dropdown/submenu toggle logic
	 * @since 2.0
	 */
	function handleDropdownToggle(element, e, isDropdown) {
		let toggleOn = 'hover'

		// If current element has data-toggle attribute, use that (@since 2.0)
		if (element.hasAttribute('data-toggle')) {
			toggleOn = element.getAttribute('data-toggle')
		}
		// else, get the closest element with data-toggle attribute (if any - used for multilevel) (@since 2.0)
		else {
			let toggleOnNode = element.closest('[data-toggle]')
			if (toggleOnNode) {
				toggleOn = toggleOnNode.getAttribute('data-toggle')
			}
		}

		// Nav menu: Toggle on entire .brx-submenu-toggle click
		if (element.closest('.brxe-nav-menu.show-mobile-menu')) {
			toggleOn = 'click'
		}

		// Nav nested: Toggle on entire .brx-submenu-toggle click
		if (element.closest('.brxe-nav-nested.brx-open')) {
			toggleOn = 'click'
		}

		let toggleButton =
			toggleOn === 'hover'
				? e.target.closest('[aria-expanded]')
				: element.querySelector(
						isDropdown ? '.brx-submenu-toggle button[aria-expanded]' : 'button[aria-expanded]'
					) // Dropdown: Only check inside submenu toggle  (@since 2.0)

		/**
		 * Return: Toggle on set to "hover"
		 *
		 * @since 1.8.4: Remove e.screenX = 0 && e.screenY = 0 check as not working in Safari
		 */
		let isKeyboardEvent = e.detail === 0
		if (!isKeyboardEvent && toggleOn !== 'click' && toggleOn !== 'both') {
			toggleButton = null
		}

		if (toggleButton) {
			bricksSubmenuToggle(toggleButton)

			// Set .open & active & aria-expanded in case toggle was already .open on mouseenter
			let targetElement = isDropdown ? element : element.parentNode
			targetElement.classList.toggle('active')

			setTimeout(() => {
				if (targetElement.classList.contains('active')) {
					targetElement.classList.add('open')
				}

				toggleButton.setAttribute('aria-expanded', targetElement.classList.contains('open'))
			}, 0)
		}
	}

	// STEP: Set aria-current for all links inside brx-submenu-toggle. Previously in bricksSubmenuPosition (@since 2.0)
	const submenuToggles = bricksQuerySelectorAll(document, '.brx-submenu-toggle')
	submenuToggles.forEach((submenuToggle) => {
		const menuItem = submenuToggle.parentNode
		const submenu =
			menuItem.querySelector('.brx-megamenu') ||
			menuItem.querySelector('.brx-dropdown-content') ||
			menuItem.querySelector('ul')

		// Submenu has aria-current="page" menu item: Add .aria-current to toplevel .brx-submenu-toggle
		if (submenu && submenu.querySelector('[aria-current="page"]')) {
			submenuToggle.classList.add('aria-current')
		}
	})
}

/**
 * Submenu position (re-run on window resize)
 *
 * Mega menu: Nav menu (Bricks template) & Dropdown.
 * Re-position submenu in case of viewport overflow.
 *
 * @param {number} timeout Timeout in ms before calculating submenu position.
 *
 * @since 1.8
 */
const bricksSubmenuPositionFn = new BricksFunction({
	parentNode: document,
	selector: '.brx-submenu-toggle',
	forceReinit: true,
	eachElement: (submenuToggle) => {
		let menuItem = submenuToggle.parentNode
		let submenu =
			menuItem.querySelector('.brx-megamenu') ||
			menuItem.querySelector('.brx-dropdown-content') ||
			menuItem.querySelector('ul')

		// Skip: Submenu not found (not rendered due to element condition)
		if (!submenu) {
			return
		}

		submenu.classList.add('brx-submenu-positioned')
		// Skip: Static submenu (e.g. Dropdown inside Offcanvas)
		if (menuItem.hasAttribute('data-static')) {
			return
		}

		let docWidth = document.body.clientWidth // document width without scrollbar

		// STEP: Mega menu
		let hasMegamenu = menuItem.classList.contains('brx-has-megamenu')

		if (hasMegamenu) {
			// Get mega menu settings
			let referenceNodeSelector = menuItem.dataset.megaMenu
			let verticalReferenceNodeSelector = menuItem.dataset.megaMenuVertical

			// Get reference node
			let referenceNode = document.body // Default: Cover entire body width
			if (referenceNodeSelector) {
				let customReferenceNode = document.querySelector(referenceNodeSelector)
				if (customReferenceNode) {
					referenceNode = customReferenceNode
				}
			}

			// Get node rects for calculation
			let menuItemRect = menuItem.getBoundingClientRect()
			let referenceNodeRect = referenceNode.getBoundingClientRect()

			// Set horizontal position and width
			submenu.style.left = `-${menuItemRect.left - referenceNodeRect.left}px`
			submenu.style.minWidth = `${referenceNodeRect.width}px`

			// Set vertical position (if selector was added and node exists)
			if (verticalReferenceNodeSelector) {
				let verticalReferenceNode = document.querySelector(verticalReferenceNodeSelector)
				if (verticalReferenceNode) {
					let verticalReferenceNodeRect = verticalReferenceNode.getBoundingClientRect()
					submenu.style.top = `${
						menuItemRect.height + verticalReferenceNodeRect.bottom - menuItemRect.bottom
					}px`
				}
			}

			// Dispatch custom event after repositioning the mega menu (@since 2.0)
			if (bricksIsFrontend) {
				document.dispatchEvent(
					new CustomEvent('bricks/megamenu/repositioned', {
						detail: {
							menuItem: menuItem,
							submenu: submenu
						}
					})
				)
			}
		}

		// STEP: Default submenu
		else {
			// Remove overflow class to reapply logic on window resize
			if (submenu.classList.contains('brx-multilevel-overflow-right')) {
				submenu.classList.remove('brx-multilevel-overflow-right')
			}

			if (submenu.classList.contains('brx-submenu-overflow-right')) {
				submenu.classList.remove('brx-submenu-overflow-right')
			}

			if (submenu.classList.contains('brx-sub-submenu-overflow-right')) {
				submenu.classList.remove('brx-sub-submenu-overflow-right')
			}

			// Check if submenu is nested inside another brx-dropdown
			let isToplevel =
				!menuItem.parentNode.closest('.menu-item') && !menuItem.parentNode.closest('.brxe-dropdown')

			// STEP: Re-position in case of viewport overflow
			let submenuRect = submenu.getBoundingClientRect()
			let submenuWidth = submenuRect.width
			let submenuRight = submenuRect.right
			let submenuLeft = Math.ceil(submenuRect.left)

			// STEP: Submenu wider than viewport: Set submenu to viewport width
			if (submenuWidth > docWidth) {
				submenu.style.left = `-${submenuLeft}px`
				submenu.style.minWidth = `${docWidth}px`
			}

			// STEP: Dropdown content overflows viewport to the right: Re-position to prevent horizontal scrollbar
			else if (submenuRight > docWidth) {
				let multilevel = submenu.closest('.brx-has-multilevel')

				// Top level of multilevel menu: Position all menus to the right
				if (multilevel) {
					submenu.classList.add('brx-multilevel-overflow-right')
				}

				// Default submenu
				else {
					if (isToplevel) {
						submenu.classList.add('brx-submenu-overflow-right')
					} else {
						submenu.classList.add('brx-sub-submenu-overflow-right')
					}
				}
			}

			// STEP: Dropdown content overflows viewport on the left
			else if (submenuLeft < 0) {
				submenu.style.left = !isToplevel ? '100%' : '0' // Position submenu to the right of the parent menu item (@since 2.0)
				submenu.style.right = 'auto'
			}
		}
	}
})

function bricksSubmenuPosition(timeout = 0) {
	setTimeout(() => {
		bricksSubmenuPositionFn.run()
	}, timeout)
}

/**
 * Handle submenu before position logic on window resize
 * - Save initial width and height by using requestAnimationFrame
 * - Only execute bricksSubmenuBeforePosition if actual resize is detected
 * @since 2.0
 */
function bricksSubmenuWindowResizeHandler() {
	let lastWidth, lastHeight, submenuTimeout

	/**
	 * Remove .brx-submenu-positioned class from submenu elements to apply display:none while resizing
	 * @since 1.12.2
	 */
	const bricksSubmenuBeforePosition = () => {
		let submenuToggles = bricksQuerySelectorAll(document, '.brx-submenu-toggle')

		submenuToggles.forEach((submenuToggle) => {
			let menuItem = submenuToggle.parentNode
			let submenu =
				menuItem.querySelector('.brx-megamenu') ||
				menuItem.querySelector('.brx-dropdown-content') ||
				menuItem.querySelector('ul')

			// Skip: Submenu not found (not rendered due to element condition)
			if (!submenu) {
				return
			}

			submenu.classList.remove('brx-submenu-positioned')
		})
	}

	// Resize event handler (Only execute logic on actual resize, ignore if only mobile address bar/height changes)
	const handleResize = () => {
		const currentWidth = window.innerWidth
		const currentHeight = window.innerHeight

		// Only recalculate if width changes
		if (currentWidth === lastWidth) {
			return
		}

		// Clear timeout
		clearTimeout(submenuTimeout)

		// Actual resize detected, execute logic to hide submenus while resizing
		bricksSubmenuBeforePosition()

		// Re-calculate left position on window resize with debounce (@since 1.8)
		submenuTimeout = setTimeout(bricksSubmenuPosition, 250)

		// Update stored dimensions
		lastWidth = currentWidth
		lastHeight = currentHeight
	}

	// Wait for stable viewport dimensions before starting to listen for resize events
	const waitForStableViewport = () => {
		let width = window.innerWidth
		let height = window.innerHeight

		requestAnimationFrame(() => {
			if (width === window.innerWidth && height === window.innerHeight) {
				// Viewport is stable, set the initial dimensions
				lastWidth = width
				lastHeight = height

				// Start listening for actual resize events
				window.addEventListener('resize', handleResize)
			} else {
				// Viewport is still changing, keep checking
				waitForStableViewport()
			}
		})
	}

	// Initial check
	waitForStableViewport()
}

/**
 * Multi level menu item: "Nav menu" OR "Dropdown" element
 *
 * Add 'back' text to multilevel submenus & click listeners.
 *
 * @since 1.8
 */
function bricksMultilevelMenu() {
	// STEP: Nav nested: Multilevel enabled
	let navNestedElements = bricksQuerySelectorAll(document, '.brxe-nav-nested.multilevel')

	navNestedElements.forEach((navNested) => {
		let backText = navNested.getAttribute('data-back-text')
		let dropdowns = navNested.querySelectorAll('.brxe-dropdown')

		dropdowns.forEach((dropdown) => {
			dropdown.classList.add('brx-has-multilevel')
			dropdown.setAttribute('data-toggle', 'click')
			dropdown.setAttribute('data-back-text', backText)
		})
	})

	// STEP: Create "back" HTML & listeners
	let multilevelItems = bricksQuerySelectorAll(document, '.brx-has-multilevel')

	multilevelItems.forEach((menuItem) => {
		let backText = menuItem.getAttribute('data-back-text') || 'Back'
		let submenus = bricksQuerySelectorAll(menuItem, 'ul')

		submenus.forEach((submenu, index) => {
			// Return on top level menu item
			if (index === 0) {
				return
			}

			// Add back list item as first submenu node: li > a.brx-multilevel-back
			let backLink = document.createElement('a')
			backLink.classList.add('brx-multilevel-back')
			backLink.setAttribute('href', '#')
			backLink.innerText = backText

			let backListItem = document.createElement('li')
			backListItem.classList.add('menu-item')
			backListItem.appendChild(backLink)

			submenu.insertBefore(backListItem, submenu.firstChild)

			// Listener to click on back link
			backLink.addEventListener('click', function (e) {
				e.preventDefault()

				// Hide current submenu
				let activeMenuItem = e.target.closest('.active')
				if (activeMenuItem) {
					activeMenuItem.classList.remove('open')
					activeMenuItem.classList.remove('active')

					// Set: aria-label="false"
					let submenuToggle = activeMenuItem.querySelector('.brx-submenu-toggle > button')
					if (submenuToggle) {
						submenuToggle.setAttribute('aria-expanded', false)
					}

					// Set parent menu item to active
					let parentMenuItem = activeMenuItem.parentNode.closest('.open')
					if (parentMenuItem) {
						parentMenuItem.classList.add('active')

						let parentSubmenu = parentMenuItem.querySelector('ul')
						if (parentSubmenu) {
							// Focus on first focusable element in parent menu item
							bricksFocusOnFirstFocusableElement(parentSubmenu)
						}
					}
				}
			})
		})
	})
}

/**
 * Nav menu: Open/close mobile menu
 *
 * Open/close: Click on mobile menu hamburger
 * Close: Click on mobile menu overlay OR press ESC key
 */
function bricksNavMenuMobile() {
	let toggles = bricksQuerySelectorAll(document, '.bricks-mobile-menu-toggle')

	if (!toggles.length) {
		return
	}

	// STEP: Observe mobile menu toggle via MutationObserver (.show-mobile-menu class)
	let navMenuObserver = new MutationObserver((mutations) => {
		// Set popup height to viewport height (@since 1.8.2)
		bricksSetVh()

		mutations.forEach((mutation) => {
			// Add/remove .no-scroll body class
			if (mutation.target.classList.contains('show-mobile-menu')) {
				document.body.classList.add('no-scroll')
			} else {
				document.body.classList.remove('no-scroll')
			}
		})
	})

	// STEP: Observe class list changes on .brxe-nav-nested
	toggles.forEach((toggle) => {
		let navMenu = toggle.closest('.brxe-nav-menu')
		navMenuObserver.observe(navMenu, {
			attributes: true,
			attributeFilter: ['class']
		})
	})

	let lastFocusedElement = null

	// STEP: Toggle mobile menu (click on hamburger)
	document.addEventListener('click', (e) => {
		let mobileMenuToggle = e.target.closest('.bricks-mobile-menu-toggle')

		if (mobileMenuToggle) {
			// Toggle mobile menu
			let navMenu = mobileMenuToggle.closest('.brxe-nav-menu')
			navMenu.classList.toggle('show-mobile-menu')

			// Toggle aria-expanded
			let expanded = navMenu.classList.contains('show-mobile-menu')
			let ariaLabel = expanded
				? window.bricksData.i18n.closeMobileMenu
				: window.bricksData.i18n.openMobileMenu
			mobileMenuToggle.setAttribute('aria-expanded', expanded)
			mobileMenuToggle.setAttribute('aria-label', ariaLabel)

			if (expanded) {
				lastFocusedElement = document.activeElement

				setTimeout(() => {
					let navMenuMobile = navMenu.querySelector('.bricks-mobile-menu-wrapper')

					// Auto-focus first focusable element in mobile menu
					bricksFocusOnFirstFocusableElement(navMenuMobile)

					// Trap focus inside mobile menu (@since 1.11)
					navMenuMobile.addEventListener('keydown', (event) =>
						bricksTrapFocus(event, navMenuMobile)
					)
				}, 100)
			} else {
				if (lastFocusedElement) {
					lastFocusedElement.focus()
				}
			}
		}
	})

	// STEP: Close mobile menu: Click on mobile menu overlay OR section anchor ID was clicked (e.g. #section)
	document.addEventListener('click', (e) => {
		let navMenu = e.target.closest('.brxe-nav-menu')

		if (!navMenu) {
			return
		}

		let mobileMenuToggle = navMenu.querySelector('.bricks-mobile-menu-toggle')

		// Click on overlay: Close mobile menu
		if (e.target.classList.contains('bricks-mobile-menu-overlay')) {
			navMenu.classList.remove('show-mobile-menu')

			// Toggle aria-expanded
			navMenu.querySelector('.bricks-mobile-menu-toggle').setAttribute('aria-expanded', false)
			mobileMenuToggle.setAttribute('aria-expanded', false)
			mobileMenuToggle.setAttribute('aria-label', window.bricksData.i18n.openMobileMenu)
		}

		// Click on anchor ID: Close mobile menu
		else if (e.target.closest('.bricks-mobile-menu-wrapper')) {
			let navLinkUrl = e.target.tagName === 'A' ? e.target.getAttribute('href') : ''

			// Close section link click (e.g.: #portfolio)
			if (navLinkUrl.length > 1 && navLinkUrl.includes('#')) {
				navMenu.classList.remove('show-mobile-menu')

				// Toggle aria-expanded
				mobileMenuToggle.setAttribute('aria-expanded', false)
				mobileMenuToggle.setAttribute('aria-label', window.bricksData.i18n.openMobileMenu)
			}
		}
	})

	// STEP: ESC key pressed: Close mobile menu & focus on mobile menu toggle button
	document.addEventListener('keyup', (e) => {
		if (e.key === 'Escape') {
			let openMobileMenu = document.querySelector('.brxe-nav-menu.show-mobile-menu')

			if (openMobileMenu) {
				openMobileMenu.classList.remove('show-mobile-menu')

				let toggle = openMobileMenu.querySelector('.bricks-mobile-menu-toggle')

				if (toggle) {
					toggle.setAttribute('aria-expanded', false)
					toggle.setAttribute('aria-label', window.bricksData.i18n.openMobileMenu)

					setTimeout(() => {
						toggle.focus()
					}, 10)
				}
			}
		}
	})
}

/**
 * Element: Back to top
 *
 * @since 1.11
 */
const bricksBackToTopFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-back-to-top',
	eachElement: (element) => {
		// Scroll to top on click
		element.addEventListener('click', function (e) {
			e.preventDefault()
			window.scrollTo({
				top: 0,
				behavior: element.hasAttribute('data-smooth-scroll') ? 'smooth' : 'auto'
			})
		})

		// Visibility on scroll
		let visibleAfter = element.dataset.visibleAfter || 0
		let visibleOnScrollUp = element.classList.contains('up')

		if (visibleAfter || visibleOnScrollUp) {
			let lastScrollTop = 0
			window.addEventListener('scroll', function () {
				let scrollTop = document.documentElement.scrollTop
				let visible = true

				// Only show on scroll up
				if (visibleOnScrollUp) {
					if (scrollTop > lastScrollTop) {
						visible = false
					} else {
						visible = true
					}

					lastScrollTop = scrollTop
				}

				// Visible after scrolling down ...px
				if (window.scrollY > visibleAfter && visible) {
					visible = true
				} else {
					visible = false
				}

				if (visible) {
					element.classList.add('visible')
				} else {
					element.classList.remove('visible')
				}
			})
		}
	}
})

function bricksBackToTop() {
	bricksBackToTopFn.run()
}

/**
 * Helper function to get all focusable elements to auto-focus on (accessibility)
 *
 * @since 1.8
 */
function bricksGetFocusables(node) {
	let focusableElements = node.querySelectorAll(
		'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
	)

	// Filter out elements with display: none
	return Array.prototype.filter.call(focusableElements, (element) => {
		// Element or parent element has "inert" attribute, skip it - it's not focusable (@since 1.11)
		if (element.hasAttribute('inert') || element.closest('[inert]')) {
			return false
		}

		return window.getComputedStyle(element).display !== 'none'
	})
}

/**
 * Get all focusable & visible elements within a node
 *
 * @since 1.11
 */
function bricksGetVisibleFocusables(node) {
	// Return all focusable & visible elements
	return bricksGetFocusables(node).filter((element) => {
		return element.offsetWidth > 0 || element.offsetHeight > 0
	})
}

/**
 * Pause audio/video when popup is closed
 *
 * bricksPauseMediaFn.run() pauses all audio & video.
 *
 * @since 1.8
 */
const bricksPauseMediaFn = new BricksFunction({
	parentNode: document,
	selector: 'video, audio, iframe[src*="youtube"], iframe[src*="vimeo"]',
	subscribeEvents: ['bricks/popup/close'],
	forceReinit: true,
	eachElement: (element) => {
		// STEP: Pause video or audio
		if (
			(element.tagName === 'VIDEO' || element.tagName === 'AUDIO') &&
			element.pause &&
			typeof element.pause === 'function'
		) {
			element.pause()
			// Continue next element
			return
		}

		// STEP: Pause YouTube or Vimeo video
		if (element.tagName === 'IFRAME') {
			let src = element.getAttribute('src')
			let isYoutube = src.includes('youtube')
			let isVimeo = src.includes('vimeo')
			let command = isYoutube
				? { event: 'command', func: 'pauseVideo', args: '' }
				: { method: 'pause' }

			if (isVimeo || isYoutube) {
				// Note that if the youtube video is not enableJSAPI, we can't pause it
				element.contentWindow.postMessage(JSON.stringify(command), '*')
				// Continue next element
				return
			}
		}
	},
	listenerHandler: (event) => {
		if (event?.type) {
			switch (event.type) {
				case 'bricks/popup/close':
					let popupElement = event?.detail?.popupElement
					if (popupElement) {
						bricksPauseMediaFn.run({ parentNode: popupElement })
					}
					break
			}
		}
	}
})

/**
 * Dynamically set active/inactive anchor link
 *
 * As we no longer set aria-current="page" attribute on anchor links, we need to set it dynamically on click and page load.
 *
 * @since 1.11
 */
const bricksAnchorLinksFn = new BricksFunction({
	parentNode: document,
	selector: 'a[data-brx-anchor][href*="#"]',
	frontEndOnly: true,
	eachElement: (anchor) => {
		const setLinkActive = (link, active = true) => {
			let isNavitem = link.closest('.menu-item') || false

			if (active) {
				// Add aria-current="page" attribute to the clicked anchor link
				link.setAttribute('aria-current', 'page')

				if (isNavitem) {
					// Add current-menu-item class to nav menu item
					link.closest('.menu-item').classList.add('current-menu-item')
				}
			} else {
				// Remove aria-current="page" attribute from anchor link
				link.removeAttribute('aria-current')

				if (isNavitem) {
					// Remove current-menu-item class from nav menu item
					link.closest('.menu-item').classList.remove('current-menu-item')
				}
			}
		}

		// Get current URL hash
		let currentURLHash = window.location.hash || false

		// Set active link on page load
		if (currentURLHash && currentURLHash.length > 1) {
			// Get anchor link hash
			let anchorLinkHash = anchor.getAttribute('href').split('#')[1] || false

			if (anchorLinkHash && anchorLinkHash === currentURLHash.substring(1)) {
				// STEP: Remove related active menu items or it will be multiple active items on page load when hash link exists (@since 1.12)
				let nearestNav = anchor.closest('.bricks-nav-menu, .brxe-nav-nested') || false
				if (nearestNav) {
					// Search all menu items inside the nav menu
					let navMenuItems = nearestNav.querySelectorAll('.menu-item')
					navMenuItems.forEach((item) => {
						// Search if any link has aria-current="page" attribute, exclude data-brx-anchor as it will be handled in another instance, otherwise only one link will be active on entire page
						let anchorLinks = item.querySelectorAll('a:not([data-brx-anchor])')

						// Remove all aria-current="page" attributes and it's current-menu-item class
						if (anchorLinks.length > 0) {
							item.classList.remove('current-menu-item')

							anchorLinks.forEach((link) => {
								link.removeAttribute('aria-current')
							})
						}
					})
				}

				// STEP: Set active link
				setLinkActive(anchor)
			}
		}

		// Dynamically set active link on click
		anchor.addEventListener('click', (e) => {
			// STEP: Remove related active menu items or it will be multiple active items when anchor link clicked (@since 1.12)
			let nearestNav = anchor.closest('.bricks-nav-menu, .brxe-nav-nested') || false
			if (nearestNav) {
				// Remove all current-menu-item classes from every nav menu item
				let navMenuItems = nearestNav.querySelectorAll('.menu-item')
				navMenuItems.forEach((item) => {
					item.classList.remove('current-menu-item')

					// Remove all aria-current="page" attributes from every anchor link inside the nav menu
					let anchorLinks = item.querySelectorAll('a[aria-current="page"]')
					anchorLinks.forEach((link) => {
						link.removeAttribute('aria-current')
					})
				})
			}

			// STEP: Set active link
			setLinkActive(anchor)
		})
	}
})

function bricksAnchorLinks() {
	bricksAnchorLinksFn.run()
}

/**
 * A Helper function to get query result by queryId (query element)
 *
 * @param {string} queryId Query element ID
 * @param {boolean} isPopState Flag: Popstate event (@since 1.11)
 * @param {boolean} nonceRefreshed Flag: Nonce refreshed (@since 1.11)
 */
function bricksGetQueryResult(queryId, isPopState = false, nonceRefreshed = false) {
	return new Promise(function (resolve, reject) {
		if (!queryId) {
			reject('No queryId provided')
			return
		}

		if (typeof window.bricksUtils.getFiltersForQuery !== 'function') {
			reject('Query filters JS not loaded')
			return
		}

		const queryInstance = window.bricksData.queryLoopInstances[queryId] || false

		if (!queryInstance) {
			reject('Query instance not found')
			return
		}

		if (!nonceRefreshed) {
			// Allow newer requests to abort older requests, example: search filter (@since 1.12)
			bricksUtils.maybeAbortXhr(queryId)
		}

		let url = window.bricksData.restApiUrl.concat('query_result')

		// Build allFilters array, no key is needed, just need each filter's ID
		let allFilters = window.bricksUtils.getFiltersForQuery(queryId, 'filterId')

		// Get selected filters for the query
		let selectedFilters = window.bricksUtils.getSelectedFiltersForQuery(queryId)
		// Get active filters tags for the query (@since 2.0)
		let afTags = window.bricksUtils.getDynamicTagsForParse(queryId)
		let originalQueryVars =
			queryInstance?.originalQueryVars === '[]'
				? queryInstance?.queryVars
				: queryInstance?.originalQueryVars
		let queryData = {
			postId: window.bricksData.postId,
			queryElementId: queryId,
			originalQueryVars: originalQueryVars, // for query filters retrieve original DD parsed query vars (@since 1.11.1)
			pageFilters: window.bricksData.pageFilters || false,
			filters: allFilters, // for dynamic filter update
			selectedFilters: selectedFilters, // for active filter update (@since 1.11)
			afTags: afTags, // for active filters tags update (@since 2.0)
			nonce: window.bricksData.nonce,
			baseUrl: window.bricksData.baseUrl,
			lang: window.bricksData.language || false,
			mainQueryId: window.bricksData.mainQueryId || false // Record the main query ID (@since 2.0)
		}

		// Add Get lang parameter for WPML if current url has lang parameter (@since 1.9.9)
		if (
			window.bricksData.multilangPlugin === 'wpml' &&
			(window.location.search.includes('lang=') || window.bricksData.wpmlUrlFormat != 3)
		) {
			// use window.bricksData.language to get the current language
			url = url.concat('?lang=' + window.bricksData.language)
		}

		// Flag: Query result is loading
		window.bricksData.queryLoopInstances[queryId].isLoading = 1

		/**
		 * Ajax start event - ajax loader purposes
		 * Do not dispatch if:
		 * - nonceRefreshed
		 * - older xhr aborted
		 */
		if (!nonceRefreshed && !window.bricksData.queryLoopInstances[queryId].xhrAborted) {
			document.dispatchEvent(
				new CustomEvent('bricks/ajax/start', {
					detail: { queryId: queryId, isPopState: isPopState }
				})
			)
		}

		// Make API call to get latest query result
		let xhr = new XMLHttpRequest()

		// Store xhr instance to abort if needed (@since 1.12)
		window.bricksData.queryLoopInstances[queryId].xhr = xhr

		xhr.open('POST', url, true)
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
		xhr.setRequestHeader('X-WP-Nonce', window.bricksData.wpRestNonce)

		// Successful response
		xhr.onreadystatechange = function () {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (window.bricksData.queryLoopInstances[queryId].xhr === xhr) {
					// Clear xhr instance
					window.bricksData.queryLoopInstances[queryId].xhr = null
					window.bricksData.queryLoopInstances[queryId].xhrAborted = false
				}

				let status = xhr.status
				let res
				try {
					res = JSON.parse(xhr.response)
				} catch (e) {
					reject('Invalid response from server')
					return
				}

				// Success
				if (status === 0 || (status >= 200 && status < 400)) {
					// Flag: Query result is loading
					window.bricksData.queryLoopInstances[queryId].isLoading = 0

					let error = res?.error || false

					if (error) {
						console.error('error: bricksGetQueryResult', error)
						reject(error)
					} else {
						// Resolve the promise with the response
						resolve(res)
					}

					// Ajax end event - ajax loader purposes
					document.dispatchEvent(
						new CustomEvent('bricks/ajax/end', { detail: { queryId: queryId } })
					)

					// Remove this logic or all URL params will be removed @since 1.11
					// update window.history.state back to original baseUrl
					// history.pushState('', document.title, window.bricksData.baseUrl)

					// Emit event
					document.dispatchEvent(
						new CustomEvent('bricks/ajax/query_result/completed', { detail: { queryId: queryId } })
					)
				} else if (res?.code === 'rest_cookie_invalid_nonce') {
					// Refresh nonce and retry if not already attempted
					if (!nonceRefreshed) {
						bricksRegenerateNonceAndRetryQuery(queryId).then(resolve).catch(reject)
					} else {
						reject('Nonce verification failed after refresh')
					}
				} else {
					reject(`Request failed with status ${status}`)
				}
			}
		}

		xhr.send(JSON.stringify(queryData))
	})
}

/**
 * Regenerate nonce and retry query
 *
 * @param {*} queryId
 * @since 1.11
 */
function bricksRegenerateNonceAndRetryQuery(queryId) {
	return new Promise((resolve, reject) => {
		let xhrNonce = new XMLHttpRequest()
		xhrNonce.open('POST', window.bricksData.ajaxUrl, true)
		xhrNonce.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

		xhrNonce.onreadystatechange = function () {
			if (xhrNonce.readyState === XMLHttpRequest.DONE) {
				if (xhrNonce.status >= 200 && xhrNonce.status < 400) {
					let response
					try {
						response = JSON.parse(xhrNonce.responseText)
					} catch (e) {
						reject('Invalid response from server when regenerating nonce')
						return
					}

					if (response.success && response.data) {
						window.bricksData.nonce = response.data.bricks_nonce
						window.bricksData.wpRestNonce = response.data.rest_nonce

						let isPopState = false
						let nonceRefreshed = true
						bricksGetQueryResult(queryId, isPopState, nonceRefreshed).then(resolve).catch(reject)
					} else {
						reject('Failed to regenerate nonces: Invalid response structure')
					}
				} else {
					reject('Failed to regenerate nonce')
				}
			}
		}

		xhrNonce.send('action=bricks_regenerate_query_nonce')
	})
}

function bricksDisplayQueryResult(targetQueryId, res) {
	const html = res?.html || false
	const styles = res?.styles || false
	const popups = res?.popups || false
	const updatedQuery = res?.updated_query || false
	const updatedFilters = res?.updated_filters || false
	const parsedAfTags = res?.parsed_af_tags || false // @since 2.0

	// Get query instance
	const queryInstance = window.bricksData.queryLoopInstances[targetQueryId] || false
	// Get query result container
	const resultsContainer = queryInstance?.resultsContainer || false

	if (!queryInstance || !resultsContainer) {
		return
	}

	const queryComponentId = queryInstance?.componentId || false
	const selectorId = queryComponentId ? queryComponentId : targetQueryId

	// Keep a copy of the bricks-gutter-sizer from the results container (posts element)
	const gutterSizer = resultsContainer.querySelector('.bricks-gutter-sizer')
	const isotopSizer = resultsContainer.querySelector('.bricks-isotope-sizer')

	const actualLoopDOM = resultsContainer.querySelectorAll(
		`.brxe-${targetQueryId}, .bricks-posts-nothing-found`
	)

	// Find the HTML comment <!--brx-loop-start-QUERYID-->
	const loopStartComment = document
		.createNodeIterator(resultsContainer, NodeFilter.SHOW_COMMENT, {
			acceptNode: function (node) {
				return node.nodeValue === `brx-loop-start-${targetQueryId}`
			}
		})
		.nextNode()

	const hasOldResults = actualLoopDOM.length > 0 || loopStartComment

	if (hasOldResults) {
		/**
		 * - Remove all brxe-<targetQueryId> nodes, and .bricks-posts-nothing-found div from the results container
		 */

		resultsContainer
			.querySelectorAll(`.brxe-${selectorId}, .bricks-posts-nothing-found`)
			.forEach((el) => el.remove())
	}

	if (html) {
		// Add new HTML inside the queryParentElement
		if (hasOldResults) {
			// Find the HTML comment <!--brx-loop-start-QUERYID--> and insert the HTML string right after it
			if (loopStartComment) {
				// Check if the first HTML tag is a <td> or <tr>
				const firstTag = html.match(/<\s*([a-z0-9]+)([^>]+)?>/i)
				let tempDiv = null

				// Special case for <td> and <tr> tags
				if (firstTag && (firstTag[1] === 'td' || firstTag[1] === 'tr')) {
					tempDiv = document.createElement('tbody')
				} else {
					tempDiv = document.createElement('div')
				}

				// Insert the HTML string inside the temp div (Browser will parse the HTML string to DOM nodes and auto correct any invalid HTML tags)
				tempDiv.innerHTML = html

				// Get the child nodes of the temp div
				let newNodes = Array.from(tempDiv.childNodes)

				//reverse the array to insert the nodes in the correct order
				newNodes.reverse()

				newNodes.forEach((node) => {
					if (loopStartComment.nextSibling) {
						loopStartComment.parentNode?.insertBefore(node, loopStartComment.nextSibling)
					} else {
						loopStartComment.parentNode?.appendChild(node)
					}
				})
				// Remove the temp div
				tempDiv.remove()
			}
		} else {
			resultsContainer.insertAdjacentHTML('beforeend', html)
		}
	}

	// Restore the bricks-gutter-sizer
	if (gutterSizer) {
		resultsContainer.appendChild(gutterSizer)
	}

	// Restore the bricks-isotope-sizer
	if (isotopSizer) {
		resultsContainer.appendChild(isotopSizer)
	}

	// Remove old query looping popup elements
	const oldLoopPopupNodes = document.querySelectorAll(
		`.brx-popup[data-popup-loop="${targetQueryId}"]`
	)
	oldLoopPopupNodes.forEach((el) => el.remove())

	if (popups) {
		// Add popups HTML at the end of the body
		document.body.insertAdjacentHTML('beforeend', popups)
	}

	// Emit bricks/ajax/nodes_added (@since 1.11.1), move after popups added
	document.dispatchEvent(
		new CustomEvent('bricks/ajax/nodes_added', { detail: { queryId: targetQueryId } })
	)

	if (styles) {
		// Create a style element if not exists
		let styleElement = document.querySelector(`#brx-query-styles-${targetQueryId}`)

		if (!styleElement) {
			styleElement = document.createElement('style')
			styleElement.id = `brx-query-styles-${targetQueryId}`
			// Add style element to footer
			document.body.appendChild(styleElement)
		}

		// Add styles to the style element
		styleElement.innerHTML = styles
	}

	// (@since 1.12.2)
	if (updatedQuery) {
		bricksUtils.updateQueryResultStats(targetQueryId, 'query', updatedQuery)
	}

	/**
	 * STEP: Replace any existing span[data-brx-af-count] innerHTML with the updated count
	 *
	 * {active_filters_count} DD
	 * @since 2.0
	 */
	if (parsedAfTags) {
		window.bricksUtils.updateParsedDynamicTags(targetQueryId, parsedAfTags)
	}

	/**
	 * STEP: Update queryInstance page and maxPage
	 */
	if (updatedQuery?.query_vars?.paged !== undefined) {
		window.bricksData.queryLoopInstances[targetQueryId].page = parseInt(
			updatedQuery.query_vars.paged
		)
	}

	if (updatedQuery?.max_num_pages !== undefined) {
		window.bricksData.queryLoopInstances[targetQueryId].maxPages = parseInt(
			updatedQuery.max_num_pages
		)
	}

	if (updatedQuery?.start !== undefined) {
		window.bricksData.queryLoopInstances[targetQueryId].start = parseInt(updatedQuery.start)
	}

	if (updatedQuery?.end !== undefined) {
		window.bricksData.queryLoopInstances[targetQueryId].end = parseInt(updatedQuery.end)
	}

	/**
	 * STEP: Update filterInstance elements
	 */
	if (updatedFilters) {
		for (let filterId in updatedFilters) {
			const filterHtml = updatedFilters[filterId]
			const filterInstance = window.bricksData.filterInstances[filterId] || false

			if (!filterInstance) {
				continue
			}

			// Search filter type: Skip or current focus cursor will be lost
			if (filterInstance.filterType === 'search') {
				continue
			}

			// Create a dummy div and hold the new filter HTML
			const dummyDiv = document.createElement('div')
			dummyDiv.innerHTML = filterHtml
			const newFilterElement = dummyDiv.childNodes[0]

			// Replace the old filter element with the new one
			filterInstance.filterElement.replaceWith(newFilterElement)

			// Update the filterInstance filterElement
			filterInstance.filterElement = newFilterElement

			// Remove dummy div
			dummyDiv.remove()
		}
	}

	/**
	 * STEP: Show or hide Load more buttons
	 */
	bricksUtils.hideOrShowLoadMoreButtons(targetQueryId)

	// Emit event
	document.dispatchEvent(
		new CustomEvent('bricks/ajax/query_result/displayed', { detail: { queryId: targetQueryId } })
	)

	// Infinite scroll
	if (queryInstance.infiniteScroll) {
		setTimeout(() => {
			let newQueryTrail = Array.from(
				queryInstance.resultsContainer?.querySelectorAll(`.brxe-${selectorId}:not(.brx-popup)`)
			).pop()

			if (!newQueryTrail) {
				return
			}

			newQueryTrail.dataset.queryElementId = targetQueryId

			// Check if the query trail is still visible, if yes, triggers the next page
			if (BricksIsInViewport(newQueryTrail)) {
				bricksQueryLoadPage(newQueryTrail)
			}

			// Add a new observer
			else {
				new BricksIntersect({
					element: newQueryTrail,
					callback: (newQueryTrail) => bricksQueryLoadPage(newQueryTrail),
					once: true,
					rootMargin: queryInstance.observerMargin
				})
			}
		}, 250)
	}
}

/**
 * Convert YouTube video URL to the embed URL, and also return video ID
 *
 * @param {string} url YouTube video URL
 *
 * @return {Object} Object containing embed URL and video ID
 *
 * @since 2.0
 */
function bricksGetYouTubeVideoLinkData(url) {
	if (!url) {
		return {
			url: '',
			id: null
		}
	}
	const youtubeRegex =
		/(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|shorts\/|live\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i
	const match = url.match(youtubeRegex)

	if (match && match[1]) {
		const videoId = match[1]

		// Create embed URL with video ID
		const embedUrl = `https://www.youtube.com/embed/${videoId}`
		return {
			url: embedUrl,
			id: videoId
		}
	}

	// If no match, return the original URL
	return {
		url,
		id: null
	}
}

/**
 * Set viewport height CSS variable: --bricks-vh
 *
 * Used in popup to cover viewport correctly on mobile devices.
 *
 * @since 1.8.2
 */
function bricksSetVh() {
	const vh = window.innerHeight * 0.01

	// Set var on documentElement (<html>)
	document.documentElement.style.setProperty('--bricks-vh', `${vh}px`)
}

/**
 * Helper function to run all BricksFunctions
 *
 * @since 1.11
 */
function bricksRunAllFunctions() {
	if (!window.bricksFunctions) {
		return
	}

	window.bricksFunctions.forEach((fn) => {
		if (fn.run && typeof fn.run === 'function') {
			fn.run()
		}
	})
}

/**
 * Enqueue custom scripts
 */
let bricksIsFrontend
let bricksTimeouts = {}

document.addEventListener('DOMContentLoaded', (event) => {
	bricksIsFrontend = document.body.classList.contains('bricks-is-frontend')

	// Nav menu & Dropdown (@since 1.8)
	bricksNavMenu()
	bricksMultilevelMenu()
	bricksNavMenuMobile()

	bricksStickyHeader()
	bricksOnePageNavigation()
	bricksSkipLinks()
	bricksFacebookSDK()
	bricksSearchToggle()
	bricksPopups()

	bricksSwiper() // Sequence matters: before bricksSplide()
	bricksSplide() // Sequence matters: after bricksSwiper()

	// Run after bricksSwiper() & bricksSplide() as those need to generate required duplicate nodes first
	bricksPhotoswipe()

	bricksPrettify()
	bricksAccordion()
	bricksAnimatedTyping()
	bricksAudio()
	bricksCountdown()
	bricksCounter()
	bricksTableOfContents()
	bricksPricingTables()
	bricksVideo()
	bricksLazyLoad()
	bricksAnimation()
	bricksPieChart()
	bricksPostReadingProgressBar()
	bricksProgressBar()
	bricksForm()
	bricksInitQueryLoopInstances()
	bricksQueryPagination()
	bricksInteractions()
	bricksAlertDismiss()
	bricksTabs()
	bricksVideoOverlayClickDetector()
	bricksBackgroundVideoInit()
	bricksPostReadingTime()
	bricksBackToTop() // @since 1.11

	bricksNavNested()
	bricksOffcanvas()
	bricksToggle()

	// After bricksNavNested() ran (added .brx-has-multilevel)
	bricksSubmenuListeners()
	bricksSubmenuPosition(250)

	bricksAjaxLoader()

	bricksAnchorLinks() // @since 1.11

	// Run last to make sure all elements are loaded
	bricksIsotope()
	bricksIsotopeListeners()

	// Handle submenu before position logic (@since 2.0)
	window.addEventListener('load', bricksSubmenuWindowResizeHandler)

	/**
	 * Debounce
	 *
	 * Use timeout object to allow for individual clearTimeout() calls.
	 *
	 * @since 1.8
	 */
	window.addEventListener('resize', () => {
		Object.keys(bricksTimeouts).forEach((key) => {
			clearTimeout(bricksTimeouts[key])
		})

		// Frontend: 1vh calculation based on window.innerHeight (for mobile devices)
		if (bricksIsFrontend) {
			bricksTimeouts.bricksVh = setTimeout(bricksSetVh, 250)
		}

		// Builder: Re-init swiperJS on window resize for switching between breakpoints, etc.
		else {
			bricksTimeouts.bricksSwiper = setTimeout(bricksSwiper, 250)
			bricksTimeouts.bricksSplide = setTimeout(bricksSplide, 250)
		}

		// Re-calculate left position on window resize with debounce (@since 1.8) Moved to bricksSubmenuWindowResizeHandler()
		// bricksTimeouts.bricksSubmenuPosition = setTimeout(bricksSubmenuPosition, 250)

		// Set mobile menu open toggle parent div display according to toggle display
		bricksTimeouts.bricksToggleDisplay = setTimeout(bricksToggleDisplay, 100)

		// Close nav menu mobile menu on resize
		bricksTimeouts.bricksNavMenuMobileToggleDisplay = setTimeout(
			bricksNavMenuMobileToggleDisplay,
			100
		)
	})

	/**
	 * Separate event registration from bricksInteractionsFn
	 *
	 * 100ms timeout to ensure bricksInteractionsFn has been initialized & set window.bricksData.interactions
	 *
	 * @since 1.8
	 */
	setTimeout(() => {
		let interactions = Array.isArray(window.bricksData?.interactions)
			? window.bricksData.interactions
			: []

		// Scroll interaction(s) found: Listen to scroll event
		if (interactions.find((interaction) => interaction?.trigger === 'scroll')) {
			document.addEventListener('scroll', bricksScrollInteractions)
		}
	}, 100)
})
