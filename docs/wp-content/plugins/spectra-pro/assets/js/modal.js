document.addEventListener( 'UAGModalEditor', function ( e ) {
	UAGBModal.init( '.uagb-block-' + e.detail.block_id, true, { ...e.detail } );
} );
document.addEventListener( 'AstraQuickViewForModal', function ( e ) {
	UAGBModal.init( e.detail.class_name, false, { ...e.detail } );
} );
window.UAGBModal = {
	_getVariables( mainSelector ) {
		const document = UAGBModal._getDocumentElement();
		return {
			document_element: document,
			modalWrapper: document.querySelector( mainSelector ),
			modalPopup: document.querySelector( `${ mainSelector }.uagb-modal-popup` ),
			closeModal: document.querySelector( `${ mainSelector } .uagb-modal-popup-close` ),
			bodyWrap: document.querySelector( 'body' ),
			pageTemplate: document.getElementsByClassName( 'block-editor-iframe__body' ),
		};
	},

	_addTriggers( mainSelector, args = {}, defaultTrigger ) {
		const { document_element } = UAGBModal._getVariables( mainSelector );
		const modalWrapper = document_element.querySelectorAll( mainSelector );

		if ( modalWrapper && modalWrapper.length !== 0 ) {
			for ( const modalWrapperEl of modalWrapper ) {
				const innerModal = modalWrapperEl?.querySelector( '.uagb-modal-popup' );
				if ( ! innerModal ) {
					continue;
				}
				document.addEventListener( 'keyup', function ( e ) {
					// If the current modal is not active, then abandon ship.
					if ( ! innerModal.classList.contains( 'active' ) ) {
						return;
					}
					const closeOnEsc = modalWrapperEl.dataset.escpress;
					if ( 27 === e.keyCode && 'enable' === closeOnEsc ) {
						UAGBModal._hide( mainSelector, innerModal );
						if ( 'button' === args?.modalTrigger ) {
							defaultTrigger?.focus();
						}
					}
				} );

				const closeModal = innerModal.querySelector( `${ mainSelector } .uagb-modal-popup-close` );
				closeModal.addEventListener( 'click', function () {
					if ( 'automatic' === args?.modalTrigger && args?.enableCookies && 'close-action' === args?.setCookiesOn ) {
						UAGBModal._setPopupCookie( mainSelector, args.hideForDays );
					}
					UAGBModal._hide( mainSelector, innerModal );
					if ( 'button' === args?.modalTrigger ) {
						defaultTrigger?.focus();
					}
				} );
			}
		}
	},

	_exitIntent( mainSelector, innerModal, exitIntent, args ) {
		document.addEventListener( 'mouseleave', function ( e ) {
			if ( e.clientY > 20 ) {
				return;
			}
			if ( UAGBModal._canShow( mainSelector, args ) && exitIntent ) {
				UAGBModal._show( mainSelector, innerModal );
			}
		} );
	},

	_canShow( mainSelector, args = {} ) {
		const current_cookie = UAGBModal._getCookie( 'uagb-block-popup-' + mainSelector );
		if ( args?.enableCookies ) {
			if ( 'undefined' !== typeof current_cookie && 'automatic' === args?.modalTrigger ) {
				return false;
			}
		} else {
			// Remove cookie.
			document.cookie = `uagb-block-popup-${ mainSelector };max-age=-1`;
		}
		const { modalPopup } = UAGBModal._getVariables( mainSelector );
		if ( modalPopup && modalPopup.classList.contains( 'active' ) ) {
			return false;
		}
		return true;
	},

	_show( mainSelector, innerModal ) {
		const { bodyWrap, pageTemplate, modalWrapper } = UAGBModal._getVariables( mainSelector );
		const siteEditTheme = document.getElementsByClassName( 'edit-site' );
		if ( innerModal && ! innerModal.classList.contains( 'active' ) ) {
			innerModal.classList.add( 'active' );
			// Once this modal is active, create a focusable element to add focus onto the modal and then remove it.
			const focusElement = document.createElement( 'button' );
			focusElement.style.position = 'absolute';
			focusElement.style.opacity = '0';
			const modalFocus = innerModal.insertBefore( focusElement, innerModal.firstChild );
			modalFocus.focus();
			modalFocus.remove();
			if (
				bodyWrap &&
				! bodyWrap.classList.contains( 'hide-scroll' ) &&
				! siteEditTheme?.length &&
				! pageTemplate?.length &&
				! bodyWrap.classList.contains( 'wp-admin' )
			) {
				bodyWrap.classList.add( 'hide-scroll' );
			}
	
			// Added the overlay click event listener here regardless of trigger.
			const closeOverlayClick = modalWrapper.dataset.overlayclick;
			if ( 'enable' === closeOverlayClick ) {
				innerModal.addEventListener( 'click', function ( e ) {
					if (
						innerModal.classList.contains( 'active' ) &&
						! innerModal.querySelector( '.uagb-modal-popup-wrap' ).contains( e.target )
					) {
						UAGBModal._hide( mainSelector, innerModal );
					}
				} );
			}
		}
	},

	_hide( mainSelector, innerModal ) {
		const { modalPopup, bodyWrap } = UAGBModal._getVariables( mainSelector );
		if ( innerModal && innerModal.classList.contains( 'active' ) ) {
			innerModal.classList.remove( 'active' );
		}
		if ( modalPopup && modalPopup.classList.contains( 'active' ) ) {
			modalPopup.classList.remove( 'active' );
		}
		if ( bodyWrap && bodyWrap.classList.contains( 'hide-scroll' ) ) {
			UAGBModal.closeModalScrollCheck( bodyWrap );
		}
	},

	_getDocumentElement() {
		let document_element = document;
		const getEditorIframe = document.querySelectorAll( 'iframe[name="editor-canvas"]' );
		if ( getEditorIframe?.length ) {
			const iframeDocument =
				getEditorIframe?.[ 0 ]?.contentWindow?.document || getEditorIframe?.[ 0 ]?.contentDocument;
			if ( iframeDocument ) {
				document_element = iframeDocument;
			}
		}
		return document_element;
	},
	_afterOpen( mainSelector, args ) {
		if ( args?.enableCookies && 'page-refresh' === args?.setCookiesOn ) {
			UAGBModal._setPopupCookie( mainSelector, args?.hideForDays );
		}
	},

	_getCookie( name ) {
		const value = '; ' + document.cookie;
		const parts = value.split( '; ' + name + '=' );
		if ( parts.length === 2 ) return parts.pop().split( ';' ).shift();
	},

	_setPopupCookie( mainSelector, cookies_days ) {
		const current_cookie = UAGBModal._getCookie( 'uagb-block-popup-' + mainSelector );

		if ( 'undefined' === typeof current_cookie && 'undefined' !== typeof cookies_days ) {
			document.cookie =
				`uagb-block-popup-${ mainSelector }=true; expires=` +
				new Date( Date.now() + cookies_days * 24 * 60 * 60 * 1000 ).toUTCString();
		}
	},

	triggerAction( mainSelector, modalTrigger, isAdmin, isTriggerCustom = false ) {
		const { document_element, bodyWrap } = UAGBModal._getVariables( mainSelector );
		const modalWrapper = document_element.querySelectorAll( mainSelector );

		if ( modalWrapper?.length ) {
			for ( const modalWrapperEl of modalWrapper ) {
				if ( ! modalTrigger || ! isTriggerCustom ) {
					modalTrigger = modalWrapperEl.querySelector( '.uagb-modal-trigger' );
				}
				if ( modalTrigger ) {
					let innerModal = modalWrapperEl?.querySelector( '.uagb-modal-popup' );
					const closeOverlayClick = modalWrapperEl.dataset.overlayclick;
					modalTrigger.style.pointerEvents = 'auto';

					let moveInnerModal = true;
					if ( ! innerModal && isTriggerCustom ) {
						// If the modal is moved to a different location, we need to get the modal from the new location because in the first iteration of the loop, we moved the modal to the body.
						innerModal = document_element.querySelector( '.uagb-modal-popup' + mainSelector );
						moveInnerModal = false;
					}

					if ( ! innerModal ) {
						continue;
					}

					if ( ! isAdmin && moveInnerModal ) {
						document.body?.appendChild( innerModal );
					}

					modalTrigger.addEventListener( 'click', function ( e ) {
						e.preventDefault();
						UAGBModal._show( mainSelector, innerModal );
					} );

					if ( 'disable' !== closeOverlayClick ) {
						innerModal.addEventListener( 'click', function ( e ) {
							if (
								'enable' === closeOverlayClick &&
								innerModal.classList.contains( 'active' ) &&
								! innerModal.querySelector( '.uagb-modal-popup-wrap' ).contains( e.target )
							) {
								UAGBModal._hide( mainSelector, innerModal );
							}
							if ( bodyWrap && bodyWrap.classList.contains( 'hide-scroll' ) ) {
								UAGBModal.closeModalScrollCheck( bodyWrap );
							}
						} );
					}
				}
			}
		}
	},
	init( mainSelector, isAdmin, args ) {
		const { document_element, modalWrapper } = UAGBModal._getVariables( mainSelector );

		if ( 'string' === typeof args ) {
			args = JSON.parse( args );
		}

		const { modalTrigger, cssClass, cssID, exitIntent, showAfterSeconds, noOfSecondsToShow } = args;

		if ( modalWrapper ) {
			const defaultTrigger = modalWrapper.querySelector( '.uagb-modal-trigger' );
			UAGBModal._addTriggers( mainSelector, args, defaultTrigger );
			const innerModal = modalWrapper.querySelector( '.uagb-modal-popup' );
			switch ( modalTrigger ) {
				case 'custom-class':
					// If the Class is not set, don't search for that tag classes.
					if ( ! cssClass ) {
						break;
					}
					const modalTriggerAll = document_element.querySelectorAll( `.${ cssClass }` );
					if ( modalTriggerAll.length > 0 ) {
						modalTriggerAll.forEach( function ( trigger ) {
							UAGBModal.triggerAction( mainSelector, trigger, isAdmin, true );
						} );
					}
					break;
				case 'custom-id':
					// If in the editor, trigger the modal to be visible.
					if ( isAdmin ) {
						UAGBModal._show( mainSelector, innerModal );
					}
					// If the ID is not set, don't search for that tag ID.
					if ( ! cssID ) {
						break;
					}
					const modalTriggerID = document_element.querySelector( `#${ cssID }` );
					if ( modalTriggerID ) {
						UAGBModal.triggerAction( mainSelector, modalTriggerID, isAdmin, true );
					}
					break;
				case 'automatic':
					// Handle automatic trigger.
					const delay = showAfterSeconds ? parseInt( noOfSecondsToShow ) * 1000 : 1;
					// If this modal is an exit intent automatic modal, don't render it on load.
					if ( UAGBModal._canShow( mainSelector, args ) && ! exitIntent ) {
						setTimeout( function () {
							UAGBModal._show( mainSelector, innerModal );
							UAGBModal._afterOpen( mainSelector, args );

							// Close the modal if close on overlay click is enabled and if clicking outside the modal content but on the overlay.
							const closeOverlayClick = modalWrapper.dataset.overlayclick;
							if ( 'enable' === closeOverlayClick ) {
								innerModal.addEventListener( 'click', function ( e ) {
									if (
										innerModal.classList.contains( 'active' ) &&
										! innerModal.querySelector( '.uagb-modal-popup-wrap' ).contains( e.target )
									) {
										UAGBModal._hide( mainSelector, innerModal );
									}
								} );
							}
						}, delay );
					}
					UAGBModal._exitIntent( mainSelector, innerModal, exitIntent, args );
					break;
				default:
					UAGBModal.triggerAction( mainSelector, defaultTrigger, isAdmin, false );
			}
		}
	},

	// Close the Modal and check if the Scrollbar needs to be reactivated.
	closeModalScrollCheck( bodyWrapper ) {
		const allActiveModals = document.querySelectorAll( '.uagb-modal-popup.active' );
		if ( 0 === allActiveModals.length ) {
			bodyWrapper.classList.remove( 'hide-scroll' );
		}
	},
};
