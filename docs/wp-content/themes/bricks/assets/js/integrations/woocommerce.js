function bricksShowNotice(message) {
	// Find the notice wrapper .brxe-woocommerce-notice
	const $noticeWrapper = jQuery('.brxe-woocommerce-notice')

	if ($noticeWrapper.length > 0) {
		// Found Bricks WC notice wrapper, use it to display the error message
		$noticeWrapper.html(message)
	} else {
		// Use the default WooCommerce notice wrapper
		jQuery('.woocommerce-NoticeGroup-checkout, .woocommerce-error, .woocommerce-message').remove()
		jQuery('form.woocommerce-checkout ').prepend(
			'<div class="woocommerce-NoticeGroup woocommerce-NoticeGroup-checkout">' + message + '</div>'
		)
	}
}

function bricksScrollToNotices() {
	// Include Bricks WC notice wrapper
	const scrollElement = jQuery(
		'.woocommerce-NoticeGroup-updateOrderReview, .woocommerce-NoticeGroup-checkout, .brxe-woocommerce-notice'
	)

	if (!scrollElement.length) {
		scrollElement = jQuery('form.checkout')
	}

	jQuery.scroll_to_notices(scrollElement)
}

/**
 * Mini cart: Refresh cart fragments in builder
 */
function bricksWooRefreshCartFragments() {
	if (typeof woocommerce_params == 'undefined') {
		return
	}

	// TODO: PayPal SDK generates console error in builder when mini cart is used in header

	var url = woocommerce_params.wc_ajax_url
	url = url.replace('%%endpoint%%', 'get_refreshed_fragments')

	jQuery.post(url, function (data, status) {
		if (data.fragments) {
			bricksWooReplaceFragments(data.fragments)
		}

		jQuery('body').trigger('wc_fragments_refreshed')
	})
}

function bricksWooReplaceFragments(fragments) {
	if (fragments) {
		jQuery.each(fragments, function (key, value) {
			var fragment = jQuery(key)

			if (fragment) {
				fragment.replaceWith(value)
			}
		})
	}
}

/**
 * Hide mini cart on click outside of mini cart details
 *
 * @since 1.3.1
 */
function bricksWooMiniCartHideDetailsClickOutside() {
	// @since 1.7.1 - Close mini cart detail function
	const closeMiniCartDetail = (miniCartDetail) => {
		// Ensure this is a mini cart detail
		if (!miniCartDetail.classList.contains('cart-detail')) {
			return
		}

		miniCartDetail.classList.remove('active')
		const miniCartEl = miniCartDetail.closest('.brxe-woocommerce-mini-cart')

		if (miniCartEl) {
			miniCartEl.classList.toggle('show-cart-details')
		}
	}

	const miniCartDetails = bricksQuerySelectorAll(document, '.cart-detail')

	if (miniCartDetails) {
		miniCartDetails.forEach(function (element) {
			// skip click outside event if set by user (@since 1.9.4)
			if (element.dataset?.skipClickOutside) {
				return
			}

			document.addEventListener('click', function (event) {
				if (
					!event.target.closest('.mini-cart-link') &&
					element.classList.contains('active') &&
					!event.target.closest('.cart-detail')
				) {
					closeMiniCartDetail(element)
				}
			})
		})
	}

	const miniCartCloseButtons = bricksQuerySelectorAll(
		document,
		'.cart-detail .bricks-mini-cart-close'
	)

	if (miniCartCloseButtons) {
		miniCartCloseButtons.forEach(function (element) {
			element.addEventListener('click', function (event) {
				event.preventDefault()

				const miniCartDetail = event.target.closest('.cart-detail')

				if (miniCartDetail) {
					closeMiniCartDetail(miniCartDetail)
				}
			})
		})
	}
}

/**
 * Used to open/close mini cart (and account modal)
 */
function bricksWooMiniModalsToggle(event) {
	event.preventDefault()

	var target = event.currentTarget
	var modalString = target.getAttribute('data-toggle-target')

	if (!modalString) {
		return
	}

	// Remove class from other modals
	var toggles = document.querySelectorAll('.bricks-woo-toggle')

	toggles.forEach(function (toggle) {
		var thisModal = toggle.getAttribute('data-toggle-target')

		if (thisModal !== modalString) {
			var elModal = toggle.querySelector(thisModal)

			if (elModal !== null && elModal.classList.contains('active')) {
				elModal.classList.remove('active')

				var miniCartEl = toggle.closest('.brxe-woocommerce-mini-cart')

				if (miniCartEl) {
					miniCartEl.classList.remove('show-cart-details')
				}
			}
		}
	})

	// Toggle main modal
	var modalEl = document.querySelector(modalString)

	if (modalEl) {
		modalEl.classList.toggle('active')

		var miniCartEl = modalEl.closest('.brxe-woocommerce-mini-cart')

		if (miniCartEl) {
			miniCartEl.classList.toggle('show-cart-details')
		}
	}
}

/**
 * Re-init WooCommerce product gallery in builder
 */
function bricksWooProductGallery() {
	if (bricksIsFrontend || typeof jQuery(this).wc_product_gallery === 'undefined') {
		return
	}

	jQuery('.woocommerce-product-gallery').each(function () {
		jQuery(this).trigger('wc-product-gallery-before-init', [this, window.wc_single_product_params])
		jQuery(this).wc_product_gallery(window.wc_single_product_params)
		jQuery(this).trigger('wc-product-gallery-after-init', [this, window.wc_single_product_params])
	})
}

/**
 * Re-init WooCommerce product gallery if it's fetched via AJAX
 * No need to trigger on document ready, as it's already init by WooCommerce.
 *
 * @since 1.10.2
 */
const bricksWooProductGalleryFn = new BricksFunction({
	parentNode: document,
	selector: '.woocommerce-product-gallery',
	frontEndOnly: true,
	eachElement: (gallery) => {
		if (typeof jQuery(window).wc_product_gallery === 'undefined') {
			return
		}

		jQuery(gallery).trigger('wc-product-gallery-before-init', [
			gallery,
			window.wc_single_product_params
		])
		jQuery(gallery).wc_product_gallery(window.wc_single_product_params)
		jQuery(gallery).trigger('wc-product-gallery-after-init', [
			gallery,
			window.wc_single_product_params
		])
	}
})

