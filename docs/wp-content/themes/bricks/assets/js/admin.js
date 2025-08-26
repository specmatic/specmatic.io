/**
 * Classic editor (toggle editor tabs: Visual, Text, Bricks)
 *
 * @since 1.0
 */
function bricksAdminClassicEditor() {
	var bricksEditor = document.getElementById('bricks-editor')
	var wpEditor = document.getElementById('postdivrich')

	if (!bricksEditor || !wpEditor) {
		return
	}

	// Create "Bricks" button & add to classic editor tabs (next to "Visual", and "Text")
	var bricksButton = document.createElement('button')
	bricksButton.type = 'button'
	bricksButton.id = 'switch-bricks'
	bricksButton.classList.add('wp-switch-editor', 'switch-bricks')
	bricksButton.innerText = window.bricksData.title

	var editorTabs = wpEditor.querySelector('.wp-editor-tabs')

	if (editorTabs) {
		editorTabs.appendChild(bricksButton)
	}

	// Add Bricks editor tab content to DOM
	bricksEditor.after(wpEditor)

	document.addEventListener('click', function (e) {
		// Bricks tab
		if (e.target.id === 'switch-bricks') {
			// Don't trigger WordPress button events
			e.preventDefault()
			e.stopPropagation()

			// Hide WordPress content visual and text editors
			wpEditor.style.display = 'none'
			bricksEditor.style.display = 'block'

			// Toggle editor mode input field value
			document.getElementById('bricks-editor-mode').value = 'bricks'
		}

		// WordPress tab (Visual, Text)
		else if (['content-html', 'content-tmce'].indexOf(e.target.id) !== -1) {
			wpEditor.style.display = 'block'
			bricksEditor.style.display = 'none'

			// Toggle editor mode input field value
			document.getElementById('bricks-editor-mode').value = 'wordpress'
		}
	})

	// Automatically toggle Bricks button if the page is rendered with Bricks and has no post content (@since 1.12)
	if (window.bricksData.renderWithBricks) {
		bricksButton.click()
	}
}

/**
 * Admin import (Bricks settings, Bricks templates, etc.)
 *
 * @since 1.0
 */

function bricksAdminImport() {
	var importForm = document.getElementById('bricks-admin-import-form')
	if (!importForm) {
		return
	}

	var addNewButton = document.querySelector('#wpbody-content .page-title-action')
	if (!addNewButton) {
		return
	}

	var templateTagsButton = document.getElementById('bricks-admin-template-tags')
	if (templateTagsButton) {
		addNewButton.after(templateTagsButton)
	}

	var templateBundlesButton = document.getElementById('bricks-admin-template-bundles')
	if (templateBundlesButton) {
		addNewButton.after(templateBundlesButton)
	}

	var importButton = document.getElementById('bricks-admin-import-action')
	if (importButton) {
		addNewButton.after(importButton)
	}

	var importFormContent = document.getElementById('bricks-admin-import-form-wrapper')

	addNewButton.after(importFormContent)

	var toggleTemplateImporter = document.querySelectorAll('.bricks-admin-import-toggle')

	toggleTemplateImporter.forEach(function (toggle) {
		toggle.addEventListener('click', function () {
			importFormContent.style.display =
				importFormContent.style.display === 'block' ? 'none' : 'block'
		})
	})

	var progressDiv = document.querySelector('#bricks-admin-import-form-wrapper .import-progress')

	importForm.addEventListener('submit', function (event) {
		event.preventDefault()

		// Adds action, nonce and referrer from form hidden fields (@since 1.5.4)
		var formData = new FormData(importForm)
		var files = document.getElementById('bricks_import_files').files

		for (var i = 0; i < files.length; i++) {
			var file = files[i]
			formData.append('files[' + i + ']', file)
		}

		jQuery.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: formData,
			processData: false,
			contentType: false,
			beforeSend: () => {
				importForm.setAttribute('disabled', 'disabled')
				if (progressDiv) {
					progressDiv.classList.add('is-active')
				}
			},
			success: function (res) {
				importForm.removeAttribute('disabled')
				if (progressDiv) {
					progressDiv.classList.remove('is-active')
				}
				location.reload()
			}
		})
	})
}

/**
 * Save license key
 *
 * @since 1.0
 */

function bricksAdminSaveLicenseKey() {
	var licenseKeyForm = document.getElementById('bricks-license-key-form')

	if (!licenseKeyForm) {
		return
	}

	var action = licenseKeyForm.action.value
	var nonce = licenseKeyForm.nonce.value // @since 1.5.4
	var submitButton = licenseKeyForm.querySelector('input[type=submit]')

	licenseKeyForm.addEventListener('submit', function (e) {
		e.preventDefault()

		submitButton.disabled = true

		var licenseKey = licenseKeyForm.license_key.value

		jQuery.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: {
				action: action,
				licenseKey: licenseKey,
				nonce: nonce
			},
			success: function (response) {
				if (action === 'bricks_deactivate_license') {
					location.reload()
				} else if (action === 'bricks_activate_license') {
					if (response.success) {
						if (response.data.hasOwnProperty('message')) {
							licenseKeyForm.querySelector('.success-message').innerHTML = response.data.message
						}

						setTimeout(() => {
							location.reload()
						}, 1000)
					} else {
						submitButton.disabled = false

						if (response.data.hasOwnProperty('message')) {
							licenseKeyForm.querySelector('.error-message').innerHTML = response.data.message
						}
					}
				}
			}
		})
	})
}

/**
 * Toggle license key (input type: plain text/password)
 *
 * @since 1.3.5
 */
function bricksAdminToggleLicenseKey() {
	var toggleLicenseKeyIcon = document.getElementById('bricks-toggle-license-key')

	if (!toggleLicenseKeyIcon) {
		return
	}

	toggleLicenseKeyIcon.addEventListener('click', function (e) {
		e.preventDefault()

		if (e.target.classList.contains('dashicons-hidden')) {
			e.target.classList.remove('dashicons-hidden')
			e.target.classList.add('dashicons-visibility')
			e.target.previousElementSibling.type = 'text'
		} else {
			e.target.classList.remove('dashicons-visibility')
			e.target.classList.add('dashicons-hidden')
			e.target.previousElementSibling.type = 'password'
		}
	})
}

function bricksAdminSettings() {
	var settingsForm = document.querySelector('#bricks-settings')

	if (!settingsForm) {
		return
	}

	// Toggle tabs
	var settingsTabs = document.querySelectorAll('#bricks-settings-tabs-wrapper a')
	var settingsFormTables = settingsForm.querySelectorAll('table')

	function showTab(tabId) {
		var tabTable = document.getElementById(tabId)

		for (var i = 0; i < settingsFormTables.length; i++) {
			var table = settingsFormTables[i]

			if (table.getAttribute('id') === tabId) {
				table.classList.add('active')
			} else {
				table.classList.remove('active')
			}
		}
	}

	// Switch tabs listener
	for (var i = 0; i < settingsTabs.length; i++) {
		settingsTabs[i].addEventListener('click', function (e) {
			e.preventDefault()

			var tabId = e.target.getAttribute('data-tab-id')

			if (!tabId) {
				return
			}

			location.hash = tabId
			window.scrollTo({ top: 0 })

			for (var i = 0; i < settingsTabs.length; i++) {
				settingsTabs[i].classList.remove('nav-tab-active')
			}

			e.target.classList.add('nav-tab-active')

			showTab(tabId)
		})
	}

	// Check URL for active tab on page load
	var activeTabId = location.hash.replace('#', '')

	if (activeTabId) {
		var activeTab = document.querySelector('[data-tab-id="' + activeTabId + '"]')

		if (activeTab) {
			activeTab.click()
		}
	}

	// Save/reset settings
	var submitWrapper = settingsForm.querySelector('.submit-wrapper')
	var spinner = settingsForm.querySelector('.spinner.saving')

	if (!settingsForm) {
		return
	}

	settingsForm.addEventListener('submit', function (e) {
		e.preventDefault()
	})

	// Save settings
	var saveSettingsButton = settingsForm.querySelector('input[name="save"]')

	if (saveSettingsButton) {
		saveSettingsButton.addEventListener('click', function () {
			if (submitWrapper) {
				submitWrapper.remove()
			}

			if (spinner) {
				spinner.classList.add('is-active')
			}

			window.jQuery.ajax({
				type: 'POST',
				url: window.bricksData.ajaxUrl,
				data: {
					action: 'bricks_save_settings',
					formData: window.jQuery(settingsForm).serialize(),
					nonce: window.bricksData.nonce
				},
				success: function () {
					// Show save message
					let hash = window.location.hash

					window.location.href = window.location.search += `&bricks_notice=settings_saved${hash}`
				}
			})
		})
	}

	// Reset settings
	var resetSettingsButton = settingsForm.querySelector('input[name="reset"]')

	if (resetSettingsButton) {
		resetSettingsButton.addEventListener('click', function () {
			var confirmed = confirm(window.bricksData.i18n.confirmResetSettings)

			if (!confirmed) {
				return
			}

			if (submitWrapper) {
				submitWrapper.remove()
			}

			if (spinner) {
				spinner.classList.add('is-active')
			}

			window.jQuery.ajax({
				type: 'POST',
				url: window.bricksData.ajaxUrl,
				data: {
					action: 'bricks_reset_settings',
					nonce: window.bricksData.nonce
				},
				success: function () {
					// Show reset message
					window.location.href = window.location.search += '&bricks_notice=settings_resetted'
				}
			})
		})
	}

	// Enable/disable code execution
	var enableCodeExecutionCheckbox = settingsForm.querySelector('input[name="executeCodeEnabled"]')
	if (enableCodeExecutionCheckbox) {
		enableCodeExecutionCheckbox.addEventListener('click', function (e) {
			var executeCodeCapabilities = settingsForm.querySelectorAll(
				'input[name^="executeCodeCapabilities"'
			)

			executeCodeCapabilities.forEach(function (checkboxInput) {
				checkboxInput.disabled = !e.target.checked
			})
		})
	}
}

/**
 * Generate CSS files
 *
 * By first getting list of all CSS files that need to be generated.
 * Then generated them one-by-one via individual AJAX calls to avoid any server timeouts.
 */
function bricksAdminGenerateCssFiles() {
	button = document.querySelector('#bricks-css-loading-generate button')

	if (!button) {
		return
	}

	button.addEventListener('click', function (e) {
		e.preventDefault()

		button.setAttribute('disabled', 'disabled')
		button.classList.add('wait')

		var resultsEl = document.querySelector('#bricks-css-loading-generate .results')

		if (resultsEl) {
			resultsEl.classList.remove('hide')

			var results = resultsEl.querySelector('ul')
			var counter = resultsEl.querySelector('.count')
			var done = resultsEl.querySelector('.done')

			results.innerHTML = ''
			counter.innerHTML = 0

			if (done) {
				done.remove()
			}

			var theEnd = resultsEl.querySelector('.end')

			if (theEnd) {
				theEnd.remove()
			}
		}

		jQuery.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: {
				action: 'bricks_get_css_files_list',
				nonce: bricksData.nonce
			},
			success: function (res) {
				// Start generating CSS files (index = 0)
				bricksAdminGenerateCssFile(0, results, counter, res.data)
			}
		})
	})
}

/**
 * Code review actions
 *
 * @since 1.9.7
 */
