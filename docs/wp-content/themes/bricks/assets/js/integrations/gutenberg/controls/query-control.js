/**
 * Create comprehensive query control matching ControlQuery.vue
 */
function createBricksQueryControl(property, props) {
	try {
		const {
			SelectControl,
			TextControl,
			CheckboxControl,
			BaseControl,
			Button,
			Panel,
			PanelBody,
			ColorPicker,
			__experimentalNumberControl: NumberControl
		} = window.wp.components
		const { createElement, useState, useEffect } = window.wp.element

		// Removed createContainedSelectControl to fix React hook order issues
		// The function was creating hooks dynamically which caused "Rendered fewer hooks than expected" error

		// Get current query value (should be Bricks query object or empty)
		const currentValue = props.attributes[property.id] || {}
		const hasQuery = Object.keys(currentValue).length > 0

		// Get current object type for conditional rendering (moved up to avoid reference errors)
		const objectType = currentValue.objectType

		// State for dynamic options
		const [postTypeOptions, setPostTypeOptions] = useState([])
		const [taxonomyOptions, setTaxonomyOptions] = useState([])
		const [userRoleOptions, setUserRoleOptions] = useState([])

		// ALWAYS create all select controls to maintain hook order - they will be conditionally rendered
		const objectTypeSelectControl = window.createBricksSelectControl(
			{
				id: 'objectType',
				label: window.bricksData.i18n.queryType,
				options: {
					post: window.bricksData.i18n.post,
					term: window.bricksData.i18n.term,
					user: window.bricksData.i18n.user
				},
				multiple: false,
				placeholder: window.bricksData.i18n.post
			},
			{
				attributes: {
					...currentValue,
					objectType: objectType
				},
				setAttributes: (newAttrs) => {
					updateQuery('objectType', newAttrs.objectType)
				}
			}
		)

		const postTypeSelectControl = window.createBricksSelectControl(
			{
				id: 'post_type',
				label: window.bricksData.i18n.postTypes,
				options: postTypeOptions.reduce((acc, opt) => {
					acc[opt.value] = opt.label
					return acc
				}, {}),
				multiple: true,
				placeholder: window.bricksData.i18n.select
			},
			{
				attributes: {
					...currentValue,
					post_type: currentValue.post_type
				},
				setAttributes: (newAttrs) => {
					updateQuery('post_type', newAttrs.post_type)
				}
			}
		)

		const taxonomySelectControl = window.createBricksSelectControl(
			{
				id: 'taxonomy',
				label: window.bricksData.i18n.taxonomy,
				options: taxonomyOptions.reduce((acc, opt) => {
					acc[opt.value] = opt.label
					return acc
				}, {}),
				multiple: true,
				placeholder: window.bricksData.i18n.selectTaxonomies
			},
			{
				attributes: {
					...currentValue,
					taxonomy: currentValue.taxonomy || []
				},
				setAttributes: (newAttrs) => {
					updateQuery('taxonomy', newAttrs.taxonomy)
				}
			}
		)

		const roleSelectControl = window.createBricksSelectControl(
			{
				id: 'role__in',
				label: window.bricksData.i18n.userRoles,
				options: userRoleOptions.reduce((acc, opt) => {
					acc[opt.value] = opt.label
					return acc
				}, {}),
				multiple: true
			},
			{
				attributes: {
					...currentValue,
					role__in: currentValue.role__in || []
				},
				setAttributes: (newAttrs) => {
					updateQuery('role__in', newAttrs.role__in)
				}
			}
		)

		const postIncludeSelectControl = window.createBricksSelectControl(
			{
				id: 'post__in',
				label: window.bricksData.i18n.includePosts,
				multiple: true,
				optionsAjax: {
					action: 'bricks_get_posts',
					postType: Array.isArray(currentValue.post_type)
						? currentValue.post_type
						: currentValue.post_type
							? [currentValue.post_type]
							: 'any',
					addLanguageToPostTitle: 'true'
				}
			},
			{
				...props,
				attributes: { ...props.attributes, post__in: currentValue.post__in || [] },
				setAttributes: (newAttrs) => {
					updateQuery('post__in', newAttrs.post__in)
				}
			}
		)

		const postExcludeSelectControl = window.createBricksSelectControl(
			{
				id: 'post__not_in',
				label: window.bricksData.i18n.excludePosts,
				multiple: true,
				optionsAjax: {
					action: 'bricks_get_posts',
					postType: Array.isArray(currentValue.post_type)
						? currentValue.post_type
						: currentValue.post_type
							? [currentValue.post_type]
							: 'any',
					addLanguageToPostTitle: 'true'
				}
			},
			{
				...props,
				attributes: { ...props.attributes, post__not_in: currentValue.post__not_in || [] },
				setAttributes: (newAttrs) => {
					updateQuery('post__not_in', newAttrs.post__not_in)
				}
			}
		)

		const taxIncludeSelectControl = window.createBricksSelectControl(
			{
				id: 'tax_query',
				label: window.bricksData.i18n.includeTerms,
				multiple: true,
				optionsAjax: {
					action: 'bricks_get_terms_options',
					addLanguageToTermName: 'true',
					postTypes: Array.isArray(currentValue.post_type)
						? currentValue.post_type
						: currentValue.post_type
							? [currentValue.post_type]
							: ['any'],
					postId: window.bricksGutenbergData?.postId,
					'bricks-is-builder': '1'
				}
			},
			{
				...props,
				attributes: { ...props.attributes, tax_query: currentValue.tax_query || [] },
				setAttributes: (newAttrs) => {
					updateQuery('tax_query', newAttrs.tax_query)
				}
			}
		)

		const taxExcludeSelectControl = window.createBricksSelectControl(
			{
				id: 'tax_query_not',
				label: window.bricksData.i18n.excludeTerms,
				multiple: true,
				optionsAjax: {
					action: 'bricks_get_terms_options',
					addLanguageToTermName: 'true',
					postTypes: Array.isArray(currentValue.post_type)
						? currentValue.post_type
						: currentValue.post_type
							? [currentValue.post_type]
							: ['any'],
					postId: window.bricksGutenbergData?.postId,
					'bricks-is-builder': '1'
				}
			},
			{
				...props,
				attributes: {
					...props.attributes,
					tax_query_not: currentValue.tax_query_not || []
				},
				setAttributes: (newAttrs) => {
					updateQuery('tax_query_not', newAttrs.tax_query_not)
				}
			}
		)

		// Load dynamic options on mount
		useEffect(() => {
			// Load post types from Bricks data
			if (window.bricksGutenbergData?.postTypes) {
				const types = Object.entries(window.bricksGutenbergData.postTypes).map(
					([value, label]) => ({
						label,
						value
					})
				)
				types.unshift({ label: window.bricksData.i18n.any, value: 'any' })
				setPostTypeOptions(types)
			}

			// Load taxonomies
			if (window.bricksGutenbergData?.taxonomies) {
				const taxonomies = Object.entries(window.bricksGutenbergData.taxonomies).map(
					([value, obj]) => ({
						label: obj.labels?.singular_name || obj.label || value,
						value
					})
				)
				setTaxonomyOptions(taxonomies)
			}

			// Load user roles
			if (window.bricksGutenbergData?.userRoles) {
				const roles = Object.entries(window.bricksGutenbergData.userRoles).map(
					([value, label]) => ({
						label,
						value
					})
				)
				setUserRoleOptions(roles)
			}
		}, []) // Empty dependency array - load once on mount to prevent hook order issues

		// Query object type options (moved to pre-created select controls above)

		// Order by options (comprehensive matching Vue component)
		const getOrderByOptions = (objectType) => {
			if (objectType === 'term') {
				return [
					{ label: window.bricksData.i18n.name, value: 'name' },
					{ label: window.bricksData.i18n.slug, value: 'slug' },
					{
						label: window.bricksData.i18n.termGroup,
						value: 'term_group'
					},
					{ label: window.bricksData.i18n.termId, value: 'term_id' },
					{ label: 'ID', value: 'id' },
					{
						label: window.bricksData.i18n.description,
						value: 'description'
					},
					{ label: window.bricksData.i18n.parent, value: 'parent' },
					{ label: window.bricksData.i18n.count, value: 'count' }
				]
			} else if (objectType === 'user') {
				return [
					{ label: window.bricksData.i18n.login, value: 'login' },
					{ label: window.bricksData.i18n.nicename, value: 'nicename' },
					{ label: window.bricksData.i18n.email, value: 'email' },
					{ label: 'URL', value: 'url' },
					{
						label: window.bricksData.i18n.registered,
						value: 'registered'
					},
					{
						label: window.bricksData.i18n.displayName,
						value: 'display_name'
					},
					{
						label: window.bricksData.i18n.postCount,
						value: 'post_count'
					},
					{ label: 'ID', value: 'ID' },
					{
						label: window.bricksData.i18n.metaValue,
						value: 'meta_value'
					},
					{
						label: window.bricksData.i18n.metaValueNum,
						value: 'meta_value_num'
					}
				]
			} else {
				// Post object type
				return [
					{ label: window.bricksData.i18n.date, value: 'date' },
					{ label: window.bricksData.i18n.title, value: 'title' },
					{
						label: window.bricksData.i18n.menuOrder,
						value: 'menu_order'
					},
					{ label: window.bricksData.i18n.random, value: 'rand' },
					{ label: window.bricksData.i18n.id, value: 'ID' },
					{ label: window.bricksData.i18n.author, value: 'author' },
					{
						label: window.bricksData.i18n.modified,
						value: 'modified'
					},
					{ label: window.bricksData.i18n.parent, value: 'parent' },
					{
						label: window.bricksData.i18n.commentCount,
						value: 'comment_count'
					},
					{
						label: window.bricksData.i18n.metaValue,
						value: 'meta_value'
					},
					{
						label: window.bricksData.i18n.metaValueNum,
						value: 'meta_value_num'
					},
					{ label: window.bricksData.i18n.name, value: 'name' },
					{ label: window.bricksData.i18n.type, value: 'type' }
				]
			}
		}

		// Order options
		const orderOptions = [
			{ label: window.bricksData.i18n.ascending, value: 'ASC' },
			{ label: window.bricksData.i18n.descending, value: 'DESC' }
		]

		// Meta query compare options
		const compareOptions = [
			{ label: window.bricksData.i18n.equal, value: '=' },
			{ label: window.bricksData.i18n.notEqual, value: '!=' },
			{ label: window.bricksData.i18n.greaterThan, value: '>' },
			{ label: window.bricksData.i18n.greaterThanOrEqual, value: '>=' },
			{ label: window.bricksData.i18n.lesserThan, value: '<' },
			{ label: window.bricksData.i18n.lesserOrEqual, value: '<=' },
			{ label: window.bricksData.i18n.like, value: 'LIKE' },
			{ label: window.bricksData.i18n.notLike, value: 'NOT LIKE' },
			{ label: window.bricksData.i18n.in, value: 'IN' },
			{ label: window.bricksData.i18n.notIn, value: 'NOT IN' },
			{ label: window.bricksData.i18n.between, value: 'BETWEEN' },
			{ label: window.bricksData.i18n.notBetween, value: 'NOT BETWEEN' },
			{ label: window.bricksData.i18n.exists, value: 'EXISTS' },
			{ label: window.bricksData.i18n.notExists, value: 'NOT EXISTS' }
		]

		// Meta query type options
		const metaTypeOptions = [
			{ label: window.bricksData.i18n.char, value: 'CHAR' },
			{ label: window.bricksData.i18n.numeric, value: 'NUMERIC' },
			{ label: window.bricksData.i18n.binary, value: 'BINARY' },
			{ label: window.bricksData.i18n.date, value: 'DATE' },
			{ label: window.bricksData.i18n.datetime, value: 'DATETIME' },
			{ label: window.bricksData.i18n.decimal, value: 'DECIMAL' },
			{ label: window.bricksData.i18n.signed, value: 'SIGNED' },
			{ label: window.bricksData.i18n.time, value: 'TIME' },
			{ label: window.bricksData.i18n.unsigned, value: 'UNSIGNED' }
		]

		// Tax query operator options
		const taxOperatorOptions = [
			{ label: window.bricksData.i18n.in, value: 'IN' },
			{ label: window.bricksData.i18n.notIn, value: 'NOT IN' },
			{ label: window.bricksData.i18n.and, value: 'AND' },
			{ label: window.bricksData.i18n.exists, value: 'EXISTS' },
			{ label: window.bricksData.i18n.notExists, value: 'NOT EXISTS' }
		]

		// Tax query field options
		const taxFieldOptions = [
			{ label: window.bricksData.i18n.termId, value: 'term_id' },
			{ label: window.bricksData.i18n.name, value: 'name' },
			{ label: window.bricksData.i18n.slug, value: 'slug' },
			{ label: window.bricksData.i18n.termTaxonomyId, value: 'term_taxonomy_id' }
		]

		// Ajax loader animation options
		const ajaxLoaderAnimations = [
			{ label: window.bricksData.i18n.default, value: 'default' },
			{ label: window.bricksData.i18n.ellipsis, value: 'ellipsis' },
			{ label: window.bricksData.i18n.ring, value: 'ring' },
			{ label: window.bricksData.i18n.dualRing, value: 'dual-ring' },
			{ label: window.bricksData.i18n.facebook, value: 'facebook' },
			{ label: window.bricksData.i18n.roller, value: 'roller' },
			{ label: window.bricksData.i18n.ripple, value: 'ripple' },
			{ label: window.bricksData.i18n.spinner, value: 'spinner' }
		]

		const updateQuery = function (key, value) {
			try {
				let queryObject = { ...currentValue }

				if (value === '' || value === undefined || value === null) {
					delete queryObject[key]
				} else {
					queryObject[key] = value
				}

				// Handle objectType changes - clear incompatible settings
				if (key === 'objectType') {
					queryObject = { objectType: value }
				}

				// Handle post_type changes - clear post-specific settings
				if (key === 'post_type') {
					delete queryObject.post__in
					delete queryObject.post__not_in
				}

				const newAttributes = {}
				newAttributes[property.id] = Object.keys(queryObject).length > 0 ? queryObject : {}

				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('🔍 [Query Control] Query update error:', error)
			}
		}

		const updateMetaQuery = function (index, field, value) {
			try {
				const metaQuery = Array.isArray(currentValue.meta_query) ? [...currentValue.meta_query] : []

				if (!metaQuery[index]) {
					metaQuery[index] = {}
				}

				if (value === '' || value === undefined || value === null) {
					delete metaQuery[index][field]
				} else {
					metaQuery[index][field] = value
				}

				// Remove empty meta query items
				const cleanedMetaQuery = metaQuery.filter(
					(item) => item && Object.keys(item).length > 0 && item.key
				)

				updateQuery('meta_query', cleanedMetaQuery.length > 0 ? cleanedMetaQuery : '')
			} catch (error) {
				console.error('Meta query update error:', error)
			}
		}

		const addMetaQuery = function () {
			const metaQuery = Array.isArray(currentValue.meta_query) ? [...currentValue.meta_query] : []
			metaQuery.push({ key: '', value: '', compare: '=', type: 'CHAR' })
			updateQuery('meta_query', metaQuery)
		}

		const removeMetaQuery = function (index) {
			const metaQuery = Array.isArray(currentValue.meta_query) ? [...currentValue.meta_query] : []
			metaQuery.splice(index, 1)
			updateQuery('meta_query', metaQuery.length > 0 ? metaQuery : '')
		}

		const updateTaxQuery = function (index, field, value) {
			try {
				const taxQuery = Array.isArray(currentValue.tax_query_advanced)
					? [...currentValue.tax_query_advanced]
					: []

				if (!taxQuery[index]) {
					taxQuery[index] = {}
				}

				if (value === '' || value === undefined || value === null) {
					delete taxQuery[index][field]
				} else {
					taxQuery[index][field] = value
				}

				// Remove empty tax query items
				const cleanedTaxQuery = taxQuery.filter(
					(item) => item && Object.keys(item).length > 0 && item.taxonomy
				)

				updateQuery('tax_query_advanced', cleanedTaxQuery.length > 0 ? cleanedTaxQuery : '')
			} catch (error) {
				console.error('Tax query update error:', error)
			}
		}

		const addTaxQuery = function () {
			const taxQuery = Array.isArray(currentValue.tax_query_advanced)
				? [...currentValue.tax_query_advanced]
				: []
			taxQuery.push({
				taxonomy: '',
				field: 'term_id',
				terms: '',
				operator: 'IN',
				include_children: true
			})
			updateQuery('tax_query_advanced', taxQuery)
		}

		const removeTaxQuery = function (index) {
			const taxQuery = Array.isArray(currentValue.tax_query_advanced)
				? [...currentValue.tax_query_advanced]
				: []
			taxQuery.splice(index, 1)
			updateQuery('tax_query_advanced', taxQuery.length > 0 ? taxQuery : '')
		}

		const onClearQuery = function () {
			try {
				const newAttributes = {}
				newAttributes[property.id] = {}
				props.setAttributes(newAttributes)
			} catch (error) {
				console.error('Clear query error:', error)
			}
		}

		const controlElements = []

		controlElements.push(
			createElement(
				PanelBody,
				{
					key: 'query-panel',
					title: window.bricksData.i18n.querySettings,
					initialOpen: true
				},
				[
					// 2. objectType - Using pre-created select control
					objectTypeSelectControl,

					// 5. post_type (conditional: !objectType || objectType === 'post') - Using pre-created select control
					...(!objectType || objectType === 'post' ? [postTypeSelectControl] : []),

					// 6. post_mime_type (conditional: post_type === 'attachment')
					...(currentValue.post_type === 'attachment'
						? [
								createElement(TextControl, {
									__next40pxDefaultSize: true,
									__nextHasNoMarginBottom: true,
									key: 'post_mime_type',
									label: window.bricksData.i18n.mimeType,
									value: currentValue.post_mime_type || '',
									placeholder: 'image',
									onChange: (value) => updateQuery('post_mime_type', value),
									help: window.bricksData.i18n.mimeTypeDesc
								})
							]
						: []),

					// 7. taxonomy (conditional: objectType === 'term') - Using pre-created select control
					...(objectType === 'term' ? [taxonomySelectControl] : []),

					// 8. role__in (conditional: objectType === 'user') - Using pre-created select control
					...(objectType === 'user' ? [roleSelectControl] : []),

					// 9. orderby - using simple select to avoid hook order issues
					createElement(
						'div',
						{
							key: 'orderby-wrapper',
							style: {
								position: 'relative',
								marginBottom: '8px'
							}
						},
						[
							// Label
							createElement(
								'label',
								{
									key: 'label',
									style: {
										display: 'block',
										marginBottom: '8px',
										fontSize: '11px',
										fontWeight: '500',
										textTransform: 'uppercase',
										color: '#1e1e1e'
									}
								},
								window.bricksData.i18n.orderBy
							),

							// Simple select instead of complex dropdown
							createElement(
								'select',
								{
									key: 'select',
									value: currentValue.orderby || 'orderby-default',
									onChange: (e) =>
										updateQuery(
											'orderby',
											e.target.value === 'orderby-default' ? '' : e.target.value
										),
									style: {
										width: '100%',
										minHeight: '40px',
										padding: '8px 12px',
										border: '1px solid #949494',
										borderRadius: '2px',
										backgroundColor: '#fff',
										fontSize: '13px',
										lineHeight: '1.4'
									}
								},
								[
									createElement(
										'option',
										{
											key: 'orderby-default',
											value: 'orderby-default'
										},
										window.bricksData.i18n.default
									),
									...getOrderByOptions(objectType).map((option) => {
										return createElement(
											'option',
											{
												key: option.value,
												value: option.value
											},
											option.label
										)
									})
								]
							)
						]
					),

					// 10. meta_key (conditional: orderby === 'meta_value' || orderby === 'meta_value_num')
					...(currentValue.orderby &&
					['meta_value', 'meta_value_num'].includes(currentValue.orderby)
						? [
								createElement(TextControl, {
									__next40pxDefaultSize: true,
									__nextHasNoMarginBottom: true,
									key: 'meta_key',
									label: window.bricksData.i18n.metaKey,
									value: currentValue.meta_key || '',
									placeholder: 'custom_field_key',
									onChange: (value) => updateQuery('meta_key', value)
								})
							]
						: []),

					// 11. randomSeedTtl (conditional: orderby === 'rand' && objectType === 'post')
					...(currentValue.orderby === 'rand' && (!objectType || objectType === 'post')
						? [
								createElement(NumberControl || TextControl, {
									__next40pxDefaultSize: true,
									__nextHasNoMarginBottom: true,
									key: 'randomSeedTtl',
									label: window.bricksData.i18n.randomSeedTtl,
									value: currentValue.randomSeedTtl || '',
									placeholder: '60',
									type: 'number',
									min: 0,
									onChange: (value) => updateQuery('randomSeedTtl', value ? parseInt(value) : ''),
									help: window.bricksData.i18n.howLongToKeep
								})
							]
						: []),

					// 12. order - using simple select to avoid hook order issues
					createElement(
						'div',
						{
							key: 'order-wrapper',
							style: { position: 'relative', marginBottom: '16px' }
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
										textTransform: 'uppercase',
										color: '#1e1e1e'
									}
								},
								window.bricksData.i18n.order
							),

							createElement(
								'select',
								{
									key: 'select',
									value: currentValue.order || 'order-default',
									onChange: (e) =>
										updateQuery('order', e.target.value === 'order-default' ? '' : e.target.value),
									style: {
										width: '100%',
										minHeight: '40px',
										padding: '8px 12px',
										border: '1px solid #949494',
										borderRadius: '2px',
										backgroundColor: '#fff',
										fontSize: '13px',
										lineHeight: '1.4'
									}
								},
								[
									createElement(
										'option',
										{
											key: 'order-default',
											value: 'order-default'
										},
										window.bricksData.i18n.default
									),
									...orderOptions.map((option) => {
										return createElement(
											'option',
											{
												key: option.value,
												value: option.value
											},
											option.label
										)
									})
								]
							)
						]
					),

					// 13. posts_per_page (conditional: objectType === 'post')
					...(!objectType || objectType === 'post'
						? [
								createElement(NumberControl || TextControl, {
									__next40pxDefaultSize: true,
									__nextHasNoMarginBottom: true,
									key: 'posts_per_page',
									label: window.bricksData.i18n.postsPerPage,
									value: currentValue.posts_per_page || '',
									placeholder: '10',
									type: 'number',
									min: -1,
									onChange: (value) => updateQuery('posts_per_page', value ? parseInt(value) : '')
								})
							]
						: []),

					// 14. number (conditional: objectType === 'user' || objectType === 'term')
					...(objectType === 'user' || objectType === 'term'
						? [
								createElement(NumberControl || TextControl, {
									__next40pxDefaultSize: true,
									__nextHasNoMarginBottom: true,
									key: 'number',
									label: window.bricksData.i18n.number,
									value: currentValue.number || '',
									placeholder: '10',
									type: 'number',
									min: -1,
									onChange: (value) => updateQuery('number', value ? parseInt(value) : ''),
									help:
										objectType === 'user'
											? window.bricksData.i18n.numberOfUsersToRetrieve
											: undefined
								})
							]
						: []),

					// 15. offset
					createElement(NumberControl || TextControl, {
						__next40pxDefaultSize: true,
						__nextHasNoMarginBottom: true,
						key: 'offset',
						label: window.bricksData.i18n.offset,
						value: currentValue.offset || '',
						placeholder: '0',
						type: 'number',
						min: 0,
						onChange: (value) => updateQuery('offset', value ? parseInt(value) : '')
					}),

					// 16. post_parent (conditional: objectType === 'post')
					...(!objectType || objectType === 'post'
						? [
								createElement(NumberControl || TextControl, {
									__next40pxDefaultSize: true,
									__nextHasNoMarginBottom: true,
									key: 'post_parent',
									label: `${window.bricksData.i18n.childOf} (${window.bricksData.i18n.postParentId})`,
									value: currentValue.post_parent || '',
									type: 'number',
									onChange: (value) => updateQuery('post_parent', value ? parseInt(value) : '')
								})
							]
						: []),

					// 17. parent (conditional: objectType === 'term')
					...(objectType === 'term'
						? [
								createElement(NumberControl || TextControl, {
									__next40pxDefaultSize: true,
									__nextHasNoMarginBottom: true,
									key: 'parent',
									label: window.bricksData.i18n.parentTerm,
									value: currentValue.parent || '',
									placeholder: window.bricksData.i18n.parentTermId,
									type: 'number',
									onChange: (value) => updateQuery('parent', value ? parseInt(value) : ''),
									help: window.bricksData.i18n.filterByParentTerm
								})
							]
						: []),

					// 18. child_of (conditional: objectType === 'term')
					...(objectType === 'term'
						? [
								createElement(NumberControl || TextControl, {
									__next40pxDefaultSize: true,
									__nextHasNoMarginBottom: true,
									key: 'child_of',
									label: window.bricksData.i18n.childOf,
									value: currentValue.child_of || '',
									placeholder: window.bricksData.i18n.parentTermId,
									type: 'number',
									onChange: (value) => updateQuery('child_of', value ? parseInt(value) : '')
								})
							]
						: []),

					// 19. current_post_term (conditional: objectType === 'term')
					...(objectType === 'term'
						? [
								createElement(CheckboxControl, {
									__nextHasNoMarginBottom: true,
									key: 'current_post_term',
									label: window.bricksData.i18n.currentPostTerm,
									checked: currentValue.current_post_term || false,
									onChange: (value) => updateQuery('current_post_term', value),
									help: window.bricksData.i18n.getTermsFromCurrent
								})
							]
						: []),

					// 20. current_post_author (conditional: objectType === 'user')
					...(objectType === 'user'
						? [
								createElement(CheckboxControl, {
									__nextHasNoMarginBottom: true,
									key: 'current_post_author',
									label: window.bricksData.i18n.currentPostAuthor,
									checked: currentValue.current_post_author || false,
									onChange: (value) => updateQuery('current_post_author', value),
									help: window.bricksData.i18n.getCurrentPostAuthor
								})
							]
						: []),

					// 21. childless (conditional: objectType === 'term')
					...(objectType === 'term'
						? [
								createElement(CheckboxControl, {
									__nextHasNoMarginBottom: true,
									key: 'childless',
									label: window.bricksData.i18n.childlessTermsOnly,
									checked: currentValue.childless || false,
									onChange: (value) => updateQuery('childless', value),
									help: window.bricksData.i18n.onlyReturnTerms
								})
							]
						: []),

					// 22. ignore_sticky_posts (conditional: objectType === 'post')
					...(!objectType || objectType === 'post'
						? [
								createElement(CheckboxControl, {
									__nextHasNoMarginBottom: true,
									key: 'ignore_sticky_posts',
									label: window.bricksData.i18n.ignoreStickyPosts,
									checked: currentValue.ignore_sticky_posts || false,
									onChange: (value) => updateQuery('ignore_sticky_posts', value)
								})
							]
						: []),

					// 23. disable_query_merge
					createElement(CheckboxControl, {
						__nextHasNoMarginBottom: true,
						key: 'disable_query_merge',
						label: window.bricksData.i18n.disableQueryMerge,
						checked: currentValue.disable_query_merge || false,
						onChange: (value) => updateQuery('disable_query_merge', value)
					}),

					// 24. is_archive_main_query (conditional: objectType === 'post')
					...(!objectType || objectType === 'post'
						? [
								createElement(CheckboxControl, {
									__nextHasNoMarginBottom: true,
									key: 'is_archive_main_query',
									label: window.bricksData.i18n.isArchiveMainQuery,
									checked: currentValue.is_archive_main_query || false,
									onChange: (value) => updateQuery('is_archive_main_query', value)
								})
							]
						: []),

					// 25. post__in (conditional: objectType === 'post') - Using pre-created select control
					...(!objectType || objectType === 'post' ? [postIncludeSelectControl] : []),

					// 26. post__not_in (conditional: objectType === 'post') - Using pre-created select control
					...(!objectType || objectType === 'post' ? [postExcludeSelectControl] : []),

					// 27. exclude_current_post (conditional: objectType === 'post')
					...(!objectType || objectType === 'post'
						? [
								createElement(CheckboxControl, {
									__nextHasNoMarginBottom: true,
									key: 'exclude_current_post',
									label: window.bricksData.i18n.excludeCurrentPost,
									checked: currentValue.exclude_current_post || false,
									onChange: (value) => updateQuery('exclude_current_post', value)
								})
							]
						: []),

					// 28. show_empty (conditional: objectType === 'term')
					...(objectType === 'term'
						? [
								createElement(CheckboxControl, {
									__nextHasNoMarginBottom: true,
									key: 'show_empty',
									label: window.bricksData.i18n.showEmptyTerms,
									checked: currentValue.show_empty || false,
									onChange: (value) => updateQuery('show_empty', value)
								})
							]
						: []),

					// 29. tax_query (conditional: objectType === 'post' || objectType === 'term') - Using pre-created select control
					...(!objectType || objectType === 'post' || objectType === 'term'
						? [taxIncludeSelectControl]
						: []),

					// 30. tax_query_not (conditional: objectType === 'post' || objectType === 'term') - Using pre-created select control
					...(!objectType || objectType === 'post' || objectType === 'term'
						? [taxExcludeSelectControl]
						: []),

					// WooCommerce controls (31-38) - conditional: objectType === 'post' && post_type === 'product'
					...((!objectType || objectType === 'post') && currentValue.post_type === 'product'
						? [
								// 31. wooControlsSeparator - represented as a divider/heading
								createElement(
									'div',
									{
										key: 'woo-separator',
										style: {
											borderTop: '1px solid #ddd',
											paddingTop: '16px',
											marginTop: '16px',
											marginBottom: '8px'
										}
									},
									[
										createElement(
											'h4',
											{
												key: 'woo-title',
												style: {
													margin: '0 0 12px 0',
													fontSize: '14px',
													fontWeight: '600',
													color: '#1e1e1e'
												}
											},
											'WooCommerce'
										)
									]
								),

								// 32. onSale
								createElement(CheckboxControl, {
									__nextHasNoMarginBottom: true,
									key: 'onSale',
									label: window.bricksData.i18n.onSaleProductsOnly,
									checked: currentValue.onSale || false,
									onChange: (value) => updateQuery('onSale', value)
								}),

								// 33. featured
								createElement(CheckboxControl, {
									__nextHasNoMarginBottom: true,
									key: 'featured',
									label: window.bricksData.i18n.featuredProductsOnly,
									checked: currentValue.featured || false,
									onChange: (value) => updateQuery('featured', value),
									help: window.bricksData.i18n.showOnlyFeatured
								}),

								// 34. hideOutOfStock
								createElement(CheckboxControl, {
									__nextHasNoMarginBottom: true,
									key: 'hideOutOfStock',
									label: window.bricksData.i18n.hideOutOfStock,
									checked: currentValue.hideOutOfStock || false,
									onChange: (value) => updateQuery('hideOutOfStock', value)
								}),

								// 35. relatedProducts
								createElement(CheckboxControl, {
									__nextHasNoMarginBottom: true,
									key: 'relatedProducts',
									label: window.bricksData.i18n.relatedProducts,
									checked: currentValue.relatedProducts || false,
									onChange: (value) => updateQuery('relatedProducts', value),
									help: window.bricksData.i18n.showProductsRelated
								}),

								// 36. upSells
								createElement(CheckboxControl, {
									__nextHasNoMarginBottom: true,
									key: 'upSells',
									label: window.bricksData.i18n.upSells,
									checked: currentValue.upSells || false,
									onChange: (value) => updateQuery('upSells', value),
									help: window.bricksData.i18n.showUpSellProducts
								}),

								// 37. crossSells
								createElement(CheckboxControl, {
									__nextHasNoMarginBottom: true,
									key: 'crossSells',
									label: window.bricksData.i18n.crossSells,
									checked: currentValue.crossSells || false,
									onChange: (value) => updateQuery('crossSells', value),
									help: window.bricksData.i18n.showCrossSellProducts
								}),

								// 38. cartCrossSells
								createElement(CheckboxControl, {
									__nextHasNoMarginBottom: true,
									key: 'cartCrossSells',
									label: window.bricksData.i18n.cartCrossSells,
									checked: currentValue.cartCrossSells || false,
									onChange: (value) => updateQuery('cartCrossSells', value),
									help: window.bricksData.i18n.showCartCrossSells
								})
							]
						: []),

					// Meta Query section (39-41)
					// 39. meta_query_separator - represented as divider/heading
					createElement(
						'div',
						{
							key: 'meta-query-separator',
							style: {
								borderTop: '1px solid #ddd',
								paddingTop: '16px',
								marginTop: '16px',
								marginBottom: '8px'
							}
						},
						[
							createElement(
								'h4',
								{
									key: 'meta-query-title',
									style: {
										margin: '0 0 12px 0',
										fontSize: '14px',
										fontWeight: '600',
										color: '#1e1e1e'
									}
								},
								window.bricksData.i18n.metaQuery
							)
						]
					),

					// 40. meta_query_relation (conditional: meta_query exists)
					...(Array.isArray(currentValue.meta_query) && currentValue.meta_query.length > 0
						? [
								createElement(
									'div',
									{ key: 'meta_query_relation-wrapper', style: { position: 'relative' } },
									[
										createElement(SelectControl, {
											__next40pxDefaultSize: true,
											__nextHasNoMarginBottom: true,
											key: 'meta_query_relation',
											label: window.bricksData.i18n.relation,
											value: currentValue.meta_query_relation || 'AND',
											options: [
												{ label: 'AND', value: 'AND' },
												{ label: 'OR', value: 'OR' }
											],
											onChange: (value) => updateQuery('meta_query_relation', value)
										})
									]
								)
							]
						: []),

					// 41. meta_query (repeater)
					...(Array.isArray(currentValue.meta_query)
						? currentValue.meta_query.map((metaItem, index) => {
								return createElement(
									'div',
									{
										key: `meta-query-${index}`,
										style: {
											border: '1px solid #ddd',
											borderRadius: '4px',
											padding: '12px',
											marginBottom: '12px',
											backgroundColor: '#f9f9f9'
										}
									},
									[
										createElement(
											'div',
											{
												key: 'meta-header',
												style: {
													display: 'flex',
													justifyContent: 'space-between',
													alignItems: 'center',
													marginBottom: '12px'
												}
											},
											[
												createElement(
													'strong',
													{ key: 'title' },
													`${window.bricksData.i18n.metaQuery} ${index + 1}`
												),
												createElement(
													Button,
													{
														key: 'remove',
														onClick: () => removeMetaQuery(index),
														variant: 'secondary',
														size: 'small',
														isDestructive: true
													},
													window.bricksData.i18n.remove
												)
											]
										),

										createElement(TextControl, {
											__next40pxDefaultSize: true,
											__nextHasNoMarginBottom: true,
											key: 'key',
											label: window.bricksData.i18n.metaKey,
											value: metaItem.key || '',
											placeholder: 'custom_field_key',
											onChange: (value) => updateMetaQuery(index, 'key', value)
										}),

										createElement(TextControl, {
											__next40pxDefaultSize: true,
											__nextHasNoMarginBottom: true,
											key: 'value',
											label: window.bricksData.i18n.metaValue,
											value: metaItem.value || '',
											placeholder: 'value',
											onChange: (value) => updateMetaQuery(index, 'value', value)
										}),

										createElement(
											'div',
											{ key: `meta-compare-wrapper-${index}`, style: { position: 'relative' } },
											[
												createElement(SelectControl, {
													__next40pxDefaultSize: true,
													__nextHasNoMarginBottom: true,
													key: 'compare',
													label: window.bricksData.i18n.compare,
													value: metaItem.compare || '=',
													options: compareOptions,
													onChange: (value) => updateMetaQuery(index, 'compare', value)
												})
											]
										),

										createElement(
											'div',
											{ key: `meta-type-wrapper-${index}`, style: { position: 'relative' } },
											[
												createElement(SelectControl, {
													__next40pxDefaultSize: true,
													__nextHasNoMarginBottom: true,
													key: 'type',
													label: window.bricksData.i18n.type,
													value: metaItem.type || 'CHAR',
													options: metaTypeOptions,
													onChange: (value) => updateMetaQuery(index, 'type', value)
												})
											]
										),

										createElement(TextControl, {
											__next40pxDefaultSize: true,
											__nextHasNoMarginBottom: true,
											key: 'clause_name',
											label: window.bricksData.i18n.clauseName,
											value: metaItem.clause_name || '',
											placeholder: 'clause_name',
											onChange: (value) => updateMetaQuery(index, 'clause_name', value),
											help: window.bricksData.i18n.clauseNameDesc
										})
									]
								)
							})
						: []),

					// Add Meta Query button
					createElement(
						Button,
						{
							key: 'add-meta-query',
							onClick: addMetaQuery,
							variant: 'secondary',
							style: { marginTop: '12px', marginBottom: '16px' }
						},
						window.bricksData.i18n.addMetaQuery
					),

					// Tax Query Advanced section (42-44) - conditional: objectType === 'post'
					...(!objectType || objectType === 'post'
						? [
								// 42. tax_query_separator
								createElement(
									'div',
									{
										key: 'tax-query-separator',
										style: {
											borderTop: '1px solid #ddd',
											paddingTop: '16px',
											marginTop: '16px',
											marginBottom: '8px'
										}
									},
									[
										createElement(
											'h4',
											{
												key: 'tax-query-title',
												style: {
													margin: '0 0 12px 0',
													fontSize: '14px',
													fontWeight: '600',
													color: '#1e1e1e'
												}
											},
											window.bricksData.i18n.taxonomyQuery
										)
									]
								),

								// 43. tax_query_relation (conditional: tax_query_advanced exists)
								...(Array.isArray(currentValue.tax_query_advanced) &&
								currentValue.tax_query_advanced.length > 0
									? [
											createElement(
												'div',
												{ key: 'tax_query_relation-wrapper', style: { position: 'relative' } },
												[
													createElement(SelectControl, {
														__next40pxDefaultSize: true,
														__nextHasNoMarginBottom: true,
														key: 'tax_query_relation',
														label: window.bricksData.i18n.relation,
														value: currentValue.tax_query_relation || 'AND',
														options: [
															{ label: 'AND', value: 'AND' },
															{ label: 'OR', value: 'OR' }
														],
														onChange: (value) => updateQuery('tax_query_relation', value)
													})
												]
											)
										]
									: []),

								// 44. tax_query_advanced (repeater)
								...(Array.isArray(currentValue.tax_query_advanced)
									? currentValue.tax_query_advanced.map((taxItem, index) => {
											return createElement(
												'div',
												{
													key: `tax-query-${index}`,
													style: {
														border: '1px solid #ddd',
														borderRadius: '4px',
														padding: '12px',
														marginBottom: '12px',
														backgroundColor: '#f9f9f9'
													}
												},
												[
													createElement(
														'div',
														{
															key: 'tax-header',
															style: {
																display: 'flex',
																justifyContent: 'space-between',
																alignItems: 'center',
																marginBottom: '12px'
															}
														},
														[
															createElement(
																'strong',
																{ key: 'title' },
																`${window.bricksData.i18n.taxonomyQuery} ${index + 1}`
															),
															createElement(
																Button,
																{
																	key: 'remove',
																	onClick: () => removeTaxQuery(index),
																	variant: 'secondary',
																	size: 'small',
																	isDestructive: true
																},
																window.bricksData.i18n.remove
															)
														]
													),

													createElement(
														'div',
														{
															key: `tax-taxonomy-wrapper-${index}`,
															style: { position: 'relative' }
														},
														[
															createElement(SelectControl, {
																__next40pxDefaultSize: true,
																__nextHasNoMarginBottom: true,
																key: 'taxonomy',
																label: window.bricksData.i18n.taxonomy,
																value: taxItem.taxonomy || '',
																options: taxonomyOptions,
																onChange: (value) => updateTaxQuery(index, 'taxonomy', value)
															})
														]
													),

													createElement(
														'div',
														{ key: `tax-field-wrapper-${index}`, style: { position: 'relative' } },
														[
															createElement(SelectControl, {
																__next40pxDefaultSize: true,
																__nextHasNoMarginBottom: true,
																key: 'field',
																label: window.bricksData.i18n.field,
																value: taxItem.field || 'term_id',
																options: taxFieldOptions,
																onChange: (value) => updateTaxQuery(index, 'field', value)
															})
														]
													),

													createElement(TextControl, {
														__next40pxDefaultSize: true,
														__nextHasNoMarginBottom: true,
														key: 'terms',
														label: window.bricksData.i18n.terms,
														value: taxItem.terms || '',
														placeholder: 'term_slug_1,term_slug_2',
														onChange: (value) => updateTaxQuery(index, 'terms', value)
													}),

													createElement(
														'div',
														{
															key: `tax-operator-wrapper-${index}`,
															style: { position: 'relative' }
														},
														[
															createElement(SelectControl, {
																__next40pxDefaultSize: true,
																__nextHasNoMarginBottom: true,
																key: 'operator',
																label: window.bricksData.i18n.compare,
																value: taxItem.operator || 'IN',
																options: taxOperatorOptions,
																onChange: (value) => updateTaxQuery(index, 'operator', value)
															})
														]
													),

													createElement(SelectControl, {
														__next40pxDefaultSize: true,
														__nextHasNoMarginBottom: true,
														key: 'include_children',
														label: window.bricksData.i18n.includeChildren,
														value: taxItem.include_children !== false,
														options: [
															{
																label: window.bricksData.i18n.true,
																value: true
															},
															{
																label: window.bricksData.i18n.false,
																value: false
															}
														],
														onChange: (value) => updateTaxQuery(index, 'include_children', value)
													})
												]
											)
										})
									: []),

								// Add Tax Query button
								createElement(
									Button,
									{
										key: 'add-tax-query',
										onClick: addTaxQuery,
										variant: 'secondary',
										style: { marginTop: '12px', marginBottom: '16px' }
									},
									window.bricksData.i18n.addTaxonomyQuery
								)
							]
						: []),

					// Infinite Scroll section (45-48)
					// 45. infinite_scroll_separator
					createElement(
						'div',
						{
							key: 'infinite-scroll-separator',
							style: {
								borderTop: '1px solid #ddd',
								paddingTop: '16px',
								marginTop: '16px',
								marginBottom: '8px'
							}
						},
						[
							createElement(
								'h4',
								{
									key: 'infinite-scroll-title',
									style: {
										margin: '0 0 12px 0',
										fontSize: '14px',
										fontWeight: '600',
										color: '#1e1e1e'
									}
								},
								window.bricksData.i18n.infiniteScroll
							)
						]
					),

					// 46. infinite_scroll
					createElement(CheckboxControl, {
						__nextHasNoMarginBottom: true,
						key: 'infinite_scroll',
						label: window.bricksData.i18n.infiniteScroll,
						checked: currentValue.infinite_scroll || false,
						onChange: (value) => updateQuery('infinite_scroll', value)
					}),

					// 47. infinite_scroll_margin (conditional: infinite_scroll exists)
					...(currentValue.infinite_scroll
						? [
								createElement(NumberControl || TextControl, {
									__next40pxDefaultSize: true,
									__nextHasNoMarginBottom: true,
									key: 'infinite_scroll_margin',
									label: `${window.bricksData.i18n.infiniteScroll}: ${window.bricksData.i18n.offset}`,
									value: currentValue.infinite_scroll_margin || '',
									placeholder: '0',
									type: 'number',
									min: 0,
									onChange: (value) =>
										updateQuery('infinite_scroll_margin', value ? parseInt(value) : '')
								})
							]
						: []),

					// 48. infinite_scroll_delay (conditional: infinite_scroll exists)
					...(currentValue.infinite_scroll
						? [
								createElement(NumberControl || TextControl, {
									__next40pxDefaultSize: true,
									__nextHasNoMarginBottom: true,
									key: 'infinite_scroll_delay',
									label: `${window.bricksData.i18n.infiniteScroll}: ${window.bricksData.i18n.delay} (ms)`,
									value: currentValue.infinite_scroll_delay || '',
									placeholder: '0',
									type: 'number',
									min: 0,
									onChange: (value) =>
										updateQuery('infinite_scroll_delay', value ? parseInt(value) : '')
								})
							]
						: []),

					// Query Filters section (49-50)
					// 49. query_filters_separator
					createElement(
						'div',
						{
							key: 'query-filters-separator',
							style: {
								borderTop: '1px solid #ddd',
								paddingTop: '16px',
								marginTop: '16px',
								marginBottom: '8px'
							}
						},
						[
							createElement(
								'h4',
								{
									key: 'query-filters-title',
									style: {
										margin: '0 0 12px 0',
										fontSize: '14px',
										fontWeight: '600',
										color: '#1e1e1e'
									}
								},
								window.bricksData.i18n.queryFilters
							)
						]
					),

					// 50. disable_url_params
					createElement(CheckboxControl, {
						__nextHasNoMarginBottom: true,
						key: 'disable_url_params',
						label: window.bricksData.i18n.disableUrlParamsFilter,
						checked: currentValue.disable_url_params || false,
						onChange: (value) => updateQuery('disable_url_params', value),
						help: window.bricksData.i18n.disableUrlParamsFilterDesc
					}),

					// Live Search section (51-54)
					// 51. is_live_search_separator
					createElement(
						'div',
						{
							key: 'live-search-separator',
							style: {
								borderTop: '1px solid #ddd',
								paddingTop: '16px',
								marginTop: '16px',
								marginBottom: '8px'
							}
						},
						[
							createElement(
								'h4',
								{
									key: 'live-search-title',
									style: {
										margin: '0 0 12px 0',
										fontSize: '14px',
										fontWeight: '600',
										color: '#1e1e1e'
									}
								},
								window.bricksData.i18n.liveSearch
							)
						]
					),

					// 52. is_live_search
					createElement(CheckboxControl, {
						__nextHasNoMarginBottom: true,
						key: 'is_live_search',
						label: window.bricksData.i18n.liveSearch,
						checked: currentValue.is_live_search || false,
						onChange: (value) => updateQuery('is_live_search', value),
						help: window.bricksData.i18n.enableLiveSearch
					}),

					// 53. is_live_search_info (conditional: is_live_search && !is_live_search_wrapper_selector)
					...(currentValue.is_live_search && !currentValue.is_live_search_wrapper_selector
						? [
								createElement(
									'div',
									{
										key: 'live-search-info',
										style: {
											padding: '12px',
											backgroundColor: '#e7f3ff',
											border: '1px solid #72aee6',
											borderRadius: '4px',
											marginBottom: '12px'
										}
									},
									[
										createElement(
											'p',
											{
												key: 'info-text',
												style: {
													margin: 0,
													fontSize: '13px',
													color: '#1e1e1e'
												}
											},
											window.bricksData.i18n.liveSearchInfo
										)
									]
								)
							]
						: []),

					// 54. is_live_search_wrapper_selector (conditional: is_live_search)
					...(currentValue.is_live_search
						? [
								createElement(TextControl, {
									__next40pxDefaultSize: true,
									__nextHasNoMarginBottom: true,
									key: 'is_live_search_wrapper_selector',
									label: window.bricksData.i18n.liveSearchWrapperSelector,
									value: currentValue.is_live_search_wrapper_selector || '',
									placeholder: '#brxe-a1b2c3',
									onChange: (value) => updateQuery('is_live_search_wrapper_selector', value),
									help: window.bricksData.i18n.liveSearchWrapperSelectorDesc
								})
							]
						: []),

					// Ajax Loader section (55-59)
					// 55. ajax_loader_separator
					createElement(
						'div',
						{
							key: 'ajax-loader-separator',
							style: {
								borderTop: '1px solid #ddd',
								paddingTop: '16px',
								marginTop: '16px',
								marginBottom: '8px'
							}
						},
						[
							createElement(
								'h4',
								{
									key: 'ajax-loader-title',
									style: {
										margin: '0 0 12px 0',
										fontSize: '14px',
										fontWeight: '600',
										color: '#1e1e1e'
									}
								},
								window.bricksData.i18n.ajaxLoader
							)
						]
					),

					// 56. ajax_loader_animation
					createElement(
						'div',
						{ key: 'ajax_loader_animation-wrapper', style: { position: 'relative' } },
						[
							createElement(SelectControl, {
								__next40pxDefaultSize: true,
								__nextHasNoMarginBottom: true,
								key: 'ajax_loader_animation',
								label: window.bricksData.i18n.ajaxLoaderAnimation,
								value: currentValue.ajax_loader_animation || '',
								options: [
									{ label: window.bricksData.i18n.none, value: '' },
									...ajaxLoaderAnimations
								],
								onChange: (value) => updateQuery('ajax_loader_animation', value),
								help: window.bricksData.i18n.ajaxLoaderDesc
							})
						]
					),

					// 57. ajax_loader_color (conditional: ajax_loader_animation exists)
					...(currentValue.ajax_loader_animation && currentValue.ajax_loader_animation !== 'none'
						? [
								createElement(
									'div',
									{
										key: 'ajax-loader-color',
										style: { marginBottom: '12px' }
									},
									[
										createElement(
											'label',
											{
												key: 'color-label',
												style: {
													display: 'block',
													marginBottom: '8px',
													fontSize: '11px',
													fontWeight: '500',
													textTransform: 'uppercase'
												}
											},
											window.bricksData.i18n.color
										),
										createElement(ColorPicker, {
											key: 'color-picker',
											color: currentValue.ajax_loader_color || '#000000',
											onChange: (value) => updateQuery('ajax_loader_color', value),
											disableAlpha: false
										})
									]
								)
							]
						: []),

					// 58. ajax_loader_scale (conditional: ajax_loader_animation exists and not none)
					...(currentValue.ajax_loader_animation &&
					currentValue.ajax_loader_animation !== 'none' &&
					currentValue.ajax_loader_animation !== ''
						? [
								createElement(NumberControl || TextControl, {
									__next40pxDefaultSize: true,
									__nextHasNoMarginBottom: true,
									key: 'ajax_loader_scale',
									label: window.bricksData.i18n.scale,
									value: currentValue.ajax_loader_scale || '',
									placeholder: '1',
									type: 'number',
									min: 0.1,
									max: 5,
									step: 0.1,
									onChange: (value) =>
										updateQuery('ajax_loader_scale', value ? parseFloat(value) : '')
								})
							]
						: []),

					// 59. ajax_loader_selector (conditional: ajax_loader_animation exists and not none)
					...(currentValue.ajax_loader_animation &&
					currentValue.ajax_loader_animation !== 'none' &&
					currentValue.ajax_loader_animation !== ''
						? [
								createElement(TextControl, {
									__next40pxDefaultSize: true,
									__nextHasNoMarginBottom: true,
									key: 'ajax_loader_selector',
									label: window.bricksData.i18n.ajaxLoaderSelector,
									value: currentValue.ajax_loader_selector || '',
									placeholder: '#brxe-a1b2c3',
									help: 'CSS selector of the element to insert the AJAX loader into.',
									onChange: (value) => updateQuery('ajax_loader_selector', value)
								})
							]
						: []),

					// No Results section (60-62)
					// 60. no_results_separator
					createElement(
						'div',
						{
							key: 'no-results-separator',
							style: {
								borderTop: '1px solid #ddd',
								paddingTop: '16px',
								marginTop: '16px',
								marginBottom: '8px'
							}
						},
						[
							createElement(
								'h4',
								{
									key: 'no-results-title',
									style: {
										margin: '0 0 12px 0',
										fontSize: '14px',
										fontWeight: '600',
										color: '#1e1e1e'
									}
								},
								window.bricksData.i18n.noResults
							)
						]
					),

					// 61. no_results_template (conditional: no_results_text is empty)
					...(!currentValue.no_results_text || currentValue.no_results_text === ''
						? [
								window.createBricksSelectControl(
									{
										id: 'no_results_template',
										label: 'Template',
										options: window.bricksGutenbergData?.sectionTemplates || {},
										multiple: false,
										searchable: true,
										placeholder: window.bricksData.i18n.selectTemplate
									},
									{
										attributes: {
											no_results_template: currentValue.no_results_template || ''
										},
										setAttributes: (newAttrs) => {
											updateQuery('no_results_template', newAttrs.no_results_template)
										}
									}
								)
							]
						: []),

					// 62. no_results_text (conditional: no_results_template is empty)
					...(!currentValue.no_results_template || currentValue.no_results_template === ''
						? [
								createElement(TextControl, {
									__next40pxDefaultSize: true,
									__nextHasNoMarginBottom: true,
									key: 'no_results_text',
									label: window.bricksData.i18n.text,
									value: currentValue.no_results_text || '',
									onChange: (value) => updateQuery('no_results_text', value)
								})
							]
						: [])
				]
			)
		)

		// Query preview and actions
		if (hasQuery) {
			const queryPreview = Object.keys(currentValue)
				.filter((key) => currentValue[key] !== '' && currentValue[key] !== undefined)
				.slice(0, 5) // Show first 5 parameters
				.map((key) => `${key}: ${JSON.stringify(currentValue[key])}`)
				.join(', ')

			const additionalParams =
				Object.keys(currentValue).length > 5
					? ` (+${Object.keys(currentValue).length - 5} more)`
					: ''

			controlElements.push(
				createElement(
					'div',
					{
						key: 'query-preview',
						style: {
							marginTop: '16px',
							padding: '12px',
							border: '1px solid #ddd',
							borderRadius: '4px',
							backgroundColor: '#f8f9fa'
						}
					},
					[
						createElement(
							'div',
							{
								key: 'preview-header',
								style: {
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'flex-start',
									marginBottom: '8px'
								}
							},
							[
								createElement(
									'div',
									{
										key: 'preview-info',
										style: { flex: 1 }
									},
									[
										createElement(
											'div',
											{
												key: 'preview',
												style: {
													fontSize: '12px',
													color: '#333',
													wordBreak: 'break-word',
													lineHeight: '1.4'
												}
											},
											queryPreview + additionalParams || window.bricksData.i18n.defaultQuery
										)
									]
								),
								createElement(
									Button,
									{
										key: 'clear',
										onClick: onClearQuery,
										variant: 'secondary',
										size: 'small',
										isDestructive: true
									},
									window.bricksData.i18n.clearAll
								)
							]
						)
					]
				)
			)
		}

		// Wrap everything in BaseControl for proper styling
		return createElement(
			BaseControl,
			{
				key: property.id,
				label: property.label,
				help: property.help,
				__nextHasNoMarginBottom: true
			},
			[
				createElement(
					Panel,
					{
						key: 'query-panel'
					},
					controlElements
				)
			]
		)
	} catch (error) {
		console.error('🔍 [Query Control] MAIN CATCH ERROR:', error)
		console.error('🔍 [Query Control] Error stack:', error.stack)
		console.error('🔍 [Query Control] Error details:', {
			propertyId: property?.id,
			propsAttributes: props?.attributes,
			error: error.message
		})

		const { createElement } = window.wp.element
		return createElement(
			'div',
			{
				style: { padding: '8px', border: '1px solid red', color: 'red' }
			},
			window.bricksData.i18n.errorCouldNotLoadQuery
		)
	}
}

// Make function available globally
window.createBricksQueryControl = createBricksQueryControl
