/**
 * Bricks integration with the Rank Math plugin
 * NOTE: The Bricks content data is fetched on DOM load and when the post is updated. No real-time updates data are provided to RankMath.
 */
function rmGetBricksContentData(originalContent) {
	if (window.bricksRankMath.contentData !== '') {
		return window.bricksRankMath.contentData
	}
	return originalContent
}

// Function to fetch Bricks content data.
function rmFetchBricksContent() {
	jQuery.ajax({
		url: window.bricksRankMath.ajaxUrl,
		type: 'POST',
		data: {
			action: 'bricks_get_html_from_content',
			nonce: window.bricksRankMath.nonce,
			postId: window.bricksRankMath.postId
		},
		success: function (res) {
			if (res.data.html) {
				window.bricksRankMath.contentData = res.data.html
			}

			if (typeof rankMathEditor !== 'undefined' && typeof rankMathEditor.refresh === 'function') {
				rankMathEditor.refresh('content')
			}
		},
		error: function (err) {
			console.error('Error updating content data:', err)
		}
	})
}

// Setup initial filter and content fetch on DOM load.
document.addEventListener('DOMContentLoaded', function () {
	if (!window.bricksRankMath || !window.bricksRankMath.renderWithBricks) {
		return
	}
	wp.hooks.addFilter('rank_math_content', 'bricks', rmGetBricksContentData)
	rmFetchBricksContent()
})

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
				window.bricksRankMath.postIsUpdated = true
				rmFetchBricksContent()
			}

			isPostSaving = currentlySaving
		})
	})
}

// Not in use, but kept for reference
// To be used inside the builder when content is saved (needs a deeper integration)
// function bricksRankMathAddContent(event) {
// 	let data = event.detail
// 	window.bricksRankMath.contentData = data.content ? JSON.stringify(data.content) : ''
// 	rankMathEditor.refresh('content')
// }

// Not in use, but kept for reference
// Updated to handle content updates from the Bricks builder
// document.addEventListener('bricksContentSaved', bricksRankMathAddContent)