/**
 * Re-init WooCommerce variation form if Add To Cart button is fetched via AJAX (Product Quick View)
 * No need to trigger on document ready, as it's already init by WooCommerce.
 *
 * @since 1.10.2
 */
const bricksWooVariationFormFn = new BricksFunction({
	parentNode: document,
	selector: '.product form.variations_form',
	frontEndOnly: true,
	eachElement: (form) => {
		if (typeof jQuery(window).wc_variation_form === 'undefined') {
			return
		}

		jQuery(form).wc_variation_form()
	}
})

/**
 * Re-init WooCommerce product tabs, rating if fetched via AJAX
 * No need to trigger on document ready, as it's already init by WooCommerce.
 *
 * @since 1.10.2
 */
const bricksWooTabsRatingFn = new BricksFunction({
	parentNode: document,
	selector: '.wc-tabs-wrapper, .woocommerce-tabs, #rating',
	frontEndOnly: true,
	eachElement: (element) => {
		jQuery(element).trigger('init')
	}
})

/**
 * Re-init WooCommerce product reviews element star rating in builder
 *
 * @see /woocommerce/assets/js/frontend/single-product.js
 *
 * @since 1.9.2
 */
function bricksWooStarRating() {
	if (bricksIsFrontend) {
		return
	}

	jQuery('.brxe-product-reviews #rating').each(function () {
		// Hide the default select field
		jQuery(this).hide()

		// Add stars if not already added
		if (jQuery(this).closest('.brxe-product-reviews').find('p.stars').length === 0) {
			jQuery(this).before(
				'<p class="stars">\
						<span>\
							<a class="star-1" href="#">1</a>\
							<a class="star-2" href="#">2</a>\
							<a class="star-3" href="#">3</a>\
							<a class="star-4" href="#">4</a>\
							<a class="star-5" href="#">5</a>\
						</span>\
					</p>'
			)
		}
	})
}

/**
 * WooCommerce product gallery: Thumbnail slider
 *
 * @since 1.9
 */
function bricksWooProductGalleryEnhance() {
	// Return: Not the single product page or flexslider is not loaded
	if (
		typeof window.wc_single_product_params == 'undefined' ||
		typeof jQuery.fn.flexslider == 'undefined'
	) {
		return
	}

	// Listen to wc-product-gallery-after-init event
	jQuery(document.body).on('wc-product-gallery-after-init', function (event) {
		jQuery('.brx-product-gallery-thumbnail-slider').each(function () {
			let settings = jQuery(this).data('thumbnail-settings')
			if (settings) {
				jQuery(this).flexslider(settings)
				// Set opacity to 1 after flexslider is loaded
				jQuery(this).css('opacity', 1)
			}
		})
	})

	// This is to solve that sometimes the first image does not auto-navigate to the first slide when variation is changed
	jQuery(document.body).on('woocommerce_gallery_init_zoom', function (event) {
		jQuery('.brx-product-gallery-thumbnail-slider').each(function () {
			let flexData = jQuery(this).data('flexslider')
			if (flexData) {
				if (flexData.currentItem === 0 && flexData.currentSlide !== 0) {
					jQuery(this).flexslider(0)
				}
			}
		})
	})

	/**
	 * Thumbnail slider enabled: Update the main image on variation change
	 *
	 * @since 1.10.2
	 */

	// List of attributes that we can update [originalAttribute, variantAttribute]
	const attributeList = [
		['width', 'thumb_src_w'],
		['height', 'thumb_src_h'],
		['src', 'thumb_src'],
		['alt', 'alt'],
		['title', 'title'],
		['data-caption', 'caption'],
		['data-large_image', 'full_src'],
		['data-large_image_width', 'full_src_w'],
		['data-large_image_height', 'full_src_h'],
		['sizes', 'sizes'],
		['srcset', 'srcset']
	]

	jQuery(document.body).on('show_variation', function (event, variation) {
		let event_variation_id = variation?.variation_id || 0
		if (!event_variation_id) {
			return
		}

		jQuery('.brx-product-gallery-thumbnail-slider').each(function () {
			let sliderVariationIds = jQuery(this).data('variation-ids') || []

			// If the variation ID is not in the slider variation IDs, return (@since 1.11)
			if (!sliderVariationIds.includes(event_variation_id)) {
				return
			}

			let flexData = jQuery(this).data('flexslider')

			if (flexData) {
				const firstSlide = flexData.slides[0]

				const firstSlideLink = firstSlide.querySelector('a')
				const firstSlideImage = firstSlide.querySelector('img')

				// If we don't have a link or image, return
				if (!firstSlideLink || !firstSlideImage) {
					return
				}

				// If we don't have an image, return
				// Should not happen, but just in case
				if (!variation?.image) {
					return
				}

				// Update link href and save original href
				if (!firstSlideLink.hasAttribute('o_href')) {
					firstSlideLink.setAttribute('o_href', firstSlideLink.href)
				}
				firstSlideLink.setAttribute('href', variation.image.full_src)

				// Update image attributes and save original attributes
				attributeList.forEach((attribute) => {
					const [originalAttribute, variantAttribute] = attribute

					// If we don't have the attribute, return
					if (!firstSlideImage.hasAttribute(originalAttribute)) {
						return
					}

					// Save atributte if not already saved
					if (!firstSlideImage.hasAttribute('o_' + originalAttribute)) {
						firstSlideImage.setAttribute(
							'o_' + originalAttribute,
							firstSlideImage.getAttribute(originalAttribute)
						)
					}

					// Get attribute from variant and update
					const variantValue = variation?.image[variantAttribute]

					if (variantValue !== undefined) {
						firstSlideImage.setAttribute(originalAttribute, variantValue)
					}
				})

				jQuery(this).flexslider(0)
			}
		})
	})

	jQuery(document.body).on('reset_image', function () {
		jQuery('.brx-product-gallery-thumbnail-slider').each(function () {
			let flexData = jQuery(this).data('flexslider')
			if (flexData) {
				const firstSlide = flexData.slides[0]

				const firstSlideLink = firstSlide.querySelector('a')
				const firstSlideImage = firstSlide.querySelector('img')

				// If we don't have a link or image, return
				if (!firstSlideLink || !firstSlideImage) {
					return
				}

				// Reset link href
				if (firstSlideLink.hasAttribute('o_href')) {
					firstSlideLink.setAttribute('href', firstSlideLink.getAttribute('o_href'))
				}

				// Reset image attributes
				attributeList.forEach((attribute) => {
					const [originalAttribute] = attribute

					// If we don't have the attribute, return
					if (!firstSlideImage.hasAttribute('o_' + originalAttribute)) {
						return
					}

					// Reset attribute
					firstSlideImage.setAttribute(
						originalAttribute,
						firstSlideImage.getAttribute('o_' + originalAttribute)
					)
				})

				// Move to first slide
				jQuery(this).flexslider(0)
			}
		})
	})

	/**
	 * Observer, that will resize gallery when it's intersecting
	 *
	 * Fixes issue with gallery not resizing properly, if hidden by default.
	 *
	 * Example: Inside nested tabs, accordion, etc.
	 *
	 * @since 1.12.2
	 */
	const imageGalleryObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			// Skip, if not intersecting
			if (!entry.isIntersecting) return

			// Resize the gallery
			jQuery(entry.target).resize()

			// Unobserve, as we only need to resize once (performance)
			imageGalleryObserver.unobserve(entry.target)
		})
	})

	// Observe all galleries and thumbnail sliders (@since 1.12.2)
	jQuery('.woocommerce-product-gallery, .brx-product-gallery-thumbnail-slider').each(function () {
		imageGalleryObserver.observe(this)
	})
}