function bricksAdminCodeReview() {
	let viewMode = 'individual'

	// Show all code review items or review individual item
	const reviewCount = document.querySelector('.bricks-code-review-description')
	const showAllButton = document.querySelector('.bricks-code-review-action.show-all')
	const individualButton = document.querySelector('.bricks-code-review-action.individual')
	const codeReviewItems = document.querySelectorAll('.bricks-code-review-item')
	const prevButton = document.querySelector('.bricks-code-review-action.prev')
	const nextButton = document.querySelector('.bricks-code-review-action.next')
	const checkedButtons = document.querySelectorAll('.bricks-code-review-item-check')

	if (!showAllButton || !codeReviewItems || !individualButton) {
		return
	}

	const recalculateTotalReviewed = (count = 'up') => {
		let totalReviewed = document.querySelector('.bricks-code-review-total-reviewed')
		// let totalMarked = document.querySelectorAll('.bricks-code-review-item.item-marked').length
		let totalMarked = totalReviewed.innerText
		totalMarked = totalMarked ? parseInt(totalMarked) : 1

		// Next button
		if (count === 'up') {
			totalMarked++
		}

		// Prev button
		else {
			totalMarked--
		}

		if (totalReviewed) {
			totalReviewed.innerText = totalMarked
		}
	}

	// Show all code review items
	showAllButton.addEventListener('click', function (e) {
		e.preventDefault()

		viewMode = 'all'

		// Hide review count
		reviewCount.classList.add('action-hide')

		// Hide itself
		showAllButton.classList.add('action-hide')

		// Show individual button
		individualButton.classList.remove('action-hide')

		// Hide previous & next buttons
		prevButton.classList.add('action-hide')
		nextButton.classList.add('action-hide')

		// Show all code review items
		codeReviewItems.forEach(function (item) {
			item.classList.remove('item-hide')
		})
	})

	// Show individual code review item
	individualButton.addEventListener('click', function (e) {
		e.preventDefault()

		viewMode = 'individual'

		// Show review count
		reviewCount.classList.remove('action-hide')

		// Hide itself
		individualButton.classList.add('action-hide')

		// Show show all button
		showAllButton.classList.remove('action-hide')

		// Show previous & next buttons
		prevButton.classList.remove('action-hide')
		nextButton.classList.remove('action-hide')

		// Hide all code review items
		codeReviewItems.forEach(function (item) {
			item.classList.add('item-hide')
		})

		// Show the item-current
		let currentItem = document.querySelector('.bricks-code-review-item.item-current')
		if (currentItem) {
			currentItem.classList.remove('item-hide')
		}
	})

	// Show previous code review item
	prevButton.addEventListener('click', function (e) {
		e.preventDefault()

		let currentItem = document.querySelector('.bricks-code-review-item.item-current')
		let previousItem = currentItem.previousElementSibling

		if (previousItem) {
			currentItem.classList.remove('item-current')
			currentItem.classList.add('item-hide')
			previousItem.classList.add('item-current')
			previousItem.classList.remove('item-hide')

			recalculateTotalReviewed('down')
		}
	})

	// Show next code review item
	nextButton.addEventListener('click', function (e) {
		e.preventDefault()

		let currentItem = document.querySelector('.bricks-code-review-item.item-current')
		let nextItem = currentItem.nextElementSibling

		if (nextItem) {
			currentItem.classList.remove('item-current')
			currentItem.classList.add('item-hide')
			nextItem.classList.add('item-current')
			nextItem.classList.remove('item-hide')

			recalculateTotalReviewed('up')
		}
	})

	// Mark the code review item as checked
	if (checkedButtons.length) {
		checkedButtons.forEach(function (button) {
			button.addEventListener('click', function (e) {
				e.preventDefault()

				let item = button.closest('.bricks-code-review-item')

				if (item) {
					item.classList.add('item-marked')
					recalculateTotalReviewed()

					// Go to next item
					if (viewMode === 'individual') {
						setTimeout(() => {
							nextButton.click()
						}, 400)
					}
				}
			})
		})
	}
}

/**
 * Regenerate Bricks CSS files for modified default breakpoint width
 *
 * @since 1.5.1
 */
function bricksAdminBreakpointsRegenerateCssFiles() {
	let button = document.getElementById('breakpoints-regenerate-css-files')

	if (!button) {
		return
	}

	let checkIcon = button.querySelector('i')

	button.addEventListener('click', function (e) {
		e.preventDefault()

		jQuery.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: {
				action: 'bricks_regenerate_bricks_css_files',
				nonce: bricksData.nonce
			},
			beforeSend: () => {
				button.setAttribute('disabled', 'disabled')
				button.classList.add('wait')
				checkIcon.classList.add('hide')
			},
			success: function (res) {
				button.removeAttribute('disabled')
				button.classList.remove('wait')
				checkIcon.classList.remove('hide')
			}
		})
	})
}

function bricksAdminGenerateCssFile(index, results, counter, data) {
	return jQuery
		.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: {
				action: 'bricks_regenerate_css_file',
				data: data[index],
				index: index
			},
			success: function (res) {
				var fileName = res.data.hasOwnProperty('file_name') ? res.data.file_name : false

				if (fileName) {
					var html = ''
					var count = counter ? parseInt(counter.innerText) : 0

					if (Array.isArray(fileName)) {
						fileName.forEach(function (fileName) {
							html += '<li>' + fileName + '</li>'
							count++
						})
					} else {
						html += '<li>' + fileName + '</li>'
						count++
					}

					if (!res.success) {
						html = html.replace('<li>', '<li class="error">')
					}

					if (results) {
						results.insertAdjacentHTML('afterbegin', html)
					}

					if (counter) {
						counter.innerText = count
					}
				}
			}
		})
		.then(function (res) {
			// Finished processing all entries
			if (index === data.length) {
				var button = document.querySelector('#bricks-css-loading-generate button')

				button.removeAttribute('disabled')
				button.classList.remove('wait')

				var infoText = document.querySelector('#bricks-css-loading-generate .info')

				if (infoText) {
					infoText.remove()
				}

				if (results) {
					results.insertAdjacentHTML('beforebegin', '<div class="done">... THE END :)</div>')
				}
			}

			// Continue with next entry
			else {
				bricksAdminGenerateCssFile(index + 1, results, counter, data)
			}
		})
}

/**
 * Run Converter
 *
 * @since 1.4:   Convert 'bricks-element-' ID & class name prefix to 'brxe-'
 * @since 1.5: Convert elements to nestable elements
 */
function bricksAdminRunConverter() {
	var converterButtons = document.querySelectorAll('.bricks-run-converter')

	if (!converterButtons.length) {
		return
	}

	converterButtons.forEach(function (button) {
		button.addEventListener('click', function (e) {
			e.preventDefault()

			let data = {
				action: 'bricks_get_converter_items',
				nonce: bricksData.nonce,
				convert: []
			}

			// Convert global elements to components (@since 2.0)
			if (button.id === 'bricks-run-converter-global-elements') {
				data.convert.push('globalElementsToComponents')
			}

			if (document.getElementById('convert_element_ids_classes').checked) {
				data.convert.push('elementClasses')
			}

			if (document.getElementById('convert_container').checked) {
				data.convert.push('container')
			}

			// @since 1.5.1 to add position: relative as needed
			if (document.getElementById('add_position_relative').checked) {
				data.convert.push('addPositionRelative')
			}

			// @since 1.6 to convert entry animation ('_animation') to interactions
			if (document.getElementById('entry_animation_to_interaction').checked) {
				data.convert.push('entryAnimationToInteraction')
			}

			if (!data.convert.length) {
				return
			}

			jQuery.ajax({
				type: 'POST',
				url: bricksData.ajaxUrl,
				data,
				beforeSend: () => {
					button.setAttribute('disabled', 'disabled')
					button.classList.add('wait')
				},
				success: (res) => {
					console.info('bricks_get_converter_items', res.data)

					// Start running converter (index = 0)
					let index = 0
					let data = res.data.items
					let convert = res.data.convert

					bricksAdminConvert(index, data, convert)
				}
			})
		})
	})
}

function bricksAdminConvert(index, data, convert) {
	return jQuery.ajax({
		type: 'POST',
		url: bricksData.ajaxUrl,
		data: {
			action: 'bricks_run_converter',
			nonce: bricksData.nonce,
			data: data[index],
			convert: convert
		},
		success: function (res) {
			var button = document.querySelector('.bricks-run-converter[disabled]')
			var resultsEl = button.parentNode.querySelector('.results')

			// Add results HTML (div.results > ul)
			if (!resultsEl) {
				resultsEl = document.createElement('div')
				resultsEl.classList.add('results')

				var resultsList = document.createElement('ul')
				resultsEl.appendChild(resultsList)

				button.parentNode.appendChild(resultsEl)
			}

			// Re-run converter: Clear results
			else if (resultsEl && index === 0) {
				resultsEl.querySelector('ul').innerHTML = ''
			}

			var label = res.data.hasOwnProperty('label') ? res.data.label : false

			// Add converted item as list item (<li>)
			if (label) {
				var resultItem = document.createElement('li')
				resultItem.innerHTML = label

				resultsEl.querySelector('ul').prepend(resultItem)
			}

			console.warn('run_converter', index, label, res.data)

			// Finished processing all entries
			if (index === data.length) {
				button.removeAttribute('disabled')
				button.classList.remove('wait')

				var resultItem = document.createElement('li')
				resultItem.classList.add('done')
				resultItem.innerText = '... THE END :)'

				resultsEl.querySelector('ul').prepend(resultItem)
			}

			// Continue with next entry
			else {
				bricksAdminConvert(index + 1, data, convert)
			}
		}
	})
}

/**
 * Copy template shortcode to clipboard
 */
function bricksTemplateShortcodeCopyToClipboard() {
	var copyToClipboardElements = document.querySelectorAll('.bricks-copy-to-clipboard')

	if (!copyToClipboardElements) {
		return
	}

	copyToClipboardElements.forEach(function (element) {
		element.addEventListener('click', function (e) {
			if (navigator.clipboard) {
				if (!window.isSecureContext) {
					alert('Clipboard API rejected: Not in secure context (HTTPS)')
					return
				}

				// Return: Don't copy if already copied (prevents double-click issue)
				if (element.classList.contains('copied')) {
					e.preventDefault()
					return
				}

				var content = element.value
				var message = element.getAttribute('data-success')

				navigator.clipboard.writeText(content)

				element.value = message
				element.classList.add('copied')

				setTimeout(function () {
					element.value = content
					element.classList.remove('copied')
				}, 2000)
			}
		})
	})
}

/**
 * Dismiss HTTPS notice
 *
 * Timeout required to ensure the node is added to the DOM.
 *
 * @since 1.8.4
 */
function bricksDismissHttpsNotice() {
	setTimeout(() => {
		let dismissButton = document.querySelector('.brxe-https-notice .notice-dismiss')

		if (dismissButton) {
			dismissButton.addEventListener('click', function () {
				jQuery.ajax({
					type: 'POST',
					url: bricksData.ajaxUrl,
					data: {
						action: 'bricks_dismiss_https_notice',
						nonce: bricksData.nonce
					}
				})
			})
		}
	}, 400)
}

/**
 * Delete form submissions table
 *
 * @since 1.9.2
 */
function bricksDropFormSubmissionsTable() {
	let button = document.getElementById('bricks-drop-form-db')

	if (!button) {
		return
	}

	button.addEventListener('click', function (e) {
		e.preventDefault()

		var confirmed = confirm(bricksData.i18n.confirmDropFormSubmissionsTable)

		if (!confirmed) {
			return
		}

		jQuery.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: {
				action: 'bricks_form_submissions_drop_table',
				nonce: bricksData.nonce
			},
			beforeSend: () => {
				button.setAttribute('disabled', 'disabled')
				button.classList.add('wait')
			},
			success: function (res) {
				button.removeAttribute('disabled')
				button.classList.remove('wait')

				alert(res.data.message)
				location.reload()
			}
		})
	})
}

/**
 * Reset form submissions entries
 *
 * @since 1.9.2
 */
function bricksResetFormSubmissionsTable() {
	let button = document.getElementById('bricks-reset-form-db')

	if (!button) {
		return
	}

	button.addEventListener('click', function (e) {
		e.preventDefault()

		var confirmed = confirm(bricksData.i18n.confirmResetFormSubmissionsTable)

		if (!confirmed) {
			return
		}

		jQuery.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: {
				action: 'bricks_form_submissions_reset_table',
				nonce: bricksData.nonce
			},
			beforeSend: () => {
				button.setAttribute('disabled', 'disabled')
				button.classList.add('wait')
			},
			success: function (res) {
				button.removeAttribute('disabled')
				button.classList.remove('wait')

				alert(res.data.message)
				location.reload()
			}
		})
	})
}

/**
 * Delete all submissions of spefic form (ID)
 *
 * @since 1.9.2
 */
