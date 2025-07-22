UAGBLogin = {
	settings: {},
	loginButtonInnerElement: '',
	spinner: `<svg width="20" height="20" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#fff">
		<g fill="none" fill-rule="evenodd">
			<g transform="translate(1 1)" stroke-width="2">
				<circle stroke-opacity=".5" cx="18" cy="18" r="18"/>
				<path d="M36 18c0-9.94-8.06-18-18-18">
					<animateTransform
						attributeName="transform"
						type="rotate"
						from="0 18 18"
						to="360 18 18"
						dur="1s"
						repeatCount="indefinite"/>
				</path>
			</g>
		</g>
	</svg>`,
	classes: {
		inputError: 'spectra-pro-login-form__input-error',
		fieldErrorMessage: 'spectra-pro-login-form__field-error-message',
	},
	init( formSelector, mainSelector, config = {} ) {
		this._listenLogoutRedirect( config );
		this.settings[ mainSelector ] = config;

		if ( ! this.getElements( formSelector ) ) {
			return;
		}

		this.validateOnEntry( formSelector, config?.this_field_error_msg );
		this.passwordVisibility( formSelector, mainSelector );
		if ( config.enableReCaptcha ) {
			this.reCaptcha( mainSelector, config );
		}

		this.formSubmitInit( formSelector, mainSelector, config.enableReCaptcha, config.recaptchaVersion, config?.this_field_error_msg );
		this.forgotPasswordInit( formSelector, mainSelector );
	},

	forgotPasswordInit( formSelector, mainSelector ) {

		// Forgot password element.
		const el = document.querySelector( `${ formSelector } .spectra-pro-login-form-forgot-password > a` );
		const settings = this.settings[ mainSelector ];

		// Place to display validation messages.
		const status = document.querySelector( `${ mainSelector } .spectra-pro-login-form-status` );

		const currentForm = UAGBLogin.getElements( formSelector );

		let forgotPasswordAJAX = new FormData();  // eslint-disable-line prefer-const
		forgotPasswordAJAX.append( 'action', 'spectra_pro_block_login_forgot_password' );

		// WordPress functions like is_ssl() do not work in all cases so we process mismatching protocol (http/https) for admin-AJAX url in JS.
		const processed_ajax_url = this.processAjaxUrl( settings.ajax_url );

		el?.addEventListener( 'click', function handleClick() {

			let formData = UAGBLogin.serializeArrayJS( currentForm );

			formData = formData.reduce( ( acc, { name, value } ) => {
				acc[ name ] = value;
				return acc;
			}, {} );
	
			// Convert the normal formData object to a proper 'FormData' for AJAX call.
			for ( const key in formData ) {
				forgotPasswordAJAX.append( key, formData[ key ] );
			}

			fetch( processed_ajax_url, {
				method: 'POST',
				credentials: 'same-origin',
				body: forgotPasswordAJAX,
			} )
				.then( ( response ) => response.json() )
				.then( ( response ) => {

					if ( ! status ) {
						return;
					}
					// Create a node.
					const responseDiv = document.createElement( 'div' );

					if ( response.success ) {
						responseDiv.classList.add( 'spectra-pro-login-form-status__success' );
						responseDiv.innerText = response.data;
						status.replaceChildren( responseDiv );
					} else {

						// If custom error data is being sent, we read it in the following way.
						if( response.data.type === 'custom' ) {
							responseDiv.classList.add( 'spectra-pro-login-form-status__error' );
							responseDiv.innerText = response.data.message;
							status.replaceChildren( responseDiv );
							return;
						}

						const logs = [];

						if (
							response?.data &&
							typeof response.data === 'object' &&
							Object.keys( response.data ).length > 0
						) {
							for ( const value of response.data ) {
								const log = document.createElement( 'div' );
								log.classList.add( 'spectra-pro-login-form-status__error' );
								log.innerText = value.message;
								logs.push( log );
							}
						}

						if ( logs ) {
							status.replaceChildren( ...logs );
						} else {
							responseDiv.classList.add( 'spectra-pro-login-form-status__error' );
							responseDiv.innerText = JSON.stringify( response.data ).replace( /\\"/g, "'" );
							status.replaceChildren( responseDiv );
						}
					}
				} )
				.catch( ( error ) => {
					console.error( error ); // eslint-disable-line no-console
				} );

		} );
	},

	_validateFields( field, thisFieldErrorMsg ) {
		// Check presence of values
		switch ( field.name ) {
			case 'username':
				if ( field.value.trim() === '' ) {
					this._setStatus(
						field,
						thisFieldErrorMsg.username,
						'error'
					);
				} else {
					this._setStatus( field, null, 'success' );
				}
				break;

			case 'password':
				if ( field.value.trim() === '' ) {
					this._setStatus(
						field,
						thisFieldErrorMsg.password,
						'error'
					);
				} else {
					this._setStatus( field, null, 'success' );
				}
				break;
		}
	},
	_setStatus( field, message, status ) {
		const errorWrap = field.parentElement.querySelector( '.spectra-pro-login-form__field-error-message' );
		if ( status === 'success' ) {
			if ( errorWrap ) {
				errorWrap.remove();
			}
			field.classList.remove( UAGBLogin.classes.inputError );
		}

		if ( status === 'error' ) {
			field.classList.add( UAGBLogin.classes.inputError );
			if ( errorWrap ) {
				errorWrap.innerHTML = message;
			} else {
				const errorMessageNode = document.createElement( 'span' );
				errorMessageNode.classList = 'spectra-pro-login-form__field-error-message';
				errorMessageNode.innerHTML = message;
				field.parentElement.appendChild( errorMessageNode );
			}
		}
	},
	_isFormSubmitable( formSelector ) {
		const currentForm = UAGBLogin.getElements( formSelector );
		return currentForm.getElementsByClassName( UAGBLogin.classes.inputError ).length < 1 ? true : false;
	},
	_showValidationMessage( formSelector, errorLogs ) {
		const currentForm = UAGBLogin.getElements( formSelector );

		Object.entries( errorLogs ).forEach( ( [ key, value ] ) => {
			let log = document.createElement( 'span' ); // eslint-disable-line prefer-const
			log.classList = 'spectra-pro-login-form__field-error-message';
			log.innerHTML = value;

			currentForm
				.querySelector( 'input[name="' + key + '"]' )
				?.parentElement()
				.append( log );
		} );
	},
	_dispatchLoginRedirect( config ) {
		window.location.href = config.loginRedirectURL;
	},
	_listenLogoutRedirect( config ) {
		const baseSelector = '.uagb-block-' + config.block_id;
		const logoutLink = document.querySelector( baseSelector + ' .wp-block-spectra-pro-login__logged-in-message a' );

		const sameOriginURL = this._sameOrigin( window.location, config.logoutRedirectURL );

		if ( logoutLink && ! sameOriginURL ) {
			logoutLink.addEventListener( 'click', () => {
				window.open( config.logoutRedirectURL );
			} );
		}
	},
	_sameOrigin( a, b ) {
		const urlA = new URL( a );
		const urlB = new URL( b );
		return urlA.origin === urlB.origin;
	},
	_formSubmit( formSelector, mainSelector, token = false ) {
		const settings = this.settings[ mainSelector ];
		const submitButton = document.querySelector( `${ mainSelector } .spectra-pro-login-form-submit-button` );
		const status = document.querySelector( `${ mainSelector } .spectra-pro-login-form-status` );
		const currentForm = UAGBLogin.getElements( formSelector );
		let formData = this.serializeArrayJS( currentForm );

		formData = formData.reduce( ( acc, { name, value } ) => {
			acc[ name ] = value;
			return acc;
		}, {} );

		if ( settings.enableReCaptcha ) {
			formData.recaptchaStatus = settings.enableReCaptcha;
			formData.reCaptchaType = settings.recaptchaVersion;
			if ( token ) {
				formData[ 'g-recaptcha-response' ] = token;
			}
		}

		let formDataAJAX = new FormData(); // eslint-disable-line prefer-const

		formDataAJAX.append( 'action', 'spectra_pro_block_login' );
		// Convert the normal formData object to a proper 'FormData' for AJAX call.
		for ( const key in formData ) {
			formDataAJAX.append( key, formData[ key ] );
		}

		// Before send.
		currentForm.style.opacity = '0.45';
		submitButton.setAttribute( 'disabled', 'disabled' );
		UAGBLogin.loginButtonInnerElement = submitButton.innerHTML;

		submitButton.innerHTML = UAGBLogin.spinner;

		status.innerHTML = '';
		const fieldErrorMessageWrap = currentForm.querySelector( '.' + UAGBLogin.classes.fieldErrorMessage );
		if ( fieldErrorMessageWrap ) {
			fieldErrorMessageWrap.remove();
		}

		// WordPress functions like is_ssl() do not work in all cases so we process mismatching protocol (http/https) for admin-AJAX url in JS.
		const processed_ajax_url = this.processAjaxUrl( settings.ajax_url );

		fetch( processed_ajax_url, {
			method: 'POST',
			credentials: 'same-origin',
			body: formDataAJAX,
		} )
			.then( ( response ) => response.json() )
			.then( ( response ) => {
				// Create a node.
				const responseDiv = document.createElement( 'div' );

				if ( response.success ) {
					responseDiv.classList.add( 'spectra-pro-login-form-status__success' );
					responseDiv.innerText = response.data;
					status.appendChild( responseDiv );
				} else {
					const logs = [];
					if ( response?.data ) {
						if ( 'object' === typeof response.data && Object.keys( response.data ).length > 0 ) {
							// If the WP Signon error is an object, get the contents and add them to the log.
							for ( const value of response.data ) {
								const log = document.createElement( 'div' );
								log.classList.add( 'spectra-pro-login-form-status__error' );
								log.innerText = value;
								logs.push( log );
							}
						} else if ( 'string' === typeof response.data ) {
							// If this is a string, first parse it as DOM Nodes. The DOMParser is always available.
							const errorParser = new DOMParser(); // eslint-disable-line no-undef
							const errorHTML = errorParser.parseFromString( response.data, 'text/html' );
							const errorBody = errorHTML.body;

							// Function to remove any dangerous elements from the error message.
							const removeDangerousElements = ( node ) => {
								// If this is a text node or the initial body node that will be removed, abandon ship.
								if ( Node.TEXT_NODE === node.nodeType || 'body' === node?.tagName?.toLowerCase() ) { // eslint-disable-line no-undef
									// The Node object is always available. This condition will work as intended.
									return;
								}

								// Set a list of valid tags.
								const validTags = [ 'strong', 'em', 'i', 'a', 'span' ];
								
								// If the current tag is not valid, remove it.
								if ( ! validTags.includes( node.tagName.toLowerCase() ) ) {
									node.parentNode.removeChild( node );
								}
							}

							// Function to sanitize the attributes of an element
							const sanitizeAttributes = ( node ) => {
								// If this is a text node, or there are no attributes to this node, abandon ship.
								if ( Node.TEXT_NODE === node.nodeType || ! node?.attributes[0] ) { // eslint-disable-line no-undef
									// The Node object is always available. This condition will work as intended.
									return;
								}
								// Make a list of allowed attributes that can be present in an element for the error message.
								const allowedAttributes = [ 'class', 'id', 'href' ];

								// Remove any of the unallowed attributes, and sanitize any of the allowed attributes.
								Array.from( node.attributes ).forEach( ( attribute ) => {
									const currentAttribute = attribute.name.toLowerCase();
									if ( ! allowedAttributes.includes( currentAttribute ) ) {
										node.removeAttribute( attribute.name );
									} else {
										node.setAttribute( currentAttribute, wp.escapeHtml.escapeAttribute( node.getAttribute( currentAttribute ) ) );
									}
								} );
							}

							function traverseChildren( node ) {
								// Check if the node exists.
								if ( ! node ) return;
							
								// Frist Remove potentially dangerous elements.
								removeDangerousElements( node );
								// Then sanitize the attribute values.
								sanitizeAttributes( node );

								// Recursively traverse child nodes if they exist.
								Array.from( node.childNodes ).forEach( child => {
									traverseChildren( child );
								} );
							}

							// Start sanitizing the error body.
							traverseChildren( errorBody );

							// Create a log element for this error, and add all the content of the error body to it.
							const log = document.createElement( 'div' );
							log.classList.add( 'spectra-pro-login-form-status__error' );
							log.append( ...errorBody.childNodes );
							logs.push( log );
						} 
					}

					if ( logs ) {
						status.replaceChildren( ...logs );
					} else {
						responseDiv.classList.add( 'spectra-pro-login-form-status__error' );
						responseDiv.innerText = JSON.stringify( response.data ).replace( /\\"/g, "'" );
						status.replaceChildren( responseDiv );
					}
				}
				setTimeout( () => {
					// remove
					currentForm.style.opacity = '1';
					submitButton.innerHTML = UAGBLogin.loginButtonInnerElement;
					submitButton.removeAttribute( 'disabled' );

					// redirect
					if ( response.success ) {
						UAGBLogin._dispatchLoginRedirect( settings );
					} else {
						UAGBLogin._showValidationMessage( formSelector, response.data );
					}
				}, 1000 );
			} )
			.catch( ( error ) => {
				console.error( error ); // eslint-disable-line no-console
			} );
	},
	getElements( selector, childSelector = null ) {
		let domElement = document.querySelector( selector );
		if ( domElement ) {
			if ( childSelector ) {
				return domElement.querySelector( childSelector );
			}
		} else {
			const editorCanvas = document.querySelector( 'iframe[name="editor-canvas"]' );
			if ( editorCanvas && editorCanvas.contentDocument ) {
				domElement = editorCanvas.contentDocument.querySelector( selector );
				if ( childSelector ) {
					return ( domElement = domElement.querySelector( childSelector ) );
				}
			}
		}
		return domElement;
	},
	getFormFields( formSelector ) {
		const currentForm = UAGBLogin.getElements( formSelector );
		return currentForm.querySelectorAll( 'input:not([type=hidden])' );
	},
	validateOnEntry( formSelector, thisFieldErrorMsg ) {
		const self = this;
		const currentFields = this.getFormFields( formSelector );

		for ( const field of currentFields ) {
			field.addEventListener( 'focusout', () => {
				self._validateFields( field, thisFieldErrorMsg );
			} );
		}
	},
	reCaptcha( mainSelector, config ) {
		if ( config.recaptchaVersion === 'v2' && UAGBLogin.settings[ mainSelector ].recaptchaSiteKey ) {
			const recaptchaLink = document.createElement( 'script' );
			recaptchaLink.type = 'text/javascript';
			recaptchaLink.src = 'https://www.google.com/recaptcha/api.js';
			document.head.appendChild( recaptchaLink );
		} else if ( config.recaptchaVersion === 'v3' && UAGBLogin.settings[ mainSelector ].recaptchaSiteKey ) {
			const api = document.createElement( 'script' );
			api.type = 'text/javascript';
			api.src = 'https://www.google.com/recaptcha/api.js?render=' + config.recaptchaSiteKey;
			document.head.appendChild( api );
		}
	},
	formSubmitInit( formSelector, mainSelector, enableReCaptcha, recaptchaVersion, thisFieldErrorMsg ) {
		const currentFields = this.getFormFields( formSelector );

		document.querySelector( formSelector ).addEventListener( 'submit', function ( event ) {
			event.preventDefault();

			for ( const field of currentFields ) {
				UAGBLogin._validateFields( field, thisFieldErrorMsg );
			}

			if ( UAGBLogin._isFormSubmitable( formSelector ) ) {
				if ( enableReCaptcha === true ) {
					if ( recaptchaVersion === 'v3' ) {
						grecaptcha.ready( function () {
							grecaptcha
								.execute( UAGBLogin.settings[ mainSelector ].recaptchaSiteKey, { action: 'submit' } )
								.then( function ( token ) {
									UAGBLogin._formSubmit( formSelector, mainSelector, token );
								} );
						} );
					} else {
						UAGBLogin._formSubmit( formSelector, mainSelector );
					}
				} else {
					UAGBLogin._formSubmit( formSelector, mainSelector );
				}
			}
		} );
	},

	passwordVisibility( formSelector, mainSelector ) {
		const currentForm = UAGBLogin.getElements( formSelector );

		currentForm
			.querySelector( '#password-visibility-' + UAGBLogin.settings[ mainSelector ].block_id )
			.addEventListener( 'click', function () {
				const inputPassword = document.querySelector(
					`${ mainSelector } .spectra-pro-login-form-pass-wrap input`
				);
				if ( 'password' === inputPassword.getAttribute( 'type' ) ) {
					inputPassword.setAttribute( 'type', 'text' );
					resetToggle( false );
				} else {
					inputPassword.setAttribute( 'type', 'password' );
					resetToggle( true );
				}
			} );
		function resetToggle( show ) {
			const visibility = document.querySelector( `${ mainSelector } .spectra-pro-login-form-pass-wrap button` );
			visibility
				.querySelector( '.dashicons' )
				.classList.remove( show ? 'dashicons-hidden' : 'dashicons-visibility' );
			visibility
				.querySelector( '.dashicons' )
				.classList.add( show ? 'dashicons-visibility' : 'dashicons-hidden' );
		}
	},

	// Derived from Chris Ferdinandi's function on https://vanillajstoolkit.com/helpers/serializearray/
	// We use this so that we are not dependent upon jQuery's serializeArray() function.
	serializeArrayJS( form ) {
		let arr = []; // eslint-disable-line prefer-const
		Array.prototype.slice.call( form.elements ).forEach( function ( field ) {
			if ( ! field.name || field.disabled || [ 'file', 'reset', 'submit', 'button' ].indexOf( field.type ) > -1 )
				return;
			if ( field.type === 'select-multiple' ) {
				Array.prototype.slice.call( field.options ).forEach( function ( option ) {
					if ( ! option.selected ) return;
					arr.push( {
						name: field.name,
						value: option.value,
					} );
				} );
				return;
			}
			if ( [ 'checkbox', 'radio' ].indexOf( field.type ) > -1 && ! field.checked ) return;
			arr.push( {
				name: field.name,
				value: field.value,
			} );
		} );
		return arr;
	},

	// WordPress functions like is_ssl() do not work in all cases so we process mismatching protocol (http/https) for admin-AJAX url in JS.
	processAjaxUrl( url ) {
		const processed_ajax_url = new URL( url );

		if ( processed_ajax_url.protocol !== window.location.protocol ) {
			processed_ajax_url.protocol = window.location.protocol;
		}

		return processed_ajax_url;
	},
};