/**
 * Cart quantity up/down
 *
 * Use BricksFunction @since 1.9.2
 */
const bricksWooQuantityTriggersFn = new BricksFunction({
	parentNode: document,
	selector: 'form .quantity .action',
	subscribejQueryEvents: ['updated_cart_totals'],
	eachElement: (button) => {
		button.addEventListener('click', function (e) {
			e.preventDefault()

			// Only update cart if quantity input is not readonly (@since 1.7)
			var quantityInput = e.target.closest('.quantity').querySelector('.qty:not([readonly])')

			if (!quantityInput) {
				return
			}

			var updateCartButton = document.querySelector('button[name="update_cart"]')

			if (updateCartButton) {
				updateCartButton.removeAttribute('disabled')
				updateCartButton.setAttribute('aria-disabled', 'false')
			}

			if (e.target.classList.contains('plus')) {
				quantityInput.stepUp()
			} else if (e.target.classList.contains('minus')) {
				quantityInput.stepDown()
			}

			// Trigger change event for product quantity input (@since 1.7)
			const quantityInputEvent = new Event('change', { bubbles: true })
			quantityInput.dispatchEvent(quantityInputEvent)
		})
	}
})

function bricksWooProductsFilter() {
	var filters = bricksQuerySelectorAll(document, '.brxe-woocommerce-products-filter .filter-item')

	filters.forEach(function (filter) {
		function triggerFormSubmit(event) {
			event.target.closest('form').submit()
		}

		function toggleFilter(event) {
			var parentEl = event.target.closest('.filter-item')
			parentEl.classList.toggle('open')
		}

		var dropdowns = bricksQuerySelectorAll(filter, '.dropdown')
		dropdowns.forEach(function (dropdown) {
			dropdown.addEventListener('change', triggerFormSubmit)
		})

		var inputs = bricksQuerySelectorAll(filter, 'input[type="radio"], input[type="checkbox"]')
		inputs.forEach(function (input) {
			input.addEventListener('change', triggerFormSubmit)
			input.addEventListener('click', triggerFormSubmit)
		})

		var sliders = bricksQuerySelectorAll(filter, '.double-slider-wrap')
		sliders.forEach(function (slider) {
			bricksWooProductsFilterInitSlider(slider)
		})

		var toggles = bricksQuerySelectorAll(filter, '.title')
		toggles.forEach(function (toggle) {
			toggle.onclick = toggleFilter
		})
	})
}

/**
 * Init any WooCommerce mini modals (mini-cart)
 */
function bricksWooMiniModals() {
	var toggles = document.querySelectorAll('.bricks-woo-toggle')
	toggles.forEach(function (toggle) {
		toggle.addEventListener('click', bricksWooMiniModalsToggle)

		// Open on woo added_to_cart
		if (toggle.hasAttribute('data-open-on-add-to-cart')) {
			jQuery(document.body).on('added_to_cart', function (event, fragments, cart_hash, $button) {
				toggle.click()
			})
		}
	})
}

/**
 * Double Range Slider (to set min & max values)
 */
function bricksWooProductsFilterInitSlider(slider) {
	var lowerSlider = slider.querySelector('input.lower')
	var upperSlider = slider.querySelector('input.upper')

	lowerSlider.oninput = bricksWooProductsFilterUpdateSliderValue
	upperSlider.oninput = bricksWooProductsFilterUpdateSliderValue

	var lowerVal = parseInt(lowerSlider.value)
	var upperVal = parseInt(upperSlider.value)

	bricksWooProductsFilterRenderSliderValues(lowerSlider.parentNode, lowerVal, upperVal)

	// Submit form after range input change (= mouseup)
	lowerSlider.addEventListener('change', function () {
		slider.closest('form').submit()
	})

	upperSlider.addEventListener('change', function () {
		slider.closest('form').submit()
	})
}

function bricksWooProductsFilterUpdateSliderValue(event) {
	var parentEl = event.target.parentNode
	var lowerSlider = parentEl.querySelector('input.lower')
	var upperSlider = parentEl.querySelector('input.upper')
	var lowerVal = parseInt(lowerSlider.value)
	var upperVal = parseInt(upperSlider.value)

	if (upperVal < lowerVal + 4) {
		lowerSlider.value = upperVal - 4
		upperSlider.value = lowerVal + 4

		if (lowerVal == lowerSlider.min) {
			upperSlider.value = 4
		}
		if (upperVal == upperSlider.max) {
			lowerSlider.value = parseInt(upperSlider.max) - 4
		}
	}

	bricksWooProductsFilterRenderSliderValues(parentEl, lowerVal, upperVal)
}