function bricksDeleteFormSubmissionsByFormId() {
	// Return: Not on "Form submissions" page
	if (!document.body.classList.contains('bricks_page_bricks-form-submissions')) {
		return
	}

	let deleteButtons = document.querySelectorAll('.column-actions [data-form-id]')

	for (var i = 0; i < deleteButtons.length; i++) {
		let button = deleteButtons[i]
		button.addEventListener('click', function (e) {
			e.preventDefault()

			let formId = button.getAttribute('data-form-id')

			var confirmed = confirm(
				bricksData.i18n.confirmResetFormSubmissionsFormId.replace('[form_id]', `"${formId}"`)
			)

			if (!confirmed) {
				return
			}

			jQuery.ajax({
				type: 'POST',
				url: bricksData.ajaxUrl,
				data: {
					action: 'bricks_form_submissions_delete_form_id',
					nonce: bricksData.nonce,
					formId: formId
				},
				beforeSend: () => {
					button.setAttribute('disabled', 'disabled')
					button.classList.add('wait')
				},
				success: function (res) {
					button.removeAttribute('disabled')
					button.classList.remove('wait')

					alert(res.data.message)
					location.reload()
				}
			})
		})
	}
}

/**
 * Dismiss Instagram access token admin notice
 *
 * Timeout required to ensure the node is added to the DOM.
 *
 * @since 1.9.1
 */
function bricksDismissInstagramAccessTokenNotice() {
	setTimeout(() => {
		let dismissButton = document.querySelector('.brxe-instagram-token-notice .notice-dismiss')

		if (dismissButton) {
			dismissButton.addEventListener('click', function () {
				jQuery.ajax({
					type: 'POST',
					url: bricksData.ajaxUrl,
					data: {
						action: 'bricks_dismiss_instagram_access_token_notice',
						nonce: bricksData.nonce
					}
				})
			})
		}
	}, 400)
}

/**
 * Remote templates URLs: Add button logic
 *
 * @since 1.9.4
 */
function bricksRemoteTemplateUrls() {
	let addMoreButton = document.getElementById('add-remote-template-button')

	if (!addMoreButton) {
		return
	}

	addMoreButton.addEventListener('click', function (e) {
		e.preventDefault()

		// Get last remote template wrapper to clone it for new remote template
		let remoteTemplateWrappers = document.querySelectorAll('.remote-template-wrapper')
		let remoteTemplateWrapper = remoteTemplateWrappers[remoteTemplateWrappers.length - 1]

		if (!remoteTemplateWrapper) {
			return
		}

		let clone = remoteTemplateWrapper.cloneNode(true)
		let labels = clone.querySelectorAll('label')
		labels.forEach((label) => {
			// Replace 'remoteTemplates[index]' 'for' attribute with new index
			label.setAttribute(
				'for',
				label.getAttribute('for').replace(/\[(\d+)\]/, function (match, index) {
					return '[' + (parseInt(index) + 1) + ']'
				})
			)
		})

		let inputs = clone.querySelectorAll('input')

		inputs.forEach((input) => {
			// Clear URL input value
			input.value = ''

			// Replace 'remoteTemplates[index]' 'name' attribute with new index
			input.name = input.name.replace(/\[(\d+)\]/, function (match, index) {
				return '[' + (parseInt(index) + 1) + ']'
			})

			// Replace 'remoteTemplates[index]' 'id' attribute with new index
			input.id = input.id.replace(/\[(\d+)\]/, function (match, index) {
				return '[' + (parseInt(index) + 1) + ']'
			})
		})

		remoteTemplateWrapper.after(clone)
	})
}

/**
 * Delete my template screenshots
 *
 * @since 1.10
 */
function bricksDeleteTemplateScreenshots() {
	let button = document.getElementById('delete-template-screenshots-button')

	if (!button) {
		return
	}

	button.addEventListener('click', function (e) {
		e.preventDefault()

		var confirmed = confirm(bricksData.i18n.confirmDeleteTemplateScreenshots)

		if (!confirmed) {
			return
		}

		jQuery.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: {
				action: 'bricks_delete_template_screenshots',
				nonce: bricksData.nonce
			},
			beforeSend: () => {
				button.setAttribute('disabled', 'disabled')
				button.classList.add('wait')
			},
			success: function (res) {
				button.removeAttribute('disabled')
				button.classList.remove('wait')

				alert(res.data.message)

				if (res.success) {
					location.reload()
				}
			}
		})
	})
}

/**
 * Reindex filters
 *
 * @since 1.9.6
 */
function bricksReindexFilters() {
	let button = document.getElementById('bricks-reindex-filters')
	let progressText = document.querySelector('.indexer-progress')
	let indexButton = document.getElementById('bricks-run-index-job')

	if (!button || !progressText || !indexButton) {
		return
	}

	button.addEventListener('click', function (e) {
		e.preventDefault()

		var confirmed = confirm(bricksData.i18n.confirmReindexFilters)

		if (!confirmed) {
			return
		}

		jQuery.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: {
				action: 'bricks_reindex_query_filters',
				nonce: bricksData.nonce
			},
			beforeSend: () => {
				button.setAttribute('disabled', 'disabled')
				button.classList.add('wait')
			},
			success: function (res) {
				button.removeAttribute('disabled')
				button.classList.remove('wait')

				if (res.success) {
					progressText.innerText = res.data.message
					setTimeout(() => {
						// Trigger indexerObserver to start checking progress after a short delay
						indexButton.setAttribute('data-no-confirm', 'true')
						indexButton.click()
					}, 500)
				} else {
					console.error('bricks_reindex_query_filters:error', res.data)
				}
			}
		})
	})
}

/**
 * Run query filter index job
 *
 * @since 1.10
 */
function bricksRunIndexJob() {
	let button = document.getElementById('bricks-run-index-job')
	let progressText = document.querySelector('.indexer-progress')
	let checkIcon = button ? button.querySelector('i') : false

	let removeJobsDiv = document.getElementById('bricks-remove-jobs-wrapper')
	let removeJobsButton = document.getElementById('bricks-remove-index-jobs')
	let queryFiltersTd = document.getElementById('bricks-query-filter-td')
	let halted = false // Flag to stop observer

	if (!button || !progressText || !checkIcon || !removeJobsButton || !removeJobsDiv) {
		return
	}

	// Check progress every 3 seconds: Trigger background indexer manually instead of waiting for WP Cron
	const IndexerObserver = () => {
		jQuery.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: {
				action: 'bricks_run_index_job',
				nonce: bricksData.nonce
			},
			success: function (res) {
				let progress = res?.data?.progress || false
				let pending = res?.data?.pending || false

				if (progressText && progress) {
					progressText.innerHTML = progress
				}

				if (pending == 0 || halted) {
					button.removeAttribute('disabled')
					button.classList.remove('wait')
					checkIcon.classList.remove('hide')
					if (halted && pending > 0) {
						removeJobsDiv.classList.remove('hide')
					}
				} else {
					// Wait for 3 seconds and check again
					setTimeout(() => {
						IndexerObserver()
					}, 3000)
				}
			},
			beforeSend: () => {
				button.setAttribute('disabled', 'disabled')
				button.classList.add('wait')
				removeJobsDiv.classList.add('hide')
			}
		})
	}

	let isRunning = button.classList.contains('wait')
	if (isRunning) {
		// Initial load page detected indexer is running, then start observer
		IndexerObserver()
	}

	// Continue index job button
	button.addEventListener('click', function (e) {
		e.preventDefault()

		// Check if no-confirm attribute is set (from reindex filters)
		let noConfirm = button.getAttribute('data-no-confirm')

		if (!noConfirm) {
			var confirmed = confirm(bricksData.i18n.confirmTriggerIndexJob)

			if (!confirmed) {
				return
			}
		}

		IndexerObserver()

		// Always reset no-confirm attribute
		button.removeAttribute('data-no-confirm')
		checkIcon.classList.add('hide')

		// Always hide remove jobs div
		removeJobsDiv.classList.add('hide')
	})

	// Remove all index jobs button (only visible if indexer is not running)
	removeJobsButton.addEventListener('click', function (e) {
		e.preventDefault()

		var confirmed = confirm(bricksData.i18n.confirmRemoveAllIndexJobs)

		if (!confirmed) {
			return
		}

		halted = true // Stop observer for indexer

		jQuery.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: {
				action: 'bricks_remove_all_index_jobs',
				nonce: bricksData.nonce
			},
			success: function (res) {
				if (res.success) {
					// Wait for 10 seconds and reload the page, give some time for the running indexer to stop
					setTimeout(() => {
						alert(res.data.message)
						location.reload()
					}, 10000)
				}
			},
			beforeSend: () => {
				removeJobsButton.setAttribute('disabled', 'disabled')
				removeJobsButton.classList.add('wait')
				queryFiltersTd.classList.add('blocking')

				let infoDiv = document.createElement('div')
				infoDiv.classList.add('blocking-info-wrapper')
				infoDiv.innerHTML = `<p class="message info">${bricksData.i18n.removingIndexJobsInfo}</p>`

				queryFiltersTd.appendChild(infoDiv)
			}
		})
	})
}

/**
 * Fix filter element database
 *
 * @since 1.12.2
 */
function bricksFixElementDB() {
	let button = document.getElementById('bricks-fix-filter-element-db')

	if (!button) {
		return
	}

	button.addEventListener('click', function (e) {
		e.preventDefault()

		var confirmed = confirm(bricksData.i18n.confirmFixElementDB)

		if (!confirmed) {
			return
		}

		jQuery.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: {
				action: 'bricks_fix_filter_element_db',
				nonce: bricksData.nonce
			},
			beforeSend: () => {
				button.setAttribute('disabled', 'disabled')
				button.classList.add('wait')
			},
			success: function (res) {
				button.removeAttribute('disabled')
				button.classList.remove('wait')

				alert(res.data.message)
				location.reload()
			}
		})
	})
}

/**
 * Regenerate code element & codeEditor signatures
 *
 * @since 1.9.7
 */
function bricksRegenerateCodeSignatures() {
	let button = document.getElementById('bricks-regenerate-code-signatures')

	if (!button) {
		return
	}

	button.addEventListener('click', function (e) {
		e.preventDefault()

		var confirmed = confirm(bricksData.i18n.confirmRegenerateCodeSignatures)

		if (!confirmed) {
			return
		}

		jQuery.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: {
				action: 'bricks_regenerate_code_signatures',
				nonce: bricksData.nonce
			},
			beforeSend: () => {
				button.setAttribute('disabled', 'disabled')
				button.classList.add('wait')
			},
			success: function (res) {
				button.removeAttribute('disabled')
				button.classList.remove('wait')

				alert(res.data.message)

				if (res.success) {
					location.reload()
				} else {
					console.error('bricks_regenerate_code_element_signatures:error', res.data)
				}
			}
		})
	})
}

/**
 * Code review filter
 *
 * @since 1.9.7
 */
function bricksAdminCodeReviewFilter() {
	let filterSelect = document.getElementById('code-review-filter')

	if (!filterSelect) {
		return
	}

	filterSelect.addEventListener('change', (e) => {
		let url = new URL(window.location.href)
		url.searchParams.set('code-review', e.target.value)
		window.location.href = url.toString()
	})
}

/**
 * Global elements review
 *
 * @since 2.0
 */
function bricksAdminGlobalElementsReview() {
	const convertButtons = document.querySelectorAll('.bricks-convert-global-elements')

	convertButtons.forEach((button) => {
		button.addEventListener('click', (e) => {
			e.preventDefault()

			let unlinkNestables = false
			let reviewItemNode = e.target.closest('.bricks-code-review-item')

			if (reviewItemNode && reviewItemNode.querySelector('.nestable')) {
				unlinkNestables = confirm(window.bricksData.i18n.globalElementsConvertConfirm)
			}

			jQuery.ajax({
				type: 'POST',
				url: bricksData.ajaxUrl,
				data: {
					action: 'bricks_convert_global_elements',
					nonce: bricksData.nonce,
					postId: button.getAttribute('data-post-id'),
					unlinkNestables: unlinkNestables
				},
				beforeSend: () => {
					button.setAttribute('disabled', 'disabled')
					button.classList.add('wait')
				},
				success: (res) => {
					button.removeAttribute('disabled')
					button.classList.remove('wait')

					if (res.data.message) {
						alert(res.data.message)
					}

					// Reload tab (easier than updating the DOM)
					location.reload()
				}
			})
		})
	})
}

/**
 * Maintenance mode: Toggle visibility of render header/footer checkboxes
 *
 * @since 1.9.9
 */
