/**
 * Bricks integration with the Yoast SEO plugin.
 *
 * NOTE: No real-time updates data are provided to YoastSEO. The Bricks content data is fetched on page load and when the post is save/updated.
 *
 * @since 1.11
 */
class BricksYoastContentData {
	constructor() {
		// Ensure YoastSEO.js is present and can access the necessary features.
		if (
			typeof YoastSEO === 'undefined' ||
			typeof YoastSEO.analysis === 'undefined' ||
			typeof YoastSEO.analysis.worker === 'undefined'
		) {
			return
		}

		YoastSEO.app.registerPlugin('BricksYoastContentData', { status: 'ready' })

		this.registerModifications()
	}

	/**
	 * Registers the addContent modification.
	 *
	 * @returns {void}
	 */
	registerModifications() {
		const callback = this.addContent.bind(this)

		// Ensure that the additional data is being seen as a modification to the content.
		// Can check in YoastSEO.app.pluggable.modifications to see if the modification is registered.
		// content, title, snippet_title, snippet_meta, primary_category, data_page_title, data_meta_desc, excerpt
		YoastSEO.app.registerModification('content', callback, 'BricksYoastContentData', 100)
	}

	/**
	 * Adds to the content to be analyzed by the analyzer.
	 *
	 * @param {string} data The current data string.
	 *
	 * @returns {string} The data string parameter with the added content.
	 */
	addContent(data) {
		if (window.bricksYoast.contentData !== '') {
			return window.bricksYoast.contentData
		}
		return data
	}
}

// Function to fetch Bricks content data.
function yoastFetchBricksContent() {
	jQuery.ajax({
		url: window.bricksYoast.ajaxUrl,
		type: 'POST',
		data: {
			action: 'bricks_get_html_from_content',
			nonce: window.bricksYoast.nonce,
			postId: window.bricksYoast.postId
		},
		success: function (res) {
			if (res.data.html) {
				window.bricksYoast.contentData = res.data.html
			}

			if (
				typeof YoastSEO !== 'undefined' &&
				typeof YoastSEO.app !== 'undefined' &&
				typeof YoastSEO.app.refresh === 'function'
			) {
				YoastSEO.app.refresh()
			}
		},
		error: function (err) {
			console.error('Error updating content data:', err)
		}
	})
}

// Fetch BricksContent on DOM load.
document.addEventListener('DOMContentLoaded', function () {
	if (!window.bricksYoast || !window.bricksYoast.renderWithBricks) {
		return
	}
	yoastFetchBricksContent()
})

// Register BricksYoastContentData when YoastSEO is ready.
if (typeof YoastSEO !== 'undefined' && typeof YoastSEO.app !== 'undefined') {
	new BricksYoastContentData()
} else {
	jQuery(window).on('YoastSEO:ready', function () {
		new BricksYoastContentData()
	})
}

// Listen for post updates. (Gutenberg)
if (
	typeof wp !== 'undefined' &&
	typeof wp.data !== 'undefined' &&
	typeof wp.domReady !== 'undefined' &&
	typeof wp.data.select('core/editor') !== 'undefined' &&
	typeof wp.data.select('core/editor').isSavingPost === 'function' &&
	typeof wp.data.select('core/editor').isAutosavingPost === 'function'
) {
	wp.domReady(() => {
		let isPostSaving = false
		wp.data.subscribe(() => {
			// Not listening to isAutosavingPost()
			const currentlySaving =
				wp.data.select('core/editor').isSavingPost() ||
				wp.data.select('core/editor').isAutosavingPost()

			if (currentlySaving && !isPostSaving) {
				// Post is in the process of being saved
			}

			if (!currentlySaving && isPostSaving) {
				// Post has finished saving
				yoastFetchBricksContent()
			}

			isPostSaving = currentlySaving
		})
	})
}