function bricksWooProductsFilterRenderSliderValues(parentEl, lowerVal, upperVal) {
	var currency = parentEl.getAttribute('data-currency')
	var labelLower = parentEl.querySelector('label.lower')
	var labelUpper = parentEl.querySelector('label.upper')
	var valueLower = parentEl.querySelector('.value.lower')
	var valueUpper = parentEl.querySelector('.value.upper')

	// Parse currency data from data-currency attribute (@since 1.10)
	const currencyData = JSON.parse(currency)

	// Properly format currency symbol
	let currencySymbolLower = currencyData.symbol
	let currencySymbolUpper = currencyData.symbol

	switch (currencyData.position) {
		case 'left':
			currencySymbolLower = currencyData.symbol + lowerVal
			currencySymbolUpper = currencyData.symbol + upperVal
			break
		case 'right':
			currencySymbolLower = lowerVal + currencyData.symbol
			currencySymbolUpper = upperVal + currencyData.symbol
			break
		case 'leftSpace':
			currencySymbolLower = currencyData.symbol + ' ' + lowerVal
			currencySymbolUpper = currencyData.symbol + ' ' + upperVal
			break
		case 'rightSpace':
			currencySymbolLower = lowerVal + ' ' + currencyData.symbol
			currencySymbolUpper = upperVal + ' ' + currencyData.symbol
			break
	}

	valueLower.innerText = labelLower.innerText + ': ' + currencySymbolLower
	valueUpper.innerText = labelUpper.innerText + ': ' + currencySymbolUpper
}

/**
 * AJAX add to cart click handler
 * - Add event listener for clicking add to cart
 * - Actual function refer to bricksWooAddToCart()
 *
 * Use BricksFunction class and separate from bricksWooAjaxAddToCartText() (@since 1.9.2)
 *
 * @since 1.9.2
 */
const bricksWooAjaxAddToCartFn = new BricksFunction({
	parentNode: document,
	selector: '.single_add_to_cart_button, .brx_ajax_add_to_cart',
	windowVariableCheck: ['bricksWooCommerce.ajaxAddToCartEnabled'],
	eachElement: (addToCartButton) => {
		// Add event listeners for clicking add to cart
		addToCartButton.addEventListener('click', function (event) {
			event.preventDefault()
			if (addToCartButton.classList.contains('disabled')) {
				return
			}

			// Get type of add to cart button (@since 1.9)
			const type = addToCartButton.classList.contains('single_add_to_cart_button')
				? 'single'
				: 'loop'

			const addToCartElement =
				type === 'single' ? addToCartButton.closest('form.cart') : addToCartButton

			if (type === 'single') {
				/**
				 * Follow external product link instead of AJAX add to cart
				 *
				 * External product use 'get' method instead of 'post'.
				 *
				 * @since 1.8.5
				 */
				const form = addToCartButton.closest('form.cart')
				const formMethod = form.getAttribute('method')

				if (formMethod === 'get') {
					form.submit()

					// Return: Don't perform AJAX add to cart
					return
				}
			}

			// AJAX add to cart
			bricksWooAddToCart(addToCartElement, type)
		})
	}
})

/**
 * Init AJAX add to cart logic
 *
 * @since 1.6.1
 */
function bricksWooAjaxAddToCartText() {
	if (!window.bricksWooCommerce.ajaxAddToCartEnabled) {
		return
	}

	// Function to get Ajax Button Settings, returns default setting if not set
	const getAjaxButtonSettings = function (button) {
		let ajaxButtonSettingsObj = {
			addingHTML: bricksWooCommerce.ajaxAddingText,
			addedHTML: bricksWooCommerce.ajaxAddedText,
			showNotice: bricksWooCommerce.showNotice,
			scrollToNotice: bricksWooCommerce.scrollToNotice,
			resetTextAfter: bricksWooCommerce.resetTextAfter,
			errorAction: bricksWooCommerce.errorAction,
			errorScrollToNotice: bricksWooCommerce.errorScrollToNotice
		}

		// Overwrite default settings with custom settings on the button if available
		if (button.closest('.brxe-product-add-to-cart')) {
			customAjaxButtonSettingsObj =
				button.closest('.brxe-product-add-to-cart')?.getAttribute('data-bricks-ajax-add-to-cart') ||
				false

			if (customAjaxButtonSettingsObj) {
				// Try to parse custom settings and overwrite default settings
				try {
					JSON.parse(customAjaxButtonSettingsObj, (key, value) => {
						ajaxButtonSettingsObj[key] = value
					})
				} catch (error) {
					console.error('Bricks WooCommerce: Invalid JSON format for data-bricks-ajax-add-to-cart')
				}
			}
		}

		return ajaxButtonSettingsObj
	}

	// Change button text on woo event adding_to_cart, included shop loop buttons
	jQuery('body').on('adding_to_cart', function (event, $button, data) {
		$button[0].setAttribute('disabled', 'disabled')
		$button[0].classList.add('disabled', 'bricks-cart-adding')

		// Get Ajax Button Settings
		const ajaxButtonSettings = getAjaxButtonSettings($button[0])
		if (ajaxButtonSettings && ajaxButtonSettings.addingHTML) {
			// Store the original button text
			if (!$button[0].hasAttribute('data-original-text')) {
				$button[0].setAttribute('data-original-text', $button[0].innerHTML)
			}
			$button[0].innerHTML = ajaxButtonSettings.addingHTML
		}
	})

	/**
	 * Listen to added_to_cart
	 * - Change button text
	 * - Show notice
	 * - Scroll to notice
	 */
	jQuery('body').on('added_to_cart', function (event, fragments, cartHash, $button) {
		$button[0].removeAttribute('disabled')
		$button[0].classList.add('bricks-cart-added')
		$button[0].classList.remove('disabled', 'bricks-cart-adding')

		// Get Ajax Button Settings
		const ajaxButtonSettings = getAjaxButtonSettings($button[0])
		if (ajaxButtonSettings && ajaxButtonSettings.addedHTML) {
			$button[0].innerHTML = ajaxButtonSettings.addedHTML
			// Reset button text after N seconds
			setTimeout(function () {
				$button[0].innerHTML = $button[0].getAttribute('data-original-text')
			}, ajaxButtonSettings.resetTextAfter * 1000)
		}

		// Show notice
		if (
			typeof window.bricksWooCommerce.addedToCartNotices === 'string' &&
			window.bricksWooCommerce.addedToCartNotices.length > 0 &&
			ajaxButtonSettings.showNotice === 'yes'
		) {
			// Show notice
			jQuery('.woocommerce-notices-wrapper').html(window.bricksWooCommerce.addedToCartNotices)
			// Reset notices
			window.bricksWooCommerce.addedToCartNotices = ''

			// Scroll to notice
			if (
				ajaxButtonSettings.scrollToNotice === 'yes' &&
				typeof jQuery.scroll_to_notices === 'function'
			) {
				jQuery.scroll_to_notices(jQuery('.woocommerce-notices-wrapper'))
			}
		}
	})

	/**
	 * Listen to custom bricks_add_to_cart_error
	 *
	 * - Show notice
	 * - Scroll to notice
	 * - Reset button text
	 *
	 * @since 1.11
	 */
	jQuery('body').on('bricks_add_to_cart_error', function (event, notices, $button) {
		$button[0].removeAttribute('disabled')
		$button[0].classList.remove('disabled', 'bricks-cart-adding')
		const ajaxButtonSettings = getAjaxButtonSettings($button[0])

		// Reset button text
		if ($button[0].hasAttribute('data-original-text')) {
			$button[0].innerHTML = $button[0].getAttribute('data-original-text')
		}

		// Show notice
		if (
			typeof notices === 'string' &&
			notices.length > 0 &&
			ajaxButtonSettings.errorAction === 'notice'
		) {
			// Show notice
			jQuery('.woocommerce-notices-wrapper').html(notices)

			// Scroll to notice
			if (
				ajaxButtonSettings.errorScrollToNotice &&
				typeof jQuery.scroll_to_notices === 'function'
			) {
				jQuery.scroll_to_notices(jQuery('.woocommerce-notices-wrapper'))
			}
		}
	})
}

