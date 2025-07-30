/**
 * Gutenberg editor: "Edit with Bricks" button
 *
 * https://wordpress.org/gutenberg/handbook/designers-developers/developers/data/data-core-editor/
 */

function bricksAdminGutenbergEditWithBricks() {
	if (window.self !== window.top) {
		return
	}

	var editWithBricksLink = document.querySelector('#wp-admin-bar-edit_with_bricks a')

	// If the "Edit with Bricks" link is not available in the admin bar, create it (@since 1.8.6)
	if (!editWithBricksLink) {
		editWithBricksLink = document.createElement('a')
		editWithBricksLink.id = 'wp-admin-bar-edit_with_bricks'
		editWithBricksLink.href = window.bricksData.builderEditLink
		editWithBricksLink.innerText = window.bricksData.i18n.editWithBricks
	}

	// Add Bricks buttons to Gutenberg: Listen to window.wp.data store changes to remount buttons
	window.wp.data.subscribe(function () {
		setTimeout(function () {
			var postHeaderToolbar = document.querySelector('.edit-post-header-toolbar')

			if (
				postHeaderToolbar &&
				postHeaderToolbar instanceof HTMLElement &&
				!postHeaderToolbar.querySelector('#toolbar-edit_with_bricks')
			) {
				var editWithBricksButton = document.createElement('a')
				editWithBricksButton.id = 'toolbar-edit_with_bricks'
				editWithBricksButton.classList.add('button')
				editWithBricksButton.classList.add('button-primary')
				editWithBricksButton.innerText = editWithBricksLink.innerText
				editWithBricksButton.href = editWithBricksLink.href

				postHeaderToolbar.append(editWithBricksButton)

				// "Edit with Bricks" button click listener
				editWithBricksButton.addEventListener('click', function (e) {
					e.preventDefault()

					var title = window.wp.data.select('core/editor').getEditedPostAttribute('title')
					var postId = window.wp.data.select('core/editor').getCurrentPostId()

					// Add title
					if (!title) {
						window.wp.data.dispatch('core/editor').editPost({ title: 'Bricks #' + postId })
					}

					// Save draft
					window.wp.data.dispatch('core/editor').savePost()

					// Redirect to edit in Bricks builder
					var redirectToBuilder = function (url) {
						setTimeout(function () {
							if (
								window.wp.data.select('core/editor').isSavingPost() ||
								window.wp.data.select('core/editor').isAutosavingPost()
							) {
								redirectToBuilder(url)
							} else {
								window.location.href = url
							}
						}, 400)
					}

					redirectToBuilder(e.target.href)
				})
			}
		}, 1)
	})
}

/**
 * Handles empty block (Gutenberg) editor state for Bricks-enabled posts/pages
 *
 * @since 1.12
 */
function bricksHandleEmptyContent() {
	let rootContainer = document.querySelector('.is-root-container')
	let attempts = 0
	const maxAttempts = 10

	function tryFindContainer() {
		if (attempts >= maxAttempts) {
			return
		}

		rootContainer = document.querySelector('.is-root-container')

		if (!rootContainer) {
			attempts++
			setTimeout(tryFindContainer, 50)
			return
		}

		// Found the container, proceed with normal flow
		if (window.self !== window.top) {
			handleEmptyContentCore(rootContainer)
		} else {
			const editorIframe = document.querySelector('iframe[name="editor-canvas"]')
			if (!editorIframe && window.wp && window.wp.data) {
				window.wp.data.subscribe(function () {
					setTimeout(function () {
						handleEmptyContentCore(rootContainer)
					}, 1)
				})
			}
		}
	}

	tryFindContainer()
}

/**
 * Core logic for handling empty content state
 *
 * When Gutenberg is empty, shows a message and two options:
 * 1. "Edit with Bricks" - Redirects to Bricks builder
 * 2. "Use default editor" - Shows default Gutenberg block appender and remove the notice
 *
 * Uses window.wp.data.subscribe to persist through React re-renders
 * Choice of default editor persists until page reload
 *
 * @since 1.12
 */
function handleEmptyContentCore(rootContainer) {
	if (
		rootContainer &&
		!rootContainer.querySelector('.bricks-block-editor-notice-wrapper') &&
		window.bricksData.showBuiltWithBricks == 1 &&
		!window.useDefaultEditor // Only proceed if user hasn't chosen default editor
	) {
		// Hide existing appender block
		rootContainer.querySelectorAll(':scope > *').forEach((el) => {
			if (!el.classList.contains('bricks-block-editor-notice-wrapper')) {
				el.style.display = 'none'
			}
		})

		const editorWrapper = document.createElement('div')
		editorWrapper.className = 'bricks-block-editor-notice-wrapper'

		const message = document.createElement('p')
		message.className = 'bricks-editor-message'
		message.textContent = window.bricksData.i18n.bricksActiveMessage

		const buttonWrapper = document.createElement('div')
		buttonWrapper.className = 'bricks-editor-buttons'

		const editButton = document.createElement('a')
		editButton.className = 'button button-primary'
		editButton.href = window.bricksData.builderEditLink || '#'
		editButton.textContent = window.bricksData.i18n.editWithBricks

		// Handle edit button click based on iframe context
		editButton.addEventListener('click', (e) => {
			e.preventDefault()
			if (window.self !== window.top) {
				// We're in an iframe, send message to parent
				window.top.postMessage(
					{
						type: 'bricksOpenBuilder',
						url: window.bricksData.builderEditLink
					},
					'*'
				)
			} else {
				// We're in top window, navigate directly
				window.location.href = window.bricksData.builderEditLink
			}
		})

		const defaultEditorLink = document.createElement('a')
		defaultEditorLink.className = 'button'
		defaultEditorLink.href = '#'
		defaultEditorLink.textContent = window.bricksData.i18n.useDefaultEditor
		defaultEditorLink.addEventListener('click', (e) => {
			e.preventDefault()
			window.useDefaultEditor = true

			rootContainer.querySelectorAll(':scope > *').forEach((el) => {
				if (!el.classList.contains('bricks-block-editor-notice-wrapper')) {
					el.style.display = ''
				}
			})

			editorWrapper.remove()
		})

		buttonWrapper.append(editButton, defaultEditorLink)
		editorWrapper.append(message, buttonWrapper)
		rootContainer.appendChild(editorWrapper)
	}
}

/*
 * Listen for messages from parent iframe to open Bricks builder
 *
 * @since 1.12
 */
if (window.self === window.top) {
	window.addEventListener('message', (event) => {
		if (event.data.type === 'bricksOpenBuilder') {
			window.location.href = event.data.url
		}
	})
}

document.addEventListener('DOMContentLoaded', function (e) {
	bricksAdminGutenbergEditWithBricks()
	bricksHandleEmptyContent()
})
