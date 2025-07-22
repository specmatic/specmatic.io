UAGBRegister = {
	settings: {},
	registerButtonInnerElement: '',
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
		inputError: 'spectra-pro-register-form__input-error',
		inputSuccess: 'spectra-pro-register-form__input-success',
		fieldErrorMessage: 'spectra-pro-register-form__field-error-message',
	},
	init( formSelector, mainSelector, data = {} ) {
		this.settings[ mainSelector ] = data;

		if ( document.querySelector( formSelector ) ) {
			this.validateOnEntry( mainSelector, formSelector );
			this.usernameAndEmailUniqueCheck( mainSelector, formSelector );
			if ( data.reCaptchaEnable ) {
				this.reCaptcha( mainSelector, data.reCaptchaType );
			}

			this.formSubmitInit( mainSelector, formSelector, data.reCaptchaEnable, data.reCaptchaType );
		}
	},

	_validateFields( mainSelector, formSelector, field ) {
		const currentForm = document.querySelector( formSelector );

		// Check presence of values
		if ( field.required ) {
			switch ( field.name ) {
				case 'first_name':
					if ( field.value.trim() === '' ) {
						this._setStatus(
							field,
							`${
								field?.previousElementSibling?.innerText
									? field.previousElementSibling.innerText
								: uagb_register_js.first_name
							} ${ uagb_register_js.cannot_be_blank }`,
							'error'
						);
					} else {
						this._setStatus( field, null, 'success' );
					}

					break;

				case 'last_name':
					if ( field.value.trim() === '' ) {
						this._setStatus(
							field,
							`${
								field?.previousElementSibling?.innerText
									? field.previousElementSibling.innerText
								: uagb_register_js.last_name
							} ${ uagb_register_js.cannot_be_blank }`,
							'error'
						);
					} else {
						this._setStatus( field, null, 'success' );
					}

					break;

				case 'username':
					if ( field.value.trim() === '' ) {
						this._setStatus(
							field,
							UAGBRegister.settings[ mainSelector ].messageInvalidUsernameError,
							'error'
						);
					}
					break;

				case 'email':
					if ( field.value.trim() === '' ) {
						this._setStatus(
							field,
							UAGBRegister.settings[ mainSelector ].messageEmailMissingError,
							'error'
						);
					} else if ( field.value.trim() !== '' ) {
						const re = /\S+@\S+\.\S+/;
						if ( re.test( field.value ) ) {
							this._setStatus( field, null, 'success' );
						} else {
							this._setStatus(
								field,
								UAGBRegister.settings[ mainSelector ].messageInvalidEmailError,
								'error'
							);
						}
					}
					break;

				case 'password':
					if ( field.value.trim() === '' ) {
						this._setStatus(
							field,
							UAGBRegister.settings[ mainSelector ].messageInvalidPasswordError,
							'error'
						);
					} else {
						this._setStatus( field, null, 'success' );
					}

					break;

				case 'reenter_password':
					const passwordField = currentForm.querySelector( 'input[name="password"]' );
					if ( passwordField.value ) {
						if ( field.value !== passwordField.value || field.value.trim() === '' ) {
							this._setStatus(
								field,
								UAGBRegister.settings[ mainSelector ].messagePasswordConfirmError,
								'error'
							);
						} else {
							this._setStatus( field, null, 'success' );
						}
					}
					break;

				case 'terms':
					if ( ! field.checked ) {
						this._setStatus( field, UAGBRegister.settings[ mainSelector ].messageTermsError, 'error' );
					} else {
						this._setStatus( field, null, 'success' );
					}

					break;

				default:
					if ( ! field.value !== '' ) {
						this._setStatus( field, UAGBRegister.settings[ mainSelector ].messageOtherError, 'error' );
					} else {
						this._setStatus( field, null, 'success' );
					}

					break;
			}
		}
	},

	_setStatus( field, message, status, color = null ) {
		const successWrap = field.parentElement.querySelector( '.spectra-pro-register-form__field-success-message' );
		const errorWrap = field.parentElement.querySelector( '.spectra-pro-register-form__field-error-message' );
		if ( status === 'success' ) {
			if ( errorWrap ) {
				field.classList.remove( UAGBRegister.classes.inputError );
				errorWrap.remove();
			}

			field.classList.add( UAGBRegister.classes.inputSuccess );
			if ( successWrap ) {
				successWrap.innerHTML = message;
				if ( color ) {
					successWrap.style.color = color;
				}
			} else {
				const successMessageNode = document.createElement( 'span' );
				successMessageNode.classList = 'spectra-pro-register-form__field-success-message';
				successMessageNode.innerHTML = message;
				if ( color ) {
					successMessageNode.style.color = color;
				}
				field.parentElement.appendChild( successMessageNode );
			}
		}

		if ( status === 'error' ) {
			field.classList.add( UAGBRegister.classes.inputError );
			if ( successWrap ) {
				field.classList.remove( UAGBRegister.classes.inputSuccess );
				successWrap.remove();
			}

			if ( errorWrap ) {
				errorWrap.innerHTML = message;
			} else {
				const errorMessageNode = document.createElement( 'span' );
				errorMessageNode.classList = 'spectra-pro-register-form__field-error-message';
				errorMessageNode.innerHTML = message;
				field.parentElement.appendChild( errorMessageNode );
			}
		}
	},

	_isFormSubmittable( formSelector ) {
		const currentForm = document.querySelector( formSelector );
		return currentForm.getElementsByClassName( UAGBRegister.classes.inputError ).length < 1 ? true : false;
	},

	_debounce( func, timeout = 500 ) {
		let timer;
		return ( ...args ) => {
			clearTimeout( timer );
			timer = setTimeout( () => {
				func.apply( this, args );
			}, timeout );
		};
	},

	_clearValidationMessage( formSelector ) {
		const currentForm = document.querySelector( formSelector );
		currentForm.querySelector( '.spectra-pro-register-form__field-error-message' ).remove();
		currentForm.querySelector( '.spectra-pro-register-form-status' ).remove();
	},

	_showValidationMessage( formSelector, errorLogs ) {
		const currentForm = document.querySelector( formSelector );
		Object.entries( errorLogs ).forEach( ( [ key, value ] ) => {
			const log = document.createElement( 'span' );
			log.classList = 'spectra-pro-register-form__field-error-message';
			log.innerHTML = value;
			const field = currentForm.querySelector( 'input[name="' + key + '"]' );
			if ( field ) {
				field.parentElement.append( log );
			}
		} );
	},
	reCaptcha( mainSelector, reCaptchaType ) {
		if ( reCaptchaType === 'v2' && UAGBRegister.settings[ mainSelector ].recaptchaSiteKey ) {
			const recaptchaLink = document.createElement( 'script' );
			recaptchaLink.type = 'text/javascript';
			recaptchaLink.src = 'https://www.google.com/recaptcha/api.js';
			document.head.appendChild( recaptchaLink );
		} else if ( reCaptchaType === 'v3' && UAGBRegister.settings[ mainSelector ].recaptchaSiteKey ) {
			if ( UAGBRegister.settings[ mainSelector ].hidereCaptchaBatch ) {
				const badge = document.getElementsByClassName( 'grecaptcha-badge' )[ 0 ];
				if ( badge ) {
					badge.style.visibility = 'hidden';
				}
			}
			const api = document.createElement( 'script' );
			api.type = 'text/javascript';
			api.src =
				'https://www.google.com/recaptcha/api.js?render=' +
				UAGBRegister.settings[ mainSelector ].recaptchaSiteKey;
			document.head.appendChild( api );
		}
	},

	getFormFields( formSelector ) {
		const currentForm = document.querySelector( formSelector );
		return currentForm.getElementsByTagName( 'input' );
	},

	validateOnEntry( mainSelector, formSelector ) {
		const self = this;
		const currentFormFields = this.getFormFields( formSelector );

		for ( const field of currentFormFields ) {
			if ( 'password' === field.type && field.name === 'password' ) {
				field.addEventListener( 'keyup', () => {
					self._checkPasswordStrength( mainSelector, field );
				} );
			}

			field.addEventListener( 'focusout', () => {
				self._validateFields( mainSelector, formSelector, field );
			} );
		}
	},

	_checkPasswordStrength( mainSelector, field ) {
		const password = field.value;
		let strength;
		if ( UAGBRegister.settings[ mainSelector ].wp_version ) {
			strength = wp.passwordStrength.meter( password, wp.passwordStrength.userInputDisallowedList(), password );
		} else {
			strength = wp.passwordStrength.meter( password, wp.passwordStrength.userInputBlacklist(), password );
		}

		switch ( strength ) {
			case -1:
				this._setStatus( field, pwsL10n.unknown, 'success', '#cfcfcf' );
				break;
			case 2:
				this._setStatus( field, pwsL10n.bad, 'success', '#e07757' );
				break;
			case 3:
				this._setStatus( field, pwsL10n.good, 'success', '#f0ad4e' );
				break;
			case 4:
				this._setStatus( field, pwsL10n.strong, 'success', '#5cb85c' );
				break;
			case 5:
				this._setStatus( field, pwsL10n.mismatch, 'success', '#f0ad4e' );
				break;
			default:
				this._setStatus( field, pwsL10n.short, 'success', '#d9534f' );
		}
	},

	usernameAndEmailUniqueCheck( mainSelector, formSelector ) {
		const currentForm = document.querySelector( formSelector );
		const settings = this.settings[ mainSelector ];
		const that = this;
		const validateHandler = this._debounce( ( e ) => {
			if ( ! e.target.value ) {
				return;
			}
			const formData = new FormData();
			formData.append( 'action', 'spectra_pro_block_register_unique_username_and_email' );
			formData.append( 'field_name', e.target.name );
			formData.append( 'field_value', e.target.value );
			formData.append( 'security', currentForm.querySelector( 'input[name="_nonce"]' ).value );
			// request send
			fetch( settings.ajax_url, {
				method: 'POST',
				credentials: 'same-origin',
				body: formData,
			} )
				.then( ( response ) => response.json() )
				.then( ( response ) => {
					if ( response.success ) {
						if ( 'username' === e.target.name ) {
							that._setStatus(
								currentForm.querySelector( 'input[name="username"]' ),
								response.data?.has_error
									? UAGBRegister.settings[ mainSelector ][ response.data?.attribute ]
									: null,
								response.data?.has_error ? 'error' : 'success'
							);
						} else {
							that._setStatus(
								currentForm.querySelector( 'input[name="email"]' ),
								response.data?.has_error
									? UAGBRegister.settings[ mainSelector ][ response.data?.attribute ]
									: null,
								response.data?.has_error ? 'error' : 'success'
							);
						}
					}
				} )
				.catch( ( error ) => {
					// eslint-disable-next-line no-console
					console.error( error );
				} );
		} );
		currentForm.querySelector( 'input[name="username"]' )?.addEventListener( 'keypress', validateHandler, false );
		currentForm.querySelector( 'input[name="username"]' )?.addEventListener( 'focusout', validateHandler, false );
		currentForm.querySelector( 'input[name="email"]' ).addEventListener( 'keypress', validateHandler, false );
		currentForm.querySelector( 'input[name="email"]' ).addEventListener( 'focusout', validateHandler, false );
	},

	formSubmitInit( mainSelector, formSelector, enableReCaptcha, recaptchaVersion ) {
		const currentForm = document.querySelector( formSelector );
		currentForm.addEventListener( 'submit', ( event ) => {
			event.preventDefault();
			if ( enableReCaptcha === true ) {
				if ( recaptchaVersion === 'v3' ) {
					if ( document.getElementsByClassName( 'grecaptcha-logo' ).length === 0 ) {
						currentForm.parentElement.querySelector(
							'.spectra-pro-register-form-status'
						).innerHTML = `<div class="spectra-pro-register-form-status__error"><strong>Error:</strong> Invalid Google reCAPTCHA Site Key.</div>`;
						return false;
					}
					grecaptcha.ready( function () {
						grecaptcha
							.execute( UAGBRegister.settings[ mainSelector ].recaptchaSiteKey, { action: 'submit' } )
							.then( function ( token ) {
								UAGBRegister.formSubmit( mainSelector, formSelector, token );
							} );
					} );
				} else {
					UAGBRegister.formSubmit( mainSelector, formSelector );
				}
			} else {
				UAGBRegister.formSubmit( mainSelector, formSelector );
			}
		} );
	},

	_dispatchLoginRedirect( redirectUrl ) {
		window.location.href = redirectUrl;
	},

	formSubmit( mainSelector, formSelector, token = false ) {
		const currentForm = document.querySelector( formSelector );

		if ( UAGBRegister._isFormSubmittable( formSelector ) ) {
			const status = currentForm.parentElement.querySelector( '.spectra-pro-register-form-status' );
			const formData = new FormData();
			formData.append( 'action', 'spectra_pro_block_register' );
			formData.append( 'post_id', UAGBRegister.settings[ mainSelector ].post_id );
			formData.append( 'block_id', UAGBRegister.settings[ mainSelector ].block_id );

			for ( const item of currentForm.elements ) {
				if ( item.name ) {
					formData.append( item.name, item.value );
				}
			}
			if ( token ) {
				formData.append( 'g-recaptcha-response', token );
			}

			// Before Submit
			UAGBRegister._before_submit( formSelector );

			const fieldErrorMessageWrap = currentForm.querySelector( '.' + UAGBRegister.classes.fieldErrorMessage );
			if ( fieldErrorMessageWrap ) {
				fieldErrorMessageWrap.remove();
			}

			const processed_ajax_url = UAGBRegister.processAjaxUrl( UAGBRegister.settings[ mainSelector ].ajax_url );

			// request send
			fetch( processed_ajax_url, {
				method: 'POST',
				credentials: 'same-origin',
				body: formData,
			} )
				.then( ( response ) => response.json() )
				.then( ( response ) => {
					// Create a node.
					const responseDiv = document.createElement( 'div' );
					if ( response.success ) {
						responseDiv.classList.add( 'spectra-pro-register-form-status__success' );
						responseDiv.innerText = response.data?.message;
						status.replaceChildren( responseDiv );
					} else {
						const logs = [];
						if ( typeof response.data === 'object' ) {
							// eslint-disable-next-line
							Object.entries( response.data ).forEach( ( [ key, value ] ) => {
								const log = document.createElement( 'div' );
								log.classList.add( 'spectra-pro-register-form-status__error-item' );
								log.innerText = value;
								logs.push( log );
							} );
						}
						if ( logs ) {
							status.replaceChildren( ...logs );
						} else {
							responseDiv.classList.add( 'spectra-pro-register-form-status__error' );
							responseDiv.innerText = JSON.stringify( response.data );
							status.replaceChildren( responseDiv );
						}
					}
					setTimeout( () => {
						// remove
						UAGBRegister._after_submit( formSelector );

						// redirect
						if ( response.success ) {
							if ( UAGBRegister.settings[ mainSelector ].afterRegisterActions?.includes( 'redirect' ) ) {
								UAGBRegister._dispatchLoginRedirect( response.data?.redirect_url );
							} else {
								window.location.reload();
							}
						} else {
							UAGBRegister._showValidationMessage( formSelector, response.data );
						}
					}, 1000 );
				} )
				.catch( ( error ) => {
					// eslint-disable-next-line no-console
					console.error( error );
				} );
		}
	},

	_before_submit( formSelector ) {
		const currentForm = document.querySelector( formSelector );
		// before request
		const submitButton = currentForm.querySelector( '.spectra-pro-register-form__submit' );
		submitButton.setAttribute( 'disabled', 'disabled' );
		if ( ! submitButton.querySelector( 'svg' ) ) {
			UAGBRegister.registerButtonInnerElement = submitButton.innerHTML;
		}
		submitButton.innerHTML = UAGBRegister.spinner;
		submitButton.style.opacity = '0.45';
		currentForm.parentElement.querySelector( '.spectra-pro-register-form-status' ).innerHTML = '';
	},

	_after_submit( formSelector ) {
		const currentForm = document.querySelector( formSelector );
		const submitButton = currentForm.querySelector( '.spectra-pro-register-form__submit' );
		submitButton.removeAttribute( 'disabled' );
		submitButton.innerHTML = UAGBRegister.registerButtonInnerElement;
		submitButton.style.opacity = '1';
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