/**
 * AJAX add to cart core Function
 *
 * Support looping products - Simple products only (@since 1.9)
 *
 * @since 1.6.1
 */
function bricksWooAddToCart(element, type) {
	if (typeof woocommerce_params == 'undefined') {
		return
	}

	const addToCartButton =
		type === 'single' ? element.querySelector('.single_add_to_cart_button') : element

	const data = {}

	if (type === 'single') {
		// Single product page
		const form = element
		const formData = new FormData(form)
		// Populate data for simple products
		data.product_id = addToCartButton.value
		data.quantity = formData.get('quantity')
		data.product_type = 'simple'

		// Populate data for variable products
		if (form.classList.contains('variations_form')) {
			data.product_id = formData.get('product_id')
			data.quantity = formData.get('quantity')
			data.variation_id = formData.get('variation_id')
			data.product_type = 'variable'
			// Populate attributes array with attribute names and values
			const attributes = {}
			for (const pair of formData.entries()) {
				if (pair[0].indexOf('attribute_') > -1) {
					attributes[pair[0]] = pair[1]
				}
			}
			data.variation = attributes
		}

		// Populate data for grouped products
		if (form.classList.contains('grouped_form')) {
			// For grouped products, product_id is the ID of the parent. It wouldn't be added into cart
			data.product_id = formData.get('add-to-cart')

			// Populate products array with product IDs and quantities
			const products = {}
			for (const pair of formData.entries()) {
				if (pair[0].indexOf('quantity') > -1 && pair[1] > 0) {
					const product_id = pair[0].replace('quantity[', '').replace(']', '')
					products[product_id] = pair[1]
				}
			}
			data.products = products
			data.product_type = 'grouped'
		}

		if (data.product_type === 'grouped') {
			// If product type is grouped and data.products is empty, don't add to cart
			if (Object.keys(data.products).length === 0) {
				return
			}
		}

		// Populate other data inside the form for third party plugins (@see #862je3dz8; @since 1.7.2)
		for (const pair of formData.entries()) {
			// Skip product_id, quantity, variation_id, add-to-cart, and attributes
			if (
				pair[0] === 'product_id' ||
				pair[0] === 'quantity' ||
				pair[0] === 'variation_id' ||
				pair[0] === 'add-to-cart' ||
				pair[0].indexOf('attribute_') > -1
			) {
				continue
			}

			// Ensure all inputs are added to data, some input might be checkboxes that support multiple values with same name
			if (data[pair[0]] === undefined) {
				data[pair[0]] = pair[1]
			} else {
				// Same key already exists

				// Convert to array if not already
				if (!Array.isArray(data[pair[0]])) {
					data[pair[0]] = [data[pair[0]]]
				}

				// Check if the value is same as the existing value
				if (Array.isArray(data[pair[0]]) && data[pair[0]].includes(pair[1])) {
					// Skip
					continue
				}

				// Add to array
				data[pair[0]].push(pair[1])
			}
		}
	} else {
		// Looping product - Only support simple products & product variations
		data.product_id = addToCartButton.dataset?.product_id || 0
		data.quantity = addToCartButton.dataset?.quantity || 1
		data.product_type = addToCartButton.dataset?.product_type || 'simple'
	}

	// Trigger woo adding_to_cart event
	jQuery('body').trigger('adding_to_cart', [jQuery(addToCartButton), data])

	const url = woocommerce_params.wc_ajax_url
		.toString()
		.replace('%%endpoint%%', 'bricks_add_to_cart')

	// Use jQuery to submit add to cart
	jQuery.ajax({
		type: 'POST',
		url: url,
		data: data,
		dataType: 'json',
		success: function (response) {
			// Redirect to product page if an error occurs
			if (response.error && response.product_url) {
				window.location = response.product_url
				return
			}

			if (response.error && response.notices) {
				// Custom event
				jQuery('body').trigger('bricks_add_to_cart_error', [
					response.notices,
					jQuery(addToCartButton)
				])
				return
			}

			// Add to cart successfully
			// Redirect to cart option from woo settings if enabled
			if (
				typeof wc_add_to_cart_params !== 'undefined' &&
				wc_add_to_cart_params.cart_redirect_after_add === 'yes' &&
				wc_add_to_cart_params.cart_url
			) {
				window.location = wc_add_to_cart_params.cart_url
				return
			}

			// Replace fragments and trigger woo event
			if (response.fragments) {
				bricksWooReplaceFragments(response.fragments)
				jQuery('body').trigger('wc_fragments_refreshed')
			}

			// Save the notices to window.bricksWooCommerce.addedToCartNotices
			if (
				response.notices &&
				typeof response.notices === 'string' &&
				response.notices.length > 0 &&
				window.bricksWooCommerce.addedToCartNotices !== undefined
			) {
				window.bricksWooCommerce.addedToCartNotices = response.notices
			}

			// Trigger woo added_to_cart event
			jQuery('body').trigger('added_to_cart', [
				response.fragments,
				response.cart_hash,
				jQuery(addToCartButton)
			])
		},
		error: function (response) {
			// Redirect to product page if an error occurs
			if (response.error && response.product_url) {
				window.location = response.product_url
			}
		},
		complete: function (response) {}
	})
}