function bricksAdminMaintenanceTemplateListener() {
	let maintenanceTemplateSelect = document.getElementById('maintenance-template')

	let maintenanceTemplateSelectSection = document.getElementById('maintenance-template-section')
	let renderSection = document.getElementById('maintenance-render-section')

	if (!renderSection) {
		return
	}

	function toggleRenderOptions() {
		let selectedValue = maintenanceTemplateSelect.value
		if (selectedValue === '') {
			renderSection.style.display = 'none'
			maintenanceTemplateSelectSection.style.borderBottom = 'none'
		} else {
			renderSection.style.display = 'block'
			maintenanceTemplateSelectSection.style.borderBottom = '1px solid var(--admin-color-border)'
		}
	}

	// Initial check
	toggleRenderOptions()

	// Add event listener
	maintenanceTemplateSelect.addEventListener('change', toggleRenderOptions)
}

/**
 * Adds a 'scroll' class to thumbnail anchors if the image inside is taller than the anchor.
 * This function ensures that the scroll animation is only applied to images that are
 * visually taller than their container.
 *
 * NOTE: We didn't use @keyframes as we need a dynamic duration and to only scroll when the image is taller than the thumbnail.
 *
 * @since 1.10
 */
function bricksTemplateThumbnailAddScrollAnimation() {
	const thumbnails = document.querySelectorAll('.template_thumbnail a')

	thumbnails.forEach((thumbnail) => {
		const img = thumbnail.querySelector('img')

		/**
		 * Checks the computed height of the image and the thumbnail anchor.
		 * Adds the 'scroll' class to the thumbnail anchor if the image height
		 * is greater than the thumbnail height, and sets up the scroll event listeners.
		 */
		function checkImageHeight() {
			const imgHeight = img.getBoundingClientRect().height
			const thumbnailHeight = thumbnail.getBoundingClientRect().height

			if (imgHeight > thumbnailHeight) {
				const scrollAmount = thumbnailHeight - imgHeight
				const duration = calculateScrollDuration(scrollAmount)

				thumbnail.classList.add('scroll')

				thumbnail.addEventListener('mouseenter', () => {
					startScrollAnimation(img, 0, scrollAmount, duration)
				})

				thumbnail.addEventListener('mouseleave', () => {
					const currentTop = parseFloat(img.style.top) || scrollAmount
					startScrollAnimation(img, currentTop, 0, duration)
				})
			}
		}

		/**
		 * Calculates the scroll duration based on the scroll amount.
		 *
		 * @param {number} scrollAmount - The amount to scroll.
		 * @returns {number} - The calculated duration in milliseconds.
		 */
		function calculateScrollDuration(scrollAmount) {
			const baseDuration = 2000 // Base duration in milliseconds for a significant scroll
			const maxScrollAmount = 200 // Define a max scroll amount for reference
			return (Math.abs(scrollAmount) * baseDuration) / maxScrollAmount
		}

		/**
		 * Animates the image's top property to create a smooth scrolling effect.
		 *
		 * @param {HTMLElement} img - The image element to scroll.
		 * @param {number} startTop - The initial top position.
		 * @param {number} endTop - The final top position.
		 * @param {number} duration - The duration of the scroll animation in milliseconds.
		 */
		function startScrollAnimation(img, startTop, endTop, duration) {
			let animationFrame
			let start

			function scroll(timestamp) {
				if (!start) start = timestamp // Initialize start time
				const elapsed = timestamp - start // Calculate elapsed time
				const progress = Math.min(elapsed / duration, 1) // Calculate progress

				// Update the image's top position based on progress
				img.style.top = startTop + (endTop - startTop) * progress + 'px'

				// Continue the animation if it's not finished
				if (progress < 1) {
					animationFrame = requestAnimationFrame(scroll)
				}
			}

			cancelAnimationFrame(animationFrame) // Cancel any ongoing animation
			animationFrame = requestAnimationFrame(scroll) // Start a new animation
		}

		// Check the image height after it has loaded
		img.addEventListener('load', checkImageHeight)

		// For cached images that might load instantly, check the height immediately
		if (img.complete) {
			checkImageHeight()
		}
	})
}

/**
 * Toggle visibility of WordPress auth URL redirect page dropdown
 *
 * @since 1.11
 */
function bricksAdminAuthUrlBehaviorListener() {
	let behaviorSelect = document.getElementById('wp_auth_url_behavior')
	let redirectPageWrapper = document.getElementById('wp_auth_url_redirect_page_wrapper')

	if (!behaviorSelect || !redirectPageWrapper) {
		return
	}

	function toggleRedirectPageOption() {
		if (behaviorSelect.value === 'custom') {
			redirectPageWrapper.style.display = 'block'
		} else {
			redirectPageWrapper.style.display = 'none'
		}
	}

	// Initial check
	toggleRedirectPageOption()

	// Add event listener
	behaviorSelect.addEventListener('change', toggleRedirectPageOption)
}

/* WooCommerce settings
 *
 * @since 1.11
 */
function bricksAdminWooSettings() {
	let ajaxErrorSelect = document.getElementById('woocommerceAjaxErrorAction')
	let ajaxErrorActionDiv = document.getElementById('wooAjaxErrorScrollToNotice')

	if (ajaxErrorSelect && ajaxErrorActionDiv) {
		// Hide/show the scroll to notice div based on the selected option
		ajaxErrorSelect.addEventListener('change', function (e) {
			if (e.target.value === 'notice') {
				ajaxErrorActionDiv.classList.remove('hide')
			} else {
				ajaxErrorActionDiv.classList.add('hide')
			}
		})
	}
}

/**
 * Create a multiselect dropdown for any select element with AJAX support
 *
 * @since 2.0
 *
 * @param {string} selectId - The ID of the select element to transform
 * @param {Object} options - Configuration options
 * @param {string} options.placeholder - Placeholder text when no items selected
 * @param {string} options.searchPlaceholder - Placeholder text for search input
 * @param {string} options.dataAttribute - Data attribute name for selected items
 * @param {boolean} options.ajaxSearch - Whether to use AJAX for searching
 * @param {Object} options.ajaxOptions - AJAX specific options
 * @param {string} options.ajaxOptions.action - AJAX action to call
 * @param {Object} options.ajaxOptions.params - Additional parameters to send with the AJAX request
 * @param {number} options.ajaxOptions.minSearchLength - Minimum search length to trigger AJAX search
 * @param {number} options.ajaxOptions.debounceTime - Debounce time in milliseconds
 * @returns {void}
 */
function bricksCreateMultiselect(selectId, options = {}) {
	const select = document.getElementById(selectId)
	const wrapper = select?.parentElement

	if (!select || !wrapper) {
		return
	}

	// Default options
	const defaults = {
		placeholder: window.bricksData?.i18n?.selectItems,
		searchPlaceholder: window.bricksData?.i18n?.searchItems,
		dataAttribute: 'data-item-id',
		ajaxSearch: false,
		ajaxOptions: {
			action: 'bricks_get_posts',
			params: {},
			minSearchLength: 2,
			debounceTime: 300
		}
	}

	// Merge defaults with provided options
	const config = { ...defaults, ...options }

	// Merge ajax options
	if (options.ajaxOptions) {
		config.ajaxOptions = { ...defaults.ajaxOptions, ...options.ajaxOptions }
	}

	// Create custom control wrapper
	const control = document.createElement('div')
	control.setAttribute('data-control', 'select')
	control.className = 'multiple bricks-multiselect'
	control.setAttribute('tabindex', '0')

	// Create input display area
	const input = document.createElement('div')
	input.className = 'input'

	// Create options wrapper
	const optionsWrapper = document.createElement('div')
	optionsWrapper.className = 'options-wrapper'

	// Create search input
	const searchWrapper = document.createElement('div')
	searchWrapper.className = 'searchable-wrapper'
	searchWrapper.innerHTML = `
		<input class="searchable" type="text" spellcheck="false" placeholder="${config.searchPlaceholder}">
		<span class="search-status"></span>
	`

	// Create dropdown list
	const dropdown = document.createElement('ul')
	dropdown.className = 'dropdown'

	// Add options to dropdown (initial load)
	if (!config.ajaxSearch) {
		populateDropdownFromSelect()
	} else {
		// For AJAX search, only add the selected options initially
		populateDropdownFromSelectedOptions()

		// Add a message for initial state
		if (Array.from(select.selectedOptions).length === 0) {
			const initialMessage = document.createElement('li')
			initialMessage.className = 'message'
			initialMessage.innerHTML = `<span>${window.bricksData?.i18n?.typeToSearch}</span>`
			dropdown.appendChild(initialMessage)
		}
	}

	// Build structure
	optionsWrapper.appendChild(searchWrapper)
	optionsWrapper.appendChild(dropdown)
	control.appendChild(input)
	control.appendChild(optionsWrapper)

	// Hide original select
	select.style.display = 'none'
	select.after(control)

	// Function to populate dropdown from select options
	function populateDropdownFromSelect() {
		dropdown.innerHTML = ''
		Array.from(select.options).forEach((option, index) => {
			const li = document.createElement('li')
			li.setAttribute('data-index', index)
			li.setAttribute('data-value', option.value)
			li.className = option.selected ? 'selected' : ''
			li.innerHTML = `<span>${option.text}</span>`
			dropdown.appendChild(li)
		})
	}

	// Function to populate dropdown from selected options only
	function populateDropdownFromSelectedOptions() {
		dropdown.innerHTML = ''
		Array.from(select.selectedOptions).forEach((option, index) => {
			const li = document.createElement('li')
			li.setAttribute('data-index', index)
			li.setAttribute('data-value', option.value)
			li.className = 'selected'
			li.innerHTML = `<span>${option.text}</span>`
			dropdown.appendChild(li)
		})
	}

	// Update selected items display
	const updateSelection = () => {
		input.innerHTML = ''
		input.className = 'input'

		const selected = Array.from(select.selectedOptions)

		if (selected.length) {
			input.classList.add('has-value')

			selected.forEach((option) => {
				const value = document.createElement('span')
				value.className = 'value'
				value.setAttribute(config.dataAttribute, option.value)
				value.innerHTML = `
					${option.text}
					<span class="dashicons dashicons-no-alt" data-name="close-box"></span>
				`
				input.appendChild(value)
			})
		} else {
			input.innerHTML = `
				<span class="placeholder">${config.placeholder}</span>
				<span class="dashicons dashicons-arrow-down"></span>
			`
		}
	}

	// Initial selection
	updateSelection()

	// Toggle dropdown
	control.addEventListener('click', (e) => {
		const isSearchInput = e.target.classList.contains('searchable')
		if (!isSearchInput) {
			control.classList.toggle('open')

			// Auto-focus search input when dropdown opens
			if (control.classList.contains('open')) {
				const searchInput = control.querySelector('.searchable')
				if (searchInput) {
					setTimeout(() => {
						searchInput.focus()
					}, 10)
				}
			}
		}
	})

	// Handle option selection
	dropdown.addEventListener('click', (e) => {
		const li = e.target.closest('li')
		if (li && !li.classList.contains('message') && !li.classList.contains('loading')) {
			const value = li.getAttribute('data-value')
			const option = select.querySelector(`option[value="${value}"]`)

			if (option) {
				option.selected = !option.selected
				li.classList.toggle('selected')
				updateSelection()
			}
		}
	})

	// Handle remove tag click
	input.addEventListener('click', (e) => {
		const closeBox = e.target.closest('[data-name="close-box"]')
		if (closeBox) {
			e.stopPropagation()
			const tag = closeBox.closest('.value')
			const itemId = tag.getAttribute(config.dataAttribute)
			const option = select.querySelector(`option[value="${itemId}"]`)
			if (option) {
				option.selected = false
				const li = dropdown.querySelector(`li[data-value="${itemId}"]`)
				if (li) {
					li.classList.remove('selected')
				}
				updateSelection()
			}
		}
	})

	// Debounce function for search
	function debounce(func, wait) {
		let timeout
		return function (...args) {
			const context = this
			clearTimeout(timeout)
			timeout = setTimeout(() => func.apply(context, args), wait)
		}
	}

	// AJAX search function
	function performAjaxSearch(searchTerm) {
		const searchStatus = searchWrapper.querySelector('.search-status')
		searchStatus.textContent = window.bricksData?.i18n?.searching
		searchStatus.classList.add('active')

		// Show loading indicator in dropdown
		const loadingItem = document.createElement('li')
		loadingItem.className = 'loading'
		loadingItem.innerHTML = `<span>${window.bricksData?.i18n?.searching}</span>`

		// Clear previous results but keep selected items
		const selectedItems = Array.from(dropdown.querySelectorAll('li.selected'))
		dropdown.innerHTML = ''
		selectedItems.forEach((item) => dropdown.appendChild(item))
		dropdown.appendChild(loadingItem)

		// Prepare AJAX data
		const data = {
			action: config.ajaxOptions.action,
			search: searchTerm,
			...config.ajaxOptions.params
		}

		// Add nonce if available
		if (window.bricksData?.nonce) {
			data.nonce = window.bricksData.nonce
		}

		// Perform AJAX request
		jQuery.ajax({
			type: 'GET',
			url: window.bricksData?.ajaxUrl,
			data: data,
			success: function (response) {
				// Remove loading indicator
				const loadingItems = dropdown.querySelectorAll('li.loading')
				loadingItems.forEach((item) => item.remove())

				// Update search status
				searchStatus.textContent = ''
				searchStatus.classList.remove('active')

				if (response.success && response.data) {
					// Get currently selected values
					const selectedValues = Array.from(select.selectedOptions).map((opt) => opt.value)

					// Add new options to select if they don't exist
					Object.entries(response.data).forEach(([id, title]) => {
						if (!select.querySelector(`option[value="${id}"]`)) {
							const newOption = document.createElement('option')
							newOption.value = id
							newOption.text = title
							newOption.selected = selectedValues.includes(id)
							select.appendChild(newOption)
						}
					})

					// Clear dropdown except selected items
					const selectedItems = Array.from(dropdown.querySelectorAll('li.selected'))
					dropdown.innerHTML = ''
					selectedItems.forEach((item) => dropdown.appendChild(item))

					// Add results to dropdown
					Object.entries(response.data).forEach(([id, title]) => {
						// Skip if already in dropdown (selected)
						if (dropdown.querySelector(`li[data-value="${id}"]`)) {
							return
						}

						const li = document.createElement('li')
						li.setAttribute('data-value', id)
						li.className = selectedValues.includes(id) ? 'selected' : ''
						li.innerHTML = `<span>${title}</span>`
						dropdown.appendChild(li)
					})

					// Show no results message if empty
					if (dropdown.children.length === 0) {
						const noResults = document.createElement('li')
						noResults.className = 'message'
						noResults.innerHTML = `<span>${window.bricksData?.i18n?.noResults}</span>`
						dropdown.appendChild(noResults)
					}
				} else {
					// Show error message
					const errorItem = document.createElement('li')
					errorItem.className = 'message error'
					errorItem.innerHTML = `<span>${window.bricksData?.i18n?.searchError}</span>`
					dropdown.appendChild(errorItem)
				}
			},
			error: function () {
				// Remove loading indicator
				const loadingItems = dropdown.querySelectorAll('li.loading')
				loadingItems.forEach((item) => item.remove())

				// Update search status
				searchStatus.textContent = ''
				searchStatus.classList.remove('active')

				// Show error message
				const errorItem = document.createElement('li')
				errorItem.className = 'message error'
				errorItem.innerHTML = `<span>${window.bricksData?.i18n?.searchError}</span>`
				dropdown.appendChild(errorItem)
			}
		})
	}

	// Debounced search function
	const debouncedSearch = debounce(function (searchTerm) {
		performAjaxSearch(searchTerm)
	}, config.ajaxOptions.debounceTime)

	// Handle search
	const searchInput = searchWrapper.querySelector('.searchable')
	searchInput.addEventListener('input', (e) => {
		const search = e.target.value.toLowerCase()

		if (config.ajaxSearch) {
			// Clear message when user starts typing
			const messageItems = dropdown.querySelectorAll('li.message')
			messageItems.forEach((item) => item.remove())

			// If search is empty, show only selected items
			if (search === '') {
				populateDropdownFromSelectedOptions()

				// Add a message for empty search
				if (dropdown.children.length === 0) {
					const initialMessage = document.createElement('li')
					initialMessage.className = 'message'
					initialMessage.innerHTML = `<span>${window.bricksData?.i18n?.typeToSearch}</span>`
					dropdown.appendChild(initialMessage)
				}
				return
			}

			// Check if search meets minimum length requirement
			if (search.length >= config.ajaxOptions.minSearchLength) {
				debouncedSearch(search)
			} else if (search.length > 0) {
				// Show message about minimum length
				const minLengthMessage = document.createElement('li')
				minLengthMessage.className = 'message'
				minLengthMessage.innerHTML = `<span>${window.bricksData?.i18n?.minSearchLength}</span>`

				// Clear dropdown except selected items
				const selectedItems = Array.from(dropdown.querySelectorAll('li.selected'))
				dropdown.innerHTML = ''
				selectedItems.forEach((item) => dropdown.appendChild(item))
				dropdown.appendChild(minLengthMessage)
			}
		} else {
			// Regular filtering for non-AJAX search
			Array.from(dropdown.children).forEach((li) => {
				const text = li.textContent.toLowerCase()
				li.style.display = text.includes(search) ? '' : 'none'
			})
		}
	})

	// Close dropdown when clicking outside
	document.addEventListener('click', (e) => {
		if (!control.contains(e.target)) {
			control.classList.remove('open')
		}
	})
}

