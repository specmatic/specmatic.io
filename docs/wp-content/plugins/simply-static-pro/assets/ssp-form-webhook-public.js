'use strict';

// Get options from JSON file.
let form_config_element = document.querySelector("meta[name='ssp-config-path']");

if (null !== form_config_element) {
    let config_path = form_config_element.getAttribute("content");
    let config_url = window.location.origin + config_path + 'forms.json';

    function submitForm(url, settings, data) {
        // Prepare data for request.
        let requestData = {
            method: "POST",
            body: data
        };

        // Maybe add custom header.
        if (settings.form_custom_headers) {
            // Parse if multiple headers are present.
            if (settings.form_custom_headers.includes(',')) {
                // Split arguments by ,
                let headersData = settings.form_custom_headers.split(',');
                let headers = {};

                // Build the headers object.
                headersData.forEach((header) => {
                    // Split header by :
                    let header_parts = header.split(':');
                    // Add header to request
                    headers[header_parts[0]] = header_parts[1];
                });

                // Pass the header to the request.
                requestData.headers = headers;
            } else {
                // Split header by :
                let header_parts = settings.form_custom_headers.split(':');
                // Add header to request
                requestData.headers = {
                    [header_parts[0]]: header_parts[1]
                };
            }
        }

        // Send data via fetch to URL
        fetch(url, requestData).then(response => {
            if (response.ok) {
                handleMessage(settings);
            }
        }).catch(error => {
            if (error.message.includes('Failed to fetch')) {
                handleMessage(settings, false);
            } else {
                handleMessage(settings, true);
            }
        });
    }

    function manageForm(config_url, form_id, form) {
        fetch(config_url)
            .then(response => {
                if (!response.ok) {
                    throw new Error("HTTP error " + response.status);
                }
                return response.json();
            })
            .then(json => {
                let settings = json.find(x => x.form_id === form_id);

                if (settings) {
                    let data = new FormData(form);
                    submitForm(settings.form_webhook, settings, data);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function handleMessage(settings, error = false) {
        if (settings.form_use_redirect) {
            window.location.replace(settings.form_redirect_url);
        } else if (!settings.form_disable_feedback) {
            // Set up success message.
            const message = document.createElement('div');

            if (error) {
                message.innerHTML = settings.form_error_message;
                message.style.cssText = 'width: 100%; background-color: #e24b4b; color: white; text-align: center; padding: 10px;';
            } else {
                message.innerHTML = settings.form_success_message;
                message.style.cssText = 'width: 100%; background-color: #58b348; color: white; text-align: center; padding: 10px;';
            }

            // Get the current form element.
            let form = document.getElementById(settings.form_id);

            // Check if Elementor form.
            if (settings.form_plugin === 'elementor_forms') {
                let inputs = document.getElementsByTagName('input');

                for (let i = 0; i < inputs.length; i++) {
                    if (inputs[i].value === settings.form_id) {
                        form = inputs[i].parentNode;
                    }
                }
            }

            // Adjust the form output depending on the plugin.
            let spinner;
            let submitButton;

            switch (settings.form_plugin) {
                case 'cf7':
                    spinner = document.querySelector('.wpcf7-spinner');
                    submitButton = form.querySelector('input[type="submit"]');

                    if (spinner) {
                        spinner.style.display = 'none';
                    }

                    if (submitButton) {
                        submitButton.disabled = true;
                    }
                    break;
                case 'elementor_forms':
                    spinner = document.querySelector('.elementor-message');
                    submitButton = form.querySelector('button[type="submit"]');

                    if (spinner) {
                        spinner.style.display = 'none';
                    }

                    if (submitButton) {
                        submitButton.disabled = true;
                    }
                    break;
                case 'bricks_forms':
                    spinner = document.querySelector('.loading');
                    submitButton = form.querySelector('button[type="submit"]');

                    if (spinner) {
                        spinner.style.display = 'none';
                    }

                    if (submitButton) {
                        submitButton.disabled = true;
                    }
                    break;
                case 'gravity_forms':
                    spinner = document.querySelector('.gform-loader');
                    submitButton = form.querySelector('input[type="submit"]');

                    if (spinner) {
                        spinner.style.display = 'none';
                    }

                    if (submitButton) {
                        submitButton.disabled = true;
                    }
                    break;
                case 'wpforms':
                    spinner = document.querySelector('.wpforms-submit-spinner');
                    submitButton = form.querySelector('button[type="submit"]');

                    if (spinner) {
                        spinner.style.display = 'none';
                    }

                    if (submitButton) {
                        submitButton.disabled = true;
                    }
                    break;
                case 'wsf_form':
                    submitButton = form.querySelector('button[type="submit"], input[type="submit"]');

                    if (submitButton) {
                        submitButton.disabled = true;
                    }
                    break;
                case 'fluent_forms':
                    spinner = document.querySelector('.ff-loading-bar');
                    submitButton = form.querySelector('button[type="submit"]');

                    if (spinner) {
                        spinner.style.display = 'none';
                    }

                    if (submitButton) {
                        submitButton.disabled = true;
                    }
                    break;
            }

            // Append success message to form.
            form.appendChild(message);

            setTimeout(() => {
                message.remove();
            }, 5000);
        }
    }

    function modifyFormAttributes(form) {
        form.removeAttribute("action");
        form.removeAttribute("method");
        form.removeAttribute("enctype");
        form.removeAttribute("novalidate");
    }

    document.addEventListener("DOMContentLoaded", function () {
        const allForms = document.querySelectorAll(
            ".wpcf7 form, .wpcf7-form, .gform_wrapper form, .wpforms-container form, .elementor-form, .wsf-form, .frm-fluent-form, .brxe-form, .brxe-brf-pro-forms"
        );

        allForms.forEach((form) => {
            modifyFormAttributes(form);

            // Inputs
            const inputs = form.querySelectorAll("input");

            // Add HTML required attribute
            inputs.forEach((input) => {
                if (input.getAttribute("aria-required") === "true") {
                    input.required = true;
                }
            });

            // Prevent Gravity Forms from submitting without submit event.
            if (typeof gform != "undefined") {
                gform.utils.addAsyncFilter('gform/submission/pre_submission', async (data) => {
                    data.abort = true;

                    // Trigger submit event
                    form.dispatchEvent(new Event('submit'));

                    return data;
                });
            }

            form.addEventListener("submit", function (el) {
                el.preventDefault();

                let form_id;

                if (form.className.includes('wpcf7-form')) {
                    // Check if its Contact Form 7.
                    form_id = form.parentNode.id;
                } else if (form.className.includes('wpforms-form')) {
                    // Check if its WP Forms.
                    form_id = form.getAttribute('id');
                } else if (form.className.includes('wsf-form')) {
                    // Check if its WS Form.
                    form_id = form.getAttribute('id');
                } else if (form.parentNode.className.includes('gform_wrapper')) {
                    // Check if its Gravity Forms.
                    form_id = form.getAttribute('id');
                } else if (form.className.includes('frm-fluent-form')) {
                    // Check if its Fluent Forms.
                    form_id = form.getAttribute('id');
                } else if (form.className.includes('elementor-form')) {
                    // Check if its Elementor Forms.
                    form_id = form.querySelector("[name='form_id']").value;
                } else if (form.className.includes('brxe-form')) {
                    // Check if its Bricks Forms.
                    form_id = form.getAttribute('id');
                } else if (form.className.includes('brxe-brf-pro-forms')) {
                    // Check if its Bricks Forms.
                    form_id = form.getAttribute('id');
                }

                // Manage and submit form.
                manageForm(config_url, form_id, form);
            });
        });
    });
}