/**
 * Overwrite WooCommerce wc_checkout_form.submit_error & wc_checkout_form.scroll_to_notices
 *
 * So error messages are displayed correctly in the Bricks WC notice element.
 *
 * @since 1.8.4
 */
function bricksWooCheckoutSubmitBehavior() {
	// Return: Not the checkout page
	if (typeof wc_checkout_params == 'undefined' || !wc_checkout_params.is_checkout) {
		return
	}

	// Get checkout form
	const $form = jQuery('form.checkout')

	if (!$form) {
		return
	}

	/**
	 * Use jQuery event to retrieve the wc_checkout_form object so we can overwrite its methods
	 * woocommerce/assets/js/frontend/checkout.js
	 *
	 * Just execute once, so we use .one() instead of .on()
	 * Hopefully no other plugins overwrites this event.
	 */
	$form.one('checkout_place_order', function (event, wc_checkout_form) {
		// Check if wc_checkout_form is an object
		if (typeof wc_checkout_form !== 'object') {
			return
		}

		// Check if wc_checkout_form has submit_error method
		if (typeof wc_checkout_form.submit_error !== 'function') {
			return
		}

		// Now overwrite submit_error method
		wc_checkout_form.submit_error = function (error_message) {
			bricksShowNotice(error_message)

			// These are the default actions
			wc_checkout_form.$checkout_form.removeClass('processing').unblock()
			wc_checkout_form.$checkout_form
				.find('.input-text, select, input:checkbox')
				.trigger('validate')
				.trigger('blur')
			wc_checkout_form.scroll_to_notices()
			jQuery(document.body).trigger('checkout_error', [error_message])
		}

		// Check if wc_checkout_form has submit_error method
		if (typeof wc_checkout_form.scroll_to_notices !== 'function') {
			return
		}

		wc_checkout_form.scroll_to_notices = bricksScrollToNotices
	})
}

/**
 * Listen to looping product quantity change event
 *
 * Use BricksFunction class (@since 1.9.2)
 *
 * @since 1.9
 */
const bricksWooLoopQtyListenerFn = new BricksFunction({
	parentNode: document,
	selector: '.brx-loop-product-form input.qty',
	windowVariableCheck: ['bricksWooCommerce.useQtyInLoop'],
	eachElement: (quantityInput) => {
		/// Change quantity function
		const updateQuantity = (event) => {
			// Our identifier
			const form = event.target.closest('form.brx-loop-product-form')

			if (form) {
				const value = event.target.value
				const addToCartButton = form.querySelector('.add_to_cart_button')

				if (addToCartButton) {
					const addToCartURL = new URL(addToCartButton.href)
					addToCartURL.searchParams.set('quantity', value)

					// Update add to cart button for non-AJAX add to cart
					addToCartButton.href = addToCartURL.toString()

					// Update data-quantity attribute for AJAX add to cart
					addToCartButton.setAttribute('data-quantity', value)
				}
			}
		}

		// Add event listener to all quantity inputs
		quantityInput.addEventListener('change', updateQuantity)
	}
})

/**
 * For Checkout Coupon toggleable feature
 *
 * @since 1.11: Separate from bricksCheckoutCouponForm so it can be used in template preveiew too
 */
const bricksCheckoutCouponToggleFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-woocommerce-checkout-coupon .coupon-toggle',
	eachElement: (element) => {
		if (typeof jQuery === 'undefined' || typeof jQuery.fn.slideToggle === 'undefined') {
			return
		}

		const checkouCouponElement = element.closest('.brxe-woocommerce-checkout-coupon')

		if (!checkouCouponElement) {
			return
		}

		const couponDiv = checkouCouponElement.querySelector('.coupon-div')

		if (!couponDiv) {
			return
		}

		element.addEventListener('click', function (event) {
			event.preventDefault()
			jQuery(couponDiv).slideToggle(400, function () {
				// Check if couponDiv is visible, then update aria-expanded
				if (jQuery(couponDiv).is(':visible')) {
					element.setAttribute('aria-expanded', 'true')
				} else {
					element.setAttribute('aria-expanded', 'false')
				}
				jQuery(couponDiv).find(':input:eq(0)').trigger('focus')
			})
		})
	}
})

function bricksCheckoutCouponToggle() {
	bricksCheckoutCouponToggleFn.run()
}

/**
 * This is not a real form, as form inside Checkout form is not a allowed in HTML
 *
 * @since 1.11
 */
const bricksCheckoutCouponFormFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-woocommerce-checkout-coupon .coupon-form',
	eachElement: (form) => {
		if (typeof jQuery == 'undefined' || typeof wc_checkout_params == 'undefined') {
			return
		}

		const couponElement = form.closest('.brxe-woocommerce-checkout-coupon')
		const couponDiv = form.closest('.brxe-woocommerce-checkout-coupon').querySelector('.coupon-div')
		const applyButton = form.querySelector('button[name="apply_coupon"]')
		const couponInput = form.querySelector('input[name="coupon_code"]')

		if (!applyButton || !couponInput || !couponDiv || !couponElement) {
			return
		}

		const toggleAble = couponElement.querySelector('.coupon-toggle')

		// Remove all notices when removed_coupon_in_checkout is triggered
		jQuery(document.body).on('removed_coupon_in_checkout', function () {
			jQuery(couponDiv).find('.woocommerce-notices-wrapper').remove()
		})

		jQuery(document.body).on('init_checkout', function () {
			setTimeout(() => {
				// Off default remove coupon behavior or the notice will be unstyle and not controlleable
				jQuery(document.body).off('click', '.woocommerce-remove-coupon')

				const applyCoupon = () => {
					let $couponDiv = jQuery(couponDiv)

					if ($couponDiv.hasClass('processing')) {
						return
					}

					$couponDiv.addClass('processing').block({
						message: null,
						overlayCSS: {
							background: '#fff',
							opacity: 0.6
						}
					})

					let data = {
						coupon_code: couponInput.value,
						security: wc_checkout_params.apply_coupon_nonce,
						billing_email: jQuery('form.checkout').find('input[name="billing_email"]').val()
					}

					jQuery.ajax({
						type: 'POST',
						url: wc_checkout_params.wc_ajax_url.toString().replace('%%endpoint%%', 'apply_coupon'),
						data: data,
						success: function (code) {
							// Remove any notices added previously
							$couponDiv.find('.woocommerce-notices-wrapper').remove()
							$couponDiv.removeClass('processing').unblock()

							if (code) {
								// Add notices
								bricksShowNotice(code)

								// Scroll to notices as the coupon form might be far down the page
								bricksScrollToNotices()

								if (toggleAble) {
									$couponDiv.slideUp()
									toggleAble.setAttribute('aria-expanded', 'false')
								}

								jQuery(document.body).trigger('applied_coupon_in_checkout', [data.coupon_code])
								jQuery(document.body).trigger('update_checkout', { update_shipping_method: false })
							}
						},
						dataType: 'html'
					})
				}

				// Prevent default form submit
				applyButton.addEventListener('click', function (event) {
					event.preventDefault()
					applyCoupon()
				})

				// Same as native remove coupon function but with custom notice handling
				const removeCoupon = (e) => {
					e.preventDefault()

					const $container = jQuery('form.checkout').find('.woocommerce-checkout-review-order')
					const coupon = e.target.getAttribute('data-coupon')

					$container.addClass('processing').block({
						message: null,
						overlayCSS: {
							background: '#fff',
							opacity: 0.6
						}
					})

					var data = {
						security: wc_checkout_params.remove_coupon_nonce,
						coupon: coupon
					}

					jQuery.ajax({
						type: 'POST',
						url: wc_checkout_params.wc_ajax_url.toString().replace('%%endpoint%%', 'remove_coupon'),
						data: data,
						success: function (code) {
							// jQuery( '.woocommerce-error, .woocommerce-message, .is-error, .is-success' ).remove();
							$container.removeClass('processing').unblock()

							if (code) {
								// jQuery( 'form.woocommerce-checkout' ).before( code );
								bricksShowNotice(code)
								bricksScrollToNotices()

								jQuery(document.body).trigger('removed_coupon_in_checkout', [data.coupon])
								jQuery(document.body).trigger('update_checkout', { update_shipping_method: false })

								// Remove coupon code from coupon field
								jQuery('form.checkout').find('input[name="coupon_code"]').val('')
							}
						},
						error: function (jqXHR) {
							if (wc_checkout_params.debug_mode) {
								/* jshint devel: true */
								console.log(jqXHR.responseText)
							}
						},
						dataType: 'html'
					})
				}

				// Use jQuery event to remove coupon
				jQuery(document.body).on('click', '.woocommerce-remove-coupon', removeCoupon)
			}, 100)
		})
	}
})

function bricksCheckoutCouponForm() {
	bricksCheckoutCouponFormFn.run()
}

const bricksCheckoutLoginToggleFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-woocommerce-checkout-login .login-toggle',
	eachElement: (element) => {
		if (typeof jQuery === 'undefined' || typeof jQuery.fn.slideToggle === 'undefined') {
			return
		}

		const checkoutLoginElement = element.closest('.brxe-woocommerce-checkout-login')

		if (!checkoutLoginElement) {
			return
		}

		const loginDiv = checkoutLoginElement.querySelector('.login-div')

		if (!loginDiv) {
			return
		}

		element.addEventListener('click', function (event) {
			event.preventDefault()
			jQuery(loginDiv).slideToggle(400, function () {
				// Check if loginDiv is visible, then update aria-expanded
				if (jQuery(loginDiv).is(':visible')) {
					element.setAttribute('aria-expanded', 'true')
				} else {
					element.setAttribute('aria-expanded', 'false')
				}
				jQuery(loginDiv).find(':input:eq(0)').trigger('focus')
			})
		})
	}
})

function bricksCheckoutLoginToggle() {
	bricksCheckoutLoginToggleFn.run()
}

/**
 * This is not a real form, as form inside Checkout form is not a allowed in HTML
 *
 * @since 1.11
 */
const bricksCheckoutLoginFormFn = new BricksFunction({
	parentNode: document,
	selector: '.brxe-woocommerce-checkout-login .login-div',
	eachElement: (loginDiv) => {
		if (typeof jQuery === 'undefined' || typeof jQuery.fn.slideToggle === 'undefined') {
			return
		}

		const loginElement = loginDiv.closest('.brxe-woocommerce-checkout-login')
		const loginButton = loginDiv.querySelector('button.woocommerce-form-login__submit')

		if (!loginElement || !loginButton) {
			return
		}

		/**
		 * Simulate a form submit for the login form which post to the same page
		 * The loginDiv is not a real form, as form inside Checkout form is not a allowed in HTML
		 */
		const login = () => {
			// STEP: Collect all input values inside the loginDiv
			const data = {}
			const inputs = loginDiv.querySelectorAll('input')
			let hasEmptyRequired = false

			// Use a for loop to be able to break when a required field is empty
			for (let i = 0; i < inputs.length; i++) {
				const input = inputs[i]
				// Check if required input is empty
				if (input.hasAttribute('required') && input.value === '') {
					// Trigger a native form validation
					input.reportValidity()
					// Set flag and break
					hasEmptyRequired = true
					break
				}

				// Handle checkbox
				if (input.type === 'checkbox' && !input.checked) {
					continue
				}

				data[input.name] = input.value
			}

			// Return if a required field is empty
			if (hasEmptyRequired) {
				return
			}

			// STEP: Include the button name and value (loginButton)
			data[loginButton.name] = loginButton.value

			// STEP: Create a fake form and submit it
			const form = document.createElement('form')
			form.method = 'POST'
			form.action = window.location.href

			// Ensure the form is not visible
			form.style.display = 'none'

			// Add all data to the form
			Object.keys(data).forEach((key) => {
				const input = document.createElement('input')
				input.name = key
				input.value = data[key]
				form.appendChild(input)
			})

			// Append the form to the body and submit it
			document.body.appendChild(form)
			form.submit()
		}

		// Prevent default form submit
		loginButton.addEventListener('click', function (event) {
			event.preventDefault()
			login()
		})
	}
})

function bricksCheckoutLoginForm() {
	bricksCheckoutLoginFormFn.run()
}

/**
 * Handle variation swatches interactions
 *
 * @since 2.0
 */