/**
 * Element manager: Bricks > Elements
 *
 * @since 2.0
 */
function bricksElementManger() {
	let elementManagerForm = document.getElementById('bricks-element-manager')

	if (!elementManagerForm) {
		return
	}

	elementFilters = document.querySelectorAll('button[data-filter-by]')

	// STEP: Filter elements
	elementFilters.forEach((filter) => {
		filter.addEventListener('click', function (e) {
			e.preventDefault()

			let filterActive = e.target.classList.contains('active')
			let filterBy = filter.dataset.filterBy
			let iconNode = e.target.querySelector('i')

			// Toggle icon
			if (iconNode) {
				if (filterActive) {
					iconNode.classList.remove('dashicons-remove')
					iconNode.classList.add('dashicons-insert')
				} else {
					iconNode.classList.remove('dashicons-insert')
					iconNode.classList.add('dashicons-remove')
				}
			}

			// Toggle button
			if (filterActive) {
				filter.classList.remove('button-primary')
				filter.classList.add('button-scondary')
			} else {
				filter.classList.remove('button-secondary')
				filter.classList.add('button-primary')
			}

			// Apply/remove filter via #bricks-element-manager attributes
			if (filterActive) {
				if (filterBy === 'unused') {
					delete elementManagerForm.dataset.filterUnused
				}

				if (filterBy === 'native') {
					delete elementManagerForm.dataset.filterNative
				}

				if (filterBy === 'custom') {
					delete elementManagerForm.dataset.filterCustom
				}
			} else {
				if (filterBy === 'unused') {
					elementManagerForm.dataset.filterUnused = 'on'
				}

				if (filterBy === 'native') {
					elementManagerForm.dataset.filterNative = 'on'
				}

				if (filterBy === 'custom') {
					elementManagerForm.dataset.filterCustom = 'on'
				}
			}

			filter.classList.toggle('active')
		})
	})

	elementManagerForm.addEventListener('click', function (e) {
		// STEP: Update element status changes
		let elementStatus = e.target.dataset.status
		if (elementStatus) {
			// Add .sticky class to .submit-wrapper
			let submitWrapper = elementManagerForm.querySelector('.submit-wrapper')
			if (submitWrapper) {
				submitWrapper.classList.add('sticky')
			}

			// Remove 'current' class from buttons
			Array.from(e.target.parentNode.children).forEach((child) => {
				child.classList.remove('current')
			})

			e.target.classList.add('current')

			let tableRow = e.target.closest('tr')
			if (tableRow) {
				tableRow.dataset.status = e.target.dataset.status
			}
		}

		// STEP: Update element permission changes
		let elementPermission = e.target.closest('.element-permission input')
		if (elementPermission) {
			// Toggle all other inputs in the same row if input value is 'all'
			if (elementPermission.value === 'all') {
				let row = elementPermission.closest('tr')
				let inputs = row.querySelectorAll('.element-permission input')

				inputs.forEach((input) => {
					if (input.value !== 'all') {
						input.checked = elementPermission.checked
					}
				})
			}

			// Non-all input toggled
			else {
				// Uncheck 'all' input if any other input is unchecked
				if (!elementPermission.checked) {
					let row = elementPermission.closest('tr')
					let allInput = row.querySelector('.element-permission input[value="all"]')
					if (allInput) {
						allInput.checked = false
					}
				}

				// Check 'all' input if all other inputs are checked
				else {
					let row = elementPermission.closest('tr')
					let inputs = row.querySelectorAll('.element-permission input')
					let allChecked = true

					inputs.forEach((input) => {
						if (input.value !== 'all' && !input.checked) {
							allChecked = false
						}
					})

					if (allChecked) {
						let allInput = row.querySelector('.element-permission input[value="all"]')
						if (allInput) {
							allInput.checked = true
						}
					}
				}
			}
		}
	})

	// STEP: Submit element manager form
	elementManagerForm.addEventListener('submit', function (e) {
		e.preventDefault()

		let elements = {}

		// Get all element name & status from table rows
		let tableRows = elementManagerForm.querySelectorAll('tbody tr')
		tableRows.forEach((row) => {
			let elementName = row.dataset.name
			let elementStatus = row.dataset.status

			elements[elementName] = { status: elementStatus, permission: [] }

			// Get all checked input values inside .element-permission (NOTE: Not in use yet)
			let permissions = row.querySelectorAll('.element-permission input:checked')
			permissions.forEach((permission) => {
				elements[elementName].permission.push(permission.value)
			})
		})

		let resetElementManager = document.activeElement.getAttribute('name') === 'reset'

		if (resetElementManager) {
			let letsReset = confirm('Are you sure you want to reset the element manager?')

			if (!letsReset) {
				return
			}
		}

		jQuery.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: {
				action: 'bricks_save_element_manager',
				elements: elements,
				nonce: bricksData.nonce,
				reset: resetElementManager
			},
			beforeSend: () => {
				elementManagerForm.classList.add('wait')
			},
			success: function () {
				elementManagerForm.classList.remove('wait')

				if (resetElementManager) {
					alert('Element manager has been reset.')
					location.reload()
				} else {
					alert('Element manager has been saved.')

					// Remove .sticky class from .submit-wrapper
					let submitWrapper = elementManagerForm.querySelector('.submit-wrapper')
					if (submitWrapper) {
						submitWrapper.classList.remove('sticky')
					}
				}
			}
		})
	})
}

function bricksAdminElementManagerUsage() {
	// Only run on the element manager page
	if (!document.getElementById('bricks-element-manager')) {
		return
	}

	// Process elements in batches to avoid overwhelming the server
	const BATCH_SIZE = 25
	let elementsToProcess = []
	let processingElements = false

	// Get all elements that need their usage count fetched
	document.querySelectorAll('.element-usage').forEach((cell) => {
		const elementName = cell.dataset.elementName
		if (elementName) {
			elementsToProcess.push(elementName)
		}
	})

	// Process elements in batches of 25
	function processNextBatch() {
		if (processingElements || elementsToProcess.length === 0) {
			return
		}

		processingElements = true

		// Get the next batch of elements
		const batch = elementsToProcess.splice(0, BATCH_SIZE)

		getElementUsageCount(batch)

		// Process the next batch
		setTimeout(() => {
			processingElements = false
			processNextBatch()
		}, 200)
	}

	// Get the usage count for a specific element
	function getElementUsageCount(elementNames) {
		const formData = new FormData()
		formData.append('action', 'bricks_get_element_usage_count')
		formData.append('nonce', bricksData.nonce)
		formData.append('elementNames', elementNames)

		jQuery.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: {
				action: 'bricks_get_element_usage_count',
				nonce: bricksData.nonce,
				elementNames: elementNames
			},
			success: function (response) {
				const countByElementName = response.data?.results || {}
				elementNames.forEach((elementName) => {
					const cell = document.querySelector(`.element-usage[data-element-name="${elementName}"]`)
					if (cell) {
						cell.innerHTML = countByElementName[elementName]?.count || '-'

						// Element count as data-count attribute for unused elements filter
						cell
							.closest('tr')
							.setAttribute('data-count', countByElementName[elementName]?.count || 0)
					}
				})
			}
		})
	}

	// Start processing elements
	processNextBatch()
}

