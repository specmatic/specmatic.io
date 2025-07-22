// Spectra Pro Popup JS Actions Needed in the Admin CPT Page.

const UAGBQuickviewModal = ( event ) => {
	event.preventDefault();
	const element = event.target;
	const dashiconElement = element.querySelector( '.dashicons' );

	// Add the Loading Dashicon.
	dashiconElement.classList.remove( 'dashicons-visibility' );
	dashiconElement.classList.add( 'dashicons-ellipsis' );

	const popupData = new FormData();
	popupData.append( 'action', 'uag_trigger_popup_quickview' );
	popupData.append( 'nonce', spectra_pro_popup_builder_admin.spectra_pro_popup_builder_admin_nonce );
	popupData.append( 'popup_id', element.dataset.popup_id );
	fetch( spectra_pro_popup_builder_admin.ajax_url, {
		method: 'POST',
		credentials: 'same-origin',
		body: popupData,
	} )
	.then( ( resp ) => resp.json() )
	.then( ( jsonResp ) => {
		if ( false === jsonResp.success ) {
			return;
		}

		// Return early if the modal overlay isn't found.
		const modalOverlay = document.querySelector( '.spectra-popup-builder__modal--overlay' );
		if ( ! modalOverlay ) {
			return;
		}

		const modal = modalOverlay.querySelector( '.spectra-popup-builder__modal' );
		if ( ! modal ) {
			return;
		}

		const body = document.querySelector( 'body' );

		// Show the Modal.
		modalOverlay.style.display = 'flex';
		setTimeout( () => {
			body.classList.add( 'spectra-popup-builder__modal--scroll-lock' );
			modalOverlay.style.opacity = 1;
			modal.style.opacity = 1;
		}, 50 );

		// Set the required constants.
		const {
			name,
			type,
			inclusions,
			exclusions,
			status,
			date,
			edit,
			editLabel,
		} = jsonResp.data;
		const title = modal.querySelector( '.spectra-popup-builder__modal--title' );
		const typeBadge = modal.querySelector( '.spectra-popup-builder__modal--type' );
		const inclusionCell = modal.querySelector( '.spectra-popup-builder__modal--body-inclusions' );
		const exclusionCell = modal.querySelector( '.spectra-popup-builder__modal--body-exclusions' );
		const closeButton = modal.querySelector( '.spectra-popup-builder__modal--close' );
		const statusSpan = modal.querySelector( '.spectra-popup-builder__modal--status' );
		const dateSpan = modal.querySelector( '.spectra-popup-builder__modal--date' );
		const editLink = modal.querySelector( '.spectra-popup-builder__modal--edit' );

		// Add all the text content.
		title.textContent = name;
		typeBadge.textContent = 'banner' === type ? 'info bar' : type;
		statusSpan.textContent = 'publish' === status ? 'published' : status;
		dateSpan.textContent = date;
		editLink.textContent = editLabel;

		// Add the Inclusions list if it exists, else add 'Entire Website'.
		if ( inclusionCell && inclusions?.length ) {
			const inclusionMarkup = document.createElement( 'ul' );
			inclusions.forEach( inclusionRule => {
				const inclusionRuleMarkup = document.createElement( 'li' );
				inclusionRuleMarkup.textContent = inclusionRule;
				inclusionMarkup.appendChild( inclusionRuleMarkup );
			} );
			inclusionCell.appendChild( inclusionMarkup );
		} else {
			const noInclusion = document.createElement( 'div' );
			noInclusion.textContent = 'Entire Website';
			inclusionCell.appendChild( noInclusion );
		}

		// Add the exclusion list if it exists, else add 'None'.
		if ( exclusionCell && exclusions?.length ) {
			const exclusionMarkup = document.createElement( 'ul' );
			exclusions.forEach( exclusionRule => {
				const exclusionRuleMarkup = document.createElement( 'li' );
				exclusionRuleMarkup.textContent = exclusionRule;
				exclusionMarkup.appendChild( exclusionRuleMarkup );
			} );
			exclusionCell.appendChild( exclusionMarkup );
		} else {
			const noExclusion = document.createElement( 'div' );
			noExclusion.textContent = 'Not Set';
			exclusionCell.appendChild( noExclusion );
		}

		// Add the Edit Button Link.
		editLink?.setAttribute( 'href', edit.replace( '&amp;', '&' ) );

		// Cleanup when the Modal is Closed.
		const closeQuickview = ( e ) => {
			e.preventDefault();
			modal.style.opacity = 0;
			body.classList.remove( 'spectra-popup-builder__modal--scroll-lock' );
			setTimeout( () => {
				modalOverlay.style.opacity = 0;
			}, 50 );
			setTimeout( () => {
				modalOverlay.style.display = 'none';
				title.textContent = '';
				typeBadge.textContent = '';
				statusSpan.textContent = '';
				dateSpan.textContent = '';
				inclusionCell.innerHTML = '';
				exclusionCell.innerHTML = '';
				editLink?.setAttribute( 'href', 'javascript:void(0)' );
				editLink.textContent = wp.i18n.__( 'Edit', 'spectra-pro' );
				closeButton.removeEventListener( 'click', closeQuickview );
			}, 200 );
		}

		// Close the Modal when the Close Button is clicked.
		closeButton.addEventListener( 'click', closeQuickview );

		// Add the Quick View Dashicon back once the modal loads.
		setTimeout( () => {
			dashiconElement.classList.remove( 'dashicons-ellipsis' );
			dashiconElement.classList.add( 'dashicons-visibility' );
		}, 150 );
	} )
	.catch( () => {		
		// Add the Quick View Dashicon back.
		dashiconElement.classList.remove( 'dashicons-ellipsis' );
		dashiconElement.classList.add( 'dashicons-visibility' );
	} );
}


// Bind Related Click Events on Load.
document.addEventListener( 'DOMContentLoaded', () => {
	// Bind all the Quick-view Buttons.
	const spectraQuickButtons = document.querySelectorAll( '.spectra-popup-builder__button' );
	for ( let spectraQuickButtonCount = 0; spectraQuickButtonCount < spectraQuickButtons.length; spectraQuickButtonCount++ ) {
		spectraQuickButtons[ spectraQuickButtonCount ].addEventListener( 'click', ( event ) => UAGBQuickviewModal( event ) );
	}
} );
