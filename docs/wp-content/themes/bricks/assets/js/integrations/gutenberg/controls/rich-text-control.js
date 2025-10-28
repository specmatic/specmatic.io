/**
 * Create TinyMCE rich text control matching ControlEditor.vue
 */
function createBricksRichTextControl(property, props) {
	const { createElement } = window.wp.element

	// Generate unique editor ID
	const editorId = `bricks-gutenberg-editor-${property.id}-${Math.random()
		.toString(36)
		.substr(2, 9)}`

	return createElement(
		'div',
		{
			key: property.id,
			style: { marginBottom: '16px' }
		},
		[
			createElement(
				'label',
				{
					key: 'label',
					style: {
						display: 'block',
						marginBottom: '8px',
						fontSize: '11px',
						fontWeight: '500',
						color: '#1e1e1e'
					}
				},
				property.label
			),
			createElement(TinyMCEEditor, {
				key: 'tinymce-editor',
				editorId: editorId,
				value: props.attributes[property.id] || '',
				onChange: function (value) {
					const newAttributes = {}
					newAttributes[property.id] = value
					props.setAttributes(newAttributes)
				}
			})
		]
	)
}

/**
 * TinyMCE Editor Component for Gutenberg
 */
function TinyMCEEditor({ editorId, value, onChange }) {
	const { createElement, useEffect, useRef, useState } = window.wp.element
	const editorRef = useRef(null)
	const onChangeRef = useRef(onChange)
	const [isInitialized, setIsInitialized] = useState(false)

	// Keep onChange ref current to avoid stale closures in TinyMCE event listeners
	useEffect(() => {
		onChangeRef.current = onChange
	}, [onChange])

	useEffect(() => {
		if (!editorRef.current || isInitialized) return

		// Check if we have the necessary WordPress globals
		if (!window.tinyMCEPreInit || !window.tinymce || !window.switchEditors) {
			console.warn('TinyMCE not available, falling back to textarea')
			return
		}

		initializeTinyMCE()
		setIsInitialized(true)

		// Cleanup on unmount
		return () => {
			cleanupEditor()
		}
	}, [])

	// Update content when value changes externally
	useEffect(() => {
		if (isInitialized && window.tinymce) {
			const editor = window.tinymce.get(editorId)
			const textarea = document.getElementById(editorId)

			if (editor && editor.getContent() !== value) {
				editor.setContent(value || '')
			}

			// Also update textarea content for HTML mode
			if (textarea && textarea.value !== value) {
				textarea.value = value || ''
			}
		}
	}, [value, isInitialized])

	const initializeTinyMCE = () => {
		try {
			// Create editor HTML structure
			const editorHTML = `
				<div class="wp-core-ui wp-editor-wrap tmce-active" style="border: none;">
					<div class="wp-editor-tools">
						<div class="wp-editor-tabs">
							<button type="button" class="wp-switch-editor switch-tmce" data-wp-editor-id="${editorId}">${
								window.bricksData.i18n.visual
							}</button>
							<button type="button" class="wp-switch-editor switch-html" data-wp-editor-id="${editorId}">${
								window.bricksData.i18n.text
							}</button>
						</div>
					</div>
					<div class="wp-editor-container">
						<textarea class="wp-editor-area" rows="10" cols="40" name="${editorId}" id="${editorId}">${
							value || ''
						}</textarea>
					</div>
				</div>
			`

			editorRef.current.innerHTML = editorHTML

			// Setup TinyMCE settings using WordPress defaults (like ControlEditor.vue)
			let editorSettings = {}

			// Check if WordPress TinyMCE settings are available
			if (
				window.tinyMCEPreInit &&
				window.tinyMCEPreInit.mceInit &&
				window.tinyMCEPreInit.mceInit.brickswpeditor
			) {
				// Use WordPress pre-configured settings (like ControlEditor.vue does)
				editorSettings = window.jQuery
					? window.jQuery.extend(true, {}, window.tinyMCEPreInit.mceInit.brickswpeditor)
					: Object.assign({}, window.tinyMCEPreInit.mceInit.brickswpeditor)
			} else {
				// Fallback to basic settings if WordPress config not available
				editorSettings = {
					theme: 'modern',
					skin: 'lightgray',
					plugins:
						'charmap,colorpicker,hr,lists,paste,tabfocus,textcolor,fullscreen,wordpress,wpeditimage,wpgallery,wplink,wpdialogs,wpview',
					toolbar1:
						'bold,italic,strikethrough,bullist,numlist,blockquote,hr,alignleft,aligncenter,alignright,link,unlink,wp_more,spellchecker,fullscreen,wp_adv',
					toolbar2:
						'formatselect,underline,alignjustify,forecolor,pastetext,removeformat,charmap,outdent,indent,undo,redo,wp_help',
					wpautop: true,
					indent: false
				}
			}

			// Override selector and specific settings for Gutenberg context
			editorSettings.selector = `#${editorId}`
			editorSettings.menubar = false
			editorSettings.statusbar = false // Remove TinyMCE branding/status bar
			editorSettings.body_class = editorId
			editorSettings.resize = 'vertical'
			editorSettings.height = 300

			// Ensure format selector is available by moving it to toolbar1 if it's not there
			if (editorSettings.toolbar1 && !editorSettings.toolbar1.includes('formatselect')) {
				// Add formatselect to the beginning of toolbar1 for better visibility
				editorSettings.toolbar1 = 'formatselect,' + editorSettings.toolbar1
			}

			// Force show the second toolbar by default (where formatselect usually is)
			if (editorSettings.toolbar2) {
				// Make sure the advanced toolbar is visible by default
				editorSettings.wordpress_adv_hidden = false
			}

			// Setup function for editor initialization and event handling
			editorSettings.setup = (editor) => {
				// Handle content changes
				editor.on('change keyup undo redo', () => {
					const content = editor.getContent()
					if (content !== value) {
						onChangeRef.current(content)
					}
				})

				editor.on('blur', () => {
					const content = editor.getContent()
					if (content !== value) {
						onChangeRef.current(content)
					}
				})

				// Remove TinyMCE branding after editor initialization
				editor.on('init', () => {
					// Hide any branding elements
					const statusbar = editor.getContainer().querySelector('.mce-statusbar')
					if (statusbar) {
						statusbar.style.display = 'none'
					}

					// Setup editor container and styling
					const editorContainer = editor.getContainer()
					if (editorContainer) {
						editorContainer.style.border = 'none'
						editorContainer.style.display = 'block'
						editorContainer.style.visibility = 'visible'
					}

					// Style the iframe body for better integration
					const iframe = editor.getWin()
					if (iframe && iframe.document) {
						const style = iframe.document.createElement('style')
						style.innerHTML = `
							body {
								margin: 8px !important;
								font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
								font-size: 13px;
								line-height: 1.4;
							}
						`
						iframe.document.head.appendChild(style)
					}

					// Set initial content in both editor and textarea
					const textarea = document.getElementById(editorId)
					if (value) {
						editor.setContent(value)
						if (textarea) {
							textarea.value = value
						}
					}

					// Ensure textarea is hidden by default
					if (textarea) {
						textarea.style.display = 'none'
						textarea.setAttribute('aria-hidden', 'true')
					}

					// Force show the advanced toolbar (where formatselect is)
					if (editor.theme && editor.theme.panel) {
						// Show the second toolbar by default
						const advancedToolbar = editor.getContainer().querySelector('.mce-toolbar:nth-child(2)')
						if (advancedToolbar) {
							advancedToolbar.style.display = 'block'
						}
					}

					// Trigger wp_adv button to show advanced toolbar
					setTimeout(() => {
						const wpAdvButton = editor.getContainer().querySelector('.mce-i-wp_adv')
						if (wpAdvButton) {
							wpAdvButton.click()
						}
					}, 100)
				})
			}

			// Initialize TinyMCE
			window.tinymce.init(editorSettings)

			// Setup editor tabs functionality
			const tabs = editorRef.current.querySelectorAll('.wp-switch-editor')
			const textarea = document.getElementById(editorId)

			tabs.forEach((tab) => {
				tab.addEventListener('click', (e) => {
					e.preventDefault()
					const mode = tab.classList.contains('switch-tmce') ? 'tmce' : 'html'

					const editor = window.tinymce.get(editorId)
					if (!editor || !textarea) return

					// Sync content before switching modes
					if (mode === 'html') {
						// Switching to HTML mode - get content from TinyMCE and put it in textarea
						const content = editor.getContent()
						textarea.value = content
					} else {
						// Switching to Visual mode - get content from textarea and put it in TinyMCE
						const content = textarea.value || ''
						editor.setContent(content)
					}

					// Always use manual switching since switchEditors.go doesn't work reliably in Gutenberg
					const editorContainer = editor.getContainer()

					if (mode === 'html') {
						// Show textarea, hide TinyMCE
						if (textarea) {
							textarea.style.display = 'block'
							textarea.style.width = '100%'
							textarea.style.height = '300px'
							textarea.style.padding = '8px'
							textarea.style.border = '1px solid #ddd'
							textarea.style.borderRadius = '4px'
							textarea.style.fontFamily = 'Consolas, Monaco, monospace'
							textarea.style.fontSize = '13px'
							textarea.style.resize = 'vertical'
							textarea.setAttribute('aria-hidden', 'false')
						}
						if (editorContainer) {
							editorContainer.style.display = 'none'
						}
						// Update tab states
						tabs.forEach((t) => {
							if (t.classList.contains('switch-html')) {
								t.classList.add('wp-switch-editor-active')
							} else {
								t.classList.remove('wp-switch-editor-active')
							}
						})
						editorRef.current.querySelector('.wp-editor-wrap').classList.remove('tmce-active')
						editorRef.current.querySelector('.wp-editor-wrap').classList.add('html-active')
					} else {
						// Show TinyMCE, hide textarea
						if (textarea) {
							textarea.style.display = 'none'
							textarea.setAttribute('aria-hidden', 'true')
						}
						if (editorContainer) {
							editorContainer.style.display = 'block'
							editorContainer.style.visibility = 'visible'
						}
						// Update tab states
						tabs.forEach((t) => {
							if (t.classList.contains('switch-tmce')) {
								t.classList.add('wp-switch-editor-active')
							} else {
								t.classList.remove('wp-switch-editor-active')
							}
						})
						editorRef.current.querySelector('.wp-editor-wrap').classList.remove('html-active')
						editorRef.current.querySelector('.wp-editor-wrap').classList.add('tmce-active')
					}
				})
			})

			// Add event listener to textarea for HTML mode changes
			if (textarea) {
				textarea.addEventListener('input', (e) => {
					// Update the value and trigger onChange when in HTML mode
					const newValue = e.target.value
					if (newValue !== value) {
						onChangeRef.current(newValue)
					}
				})
			}
		} catch (error) {
			// Fallback to textarea if TinyMCE fails to initialize
			const { TextareaControl } = window.wp.components
			return createElement(TextareaControl, {
				key: property.id,
				label: property.label,
				value: value || '',
				onChange: onChange
			})
		}
	}

	const cleanupEditor = () => {
		if (window.tinymce) {
			const editor = window.tinymce.get(editorId)
			if (editor) {
				editor.remove()
			}
		}
	}

	return createElement('div', {
		ref: editorRef,
		style: {
			border: 'none'
		}
	})
}

// Expose function globally
window.createBricksRichTextControl = createBricksRichTextControl