/**
 * Handle custom capabilities UI
 */
function bricksAdminCustomCapabilities() {
	const wrapper = document.querySelector('.bricks-custom-capabilities-wrapper')
	if (!wrapper) {
		return
	}

	// Initialize variables
	const addCapabilityButton = wrapper.querySelector('.new-capability')
	const capabilitiesList = wrapper.querySelector('.bricks-custom-capabilities-list')
	const customCapabilitiesInput = wrapper.querySelector('input[name="customCapabilities"]')
	let capabilities = []

	// Parse capabilities from hidden input
	if (customCapabilitiesInput && customCapabilitiesInput.value) {
		try {
			capabilities = JSON.parse(customCapabilitiesInput.value)
		} catch (e) {
			console.error('Error parsing capabilities:', e)
		}
	}

	// Function to check if any access builder permissions are selected
	function hasAccessBuilderPermissions(modal) {
		const accessBuilderSection = modal.querySelector(
			'.permission-section[data-section="access_builder"]'
		)
		if (!accessBuilderSection) return false

		const accessBuilderCheckboxes = accessBuilderSection.querySelectorAll(
			'input[type="checkbox"][name="permissions[]"]'
		)
		return Array.from(accessBuilderCheckboxes).some((checkbox) => checkbox.checked)
	}

	// Function to toggle all non-access-builder checkboxes
	function toggleNonAccessBuilderCheckboxes(modal, enable) {
		const allSections = modal.querySelectorAll('.permission-section')
		allSections.forEach((section) => {
			if (section.dataset.section === 'access_builder') return

			const checkboxes = section.querySelectorAll('input[type="checkbox"][name="permissions[]"]')
			const enableAllCheckbox = section.querySelector('.enable-all-checkbox')

			checkboxes.forEach((checkbox) => {
				checkbox.disabled = !enable
				if (!enable) {
					checkbox.checked = false
				}
			})

			// Update the "Enable All" checkbox state after toggling
			if (enableAllCheckbox) {
				enableAllCheckbox.disabled = !enable
				enableAllCheckbox.checked =
					enable && Array.from(checkboxes).every((checkbox) => checkbox.checked)
			}
		})
	}

	// Function to update the hidden input with current capabilities
	function updateCapabilitiesInput() {
		if (customCapabilitiesInput) {
			customCapabilitiesInput.value = JSON.stringify(capabilities)
		}
	}

	// Function to render capabilities in the list
	function renderCapabilities() {
		// Clear the list first
		capabilitiesList.innerHTML = ''

		// First render default capabilities
		if (window.bricksData.defaultCapabilities) {
			capabilitiesList.innerHTML += `<div class="sub">${window.bricksData.i18n.defaultCapabilities}</div>`
			Object.entries(window.bricksData.defaultCapabilities).forEach(([capId, capLabel]) => {
				const capabilityItem = document.createElement('div')
				capabilityItem.className = 'capability-item'
				capabilityItem.dataset.capability = capId
				capabilityItem.dataset.isDefault = 'true'

				capabilityItem.innerHTML = `
					<div class="capability-header">
						<div class="capability-name">${capLabel} <em>(${window.bricksData.i18n.default})</em></div>
						<div class="capability-actions">
							<button type="button" class="button view-capability">
								${window.bricksData.i18n.view}
							</button>
						</div>
					</div>
				`

				capabilitiesList.appendChild(capabilityItem)
			})
		}

		if (capabilities.length) {
			let hr = document.createElement('hr')
			hr.className = 'capabilities-separator'
			capabilitiesList.appendChild(hr)

			capabilitiesList.innerHTML += `<div class="sub">${window.bricksData.i18n.customCapabilities}</div>`
			capabilitiesList.innerHTML += `<div class="description">${window.bricksData.i18n.customCapabilitiesDescription}</div>`
		}

		// Then render custom capabilities
		capabilities.forEach((capability) => {
			const capabilityItem = document.createElement('div')
			capabilityItem.className = 'capability-item'
			capabilityItem.dataset.capability = capability.id

			capabilityItem.innerHTML = `
				<div class="capability-header">
					<div class="capability-name">${capability.label}</div>
					<div class="capability-actions">
						<button type="button" class="button edit-capability">
							${window.bricksData.i18n.edit}
						</button>
						<button type="button" class="button duplicate-capability">
						${window.bricksData.i18n.duplicate}
						</button>
						<button type="button" class="button delete-capability">
						${window.bricksData.i18n.delete}
						</button>
					</div>
				</div>
			`

			capabilitiesList.appendChild(capabilityItem)
		})
	}

	// Function to close the modal
	function closeModal() {
		const modal = document.querySelector('.bricks-capability-modal')
		const backdrop = document.querySelector('.bricks-capability-modal-backdrop')
		if (modal) modal.remove()
		if (backdrop) backdrop.remove()
	}

	// Function to save capability changes
	function saveCapabilityChanges(modal, capabilityId) {
		const nameInput = modal.querySelector('input[name="capability-name"]')
		const descriptionInput = modal.querySelector('textarea[name="capability-description"]')
		const checkboxes = modal.querySelectorAll('input[type="checkbox"][name="permissions[]"]')
		const nameError = modal.querySelector('.capability-name-error')

		// Validate capability name
		const label = nameInput.value.trim()
		const description = descriptionInput.value.trim()

		if (!label) {
			nameError.textContent = window.bricksData.i18n.capabilityNameRequired
			nameInput.classList.add('error')
			return false
		}

		// Check if name is a default capability
		if (
			window.bricksData.defaultCapabilities &&
			Object.keys(window.bricksData.defaultCapabilities).includes(capabilityId) &&
			(!capabilityId || label !== capabilityId)
		) {
			nameError.textContent = window.bricksData.i18n.capabilityNameReserved
			nameInput.classList.add('error')
			return false
		}

		// Check if name already exists
		const nameExists = capabilities.some(
			(cap) => cap.id === label && (!capabilityId || label !== capabilityId)
		)
		if (nameExists) {
			nameError.textContent = window.bricksData.i18n.capabilityNameExists
			nameInput.classList.add('error')
			return false
		}

		// Get selected permissions
		const selectedPermissions = []
		checkboxes.forEach((checkbox) => {
			if (checkbox.checked) {
				selectedPermissions.push(checkbox.value)
			}
		})

		// Update or add capability
		if (capabilityId) {
			// Update existing capability
			const index = capabilities.findIndex((cap) => cap.id === capabilityId)
			if (index !== -1) {
				// Update builder access dropdowns if ID hasn't changed
				if (label !== capabilities[index].label) {
					// Update capability label in dropdowns
					const builderAccessSelects = document.querySelectorAll(
						'select[name^="builderCapabilities"]'
					)
					builderAccessSelects.forEach((select) => {
						const option = Array.from(select.options).find(
							(option) => option.value === capabilityId
						)
						if (option) {
							option.textContent = label
						}
					})
				}

				capabilities[index] = {
					id: capabilityId,
					label: label,
					description: description,
					permissions: selectedPermissions
				}
			}
		} else {
			// Generate new unique ID for new capability
			const newId = generateCapabilityId()

			// Add new capability
			capabilities.push({
				id: newId,
				label: label,
				description: description,
				permissions: selectedPermissions
			})

			// Add to builder access dropdowns
			updateBuilderAccessDropdowns({
				id: newId,
				label: label
			})
		}

		// Update hidden input
		updateCapabilitiesInput()

		// Render the updated capabilities list
		renderCapabilities()

		return true
	}

	// Function to show capability modal
	function showCapabilityModal(capabilityId, isViewOnly) {
		// Create modal HTML
		const modalHTML = renderModalTemplate(capabilityId, isViewOnly)
		document.body.insertAdjacentHTML('beforeend', modalHTML)

		// Get modal elements
		const modal = document.querySelector('.bricks-capability-modal')
		const closeButtons = modal.querySelectorAll('.close-modal')
		const nameInput = modal.querySelector('input[name="capability-name"]')
		const checkboxes = modal.querySelectorAll('input[type="checkbox"][name="permissions[]"]')
		const backdrop = document.querySelector('.bricks-capability-modal-backdrop')

		// Close modal on any close button click
		closeButtons.forEach((button) => {
			button.addEventListener('click', () => {
				if (!isViewOnly) {
					saveCapabilityChanges(modal, capabilityId)
				}
				closeModal()
			})
		})

		// Close on backdrop click
		if (backdrop) {
			backdrop.addEventListener('click', () => {
				if (!isViewOnly) {
					saveCapabilityChanges(modal, capabilityId)
				}
				closeModal()
			})
		}

		// Close on ESC key
		document.addEventListener('keydown', function escHandler(e) {
			if (e.key === 'Escape') {
				if (!isViewOnly) {
					saveCapabilityChanges(modal, capabilityId)
				}
				closeModal()
				document.removeEventListener('keydown', escHandler)
			}
		})

		// Disable inputs for default capabilities or view mode
		if (isViewOnly) {
			if (nameInput) nameInput.disabled = true
			checkboxes.forEach((checkbox) => {
				checkbox.disabled = true
			})
		}

		// Initial check for access builder permissions
		if (!isViewOnly) {
			const hasAccess = hasAccessBuilderPermissions(modal)
			toggleNonAccessBuilderCheckboxes(modal, hasAccess)

			// Add event listeners to access builder checkboxes
			const accessBuilderSection = modal.querySelector(
				'.permission-section[data-section="access_builder"]'
			)
			if (accessBuilderSection) {
				const accessBuilderCheckboxes = accessBuilderSection.querySelectorAll(
					'input[type="checkbox"][name="permissions[]"]'
				)
				accessBuilderCheckboxes.forEach((checkbox) => {
					checkbox.addEventListener('change', () => {
						const hasAccess = hasAccessBuilderPermissions(modal)
						toggleNonAccessBuilderCheckboxes(modal, hasAccess)
						saveCapabilityChanges(modal, capabilityId)
					})
				})
			}
		}

		// Set initial state of "Enable All" checkboxes
		if (!isViewOnly) {
			// For each section, check if all permissions are already checked
			modal.querySelectorAll('.permission-section').forEach((section) => {
				const sectionCheckboxes = section.querySelectorAll(
					'input[type="checkbox"][name="permissions[]"]'
				)
				const enableAllCheckbox = section.querySelector('.enable-all-checkbox')

				// Set the "Enable All" checkbox state based on whether all permissions are checked
				const allChecked = Array.from(sectionCheckboxes).every((checkbox) => checkbox.checked)
				enableAllCheckbox.checked = allChecked

				// Add event listener to "Enable All" checkbox
				enableAllCheckbox.addEventListener('change', function () {
					// Only allow enabling if this is the access_builder section or if access_builder permissions are selected
					if (section.dataset.section !== 'access_builder' && !hasAccessBuilderPermissions(modal)) {
						this.checked = false
						return
					}

					const isChecked = this.checked
					sectionCheckboxes.forEach((checkbox) => {
						if (!checkbox.disabled) {
							checkbox.checked = isChecked
						}
					})

					// If this is the access_builder section, toggle other sections based on the checkbox state
					if (section.dataset.section === 'access_builder') {
						toggleNonAccessBuilderCheckboxes(modal, isChecked)
					}

					saveCapabilityChanges(modal, capabilityId)
				})
			})

			// Update "Enable All" checkbox when individual permissions change
			checkboxes.forEach((checkbox) => {
				checkbox.addEventListener('change', function () {
					const section = this.closest('.permission-section')
					const sectionCheckboxes = section.querySelectorAll(
						'input[type="checkbox"][name="permissions[]"]'
					)
					const enableAllCheckbox = section.querySelector('.enable-all-checkbox')

					// Update "Enable All" checkbox based on whether all permissions are checked
					const allChecked = Array.from(sectionCheckboxes).every(
						(checkbox) => checkbox.checked || checkbox.disabled
					)
					enableAllCheckbox.checked = allChecked

					// If this is a checkbox in the access_builder section, check if we need to enable other sections
					if (section.dataset.section === 'access_builder') {
						const hasAccess = hasAccessBuilderPermissions(modal)
						toggleNonAccessBuilderCheckboxes(modal, hasAccess)
					}

					saveCapabilityChanges(modal, capabilityId)
				})
			})
		}

		// Handle name input validation and auto-save
		if (nameInput && !isViewOnly) {
			nameInput.addEventListener('input', function () {
				const nameError = modal.querySelector('.capability-name-error')
				nameInput.classList.remove('error')
				nameError.textContent = ''
				saveCapabilityChanges(modal, capabilityId)
			})
		}
	}

	// Function to render modal template
	function renderModalTemplate(capabilityId, isViewOnly) {
		// Get existing capability data or use empty defaults
		let capability = { id: '', label: '', description: '', permissions: [] }

		if (capabilityId) {
			// Check if it's a default capability
			if (
				window.bricksData.defaultCapabilityPermissions &&
				window.bricksData.defaultCapabilityPermissions[capabilityId]
			) {
				const defaultCapData = window.bricksData.defaultCapabilityPermissions[capabilityId]
				capability = {
					id: capabilityId,
					label: defaultCapData.label,
					permissions: defaultCapData.permissions || []
				}
			} else {
				// Custom capability
				const existingCapability = capabilities.find((cap) => cap.id === capabilityId)
				if (existingCapability) {
					capability = existingCapability
				}
			}
		}

		const isDefaultCapability = window.bricksData.defaultCapabilityPermissions?.[capabilityId]

		return `
		<div class="bricks-capability-modal">
			<div class="bricks-capability-modal-header">
				<h2>${
					isViewOnly
						? window.bricksData.i18n.view
						: capability.id
							? window.bricksData.i18n.editCapability
							: window.bricksData.i18n.newCapability
				}</h2>
				<button type="button" class="close-modal">
					<span class="dashicons dashicons-no-alt"></span>
				</button>
			</div>
			<div class="bricks-capability-modal-content">
				<div class="capability-name-wrapper">
					<label for="capability-name">${window.bricksData.i18n.capabilityName}</label>
					<span class="capability-id" title="${window.bricksData.i18n.capability}: ${
						window.bricksData.i18n.capabilityKey
					}">${capability.id}</span>
					<input type="text" name="capability-name" id="capability-name" value="${capability.label}" ${
						isViewOnly || isDefaultCapability ? 'disabled' : ''
					}>
					<div class="capability-name-error"></div>
				</div>
				${
					!isDefaultCapability
						? `
				<div class="capability-description-wrapper">
					<label for="capability-description">${window.bricksData.i18n.description}</label>
					<textarea name="capability-description" id="capability-description" rows="3" ${
						isViewOnly ? 'disabled' : ''
					}>${capability.description || ''}</textarea>
				</div>
				`
						: ''
				}
				<div class="capability-permissions">
					${Object.entries(window.bricksData.builderAccessPermissions)
						.map(
							([sectionKey, section]) => `
						<div class="permission-section" data-section="${sectionKey}">
							<div class="section-header">
								<h3>${section.label}</h3>
								<label class="enable-all-wrapper">
									<input type="checkbox" class="enable-all-checkbox" ${isViewOnly ? 'disabled' : ''}>
									<span>${window.bricksData.i18n.enableAll}</span>
								</label>
								<div class="description">${section.description || ''}</div>
							</div>
							<div class="permission-grid">
								${Object.entries(section.permissions)
									.map(
										([permissionId, permissionLabel]) => `
									<label class="permission-item">
										<input type="checkbox" name="permissions[]" value="${permissionId}" ${
											capability.permissions.includes(permissionId) ? 'checked' : ''
										} ${isViewOnly ? 'disabled' : ''}>
										<span>${permissionLabel}</span>
									</label>
								`
									)
									.join('')}
							</div>
						</div>
					`
						)
						.join('')}
				</div>
			</div>
			<div class="bricks-capability-modal-footer">
				<div class="save-reminder">${window.bricksData.i18n.saveSettingsToApplyChanges}</div>
				<button type="button" class="button close-modal">${window.bricksData.i18n.close}</button>
			</div>
		</div>
		<div class="bricks-capability-modal-backdrop"></div>
		`
	}

	// Function to update builder access dropdowns with new capability
	function updateBuilderAccessDropdowns(capability) {
		// Find all builder access dropdowns
		const builderAccessSelects = document.querySelectorAll('select[name^="builderCapabilities"]')

		// Skip if no dropdowns found
		if (!builderAccessSelects.length) {
			return
		}

		// Create new option element
		const newOption = document.createElement('option')
		newOption.value = capability.id
		newOption.textContent = capability.label

		// Add the new option to each dropdown (before the "Full access" option)
		builderAccessSelects.forEach((select) => {
			// Skip the administrator role dropdown (it's disabled)
			if (select.disabled) {
				return
			}

			// Remove existing option if updating
			const existingOption = select.querySelector(`option[value="${capability.id}"]`)
			if (existingOption) {
				existingOption.remove()
			}

			// Find the "Full access" option (it should be the last one)
			const fullAccessOption = Array.from(select.options).find(
				(option) => option.value === 'bricks_full_access'
			)

			// If found, insert before it; otherwise append to the end
			if (fullAccessOption) {
				select.insertBefore(newOption.cloneNode(true), fullAccessOption)
			} else {
				select.appendChild(newOption.cloneNode(true))
			}
		})
	}

	// Function to generate a random 6-character string
	function generateRandomString(length = 6) {
		return Math.random()
			.toString(36)
			.substring(2, 2 + length)
	}

	// Function to generate a unique capability ID
	function generateCapabilityId() {
		return `bricks_builder_access_${generateRandomString()}`
	}

	// Add new capability button
	if (addCapabilityButton) {
		addCapabilityButton.addEventListener('click', function () {
			// Generate new capability with unique ID
			const newCapability = {
				id: generateCapabilityId(),
				label: window.bricksData.i18n.newCapability,
				permissions: []
			}

			// Add to capabilities array
			capabilities.push(newCapability)

			// Update hidden input
			updateCapabilitiesInput()

			// Add to builder access dropdowns
			updateBuilderAccessDropdowns(newCapability)

			// Update the UI
			renderCapabilities()

			// Show edit modal for the new capability
			showCapabilityModal(newCapability.id)
		})
	}

	// Function to update builder access dropdowns with capability
	function updateBuilderAccessDropdowns(capability) {
		// Find all builder access dropdowns
		const builderAccessSelects = document.querySelectorAll('select[name^="builderCapabilities"]')

		// Skip if no dropdowns found
		if (!builderAccessSelects.length) {
			return
		}

		// Create new option element
		const newOption = document.createElement('option')
		newOption.value = capability.id
		newOption.textContent = capability.label

		// Add the new option to each dropdown (before the "Full access" option)
		builderAccessSelects.forEach((select) => {
			// Skip the administrator role dropdown (it's disabled)
			if (select.disabled) {
				return
			}

			// Remove existing option if updating
			const existingOption = select.querySelector(`option[value="${capability.id}"]`)
			if (existingOption) {
				existingOption.remove()
			}

			// Find the "Full access" option (it should be the last one)
			const fullAccessOption = Array.from(select.options).find(
				(option) => option.value === 'bricks_full_access'
			)

			// If found, insert before it; otherwise append to the end
			if (fullAccessOption) {
				select.insertBefore(newOption.cloneNode(true), fullAccessOption)
			} else {
				select.appendChild(newOption.cloneNode(true))
			}
		})
	}

	// Initial render of capabilities
	renderCapabilities()

	// Event delegation for capability items
	if (capabilitiesList) {
		capabilitiesList.addEventListener('click', function (e) {
			const capabilityItem = e.target.closest('.capability-item')

			if (!capabilityItem) {
				return
			}

			const capabilityId = capabilityItem.dataset.capability

			// View button (for default capabilities)
			if (e.target.classList.contains('view-capability')) {
				showCapabilityModal(capabilityId, true)
			}

			// Edit button (for custom capabilities)
			else if (e.target.classList.contains('edit-capability')) {
				showCapabilityModal(capabilityId)
			}

			// Duplicate button (for custom capabilities)
			else if (
				e.target.classList.contains('duplicate-capability') ||
				e.target.closest('.duplicate-capability')
			) {
				// Find the capability to duplicate
				const capability = capabilities.find((cap) => cap.id === capabilityId)
				if (capability) {
					// Generate new unique ID for duplicated capability
					const newId = generateCapabilityId()

					// Create new capability with duplicated data
					const duplicatedCapability = {
						id: newId,
						label: `${capability.label} (${window.bricksData.i18n.duplicate})`,
						description: capability.description || '',
						permissions: [...capability.permissions]
					}

					// Add to capabilities array
					capabilities.push(duplicatedCapability)

					// Update hidden input
					updateCapabilitiesInput()

					// Add to builder access dropdowns
					updateBuilderAccessDropdowns(duplicatedCapability)

					// Update the UI
					renderCapabilities()
				}
			}

			// Delete button (for custom capabilities)
			else if (
				e.target.classList.contains('delete-capability') ||
				e.target.closest('.delete-capability')
			) {
				const confirmed = confirm(window.bricksData.i18n.confirmDeleteCapability)
				if (confirmed) {
					// Remove from capabilities array
					capabilities = capabilities.filter((cap) => cap.id !== capabilityId)

					// Remove from builder access dropdowns
					const builderAccessSelects = document.querySelectorAll(
						'select[name^="builderCapabilities"]'
					)
					builderAccessSelects.forEach((select) => {
						const option = select.querySelector(`option[value="${capabilityId}"]`)
						if (option) {
							option.remove()
						}
					})

					// Update hidden input
					updateCapabilitiesInput()

					// Update the UI
					renderCapabilities()
				}
			}
		})
	}
}

