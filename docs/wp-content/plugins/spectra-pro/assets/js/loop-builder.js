    // Function to scroll to the div element with the query ID
    function scrollToQueryId( queryId ) {
        const targetElement = document.getElementById( `uagb-block-queryid-${queryId}` );
        
        if ( targetElement ) {
            const rect = targetElement.getBoundingClientRect();
            const adminBar = document.querySelector( '#wpadminbar' );
            const adminBarOffSetHeight = adminBar?.offsetHeight || 0;
            const scrollTop = window?.pageYOffset || document?.documentElement?.scrollTop;
            const targetOffset = ( rect?.top + scrollTop ) - adminBarOffSetHeight;

            window.scrollTo( {
                top: targetOffset,
                behavior: 'smooth'
            } );
        }
    }

    /**
     * Function to find the ancestor with the given class name.
     *
     * @param {Element} element   The element.
     * @param {string}  className The class name.
     * @return {Element} The element.
     * @since 1.2.0
     */
    function findAncestorWithClass( element, className ) {
        while ( element && ! element.classList.contains( className ) ) {
            element = element.parentNode;
        }
        return element;
    }

    document.addEventListener( 'DOMContentLoaded', function () {
        // Debounce function to limit the rate of execution
        function debounce( func, wait ) {
            let timeout;

            return function executedFunction( ...args ) {
                const context = this;
                const later = () => {
                    timeout = null;
                    func.apply( context, args );
                };

                clearTimeout( timeout );
                timeout = setTimeout( later, wait );
            };
        };

        // Add functions to store and get active filters
        function storeActiveFilter( loopBuilder, filterData, filterType ) {
            if ( loopBuilder && filterData ) {
                loopBuilder.setAttribute( `data-active-filter-${filterType}`, filterData );
            }
        }

        function getActiveFilter( loopBuilder, filterType ) {
            return loopBuilder?.getAttribute( `data-active-filter-${filterType}` ) || null;
        }

        /**
         * Function to update the loop wrapper content
         * as per data in filters.
         *
         * @param {Event}  event               The event.
         * @param {string} paged               The paged parameter for displaying a particular page on click of pagination links.
         * @param {string} buttonFilter        The array of selected button value.
         * @param {string} loopParentContainer The loop parent container.
         * @return {Promise} The Promise.
         * @throws {Error} The error.
         * @since 1.2.0
         */
        async function updateContent( event, paged = null, buttonFilter = null, loopParentContainer ) {
            try {
                const loopBuilder = loopParentContainer;
                const formData = new FormData();

                // Get all form data
                const search = loopBuilder?.querySelector( '.uagb-loop-search' )?.value || '';
                const sorting = loopBuilder?.querySelector( '.uagb-loop-sort' )?.value || '';
                
                // Get category select value
                const categorySelect = loopBuilder?.querySelector( '.uagb-loop-category' );
                if ( categorySelect?.value ) {
                    formData.append( 'category', categorySelect.value );
                    storeActiveFilter( loopBuilder, categorySelect.value, 'select' );
                } else {
                    // Try to get stored select filter
                    const storedSelectFilter = getActiveFilter( loopBuilder, 'select' );
                    if ( storedSelectFilter ) {
                        formData.append( 'category', storedSelectFilter );
                    }
                }

                // Handle checkboxes
                const checkBoxValues = loopBuilder?.querySelectorAll( '.uagb-cat-checkbox' );
                const checkedValues = [];
                checkBoxValues?.forEach( checkBox => {
                    if ( checkBox.checked && checkBox.getAttribute( 'data-uagb-block-query-id' ) === event.target.dataset.uagbBlockQueryId ) {
                        checkedValues.push( checkBox.value );
                    }
                } );
                
                // Handle button filter
                let activeButtonData = getActiveFilter( loopBuilder, 'button' );
                if ( ! activeButtonData && buttonFilter?.type ) {
                    activeButtonData = buttonFilter.type;
                    storeActiveFilter( loopBuilder, activeButtonData, 'button' );
                }

                // Clear all filters first
                formData.delete( 'buttonFilter' );
                formData.delete( 'checkbox' );
                formData.delete( 'category' );
                loopBuilder.removeAttribute( 'data-active-filter-checkbox' );
                loopBuilder.removeAttribute( 'data-active-filter-select' );
                loopBuilder.removeAttribute( 'data-active-filter-button' );

                // Handle filters based on the event target
                if ( event.target.classList.contains( 'uagb-cat-checkbox' ) ) {
                    // Checkbox was clicked - clear select and apply checkbox
                    if ( categorySelect ) categorySelect.value = '';
                    formData.append( 'checkbox', checkedValues );
                    storeActiveFilter( loopBuilder, JSON.stringify( checkedValues ), 'checkbox' );
                } else if ( event.target.classList.contains( 'uagb-loop-category' ) ) {
                    // Select was changed - clear checkboxes and apply select
                    checkBoxValues?.forEach( checkBox => {
                        if ( checkBox.getAttribute( 'data-uagb-block-query-id' ) === event.target.dataset.uagbBlockQueryId ) {
                            checkBox.checked = false;
                        }
                    } );
                    formData.append( 'category', categorySelect.value );
                    storeActiveFilter( loopBuilder, categorySelect.value, 'select' );
                } else if ( buttonFilter?.type ) {
                    // Button was clicked - clear select and checkboxes
                    if ( categorySelect ) categorySelect.value = '';
                    checkBoxValues?.forEach( checkBox => {
                        if ( checkBox.getAttribute( 'data-uagb-block-query-id' ) === event.target.dataset.uagbBlockQueryId ) {
                            checkBox.checked = false;
                        }
                    } );
                    formData.append( 'buttonFilter', buttonFilter.type );
                    storeActiveFilter( loopBuilder, buttonFilter.type, 'button' );
                }

                // Add other form data
                if ( search ) {
                    formData.append( 'search', search );
                }
                if ( sorting ) {
                    formData.append( 'sorting', sorting );
                }
                if ( paged ) {
                    formData.append( 'paged', paged );
                }

                let queryId = null;
                if ( buttonFilter?.type === 'all' ) {
                    const el = document.querySelector( '[data-query-id]' );
                    if ( el ) {
                        queryId = el.getAttribute( 'data-query-id' );
                      } else {
                        queryId = 0; // fallback to default
                      }                    
                    
                } else {
                    // Get query ID
                    queryId = event.target?.dataset?.uagbBlockQueryId || 
                               event.target?.parentElement?.dataset?.uagbBlockQueryId || 
                               event?.dataset?.uagbBlockQueryId || 
                               event.target.closest( 'a' )?.getAttribute( 'data-uagb-block-query-id' ) || 0;
                }

                // Scroll to the query ID
                scrollToQueryId( queryId );

                formData.append( 'queryId', queryId );
                formData.append( 'block_id', loopBuilder?.getAttribute( 'data-block_id' ) );
                formData.append( 'action', 'uagb_update_loop_builder_content' );
                formData.append( 'postId', uagb_loop_builder.post_id );
                formData.append( 'postType', uagb_loop_builder.post_type );
                formData.append( 'security', uagb_loop_builder.nonce );

                // Log the complete form data
                const formDataObj = {};
                formData.forEach( ( value, key ) => {
                    formDataObj[key] = value;
                } );
                
                const output = await getUpdatedLoopWrapperContent( formData );
                
                // Update content
                if ( output?.content?.wrapper ) {
                    const loopElement = loopBuilder?.querySelector( '#uagb-block-queryid-' + queryId );
                    if ( loopElement ) {
                        loopElement.innerHTML = output.content.wrapper;
                    }
                }
                
                // Update pagination
                if ( output?.content?.pagination ) {
                    const paginationElements = loopBuilder?.querySelectorAll( '#uagb-block-pagination-queryid-' + queryId );
                    paginationElements?.forEach( element => {
                        element.innerHTML = output.content.pagination;
                    } );
                }

            } catch ( error ) {
                throw error;
            }
        }

        /**
         * Handles the input event for the search functionality within the UAGB Loop Builder block.
         * Synchronizes input values across all search inputs within the same loop builder container
         * and triggers a content update.
         *
         * @param {Event} event - The input event triggered by the user.
         * @since 1.2.0
         */
        function handleInput( event ) {
            const loopParentContainer = this.closest( '.wp-block-uagb-loop-builder' );
            const searchInputs = loopParentContainer.querySelectorAll( '.uagb-loop-search' );
            searchInputs.forEach( searchInput => {
                if( searchInput.getAttribute( 'data-uagb-block-query-id' ) === event.target.dataset.uagbBlockQueryId ){
                    searchInput.value = event.target.value;
                }
            } );
            updateContent( event, null, null, loopParentContainer );
        }

        /**
         * Handles the checkbox selection within the UAGB Loop Builder block.
         * Collects the values of all checked checkboxes that match the block query ID 
         * and triggers a content update.
         *
         * @param {Event} event - The change event triggered by the user when interacting with a checkbox.
         * @since 1.2.0
         */
        function handleCheckBoxVal( event ) {
            const loopParentContainer = this.closest( '.wp-block-uagb-loop-builder' );
            const checkBoxValues = loopParentContainer.querySelectorAll( '.uagb-cat-checkbox' );
            // Initialize an array to store checked checkbox values.
            const checkedValues = [];
            checkBoxValues.forEach( checkBoxVal => {
                // Check if the checkbox is checked.
                const isChecked = checkBoxVal.checked;
                if ( isChecked && checkBoxVal.getAttribute( 'data-uagb-block-query-id' ) === event.target.dataset.uagbBlockQueryId ) {
                    // Add the value to the array.
                    checkedValues.push( checkBoxVal.value );
                }
            } );
            
            // Always update content when checkbox state changes, even if no checkboxes are checked
            updateContent( event, null, null, loopParentContainer );
        }

        /**
         * Handles the selection event on the search filter.
         * Updates the value of all relevant search filter elements with the same query ID and triggers content update.
         *
         * @param {Event} event - The select event triggered by the user interaction.
         * @since 1.2.0
         */
        function handleSelect( event ) {
            const loopParentContainer = this.closest( '.wp-block-uagb-loop-builder' );
            const sortSelects = loopParentContainer.querySelectorAll( '.uagb-loop-sort' );
            sortSelects.forEach( sortSelect => {
                if( sortSelect.getAttribute( 'data-uagb-block-query-id' ) === event.target.dataset.uagbBlockQueryId ){
                    sortSelect.value = event.target.value;
                }
            } );
            updateContent( event, null, null, loopParentContainer );
        }

        /**
         * Handles the category selection event on a dropdown filter.
         * Updates the value of all relevant category select elements with the same query ID and triggers content update.
         *
         * @param {Event} event - The select event triggered by the user interaction.
         * @since 1.2.0
         */
        function handleCatSelect( event ) {
            const loopParentContainer = this.closest( '.wp-block-uagb-loop-builder' );
            const categorySelects = loopParentContainer.querySelectorAll( '.uagb-loop-category' );
            categorySelects.forEach( categorySelect => {
                if ( categorySelect.getAttribute( 'data-uagb-block-query-id' ) === event.target.dataset.uagbBlockQueryId ) {
                    categorySelect.value = event.target.value;
                }
            } );
            
            // If "all" or empty value is selected, clear the stored filter
            if ( !event.target.value || event.target.value === '' || event.target.value === 'all' ) {
                loopParentContainer.removeAttribute( 'data-active-filter-select' );
            }
            
            updateContent( event, null, null, loopParentContainer );
        }

        /**
         * Resets the values of elements within a container based on their query ID.
         *
         * @param {HTMLElement} container     - The container element to search within.
         * @param {string}      selector      - The CSS selector for the elements to reset.
         * @param {string}      queryId       - The query ID to match.
         * @param {Function}    resetCallback - A callback function to apply the reset logic to each element.
         * @since 1.2.0
         */
        function resetValues( container, selector, queryId, resetCallback ) {
            const elements = container.querySelectorAll( selector );
            elements.forEach( element => {
                const elementQueryId = element.dataset.uagbBlockQueryId;
                if ( elementQueryId === queryId ) {
                    resetCallback( element );
                }
            } );
        }

        /**
         * Handles the reset event for all filters within the loop builder block.
         * Resets the values of search inputs, sort selects, category selects, and checkboxes to their default state.
         *
         * @param {Event} event - The reset event triggered by the user interaction.
         * @since 1.2.0
         */
        function handleReset( event ) {
            const loopParentContainer = this.closest( '.wp-block-uagb-loop-builder' );
                // Get the query ID from the event target
                let queryId = event.target.parentElement.dataset.uagbBlockQueryId;
                if ( event.target.tagName.toLowerCase() === 'a' ) {
                    queryId = event.target.dataset.uagbBlockQueryId;
                } else if ( event.target.tagName.toLowerCase() === 'svg' || event.target.tagName.toLowerCase() === 'path' ) {
                    queryId = event.target.closest( 'a' )?.getAttribute( 'data-uagb-block-query-id' );
                }

                // Reset the value of the filter inputs
                const loopBuilder = findAncestorWithClass( event.target.parentNode, 'wp-block-uagb-loop-builder' );

                resetValues( loopBuilder, '.uagb-loop-search', queryId, element => {
                    element.value = ''; // Reset search input value
                } );

                resetValues( loopBuilder, '.uagb-loop-sort', queryId, element => {
                    element.value = ''; // Reset sort select value
                } );

                resetValues( loopBuilder, '.uagb-loop-category', queryId, element => {
                    element.value = ''; // Reset category select value
                } );

                resetValues( loopBuilder, '.uagb-cat-checkbox', queryId, element => {
                    element.checked = false; // Uncheck category checkbox
                } );

                // Clear all stored filter data attributes
                if ( loopBuilder ) {
                    loopBuilder.removeAttribute( 'data-active-filter-select' );
                    loopBuilder.removeAttribute( 'data-active-filter-checkbox' );
                    loopBuilder.removeAttribute( 'data-active-filter-button' );
                }

                // Trigger the updateContent function to reflect the changes
                updateContent( event, null, null, loopParentContainer );
        }

        const resetButtons = document.querySelectorAll( '.uagb-loop-reset' );

        const searchInputs = document.querySelectorAll( '.uagb-loop-search' );

        searchInputs.forEach( searchInput => {
            const debouncedHandleInput = debounce( handleInput, 250 );
            searchInput.addEventListener( 'input', debouncedHandleInput );
        } );

        const sortSelects = document.querySelectorAll( '.uagb-loop-sort' );

        sortSelects.forEach( sortSelect => {
            const debouncedHandleInput = debounce( handleSelect, 250 );
            sortSelect.addEventListener( 'change', debouncedHandleInput );
        } );

        const categorySelects = document.querySelectorAll( '.uagb-loop-category' );

        categorySelects.forEach( categorySelect => {
            const debouncedHandleInput = debounce( handleCatSelect, 250 );
            categorySelect.addEventListener( 'change', debouncedHandleInput );
        } );

        // Get a reference to the checkbox element.
        const checkBoxValues = document.querySelectorAll( '.uagb-cat-checkbox' );
        checkBoxValues.forEach( checkBoxVal => {
            const debouncedHandleInput = debounce( handleCheckBoxVal, 250 );
            checkBoxVal.addEventListener( 'click', debouncedHandleInput );
        } );

        resetButtons.forEach( resetButton => {
            const debouncedHandleReset = debounce( handleReset, 250 );
            resetButton.addEventListener( 'click', debouncedHandleReset );
        } );
        
        const oldPaginations = document.querySelectorAll( '.wp-block-uagb-loop-builder > :not(.uagb-loop-pagination).wp-block-uagb-buttons' );

        oldPaginations?.forEach( function( container ) {
            // Create a new div with class "parent-container"
            const parentContainer = document.createElement( 'div' );
            parentContainer.classList.add( 'uagb-loop-pagination' );
            const queryIdPAginationLink = container.querySelector( 'a' ).getAttribute( 'data-uagb-block-query-id' );
            parentContainer.id = 'uagb-block-pagination-queryid-'+queryIdPAginationLink;

             // Append the container content to the new div
             parentContainer.innerHTML = container.outerHTML;

             // Append the new div after the original container
             container.parentNode.insertBefore( parentContainer, container.nextSibling );

             // Remove the original container
             container.parentNode.removeChild( container );
        } );

        const paginationContainer = document.querySelectorAll( '.uagb-loop-pagination' );

        paginationContainer.forEach( pagination => {
            pagination.addEventListener( 'click', function( event ) {
                event.preventDefault();
                const loopParentContainer = this.closest( '.wp-block-uagb-loop-builder' );
                
                const paged = event.target.dataset.uagbBlockQueryPaged || 
                             event.target.parentElement.dataset.uagbBlockQueryPaged ||
                             event?.target?.closest( 'a' )?.getAttribute( 'data-uagb-block-query-paged' );

                // Get all active filter data
                const activeButtonData = getActiveFilter( loopParentContainer, 'button' );
                const activeSelectData = getActiveFilter( loopParentContainer, 'select' );
                const activeCheckboxData = getActiveFilter( loopParentContainer, 'checkbox' );

                // Create form data based on active filter
                const formData = new FormData();
                
                // Add pagination
                if ( paged ) {
                    formData.append( 'paged', paged );
                }

                // Add active filter based on type
                if ( activeButtonData ) {
                    formData.append( 'buttonFilter', activeButtonData );
                } else if ( activeSelectData ) {
                    formData.append( 'category', activeSelectData );
                } else if ( activeCheckboxData ) {
                    formData.append( 'checkbox', activeCheckboxData );
                }

                // Add other required data
                formData.append( 'queryId', event.target.dataset.uagbBlockQueryId || 
                    event.target.parentElement.dataset.uagbBlockQueryId || 
                    event?.target?.closest( 'a' )?.getAttribute( 'data-uagb-block-query-id' ) || 0 );
                formData.append( 'block_id', loopParentContainer?.getAttribute( 'data-block_id' ) );
                formData.append( 'action', 'uagb_update_loop_builder_content' );
                formData.append( 'postId', uagb_loop_builder.post_id );
                formData.append( 'postType', uagb_loop_builder.post_type );
                formData.append( 'security', uagb_loop_builder.nonce );

                // Get search and sorting values if they exist
                const search = loopParentContainer?.querySelector( '.uagb-loop-search' )?.value || '';
                const sorting = loopParentContainer?.querySelector( '.uagb-loop-sort' )?.value || '';

                if ( search ) {
                    formData.append( 'search', search );
                }
                if ( sorting ) {
                    formData.append( 'sorting', sorting );
                }

                // Make the AJAX request
                getUpdatedLoopWrapperContent( formData )
                    .then( output => {
                        if ( output?.content?.wrapper ) {
                            const loopElement = loopParentContainer?.querySelector( '#uagb-block-queryid-' + formData.get( 'queryId' ) );
                            if ( loopElement ) {
                                loopElement.innerHTML = output.content.wrapper;
                            }
                        }
                        if ( output?.content?.pagination ) {
                            const paginationElements = loopParentContainer?.querySelectorAll( '#uagb-block-pagination-queryid-' + formData.get( 'queryId' ) );
                            paginationElements?.forEach( element => {
                                element.innerHTML = output.content.pagination;
                            } );
                        }
                    } )
                    .catch( error => {
                        throw error; // Propagate the error
                    } );
            } );
        } );

        const categoryButtonFilterContainer = document.querySelectorAll( '.uagb-loop-category-inner a' );

        categoryButtonFilterContainer.forEach( ( buttons ) => {
            buttons.addEventListener( 'click', function ( event ) {
                event.preventDefault();
                const loopParentContainer = this.closest( '.wp-block-uagb-loop-builder' );
                let buttonData = null;
                
                if ( event.target.tagName.toLowerCase() === 'a' ) {
                    buttonData = event.target.children[0].dataset.type;
                } else if ( event.target.tagName.toLowerCase() === 'div' && event.target.parentElement.tagName.toLowerCase() === 'a' ) {
                    buttonData = event.target.dataset.type;
                }
                
                // Uncheck all checkboxes when a button is clicked
                checkBoxValues?.forEach( checkBox => {
                    checkBox.checked = false;
                } );
                
                // Check if "all" button was clicked.
                if ( buttonData === 'all' || buttonData === undefined ) {
                    // Clear stored button filter.
                    loopParentContainer.removeAttribute( 'data-active-filter-button' );
                    // Update content with all type.
                    updateContent( event, null, { type: 'all' }, loopParentContainer );
                } else if ( buttonData ) {
                    storeActiveFilter( loopParentContainer, buttonData, 'button' );
                    updateContent( event, null, { type: buttonData }, loopParentContainer );
                }
            } );
        } );
    } );

    /**
     * Function to get the updated loop wrapper content.
     * as per data in filters.
     *
     * @param {FormData} data The form data.
     * @since 1.2.0
     * @return {Promise} The Promise.
     */
    function getUpdatedLoopWrapperContent( data ) {
        // Create a new FormData object
        data.append( 'action', 'uagb_update_loop_builder_content' );
        data.append( 'postId', uagb_loop_builder?.post_id );
        data.append( 'postType', uagb_loop_builder?.what_post_type );
        data.append( 'security', uagb_loop_builder?.nonce )

        // The function now returns a Promise
        return fetch( uagb_loop_builder?.ajax_url, {
            method: 'POST',
            credentials: 'same-origin',
            body: data,
        } )
        .then( response => {
            if ( ! response.ok ) {
                throw new Error( 'Network response was not ok' );
            }
            return response.json();
        } )
        .then( output => {
            if ( output.success ) {
                // Return the actual output.
                return output.data;
            }
                throw new Error( output.data.message );

        } )
        .catch( error => {
            throw error; // Propagate the error
        } );
    }