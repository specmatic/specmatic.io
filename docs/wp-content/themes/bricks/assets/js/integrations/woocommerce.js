function bricksShowNotice(message){const $noticeWrapper=jQuery('.brxe-woocommerce-notice')
if($noticeWrapper.length>0){$noticeWrapper.html(message)}else{jQuery('.woocommerce-NoticeGroup-checkout, .woocommerce-error, .woocommerce-message').remove()
jQuery('form.woocommerce-checkout ').prepend('<div class="woocommerce-NoticeGroup woocommerce-NoticeGroup-checkout">'+message+'</div>')}}
function bricksScrollToNotices(){const scrollElement=jQuery('.woocommerce-NoticeGroup-updateOrderReview, .woocommerce-NoticeGroup-checkout, .brxe-woocommerce-notice')
if(!scrollElement.length){scrollElement=jQuery('form.checkout')}
jQuery.scroll_to_notices(scrollElement)}
function bricksWooRefreshCartFragments(){if(typeof woocommerce_params=='undefined'){return}
var url=woocommerce_params.wc_ajax_url
url=url.replace('%%endpoint%%','get_refreshed_fragments')
jQuery.post(url,function(data,status){if(data.fragments){bricksWooReplaceFragments(data.fragments)}
jQuery('body').trigger('wc_fragments_refreshed')})}
function bricksWooReplaceFragments(fragments){if(fragments){jQuery.each(fragments,function(key,value){var fragment=jQuery(key)
if(fragment){fragment.replaceWith(value)}})}}
function bricksWooMiniCartHideDetailsClickOutside(){const closeMiniCartDetail=(miniCartDetail)=>{if(!miniCartDetail.classList.contains('cart-detail')){return}
miniCartDetail.classList.remove('active')
const miniCartEl=miniCartDetail.closest('.brxe-woocommerce-mini-cart')
if(miniCartEl){miniCartEl.classList.toggle('show-cart-details')}}
const miniCartDetails=bricksQuerySelectorAll(document,'.cart-detail')
if(miniCartDetails){miniCartDetails.forEach(function(element){if(element.dataset?.skipClickOutside){return}
document.addEventListener('click',function(event){if(!event.target.closest('.mini-cart-link')&&element.classList.contains('active')&&!event.target.closest('.cart-detail')){closeMiniCartDetail(element)}})})}
const miniCartCloseButtons=bricksQuerySelectorAll(document,'.cart-detail .bricks-mini-cart-close')
if(miniCartCloseButtons){miniCartCloseButtons.forEach(function(element){element.addEventListener('click',function(event){event.preventDefault()
const miniCartDetail=event.target.closest('.cart-detail')
if(miniCartDetail){closeMiniCartDetail(miniCartDetail)}})})}}
function bricksWooMiniModalsToggle(event){event.preventDefault()
var target=event.currentTarget
var modalString=target.getAttribute('data-toggle-target')
if(!modalString){return}
var toggles=document.querySelectorAll('.bricks-woo-toggle')
toggles.forEach(function(toggle){var thisModal=toggle.getAttribute('data-toggle-target')
if(thisModal!==modalString){var elModal=toggle.querySelector(thisModal)
if(elModal!==null&&elModal.classList.contains('active')){elModal.classList.remove('active')
var miniCartEl=toggle.closest('.brxe-woocommerce-mini-cart')
if(miniCartEl){miniCartEl.classList.remove('show-cart-details')}}}})
var modalEl=document.querySelector(modalString)
if(modalEl){modalEl.classList.toggle('active')
var miniCartEl=modalEl.closest('.brxe-woocommerce-mini-cart')
if(miniCartEl){miniCartEl.classList.toggle('show-cart-details')}}}
function bricksWooProductGallery(){if(bricksIsFrontend||typeof jQuery(this).wc_product_gallery==='undefined'){return}
jQuery('.woocommerce-product-gallery').each(function(){jQuery(this).trigger('wc-product-gallery-before-init',[this,window.wc_single_product_params])
jQuery(this).wc_product_gallery(window.wc_single_product_params)
jQuery(this).trigger('wc-product-gallery-after-init',[this,window.wc_single_product_params])})}
const bricksWooProductGalleryFn=new BricksFunction({parentNode:document,selector:'.woocommerce-product-gallery',frontEndOnly:true,eachElement:(gallery)=>{if(typeof jQuery(window).wc_product_gallery==='undefined'){return}
jQuery(gallery).trigger('wc-product-gallery-before-init',[gallery,window.wc_single_product_params])
jQuery(gallery).wc_product_gallery(window.wc_single_product_params)
jQuery(gallery).trigger('wc-product-gallery-after-init',[gallery,window.wc_single_product_params])}})
const bricksWooVariationFormFn=new BricksFunction({parentNode:document,selector:'.product form.variations_form',frontEndOnly:true,eachElement:(form)=>{if(typeof jQuery(window).wc_variation_form==='undefined'){return}
jQuery(form).wc_variation_form()}})
const bricksWooTabsRatingFn=new BricksFunction({parentNode:document,selector:'.wc-tabs-wrapper, .woocommerce-tabs, #rating',frontEndOnly:true,eachElement:(element)=>{jQuery(element).trigger('init')}})
function bricksWooStarRating(){if(bricksIsFrontend){return}
jQuery('.brxe-product-reviews #rating').each(function(){jQuery(this).hide()
if(jQuery(this).closest('.brxe-product-reviews').find('p.stars').length===0){jQuery(this).before('<p class="stars">      <span>       <a class="star-1" href="#">1</a>       <a class="star-2" href="#">2</a>       <a class="star-3" href="#">3</a>       <a class="star-4" href="#">4</a>       <a class="star-5" href="#">5</a>      </span>     </p>')}})}
function bricksWooProductGalleryEnhance(){if(typeof window.wc_single_product_params=='undefined'||typeof jQuery.fn.flexslider=='undefined'){return}
jQuery(document.body).on('wc-product-gallery-after-init',function(event){jQuery('.brx-product-gallery-thumbnail-slider').each(function(){let settings=jQuery(this).data('thumbnail-settings')
if(settings){jQuery(this).flexslider(settings)
jQuery(this).css('opacity',1)}})})
jQuery(document.body).on('woocommerce_gallery_init_zoom',function(event){jQuery('.brx-product-gallery-thumbnail-slider').each(function(){let flexData=jQuery(this).data('flexslider')
if(flexData){if(flexData.currentItem===0&&flexData.currentSlide!==0){jQuery(this).flexslider(0)}}})})
const attributeList=[['width','thumb_src_w'],['height','thumb_src_h'],['src','thumb_src'],['alt','alt'],['title','title'],['data-caption','caption'],['data-large_image','full_src'],['data-large_image_width','full_src_w'],['data-large_image_height','full_src_h'],['sizes','sizes'],['srcset','srcset']]
jQuery(document.body).on('show_variation',function(event,variation){let event_variation_id=variation?.variation_id||0
if(!event_variation_id){return}
jQuery('.brx-product-gallery-thumbnail-slider').each(function(){let sliderVariationIds=jQuery(this).data('variation-ids')||[]
if(!sliderVariationIds.includes(event_variation_id)){return}
let flexData=jQuery(this).data('flexslider')
if(flexData){const firstSlide=flexData.slides[0]
const firstSlideLink=firstSlide.querySelector('a')
const firstSlideImage=firstSlide.querySelector('img')
if(!firstSlideLink||!firstSlideImage){return}
if(!variation?.image){return}
if(!firstSlideLink.hasAttribute('o_href')){firstSlideLink.setAttribute('o_href',firstSlideLink.href)}
firstSlideLink.setAttribute('href',variation.image.full_src)
attributeList.forEach((attribute)=>{const[originalAttribute,variantAttribute]=attribute
if(!firstSlideImage.hasAttribute(originalAttribute)){return}
if(!firstSlideImage.hasAttribute('o_'+originalAttribute)){firstSlideImage.setAttribute('o_'+originalAttribute,firstSlideImage.getAttribute(originalAttribute))}
const variantValue=variation?.image[variantAttribute]
if(variantValue!==undefined){firstSlideImage.setAttribute(originalAttribute,variantValue)}})
jQuery(this).flexslider(0)}})})
jQuery(document.body).on('reset_image',function(){jQuery('.brx-product-gallery-thumbnail-slider').each(function(){let flexData=jQuery(this).data('flexslider')
if(flexData){const firstSlide=flexData.slides[0]
const firstSlideLink=firstSlide.querySelector('a')
const firstSlideImage=firstSlide.querySelector('img')
if(!firstSlideLink||!firstSlideImage){return}
if(firstSlideLink.hasAttribute('o_href')){firstSlideLink.setAttribute('href',firstSlideLink.getAttribute('o_href'))}
attributeList.forEach((attribute)=>{const[originalAttribute]=attribute
if(!firstSlideImage.hasAttribute('o_'+originalAttribute)){return}
firstSlideImage.setAttribute(originalAttribute,firstSlideImage.getAttribute('o_'+originalAttribute))})
jQuery(this).flexslider(0)}})})
const imageGalleryObserver=new IntersectionObserver((entries)=>{entries.forEach((entry)=>{if(!entry.isIntersecting)return
jQuery(entry.target).resize()
imageGalleryObserver.unobserve(entry.target)})})
jQuery('.woocommerce-product-gallery, .brx-product-gallery-thumbnail-slider').each(function(){imageGalleryObserver.observe(this)})}
const bricksWooQuantityTriggersFn=new BricksFunction({parentNode:document,selector:'form .quantity .action',subscribejQueryEvents:['updated_cart_totals'],eachElement:(button)=>{button.addEventListener('click',function(e){e.preventDefault()
var quantityInput=e.target.closest('.quantity').querySelector('.qty:not([readonly])')
if(!quantityInput){return}
var updateCartButton=document.querySelector('button[name="update_cart"]')
if(updateCartButton){updateCartButton.removeAttribute('disabled')
updateCartButton.setAttribute('aria-disabled','false')}
if(e.target.classList.contains('plus')){quantityInput.stepUp()}else if(e.target.classList.contains('minus')){quantityInput.stepDown()}
const quantityInputEvent=new Event('change',{bubbles:true})
quantityInput.dispatchEvent(quantityInputEvent)})}})
function bricksWooProductsFilter(){var filters=bricksQuerySelectorAll(document,'.brxe-woocommerce-products-filter .filter-item')
filters.forEach(function(filter){function triggerFormSubmit(event){event.target.closest('form').submit()}
function toggleFilter(event){var parentEl=event.target.closest('.filter-item')
parentEl.classList.toggle('open')}
var dropdowns=bricksQuerySelectorAll(filter,'.dropdown')
dropdowns.forEach(function(dropdown){dropdown.addEventListener('change',triggerFormSubmit)})
var inputs=bricksQuerySelectorAll(filter,'input[type="radio"], input[type="checkbox"]')
inputs.forEach(function(input){input.addEventListener('change',triggerFormSubmit)
input.addEventListener('click',triggerFormSubmit)})
var sliders=bricksQuerySelectorAll(filter,'.double-slider-wrap')
sliders.forEach(function(slider){bricksWooProductsFilterInitSlider(slider)})
var toggles=bricksQuerySelectorAll(filter,'.title')
toggles.forEach(function(toggle){toggle.onclick=toggleFilter})})}
function bricksWooMiniModals(){var toggles=document.querySelectorAll('.bricks-woo-toggle')
toggles.forEach(function(toggle){toggle.addEventListener('click',bricksWooMiniModalsToggle)
if(toggle.hasAttribute('data-open-on-add-to-cart')){jQuery(document.body).on('added_to_cart',function(event,fragments,cart_hash,$button){toggle.click()})}})}
function bricksWooProductsFilterInitSlider(slider){var lowerSlider=slider.querySelector('input.lower')
var upperSlider=slider.querySelector('input.upper')
lowerSlider.oninput=bricksWooProductsFilterUpdateSliderValue
upperSlider.oninput=bricksWooProductsFilterUpdateSliderValue
var lowerVal=parseInt(lowerSlider.value)
var upperVal=parseInt(upperSlider.value)
bricksWooProductsFilterRenderSliderValues(lowerSlider.parentNode,lowerVal,upperVal)
lowerSlider.addEventListener('change',function(){slider.closest('form').submit()})
upperSlider.addEventListener('change',function(){slider.closest('form').submit()})}
function bricksWooProductsFilterUpdateSliderValue(event){var parentEl=event.target.parentNode
var lowerSlider=parentEl.querySelector('input.lower')
var upperSlider=parentEl.querySelector('input.upper')
var lowerVal=parseInt(lowerSlider.value)
var upperVal=parseInt(upperSlider.value)
if(upperVal<lowerVal+4){lowerSlider.value=upperVal-4
upperSlider.value=lowerVal+4
if(lowerVal==lowerSlider.min){upperSlider.value=4}
if(upperVal==upperSlider.max){lowerSlider.value=parseInt(upperSlider.max)-4}}
bricksWooProductsFilterRenderSliderValues(parentEl,lowerVal,upperVal)}
function bricksWooProductsFilterRenderSliderValues(parentEl,lowerVal,upperVal){var currency=parentEl.getAttribute('data-currency')
var labelLower=parentEl.querySelector('label.lower')
var labelUpper=parentEl.querySelector('label.upper')
var valueLower=parentEl.querySelector('.value.lower')
var valueUpper=parentEl.querySelector('.value.upper')
const currencyData=JSON.parse(currency)
let currencySymbolLower=currencyData.symbol
let currencySymbolUpper=currencyData.symbol
switch(currencyData.position){case'left':currencySymbolLower=currencyData.symbol+lowerVal
currencySymbolUpper=currencyData.symbol+upperVal
break
case'right':currencySymbolLower=lowerVal+currencyData.symbol
currencySymbolUpper=upperVal+currencyData.symbol
break
case'leftSpace':currencySymbolLower=currencyData.symbol+' '+lowerVal
currencySymbolUpper=currencyData.symbol+' '+upperVal
break
case'rightSpace':currencySymbolLower=lowerVal+' '+currencyData.symbol
currencySymbolUpper=upperVal+' '+currencyData.symbol
break}
valueLower.innerText=labelLower.innerText+': '+currencySymbolLower
valueUpper.innerText=labelUpper.innerText+': '+currencySymbolUpper}
const bricksWooAjaxAddToCartFn=new BricksFunction({parentNode:document,selector:'.single_add_to_cart_button, .brx_ajax_add_to_cart',windowVariableCheck:['bricksWooCommerce.ajaxAddToCartEnabled'],eachElement:(addToCartButton)=>{addToCartButton.addEventListener('click',function(event){event.preventDefault()
if(addToCartButton.classList.contains('disabled')){return}
const type=addToCartButton.classList.contains('single_add_to_cart_button')?'single':'loop'
const addToCartElement=type==='single'?addToCartButton.closest('form.cart'):addToCartButton
if(type==='single'){const form=addToCartButton.closest('form.cart')
const formMethod=form.getAttribute('method')
if(formMethod==='get'){form.submit()
return}}
bricksWooAddToCart(addToCartElement,type)})}})
function bricksWooAjaxAddToCartText(){if(!window.bricksWooCommerce.ajaxAddToCartEnabled){return}
const getAjaxButtonSettings=function(button){let ajaxButtonSettingsObj={addingHTML:bricksWooCommerce.ajaxAddingText,addedHTML:bricksWooCommerce.ajaxAddedText,showNotice:bricksWooCommerce.showNotice,scrollToNotice:bricksWooCommerce.scrollToNotice,resetTextAfter:bricksWooCommerce.resetTextAfter,errorAction:bricksWooCommerce.errorAction,errorScrollToNotice:bricksWooCommerce.errorScrollToNotice}
if(button.closest('.brxe-product-add-to-cart')){customAjaxButtonSettingsObj=button.closest('.brxe-product-add-to-cart')?.getAttribute('data-bricks-ajax-add-to-cart')||false
if(customAjaxButtonSettingsObj){try{JSON.parse(customAjaxButtonSettingsObj,(key,value)=>{ajaxButtonSettingsObj[key]=value})}catch(error){console.error('Bricks WooCommerce: Invalid JSON format for data-bricks-ajax-add-to-cart')}}}
return ajaxButtonSettingsObj}
jQuery('body').on('adding_to_cart',function(event,$button,data){$button[0].setAttribute('disabled','disabled')
$button[0].classList.add('disabled','bricks-cart-adding')
const ajaxButtonSettings=getAjaxButtonSettings($button[0])
if(ajaxButtonSettings&&ajaxButtonSettings.addingHTML){if(!$button[0].hasAttribute('data-original-text')){$button[0].setAttribute('data-original-text',$button[0].innerHTML)}
$button[0].innerHTML=ajaxButtonSettings.addingHTML}})
jQuery('body').on('added_to_cart',function(event,fragments,cartHash,$button){$button[0].removeAttribute('disabled')
$button[0].classList.add('bricks-cart-added')
$button[0].classList.remove('disabled','bricks-cart-adding')
const ajaxButtonSettings=getAjaxButtonSettings($button[0])
if(ajaxButtonSettings&&ajaxButtonSettings.addedHTML){$button[0].innerHTML=ajaxButtonSettings.addedHTML
setTimeout(function(){$button[0].innerHTML=$button[0].getAttribute('data-original-text')},ajaxButtonSettings.resetTextAfter*1000)}
if(typeof window.bricksWooCommerce.addedToCartNotices==='string'&&window.bricksWooCommerce.addedToCartNotices.length>0&&ajaxButtonSettings.showNotice==='yes'){jQuery('.woocommerce-notices-wrapper').html(window.bricksWooCommerce.addedToCartNotices)
window.bricksWooCommerce.addedToCartNotices=''
if(ajaxButtonSettings.scrollToNotice==='yes'&&typeof jQuery.scroll_to_notices==='function'){jQuery.scroll_to_notices(jQuery('.woocommerce-notices-wrapper'))}}})
jQuery('body').on('bricks_add_to_cart_error',function(event,notices,$button){$button[0].removeAttribute('disabled')
$button[0].classList.remove('disabled','bricks-cart-adding')
const ajaxButtonSettings=getAjaxButtonSettings($button[0])
if($button[0].hasAttribute('data-original-text')){$button[0].innerHTML=$button[0].getAttribute('data-original-text')}
if(typeof notices==='string'&&notices.length>0&&ajaxButtonSettings.errorAction==='notice'){jQuery('.woocommerce-notices-wrapper').html(notices)
if(ajaxButtonSettings.errorScrollToNotice&&typeof jQuery.scroll_to_notices==='function'){jQuery.scroll_to_notices(jQuery('.woocommerce-notices-wrapper'))}}})}
function bricksWooAddToCart(element,type){if(typeof woocommerce_params=='undefined'){return}
const addToCartButton=type==='single'?element.querySelector('.single_add_to_cart_button'):element
const data={}
if(type==='single'){const form=element
const formData=new FormData(form)
data.product_id=addToCartButton.value
data.quantity=formData.get('quantity')
data.product_type='simple'
if(form.classList.contains('variations_form')){data.product_id=formData.get('product_id')
data.quantity=formData.get('quantity')
data.variation_id=formData.get('variation_id')
data.product_type='variable'
const attributes={}
for(const pair of formData.entries()){if(pair[0].indexOf('attribute_')>-1){attributes[pair[0]]=pair[1]}}
data.variation=attributes}
if(form.classList.contains('grouped_form')){data.product_id=formData.get('add-to-cart')
const products={}
for(const pair of formData.entries()){if(pair[0].indexOf('quantity')>-1&&pair[1]>0){const product_id=pair[0].replace('quantity[','').replace(']','')
products[product_id]=pair[1]}}
data.products=products
data.product_type='grouped'}
if(data.product_type==='grouped'){if(Object.keys(data.products).length===0){return}}
for(const pair of formData.entries()){if(pair[0]==='product_id'||pair[0]==='quantity'||pair[0]==='variation_id'||pair[0]==='add-to-cart'||pair[0].indexOf('attribute_')>-1){continue}
if(data[pair[0]]===undefined){data[pair[0]]=pair[1]}else{if(!Array.isArray(data[pair[0]])){data[pair[0]]=[data[pair[0]]]}
if(Array.isArray(data[pair[0]])&&data[pair[0]].includes(pair[1])){continue}
data[pair[0]].push(pair[1])}}}else{data.product_id=addToCartButton.dataset?.product_id||0
data.quantity=addToCartButton.dataset?.quantity||1
data.product_type=addToCartButton.dataset?.product_type||'simple'}
jQuery('body').trigger('adding_to_cart',[jQuery(addToCartButton),data])
const url=woocommerce_params.wc_ajax_url.toString().replace('%%endpoint%%','bricks_add_to_cart')
jQuery.ajax({type:'POST',url:url,data:data,dataType:'json',success:function(response){if(response.error&&response.product_url){window.location=response.product_url
return}
if(response.error&&response.notices){jQuery('body').trigger('bricks_add_to_cart_error',[response.notices,jQuery(addToCartButton)])
return}
if(typeof wc_add_to_cart_params!=='undefined'&&wc_add_to_cart_params.cart_redirect_after_add==='yes'&&wc_add_to_cart_params.cart_url){window.location=wc_add_to_cart_params.cart_url
return}
if(response.fragments){bricksWooReplaceFragments(response.fragments)
jQuery('body').trigger('wc_fragments_refreshed')}
if(response.notices&&typeof response.notices==='string'&&response.notices.length>0&&window.bricksWooCommerce.addedToCartNotices!==undefined){window.bricksWooCommerce.addedToCartNotices=response.notices}
jQuery('body').trigger('added_to_cart',[response.fragments,response.cart_hash,jQuery(addToCartButton)])},error:function(response){if(response.error&&response.product_url){window.location=response.product_url}},complete:function(response){}})}
function bricksWooCheckoutSubmitBehavior(){if(typeof wc_checkout_params=='undefined'||!wc_checkout_params.is_checkout){return}
const $form=jQuery('form.checkout')
if(!$form){return}
$form.one('checkout_place_order',function(event,wc_checkout_form){if(typeof wc_checkout_form!=='object'){return}
if(typeof wc_checkout_form.submit_error!=='function'){return}
wc_checkout_form.submit_error=function(error_message){bricksShowNotice(error_message)
wc_checkout_form.$checkout_form.removeClass('processing').unblock()
wc_checkout_form.$checkout_form.find('.input-text, select, input:checkbox').trigger('validate').trigger('blur')
wc_checkout_form.scroll_to_notices()
jQuery(document.body).trigger('checkout_error',[error_message])}
if(typeof wc_checkout_form.scroll_to_notices!=='function'){return}
wc_checkout_form.scroll_to_notices=bricksScrollToNotices})}
const bricksWooLoopQtyListenerFn=new BricksFunction({parentNode:document,selector:'.brx-loop-product-form input.qty',windowVariableCheck:['bricksWooCommerce.useQtyInLoop'],eachElement:(quantityInput)=>{const updateQuantity=(event)=>{const form=event.target.closest('form.brx-loop-product-form')
if(form){const value=event.target.value
const addToCartButton=form.querySelector('.add_to_cart_button')
if(addToCartButton){const addToCartURL=new URL(addToCartButton.href)
addToCartURL.searchParams.set('quantity',value)
addToCartButton.href=addToCartURL.toString()
addToCartButton.setAttribute('data-quantity',value)}}}
quantityInput.addEventListener('change',updateQuantity)}})
const bricksCheckoutCouponToggleFn=new BricksFunction({parentNode:document,selector:'.brxe-woocommerce-checkout-coupon .coupon-toggle',eachElement:(element)=>{if(typeof jQuery==='undefined'||typeof jQuery.fn.slideToggle==='undefined'){return}
const checkouCouponElement=element.closest('.brxe-woocommerce-checkout-coupon')
if(!checkouCouponElement){return}
const couponDiv=checkouCouponElement.querySelector('.coupon-div')
if(!couponDiv){return}
element.addEventListener('click',function(event){event.preventDefault()
jQuery(couponDiv).slideToggle(400,function(){if(jQuery(couponDiv).is(':visible')){element.setAttribute('aria-expanded','true')}else{element.setAttribute('aria-expanded','false')}
jQuery(couponDiv).find(':input:eq(0)').trigger('focus')})})}})
function bricksCheckoutCouponToggle(){bricksCheckoutCouponToggleFn.run()}
const bricksCheckoutCouponFormFn=new BricksFunction({parentNode:document,selector:'.brxe-woocommerce-checkout-coupon .coupon-form',eachElement:(form)=>{if(typeof jQuery=='undefined'||typeof wc_checkout_params=='undefined'){return}
const couponElement=form.closest('.brxe-woocommerce-checkout-coupon')
const couponDiv=form.closest('.brxe-woocommerce-checkout-coupon').querySelector('.coupon-div')
const applyButton=form.querySelector('button[name="apply_coupon"]')
const couponInput=form.querySelector('input[name="coupon_code"]')
if(!applyButton||!couponInput||!couponDiv||!couponElement){return}
const toggleAble=couponElement.querySelector('.coupon-toggle')
jQuery(document.body).on('removed_coupon_in_checkout',function(){jQuery(couponDiv).find('.woocommerce-notices-wrapper').remove()})
jQuery(document.body).on('init_checkout',function(){setTimeout(()=>{jQuery(document.body).off('click','.woocommerce-remove-coupon')
const applyCoupon=()=>{let $couponDiv=jQuery(couponDiv)
if($couponDiv.hasClass('processing')){return}
$couponDiv.addClass('processing').block({message:null,overlayCSS:{background:'#fff',opacity:0.6}})
let data={coupon_code:couponInput.value,security:wc_checkout_params.apply_coupon_nonce,billing_email:jQuery('form.checkout').find('input[name="billing_email"]').val()}
jQuery.ajax({type:'POST',url:wc_checkout_params.wc_ajax_url.toString().replace('%%endpoint%%','apply_coupon'),data:data,success:function(code){$couponDiv.find('.woocommerce-notices-wrapper').remove()
$couponDiv.removeClass('processing').unblock()
if(code){bricksShowNotice(code)
bricksScrollToNotices()
if(toggleAble){$couponDiv.slideUp()
toggleAble.setAttribute('aria-expanded','false')}
jQuery(document.body).trigger('applied_coupon_in_checkout',[data.coupon_code])
jQuery(document.body).trigger('update_checkout',{update_shipping_method:false})}},dataType:'html'})}
applyButton.addEventListener('click',function(event){event.preventDefault()
applyCoupon()})
const removeCoupon=(e)=>{e.preventDefault()
const $container=jQuery('form.checkout').find('.woocommerce-checkout-review-order')
const coupon=e.target.getAttribute('data-coupon')
$container.addClass('processing').block({message:null,overlayCSS:{background:'#fff',opacity:0.6}})
var data={security:wc_checkout_params.remove_coupon_nonce,coupon:coupon}
jQuery.ajax({type:'POST',url:wc_checkout_params.wc_ajax_url.toString().replace('%%endpoint%%','remove_coupon'),data:data,success:function(code){$container.removeClass('processing').unblock()
if(code){bricksShowNotice(code)
bricksScrollToNotices()
jQuery(document.body).trigger('removed_coupon_in_checkout',[data.coupon])
jQuery(document.body).trigger('update_checkout',{update_shipping_method:false})
jQuery('form.checkout').find('input[name="coupon_code"]').val('')}},error:function(jqXHR){if(wc_checkout_params.debug_mode){console.log(jqXHR.responseText)}},dataType:'html'})}
jQuery(document.body).on('click','.woocommerce-remove-coupon',removeCoupon)},100)})}})
function bricksCheckoutCouponForm(){bricksCheckoutCouponFormFn.run()}
const bricksCheckoutLoginToggleFn=new BricksFunction({parentNode:document,selector:'.brxe-woocommerce-checkout-login .login-toggle',eachElement:(element)=>{if(typeof jQuery==='undefined'||typeof jQuery.fn.slideToggle==='undefined'){return}
const checkoutLoginElement=element.closest('.brxe-woocommerce-checkout-login')
if(!checkoutLoginElement){return}
const loginDiv=checkoutLoginElement.querySelector('.login-div')
if(!loginDiv){return}
element.addEventListener('click',function(event){event.preventDefault()
jQuery(loginDiv).slideToggle(400,function(){if(jQuery(loginDiv).is(':visible')){element.setAttribute('aria-expanded','true')}else{element.setAttribute('aria-expanded','false')}
jQuery(loginDiv).find(':input:eq(0)').trigger('focus')})})}})
function bricksCheckoutLoginToggle(){bricksCheckoutLoginToggleFn.run()}
const bricksCheckoutLoginFormFn=new BricksFunction({parentNode:document,selector:'.brxe-woocommerce-checkout-login .login-div',eachElement:(loginDiv)=>{if(typeof jQuery==='undefined'||typeof jQuery.fn.slideToggle==='undefined'){return}
const loginElement=loginDiv.closest('.brxe-woocommerce-checkout-login')
const loginButton=loginDiv.querySelector('button.woocommerce-form-login__submit')
if(!loginElement||!loginButton){return}
const login=()=>{const data={}
const inputs=loginDiv.querySelectorAll('input')
let hasEmptyRequired=false
for(let i=0;i<inputs.length;i++){const input=inputs[i]
if(input.hasAttribute('required')&&input.value===''){input.reportValidity()
hasEmptyRequired=true
break}
if(input.type==='checkbox'&&!input.checked){continue}
data[input.name]=input.value}
if(hasEmptyRequired){return}
data[loginButton.name]=loginButton.value
const form=document.createElement('form')
form.method='POST'
form.action=window.location.href
form.style.display='none'
Object.keys(data).forEach((key)=>{const input=document.createElement('input')
input.name=key
input.value=data[key]
form.appendChild(input)})
document.body.appendChild(form)
form.submit()}
loginButton.addEventListener('click',function(event){event.preventDefault()
login()})}})
function bricksCheckoutLoginForm(){bricksCheckoutLoginFormFn.run()}
const bricksWooVariationSwatchesFn=new BricksFunction({parentNode:document,selector:'.bricks-variation-swatches',windowVariableCheck:['bricksWooCommerce.useVariationSwatches'],eachElement:(swatchesContainer)=>{const swatches=swatchesContainer.querySelectorAll('li')
const originalSelect=swatchesContainer.nextElementSibling?.querySelector('select')
const variationForm=swatchesContainer.closest('.variations_form')
if(!swatches.length||!originalSelect){return}
swatches.forEach((swatch)=>{swatch.addEventListener('click',()=>{if(swatch.classList.contains('disabled')){return}
swatches.forEach((s)=>s.classList.remove('bricks-swatch-selected'))
swatch.classList.add('bricks-swatch-selected')
originalSelect.value=swatch.dataset.value
jQuery(originalSelect).trigger('change')})})
jQuery(originalSelect).on('change',()=>{const value=originalSelect.value
swatches.forEach((swatch)=>{swatch.classList.toggle('bricks-swatch-selected',swatch.dataset.value===value)})})
if(variationForm){const attributeName=originalSelect.name
jQuery(variationForm).on('found_variation',function(event,variation){updateAvailableOptions(swatchesContainer,variationForm,attributeName)
updateSelectedImageSwatch(swatchesContainer,variation,attributeName)})
jQuery(variationForm).on('hide_variation',function(){updateAvailableOptions(swatchesContainer,variationForm,attributeName)
updateSelectedImageSwatch(swatchesContainer,null,attributeName)})
jQuery(variationForm).on('check_variations',function(){updateAvailableOptions(swatchesContainer,variationForm,attributeName)
updateSelectedImageSwatch(swatchesContainer,null,attributeName)})
jQuery(document).on('woocommerce_update_variation_values',function(){updateAvailableOptions(swatchesContainer,variationForm,attributeName)
updateSelectedImageSwatch(swatchesContainer,null,attributeName)})
setTimeout(()=>{updateAvailableOptions(swatchesContainer,variationForm,attributeName)},100)}}})
function updateAvailableOptions(swatchesContainer,variationForm,attributeName){const swatches=swatchesContainer.querySelectorAll('li')
const originalSelect=swatchesContainer.nextElementSibling?.querySelector('select')
if(!originalSelect){return}
const availableOptions=[]
for(let i=0;i<originalSelect.options.length;i++){const option=originalSelect.options[i]
if(!option.value){continue}
if(!option.disabled){availableOptions.push(option.value)}}
swatches.forEach((swatch)=>{const swatchValue=swatch.dataset.value
if(availableOptions.includes(swatchValue)){swatch.classList.remove('disabled')}else{swatch.classList.add('disabled')}})}
function updateSelectedImageSwatch(swatchesContainer,variation,attributeName){if(!swatchesContainer.classList.contains('bricks-swatch-image')){return}
const variationSwatches=swatchesContainer.querySelectorAll('li[data-image-origin="variation"]')
if(!variationSwatches.length){return}
variationSwatches.forEach((swatch)=>{const imgEl=swatch.querySelector('img')
if(!imgEl){return}
if(!imgEl.dataset.origSrc){imgEl.dataset.origSrc=imgEl.getAttribute('src')}
if(variation&&variation.image&&variation.image.src){imgEl.setAttribute('src',variation.image.src)}else{imgEl.setAttribute('src',imgEl.dataset.origSrc)}})}
function bricksWooVariationSwatches(){bricksWooVariationSwatchesFn.run()}
document.addEventListener('DOMContentLoaded',function(event){bricksWooProductsFilter()
bricksWooMiniModals()
bricksWooMiniCartHideDetailsClickOutside()
bricksWooAjaxAddToCartText()
bricksWooAjaxAddToCartFn.run()
bricksWooCheckoutSubmitBehavior()
bricksWooProductGalleryEnhance()
bricksCheckoutCouponToggle()
bricksCheckoutCouponForm()
bricksCheckoutLoginToggle()
bricksCheckoutLoginForm()
bricksWooVariationSwatches()
setTimeout(function(){bricksWooQuantityTriggersFn.run()
bricksWooLoopQtyListenerFn.run()},150)})
window.addEventListener('load',()=>{if(!bricksIsFrontend||typeof jQuery==='undefined'||typeof jQuery(this).wc_product_gallery==='undefined'){return}
jQuery('.woocommerce-product-gallery').each(function(){jQuery(this).resize()})})