/**
 * Template exclusion multiselect handler
 *
 * @since 1.12.2
 */
function bricksAdminTemplateExclusion() {
	bricksCreateMultiselect('excludedTemplates', {
		placeholder: window.bricksData?.i18n?.selectTemplates,
		searchPlaceholder: window.bricksData?.i18n?.searchTemplates,
		dataAttribute: 'data-template-id'
	})
}

/**
 * Maintenance mode excluded posts/pages multiselect handler
 *
 * @since 2.0
 */
function bricksAdminMaintenanceExcludedPosts() {
	bricksCreateMultiselect('maintenanceExcludedPosts', {
		placeholder: window.bricksData?.i18n?.selectPosts,
		searchPlaceholder: window.bricksData?.i18n?.searchPosts,
		dataAttribute: 'data-post-id',
		ajaxSearch: true,
		ajaxOptions: {
			action: 'bricks_get_posts',
			params: {
				postType: 'any',
				postStatus: 'publish',
				excludePostTypes: ['bricks_template', 'attachment']
			},
			minSearchLength: 2,
			debounceTime: 300
		}
	})
}

/**
 * Handle attribute & term image swatch uploads
 *
 * @since 2.0
 */
function bricksAttributeImageSwatches() {
	// Handle image upload
	document.addEventListener('click', function (e) {
		if (!e.target.matches('.bricks_swatch_image_upload')) return

		e.preventDefault()

		const button = e.target
		const parent = button.parentNode
		// Handle both term fields and attribute settings fields
		const imageIdInput = parent.querySelector(
			'input[name="swatch_image_value"], input[name="swatch_default_image"]'
		)
		const imagePreview = parent.querySelector('.swatch-image-preview')

		let wp = window.wp

		// Create media frame
		if (!wp.media.frames.file_frame) {
			wp.media.frames.file_frame = wp.media({
				multiple: false
			})
		}

		// When image selected
		wp.media.frames.file_frame.off('select').on('select', function () {
			const attachment = wp.media.frames.file_frame.state().get('selection').first().toJSON()

			// Update hidden input with image ID
			imageIdInput.value = attachment.id

			// Update or create preview
			if (imagePreview) {
				imagePreview.src = attachment.url
			} else {
				const img = document.createElement('img')
				img.src = attachment.url
				img.className = 'swatch-image-preview'
				img.style.cssText = 'max-width: 150px; display: block; margin-bottom: 8px;'
				button.parentNode.insertBefore(img, button)
			}

			// Show remove button
			button.nextElementSibling.style.display = ''
		})

		wp.media.frames.file_frame.open()
	})

	// Handle image removal
	document.addEventListener('click', function (e) {
		if (!e.target.matches('.bricks_swatch_image_remove')) return

		e.preventDefault()

		const button = e.target
		const parent = button.parentNode
		// Handle both term fields and attribute settings fields
		const imageIdInput = parent.querySelector(
			'input[name="swatch_image_value"], input[name="swatch_default_image"]'
		)
		const imagePreview = parent.querySelector('.swatch-image-preview')

		// Clear input value
		imageIdInput.value = ''

		// Remove preview
		if (imagePreview) {
			imagePreview.remove()
		}

		// Hide remove button
		button.style.display = 'none'
	})
}