const bricksWooVariationSwatchesFn = new BricksFunction({
	parentNode: document,
	selector: '.bricks-variation-swatches',
	windowVariableCheck: ['bricksWooCommerce.useVariationSwatches'],
	eachElement: (swatchesContainer) => {
		const swatches = swatchesContainer.querySelectorAll('li')
		const originalSelect = swatchesContainer.nextElementSibling?.querySelector('select')
		const variationForm = swatchesContainer.closest('.variations_form')

		if (!swatches.length || !originalSelect) {
			return
		}

		// Handle swatch click
		swatches.forEach((swatch) => {
			swatch.addEventListener('click', () => {
				// Skip if swatch is disabled
				if (swatch.classList.contains('disabled')) {
					return
				}

				// Update swatch selection
				swatches.forEach((s) => s.classList.remove('bricks-swatch-selected'))
				swatch.classList.add('bricks-swatch-selected')

				// Update the original select - WooCommerce will handle emitting the change event
				originalSelect.value = swatch.dataset.value
				jQuery(originalSelect).trigger('change')
			})
		})

		// Listen for changes on the original select (for reset)
		jQuery(originalSelect).on('change', () => {
			const value = originalSelect.value
			swatches.forEach((swatch) => {
				swatch.classList.toggle('bricks-swatch-selected', swatch.dataset.value === value)
			})
		})

		// Only apply disabled states for variation forms
		if (variationForm) {
			// Get the attribute name from the select
			const attributeName = originalSelect.name

			// Listen for found_variation event to update available options and swatch images
			jQuery(variationForm).on('found_variation', function (event, variation) {
				updateAvailableOptions(swatchesContainer, variationForm, attributeName)
				updateSelectedImageSwatch(swatchesContainer, variation, attributeName)
			})

			// Listen for hide_variation event to update available options and reset swatch images
			jQuery(variationForm).on('hide_variation', function () {
				updateAvailableOptions(swatchesContainer, variationForm, attributeName)
				updateSelectedImageSwatch(swatchesContainer, null, attributeName)
			})

			// Listen for check_variations event to update available options
			jQuery(variationForm).on('check_variations', function () {
				updateAvailableOptions(swatchesContainer, variationForm, attributeName)
				updateSelectedImageSwatch(swatchesContainer, null, attributeName)
			})

			// Listen for woocommerce_update_variation_values to update available options
			jQuery(document).on('woocommerce_update_variation_values', function () {
				updateAvailableOptions(swatchesContainer, variationForm, attributeName)
				updateSelectedImageSwatch(swatchesContainer, null, attributeName)
			})

			// Initial update on load
			setTimeout(() => {
				updateAvailableOptions(swatchesContainer, variationForm, attributeName)
			}, 100)
		}
	}
})

/**
 * Update available options for variation swatches
 *
 * @since 2.0
 *
 * @param {HTMLElement} swatchesContainer The swatches container element
 * @param {HTMLElement} variationForm The variation form element
 * @param {string} attributeName The attribute name
 */
function updateAvailableOptions(swatchesContainer, variationForm, attributeName) {
	// Get all swatches
	const swatches = swatchesContainer.querySelectorAll('li')

	// Get the original select
	const originalSelect = swatchesContainer.nextElementSibling?.querySelector('select')

	if (!originalSelect) {
		return
	}

	// Get available options from the select
	const availableOptions = []

	// Loop through options and push available ones to array
	for (let i = 0; i < originalSelect.options.length; i++) {
		const option = originalSelect.options[i]

		// Skip empty option
		if (!option.value) {
			continue
		}

		// Check if option is disabled
		if (!option.disabled) {
			availableOptions.push(option.value)
		}
	}

	// Update swatches based on available options
	swatches.forEach((swatch) => {
		// Get swatch value
		const swatchValue = swatch.dataset.value

		// Set disabled class based on availability
		if (availableOptions.includes(swatchValue)) {
			swatch.classList.remove('disabled')
		} else {
			swatch.classList.add('disabled')
		}
	})
}

/**
 * Update selected image swatch source based on the matched variation
 *
 * @param {HTMLElement} swatchesContainer The swatches container element
 * @param {object|null} variation The variation data object (or null to reset)
 * @param {string} attributeName The attribute name (e.g. attribute_pa_pattern)
 */
function updateSelectedImageSwatch(swatchesContainer, variation, attributeName) {
	// Only apply to image-type swatches
	if (!swatchesContainer.classList.contains('bricks-swatch-image')) {
		return
	}

	// Get all swatches with variation-based images
	const variationSwatches = swatchesContainer.querySelectorAll('li[data-image-origin="variation"]')

	if (!variationSwatches.length) {
		return
	}

	// Process each variation-based swatch
	variationSwatches.forEach((swatch) => {
		const imgEl = swatch.querySelector('img')

		if (!imgEl) {
			return
		}

		// Cache the original src so we can restore it later
		if (!imgEl.dataset.origSrc) {
			imgEl.dataset.origSrc = imgEl.getAttribute('src')
		}

		// Use variation image if provided, otherwise restore to original
		if (variation && variation.image && variation.image.src) {
			imgEl.setAttribute('src', variation.image.src)
		} else {
			imgEl.setAttribute('src', imgEl.dataset.origSrc)
		}
	})
}

function bricksWooVariationSwatches() {
	bricksWooVariationSwatchesFn.run()
}

document.addEventListener('DOMContentLoaded', function (event) {
	bricksWooProductsFilter()
	bricksWooMiniModals()
	bricksWooMiniCartHideDetailsClickOutside()
	bricksWooAjaxAddToCartText()
	bricksWooAjaxAddToCartFn.run()
	bricksWooCheckoutSubmitBehavior()
	bricksWooProductGalleryEnhance()
	bricksCheckoutCouponToggle()
	bricksCheckoutCouponForm()
	bricksCheckoutLoginToggle()
	bricksCheckoutLoginForm()
	bricksWooVariationSwatches()

	// Small timeout required to allow other plugins (e.g. WooCommerce Composite Products) to generate additional content (@since 1.8)
	setTimeout(function () {
		bricksWooQuantityTriggersFn.run()
		bricksWooLoopQtyListenerFn.run()
	}, 150)
})

// Resize product gallery after all CSS is loaded (@since 2.0)
window.addEventListener('load', () => {
	if (
		!bricksIsFrontend ||
		typeof jQuery === 'undefined' ||
		typeof jQuery(this).wc_product_gallery === 'undefined'
	) {
		return
	}

	jQuery('.woocommerce-product-gallery').each(function () {
		jQuery(this).resize()
	})
})