/**
 * Handle color swatch removal
 *
 * @since 2.0
 */
function bricksAttributeColorSwatches() {
	// Handle color swatch remove button
	document.addEventListener('click', function (e) {
		if (!e.target.matches('.bricks-remove-color')) {
			return
		}

		e.preventDefault()
		const inputId = e.target.dataset.input
		const input = document.getElementById(inputId)
		const wrapper = input.closest('.bricks-color-swatch-wrapper')

		// Replace color input with Select Color button
		wrapper.innerHTML = `
			<div style="display: inline-block">
				<button type="button" class="button show-color-picker" data-input-id="${inputId}">
					${window.bricksData.i18n.selectColor}
				</button>
				<input type="hidden" name="${input.name}" id="${inputId}" value="none">
			</div>
		`
	})

	// Handle show color picker button
	document.addEventListener('click', function (e) {
		if (!e.target.matches('.show-color-picker')) {
			return
		}

		const inputId = e.target.dataset.inputId
		const wrapper = e.target.closest('div')
		const inputName =
			inputId === 'swatch_default_color' ? 'swatch_default_color' : 'swatch_color_value'

		// Replace button with color input and add wrapper with positioning context
		wrapper.outerHTML = `
			<div class="bricks-color-input-wrapper" style="position: relative; display: inline-block;">
				<input type="color" name="${inputName}" id="${inputId}" class="bricks-color-input">
				<button type="button" class="button bricks-remove-color" data-input="${inputId}">
					${window.bricksData.i18n.remove}
				</button>
			</div>
		`

		// After creating the color input, open the color picker at the click position
		const colorInput = document.getElementById(inputId)

		// If not using our custom picker, use the native one
		if (!openColorPicker(e, colorInput)) {
			// For non-Chrome browsers, just focus and click the input directly
			colorInput.focus()
			setTimeout(() => {
				colorInput.click()
			}, 10)
		}
	})

	// Fix Chrome color picker positioning by using a custom approach
	document.addEventListener('click', function (e) {
		if (!e.target.matches('input[type="color"].bricks-color-input')) {
			return
		}

		// Use our custom color picker for Chrome
		openColorPicker(e, e.target)
	})

	// Create and open a properly positioned color picker
	// NOTE: This is a workaround to fix the color picker positioning issue in Chrome which automatically opens the picker at the top left of the page
	const openColorPicker = (e, targetInput) => {
		// If we're in Chrome, use our custom color picker positioning
		if (navigator.userAgent.indexOf('Chrome') !== -1) {
			// Get the current color value
			const currentColor = targetInput.value || '#ffffff'

			// Create a custom positioned color input just for picking
			const tempInput = document.createElement('input')
			tempInput.type = 'color'
			tempInput.value = currentColor
			tempInput.style.position = 'absolute'
			tempInput.style.left = e.pageX - 5 + 'px'
			tempInput.style.top = e.pageY - 5 + 'px'
			tempInput.style.padding = '0'
			tempInput.style.margin = '0'
			tempInput.style.width = '1px'
			tempInput.style.height = '1px'
			tempInput.style.opacity = '0.01'
			tempInput.style.pointerEvents = 'none'
			tempInput.style.zIndex = '999999'

			// Listen for changes to our temporary input
			tempInput.addEventListener('input', function () {
				// Update the original input value
				targetInput.value = tempInput.value
			})

			tempInput.addEventListener('change', function () {
				// Once done, update original input and remove temp
				targetInput.value = tempInput.value
				document.body.removeChild(tempInput)
			})

			// Add to body, focus and click to open the picker
			document.body.appendChild(tempInput)
			tempInput.focus()
			tempInput.click()
			return true
		}
		return false
	}
}

/**
 * Handle attribute swatch type visibility
 *
 * @since 2.0
 */
function bricksAttributeSwatchTypeVisibility() {
	const swatchType = document.getElementById('swatch_type')
	const fallbacks = document.querySelectorAll('.bricks-swatch-fallback')

	if (!swatchType) return

	function updateVisibility() {
		const type = swatchType.value

		// Show/hide type-specific fallback
		fallbacks.forEach((el) => {
			el.style.display = 'none'
		})

		if (type) {
			const fallbackField = document.querySelector('.bricks-swatch-fallback-' + type)
			if (fallbackField) {
				fallbackField.style.display = ''
			}
		}
	}

	swatchType.addEventListener('change', updateVisibility)
	updateVisibility()
}

/**
 * Clean up orphaned elements across site
 *
 * @since 2.0
 */
function bricksCleanupOrphanedElements() {
	let button = document.getElementById('cleanup-all-orphaned-elements')

	if (!button) {
		return
	}

	button.addEventListener('click', function (e) {
		e.preventDefault()

		var confirmed = confirm(bricksData.i18n.confirmCleanupOrphanedElements)

		if (!confirmed) {
			return
		}

		jQuery.ajax({
			type: 'POST',
			url: bricksData.ajaxUrl,
			data: {
				action: 'bricks_cleanup_orphaned_elements',
				nonce: bricksData.nonce
			},
			beforeSend: () => {
				button.setAttribute('disabled', 'disabled')
				button.classList.add('wait')
			},
			success: function (res) {
				button.removeAttribute('disabled')
				button.classList.remove('wait')

				if (res.success) {
					alert(res.data.message)
					// Refresh the results or hide them since they're cleaned up
					location.reload()
				} else {
					alert(res.data.message || bricksData.i18n.errorOccurred)
				}
			},
			error: function () {
				button.removeAttribute('disabled')
				button.classList.remove('wait')
				alert(bricksData.i18n.errorOccurredCleaningUpOrphanedElements)
			}
		})
	})
}

/**
 * Scan for orphaned elements across site
 *
 * @since 2.0
 */
function bricksScanOrphanedElements() {
	let button = document.getElementById('scan-orphaned-elements')
	let resultsContainer = document.getElementById('orphaned-elements-results')

	if (!button || !resultsContainer) {
		return
	}

	button.addEventListener('click', function (e) {
		e.preventDefault()

		jQuery.ajax({
			type: 'POST',
			url: window.bricksData.ajaxUrl,
			data: {
				action: 'bricks_scan_orphaned_elements',
				nonce: window.bricksData.nonce
			},
			beforeSend: () => {
				button.setAttribute('disabled', 'disabled')
				button.classList.add('wait')
			},
			success: function (res) {
				button.removeAttribute('disabled')
				button.classList.remove('wait')

				if (res.success) {
					bricksDisplayOrphansScanResults(res.data, resultsContainer)
				} else {
					alert(res.data.message || window.bricksData.i18n.error)
				}
			},
			error: function () {
				button.removeAttribute('disabled')
				button.classList.remove('wait')
				alert(window.bricksData.i18n.errorOccurredScanningOrphanedElements)
			}
		})
	})
}

/**
 * Display scan results for orphaned elements
 *
 * @since 2.0
 */
function bricksDisplayOrphansScanResults(data, container) {
	let html = ''

	if (data.total_orphans === 0) {
		html = '<div class="separator"></div>'
		html +=
			'<p class="message success"><strong>' +
			window.bricksData.i18n.noOrphanedElementsFound +
			'</strong></p>'
	} else {
		html = '<div class="separator"></div>'

		// Use sprintf-like replacement for the message with placeholders
		let errorMessage = window.bricksData.i18n.orphanedElementsFoundMessage
			.replace('%1$d', data.total_orphans)
			.replace('%2$d', data.total_posts)

		html +=
			'<h3 class="hero">' +
			window.bricksData.i18n.results +
			': ' +
			window.bricksData.i18n.orphanedElementsReview +
			'</h3>'

		html += '<p class="message error"><strong>' + errorMessage + '</strong></p>'

		html += '<div class="actions-wrapper" style="margin: 15px 0;">'
		html +=
			'<button type="button" id="cleanup-all-orphaned-elements" class="ajax button button-primary" style="margin-right: 10px;">'
		html += '<span class="text">' + window.bricksData.i18n.cleanupAllOrphanedElements + '</span>'
		html += '<span class="spinner is-active"></span>'
		html += '<i class="dashicons dashicons-yes hide"></i>'
		html += '</button>'
		html += '</div>'

		html += '<div class="orphaned-posts-list">'

		html += '<ul>'

		// Build the list of posts with orphaned elements
		for (let postId in data.orphaned_by_post_id) {
			let postData = data.orphaned_by_post_id[postId]
			let permalink = postData.permalink
			let editUrl

			// Construct edit URL using permalink and builderParam (similar to getEditTemplateLink in PopupTemplates.vue)
			if (permalink.indexOf('?') === -1) {
				editUrl = `${permalink}?${window.bricksData.builderParam}=run`
			} else {
				editUrl = `${permalink}&${window.bricksData.builderParam}=run`
			}

			html += '<li>'
			html += '<a href="' + editUrl + '" target="_blank">'
			html += '<strong>' + postData.post_title + '</strong>'
			html += '</a>'
			html += ' - '
			html += '<span style="color: #d63638;">'
			html += window.bricksData.i18n.orphanedElementsCountMessage.replace(
				'%d',
				postData.total_orphans
			)
			html += '</span>'
			html += '</li>'
		}

		html += '</ul>'
		html += '</div>'
	}

	container.innerHTML = html
	container.style.display = 'block'

	// Initialize cleanup button if orphaned elements were found
	if (data.total_orphans > 0) {
		bricksCleanupOrphanedElements()
	}
}

document.addEventListener('DOMContentLoaded', function (e) {
	bricksAdminClassicEditor()
	bricksAdminImport()
	bricksAdminSaveLicenseKey()
	bricksAdminToggleLicenseKey()
	bricksAdminSettings()
	bricksAdminRunConverter()
	bricksAdminBreakpointsRegenerateCssFiles()
	bricksAdminGenerateCssFiles()
	bricksAdminCodeReview()
	bricksAdminCodeReviewFilter()
	bricksAdminCustomCapabilities()

	bricksAdminGlobalElementsReview()

	bricksTemplateShortcodeCopyToClipboard()

	bricksDismissHttpsNotice()
	bricksDismissInstagramAccessTokenNotice()

	bricksDropFormSubmissionsTable()
	bricksResetFormSubmissionsTable()
	bricksDeleteFormSubmissionsByFormId()

	bricksRemoteTemplateUrls()
	bricksDeleteTemplateScreenshots()

	bricksReindexFilters()
	bricksRunIndexJob()
	bricksFixElementDB()

	bricksRegenerateCodeSignatures()
	bricksCleanupOrphanedElements()
	bricksScanOrphanedElements()
	bricksAdminGlobalElementsReview()

	bricksTemplateThumbnailAddScrollAnimation()

	bricksAdminMaintenanceTemplateListener()
	bricksAdminAuthUrlBehaviorListener()
	bricksAdminWooSettings()

	bricksAdminTemplateExclusion()
	bricksAdminMaintenanceExcludedPosts()

	bricksElementManger()
	bricksAdminElementManagerUsage()

	bricksAttributeImageSwatches()
	bricksAttributeColorSwatches()
	bricksAttributeSwatchTypeVisibility()

	// Move table navigation top & bottom outside of table container to make table horizontal scrollable
	let tableContainer = document.querySelector('.wp-list-table-container')
	let tablenavTop = document.querySelector('.tablenav.top')
	let tablenavBottom = document.querySelector('.tablenav.bottom')

	if (tableContainer && tablenavTop) {
		// Insert tablenav top before table
		tableContainer.parentNode.insertBefore(tablenavTop, tableContainer)
	}

	if (tableContainer && tablenavBottom) {
		// Insert tablenav top before table
		tableContainer.parentNode.insertBefore(tablenavBottom, tableContainer.nextSibling)
	}

	// Set search_box placeholder
	let formSubmissionsForm = document.getElementById('bricks-form-submissions')
	let searchBox = formSubmissionsForm
		? formSubmissionsForm.querySelector('.search-box input[type=search]')
		: false
	if (searchBox) {
		searchBox.placeholder = window.bricksData?.i18n.formSubmissionsSearchPlaceholder
	}
})
