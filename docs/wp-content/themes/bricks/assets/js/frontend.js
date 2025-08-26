class BricksIntersect{constructor(options={}){let element=options.element||false
let callback=options.callback||false
let runOnce=options.hasOwnProperty('once')?options.once:true
let trigger=options.hasOwnProperty('trigger')?options.trigger:false
if('IntersectionObserver'in window){let enableLeaveViewTrigger=false
let observerInstance=new IntersectionObserver((entries,observer)=>{entries.forEach((entry)=>{let bricksIsIntersecting=trigger==='leaveView'?!entry.isIntersecting&&enableLeaveViewTrigger:entry.isIntersecting
if(trigger==='leaveView'&&entry.isIntersecting){enableLeaveViewTrigger=true}
if(bricksIsIntersecting){if(element&&callback){callback(entry.target)}
if(runOnce){observer.unobserve(entry.target)}}})},{threshold:options.threshold||0,root:options.root||null,rootMargin:options?.rootMargin||'0px'})
if(element instanceof Element){observerInstance.observe(element)}}
else{let active=false
let ieIntersectObserver=()=>{if(active===false){active=true
if(element.getBoundingClientRect().top<=window.innerHeight&&element.getBoundingClientRect().bottom>=0&&window.getComputedStyle(element).display!=='none'){if(element&&callback){callback(element)}}
active=false}}
ieIntersectObserver()
document.addEventListener('scroll',ieIntersectObserver)
window.addEventListener('resize',ieIntersectObserver)
window.addEventListener('orientationchange',ieIntersectObserver)}}}
function BricksIsInViewport(element){const rect=element.getBoundingClientRect()
return(rect.top>=0&&rect.left>=0&&rect.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&rect.right<=(window.innerWidth||document.documentElement.clientWidth))}
function bricksQuerySelectorAll(parentNode,selector){if(Array.isArray(selector)){let nodes=[]
selector.forEach((sel)=>{nodes=nodes.concat(Array.prototype.slice.apply(parentNode.querySelectorAll(sel)))})
return nodes}
return Array.prototype.slice.apply(parentNode.querySelectorAll(selector))}
const bricksUtils={subscribeEvents:(object,eventNames,callback)=>{eventNames.forEach((eventName)=>{object.addEventListener(eventName,(event)=>{callback(event)})})},subscribejQueryEvents:(object,eventNames,callback)=>{if(typeof jQuery==='undefined'){return}
eventNames.forEach((eventName)=>{jQuery(object).on(eventName,(event)=>{callback(event)})})},maybeRunOnceInteractions:(sourceEl,interaction)=>{let interactionIndex=window.bricksData.interactions.findIndex((interactionPool)=>{return interactionPool===interaction})
if(interactionIndex===-1){return}
if(interaction?.runOnce){window.bricksData.interactions.splice(interactionIndex,1)}
bricksInteractionCallbackExecution(sourceEl,interaction)},hideOrShowLoadMoreButtons:(queryId)=>{const queryLoopInstance=window.bricksData.queryLoopInstances[queryId]||false
if(!queryLoopInstance&&queryId!=='all'){return}
if(queryId==='all'){for(const queryId in window.bricksData.queryLoopInstances){if(window.bricksData.queryLoopInstances.hasOwnProperty(queryId)){bricksUtils.hideOrShowLoadMoreButtons(queryId)}}}
const loadMoreInteractions=window.bricksData.interactions.filter((interaction)=>{return interaction.action==='loadMore'&&interaction.loadMoreQuery===queryId})
if(loadMoreInteractions.length){let shouldShow=parseInt(queryLoopInstance.page)<parseInt(queryLoopInstance.maxPages)
loadMoreInteractions.forEach((interaction)=>{if(shouldShow){interaction.el.classList.remove('brx-load-more-hidden')}else{interaction.el.classList.add('brx-load-more-hidden')}})}},updateIsotopeInstance:(elementId)=>{const isotopeInstance=window.bricksData.isotopeInstances[elementId]||false
if(!isotopeInstance){return}
if(isotopeInstance.elementName==='masonry-element'){let removeItems=isotopeInstance.instance.items.filter((item)=>!item.element.isConnected)
if(removeItems.length>0){isotopeInstance.instance.remove(removeItems)}
isotopeInstance.instance.layout()
let masonryItems=isotopeInstance.instance.element.querySelectorAll(':scope > *:not(.bricks-isotope-sizer):not(.bricks-gutter-sizer)')
if(masonryItems.length>0){masonryItems.forEach((newItem)=>{if(!isotopeInstance.instance.items.find((item)=>item.element===newItem)){isotopeInstance.instance.appended(newItem)}})}
bricksUtils.updateIsotopeOnImageLoad(elementId)
return}
isotopeInstance.instance?.reloadItems()
isotopeInstance.instance?.layout()
isotopeInstance.instance?.arrange()
bricksUtils.updateIsotopeOnImageLoad(elementId)},updateIsotopeOnImageLoad:(elementId)=>{if(!document.body.classList.contains('bricks-is-frontend')){return}
const isotopeInstance=window.bricksData.isotopeInstances[elementId]||false
if(!isotopeInstance){return}
const unloadedImages=Array.from(isotopeInstance.instance.element.querySelectorAll('img')).filter((img)=>{return!img.complete||img.naturalHeight===0})
if(unloadedImages.length===0){isotopeInstance.instance.layout()
return}
let loadedCount=0
let layoutScheduled=false
const scheduleLayout=()=>{if(!layoutScheduled){layoutScheduled=true
requestAnimationFrame(()=>{isotopeInstance.instance.layout()
layoutScheduled=false})}}
const forceUpdateEvery=Math.min(3,Math.max(1,Math.ceil(unloadedImages.length / 5)))
const maxWaitTime=500
let lastForceUpdate=Date.now()
unloadedImages.forEach((img)=>{const handleImageLoad=()=>{loadedCount++
const now=Date.now()
const shouldForceUpdate=loadedCount%forceUpdateEvery===0||now-lastForceUpdate>maxWaitTime||loadedCount===unloadedImages.length
if(shouldForceUpdate){isotopeInstance.instance.layout()
lastForceUpdate=now}else{scheduleLayout()}
img.removeEventListener('load',handleImageLoad)
img.removeEventListener('error',handleImageLoad)}
if(img.complete&&img.naturalHeight!==0){loadedCount++
scheduleLayout()}else{img.addEventListener('load',handleImageLoad)
img.addEventListener('error',handleImageLoad)}})},toggleAction:(toggle,customOptions={})=>{let toggleSelector=toggle.dataset?.selector||'.brxe-offcanvas'
let toggleAttribute=toggle.dataset?.attribute||'class'
let toggleValue=toggle.dataset?.value||'brx-open'
if(customOptions){toggleSelector=customOptions?.selector||toggleSelector
toggleAttribute=customOptions?.attribute||toggleAttribute
toggleValue=customOptions?.value||toggleValue}
let toggleElement=toggleSelector?document.querySelector(toggleSelector):false
if(!toggleElement){toggleElement=toggle.closest('.brxe-nav-nested')}
if(!toggleElement){toggleElement=toggle.closest('.brxe-offcanvas')}
if(!toggleElement){return}
if(document.querySelector('.brx-has-megamenu')){if(!toggle.closest('[data-effect="offset"]')){bricksSubmenuPosition(0)}}
let expanded=false
if(toggleAttribute==='class'){expanded=toggleElement.classList.contains(toggleValue)}else{expanded=toggleElement.getAttribute(toggleAttribute)===toggleValue}
toggle.setAttribute('aria-expanded',!expanded)
if(expanded){toggle.classList.remove('is-active')}else{toggle.classList.add('is-active')
if(toggle.dataset?.scriptId||toggle.dataset?.interactionId){toggleElement.dataset.toggleScriptId=toggle.dataset?.scriptId||toggle.dataset?.interactionId}}
let toggleElementCurrentState='off'
if(toggleAttribute==='class'){if(toggle.closest('.brxe-nav-nested')&&toggleValue==='brx-open'&&toggleElement.classList.contains('brx-open')){toggleElementCurrentState='on'
toggleElement.classList.add('brx-closing')
setTimeout(()=>{toggleElement.classList.remove('brx-closing')
toggleElement.classList.remove('brx-open')},200)}else{if(toggleElement.classList.contains(toggleValue)){toggleElementCurrentState='on'}else{toggleElementCurrentState='off'}
toggleElement.classList.toggle(toggleValue)}}else{if(toggleElement.getAttribute(toggleAttribute)){toggleElementCurrentState='on'
toggleElement.removeAttribute(toggleAttribute)}else{toggleElementCurrentState='off'
toggleElement.setAttribute(toggleAttribute,toggleValue)}}
let disableAutoFocus=false
if(toggleElement.classList.contains('brxe-offcanvas')){disableAutoFocus=toggleElement.dataset?.noAutoFocus==='true'||false
toggleElement.classList.remove('brx-closing')}
if(toggleElement.classList.contains('brxe-nav-nested')){disableAutoFocus=true}
if(!disableAutoFocus&&toggleElementCurrentState==='off'){bricksFocusOnFirstFocusableElement(toggleElement)}},debounce:(func,wait,immediate)=>{let timeout
return function(){let context=this,args=arguments
let later=function(){timeout=null
if(!immediate)func.apply(context,args)}
let callNow=immediate&&!timeout
clearTimeout(timeout)
timeout=setTimeout(later,wait)
if(callNow)func.apply(context,args)}},maybeAbortXhr:(queryId)=>{const queryLoopInstance=window.bricksData.queryLoopInstances[queryId]||false
if(!queryLoopInstance){return queryLoopInstance.xhrAborted}
if(queryLoopInstance.xhr){queryLoopInstance.xhr.abort()
queryLoopInstance.xhrAborted=true}
return queryLoopInstance.xhrAborted},getPageNumberFromUrl:(href)=>{let pageNumber=1
const url=new URL(href)
if(url.searchParams.has('paged')){pageNumber=parseInt(url.searchParams.get('paged'))}else{const pagePath=url.pathname.split('/')
const pagePathFiltered=pagePath.filter((path)=>{return path!==''})
pageNumber=pagePathFiltered[pagePathFiltered.length-1]
if(isNaN(pageNumber)){pageNumber=1}}
pageNumber=parseInt(pageNumber)
return pageNumber},updateQueryResultStats:(queryId,type,data)=>{const foundStats={count:0,start:0,end:0}
if(type==='dom'){const domResultsCount=data.querySelector(`span[data-brx-qr-count="${queryId}"]`)
if(domResultsCount){foundStats.count=domResultsCount.innerHTML}
const queryResultsSummaryElement=data.querySelector(`.brxe-query-results-summary[data-brx-qr-stats="${queryId}"]`)
if(queryResultsSummaryElement){const statsData=queryResultsSummaryElement.dataset?.brxQrStatsData||false
if(statsData){const statsDataObj=JSON.parse(statsData)
if(statsDataObj?.start!==undefined){foundStats.start=statsDataObj.start}
if(statsDataObj?.end!==undefined){foundStats.end=statsDataObj.end}
if(statsDataObj?.count!==undefined){foundStats.count=statsDataObj.count}}}}else{if(data?.count!==undefined){foundStats.count=data.count}
if(data?.start!==undefined){foundStats.start=data.start}
if(data?.end!==undefined){foundStats.end=data.end}}
if(foundStats?.count!==undefined){const qrTotal=parseInt(foundStats.count||0)
const posStart=parseInt(foundStats.start||0)
const posEnd=parseInt(foundStats.end||0)
const queryResultsCounts=document.querySelectorAll(`span[data-brx-qr-count="${queryId}"]`)
queryResultsCounts.forEach((count)=>{count.innerHTML=qrTotal})
const queryResultsSummaryElement=document.querySelectorAll(`.brxe-query-results-summary[data-brx-qr-stats="${queryId}"]`)
queryResultsSummaryElement.forEach((stats)=>{const statsData=stats.dataset?.brxQrStatsData||false
if(statsData){const statsDataObj=JSON.parse(statsData)
const statsFormat=statsDataObj?.statsFormat||false
const oneResultText=statsDataObj?.oneResultText||false
const noResultsText=statsDataObj?.noResultsText||false
if(qrTotal<1){stats.innerHTML=noResultsText}else if(qrTotal===1){stats.innerHTML=oneResultText}else{let statsText=statsFormat.replace('%start%',posStart).replace('%end%',posEnd).replace('%total%',qrTotal)
stats.innerHTML=statsText}}})}},toggleMapInfoBox:(config)=>{if(!window.google||!window.google.maps)return
const{el:sourceEl,action}=config
if(!sourceEl)return
const addressId=sourceEl.dataset?.brxInfoboxOpen||false
const mapId=sourceEl.dataset?.brxInfoboxMapId||false
if(!addressId||!mapId)return
const googleMapInstance=window.bricksData.googleMapInstances[mapId]
if(!googleMapInstance)return
const location=googleMapInstance.locations.find((loc)=>loc.id===addressId)
if(!location||!location.marker)return
const{infoBox}=location
if(action==='openAddress'){if(!infoBox||!infoBox?.div_){google.maps.event.trigger(location.marker,'click')}}else{if(infoBox&&infoBox?.div_){google.maps.event.trigger(infoBox,'closeclick')
infoBox.close()}}},closeAllSubmenus:(element)=>{let openSubmenu=element.closest('.open')
let multilevel=element.closest('.brx-has-multilevel')
if(openSubmenu&&!multilevel){let toggle=openSubmenu.querySelector('.brx-submenu-toggle button[aria-expanded]')
if(toggle){bricksSubmenuToggle(toggle,'remove')
if(toggle){toggle.focus()}}}
else{let openSubmenuToggles=bricksQuerySelectorAll(document,'.brx-submenu-toggle > button[aria-expanded="true"]')
openSubmenuToggles.forEach((toggle)=>{if(toggle){bricksSubmenuToggle(toggle,'remove')}})}}}
class BricksFunction{_customRun=null
_customEachElement=null
_customListenerHandler=null
_customAddEventListeners=null
_settings={}
_initializedElements=new Set()
constructor(options){const defaultSettings={parentNode:document,selector:'',subscribeEvents:['bricks/ajax/pagination/completed','bricks/ajax/load_page/completed','bricks/ajax/popup/loaded','bricks/ajax/query_result/displayed'],subscribejQueryEvents:[],forceReinit:false,frontEndOnly:false,windowVariableCheck:[],additionalActions:[]}
Object.assign(defaultSettings,options)
this._settings=defaultSettings
this._customRun=options?.run??null
this._customEachElement=options?.eachElement??null
this._customListenerHandler=options?.listenerHandler??null
this._customAddEventListeners=options?.addEventListeners??null
this.cleanUpInitElements=this.cleanUpInitElements.bind(this)
this.run=this.run.bind(this)
this.eachElement=this.eachElement.bind(this)
this.listenerHandler=this.listenerHandler.bind(this)
this.addEventListeners=this.addEventListeners.bind(this)
document.addEventListener('DOMContentLoaded',()=>{this.addEventListeners()
if(this._settings.additionalActions.length){for(const action of this._settings.additionalActions){if(typeof action==='function'){action.call(this)}}}})
if(!window.bricksFunctions){window.bricksFunctions=[]}
window.bricksFunctions.push(this)}
functionCanRun(){if(this._settings.frontEndOnly){if(!document.body.classList.contains('bricks-is-frontend')){return false}}
if(this._settings.windowVariableCheck.length){for(const variable of this._settings.windowVariableCheck){const variableParts=variable.split('.')
let variableValue=window
for(const variablePart of variableParts){if(variableValue.hasOwnProperty(variablePart)){variableValue=variableValue[variablePart]}else{variableValue=false
break}}
if(!variableValue){return false}}}
return true}
cleanUpInitElements(){for(const element of this._initializedElements){if(!element.isConnected){this._initializedElements.delete(element)}}}
eachElement(element){if(this._customEachElement&&typeof this._customEachElement==='function'){this._customEachElement.call(this,element)
return}}
run(customSettings){if(!this.functionCanRun()){return}
this.cleanUpInitElements()
if(this._customRun&&typeof this._customRun==='function'){this._customRun.call(this,customSettings)
return}
const currentSettings=Object.assign({},this._settings)
if(customSettings){Object.keys(customSettings).forEach((key)=>{if(currentSettings.hasOwnProperty(key)){currentSettings[key]=customSettings[key]}})}
const elementInstances=bricksQuerySelectorAll(currentSettings.parentNode,currentSettings.selector)
if(!elementInstances.length){return}
elementInstances.forEach((element,index)=>{if(currentSettings.forceReinit){const reinit=typeof currentSettings.forceReinit==='function'?currentSettings.forceReinit.call(this,element,index):currentSettings.forceReinit
if(reinit){this.eachElement(element,index)
return}}
if(!this._initializedElements.has(element)){this._initializedElements.add(element)
this.eachElement(element,index)}else{const elementFromSet=Array.from(this._initializedElements).find((el)=>el===element)
if(!elementFromSet.isConnected){this._initializedElements.delete(elementFromSet)
this._initializedElements.add(element,index)
this.eachElement(element,index)}}})}
listenerHandler(event){if(this._customListenerHandler&&typeof this._customListenerHandler==='function'){this._customListenerHandler.call(this,event)
return}
if(event?.type){switch(event.type){default:this.run()
break}}}
addEventListeners(){if(!this.functionCanRun()){return}
if(this._customAddEventListeners&&typeof this._customAddEventListeners==='function'){this._customAddEventListeners.call(this)
return}
if(this._settings.subscribeEvents.length){bricksUtils.subscribeEvents(document,this._settings.subscribeEvents,this.listenerHandler)}
if(this._settings.subscribejQueryEvents.length){bricksUtils.subscribejQueryEvents(document,this._settings.subscribejQueryEvents,this.listenerHandler)}}}
const bricksLazyLoadFn=new BricksFunction({parentNode:document,selector:'.bricks-lazy-hidden',subscribejQueryEvents:['updated_cart_totals'],eachElement:(el)=>{let lazyLoad=(el)=>{el.classList.add('wait')
if(el.dataset.src){el.src=el.dataset.src
delete el.dataset.src
if(el.closest('.bricks-masonry')){let isotopeId=el.closest('.bricks-masonry').getAttribute('data-script-id')??false
if(isotopeId){el.addEventListener('load',()=>{bricksUtils.updateIsotopeInstance(isotopeId)})}}}
if(el.dataset.sizes){el.sizes=el.dataset.sizes
delete el.dataset.sizes}
if(el.dataset.srcset){el.srcset=el.dataset.srcset
delete el.dataset.srcset}
if(el.dataset.style){let style=el.getAttribute('style')||''
style+=el.dataset.style
el.setAttribute('style',style)
if(!el.classList.contains('splide__slide')){delete el.dataset.style}}
el.classList.remove('bricks-lazy-hidden')
el.classList.remove('wait')
if(el.classList.contains('bricks-lazy-load-isotope')){bricksIsotope()}}
const rootMargin=window.bricksData.offsetLazyLoad||300
new BricksIntersect({element:el,callback:(el)=>{lazyLoad(el)},rootMargin:`${rootMargin}px`})},listenerHandler:(event)=>{setTimeout(()=>{bricksLazyLoadFn.run()},100)}})
function bricksLazyLoad(){bricksLazyLoadFn.run()}
const bricksAnimationFn=new BricksFunction({parentNode:document,selector:'.brx-animated',removeAfterMs:3000,eachElement:(el)=>{new BricksIntersect({element:el,callback:(el)=>{let animation=el.dataset.animation
if(animation){el.classList.add(`brx-animate-${animation}`)
el.removeAttribute('data-animation')
el.addEventListener('animationend',()=>{el.classList.remove(`brx-animate-${animation}`)
if(el.classList.contains('brx-popup-content')&&animation.includes('Out')){const popupNode=el.closest('.brx-popup')
if(popupNode){bricksClosePopup(popupNode)}}
const animationId=el.dataset?.animationId
el.style.animationDuration=''
if(animationId){const bricksAnimationEvent=new CustomEvent(`bricks/animation/end/${animationId}`,{detail:{el}})
document.dispatchEvent(bricksAnimationEvent)}},{once:true})}}})},run:(customSettings)=>{const self=bricksAnimationFn
const elementsToAnimate=customSettings?.elementsToAnimate||bricksQuerySelectorAll(self._settings.parentNode,self._settings.selector)
self.removeAfterMs=customSettings?.removeAfterMs||self.removeAfterMs
elementsToAnimate.forEach((el)=>{self.eachElement(el)})}})
function bricksAnimation(){bricksAnimationFn.run()}
const bricksInitQueryLoopInstancesFn=new BricksFunction({parentNode:document,selector:'.brx-query-trail',subscribeEvents:['bricks/ajax/load_page/completed'],eachElement:(el)=>{const observerMargin=el.dataset?.observerMargin||'1px'
const observerDelay=el.dataset?.observerDelay||0
const componentId=el.dataset?.queryComponentId||false
const queryElementId=el.dataset?.queryElementId
const queryVars=el.dataset?.queryVars
const originalQueryVars=el.dataset?.originalQueryVars||'[]'
const isPostsElement=el.classList.contains('bricks-isotope-sizer')
const isInfiniteScroll=el.classList.contains('brx-infinite-scroll')
const ajaxLoader=el.dataset?.brxAjaxLoader
const isLiveSearch=el.dataset?.brxLiveSearch
const disableUrlParams=el.dataset?.brxDisableUrlParams
const loopMarker=document.querySelector(`[data-brx-loop-start="${queryElementId}"]`)
if(!loopMarker){el.insertAdjacentHTML('beforebegin',`<!--brx-loop-start-${queryElementId}-->`)}else{loopMarker?.insertAdjacentHTML('beforebegin',`<!--brx-loop-start-${queryElementId}-->`)
loopMarker.removeAttribute('data-brx-loop-start')}
let resultsContainer=loopMarker?.parentNode||el.parentNode
window.bricksData.queryLoopInstances[queryElementId]={componentId:componentId,start:el.dataset.start,end:el.dataset.end,page:el.dataset.page,maxPages:el.dataset.maxPages,queryVars,originalQueryVars,observerMargin,observerDelay,infiniteScroll:isInfiniteScroll,isPostsElement:isPostsElement,ajaxLoader,isLiveSearch,disableUrlParams,resultsContainer,xhr:null,xhrAborted:false}
let selectorId=componentId?componentId:queryElementId
if(selectorId.includes('-')){selectorId=selectorId.split('-')[0]}
let queryTrail=isPostsElement?el.previousElementSibling:Array.from(resultsContainer.querySelectorAll(`.brxe-${selectorId}:not(.brx-popup)`)).pop()
el.removeAttribute('data-query-vars')
el.removeAttribute('data-original-query-vars')
if(!isPostsElement){el.remove()}
if(queryTrail&&isInfiniteScroll){queryTrail.dataset.queryElementId=queryElementId
new BricksIntersect({element:queryTrail,callback:(el)=>bricksQueryLoadPage(el),once:1,rootMargin:observerMargin})}}})
function bricksInitQueryLoopInstances(){bricksInitQueryLoopInstancesFn.run()}
function bricksAjaxLoader(){const getLoaderHTML=(animation)=>{let html=''
switch(animation){case'default':html='<div class="brx-loading-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>'
break
case'ellipsis':html='<div class="brx-loading-ellipsis"><div></div><div></div><div></div><div></div></div>'
break
case'ring':html='<div class="brx-loading-ring"><div></div><div></div><div></div><div></div></div>'
break
case'dual-ring':html='<div class="brx-loading-dual-ring"></div>'
break
case'facebook':html='<div class="brx-loading-facebook"><div></div><div></div><div></div></div>'
break
case'roller':html='<div class="brx-loading-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>'
break
case'ripple':html='<div class="brx-loading-ripple"><div></div><div></div></div>'
break
case'spinner':html='<div class="brx-loading-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>'
break}
return html}
document.addEventListener('bricks/ajax/start',(event)=>{const queryId=event.detail.queryId||false
if(!queryId){return}
const queryLoopConfig=window.bricksData.queryLoopInstances[queryId]||false
if(!queryLoopConfig){return}
const ajaxLoader=JSON.parse(queryLoopConfig?.ajaxLoader||false)
const loaderAnimation=ajaxLoader?.animation||false
if(!loaderAnimation){return}
let targetElement=ajaxLoader?.selector?document.querySelector(ajaxLoader.selector):false
if(!targetElement){targetElement=Array.from(queryLoopConfig.resultsContainer?.querySelectorAll(`.brxe-${queryId}:not(.brx-popup)`)).pop()??queryLoopConfig.resultsContainer}
if(targetElement){let nodeName=targetElement.nodeName.toLowerCase()
let loadingHTML=document.createElement(nodeName)
loadingHTML.classList.add('brx-loading-animation')
loadingHTML.dataset.ajaxLoaderQueryId=queryId
if(ajaxLoader?.color){loadingHTML.style.setProperty('--brx-loader-color',ajaxLoader.color)}
if(ajaxLoader?.scale){loadingHTML.style.transform=`scale(${ajaxLoader.scale})`}
loadingHTML.innerHTML=getLoaderHTML(loaderAnimation)
targetElement.insertAdjacentElement(ajaxLoader?.selector?'beforeend':'afterend',loadingHTML)}})
document.addEventListener('bricks/ajax/end',(event)=>{const loadingAnimations=event?.detail?.queryId?document.querySelectorAll(`.brx-loading-animation[data-ajax-loader-query-id="${event.detail.queryId}"]`):[]
loadingAnimations.forEach((el)=>el.remove())})
document.addEventListener('bricks/ajax/popup/start',(event)=>{const popupElement=event.detail.popupElement||false
if(!popupElement){return}
const ajaxLoader=JSON.parse(popupElement.dataset?.brxAjaxLoader||false)
const loaderAnimation=ajaxLoader?.animation||false
if(!loaderAnimation){return}
let targetElement=ajaxLoader?.selector?document.querySelector(ajaxLoader.selector):false
if(!targetElement){targetElement=popupElement.querySelector('.brx-popup-content')}
if(targetElement){let nodeName=targetElement.nodeName.toLowerCase()
let loadingHTML=document.createElement(nodeName)
loadingHTML.classList.add('brx-loading-animation')
loadingHTML.dataset.ajaxLoaderPopupId=popupElement.dataset.popupId
if(ajaxLoader?.color){loadingHTML.style.setProperty('--brx-loader-color',ajaxLoader.color)}
if(ajaxLoader?.scale){loadingHTML.style.transform=`scale(${ajaxLoader.scale})`}
loadingHTML.innerHTML=getLoaderHTML(loaderAnimation)
targetElement.insertAdjacentElement('afterbegin',loadingHTML)}})
document.addEventListener('bricks/ajax/popup/end',(event)=>{const loadingAnimations=event?.detail?.popupId?document.querySelectorAll(`.brx-loading-animation[data-ajax-loader-popup-id="${event.detail.popupId}"]`):[]
loadingAnimations.forEach((el)=>el.remove())})}
function bricksQueryLoadPage(el,noDelay=false,nonceRefreshed=false){return new Promise(function(resolve,reject){const queryElementId=el.dataset.queryElementId
const queryInfo=window.bricksData.queryLoopInstances?.[queryElementId]
if(!queryInfo||(queryInfo?.isLoading&&!nonceRefreshed)){return}
const componentId=queryInfo?.componentId||false
let page=parseInt(queryInfo.page||1)+1
const maxPages=parseInt(queryInfo.maxPages||1)
if(page>maxPages){resolve({page,maxPages})
return}
let url=window.bricksData.restApiUrl.concat('load_query_page')
let queryData={postId:window.bricksData.postId,queryElementId:queryElementId,componentId:componentId,queryVars:queryInfo.queryVars,page:page,nonce:window.bricksData.nonce,lang:window.bricksData.language||false,mainQueryId:window.bricksData.mainQueryId||false}
if(window.bricksData.useQueryFilter==='1'&&typeof window.bricksUtils.getFiltersForQuery==='function'&&typeof window.bricksUtils.getSelectedFiltersForQuery==='function'){let filterIds=[]
if(window.bricksData.filterInstances&&Object.keys(window.bricksData.filterInstances).length>0){const filterIntances=Object.values(window.bricksData.filterInstances).filter((filter)=>{return filter.targetQueryId===queryElementId})
filterIds=filterIntances.map((filter)=>filter.filterId)}
if(filterIds.length){let allFilters=window.bricksUtils.getFiltersForQuery(queryElementId,'filterId')
let selectedFilters=window.bricksUtils.getSelectedFiltersForQuery(queryElementId)
let afTags=window.bricksUtils.getDynamicTagsForParse(queryElementId)
let originalQueryVars=queryInfo?.originalQueryVars==='[]'?queryInfo?.queryVars:queryInfo?.originalQueryVars
queryData={postId:window.bricksData.postId,queryElementId:queryElementId,originalQueryVars:originalQueryVars,pageFilters:window.bricksData.pageFilters||false,filters:allFilters,infinitePage:page,selectedFilters:selectedFilters,afTags:afTags,nonce:window.bricksData.nonce,baseUrl:window.bricksData.baseUrl,lang:window.bricksData.language||false,mainQueryId:window.bricksData.mainQueryId||false}
url=window.bricksData.restApiUrl.concat('query_result')}}
window.bricksData.queryLoopInstances[queryElementId].isLoading=1
if(!nonceRefreshed){document.dispatchEvent(new CustomEvent('bricks/ajax/start',{detail:{queryId:queryElementId}}))}
if(window.bricksData.multilangPlugin==='wpml'&&(window.location.search.includes('lang=')||window.bricksData.wpmlUrlFormat!=3)){url=url.concat('?lang='+window.bricksData.language)}
let xhr=new XMLHttpRequest()
xhr.open('POST',url,true)
xhr.setRequestHeader('Content-Type','application/json; charset=UTF-8')
xhr.setRequestHeader('X-WP-Nonce',window.bricksData.wpRestNonce)
xhr.onreadystatechange=function(){if(xhr.readyState===XMLHttpRequest.DONE){let status=xhr.status
let res
try{res=JSON.parse(xhr.response)}catch(e){res=null}
if(status===0||(status>=200&&status<400)){let html=res?.html||false
const styles=res?.styles||false
const popups=res?.popups||false
const updatedQuery=res?.updated_query||false
if(html){html=html.replace(/<!--brx-loop-start-.*?-->/g,'')
el.insertAdjacentHTML('afterend',html)}
if(popups){document.body.insertAdjacentHTML('beforeend',popups)}
document.dispatchEvent(new CustomEvent('bricks/ajax/nodes_added',{detail:{queryId:queryElementId}}))
if(styles){document.body.insertAdjacentHTML('beforeend',styles)}
if(updatedQuery){updatedQuery.start=parseInt(queryInfo.start)
bricksUtils.updateQueryResultStats(queryElementId,'query',updatedQuery)}
window.bricksData.queryLoopInstances[queryElementId].page=page}else if(status===403&&res?.code==='rest_cookie_invalid_nonce'&&!nonceRefreshed){bricksRegenerateNonceAndRetryQueryLoadPage(el).then(resolve).catch(reject)
return}else{console.error(`Request failed with status ${status}`)}
window.bricksData.queryLoopInstances[queryElementId].isLoading=0
resolve({page,maxPages})
bricksUtils.hideOrShowLoadMoreButtons(queryElementId)
document.dispatchEvent(new CustomEvent('bricks/ajax/end',{detail:{queryId:queryElementId}}))
setTimeout(()=>{let newQueryTrail=componentId&&!queryInfo.isPostsElement?Array.from(queryInfo.resultsContainer?.querySelectorAll(`.brxe-${componentId}:not(.brx-popup)`)).pop():Array.from(queryInfo.resultsContainer?.querySelectorAll(`.brxe-${queryElementId}:not(.brx-popup)`)).pop()
document.dispatchEvent(new CustomEvent('bricks/ajax/load_page/completed',{detail:{queryTrailElement:newQueryTrail,queryId:queryElementId}}))
if(queryInfo.infiniteScroll){newQueryTrail.dataset.queryElementId=queryElementId
if(BricksIsInViewport(newQueryTrail)){bricksQueryLoadPage(newQueryTrail)}
else{new BricksIntersect({element:newQueryTrail,callback:(el)=>bricksQueryLoadPage(el),once:true,rootMargin:queryInfo.observerMargin})}}},250)}}
if(noDelay){xhr.send(JSON.stringify(queryData))}else{setTimeout(()=>{xhr.send(JSON.stringify(queryData))},parseInt(queryInfo.observerDelay))}})}
function bricksRegenerateNonceAndRetryQueryLoadPage(el){return new Promise((resolve,reject)=>{let xhrNonce=new XMLHttpRequest()
xhrNonce.open('POST',window.bricksData.ajaxUrl,true)
xhrNonce.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
xhrNonce.onreadystatechange=function(){if(xhrNonce.readyState===XMLHttpRequest.DONE){if(xhrNonce.status>=200&&xhrNonce.status<400){let response
try{response=JSON.parse(xhrNonce.responseText)}catch(e){reject('Invalid response from server when regenerating nonce')
return}
if(response.success&&response.data){window.bricksData.nonce=response.data.bricks_nonce
window.bricksData.wpRestNonce=response.data.rest_nonce
bricksQueryLoadPage(el,true,true).then(resolve).catch(reject)}else{reject('Failed to regenerate nonces: Invalid response structure')}}else{reject('Failed to regenerate nonce')}}}
xhrNonce.send('action=bricks_regenerate_query_nonce')})}
const bricksQueryPaginationFn=new BricksFunction({parentNode:document,selector:'.brx-ajax-pagination a',subscribeEvents:['bricks/ajax/pagination/completed','bricks/ajax/query_result/displayed'],eachElement:(el)=>{const isAjaxPagination=(el)=>{let isAjax=true
if(!window.bricksData.useQueryFilter||typeof window.bricksUtils.getFiltersForQuery!=='function'){return isAjax}
const paginationElement=el.closest('.brx-ajax-pagination')
const queryId=paginationElement?.dataset?.queryElementId||false
if(queryId){let allFilters=bricksUtils.getFiltersForQuery(queryId)
allFilters=allFilters.filter((filter)=>{return filter.filterType!=='pagination'})
if(allFilters.length>0){isAjax=false}}
return isAjax}
if(!el.dataset?.ajaxPagination){el.dataset.ajaxPagination=1
el.addEventListener('click',function(e){const targetEl=e.currentTarget
const href=targetEl.getAttribute('href')
const targetPaginationEl=targetEl.closest('.brx-ajax-pagination')
const queryId=targetPaginationEl?.dataset?.queryElementId
if(!isAjaxPagination(targetPaginationEl)){return}
let clickedPageNumber=parseInt(bricksUtils.getPageNumberFromUrl(href))
if(clickedPageNumber<1){return}
e.preventDefault()
bricksAjaxPagination(targetEl,queryId,clickedPageNumber)})}}})
function bricksAjaxPagination(targetEl,queryId,clickedPageNumber,nonceRefreshed=false){return new Promise((resolve,reject)=>{if(!queryId){reject('Query ID is missing')
return}
const href=targetEl.getAttribute('href')
const queryInstance=window.bricksData.queryLoopInstances[queryId]||false
const targetPaginationEl=targetEl.closest('.brx-ajax-pagination')
const queryComponentId=queryInstance?.componentId||false
const resultsContainer=queryInstance?.resultsContainer||false
if(!queryInstance||!resultsContainer){reject('Query instance not found')
return}
let url=window.bricksData.restApiUrl.concat('load_query_page')
let queryData={postId:window.bricksData.postId,queryElementId:queryId,componentId:queryInstance.componentId||false,queryVars:queryInstance.queryVars,page:clickedPageNumber,nonce:window.bricksData.nonce,paginationId:targetPaginationEl.dataset.paginationId,baseUrl:window.bricksData.baseUrl,lang:window.bricksData.language||false,mainQueryId:window.bricksData.mainQueryId||false}
if(!nonceRefreshed){document.dispatchEvent(new CustomEvent('bricks/ajax/start',{detail:{queryId}}))}
if(window.bricksData.multilangPlugin==='wpml'&&(window.location.search.includes('lang=')||window.bricksData.wpmlUrlFormat!=3)){url=url.concat('?lang='+window.bricksData.language)}
let xhr=new XMLHttpRequest()
xhr.open('POST',url,true)
xhr.setRequestHeader('Content-Type','application/json; charset=UTF-8')
xhr.setRequestHeader('X-WP-Nonce',window.bricksData.wpRestNonce)
xhr.onreadystatechange=function(){if(this.readyState===XMLHttpRequest.DONE){let status=this.status
let res
try{res=JSON.parse(xhr.response)}catch(e){res=null}
if(status===0||(status>=200&&status<400)){const html=res?.html||false
const styles=res?.styles||false
const popups=res?.popups||false
const pagination=res?.pagination||false
const updatedQuery=res?.updated_query||false
let selectorId=queryComponentId?queryComponentId:queryId
if(selectorId.includes('-')){selectorId=selectorId.split('-')[0]}
const gutterSizer=resultsContainer.querySelector('.bricks-gutter-sizer')
const isotopSizer=resultsContainer.querySelector('.bricks-isotope-sizer')
const actualLoopDOM=resultsContainer.querySelectorAll(`.brxe-${selectorId}, .bricks-posts-nothing-found`)
const loopStartComment=document.createNodeIterator(resultsContainer,NodeFilter.SHOW_COMMENT,{acceptNode:function(node){return node.nodeValue===`brx-loop-start-${queryId}`}}).nextNode()
const hasOldResults=actualLoopDOM.length>0||loopStartComment
if(hasOldResults){resultsContainer.querySelectorAll(`.brxe-${selectorId}, .bricks-posts-nothing-found`).forEach((el)=>el.remove())}
if(html){if(hasOldResults){if(loopStartComment){const firstTag=html.match(/<\s*([a-z0-9]+)([^>]+)?>/i)
let tempDiv=null
if(firstTag&&(firstTag[1]==='td'||firstTag[1]==='tr')){tempDiv=document.createElement('tbody')}else{tempDiv=document.createElement('div')}
tempDiv.innerHTML=html
let newNodes=Array.from(tempDiv.childNodes)
newNodes.reverse()
newNodes.forEach((node)=>{if(loopStartComment.nextSibling){loopStartComment.parentNode?.insertBefore(node,loopStartComment.nextSibling)}else{loopStartComment.parentNode?.appendChild(node)}})
tempDiv.remove()}}else{resultsContainer.insertAdjacentHTML('beforeend',html)}}
if(gutterSizer){resultsContainer.appendChild(gutterSizer)}
if(isotopSizer){resultsContainer.appendChild(isotopSizer)}
const oldLoopPopupNodes=document.querySelectorAll(`.brx-popup[data-popup-loop="${queryId}"]`)
oldLoopPopupNodes.forEach((el)=>el.remove())
if(popups){document.body.insertAdjacentHTML('beforeend',popups)}
if(pagination){const parser=new DOMParser()
const doc=parser.parseFromString(pagination,'text/html')
const newPagination=doc.querySelector('.bricks-pagination')
if(newPagination){targetPaginationEl.innerHTML=''
targetPaginationEl.appendChild(newPagination)}}
document.dispatchEvent(new CustomEvent('bricks/ajax/nodes_added',{detail:{queryId:queryId}}))
if(styles){let styleElement=document.querySelector(`#brx-query-styles-${queryId}`)
if(!styleElement){styleElement=document.createElement('style')
styleElement.id=`brx-query-styles-${queryId}`document.body.appendChild(styleElement)}
styleElement.innerHTML=styles}
if(updatedQuery){if(updatedQuery?.start!==undefined){window.bricksData.queryLoopInstances[queryId].start=parseInt(updatedQuery.start)}
bricksUtils.updateQueryResultStats(queryId,'query',updatedQuery)}
window.bricksData.queryLoopInstances[queryId].page=clickedPageNumber
window.history.pushState({},'',href)}else if(status===403&&res?.code==='rest_cookie_invalid_nonce'&&!nonceRefreshed){bricksRegenerateNonceAndRetryAjaxPagination(targetEl,queryId,clickedPageNumber).then(resolve).catch(reject)
return}else{console.error(`Request failed with status ${status}`)}
resolve()
document.dispatchEvent(new CustomEvent('bricks/ajax/end',{detail:{queryId}}))
document.dispatchEvent(new CustomEvent('bricks/ajax/pagination/completed',{detail:{queryId}}))
bricksUtils.hideOrShowLoadMoreButtons(queryId)}}
xhr.send(JSON.stringify(queryData))})}
function bricksRegenerateNonceAndRetryAjaxPagination(targetEl,queryId,clickedPageNumber){return new Promise((resolve,reject)=>{let xhrNonce=new XMLHttpRequest()
xhrNonce.open('POST',window.bricksData.ajaxUrl,true)
xhrNonce.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
xhrNonce.onreadystatechange=function(){if(xhrNonce.readyState===XMLHttpRequest.DONE){if(xhrNonce.status>=200&&xhrNonce.status<400){let response
try{response=JSON.parse(xhrNonce.responseText)}catch(e){reject('Invalid response from server when regenerating nonce')
return}
if(response.success&&response.data){window.bricksData.nonce=response.data.bricks_nonce
window.bricksData.wpRestNonce=response.data.rest_nonce
bricksAjaxPagination(targetEl,queryId,clickedPageNumber,true).then(resolve).catch(reject)}else{reject('Failed to regenerate nonces: Invalid response structure')}}else{reject('Failed to regenerate nonce')}}}
xhrNonce.send('action=bricks_regenerate_query_nonce')})}
function bricksQueryPagination(){bricksQueryPaginationFn.run()}
function bricksStickyHeader(){let stickyHeaderEl=document.querySelector('#brx-header.sticky')
if(!stickyHeaderEl){return}
let logo=document.querySelector('.bricks-site-logo')
let logoDefault
let logoInverse
let lastScrolled=-1
let headerSlideUpAfter=stickyHeaderEl.hasAttribute('data-slide-up-after')?stickyHeaderEl.getAttribute('data-slide-up-after'):0
if(logo){logoDefault=logo.getAttribute('data-bricks-logo')
logoInverse=logo.getAttribute('data-bricks-logo-inverse')}
const bricksStickyHeaderOnScroll=()=>{if(document.body.classList.contains('no-scroll')){return}
let scrolled=window.scrollY
if(scrolled>0){stickyHeaderEl.classList.add('scrolling')
if(logo&&logoInverse&&logo.src!==logoInverse){logo.src=logoInverse
logo.srcset=''}}else{stickyHeaderEl.classList.remove('scrolling')
if(logo&&logoDefault&&logo.src!==logoDefault){logo.src=logoDefault}}
if(headerSlideUpAfter&&!document.querySelector('.bricks-search-overlay.show')){if(scrolled>lastScrolled&&lastScrolled>=0){if(scrolled>headerSlideUpAfter){if(!stickyHeaderEl.classList.contains('slide-up')){stickyHeaderEl.classList.add('sliding')}
stickyHeaderEl.classList.add('slide-up')}}else{if(stickyHeaderEl.classList.contains('slide-up')){stickyHeaderEl.classList.add('sliding')}
stickyHeaderEl.classList.remove('slide-up')}}
lastScrolled=scrolled}
stickyHeaderEl.addEventListener('transitionend',(e)=>{if(e.propertyName==='transform'){stickyHeaderEl.classList.remove('sliding')}})
window.addEventListener('scroll',bricksStickyHeaderOnScroll)
bricksStickyHeaderOnScroll()}
function bricksOnePageNavigation(){let onePageNavigationWrapper=document.getElementById('bricks-one-page-navigation')
if(!bricksIsFrontend||!onePageNavigationWrapper){return}
let rootElements=bricksQuerySelectorAll(document,'#brx-content > *')
let elementIds=[]
let elementId=''
let onePageLink=''
let onePageItem=''
if(!rootElements){return}
rootElements.forEach((element)=>{elementId=element.getAttribute('id')
if(!elementId){return}
elementIds.push(elementId)
onePageItem=document.createElement('li')
onePageLink=document.createElement('a')
onePageLink.classList.add(`bricks-one-page-${elementId}`)
onePageLink.setAttribute('href',`#${elementId}`)
onePageItem.appendChild(onePageLink)
onePageNavigationWrapper.appendChild(onePageItem)})
function onePageScroll(){let scrolled=window.scrollY
elementIds.forEach((elementId)=>{let element=document.getElementById(elementId)
let elementTop=element.offsetTop
let elementBottom=elementTop+element.offsetHeight
if(scrolled>=elementTop-1&&scrolled<elementBottom-1){document.querySelector(`.bricks-one-page-${elementId}`).classList.add('active')}else{document.querySelector(`.bricks-one-page-${elementId}`).classList.remove('active')}})}
window.addEventListener('load',onePageScroll)
window.addEventListener('resize',onePageScroll)
document.addEventListener('scroll',onePageScroll)}
function bricksSearchToggle(){let searchElements=bricksQuerySelectorAll(document,'.brxe-search')
searchElements.forEach((searchElement)=>{let toggle=searchElement.querySelector('.toggle')
let overlay=searchElement.querySelector('.bricks-search-overlay')
if(!toggle||!overlay){return}
let searchInputOrIcon=overlay.previousElementSibling
document.addEventListener('keyup',(e)=>{if(e.key==='Escape'){let overlayStyles=window.getComputedStyle(overlay)
if(overlayStyles.visibility==='visible'){overlay.classList.remove('show')
searchInputOrIcon.focus()
searchInputOrIcon.setAttribute('aria-expanded',false)}}})
toggle.addEventListener('click',()=>{overlay.classList.toggle('show')
toggle.setAttribute('aria-expanded',toggle.getAttribute('aria-expanded')==='false')
setTimeout(()=>{searchElement.querySelector('input[type=search]').focus()},200)})
overlay.querySelector('.close').addEventListener('click',()=>{overlay.classList.remove('show')
searchInputOrIcon.focus()
searchInputOrIcon.setAttribute('aria-expanded',false)})})}
const bricksAlertDismissFn=new BricksFunction({parentNode:document,selector:'.brxe-alert svg',eachElement:(dismissable)=>{dismissable.addEventListener('click',()=>{let alertEl=dismissable.closest('.brxe-alert')
alertEl.remove()})}})
function bricksAlertDismiss(){bricksAlertDismissFn.run()}
const bricksTabsFn=new BricksFunction({parentNode:document,selector:'.brxe-tabs, .brxe-tabs-nested',forceReinit:(element,index)=>{return!bricksIsFrontend},eachElement:(tabElement)=>{let hash=window.location.hash
const openTabsOnEvent=tabElement.getAttribute('data-open-on')||'click'
let firstTitle=tabElement.querySelector('.tab-title')
let titles=firstTitle?Array.from(firstTitle.parentNode.children).filter((el)=>el.classList.contains('tab-title')):[]
let firstPane=tabElement.querySelector('.tab-pane')
let panes=firstPane?Array.from(firstPane.parentNode.children).filter((el)=>el.classList.contains('tab-pane')):[]
if(!titles.length||!panes.length){return}
titles.forEach((title,index)=>{title.addEventListener(openTabsOnEvent,()=>{let activeTitle=null
let activePane=null
titles.forEach((t,i)=>{if(i===index){t.classList.add('brx-open')
t.setAttribute('aria-selected','true')
t.setAttribute('tabindex','0')
activeTitle=title}
else{t.classList.remove('brx-open')
t.setAttribute('aria-selected','false')
t.setAttribute('tabindex','-1')}})
panes.forEach((pane,i)=>{if(i===index){pane.classList.add('brx-open')
activePane=pane}
else{pane.classList.remove('brx-open')}})
let anchorId=title?.id&&!title.id.startsWith('brxe-')&&!title.id.startsWith('brx-')?`#${title.id}`:''
if(anchorId){history.replaceState(null,null,anchorId)}else{history.replaceState(null,null,' ')}
document.dispatchEvent(new CustomEvent('bricks/tabs/changed',{detail:{elementId:tabElement.getAttribute('data-script-id'),activeIndex:index,activeTitle,activePane}}))})
title.addEventListener('keydown',(event)=>{let newIndex
if(event.key==='ArrowRight'){newIndex=index+1===titles.length?0:index+1}else if(event.key==='ArrowLeft'){newIndex=index-1<0?titles.length-1:index-1}else if(event.key==='Home'){event.preventDefault()
newIndex=0}else if(event.key==='End'){event.preventDefault()
newIndex=titles.length-1}else{return}
titles[newIndex].focus()
titles[newIndex].click()})})
let activeIndex=tabElement.getAttribute('data-open-tab')||0
if(hash){let tempIndex=titles.findIndex((title)=>title?.id&&!title.id.startsWith('brxe-')&&title.id===hash.replace('#',''))
activeIndex=tempIndex!==-1?tempIndex:0}
if(titles[activeIndex]){titles[activeIndex].classList.add('brx-open')}else{titles[0].classList.add('brx-open')}
if(panes[activeIndex]){panes[activeIndex].classList.add('brx-open')}else{panes[0].classList.add('brx-open')}
titles.forEach((title)=>{if(title.classList.contains('brx-open')){title.setAttribute('aria-selected','true')
title.setAttribute('tabindex','0')}else{title.setAttribute('aria-selected','false')
title.setAttribute('tabindex','-1')}})}})
function bricksTabs(){bricksTabsFn.run()}
const bricksVideoOverlayClickDetectorFn=new BricksFunction({parentNode:document,selector:'.bricks-video-overlay, .bricks-video-overlay-icon, .bricks-video-preview-image',frontEndOnly:true,eachElement:(overlay)=>{const onOverlayAction=(e)=>{let videoWrapper=e.target.closest('.brxe-video')
if(!videoWrapper){return}
const thumbnailPreviewElement=videoWrapper.querySelector('.bricks-video-preview-image')
if(thumbnailPreviewElement){const iframeElement=document.createElement('iframe')
const attributes=[...thumbnailPreviewElement.attributes]
attributes.forEach((attr)=>{if(attr.name==='class'||attr.name==='style'){return}
if(attr.name==='data-iframe-src'){iframeElement.setAttribute('src',attr.value)
return}
iframeElement.setAttribute(attr.name,attr.value)})
thumbnailPreviewElement.replaceWith(iframeElement)}
const iframeElement=videoWrapper.querySelector('iframe')
if(iframeElement&&iframeElement.getAttribute('src')){iframeElement.src+='&autoplay=1'}
if(iframeElement){iframeElement.removeAttribute('tabindex')}
const videoElement=videoWrapper.querySelector('video')
if(videoElement){videoElement.play()
videoElement.removeAttribute('tabindex')
setTimeout(()=>{videoElement.focus()},0)}}
overlay.addEventListener('click',onOverlayAction)
overlay.addEventListener('keydown',(event)=>{if(event.key===' '||event.key==='Enter'){event.preventDefault()
onOverlayAction(event)}})}})
function bricksVideoOverlayClickDetector(){bricksVideoOverlayClickDetectorFn.run()}
const bricksBackgroundVideoInitFn=new BricksFunction({parentNode:document,selector:'.bricks-background-video-wrapper',forceReinit:(element,index)=>{return!bricksIsFrontend},eachElement:(videoWrapper)=>{if(videoWrapper.classList.contains('loaded')){return}
let videoId
let videoUrl=videoWrapper.getAttribute('data-background-video-url')
if(videoUrl&&!videoUrl.includes('http')){const youtubeIdPattern=/^[a-zA-Z0-9_-]{11}$/
const vimeoIdPattern=/^[0-9]{6,10}$/
if(youtubeIdPattern.test(videoUrl)){videoUrl=`https://www.youtube.com/watch?v=${videoUrl}`}
else if(vimeoIdPattern.test(videoUrl)){videoUrl=`https://vimeo.com/${videoUrl}`}}
if(!videoUrl){return}
let videoPlayBreakpoint=parseInt(videoWrapper.getAttribute('data-background-video-show-at-breakpoint'))
if(videoPlayBreakpoint&&window.innerWidth<videoPlayBreakpoint){return}
let videoScale=videoWrapper.getAttribute('data-background-video-scale')
let videoAspectRatio=videoWrapper.getAttribute('data-background-video-ratio')||'16:9'
let videoAspectRatioX=parseInt(videoAspectRatio.split(':')[0]||16)
let videoAspectRatioY=parseInt(videoAspectRatio.split(':')[1]||9)
let startTime=parseInt(videoWrapper.getAttribute('data-background-video-start'))||0
let endTime=parseInt(videoWrapper.getAttribute('data-background-video-end'))||0
let videoLoop=videoWrapper.getAttribute('data-background-video-loop')==1
const posterImageCustom=videoWrapper.getAttribute('data-background-video-poster')
const posterImageYouTubeSize=videoWrapper.getAttribute('data-background-video-poster-yt-size')
if(endTime<startTime){endTime=0}
let isIframe=false
let isYoutube=false
let isVimeo=false
if(videoUrl.indexOf('youtube.com')!==-1||videoUrl.indexOf('youtu.be')!==-1){isIframe=true
isYoutube=true
const videoData=bricksGetYouTubeVideoLinkData(videoUrl)
videoId=videoData.id
videoUrl=videoData.url}
if(videoUrl.indexOf('vimeo.com')!==-1&&videoUrl.indexOf('/progressive_redirect/')===-1){isIframe=true
isVimeo=true
if(videoUrl.indexOf('player.vimeo.com/video')===-1){videoUrl=videoUrl.replace('vimeo.com','player.vimeo.com/video')}}
const getPosterImageElement=()=>{const posterImage=document.createElement('img')
posterImage.classList.add('bricks-video-poster-image')
let hasPosterImage=false
if(isYoutube){if(posterImageYouTubeSize){posterImage.src=`https://img.youtube.com/vi/${videoId}/${posterImageYouTubeSize}.jpg`hasPosterImage=true}
else if(posterImageCustom){posterImage.src=posterImageCustom
hasPosterImage=true}}
if(isVimeo&&posterImageCustom){posterImage.src=posterImageCustom
hasPosterImage=true}
if(!hasPosterImage){return false}
return posterImage}
const removePosterImageElement=()=>{const posterImageElement=videoWrapper.querySelector('.bricks-video-poster-image')
if(posterImageElement){posterImageElement.remove()}}
let videoElement
if(isIframe){if(isYoutube){if(!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')){let tag=document.createElement('script')
if(!bricksIsFrontend&&window.bricksData?.builderCloudflareRocketLoader){tag.setAttribute('data-cfasync','false')}
tag.src='https://www.youtube.com/iframe_api'
let firstScriptTag=document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag,firstScriptTag)}
videoElement=document.createElement('div')
if(bricksIsFrontend&&videoWrapper.querySelector('video')){videoWrapper.removeChild(videoWrapper.querySelector('video'))}
videoWrapper.appendChild(videoElement)
const posterImageElement=getPosterImageElement()
if(posterImageElement){videoWrapper.appendChild(posterImageElement)}
let playerCheckInterval=setInterval(function(){if(window.YT&&YT.Player){clearInterval(playerCheckInterval)
let player=new YT.Player(videoElement,{width:'640',height:'360',videoId:videoId,playerVars:{autoplay:1,controls:0,start:startTime||undefined,mute:1,rel:0,showinfo:0,modestbranding:1,cc_load_policy:0,iv_load_policy:3,autohide:0,loop:0,playlist:videoId,enablejsapi:1},events:{onReady:function(event){if(endTime){let endTimeCheckInterval=setInterval(function(){if(player.getCurrentTime()>=endTime){if(videoLoop){player.seekTo(startTime||0,true)}else{player.pauseVideo()
clearInterval(endTimeCheckInterval)}}},1000)}},onStateChange:function(event){if(videoLoop){if(event.data==YT.PlayerState.ENDED){player.seekTo(startTime||0,true)}}
if(event.data==YT.PlayerState.PLAYING){removePosterImageElement()}}}})}},100)}
if(isVimeo){if(!document.querySelector('script[src="https://player.vimeo.com/api/player.js"]')){let tag=document.createElement('script')
if(!bricksIsFrontend&&window.bricksData?.builderCloudflareRocketLoader){tag.setAttribute('data-cfasync','false')}
tag.src='https://player.vimeo.com/api/player.js'
let firstScriptTag=document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag,firstScriptTag)}
if(bricksIsFrontend&&videoWrapper.querySelector('video')){videoWrapper.removeChild(videoWrapper.querySelector('video'))}
videoElement=document.createElement('div')
const posterImageElement=getPosterImageElement()
if(posterImageElement){videoWrapper.appendChild(posterImageElement)}
videoWrapper.appendChild(videoElement)
const vimeoVideoId=videoUrl.split('/').pop()
let playerCheckInterval=setInterval(function(){if(window.Vimeo&&Vimeo.Player){clearInterval(playerCheckInterval)
let player=new Vimeo.Player(videoElement,{id:vimeoVideoId,width:640,autoplay:true,controls:false,background:true,loop:videoLoop&&!startTime})
if(posterImageElement){player.on('play',function(){removePosterImageElement()})}
if(startTime){player.on('loaded',function(){player.setCurrentTime(startTime)})}
if(endTime){player.on('timeupdate',function(data){if(data.seconds>=endTime){if(videoLoop){player.setCurrentTime(startTime||0)
player.play()}else{player.pause()}}})}
player.on('ended',()=>{if(videoLoop){player.setCurrentTime(startTime||0).then(function(seconds){player.play()})}})}},100)}}
else{videoElement=videoWrapper.querySelector('video')
if(videoElement){let elementId=videoElement.closest('[data-script-id]')?.getAttribute('data-script-id')
if(!videoLoop){videoElement.removeAttribute('loop')}else if(!videoElement.hasAttribute('loop')){videoElement.setAttribute('loop','')}
if(!bricksIsFrontend){videoElement.currentTime=startTime||0}
if(!window.bricksData.videoInstances?.[elementId]){window.bricksData.videoInstances[elementId]={}}
window.bricksData.videoInstances[elementId].startTime=startTime
window.bricksData.videoInstances[elementId].endTime=endTime
window.bricksData.videoInstances[elementId].videoLoop=videoLoop
let loadedmetadata=function(){if(window.bricksData.videoInstances[elementId].startTime){this.currentTime=window.bricksData.videoInstances[elementId].startTime
this.play()}}
let timeupdate=function(){if(this.currentTime>=(window.bricksData.videoInstances[elementId].endTime||this.duration)-0.25){if(window.bricksData.videoInstances[elementId].videoLoop){this.currentTime=window.bricksData.videoInstances[elementId].startTime
if(videoElement.paused){this.play()}}else{this.pause()}}}
let ended=function(){if(window.bricksData.videoInstances[elementId].videoLoop&&window.bricksData.videoInstances[elementId].startTime){this.currentTime=window.bricksData.videoInstances[elementId].startTime
this.play()}}
if(!videoElement.classList.contains('listening')&&(startTime||endTime)){videoElement.classList.add('listening')
videoElement.addEventListener('loadedmetadata',loadedmetadata)
videoElement.addEventListener('timeupdate',timeupdate)
videoElement.addEventListener('ended',ended)}}}
if(videoScale){videoElement.style.transform=`translate(-50%, -50%) scale(${videoScale})`}
if(bricksIsFrontend){if(videoWrapper.classList.contains('bricks-lazy-video')){new BricksIntersect({element:videoWrapper,callback:(el)=>{el.classList.remove('bricks-lazy-video')
if(isIframe){el.appendChild(videoElement)}else{videoElement.src=videoUrl}}})}}else{if(isIframe){videoWrapper.appendChild(videoElement)}else{videoElement.src=videoUrl}}
videoWrapper.classList.add('loaded')
let resizeObserver=new ResizeObserver((entries)=>{for(let entry of entries){let videoWidth
if(entry.contentBoxSize){let contentBoxSize=Array.isArray(entry.contentBoxSize)?entry.contentBoxSize[0]:entry.contentBoxSize
videoWidth=contentBoxSize.inlineSize}else{videoWidth=entry.contentRect.width}
let elementHeight=videoWrapper.clientHeight
let videoHeight=(videoWidth*videoAspectRatioY)/ videoAspectRatioX
if(videoHeight<elementHeight){videoHeight=elementHeight
videoWidth=(elementHeight*videoAspectRatioX)/ videoAspectRatioY}
videoElement.style.width=`${videoWidth}px`videoElement.style.height=`${videoHeight}px`}})
resizeObserver.observe(videoWrapper)}})
function bricksBackgroundVideoInit(){bricksBackgroundVideoInitFn.run()}
const bricksPhotoswipeFn=new BricksFunction({parentNode:document,selector:'.bricks-lightbox',windowVariableCheck:['PhotoSwipeLightbox'],eachElement:(lightboxElement)=>{let gallery=lightboxElement
let children=lightboxElement.tagName==='A'?'':'a'
let lightboxId=lightboxElement.getAttribute('data-pswp-id')||lightboxElement.getAttribute('data-lightbox-id')
let animationType=lightboxElement.getAttribute('data-animation-type')||'zoom'
if(lightboxId){children=bricksQuerySelectorAll(document,`[data-pswp-id="${lightboxId}"]`)}
let closeSVG='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
let options={mainClass:'brx',gallery:gallery,counter:!gallery.classList.contains('brxe-carousel'),children:children,pswpModule:PhotoSwipe5,closeSVG:closeSVG,showHideAnimationType:animationType}
let thumbnailElement=null
let paddingElement=null
let captionElement=null
if(lightboxId){children.forEach((child)=>{if(child.classList.contains('has-lightbox-thumbnails')){thumbnailElement=child}else{let parent=child.closest('.has-lightbox-thumbnails')
if(parent){thumbnailElement=parent}}
if(child.getAttribute('data-lightbox-padding')){paddingElement=child}else{let parent=child.closest('[data-lightbox-padding]')
if(parent){paddingElement=parent}}
if(child.classList.contains('has-lightbox-caption')){captionElement=child}else{let parent=child.closest('.has-lightbox-caption')
if(parent){captionElement=parent}}})}
else if(lightboxElement.classList.contains('has-lightbox-thumbnails')){thumbnailElement=lightboxElement}
let padding=(thumbnailElement||paddingElement||lightboxElement).getAttribute('data-lightbox-padding')
if(padding){options.padding=JSON.parse(padding)}
let imageClickAction=lightboxElement.getAttribute('data-lightbox-image-click')
if(imageClickAction){options.imageClickAction=imageClickAction}
const lightbox=new PhotoSwipeLightbox(options)
if(animationType==='none'){lightbox.addFilter('useContentPlaceholder',(useContentPlaceholder,content)=>{return false})}
if(typeof PhotoSwipeDynamicCaption!=='undefined'&&(captionElement||lightboxElement).classList.contains('has-lightbox-caption')){let lightboxCaption=new PhotoSwipeDynamicCaption(lightbox,{type:'below',captionContent:(slide)=>{return slide.data.element.getAttribute('data-lightbox-caption')}})}
if(thumbnailElement){lightbox.on('uiRegister',function(){lightbox.pswp.ui.registerElement({name:'thumbnail-navigation',className:'pswp__thumbnail-nav-wrapper',appendTo:'wrapper',onInit:(el,pswp)=>{const thumbnailNav=document.createElement('div')
thumbnailNav.className='pswp__thumbnail-nav'
let lightboxImageNodes=[]
if(lightboxId){lightboxImageNodes=bricksQuerySelectorAll(document,`[data-pswp-id="${lightboxId}"][data-pswp-src]`)}
else{lightboxImageNodes=lightboxElement.querySelectorAll('a[data-pswp-src]')}
let lightboxImageUrls=[]
lightboxImageNodes.forEach((item)=>{if(item.parentNode.classList.contains('swiper-slide-duplicate')){return}
let src=item.getAttribute('href')
if(src&&!lightboxImageUrls.includes(src)){lightboxImageUrls.push(src)}})
lightboxImageUrls.forEach((url,index)=>{const thumbImg=document.createElement('img')
thumbImg.src=url
thumbImg.dataset.index=index
let thumbnailSize=thumbnailElement.getAttribute('data-lightbox-thumbnail-size')
if(thumbnailSize){thumbImg.style.width=isNaN(thumbnailSize)?thumbnailSize:thumbnailSize+'px'}
thumbnailNav.appendChild(thumbImg)})
el.appendChild(thumbnailNav)
thumbnailNav.addEventListener('click',(e)=>{let imageIndex=parseInt(e.target.getAttribute('data-index'))
if(Number.isInteger(imageIndex)){thumbnailNav.setAttribute('data-active-index',imageIndex)
if(options?.loop){imageIndex+=2}
if(gallery.classList.contains('brxe-carousel')){let swiperId=gallery.getAttribute('data-script-id')
let tempArr=bricksData.swiperInstances[swiperId].slides.map((slide,index)=>{return{slide,index,pswpIndex:Number(slide.dataset.swiperSlideIndex)}}).filter((item)=>!item.slide.classList.contains('swiper-slide-duplicate')&&item.pswpIndex===imageIndex)
if(tempArr.length){imageIndex=tempArr[0].index}}
pswp.goTo(imageIndex)}})}})})
lightbox.on('change',function(){const thumbnailNav=document.querySelector('.pswp__thumbnail-nav')
if(thumbnailNav){let activeImage=thumbnailNav.querySelector('.active')
if(activeImage){activeImage.classList.remove('active')}
let currentIndex=lightbox.pswp.currSlide.data.element.dataset.pswpIndex||lightbox.pswp.currIndex
activeImage=thumbnailNav.querySelector(`img[data-index="${currentIndex}"`)
if(activeImage){activeImage.classList.add('active')
let activeImageRect=activeImage.getBoundingClientRect()
let marginLeft=thumbnailNav.offsetWidth / 2-activeImage.offsetLeft-activeImageRect.width / 2
marginLeft+=(window.innerWidth-thumbnailNav.offsetWidth)/ 2
thumbnailNav.style.transform='translateX('+marginLeft+'px)'}}})}
lightbox.on('itemData',(e)=>{let photoswipeInitialised=document.querySelector('.brx .pswp__container')
let videoUrl=lightboxElement.getAttribute('data-pswp-video-url')
let width=lightboxElement.getAttribute('data-pswp-width')
let height=lightboxElement.getAttribute('data-pswp-height')
let controls=lightboxElement.getAttribute('data-no-controls')==1?0:1
if(width&&(width.includes('%')||width.includes('vw'))){width=window.innerWidth*(parseInt(width)/ 100)}
if(height&&(height.includes('%')||height.includes('vh'))){height=window.innerHeight*(parseInt(height)/ 100)}
if(!width){width=1280}
if(!height||height==720){height=Math.round((width / 16)*9)}
if(!photoswipeInitialised&&videoUrl){let html=bricksGetLightboxVideoNode(videoUrl,controls)
e.itemData={html:html.outerHTML,width:width,height:height}}})
lightbox.on('contentAppend',({content})=>{if(content.element){let photoswipeVideo=content.element.querySelector('video')
if(photoswipeVideo){photoswipeVideo.play()}}})
if(gallery.classList.contains('brxe-carousel')){let swiperId=gallery.getAttribute('data-script-id')
if(bricksData.swiperInstances?.[swiperId]?.loopedSlides){lightbox.addFilter('numItems',(numItems,dataSource)=>{if(dataSource.gallery){let duplicateSlides=0
if(dataSource.gallery.classList.contains('brxe-carousel')){duplicateSlides=dataSource.gallery.querySelectorAll('.swiper-slide-duplicate').length}
numItems=numItems>duplicateSlides?numItems-duplicateSlides:numItems}
return numItems})
lightbox.addFilter('clickedIndex',(clickedIndex,e)=>{let currentSlide=e.target.closest('.swiper-slide')
if(currentSlide){let tempArr=bricksData.swiperInstances[swiperId].slides.map((slide,index)=>{return{slide,index}}).filter(Boolean)
if(tempArr.length){let currentSwiperSlideIndex=parseInt(currentSlide.dataset.swiperSlideIndex)
let simulateSlide=tempArr.filter((x)=>x.slide.dataset.swiperSlideIndex==currentSwiperSlideIndex)
if(simulateSlide.length){clickedIndex=simulateSlide[0].index}}}
return clickedIndex})}}
lightbox.init()}})
function bricksPhotoswipe(){bricksPhotoswipeFn.run()}
function bricksGetLightboxVideoNode(videoUrl,controls){if(videoUrl){hasContent=true
let isIframe=false
if(videoUrl.indexOf('youtube.com')!==-1||videoUrl.indexOf('youtu.be')!==-1){isIframe=true
const videoData=bricksGetYouTubeVideoLinkData(videoUrl)
videoUrl=videoData.url
if(videoData.id){videoUrl+='?autoplay=1'
videoUrl+='&rel=0'
if(!controls){videoUrl+='&controls=0'}}}
if(videoUrl.indexOf('vimeo.com')!==-1){isIframe=true
if(videoUrl.indexOf('player.vimeo.com/video')===-1){videoUrl=videoUrl.replace('vimeo.com','player.vimeo.com/video')}
videoUrl+='?autoplay=1'
if(!controls){videoUrl+='&controls=0'}}
if(isIframe){let iframeElement=document.createElement('iframe')
iframeElement.setAttribute('src',videoUrl)
iframeElement.setAttribute('allow','autoplay')
iframeElement.setAttribute('allowfullscreen',1)
return iframeElement}
let videoElement=document.createElement('video')
videoElement.setAttribute('src',videoUrl)
if(controls){videoElement.setAttribute('controls',1)}
videoElement.setAttribute('playsinline',1)
return videoElement}}
const bricksAccordionFn=new BricksFunction({parentNode:document,selector:'.brxe-accordion, .brxe-accordion-nested',forceReinit:true,eachElement:(accordion)=>{const slideUp=(target,duration=200)=>{target.style.display='block'
target.style.transitionProperty='height, margin, padding'
target.style.transitionDuration=`${duration}ms`target.style.height=`${target.offsetHeight}px`target.offsetHeight
target.style.overflow='hidden'
target.style.height=0
target.style.paddingTop=0
target.style.paddingBottom=0
target.style.marginTop=0
target.style.marginBottom=0
let item=target.parentNode
item.classList.remove('brx-open')
window.setTimeout(()=>{target.style.display='none'
target.style.removeProperty('height')
target.style.removeProperty('padding-top')
target.style.removeProperty('padding-bottom')
target.style.removeProperty('margin-top')
target.style.removeProperty('margin-bottom')
target.style.removeProperty('overflow')
target.style.removeProperty('transition-duration')
target.style.removeProperty('transition-property')
document.dispatchEvent(new CustomEvent('bricks/accordion/close',{detail:{elementId:accordion.getAttribute('data-script-id'),closeItem:item}}))},duration)}
const slideDown=(target,duration=200)=>{target.style.removeProperty('display')
let display=window.getComputedStyle(target).display
if(display==='none'){display='block'}
target.style.display=display
let height=target.offsetHeight
target.style.overflow='hidden'
target.style.height=0
target.style.paddingTop=0
target.style.paddingBottom=0
target.style.marginTop=0
target.style.marginBottom=0
target.offsetHeight
target.style.transitionProperty='height, margin, padding'
target.style.transitionDuration=`${duration}ms`target.style.height=`${height}px`target.style.removeProperty('padding-top')
target.style.removeProperty('padding-bottom')
target.style.removeProperty('margin-top')
target.style.removeProperty('margin-bottom')
let item=target.parentNode
item.classList.add('brx-open')
window.setTimeout(()=>{target.style.removeProperty('height')
target.style.removeProperty('overflow')
target.style.removeProperty('transition-duration')
target.style.removeProperty('transition-property')
document.dispatchEvent(new CustomEvent('bricks/accordion/open',{detail:{elementId:accordion.getAttribute('data-script-id'),openItem:item}}))},duration)}
const slideToggle=(target,duration=200)=>{if(window.getComputedStyle(target).display==='none'){return slideDown(target,duration)}else{return slideUp(target,duration)}}
const expandItem=(item)=>{item.classList.add('brx-open')
let title=item.querySelector('.accordion-title-wrapper')??false
if(title){title.setAttribute('aria-expanded','true')}}
let items=Array.from(accordion.children)
let duration=accordion.hasAttribute('data-transition')?isNaN(accordion.dataset.transition)?0:accordion.dataset.transition:200
let expandFirstItem=accordion.dataset.scriptArgs?.includes('expandFirstItem')
let independentToggle=accordion.dataset.scriptArgs?.includes('independentToggle')
let expandItemIndexes=expandFirstItem?['0']:false
if(expandItemIndexes===false&&accordion.hasAttribute('data-expand-item')){expandItemIndexes=accordion.getAttribute('data-expand-item').split(',')}
let hash=window.location.hash||''
items=items.filter((item)=>item.classList.contains('brxe-section')||item.classList.contains('brxe-container')||item.classList.contains('brxe-block')||item.classList.contains('brxe-div')||item.classList.contains('accordion-item'))
items.forEach((item,index)=>{if(expandItemIndexes&&expandItemIndexes.includes(index.toString())){expandItem(item)}
let anchorId=item?.id&&!item.id.startsWith('brxe-')?`#${item.id}`:''
if(anchorId&&anchorId===hash){expandItem(item)}
if(item.classList.contains('listening')){return}
item.classList.add('listening')
item.addEventListener('click',(e)=>{let title=e.target.closest('.accordion-title-wrapper')
if(!title){return}
let item=title.parentNode
if(!item){return}
let content=item.querySelector('.accordion-content-wrapper')
if(!content){return}
const selectorDetectorActive=e.target.closest('.bricks-active-selector-detector')
if(selectorDetectorActive){return}
e.stopPropagation()
if(!independentToggle){let openItems=accordion.querySelectorAll('.brx-open')
if(openItems.length){openItems.forEach((openItem)=>{let openContent=openItem.querySelector('.accordion-content-wrapper')
if(openContent&&openContent!==content){slideUp(openContent,duration)
openContent.previousElementSibling.setAttribute('aria-label',window.bricksData.i18n.openAccordion)
openContent.previousElementSibling.setAttribute('aria-expanded','false')}})}}
let openingItem=!item.classList.contains('brx-open')
if(anchorId&&openingItem){history.replaceState(null,null,anchorId)}else{history.replaceState(null,null,' ')}
slideToggle(content,duration)
if(item.classList.contains('brx-open')){title.setAttribute('aria-expanded','true')}else{title.setAttribute('aria-expanded','false')}})
let titleWrapper=item.querySelector('.accordion-title-wrapper')||item
if(titleWrapper.getAttribute('role')==='button'){titleWrapper.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault()
titleWrapper.click()}})}})}})
function bricksAccordion(){bricksAccordionFn.run()}
const bricksAnimatedTypingFn=new BricksFunction({parentNode:document,selector:'.brxe-animated-typing',windowVariableCheck:['Typed'],eachElement:(element)=>{let scriptId=element.dataset.scriptId
let scriptArgs
try{scriptArgs=JSON.parse(element.dataset.scriptArgs)}catch(e){return false}
let typedElement=element.querySelector('.typed')
if(!typedElement){return}
if(window.bricksData.animatedTypingInstances[scriptId]&&!element.closest('.brxe-slider-nested.splide')){window.bricksData.animatedTypingInstances[scriptId].destroy()}
if(!scriptArgs.hasOwnProperty('strings')||!scriptArgs.strings){return}
if(Array.isArray(scriptArgs.strings)&&!scriptArgs.strings.toString()){return}
window.bricksData.animatedTypingInstances[scriptId]=new Typed(typedElement,scriptArgs)
const closestPopup=element.closest('.brx-popup:not([data-popup-ajax])')
if(closestPopup){document.addEventListener('bricks/popup/open',(event)=>{if(event.detail.popupElement===closestPopup){window.bricksData.animatedTypingInstances[scriptId].reset()}})}}})
function bricksAnimatedTyping(){bricksAnimatedTypingFn.run()}
const bricksAudioFn=new BricksFunction({parentNode:document,selector:'.brxe-audio',windowVariableCheck:['MediaElementPlayer'],eachElement:(element)=>{let audioElement=element.querySelector('audio')
if(audioElement){let mediaElementPlayer=new MediaElementPlayer(audioElement)}}})
function bricksAudio(){bricksAudioFn.run()}
const bricksPostReadingTimeFn=new BricksFunction({parentNode:document,selector:'.brxe-post-reading-time',eachElement:(element)=>{let wordsPerMinute=element.getAttribute('data-wpm')
let charactersPerMinute=element.getAttribute('data-cpm')
if(!wordsPerMinute&&!charactersPerMinute){return}
let contentSelector=element.dataset.contentSelector||'.brxe-post-content'
let closestQueryLoop=element.closest('[data-query-loop-index]')
let content=closestQueryLoop?closestQueryLoop.querySelector(contentSelector):document.querySelector(contentSelector)
if(!content){content=document.querySelector('#brx-content')}
if(!content){return}
let prefix=element.getAttribute('data-prefix')||''
let suffix=element.getAttribute('data-suffix')||''
let longWordChunkSize=5
let longWordThreshold=15
let articleText=content.textContent
const averageCharactersPerWord={chinese:1.5,japanese:2.5}
function detectLanguage(char){if(/[\u4e00-\u9fa5]/.test(char)){return'chinese'}else if(/[\u3040-\u30FF]/.test(char)){return'japanese'}else{return'other'}}
function splitLongWords(text,chunkSize,longWordThreshold){const regex=new RegExp(`\\S{${longWordThreshold},}`,'g')
return text.replace(regex,(longWord)=>{return longWord.match(new RegExp(`.{1,${chunkSize}}`,'g')).join(' ')})}
function countWords(text){let totalWordCount=0
let chineseCharacterCount=0
let japaneseCharacterCount=0
let otherText=''
for(const char of text){const lang=detectLanguage(char)
if(lang==='chinese'){chineseCharacterCount++}else if(lang==='japanese'){japaneseCharacterCount++}else{otherText+=char}}
const chineseWordCount=chineseCharacterCount / averageCharactersPerWord['chinese']
const japaneseWordCount=japaneseCharacterCount / averageCharactersPerWord['japanese']
otherText=splitLongWords(otherText,longWordChunkSize,longWordThreshold)
const otherWordCount=otherText.split(/\s+/).filter((word)=>word.length>0).length
totalWordCount=chineseWordCount+japaneseWordCount+otherWordCount
return totalWordCount}
let readingTime
if(charactersPerMinute){let characterCount=articleText.replace(/\s+/g,'').length
readingTime=Math.ceil(characterCount / parseInt(charactersPerMinute))}else{let totalWordCount=countWords(articleText)
readingTime=Math.ceil(totalWordCount / parseInt(wordsPerMinute))}
element.textContent=prefix+readingTime+suffix}})
function bricksPostReadingTime(){bricksPostReadingTimeFn.run()}
const bricksCountdownFn=new BricksFunction({parentNode:document,selector:'.brxe-countdown',eachElement:(element)=>{countdown=(element,settings,init)=>{let timezoneSign=settings.timezone[3]==='+'?1:-1
let timezoneHours=parseInt(settings.timezone.substring(4,6))
let timezoneMinutes=parseInt(settings.timezone.substring(7,9))
let countdownCreatorTimezone=timezoneSign*(timezoneHours*60+timezoneMinutes)
let countdownCreatorTimezoneMs=countdownCreatorTimezone*60000
let viewerOffsetMinutes=new Date().getTimezoneOffset()
let viewerOffsetMs=-viewerOffsetMinutes*60000
let date=settings.date.replace(' ','T')
let targetDate=new Date(date).getTime()
let targetDateAdjusted=targetDate+viewerOffsetMs-countdownCreatorTimezoneMs
let now=new Date().getTime()
let diff=targetDateAdjusted-now
if(diff<=0){clearInterval(element.dataset.bricksCountdownId)
if(settings.action==='hide'){element.innerHTML=''
return}else if(settings.action==='text'){element.innerHTML=settings.actionText
return}}
if(init){element.innerHTML=''
settings.fields.forEach((field)=>{if(!field.format){return}
let fieldNode=document.createElement('div')
fieldNode.classList.add('field')
if(field.prefix){let prefixNode=document.createElement('span')
prefixNode.classList.add('prefix')
prefixNode.innerHTML=field.prefix
fieldNode.appendChild(prefixNode)}
let formatNode=document.createElement('span')
formatNode.classList.add('format')
fieldNode.appendChild(formatNode)
if(field.suffix){let suffixNode=document.createElement('span')
suffixNode.classList.add('suffix')
suffixNode.innerHTML=field.suffix
fieldNode.appendChild(suffixNode)}
element.appendChild(fieldNode)})}
let fieldNodes=bricksQuerySelectorAll(element,'.field')
let days=Math.floor(diff /(1000*60*60*24))
let hours=Math.floor((diff%(1000*60*60*24))/(1000*60*60))
let minutes=Math.floor((diff%(1000*60*60))/(1000*60))
let seconds=Math.floor((diff%(1000*60))/ 1000)
settings.fields.forEach((field,index)=>{if(!field.format||!fieldNodes[index]){return}
let format=field.format.toLowerCase()
if(format.includes('%d')){if(field.format.includes('%D')){days<=9?(days=`0${days}`):days}
fieldNodes[index].querySelector('.format').innerHTML=format.replace('%d',diff<=0?0:days)}
else if(format.includes('%h')){if(field.format.includes('%H')){hours<=9?(hours=`0${hours}`):hours}
fieldNodes[index].querySelector('.format').innerHTML=format.replace('%h',diff<=0?0:hours)}
else if(format.includes('%m')){if(field.format.includes('%M')){minutes<=9?(minutes=`0${minutes}`):minutes}
fieldNodes[index].querySelector('.format').innerHTML=format.replace('%m',diff<=0?0:minutes)}
else if(format.includes('%s')){if(field.format.includes('%S')){seconds<=9?(seconds=`0${seconds}`):seconds}
fieldNodes[index].querySelector('.format').innerHTML=format.replace('%s',diff<=0?0:seconds)}})}
let settings=element.dataset.bricksCountdownOptions
try{settings=JSON.parse(settings)}catch(e){return false}
if(settings.hasOwnProperty('date')&&settings.hasOwnProperty('fields')){let countdownId=element.dataset.bricksCountdownId
if(countdownId){clearInterval(countdownId)}
countdown(element,settings,true)
countdownId=setInterval(countdown,1000,element,settings,false)
element.dataset.bricksCountdownId=countdownId}}})
function bricksCountdown(){bricksCountdownFn.run()}
const bricksCounterFn=new BricksFunction({parentNode:document,selector:'.brxe-counter',subscribeEvents:['bricks/popup/open','bricks/ajax/pagination/completed','bricks/ajax/load_page/completed','bricks/ajax/query_result/displayed'],forceReinit:(element,index)=>{return element.closest('.brx-popup')},eachElement:(element)=>{let settings=element.dataset.bricksCounterOptions
try{settings=JSON.parse(settings)}catch(e){return false}
let countNode=element.querySelector('.count')
let countFrom=settings.hasOwnProperty('countFrom')?parseInt(settings.countFrom):0
let countTo=settings.hasOwnProperty('countTo')?parseInt(settings.countTo):100
let durationInMs=settings.hasOwnProperty('duration')?parseInt(settings.duration):1000
let separator=settings?.separator
if(durationInMs<500){durationInMs=500}
let diff=countTo-countFrom
let timeout=durationInMs / diff
let incrementBy=1
let minTimeout=16
if(timeout<minTimeout){incrementBy=Math.ceil(minTimeout / timeout)
timeout=minTimeout}
let countUp=()=>{let count=countNode.innerText.replace(/\D/g,'')
count=isNaN(count)?countFrom:parseInt(count)
let newCount=count+incrementBy<countTo?count+incrementBy:countTo
if(count>=countTo){clearInterval(countNode.dataset.counterId)
delete countNode.dataset.counterId
return}
if(settings.thousands&&separator){countNode.innerText=newCount.toLocaleString('en-US').replaceAll(',',separator)}else if(settings.thousands){countNode.innerText=newCount.toLocaleString()}else{countNode.innerText=newCount}}
let callback=()=>{countNode.innerText=countFrom
if(countNode.dataset.counterId==undefined){countNode.dataset.counterId=setInterval(countUp,timeout)}}
let popup=countNode.closest('.brx-popup')
if(popup){if(!popup.classList.contains('hide')){callback()}}
else{new BricksIntersect({element:element,callback:callback})}},listenerHandler:(event)=>{if(event?.type){switch(event.type){case'bricks/popup/open':let settings={parentNode:event.details?.popupElement?event.details.popupElement:document}
bricksCounterFn.run(settings)
break
default:bricksCounterFn.run()
break}}}})
function bricksCounter(){bricksCounterFn.run()}
const bricksTableOfContentsFn=new BricksFunction({parentNode:document,selector:'.brxe-post-toc',forceReinit:true,eachElement:(toc)=>{const isVisible=toc.offsetParent!==null&&!!(toc.offsetWidth||toc.offsetHeight||toc.getClientRects().length)
if(isVisible){initializeTocbot(toc)
return}
const observer=new IntersectionObserver((entries)=>{entries.forEach((entry)=>{if(entry.isIntersecting){initializeTocbot(toc)
observer.disconnect()}})},{threshold:0.1})
observer.observe(toc)
function initializeTocbot(toc){if(window.tocbot){window.tocbot.destroy()}
const scriptId=toc.dataset.scriptId
let contentSelector=toc.dataset.contentSelector||'.brxe-post-content'
let content=document.querySelector(contentSelector)
if(!content){content=document.querySelector('#brx-content')
if(content){contentSelector='#brx-content'}}
if(!content){return}
let headingSelectors=toc.dataset.headingSelectors||'h2, h3'
let headings=content.querySelectorAll(headingSelectors)
let headingMap={}
headings.forEach((heading)=>{if(heading.id&&!headingMap[heading.id]){headingMap[heading.id]=1
return}
let generatedId=generateIDFromTextContent(heading.textContent,scriptId)
if(headingMap[generatedId]){headingMap[generatedId]++
generatedId=`${generatedId}-${headingMap[generatedId]}`}
else{headingMap[generatedId]=1}
heading.id=generatedId})
function generateIDFromTextContent(text,scriptId){let baseId=text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[!@#$%^&*()=:;,.„“"'`]/gi,'').replace(/\//gi,'-').split(' ').join('-')
if(/^\d/.test(baseId)){return`${scriptId}-${baseId}`}
return baseId}
let headingsOffset=parseInt(toc.dataset.headingsOffset)||0
let scrollSmooth=toc.hasAttribute('data-smooth-scroll')
let options={tocSelector:`.brxe-post-toc[data-script-id="${scriptId}"]`,contentSelector:contentSelector,headingSelector:headingSelectors,ignoreSelector:toc.dataset.ignoreSelector||'.toc-ignore',hasInnerContainers:false,linkClass:'toc-link',extraLinkClasses:'',activeLinkClass:'is-active-link',listClass:'toc-list',extraListClasses:'',isCollapsedClass:'is-collapsed',collapsibleClass:'is-collapsible',listItemClass:'toc-list-item',activeListItemClass:'is-active-li',collapseDepth:toc.dataset.collapseInactive?0:6,scrollSmooth:headingsOffset,scrollSmoothDuration:scrollSmooth&&headingsOffset?420:0,scrollSmoothOffset:headingsOffset?-headingsOffset:0,headingsOffset:headingsOffset,throttleTimeout:0,positionFixedSelector:null,positionFixedClass:'is-position-fixed',fixedSidebarOffset:'auto',includeHtml:false,includeTitleTags:false,orderedList:false,scrollContainer:null,skipRendering:false,headingLabelCallback:false,ignoreHiddenElements:false,headingObjectCallback:null,basePath:'',disableTocScrollSync:false,tocScrollOffset:0}
window.tocbot.init(options)}}})
function bricksTableOfContents(){bricksTableOfContentsFn.run()}
const bricksFormFn=new BricksFunction({parentNode:document,selector:'.brxe-form',eachElement:(form)=>{let elementId=form.getAttribute('data-element-id')
const validationDisabledOn=JSON.parse(form.getAttribute('data-validation-disabled-on'))||[]
let checkboxes=bricksQuerySelectorAll(form,'input[type="checkbox"]')
checkboxes.forEach((checkbox)=>{if(checkbox.required){checkbox.addEventListener('click',(event)=>{let cbName=checkbox.getAttribute('name')
let group=bricksQuerySelectorAll(form,`input[name="${cbName}"]`)
let atLeastOneChecked=false
group.forEach((item)=>{if(item.checked===true){atLeastOneChecked=true}})
if(atLeastOneChecked){group.forEach((item)=>{item.required=false})}else{group.forEach((item)=>{item.required=true})}})}})
const inputFields=form.querySelectorAll('input:not([type="hidden"]):not([type="file"]), textarea')
inputFields.forEach((inputField)=>{if(inputField.getAttribute('data-error-message')&&bricksIsFrontend){if(!validationDisabledOn.includes('input')){inputField.addEventListener('input',window.bricksUtils.debounce(()=>{validateInput(inputField)},300))}
if(!validationDisabledOn.includes('blur')){inputField.addEventListener('blur',window.bricksUtils.debounce(()=>{validateInput(inputField)},300))}}})
function validateInput(inputField){const value=inputField.value.trim()
const errorMsg=inputField.getAttribute('data-error-message')
let formGroup=inputField.closest('.form-group')
let showError=false
if(inputField.hasAttribute('required')&&!value){showError=true}
if(inputField.type==='number'){const min=parseFloat(inputField.getAttribute('min'))
const max=parseFloat(inputField.getAttribute('max'))
const valueAsNumber=parseFloat(value)
if((min!==null&&valueAsNumber<min)||(max!==null&&valueAsNumber>max)){showError=true}}
if(inputField.type==='email'){showError=!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
if(inputField.type==='url'){showError=!/^(https?:\/\/)?([\w.-]+)\.([a-z.]{2,6})([\/\w.-]*)*\/?$/.test(value)}
if(!inputField.hasAttribute('required')&&value==''){showError=false}
let errorDiv=formGroup.querySelector('.form-group-error-message')
if(!errorDiv){errorDiv=document.createElement('div')
errorDiv.classList.add('form-group-error-message')
formGroup.appendChild(errorDiv)}
if(showError){errorDiv.innerText=errorMsg
errorDiv.classList.add('show')}else{errorDiv.innerText=''
errorDiv.classList.remove('show')}
return!showError}
const passwordToggles=form.querySelectorAll('.password-toggle')
passwordToggles.forEach((toggle)=>{const input=toggle.previousElementSibling
if(!input||!input.type.match(/password|text/)){return}
toggle.addEventListener('click',()=>{const isPassword=input.type==='password'
input.type=isPassword?'text':'password'
toggle.setAttribute('aria-label',isPassword?window.bricksData.i18n.hidePassword:window.bricksData.i18n.showPassword)
toggle.querySelector('.show-password').classList.toggle('hide')
toggle.querySelector('.hide-password').classList.toggle('hide')})})
let flatpickrElements=bricksQuerySelectorAll(form,'.flatpickr')
flatpickrElements.forEach((flatpickrElement)=>{let flatpickrOptions=flatpickrElement.dataset.bricksDatepickerOptions
if(flatpickrOptions){flatpickrOptions=JSON.parse(flatpickrOptions)
flatpickrOptions.disableMobile=true
flatpickrOptions.onReady=(a,b,fp)=>{if(fp.altInput){let ariaLabel=fp.altInput.previousElementSibling?fp.altInput.previousElementSibling.getAttribute('aria-label'):'Date'
fp.altInput.setAttribute('aria-label',ariaLabel||'Date')}}
flatpickr(flatpickrElement,flatpickrOptions)}})
let files={}
let fileInputInstances=bricksQuerySelectorAll(form,'input[type=file]')
fileInputInstances.forEach((input)=>{let inputRef=input.getAttribute('data-files-ref')
let maxSize=input.getAttribute('data-maxsize')||false
let maxLength=input.getAttribute('data-limit')||false
maxSize=maxSize?parseInt(maxSize)*1024*1024:false
input.addEventListener('change',(e)=>{let fileList=e.target.files
let fileListLength=fileList.length
let inputName=input.getAttribute('name')
if(!fileListLength){return}
let fileResultEl=form.querySelector(`.file-result[data-files-ref="${inputRef}"]`)
for(let i=0;i<fileListLength;i++){let file=fileList[i]
let error=false
let resultEl=fileResultEl.cloneNode(true)
if(maxLength&&files.hasOwnProperty(inputName)&&files[inputName].length>=maxLength){error='limit'}
if(maxSize&&file.size>maxSize){error='size'}
resultEl.classList.add('show')
if(error){resultEl.classList.add('danger')
resultEl.querySelector('.text').remove()
resultEl.querySelector('.remove').remove()
const closeIcon=resultEl.querySelector('svg')
const errorMessage=resultEl.getAttribute(`data-error-${error}`).replace('%s',file.name)
resultEl.insertAdjacentHTML('afterbegin',errorMessage)
closeIcon.addEventListener('click',()=>{resultEl.remove()})}
else{if(!files.hasOwnProperty(inputName)){files[inputName]=[]}
files[inputName].push(file)
let resultText=resultEl.querySelector('.text')
let resultRemove=resultEl.querySelector('.remove')
resultEl.querySelector('svg').remove()
resultText.innerHTML=file.name
resultRemove.setAttribute('data-name',file.name)
resultRemove.setAttribute('data-field',inputName)
resultRemove.addEventListener('click',(e)=>{let fileName=e.target.getAttribute('data-name')
let fieldName=e.target.getAttribute('data-field')
let fieldFiles=files[fieldName]
for(let k=0;k<fieldFiles.length;k++){if(fieldFiles[k].name===fileName){files[inputName].splice(k,1)
break}}
resultEl.remove()})}
fileResultEl.parentNode.insertBefore(resultEl,fileResultEl.nextSibling)}})})
form.addEventListener('submit',(event)=>{event.preventDefault()
if(!bricksIsFrontend){return}
let isValid=true
inputFields.forEach((inputField)=>{if(inputField.getAttribute('data-error-message')&&bricksIsFrontend){isValid=isValid&&validateInput(inputField)}})
if(!isValid){return}
let hcaptchaIframe=form.querySelector('[data-hcaptcha-widget-id]')
let widgetId=hcaptchaIframe?hcaptchaIframe.getAttribute('data-hcaptcha-widget-id'):''
if(typeof window?.hcaptcha?.execute==='function'&&document.querySelector('.h-captcha[data-size="invisible"]')){hcaptcha.execute(widgetId,{async:true}).then(()=>{bricksSubmitForm(elementId,form,files,null)}).catch((err)=>{console.warn(err)})
return}
let recaptchaElement=document.getElementById(`recaptcha-${elementId}`)
let recaptchaErrorEl=form.querySelector('.recaptcha-error')
if(!recaptchaElement){bricksSubmitForm(elementId,form,files,null)
return}
let recaptchaSiteKey=recaptchaElement.getAttribute('data-key')
if(!recaptchaSiteKey){recaptchaErrorEl.classList.add('show')
return}
try{grecaptcha.ready(()=>{try{grecaptcha.execute(recaptchaSiteKey,{action:'bricks_form_submit'}).then((token)=>{recaptchaErrorEl.classList.remove('show')
bricksSubmitForm(elementId,form,files,token)}).catch((error)=>{recaptchaErrorEl.classList.add('show')
form.querySelector('.alert').innerText=`Google reCaptcha ${error}`})}catch(error){recaptchaErrorEl.classList.add('show')
form.querySelector('.alert').innerText=`Google reCaptcha ${error}`}})}catch(error){recaptchaErrorEl.classList.add('show')
form.querySelector('.alert').innerText=`Google reCaptcha ${error}`}})}})
function bricksForm(){bricksFormFn.run()}
function bricksSubmitForm(elementId,form,files,recaptchaToken,nonceRefreshed){if(form.action&&form.action.includes('action=postpass')){form.submit()
return}
let submitButton=form.querySelector('button[type=submit]')
submitButton.classList.add('sending')
const loopId=form.dataset.loopObjectId?form.dataset.loopObjectId:window.bricksData.postId
let formData=new FormData(form)
formData.append('action','bricks_form_submit')
formData.append('loopId',loopId)
formData.append('postId',window.bricksData.postId)
formData.append('formId',elementId)
formData.append('recaptchaToken',recaptchaToken||'')
formData.append('nonce',window.bricksData.formNonce)
formData.append('referrer',location.toString())
const noticeData=JSON.parse(form.getAttribute('data-notice'))
let params={}
window.location.search.substring(1).split('&').forEach((param)=>{let pair=param.split('=')
params[pair[0]]=decodeURIComponent(pair[1])})
formData.append('urlParams',JSON.stringify(params))
let globalId=form.getAttribute('data-global-id')
if(globalId){formData.append('globalId',globalId)}
for(let inputName in files){files[inputName].forEach((file)=>{formData.append(`${inputName}[]`,file,file.name)})}
document.dispatchEvent(new CustomEvent('bricks/form/submit',{detail:{elementId,formData}}))
let url=window.bricksData.ajaxUrl
let xhr=new XMLHttpRequest()
xhr.open('POST',url,true)
xhr.onreadystatechange=function(){let getResponse=(data)=>{try{return JSON.parse(data)}catch(e){return null}}
let res=getResponse(xhr.response)
if(window.bricksData.debug){console.warn('bricks_form_submit',xhr,res)}
if(!res||xhr?.readyState!=4){return}
let formEventName
if(res?.data?.code==='invalid_nonce'){if(!nonceRefreshed){bricksRegenerateNonceAndResubmit(elementId,form,files,recaptchaToken)
return}}else{if(res.success&&res.data?.type==='success'){formEventName='bricks/form/success'}else if(!res.success||res.data?.type==='error'){formEventName='bricks/form/error'}}
if(formEventName){document.dispatchEvent(new CustomEvent(formEventName,{detail:{elementId,formData,res}}))}
if(res.success&&(res.data?.action==='mailchimp'||res.data?.action==='sendgrid')){window.dataLayer=window.dataLayer||[]
window.dataLayer.push({event:'bricksNewsletterSignup'})}
if(res.success&&res.data?.redirectTo){setTimeout(()=>{window.location.href=res.data.redirectTo},parseInt(res.data?.redirectTimeout)||0)}else if(res.success&&res.data?.refreshPage){setTimeout(()=>{window.location.reload()},1000)}
if(form.querySelector('.message')){form.querySelector('.message').remove()}
let messageEl=document.createElement('div')
messageEl.classList.add('message')
let messageText=document.createElement('div')
messageText.classList.add('text')
if(res.data?.message){if(res.data.message?.errors){let errors=res.data.message.errors
let errorKeys=Object.keys(errors)
errorKeys.forEach((errorKey)=>{messageText.innerHTML+=errors[errorKey][0]+'<br>'})}else{messageText.innerHTML=res.data.message}}
messageEl.appendChild(messageText)
if(res.data?.info){let submitInfoInner=document.createElement('div')
let submitInfoText=document.createElement('div')
submitInfoText.innerHTML=res.data.info.join('<br>')
messageEl.appendChild(submitInfoInner)
submitInfoInner.appendChild(submitInfoText)}else{messageEl.classList.add(res.data.type)}
if(noticeData){const closeNotice=()=>{messageEl.classList.add('closing')
setTimeout(()=>{messageEl?.remove()},200)}
if(noticeData.closeButton){let closeButton=document.createElement('button')
closeButton.classList.add('close')
closeButton.innerHTML='<svg version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke-linecap="round" stroke-width="2" stroke="currentcolor" fill="none" stroke-linejoin="round"><path d="M0.5,0.5l23,23"></path><path d="M23.5,0.5l-23,23"></path></g><path fill="none" d="M0,0h24v24h-24Z"></path></svg>'
messageEl.appendChild(closeButton)
closeButton.addEventListener('click',(e)=>{e.preventDefault()
closeNotice()})}
const noticeCloseAfter=noticeData?.closeAfter
if(noticeCloseAfter){setTimeout(()=>{closeNotice()},parseInt(noticeCloseAfter))}}
form.appendChild(messageEl)
submitButton.classList.remove('sending')
if(res.success){form.reset()
for(let inputName in files){delete files[inputName]}
let fileResults=bricksQuerySelectorAll(form,'.file-result.show')
if(fileResults!==null){fileResults.forEach((resultEl)=>{resultEl.remove()})}
if(window.top!=window.self&&!form.querySelector('input[name="brx_pp_temp_id"]')){let closeLoginModelButton=window.top.document.querySelector('button.wp-auth-check-close')
if(closeLoginModelButton){closeLoginModelButton.click()}}}else{let turnstileElement=form.querySelector('.cf-turnstile')
let turnstileIframe=turnstileElement?turnstileElement.querySelector('iframe'):null
let turnstileWidgetId=turnstileIframe?turnstileIframe.id:null
if(turnstileWidgetId){turnstile.reset(turnstileWidgetId)}
let fileResultErrors=bricksQuerySelectorAll(form,'.file-result.show.danger')
if(fileResultErrors!==null){fileResultErrors.forEach((resultEl)=>{resultEl.remove()})}}}
xhr.send(formData)}
function bricksRegenerateNonceAndResubmit(elementId,form,files,recaptchaToken){let xhrNonce=new XMLHttpRequest()
xhrNonce.open('POST',window.bricksData.ajaxUrl+'?t='+new Date().getTime(),true)
xhrNonce.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
xhrNonce.onreadystatechange=function(){if(xhrNonce.readyState===XMLHttpRequest.DONE){let newNonce=xhrNonce.responseText
window.bricksData.formNonce=newNonce
bricksSubmitForm(elementId,form,files,recaptchaToken,true)}}
xhrNonce.send('action=bricks_regenerate_form_nonce')}
const bricksIsotopeFn=new BricksFunction({parentNode:document,selector:'.bricks-layout-wrapper.isotope',forceReinit:true,windowVariableCheck:['Isotope'],eachElement:(el)=>{let elementId=false
let elementName=''
if(el.classList.contains('bricks-masonry')){elementId=el.getAttribute('data-script-id')
elementName='masonry-element'}else if(el.classList.contains('brxe-image-gallery')){elementId=el.getAttribute('data-script-id')
elementName='image-gallery'}else{elementId=el.closest('.brxe-posts')?.getAttribute('data-script-id')
elementName='posts'}
if(!elementId||!elementName){return}
if(bricksIsFrontend&&window.bricksData.isotopeInstances[elementId]){if(window.bricksData.isotopeInstances[elementId].element?.isConnected){bricksUtils.updateIsotopeInstance(elementId)
return}else{window.bricksData.isotopeInstances[elementId].instance.destroy()
delete window.bricksData.isotopeInstances[elementId]}}else if(window.bricksData.isotopeInstances[elementId]){window.bricksData.isotopeInstances[elementId].instance.destroy()
delete window.bricksData.isotopeInstances[elementId]}
let options={}
let layout=el.getAttribute('data-layout')
if(elementName==='masonry-element'){layout='masonry'
let brxMasonryData=el.getAttribute('data-brx-masonry-json')||'{}'
let brxMasonrySettings={}
try{brxMasonrySettings=JSON.parse(brxMasonryData)}catch(e){console.error('Bricks: Invalid JSON data for Masonry element')}
let transitionDuration=brxMasonrySettings?.transitionDuration||'0.4s'
let transitionMode=brxMasonrySettings?.transitionMode||'scale'
options={itemSelector:'.bricks-masonry > *:not(.bricks-isotope-sizer):not(.bricks-gutter-sizer)',percentPosition:true,masonry:{columnWidth:'.bricks-isotope-sizer',gutter:'.bricks-gutter-sizer',horizontalOrder:brxMasonrySettings?.horizontalOrder||false},transitionDuration:transitionDuration}
if(transitionDuration==='0s'||transitionDuration==='0'){options.hiddenStyle={opacity:1}
options.visibleStyle={opacity:1}
options.instantLayout=true}else{switch(transitionMode){case'fade':options.hiddenStyle={opacity:0}
options.visibleStyle={opacity:1}
break
case'slideLeft':options.hiddenStyle={opacity:0,transform:'translateX(-50%)'}
options.visibleStyle={opacity:1,transform:'translateX(0)'}
break
case'slideRight':options.hiddenStyle={opacity:0,transform:'translateX(50%)'}
options.visibleStyle={opacity:1,transform:'translateX(0)'}
break
case'skew':options.hiddenStyle={opacity:0,transform:'skew(20deg)'}
options.visibleStyle={opacity:1,transform:'skew(0)'}
default:break}}}else{options={itemSelector:'.bricks-layout-item',percentPosition:true}
if(layout==='grid'){options.layoutMode='fitRows'
options.fitRows={gutter:'.bricks-gutter-sizer'}}else if(layout==='masonry'||layout==='metro'){options.masonry={columnWidth:'.bricks-isotope-sizer',gutter:'.bricks-gutter-sizer'}}}
let isotopeInstance=new Isotope(el,options)
setTimeout(()=>{el.classList.remove('isotope-before-init')},250)
let filters=el.parentNode.querySelector('.bricks-isotope-filters')
if(filters){filters.addEventListener('click',(e)=>{let filterValue=e.target.getAttribute('data-filter')
let activeFilter=filters.querySelector('li.active')
if(!filterValue||!bricksIsFrontend){return}
if(activeFilter){activeFilter.classList.remove('active')}
e.target.classList.add('active')
isotopeInstance.arrange({filter:filterValue})})}
window.bricksData.isotopeInstances[elementId]={elementId:elementId,instance:isotopeInstance,layout:layout,filters:filters,options:options,element:el,elementName:elementName}
bricksUtils.updateIsotopeOnImageLoad(elementId)},listenerHandler:(event)=>{setTimeout(()=>{bricksIsotopeFn.run()},100)}})
function bricksIsotope(){bricksIsotopeFn.run()}
function bricksIsotopeListeners(){document.addEventListener('bricks/tabs/changed',(event)=>{const tabActivePane=event.detail?.activePane||false
if(tabActivePane){const isotopeElements=tabActivePane.querySelectorAll('.bricks-layout-wrapper.isotope[data-script-id]')
if(isotopeElements.length){isotopeElements.forEach((el)=>{const isotopeId=el.getAttribute('data-script-id')
setTimeout(()=>{bricksUtils.updateIsotopeInstance(isotopeId)},0)})}}})
document.addEventListener('bricks/accordion/open',(event)=>{const openItem=event.detail?.openItem||false
if(openItem){const isotopeElements=openItem.querySelectorAll('.bricks-layout-wrapper.isotope[data-script-id]')
if(isotopeElements.length){isotopeElements.forEach((el)=>{const isotopeId=el.getAttribute('data-script-id')
setTimeout(()=>{bricksUtils.updateIsotopeInstance(isotopeId)},0)})}}})
document.addEventListener('bricks/ajax/nodes_added',(event)=>{const queryId=event?.detail?.queryId
if(!queryId){return}
const queryInstance=window.bricksData.queryLoopInstances[queryId]||false
if(!queryInstance){return}
const parentIsMasonry=queryInstance.resultsContainer?.classList?.contains('bricks-masonry')||window.bricksData.isotopeInstances[queryId]
if(parentIsMasonry){if(window.bricksData.isotopeInstances[queryId]){bricksUtils.updateIsotopeInstance(queryId)}else{bricksUtils.updateIsotopeInstance(queryInstance.resultsContainer?.getAttribute('data-script-id'))}}})
document.addEventListener('bricks/megamenu/repositioned',(event)=>{const submenu=event.detail?.submenu||false
if(submenu){const isotopeElements=submenu.querySelectorAll('.bricks-layout-wrapper.isotope[data-script-id]')
if(isotopeElements.length){isotopeElements.forEach((el)=>{const isotopeId=el.getAttribute('data-script-id')
setTimeout(()=>{bricksUtils.updateIsotopeInstance(isotopeId)},0)})}}})
window.addEventListener('load',()=>{bricksIsotope()})}
const bricksPieChartFn=new BricksFunction({parentNode:document,selector:'.brxe-pie-chart',windowVariableCheck:['EasyPieChart'],eachElement:(element)=>{new BricksIntersect({element:element,callback:(el)=>{let canvas=el.getElementsByTagName('canvas')
if(canvas.length){canvas[0].remove()}
const extractCSSVar=(cssVarString)=>{const cssVarPattern=/var\((--[^)]+)\)/
const match=cssVarString.match(cssVarPattern)
if(match){const varName=match[1]
return getComputedStyle(el).getPropertyValue(varName).trim()}
return cssVarString}
const barColor=extractCSSVar(el.dataset.barColor)
const trackColor=extractCSSVar(el.dataset.trackColor)
new EasyPieChart(el,{size:el.dataset.size&&el.dataset.size>0?el.dataset.size:160,lineWidth:el.dataset.lineWidth,barColor:barColor,trackColor:trackColor,lineCap:el.dataset.lineCap,scaleColor:el.dataset.scaleColor,scaleLength:el.dataset.scaleLength,rotate:0})},threshold:1})}})
function bricksPieChart(){bricksPieChartFn.run()}
const bricksPricingTablesFn=new BricksFunction({parentNode:document,selector:'.brxe-pricing-tables',eachElement:(element)=>{let tabs=bricksQuerySelectorAll(element,'.tab')
let pricingTables=bricksQuerySelectorAll(element,'.pricing-table')
tabs.forEach((tab)=>{if(tab.classList.contains('listening')){return}
tab.classList.add('listening')
tab.addEventListener('click',()=>{if(tab.classList.contains('active')){return}
pricingTables.forEach((pricingTable)=>{pricingTable.classList.toggle('active')})
tabs.forEach((tab)=>{tab.classList.remove('active')})
tab.classList.add('active')})})}})
function bricksPricingTables(){bricksPricingTablesFn.run()}
const bricksPostReadingProgressBarFn=new BricksFunction({parentNode:document,selector:'.brxe-post-reading-progress-bar',eachElement:(element)=>{let contentEl=element.dataset.contentSelector?document.querySelector(element.dataset.contentSelector):false
window.addEventListener('scroll',()=>{let scrolled=window.scrollY
let height=document.documentElement.scrollHeight-document.documentElement.clientHeight
if(contentEl){let rect=contentEl.getBoundingClientRect()
height=rect.height
scrolled=rect.top>0?0:-rect.top}
element.setAttribute('value',Math.ceil((scrolled / height)*100))})}})
function bricksPostReadingProgressBar(){bricksPostReadingProgressBarFn.run()}
const bricksProgressBarFn=new BricksFunction({parentNode:document,selector:'.brxe-progress-bar .bar span',eachElement:(bar)=>{new BricksIntersect({element:bar,callback:()=>{if(bar.dataset.width){setTimeout(()=>{bar.style.width=bar.dataset.width},'slow')}},threshold:1})}})
function bricksProgressBar(){bricksProgressBarFn.run()}
const bricksSplideFn=new BricksFunction({parentNode:document,selector:'.brxe-slider-nested.splide',windowVariableCheck:['Splide'],forceReinit:(element,index)=>{return!bricksIsFrontend},eachElement:(splideElement)=>{let slides=bricksQuerySelectorAll(splideElement,['.splide__list > .brxe-container','.splide__list > .brxe-block','.splide__list > .brxe-div'])
slides.forEach((slide)=>{slide.classList.add('splide__slide')
slide.dataset.id=slide.id})
let scriptId=splideElement.dataset.scriptId
if(window.bricksData.splideInstances.hasOwnProperty(scriptId)){window.bricksData.splideInstances[scriptId].destroy()}
let splideInstance=new Splide(splideElement)
splideInstance.mount()
let splideOptions={}
try{splideOptions=JSON.parse(splideElement.dataset.splide)
splideOptions.i18n={prev:window.bricksData.i18n.prevSlide,next:window.bricksData.i18n.nextSlide,first:window.bricksData.i18n.firstSlide,last:window.bricksData.i18n.lastSlide,slideX:window.bricksData.i18n.slideX,pageX:window.bricksData.i18n.slideX,play:window.bricksData.i18n.play,pause:window.bricksData.i18n.pause,carousel:window.bricksData.i18n.splide.carousel,select:window.bricksData.i18n.splide.select,slide:window.bricksData.i18n.splide.slide,slideLabel:window.bricksData.i18n.splide.slideLabel}}catch(e){console.warn('bricksSplide: Error parsing JSON of data-script-args',scriptId)}
if(splideOptions?.autoHeight){let updateHeight=()=>{try{let slidesComponent=splideInstance?.Components?.Slides
if(!slidesComponent){console.error('Slides component is undefined:',scriptId)
return}
let slideObject=slidesComponent.getAt(splideInstance.index)
let slide=slideObject?.slide
if(!slide){console.error('Slide is undefined:',scriptId)
return}
let parentElement=slide.parentElement
if(!parentElement){console.error('Parent element is undefined:',scriptId)
return}
let autoHeight=0
slides.forEach((slide)=>{if(slide.classList.contains('is-visible')&&slide.offsetHeight>autoHeight){autoHeight=slide.offsetHeight}})
if(!autoHeight){autoHeight=slide.offsetHeight}
parentElement.style.height=`${autoHeight}px`}catch(error){console.error('An error occurred while updating the height:',error,scriptId)}}
if(splideInstance){updateHeight()
if(typeof splideInstance.on==='function'){splideInstance.on('move resize',updateHeight)
splideInstance.on('moved',updateHeight)}else{console.error('splideInstance.on is not a function')}}else{console.error('splideInstance is undefined')}}
window.bricksData.splideInstances[scriptId]=splideInstance
slides.forEach((slide,index)=>{if(slide.dataset.id){slide.id=slide.dataset.id
let pagination=splideElement.querySelector('.splide__pagination')
if(pagination){let paginationButton=pagination.querySelector(`li:nth-child(${index + 1}) .splide__pagination__page`)
if(paginationButton){paginationButton.setAttribute('aria-controls',slide.id)}}}
if(!slide.classList.contains('bricks-lazy-hidden')){let style=slide.getAttribute('style')||''
if(slide.dataset.style){style+=slide.dataset.style
slide.setAttribute('style',style)}}})
if(splideElement.closest('.tab-pane')){document.addEventListener('bricks/tabs/changed',(event)=>{splideInstance.refresh()})}}})
function bricksSplide(){bricksSplideFn.run()}
const bricksSwiperFn=new BricksFunction({parentNode:document,selector:'.bricks-swiper-container',windowVariableCheck:['Swiper'],forceReinit:(element,index)=>{return!bricksIsFrontend},eachElement:(swiperElement)=>{let scriptArgs
try{scriptArgs=JSON.parse(swiperElement.dataset.scriptArgs)}catch(e){console.warn('bricksSwiper: Error parsing JSON of data-script-args',swiperElement)
scriptArgs={}}
let element=swiperElement.classList.contains('[class*=brxe-]')?swiperElement:swiperElement.closest('[class*=brxe-]')
if(!element){return}
let slides=bricksQuerySelectorAll(swiperElement,['.splide__list > .brxe-container','.splide__list > .brxe-block','.splide__list > .brxe-div'])
slides.forEach((slide)=>slide.classList.add('swiper-slide'))
let scriptId=element.dataset.scriptId
let swiperInstance=window.bricksData.swiperInstances.hasOwnProperty(scriptId)?window.bricksData.swiperInstances[scriptId]:undefined
if(swiperInstance){swiperInstance.destroy()}
scriptArgs.observer=false
scriptArgs.observeParents=true
scriptArgs.resizeObserver=true
scriptArgs.slidesToShow=scriptArgs.hasOwnProperty('slidesToShow')?scriptArgs.slidesToShow:1
scriptArgs.slidesPerGroup=scriptArgs.hasOwnProperty('slidesPerGroup')?scriptArgs.slidesPerGroup:1
scriptArgs.speed=scriptArgs.hasOwnProperty('speed')?parseInt(scriptArgs.speed):300
scriptArgs.effect=scriptArgs.hasOwnProperty('effect')?scriptArgs.effect:'slide'
scriptArgs.spaceBetween=scriptArgs.hasOwnProperty('spaceBetween')?scriptArgs.spaceBetween:0
scriptArgs.initialSlide=scriptArgs.hasOwnProperty('initialSlide')?scriptArgs.initialSlide:0
scriptArgs.keyboard={enabled:bricksIsFrontend,onlyInViewport:true,pageUpDown:false}
scriptArgs.watchOverflow=true
if(scriptArgs.hasOwnProperty('effect')&&scriptArgs.effect==='flip'){scriptArgs.flipEffect={slideShadows:false}}
if(scriptArgs.hasOwnProperty('effect')&&scriptArgs.effect==='fade'){scriptArgs.fadeEffect={crossFade:true}}
if(scriptArgs.navigation){scriptArgs.navigation={prevEl:element.querySelector('.bricks-swiper-button-prev'),nextEl:element.querySelector('.bricks-swiper-button-next')}}
if(scriptArgs.pagination){scriptArgs.pagination={el:element.querySelector('.swiper-pagination'),type:'bullets',clickable:true}
if(scriptArgs.dynamicBullets==true){delete scriptArgs.dynamicBullets
scriptArgs.pagination.dynamicBullets=true}}
scriptArgs.a11y={prevSlideMessage:window.bricksData.i18n.prevSlide,nextSlideMessage:window.bricksData.i18n.nextSlide,firstSlideMessage:window.bricksData.i18n.firstSlide,lastSlideMessage:window.bricksData.i18n.lastSlide,paginationBulletMessage:window.bricksData.i18n.slideX,slideLabelMessage:window.bricksData.i18n.swiper.slideLabelMessage}
swiperInstance=new Swiper(swiperElement,scriptArgs)
window.bricksData.swiperInstances[scriptId]=swiperInstance}})
function bricksSwiper(){bricksSwiperFn.run()}
const bricksVideoFn=new BricksFunction({parentNode:document,selector:'.brxe-video',eachElement:(element)=>{if(bricksIsFrontend){const onElementAction=()=>{let videoOverlay=element.querySelector('.bricks-video-overlay')
let videoOverlayIcon=element.querySelector('.bricks-video-overlay-icon')
if(videoOverlay){videoOverlay.remove()}
if(videoOverlayIcon){videoOverlayIcon.remove()}}
element.addEventListener('click',onElementAction)
element.addEventListener('keydown',(event)=>{if(event.key==='Enter'||event.key===' '){onElementAction()}
if(!element.querySelector('video')&&(event.key==='Enter'||event.key===' ')){event.preventDefault()}})}
let videoElement=element.querySelector('video')
if(!videoElement){return}
if(window.hasOwnProperty('Plyr')){let elementId=element.dataset.scriptId
let video=element.querySelector('.bricks-plyr')
let player=window.bricksData?.videoInstances?.[elementId]||undefined
if(player){player.destroy()}
if(video){player=new Plyr(video)}
window.bricksData.videoInstances[elementId]=player}
if(videoElement.hasAttribute('autoplay')){videoElement.setAttribute('playsinline',true)}}})
function bricksVideo(){bricksVideoFn.run()}
function bricksFacebookSDK(){let facebookPageElement=document.querySelector('.brxe-facebook-page')
if(!facebookPageElement){return}
let locale=window.bricksData.hasOwnProperty('locale')?window.bricksData.locale:'en_US'
let facebookAppId=window.bricksData.hasOwnProperty('facebookAppId')?window.bricksData.facebookAppId:null
let facebookSdkUrl=`https://connect.facebook.net/${locale}/sdk.js`let xhr=new XMLHttpRequest()
xhr.open('GET',facebookSdkUrl)
xhr.onreadystatechange=function(){if(this.readyState==4&&this.status==200){let fbScript=document.createElement('script')
if(!bricksIsFrontend&&window.bricksData?.builderCloudflareRocketLoader){fbScript.setAttribute('data-cfasync','false')}
fbScript.type='text/javascript'
fbScript.id='bricks-facebook-page-sdk'
fbScript.appendChild(document.createTextNode(xhr.responseText))
document.body.appendChild(fbScript)
FB.init({appId:facebookAppId,version:'v3.3',xfbml:true})}}
xhr.send()}
const bricksPrettifyFn=new BricksFunction({parentNode:document,selector:'.prettyprint.prettyprinted',run:()=>{if(!window.hasOwnProperty('PR')){return}
PR.prettyPrint()
let prettyprinted=bricksQuerySelectorAll(document,'.prettyprint.prettyprinted')
if(!bricksIsFrontend&&prettyprinted.length){prettyprinted.forEach((prettyprint)=>{prettyprint.classList.remove('prettyprinted')
PR.prettyPrint()})}}})
function bricksPrettify(){bricksPrettifyFn.run()}
function bricksSkipLinks(){let skipLinks=bricksQuerySelectorAll(document,'.skip-link')
if(!skipLinks){return}
skipLinks.forEach((link)=>{link.addEventListener('click',(e)=>{e.preventDefault()
let toElement=document.getElementById(link.href.split('#')[1])
if(toElement){toElement.setAttribute('tabindex','-1')
toElement.addEventListener('blur',()=>{toElement.removeAttribute('tabindex')},{once:true})
toElement.focus()}})})}
const bricksInteractionsFn=new BricksFunction({parentNode:document,selector:'[data-interactions]',frontEndOnly:true,eachElement:(sourceEl)=>{let interactions=[]
try{interactions=JSON.parse(sourceEl.dataset.interactions)}catch(e){console.info('error:bricksInteractions',e)
return false}
let interactionGroupId=sourceEl.dataset?.interactionId||false
if(!interactions||!interactionGroupId){return}
interactions.forEach((interaction)=>{let bindToDocument=false
if(!interaction?.trigger){return}
if(interaction.trigger==='scroll'){let scrollOffset=0
if(interaction?.scrollOffset){scrollOffset=interaction?.scrollOffset.replace('px','')
if(scrollOffset.includes('%')){let documentHeight=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight,document.body.offsetHeight,document.documentElement.offsetHeight,document.body.clientHeight,document.documentElement.clientHeight)
scrollOffset=(documentHeight / 100)*parseInt(scrollOffset)}else if(scrollOffset.includes('vh')){scrollOffset=(window.innerHeight / 100)*parseInt(scrollOffset)}}
interaction.scrollOffset=scrollOffset}else if(interaction.trigger==='mouseleaveWindow'){interaction.trigger='mouseleave'
bindToDocument=true}
if(!sourceEl){return}
interaction.el=sourceEl
interaction.groupId=bindToDocument?'document':interactionGroupId
if(!window.bricksData?.interactions){window.bricksData.interactions=[]}
window.bricksData.interactions.push(interaction)
switch(interaction.trigger){case'click':case'mouseover':case'mouseenter':case'mouseleave':case'focus':case'blur':let attachEl=bindToDocument?document.documentElement:sourceEl
attachEl.addEventListener(interaction.trigger,(e)=>bricksInteractionCallback(e,interaction),{once:interaction?.runOnce})
break
case'animationEnd':let targetAnimationId=interaction?.animationId||false
if(!targetAnimationId){let previousInteraction=window.bricksData.interactions.filter((int)=>{return(int.groupId===interactionGroupId&&int.action==='startAnimation'&&int.id!==interaction.id)})
if(previousInteraction.length){targetAnimationId=previousInteraction[previousInteraction.length-1].id}}
if(targetAnimationId&&targetAnimationId!==interaction.id){document.addEventListener(`bricks/animation/end/${targetAnimationId}`,(evt)=>{bricksInteractionCallbackExecution(sourceEl,interaction)},{once:interaction?.runOnce})}
break
case'contentLoaded':let delay=interaction?.delay||0
if(delay&&delay.includes('ms')){delay=parseInt(delay)}else if(delay&&delay.includes('s')){delay=parseFloat(delay)*1000}
setTimeout(()=>{bricksInteractionCallbackExecution(sourceEl,interaction)},delay)
break
case'enterView':new BricksIntersect({element:sourceEl,callback:(sourceEl)=>bricksInteractionCallbackExecution(sourceEl,interaction),once:interaction?.runOnce,trigger:interaction?.trigger,rootMargin:interaction?.rootMargin})
break
case'leaveView':new BricksIntersect({element:sourceEl,callback:(sourceEl)=>bricksInteractionCallbackExecution(sourceEl,interaction),once:interaction?.runOnce,trigger:interaction?.trigger})
break
case'showPopup':case'hidePopup':let listenEvent=interaction.trigger==='showPopup'?'bricks/popup/open':'bricks/popup/close'
document.addEventListener(listenEvent,(event)=>{let popupElement=event.detail?.popupElement||false
if(!popupElement||popupElement!==sourceEl){return}
bricksUtils.maybeRunOnceInteractions(sourceEl,interaction)})
break
case'ajaxStart':case'ajaxEnd':let ajaxEvent=interaction.trigger==='ajaxStart'?'bricks/ajax/start':'bricks/ajax/end'
let ajaxQueryId=interaction?.ajaxQueryId||false
if(!ajaxQueryId){return}
document.addEventListener(ajaxEvent,(event)=>{let queryId=event.detail?.queryId||false
if(!queryId){return}
if(queryId!==ajaxQueryId){return}
bricksUtils.maybeRunOnceInteractions(sourceEl,interaction)})
break
case'formSubmit':case'formSuccess':case'formError':let targetFormId=interaction?.formId
if(!targetFormId){return}
let formEvent=`bricks/form/${interaction.trigger.replace('form', '').toLowerCase()}`document.addEventListener(formEvent,(event)=>{let formId=event.detail?.elementId
if(!formId){return}
targetFormId=targetFormId.replace('#','')
targetFormId=targetFormId.replace('brxe-','')
if(formId!==targetFormId){return}
bricksUtils.maybeRunOnceInteractions(sourceEl,interaction)})
break
case'filterOptionEmpty':case'filterOptionNotEmpty':let filterElementId=interaction?.filterElementId||false
if(!filterElementId){return}
filterElementId=filterElementId.replace('#','')
filterElementId=filterElementId.replace('brxe-','')
let filterEvent=`bricks/filter/option/${interaction.trigger
      .replace('filterOption', '')
      .toLowerCase()}`document.addEventListener(filterEvent,(event)=>{let elementIds=event.detail?.filterElementIds||[]
if(!elementIds.length||!elementIds.includes(filterElementId)){return}
bricksUtils.maybeRunOnceInteractions(sourceEl,interaction)})
break
case'wooAddedToCart':case'wooAddingToCart':case'wooRemovedFromCart':case'wooUpdateCart':case'wooCouponApplied':case'wooCouponRemoved':if(typeof jQuery==='undefined'){return}
let wooEvent=null
if(interaction.trigger==='wooAddedToCart'){wooEvent='added_to_cart'}else if(interaction.trigger==='wooAddingToCart'){wooEvent='adding_to_cart'}else if(interaction.trigger==='wooRemovedFromCart'){wooEvent='item_removed_from_classic_cart'}else if(interaction.trigger==='wooUpdateCart'){wooEvent='updated_cart_totals'}else if(interaction.trigger==='wooCouponApplied'){wooEvent='applied_coupon applied_coupon_in_checkout'}else if(interaction.trigger==='wooCouponRemoved'){wooEvent='removed_coupon removed_coupon_in_checkout'}
if(wooEvent){jQuery(document.body).on(wooEvent,(event)=>{bricksUtils.maybeRunOnceInteractions(sourceEl,interaction)})}
break}})
bricksUtils.hideOrShowLoadMoreButtons('all')}})
function bricksInteractions(){bricksInteractionsFn.run()}
function bricksTrapFocus(event,node){if(event.key==='Tab'){const focusableElements=bricksGetVisibleFocusables(node)
const firstFocusableElement=focusableElements[0]
const lastFocusableElement=focusableElements[focusableElements.length-1]
if(event.shiftKey){if(document.activeElement===firstFocusableElement){lastFocusableElement.focus()
event.preventDefault()}}else{if(document.activeElement===lastFocusableElement){firstFocusableElement.focus()
event.preventDefault()}}}}
function bricksFocusOnFirstFocusableElement(node,waitForVisible=true){let focusableElements=bricksGetFocusables(node)
let firstFocusableElement=focusableElements[0]
if(!firstFocusableElement)return
if(!waitForVisible){firstFocusableElement.focus()
return}
let maxTries=60
let tries=0
function canReceiveFocus(element){const style=window.getComputedStyle(element)
if(style.display==='none'||style.visibility!=='visible'||parseFloat(style.opacity)<0.1){return false}
const rect=element.getBoundingClientRect()
if(rect.width===0||rect.height===0)return false
if(rect.bottom<0||rect.top>window.innerHeight||rect.right<0||rect.left>window.innerWidth){return false}
return true}
function tryFocus(){if(canReceiveFocus(firstFocusableElement)){firstFocusableElement.focus()}else if(tries++<maxTries){requestAnimationFrame(tryFocus)}else{console.warn('Element never became focusable:',firstFocusableElement)}}
requestAnimationFrame(tryFocus)}
function bricksPopups(){let lastFocusedElement=null
const escClosePopup=(event,popupElement)=>{if(event.key==='Escape'){bricksClosePopup(popupElement)}}
const backdropClosePopup=(event,popupElement)=>{if(event.target.classList.contains('brx-popup-backdrop')){bricksClosePopup(popupElement)}
else if(event.target.classList.contains('brx-popup')){bricksClosePopup(popupElement)}}
document.addEventListener('bricks/popup/open',(event)=>{const popupElement=event.detail?.popupElement||false
if(!popupElement||!bricksIsFrontend){return}
if(popupElement.classList.contains('brx-infobox-popup')){return}
const popupCloseOn=popupElement.dataset?.popupCloseOn||'backdrop-esc'
if(popupCloseOn.includes('esc')){const escEventHandler=(event)=>escClosePopup(event,popupElement)
document.addEventListener('keyup',escEventHandler)
document.addEventListener('bricks/popup/close',()=>{document.removeEventListener('keyup',escEventHandler)})}
if(popupCloseOn.includes('backdrop')){const backdropEventHandler=(event)=>backdropClosePopup(event,popupElement)
document.addEventListener('click',backdropEventHandler)
document.addEventListener('bricks/popup/close',()=>{document.removeEventListener('click',backdropEventHandler)})}
lastFocusedElement=document.activeElement
if(popupElement.dataset?.popupScrollToTop){popupElement.querySelector('.brx-popup-content')?.scrollTo(0,0)}
if(!popupElement.dataset?.popupDisableAutoFocus){const focusables=bricksGetFocusables(popupElement)
const firstFocusable=focusables.length>0?focusables[0]:null
if(firstFocusable){popupElement.querySelector('.brx-popup-content')?.scrollTo(0,0)
const elementRect=firstFocusable.getBoundingClientRect()
const containerRect=popupElement.querySelector('.brx-popup-content').getBoundingClientRect()
const scrollTop=elementRect.top-containerRect.top+popupElement.scrollTop-10
popupElement.querySelector('.brx-popup-content').scrollTo({top:scrollTop})}}
setTimeout(()=>{if(!popupElement.dataset?.popupDisableAutoFocus){bricksFocusOnFirstFocusableElement(popupElement)}
if(popupElement.dataset?.popupScrollToTop){popupElement.querySelector('.brx-popup-content')?.scrollTo({top:0,left:0,behavior:'smooth'})}},100)
const focusTrapEventHandler=(event)=>bricksTrapFocus(event,popupElement)
document.addEventListener('keydown',focusTrapEventHandler)
document.addEventListener('bricks/popup/close',()=>{document.removeEventListener('keydown',focusTrapEventHandler)
if(lastFocusedElement){lastFocusedElement.focus()}})})}
function bricksScrollInteractions(){let interactions=Array.isArray(window.bricksData?.interactions)?window.bricksData.interactions:[]
let scrolled=window.scrollY
let runOnceIndexToRemove=[]
interactions.forEach((interaction,index)=>{if(interaction?.trigger!=='scroll'){return}
if(scrolled>=interaction.scrollOffset){bricksInteractionCallbackExecution(interaction.el,interaction)
if(interaction?.runOnce){runOnceIndexToRemove.push(interaction.id)}}})
runOnceIndexToRemove.forEach((interactionId)=>{window.bricksData.interactions=window.bricksData.interactions.filter((interaction)=>interaction.id!==interactionId)})}
function bricksInteractionCallback(event,interaction){if(event?.type==='click'){if(event.target.tagName==='A'&&event.target.getAttribute('href')!=='#'&&event.target.getAttribute('href')?.startsWith('#')){return}
if(!interaction?.disablePreventDefault){event.preventDefault()}}
bricksInteractionCallbackExecution(interaction.el,interaction)}
function bricksInteractionCallbackExecution(sourceEl,config){const targetMode=config?.target||'self'
let target
switch(targetMode){case'custom':if(config?.targetSelector){target=bricksQuerySelectorAll(document,config.targetSelector)}
break
case'popup':if(config?.templateId){if(sourceEl.dataset?.interactionLoopId){target=bricksQuerySelectorAll(document,`.brx-popup[data-popup-id="${config.templateId}"][data-popup-loop-id="${sourceEl.dataset.interactionLoopId}"]`)}
if(!target||!target.length){target=bricksQuerySelectorAll(document,`.brx-popup[data-popup-id="${config.templateId}"]`)}}
break
case'offcanvas':if(config?.offCanvasSelector){target=sourceEl}
break
default:target=sourceEl}
if(!target){return}
target=Array.isArray(target)?target:[target]
if(!bricksInteractionCheckConditions(config)){switch(config?.action){case'startAnimation':target.forEach((el)=>{el.removeAttribute('data-interaction-hidden-on-load')})
break}
return}
switch(config?.action){case'show':case'hide':target.forEach((el)=>{if(el?.classList.contains('brx-popup')){if(config.action==='show'){let extraParams={}
if(config?.popupContextId){extraParams.popupContextId=config.popupContextId}
if(config?.popupContextType){extraParams.popupContextType=config.popupContextType}
if(sourceEl.dataset?.interactionLoopId){extraParams.loopId=sourceEl.dataset.interactionLoopId}
bricksOpenPopup(el,0,extraParams)}else if(config.action==='hide'){bricksClosePopup(el)}}
else{if(config.action==='hide'){el.style.display='none'}
else{if(el.style.display==='none'){el.style.display=null
let styles=window.getComputedStyle(el)
if(styles.display==='none'){el.style.display='block'}}else{el.style.display='block'}}}})
break
case'setAttribute':case'removeAttribute':case'toggleAttribute':const attributeKey=config?.actionAttributeKey
if(attributeKey){target.forEach((el)=>{let attributeValue=config?.actionAttributeValue||''
if(attributeKey==='class'){let classNames=attributeValue?attributeValue.split(' '):[]
classNames.forEach((className)=>{if(config.action==='setAttribute'){el.classList.add(className)}else if(config.action==='removeAttribute'){el.classList.remove(className)}else{el.classList.toggle(className)}})}
else{if(config.action==='setAttribute'){el.setAttribute(attributeKey,attributeValue)}else if(config.action==='removeAttribute'){el.removeAttribute(attributeKey)}else{if(el.hasAttribute(attributeKey)){el.removeAttribute(attributeKey)}else{el.setAttribute(attributeKey,attributeValue)}}}})}
break
case'scrollTo':const scrollTarget=target[0]
if(!scrollTarget||!scrollTarget.scrollIntoView){return}
let offset=config?.scrollToOffset||0
let delay=config?.scrollToDelay||1
setTimeout(()=>{if(typeof offset==='string'){offset=offset.replace('px','')}
let targetOffsetTop=scrollTarget.getBoundingClientRect().top
window.scrollBy(0,targetOffsetTop-parseInt(offset))},parseInt(delay))
break
case'clearForm':const formSelector=config?.targetFormSelector
let formElements=null
if(['formSubmit','formSuccess','formError'].includes(config.trigger)){let formSelectorId=config?.formId
formSelectorId=formSelectorId.replace('#','')
formSelectorId=formSelectorId.replace('brxe-','')
formElements=document.querySelectorAll(`.brxe-form[data-element-id="${formSelectorId}"]`)}
else if(!formSelector){formElements=document.querySelectorAll('form')}else{formElements=document.querySelectorAll(formSelector)}
if(formElements&&formElements.length){formElements.forEach((form)=>{const inputs=form.querySelectorAll('input, textarea, select')
inputs.forEach((input)=>{if(input.tagName==='SELECT'){input.selectedIndex=0}else if(input.tagName==='TEXTAREA'){input.value=''}else if(input.type==='checkbox'||input.type==='radio'){input.checked=false}else{input.value=''}})
const fileResults=form.querySelectorAll('.file-result.show > .bricks-button.remove')
fileResults.forEach((fileResult)=>{fileResult.click()})})}
break
case'storageAdd':case'storageRemove':case'storageCount':const storageType=config?.storageType
const storageKey=config?.actionAttributeKey
const storageValue=config.hasOwnProperty('actionAttributeValue')?config.actionAttributeValue:0
if(storageType&&storageKey){if(config.action==='storageAdd'){bricksStorageSetItem(storageType,storageKey,storageValue)}else if(config.action==='storageRemove'){bricksStorageRemoveItem(storageType,storageKey)}else if(config.action==='storageCount'){let counter=bricksStorageGetItem(storageType,storageKey)
counter=counter?parseInt(counter):0
bricksStorageSetItem(storageType,storageKey,counter+1)}}
break
case'startAnimation':const animationType=config?.animationType
if(animationType){let animationDelay=0
if(config?.animationDelay){if(config.animationDelay.includes('ms')){animationDelay=parseInt(config.animationDelay)}else if(config.animationDelay.includes('s')){animationDelay=parseFloat(config.animationDelay)*1000}}
setTimeout(()=>{target.forEach((el)=>{let removeAnimationAfterMs=1000
let isPopup=el?.classList.contains('brx-popup')
if(isPopup){el=el.querySelector('.brx-popup-content')}
if(config?.animationDuration){el.style.animationDuration=config.animationDuration
if(config.animationDuration.includes('ms')){removeAnimationAfterMs=parseInt(config.animationDuration)}else if(config.animationDuration.includes('s')){removeAnimationAfterMs=parseFloat(config.animationDuration)*1000}}
if(config?.animationDelay){removeAnimationAfterMs+=animationDelay}
if(isPopup&&config.trigger!=='showPopup'&&config.trigger!=='hidePopup'){let popupNode=el.parentNode
let extraParams={}
if(sourceEl.dataset?.interactionLoopId){extraParams.loopId=sourceEl.dataset.interactionLoopId}
if(animationType.includes('In')){bricksOpenPopup(popupNode,removeAnimationAfterMs,extraParams)}}
el.classList.add('brx-animated')
el.setAttribute('data-animation',animationType)
el.setAttribute('data-animation-id',config.id||'')
bricksAnimationFn.run({elementsToAnimate:[el],removeAfterMs:removeAnimationAfterMs})})},animationDelay)}
break
case'loadMore':const queryId=config?.loadMoreQuery
const queryConfig=window.bricksData.queryLoopInstances?.[queryId]
if(!queryConfig){return}
const componentId=queryConfig?.componentId||false
let selectorId=componentId?componentId:queryId
if(selectorId.includes('-')){selectorId=selectorId.split('-')[0]}
const queryTrail=Array.from(queryConfig.resultsContainer?.querySelectorAll(`.brxe-${selectorId}:not(.brx-popup)`)).pop()
if(queryTrail){if(!sourceEl.classList.contains('is-loading')){sourceEl.classList.add('is-loading')
queryTrail.dataset.queryElementId=queryId
if(componentId){queryTrail.dataset.queryComponentId=componentId}
bricksQueryLoadPage(queryTrail,true).then((data)=>{sourceEl.classList.remove('is-loading')
bricksUtils.hideOrShowLoadMoreButtons(queryId)})}}
break
case'javascript':if(config?.jsFunction){let userFunction=window[config.jsFunction]??false
if(config.jsFunction.includes('.')){const jsFunctionParts=config.jsFunction.split('.')
let tempFunctionTest=window
jsFunctionParts.forEach((part)=>{tempFunctionTest=tempFunctionTest[part]})
if(typeof tempFunctionTest==='function'){userFunction=tempFunctionTest}}
if(userFunction&&typeof userFunction==='function'){let brxParams={source:sourceEl,targets:target}
let customParams={}
if(config?.jsFunctionArgs){if(Array.isArray(config.jsFunctionArgs)){config.jsFunctionArgs.forEach((arg,index)=>{if(arg?.jsFunctionArg&&arg?.id){let key=arg.id
let value=arg.jsFunctionArg
if(arg.jsFunctionArg==='%brx%'){key=arg.jsFunctionArg
value=brxParams}
customParams[key]=value}})}}
target.forEach((el)=>{if(customParams?.['%brx%']){customParams['%brx%'].target=el}
if(Object.keys(customParams).length){userFunction(...Object.keys(customParams).map((key)=>customParams[key]))}else{userFunction()}})}else{console.error(`Bricks interaction: Custom JavaScript function "${config.jsFunction}" not found.`)}}
break
case'toggleOffCanvas':const offCanvasSelector=config?.offCanvasSelector||false
if(!offCanvasSelector){return}
bricksUtils.toggleAction(sourceEl,{selector:offCanvasSelector})
break
case'openAddress':case'closeAddress':target.forEach((el)=>{bricksUtils.toggleMapInfoBox(config)})
break}}
function bricksOpenPopup(object,timeout=0,additionalParam={}){if(!bricksIsFrontend){return}
let popupElement
if(object){if(object.nodeType===Node.ELEMENT_NODE){popupElement=object}
else if(object){popupElement=document.querySelector(`.brx-popup[data-popup-id="${object}"]`)}}
if(!popupElement){return}
const popupId=popupElement.dataset.popupId
if(!bricksPopupCheckLimit(popupElement)){return}
if(!bricksPopupCheckBreakpoint(popupElement)){return}
popupElement.classList.remove('hide')
if(!popupElement.dataset.popupBodyScroll){document.body.classList.add('no-scroll')}
bricksSetVh()
bricksFetchPopupContent(popupElement,additionalParam).then((content)=>{if(content!==''){popupElement.querySelector('.brx-popup-content').innerHTML=content
const popupContentLoadedEvent=new CustomEvent('bricks/ajax/popup/loaded',{detail:{popupId,popupElement}})
document.dispatchEvent(popupContentLoadedEvent)}
const showPopupEvent=new CustomEvent('bricks/popup/open',{detail:{popupId,popupElement}})
document.dispatchEvent(showPopupEvent)
setTimeout(()=>{bricksCounter()},timeout)
bricksPopupCounter(popupElement)})}
function bricksFetchPopupContent(popupElement,additionalParam={},nonceRefreshed=false){return new Promise((resolve,reject)=>{const isAjax=popupElement.dataset?.popupAjax||false
if(!isAjax){resolve('')
return}
popupElement.querySelector('.brx-popup-content').innerHTML=''
let popupElementId=popupElement.dataset.popupId
let ajaxData={postId:window.bricksData.postId,popupId:popupElementId,nonce:window.bricksData.nonce,popupContextId:false,popupContextType:'post',isLooping:false,popupLoopId:false,queryElementId:false,lang:window.bricksData.language||false,mainQueryId:window.bricksData.mainQueryId||false}
if(additionalParam?.loopId){ajaxData.isLooping=true}
if(additionalParam?.popupContextId){ajaxData.popupContextId=additionalParam.popupContextId
if(additionalParam?.popupContextType){ajaxData.popupContextType=additionalParam.popupContextType}}
if(additionalParam?.loopId&&!ajaxData.popupContextId){let loopParts=additionalParam.loopId.split(':')
if(loopParts.length>=4&&loopParts[0].length>=6){ajaxData.queryElementId=loopParts[0]
ajaxData.popupLoopId=additionalParam.loopId}}
let url=window.bricksData.restApiUrl.concat('load_popup_content')
if(window.bricksData.multilangPlugin==='wpml'&&(window.location.search.includes('lang=')||window.bricksData.wpmlUrlFormat!=3)){url=url.concat('?lang='+window.bricksData.language)}
document.dispatchEvent(new CustomEvent('bricks/ajax/popup/start',{detail:{popupId:popupElementId,popupElement:popupElement}}))
if(ajaxData.isLooping){popupElement.querySelector('.brx-popup-backdrop')?.removeAttribute('data-query-loop-index')}
let xhr=new XMLHttpRequest()
xhr.open('POST',url,true)
xhr.setRequestHeader('Content-Type','application/json; charset=UTF-8')
xhr.setRequestHeader('X-WP-Nonce',window.bricksData.wpRestNonce)
xhr.onreadystatechange=function(){if(xhr.readyState===XMLHttpRequest.DONE){let status=xhr.status
let popupContent=''
let res
try{res=JSON.parse(xhr.response)}catch(e){console.error('Error parsing response:',e)}
if(status===0||(status>=200&&status<400)){const html=res?.html||false
const styles=res?.styles||false
const popups=res?.popups||false
const error=res?.error||false
const contentClasses=res?.contentClasses||false
if(error){console.error('error:bricksFetchPopupContent',error)}
if(html){popupContent=html}
if(styles){popupContent+=styles}
if(contentClasses){const popupContentNode=popupElement.querySelector('.brx-popup-content.brx-woo-quick-view')
if(popupContentNode){let classesToKeep=['brx-popup-content','brxe-container','brx-woo-quick-view']
popupContentNode.classList.forEach((className)=>{if(!classesToKeep.includes(className)){popupContentNode.classList.remove(className)}})
popupContentNode.classList.add(...contentClasses)
if(!document.body.classList.contains('woocommerce')){popupContentNode.classList.add('woocommerce')}}}
if(popups&&Object.keys(popups).length){Object.entries(popups).forEach(([popupId,popupHtml])=>{if(!document.querySelector(`.brx-popup[data-popup-id="${popupId}"]`)){document.body.insertAdjacentHTML('beforeend',popupHtml)}})}
if(ajaxData.isLooping){popupElement.querySelector('.brx-popup-backdrop')?.setAttribute('data-query-loop-index',0)}}else if(res?.code==='rest_cookie_invalid_nonce'&&!nonceRefreshed){bricksRegenerateNonceAndRetryPopup(popupElement,additionalParam).then(resolve).catch(reject)
return}
resolve(popupContent)
document.dispatchEvent(new CustomEvent('bricks/ajax/popup/end',{detail:{popupId:popupElementId,popupElement:popupElement}}))}}
xhr.send(JSON.stringify(ajaxData))})}
function bricksRegenerateNonceAndRetryPopup(popupElement,additionalParam){return new Promise((resolve,reject)=>{let xhrNonce=new XMLHttpRequest()
xhrNonce.open('POST',window.bricksData.ajaxUrl,true)
xhrNonce.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
xhrNonce.onreadystatechange=function(){if(xhrNonce.readyState===XMLHttpRequest.DONE){if(xhrNonce.status>=200&&xhrNonce.status<400){let response
try{response=JSON.parse(xhrNonce.responseText)}catch(e){reject('Invalid response from server when regenerating nonce')
return}
if(response.success&&response.data){window.bricksData.nonce=response.data.bricks_nonce
window.bricksData.wpRestNonce=response.data.rest_nonce
bricksFetchPopupContent(popupElement,additionalParam,true).then(resolve).catch(reject)}else{reject('Failed to regenerate nonces: Invalid response structure')}}else{reject('Failed to regenerate nonce')}}}
xhrNonce.send('action=bricks_regenerate_query_nonce')})}
function bricksClosePopup(object){if(!bricksIsFrontend){return}
let popupElement
if(object){if(object.nodeType===Node.ELEMENT_NODE){popupElement=object}
else if(object){popupElement=document.querySelector(`.brx-popup[data-popup-id="${object}"]`)}}
if(!popupElement){return}
const popupId=popupElement.dataset.popupId
popupElement.classList.add('hide')
if(!popupElement.dataset.popupBodyScroll){if(!document.querySelectorAll('.brx-popup:not(.hide):not([data-popup-body-scroll])').length){document.body.classList.remove('no-scroll')}}
const hidePopupEvent=new CustomEvent('bricks/popup/close',{detail:{popupId,popupElement}})
document.dispatchEvent(hidePopupEvent)}
function bricksPopupCheckLimit(element){let limits=element?.dataset?.popupLimits
let popupId=element?.dataset?.popupId
if(!limits){return true}
try{limits=JSON.parse(limits)}catch(e){console.info('error:bricksPopupCheckLimit',e)
return true}
let overflow=false
let now=Date.now()
Object.entries(limits).forEach(([key,value])=>{if(key==='timeStorageInHours'){let lastShown=parseInt(bricksStorageGetItem('localStorage',`brx_popup_${popupId}_lastShown`))
let nextAllowedShowTime=lastShown+value*3600000
if(now<nextAllowedShowTime){overflow=true}}else{let counter=bricksStorageGetItem(key,`brx_popup_${popupId}_total`)
counter=counter?parseInt(counter):0
overflow=overflow||counter>=value}})
if(!overflow&&limits.timeStorageInHours){bricksStorageSetItem('localStorage',`brx_popup_${popupId}_lastShown`,now.toString())}
return!overflow}
function bricksPopupCheckBreakpoint(popupElement){if(!popupElement?.classList?.contains('brx-popup')){return false}
const popupBreakpoint=parseInt(popupElement.getAttribute('data-popup-show-at'))
if(popupBreakpoint){if(window.innerWidth<popupBreakpoint){return false}}
const attributeValue=popupElement.getAttribute('data-popup-show-on-widths')
const showOnWidthRanges=attributeValue?attributeValue.split(','):[]
if(showOnWidthRanges.length){const withinSelectedBreakpoints=showOnWidthRanges.some((range)=>{const[min,max]=range.split('-').map((value)=>{const numberValue=Number(value)
if(isNaN(numberValue)){console.error(`Invalid width value: ${value}`)
return 0}
return numberValue})
return window.innerWidth>=min&&window.innerWidth<=max})
if(!withinSelectedBreakpoints){return false}}
return true}
function bricksPopupCounter(element){let limits=element?.dataset?.popupLimits
let popupId=element?.dataset?.popupId
if(!limits){return}
try{limits=JSON.parse(limits)}catch(e){console.info('error:bricksPopupCounter',e)
return true}
Object.entries(limits).forEach(([key,value])=>{let counter=bricksStorageGetItem(key,`brx_popup_${popupId}_total`)
counter=counter?parseInt(counter):0
bricksStorageSetItem(key,`brx_popup_${popupId}_total`,counter+1)})}
function bricksInteractionCheckConditions(config){if(!Array.isArray(config?.interactionConditions)){return true}
let relation=config?.interactionConditionsRelation||'and'
let runInteraction=relation==='and'
const convertToNumber=(value)=>(!isNaN(value)?parseFloat(value):0)
config.interactionConditions.forEach((condition)=>{let conditionType=condition?.conditionType
let storageKey=condition?.storageKey||false
let runCondition=false
if(conditionType&&storageKey){let storageCompare=condition?.storageCompare||'exists'
let storageCompareValue=condition?.storageCompareValue
let storageValue=bricksStorageGetItem(conditionType,storageKey)
switch(storageCompare){case'exists':runCondition=storageValue!==null
break
case'notExists':runCondition=storageValue===null
break
case'==':runCondition=storageValue==storageCompareValue
break
case'!=':runCondition=storageValue!=storageCompareValue
break
case'>=':runCondition=convertToNumber(storageValue)>=convertToNumber(storageCompareValue)
break
case'<=':runCondition=convertToNumber(storageValue)<=convertToNumber(storageCompareValue)
break
case'>':runCondition=convertToNumber(storageValue)>convertToNumber(storageCompareValue)
break
case'<':runCondition=convertToNumber(storageValue)<convertToNumber(storageCompareValue)
break}}else{runCondition=true}
runInteraction=relation==='and'?runInteraction&&runCondition:runInteraction||runCondition})
return runInteraction}
function bricksStorageGetItem(type,key){if(!key){return}
let value
try{switch(type){case'windowStorage':value=window.hasOwnProperty(key)?window[key]:null
break
case'sessionStorage':value=sessionStorage.getItem(key)
break
case'localStorage':value=localStorage.getItem(key)
break}}catch(e){console.info('error:bricksStorageGetItem',e)}
return value}
function bricksStorageSetItem(type,key,value){if(!key){return}
try{switch(type){case'windowStorage':window[key]=value
break
case'sessionStorage':sessionStorage.setItem(key,value)
break
case'localStorage':localStorage.setItem(key,value)
break}}catch(e){console.info('error:bricksStorageSetItem',e)}}
function bricksStorageRemoveItem(type,key){if(!key){return}
try{switch(type){case'windowStorage':delete window[key]
break
case'sessionStorage':sessionStorage.removeItem(key)
break
case'localStorage':localStorage.removeItem(key)
break}}catch(e){console.info('error:bricksStorageRemoveItem',e)}}
function bricksNavNested(){if(!bricksIsFrontend){return}
let navNestedObserver=new MutationObserver((mutations)=>{mutations.forEach((mutation)=>{if(mutation.type==='attributes'&&mutation.attributeName==='class'){let navNested=mutation.target
if(navNested.classList.contains('brx-open')&&!navNested.classList.contains('brx-closing')){bricksSetVh()
let navNestedItems=navNested.querySelector('.brx-nav-nested-items')
if(navNestedItems){navNestedItems.addEventListener('keydown',(event)=>bricksTrapFocus(event,navNestedItems))}
document.body.classList.add('no-scroll')
let toggleInside=navNested.querySelector('.brx-nav-nested-items button.brxe-toggle')
if(toggleInside){setTimeout(()=>{toggleInside.classList.add('is-active')
toggleInside.setAttribute('aria-expanded',true)
toggleInside.focus()},100)}
else{bricksFocusOnFirstFocusableElement(navNested,false)}}
else{document.body.classList.remove('no-scroll')
let toggleScriptId=navNested.dataset.toggleScriptId
let toggleNode=document.querySelector(`button[data-script-id="${toggleScriptId}"],[data-interaction-id="${toggleScriptId}"][data-brx-toggle-offcanvas]`)
if(toggleNode){toggleNode.setAttribute('aria-expanded',false)
toggleNode.classList.remove('is-active')
toggleNode.focus()}}}})})
let navNestedElements=bricksQuerySelectorAll(document,'.brxe-nav-nested')
if(!navNestedElements.length){return}
navNestedElements.forEach((navNested)=>{navNestedObserver.observe(navNested,{attributes:true,attributeFilter:['class']})
navNested.addEventListener('keydown',(event)=>{const focusedElement=document.activeElement
const isTopLevel=focusedElement.closest('.brx-nav-nested-items > li, .brx-nav-nested-items > .brxe-dropdown')!==null
const isInDropdown=focusedElement.closest('.brx-dropdown-content')!==null
const isInSubmenuToggle=focusedElement.closest('.brx-submenu-toggle')!==null
bricksHandleMenuKeyNavigation(event,{isTopLevel,isInDropdown,isInSubmenuToggle,getNextFocusable:bricksGetNextMenuFocusableInSubmenuToggle,getPreviousFocusable:bricksGetPreviousMenuFocusableInSubmenuToggle,getLastFocusableInSubmenuToggle:bricksMenuGetLastFocusableInSubmenuToggle,focusNextElement:(el)=>bricksMenuFocusNextElement(el,'.brx-nav-nested-items'),focusPreviousElement:(el)=>bricksMenuFocusPreviousElement(el,'.brx-nav-nested-items'),focusFirstElement:bricksMenuFocusFirstElement,focusLastElement:bricksMenuFocusLastElement,closeSubmenu:(toggleButton)=>bricksSubmenuToggle(toggleButton,'remove')})})})
document.addEventListener('keyup',(e)=>{if(e.key==='Escape'){bricksNavNestedClose()}})
document.addEventListener('click',(e)=>{let navNested=e.target.closest('.brxe-nav-nested')
let clickOnToggle=e.target.closest('.brxe-toggle')
if(!navNested&&!clickOnToggle){bricksNavNestedClose()}})}
function bricksNavNestedClose(){let navNestedOpen=bricksQuerySelectorAll(document,'.brxe-nav-nested.brx-open')
navNestedOpen.forEach((navNested)=>{navNested.classList.add('brx-closing')
setTimeout(()=>{navNested.classList.remove('brx-closing')
navNested.classList.remove('brx-open')},200)})}
const bricksNavMenuFn=new BricksFunction({parentNode:document,selector:'.brxe-nav-menu',eachElement:(element)=>{element.addEventListener('keydown',(event)=>{const focusedElement=document.activeElement
const isTopLevel=focusedElement.closest('.bricks-nav-menu > li')!==null
const isInDropdown=focusedElement.closest('.sub-menu')!==null
const isInSubmenuToggle=focusedElement.closest('.brx-submenu-toggle')!==null
bricksHandleMenuKeyNavigation(event,{isTopLevel,isInDropdown,isInSubmenuToggle,getNextFocusable:bricksGetNextMenuFocusableInSubmenuToggle,getPreviousFocusable:bricksGetPreviousMenuFocusableInSubmenuToggle,getLastFocusableInSubmenuToggle:bricksMenuGetLastFocusableInSubmenuToggle,focusNextElement:(el)=>bricksMenuFocusNextElement(el,'.bricks-nav-menu'),focusPreviousElement:(el)=>bricksMenuFocusPreviousElement(el,'.bricks-nav-menu'),focusFirstElement:bricksMenuFocusFirstElement,focusLastElement:bricksMenuFocusLastElement,closeSubmenu:(toggleButton)=>{toggleButton.setAttribute('aria-expanded','false')
toggleButton.closest('.menu-item-has-children').classList.remove('open')}})})}})
function bricksNavMenu(){bricksNavMenuFn.run()}
function bricksHandleMenuKeyNavigation(event,options){const{isTopLevel,isInDropdown,isInSubmenuToggle,getNextFocusable,getPreviousFocusable,getLastFocusableInSubmenuToggle,focusNextElement,focusPreviousElement,focusFirstElement,focusLastElement,closeSubmenu}=options
const key=event.key
const focusedElement=document.activeElement
if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'].includes(key)){event.preventDefault()}
const isRTL=document.dir==='rtl'||document.documentElement.dir==='rtl'||focusedElement.closest('[dir="rtl"]')!==null
const nextKey=isRTL?'ArrowLeft':'ArrowRight'
const prevKey=isRTL?'ArrowRight':'ArrowLeft'
switch(key){case'ArrowDown':if(isTopLevel){if(isInSubmenuToggle){const submenuToggle=focusedElement.closest('.brx-submenu-toggle')
const dropdown=submenuToggle.nextElementSibling
const toggleButton=submenuToggle.querySelector('button[aria-expanded]')
if(dropdown&&(dropdown.classList.contains('brx-dropdown-content')||dropdown.classList.contains('sub-menu'))&&toggleButton&&toggleButton.getAttribute('aria-expanded')==='true'){const firstLink=dropdown.querySelector('a, button')
if(firstLink){firstLink.focus()}}else{focusNextElement(focusedElement)}}else{focusNextElement(focusedElement)}}else if(isInDropdown){focusNextElement(focusedElement)}
break
case nextKey:if(isTopLevel){if(isInSubmenuToggle){const nextFocusable=getNextFocusable(focusedElement,isRTL)
if(nextFocusable){nextFocusable.focus()}else{focusNextElement(focusedElement.closest('.brxe-dropdown, .menu-item'))}}else{focusNextElement(focusedElement)}}
break
case'ArrowUp':if(isTopLevel){focusPreviousElement(focusedElement)}else if(isInDropdown){const prevElement=focusPreviousElement(focusedElement)
if(!prevElement){const parentToggle=focusedElement.closest('.brxe-dropdown').querySelector('.brx-submenu-toggle')
if(parentToggle){const focusTarget=getLastFocusableInSubmenuToggle(parentToggle,isRTL)
if(focusTarget)focusTarget.focus()}}}
break
case prevKey:if(isTopLevel){if(isInSubmenuToggle){const prevFocusable=getPreviousFocusable(focusedElement,isRTL)
if(prevFocusable){prevFocusable.focus()}else{focusPreviousElement(focusedElement.closest('.brxe-dropdown, .menu-item'))}}else{focusPreviousElement(focusedElement)}}else if(isInDropdown){const prevElement=focusPreviousElement(focusedElement)
if(!prevElement){const parentToggle=focusedElement.closest('.brxe-dropdown').querySelector('.brx-submenu-toggle')
if(parentToggle){const focusTarget=getLastFocusableInSubmenuToggle(parentToggle,isRTL)
if(focusTarget)focusTarget.focus()}}}
break
case'Home':focusFirstElement(isInDropdown?focusedElement.closest('.sub-menu, .brx-dropdown-content'):focusedElement.closest('.bricks-nav-menu, .brx-nav-nested-items'))
break
case'End':focusLastElement(isInDropdown?focusedElement.closest('.sub-menu, .brx-dropdown-content'):focusedElement.closest('.bricks-nav-menu, .brx-nav-nested-items'))
break}}
function bricksMenuFocusNextElement(currentElement,menuSelector){if(!currentElement){return null}
const parent=currentElement.closest('ul')||currentElement.closest(menuSelector)
if(!parent){return null}
const items=Array.from(parent.children).filter((item)=>item.querySelector('a, button, .brx-submenu-toggle'))
const currentIndex=items.findIndex((item)=>item.contains(currentElement))
const nextItem=items[currentIndex+1]
if(!nextItem){return null}
let focusTarget
if(nextItem.querySelector('.brx-submenu-toggle')){const submenuToggle=nextItem.querySelector('.brx-submenu-toggle')
const link=submenuToggle.querySelector('a')
const button=submenuToggle.querySelector('button')
focusTarget=link||button}else{focusTarget=nextItem.querySelector('a')||nextItem.querySelector('button')}
if(focusTarget){focusTarget.focus()}
return focusTarget}
function bricksMenuFocusPreviousElement(currentElement,menuSelector){if(!currentElement){return null}
const parent=currentElement.closest('ul')||currentElement.closest(menuSelector)
if(!parent){return null}
const items=Array.from(parent.children).filter((item)=>item.querySelector('a, button, .brx-submenu-toggle'))
const currentIndex=items.findIndex((item)=>item.contains(currentElement))
const prevItem=items[currentIndex-1]
if(!prevItem)return null
let focusTarget
if(prevItem.querySelector('.brx-submenu-toggle')){focusTarget=prevItem.querySelector('.brx-submenu-toggle button')||prevItem.querySelector('.brx-submenu-toggle a')}else{focusTarget=prevItem.querySelector('a')||prevItem.querySelector('button')||prevItem.querySelector('.brx-submenu-toggle')}
if(focusTarget){focusTarget.focus()}
return focusTarget}
function bricksMenuFocusFirstElement(container){const focusableElements=bricksGetFocusables(container)
if(focusableElements.length>0){const firstElement=focusableElements[0]
if(firstElement.classList.contains('brx-submenu-toggle')){const firstFocusableInToggle=firstElement.querySelector('a, button')
if(firstFocusableInToggle)firstFocusableInToggle.focus()}else{firstElement.focus()}}}
function bricksMenuFocusLastElement(container){const focusableElements=bricksGetFocusables(container)
if(focusableElements.length>0){for(let i=focusableElements.length-1;i>=0;i--){const element=focusableElements[i]
if(bricksIsElementVisible(element)){if(element.classList.contains('brx-submenu-toggle')){const lastFocusableInToggle=element.querySelector('button')||element.querySelector('a')
if(lastFocusableInToggle&&bricksIsElementVisible(lastFocusableInToggle)){lastFocusableInToggle.focus()
return}}else{element.focus()
return}}}}}
function bricksGetNextMenuFocusableInSubmenuToggle(element,isRTL){const submenuToggle=element.closest('.brx-submenu-toggle')
const focusables=Array.from(submenuToggle.querySelectorAll('a, button'))
if(element.tagName.toLowerCase()==='a'){return focusables[1]}
return null}
function bricksGetPreviousMenuFocusableInSubmenuToggle(element,isRTL){const submenuToggle=element.closest('.brx-submenu-toggle')
const focusables=Array.from(submenuToggle.querySelectorAll('a, button'))
if(element.tagName.toLowerCase()==='button'){const link=focusables.find((el)=>el.tagName.toLowerCase()==='a')
return link||null}
return null}
function bricksMenuGetLastFocusableInSubmenuToggle(submenuToggle,isRTL){const focusables=Array.from(submenuToggle.querySelectorAll('a, button'))
return isRTL?focusables[0]:focusables[focusables.length-1]}
function bricksIsElementVisible(element){const rect=element.getBoundingClientRect()
const style=window.getComputedStyle(element)
return(rect.width>0&&rect.height>0&&style.visibility!=='hidden'&&style.display!=='none')}
function bricksOffcanvas(){if(!bricksIsFrontend){return}
let offcanvasElements=bricksQuerySelectorAll(document,'.brxe-offcanvas')
if(!offcanvasElements.length){return}
let isOffsetOnPageLoad=offcanvasElements.some((offcanvas)=>{return offcanvas.classList.contains('brx-open')&&offcanvas.dataset.effect==='offset'})
const offcanvasAction=(offcanvas)=>{let inner=offcanvas.querySelector('.brx-offcanvas-inner')
let transitionDuration=inner?(transitionDuration=parseFloat(window.getComputedStyle(inner).getPropertyValue('transition-duration'))*1000):200
if(offcanvas.classList.contains('brx-open')){bricksSetVh()
if(offcanvas.dataset.effect==='offset'){if(inner){let direction=offcanvas.getAttribute('data-direction')
let transition=window.getComputedStyle(inner).getPropertyValue('transition')
document.body.style.margin='0'
if(!isOffsetOnPageLoad){document.body.style.transition=transition.replace('transform','margin')}
const isRTL=document.dir==='rtl'||document.documentElement.dir==='rtl'
if(direction==='top'){document.body.style.marginTop=`${inner.offsetHeight}px`}else if(direction==='bottom'){document.body.style.marginTop=`-${inner.offsetHeight}px`}
else if(direction==='left'){if(isRTL){document.body.style.marginRight=`-${inner.offsetWidth}px`}else{document.body.style.marginLeft=`${inner.offsetWidth}px`}
document.body.style.overflowX='hidden'}else if(direction==='right'){if(isRTL){document.body.style.marginRight=`${inner.offsetWidth}px`}else{document.body.style.marginLeft=`-${inner.offsetWidth}px`}
document.body.style.overflowX='hidden'}
if(isOffsetOnPageLoad){setTimeout(()=>{document.body.style.transition=transition.replace('transform','margin')},0)}
isOffsetOnPageLoad=false}}
offcanvas.addEventListener('keydown',(event)=>bricksTrapFocus(event,offcanvas))
if(offcanvas.dataset.noScroll){document.body.classList.add('no-scroll')}
if(offcanvas.dataset?.noAutoFocus!=='true'){bricksFocusOnFirstFocusableElement(offcanvas)}
if(offcanvas.dataset?.scrollToTop==='true'){let offcanvasInner=offcanvas.querySelector('.brx-offcanvas-inner')
if(offcanvasInner){offcanvasInner.scrollTop=0}}
let offcanvasToggles=offcanvas.querySelectorAll('.brx-offcanvas-inner button.brxe-toggle, .brx-offcanvas-inner [data-brx-toggle-offcanvas="true"]')
if(offcanvasToggles.length){offcanvasToggles.forEach((offcanvasToggle)=>{let isTargetCurrentOffcanvas=false
const targetSelector=offcanvasToggle.dataset?.selector||'.brxe-offcanvas'
if(targetSelector){const targetElements=document.querySelectorAll(targetSelector)||[]
isTargetCurrentOffcanvas=Array.from(targetElements).includes(offcanvas)}else{isTargetCurrentOffcanvas=true}
if(isTargetCurrentOffcanvas){offcanvasToggle.classList.add('is-active')
offcanvasToggle.setAttribute('aria-expanded',true)}})}}
else{offcanvas.classList.add('brx-closing')
let toggleScriptId=offcanvas.dataset.toggleScriptId
let toggleNode=document.querySelector(`button[data-script-id="${toggleScriptId}"], [data-interaction-id="${toggleScriptId}"][data-brx-toggle-offcanvas]`)
if(toggleNode){toggleNode.setAttribute('aria-expanded',false)
toggleNode.classList.remove('is-active')
toggleNode.focus()}
if(offcanvas.dataset.effect==='offset'){if(document.body.style.marginTop){document.body.style.margin='0'}
setTimeout(()=>{document.body.style.margin=null
document.body.style.overflow=null
document.body.style.transition=null},transitionDuration)}
setTimeout(()=>{offcanvas.classList.remove('brx-closing')
if(offcanvas.dataset.noScroll){document.body.classList.remove('no-scroll')
bricksSubmenuPosition()}},transitionDuration)}}
let offcanvasObserver=new MutationObserver((mutations)=>{mutations.forEach((mutation)=>{if(mutation.type==='attributes'&&mutation.attributeName==='class'){const oldValue=mutation.oldValue||''
const newValue=mutation.target.classList
const oldClasses=oldValue.split(' ')
const newClasses=Array.from(newValue)
if(oldClasses.includes('brx-closing')||newClasses.includes('brx-closing')){return}
offcanvasAction(mutation.target)}})})
offcanvasElements.forEach((offcanvas)=>{offcanvasObserver.observe(offcanvas,{attributes:true,attributeFilter:['class'],attributeOldValue:true})
let backdrop=offcanvas.querySelector('.brx-offcanvas-backdrop')
if(backdrop){backdrop.addEventListener('click',(e)=>{bricksOffcanvasClose('backdrop')})}
if(offcanvas.classList.contains('brx-open')){offcanvasAction(offcanvas)}})
document.addEventListener('keyup',(e)=>{if(e.key==='Escape'){bricksOffcanvasClose('esc')}})}
function bricksOffcanvasClose(event){let openOffcanvasElements=bricksQuerySelectorAll(document,'.brxe-offcanvas.brx-open')
openOffcanvasElements.forEach((openOffcanvas)=>{const closeOn=openOffcanvas.dataset?.closeOn||'backdrop-esc'
if(closeOn.includes(event)||event==='force'){openOffcanvas.classList.remove('brx-open')}
let offcanvasToggles=openOffcanvas.querySelectorAll('.brx-offcanvas-inner > button.brxe-toggle, .brx-offcanvas-inner > [data-brx-toggle-offcanvas="true"]')
if(offcanvasToggles.length){offcanvasToggles.forEach((offcanvasToggle)=>{offcanvasToggle.classList.remove('is-active')
offcanvasToggle.setAttribute('aria-expanded',false)})}})}
function bricksToggleDisplay(){let toggleElements=bricksQuerySelectorAll(document,'.brxe-toggle')
if(!toggleElements.length){return}
toggleElements.forEach((toggle)=>{if(toggle.closest('.brx-nav-nested-items')&&!toggle.parentNode.classList.contains('brx-nav-nested-items')&&!toggle.parentNode.classList.contains('brx-toggle-div')){let toggleStyles=window.getComputedStyle(toggle)
if(toggleStyles.display==='none'){toggle.parentNode.style.display='none'
bricksNavNestedClose()}else{toggle.parentNode.style.display=null}}})}
function bricksNavMenuMobileToggleDisplay(){let navMenuMobileToggles=bricksQuerySelectorAll(document,'.bricks-mobile-menu-toggle')
navMenuMobileToggles.forEach((toggle)=>{if(toggle.parentNode.classList.contains('show-mobile-menu')){let toggleStyles=window.getComputedStyle(toggle)
if(toggleStyles.display==='none'){toggle.click()}}})}
const bricksToggleFn=new BricksFunction({parentNode:document,selector:'.brxe-toggle',frontEndOnly:true,eachElement:(toggle)=>{toggle.addEventListener('click',(e)=>{e.preventDefault()
bricksUtils.toggleAction(toggle)})}})
function bricksToggle(){if(!bricksIsFrontend){return}
bricksToggleDisplay()
bricksToggleFn.run()}
function bricksSubmenuToggle(toggle,action='toggle'){let menuItem=toggle.parentNode.classList.contains('brx-submenu-toggle')?toggle.parentNode.parentNode:false
if(!menuItem){return}
let multilevel=toggle.closest('.brx-has-multilevel')
if(multilevel){let activeMenuItem=menuItem.parentNode.closest('.active')
if(activeMenuItem&&!activeMenuItem.classList.contains('brx-has-megamenu')){activeMenuItem.classList.remove('active')}
setTimeout(()=>{let submenu=menuItem.querySelector('ul')||menuItem.querySelector('.brx-dropdown-content')
if(submenu){bricksFocusOnFirstFocusableElement(submenu)}},100)}
if(action==='add'){menuItem.classList.add('open')
menuItem.classList.add('active')}else if(action==='remove'){menuItem.classList.remove('open')
menuItem.classList.remove('active')}else{menuItem.classList.toggle('open')}
const hasDropdown=menuItem.classList.contains('brxe-dropdown')
if(hasDropdown){const dropdownContent=menuItem.querySelector('.brx-dropdown-content')
if(dropdownContent){if(menuItem.classList.contains('open')){const updateGapHeight=(e)=>{const skipEvents=['color','background-color','border-color','box-shadow','visibility','opacity','filter']
if(e?.propertyName&&skipEvents.includes(e.propertyName)){return}
const menuItemRect=menuItem.getBoundingClientRect()
const dropdownContentRect=dropdownContent.getBoundingClientRect()
const contentBorder=parseFloat(window.getComputedStyle(dropdownContent).borderTopWidth)
const contentTopPos=dropdownContentRect.top+contentBorder
const menuItemBottomPos=menuItemRect.bottom
const totalValue=contentTopPos-menuItemBottomPos
menuItem.style.setProperty('--brx-dropdown-height-before',`${totalValue}px`)}
if(!menuItem.style.getPropertyValue('--brx-dropdown-height-before')){dropdownContent.addEventListener('transitionend',updateGapHeight)}
updateGapHeight()}}}
toggle.setAttribute('aria-expanded',menuItem.classList.contains('open'))}
const bricksSubmenuListenersFn=new BricksFunction({parentNode:document,selector:'.bricks-nav-menu .menu-item-has-children, .brxe-dropdown',eachElement:(submenuItem)=>{let skipMouseListeners=submenuItem.closest('[data-static]')||submenuItem.closest('.brx-has-multilevel')||submenuItem.classList.contains('active')
if(skipMouseListeners){return}
submenuItem.addEventListener('mouseenter',function(e){if(submenuItem.closest('.show-mobile-menu')||submenuItem.closest('.brxe-nav-nested.brx-open')){return}
if(submenuItem.getAttribute('data-toggle')==='click'){return}
let toggle=e.target.querySelector('[aria-expanded="false"]')
if(toggle){if(!toggle.closest('.brxe-dropdown.open')&&!toggle.closest('.bricks-menu-item.open')){bricksUtils.closeAllSubmenus(toggle)}
bricksSubmenuToggle(toggle)}})
submenuItem.addEventListener('mouseleave',function(e){if(submenuItem.closest('.show-mobile-menu')||submenuItem.closest('.brxe-nav-nested.brx-open')){return}
if(submenuItem.getAttribute('data-toggle')==='click'){return}
let toggle=e.target.querySelector('[aria-expanded="true"]')
if(toggle){let menuItem=toggle.closest('.menu-item')
if(!menuItem){menuItem=toggle.closest('.brxe-dropdown')}
if(menuItem&&menuItem.classList.contains('active')){return}
bricksSubmenuToggle(toggle)}})}})
function bricksSubmenuListeners(){bricksSubmenuListenersFn.run()
document.addEventListener('keyup',function(e){if(e.key==='Escape'){bricksUtils.closeAllSubmenus(e.target)}
else if(e.key==='Tab'){setTimeout(()=>{let openToggles=bricksQuerySelectorAll(document,'[aria-expanded="true"]')
openToggles.forEach((toggle)=>{let menuItem=toggle.closest('.menu-item')
if(!menuItem){menuItem=toggle.closest('.brxe-dropdown')}
if((menuItem&&!menuItem.contains(document.activeElement))||document.activeElement.tagName==='BODY'){bricksSubmenuToggle(toggle,'remove')}})},0)}})
document.addEventListener('click',(e)=>{let target=e.target
let linkUrl=null
if(target&&target.nodeName!=='A'){target=target.closest('a[href]')}
if(target){linkUrl=target.getAttribute('href')}
if(linkUrl&&linkUrl.includes('#')){if(linkUrl==='#'||linkUrl==='/#'){e.preventDefault()}
else{let scrollToElementId=linkUrl.split('#')[1]
let offcanvas=e.target.closest('.brxe-offcanvas')
if(offcanvas){bricksOffcanvasClose('force')}
let isMobileMenu=e.target.closest('.brxe-nav-nested.brx-open')
if(isMobileMenu){bricksNavNestedClose()
let element=document.getElementById(scrollToElementId)
if(element){setTimeout(()=>{element.scrollIntoView()},200)}}
let hashTarget=document.getElementById(scrollToElementId)
if(hashTarget){let isProductTabs=hashTarget.classList.contains('woocommerce-Tabs-panel')
let accordionTitle=hashTarget.firstChild&&hashTarget.firstChild.classList&&hashTarget.firstChild.classList.contains('accordion-title-wrapper')?hashTarget.firstChild:null
if(accordionTitle&&!isProductTabs){accordionTitle.click()
return}
let tabTitle=hashTarget.closest('.tab-title')
if(tabTitle&&!isProductTabs){tabTitle.click()}
let popup=e.target.closest('.brx-popup')
if(popup&&!popup.contains(hashTarget)){bricksClosePopup(popup)}}}}
const submenuToggle=e.target.closest('.brx-submenu-toggle')
const dropdown=e.target.closest('.brxe-dropdown')
const dropdownContent=e.target.closest('.brx-dropdown-content')
if(dropdown&&(!dropdownContent||dropdownContent.parentNode!==dropdown)){handleDropdownToggle(dropdown,e,true)}else if(submenuToggle){handleDropdownToggle(submenuToggle,e,false)}
let openSubmenuButtons=bricksQuerySelectorAll(document,'.brx-submenu-toggle > button[aria-expanded="true"]')
openSubmenuButtons.forEach((toggleButton)=>{let menuItem=toggleButton.closest('li')
if(!menuItem){menuItem=toggleButton.closest('.brxe-dropdown')}
if(!menuItem||menuItem.contains(e.target)){return}
bricksSubmenuToggle(toggleButton)
menuItem.classList.remove('active')})})
function handleDropdownToggle(element,e,isDropdown){let toggleOn='hover'
if(element.hasAttribute('data-toggle')){toggleOn=element.getAttribute('data-toggle')}
else{let toggleOnNode=element.closest('[data-toggle]')
if(toggleOnNode){toggleOn=toggleOnNode.getAttribute('data-toggle')}}
if(element.closest('.brxe-nav-menu.show-mobile-menu')){toggleOn='click'}
if(element.closest('.brxe-nav-nested.brx-open')){toggleOn='click'}
let toggleButton=toggleOn==='hover'?e.target.closest('[aria-expanded]'):element.querySelector(isDropdown?'.brx-submenu-toggle button[aria-expanded]':'button[aria-expanded]')
let isKeyboardEvent=e.detail===0
if(!isKeyboardEvent&&toggleOn!=='click'&&toggleOn!=='both'){toggleButton=null}
if(toggleButton){bricksSubmenuToggle(toggleButton)
let targetElement=isDropdown?element:element.parentNode
targetElement.classList.toggle('active')
setTimeout(()=>{if(targetElement.classList.contains('active')){targetElement.classList.add('open')}
toggleButton.setAttribute('aria-expanded',targetElement.classList.contains('open'))},0)}}
const submenuToggles=bricksQuerySelectorAll(document,'.brx-submenu-toggle')
submenuToggles.forEach((submenuToggle)=>{const menuItem=submenuToggle.parentNode
const submenu=menuItem.querySelector('.brx-megamenu')||menuItem.querySelector('.brx-dropdown-content')||menuItem.querySelector('ul')
if(submenu&&submenu.querySelector('[aria-current="page"]')){submenuToggle.classList.add('aria-current')}})}
const bricksSubmenuPositionFn=new BricksFunction({parentNode:document,selector:'.brx-submenu-toggle',forceReinit:true,eachElement:(submenuToggle)=>{let menuItem=submenuToggle.parentNode
let submenu=menuItem.querySelector('.brx-megamenu')||menuItem.querySelector('.brx-dropdown-content')||menuItem.querySelector('ul')
if(!submenu){return}
submenu.classList.add('brx-submenu-positioned')
if(menuItem.hasAttribute('data-static')){return}
let docWidth=document.body.clientWidth
let hasMegamenu=menuItem.classList.contains('brx-has-megamenu')
if(hasMegamenu){let referenceNodeSelector=menuItem.dataset.megaMenu
let verticalReferenceNodeSelector=menuItem.dataset.megaMenuVertical
let referenceNode=document.body
if(referenceNodeSelector){let customReferenceNode=document.querySelector(referenceNodeSelector)
if(customReferenceNode){referenceNode=customReferenceNode}}
let menuItemRect=menuItem.getBoundingClientRect()
let referenceNodeRect=referenceNode.getBoundingClientRect()
submenu.style.left=`-${menuItemRect.left - referenceNodeRect.left}px`submenu.style.minWidth=`${referenceNodeRect.width}px`if(verticalReferenceNodeSelector){let verticalReferenceNode=document.querySelector(verticalReferenceNodeSelector)
if(verticalReferenceNode){let verticalReferenceNodeRect=verticalReferenceNode.getBoundingClientRect()
submenu.style.top=`${
      menuItemRect.height + verticalReferenceNodeRect.bottom - menuItemRect.bottom
     }px`}}
if(bricksIsFrontend){document.dispatchEvent(new CustomEvent('bricks/megamenu/repositioned',{detail:{menuItem:menuItem,submenu:submenu}}))}}
else{if(submenu.classList.contains('brx-multilevel-overflow-right')){submenu.classList.remove('brx-multilevel-overflow-right')}
if(submenu.classList.contains('brx-submenu-overflow-right')){submenu.classList.remove('brx-submenu-overflow-right')}
if(submenu.classList.contains('brx-sub-submenu-overflow-right')){submenu.classList.remove('brx-sub-submenu-overflow-right')}
let isToplevel=!menuItem.parentNode.closest('.menu-item')&&!menuItem.parentNode.closest('.brxe-dropdown')
let submenuRect=submenu.getBoundingClientRect()
let submenuWidth=submenuRect.width
let submenuRight=submenuRect.right
let submenuLeft=Math.ceil(submenuRect.left)
if(submenuWidth>docWidth){submenu.style.left=`-${submenuLeft}px`submenu.style.minWidth=`${docWidth}px`}
else if(submenuRight>docWidth){let multilevel=submenu.closest('.brx-has-multilevel')
if(multilevel){submenu.classList.add('brx-multilevel-overflow-right')}
else{if(isToplevel){submenu.classList.add('brx-submenu-overflow-right')}else{submenu.classList.add('brx-sub-submenu-overflow-right')}}}
else if(submenuLeft<0){submenu.style.left=!isToplevel?'100%':'0'
submenu.style.right='auto'}}}})
function bricksSubmenuPosition(timeout=0){setTimeout(()=>{bricksSubmenuPositionFn.run()},timeout)}
function bricksSubmenuWindowResizeHandler(){let lastWidth,lastHeight,submenuTimeout
const bricksSubmenuBeforePosition=()=>{let submenuToggles=bricksQuerySelectorAll(document,'.brx-submenu-toggle')
submenuToggles.forEach((submenuToggle)=>{let menuItem=submenuToggle.parentNode
let submenu=menuItem.querySelector('.brx-megamenu')||menuItem.querySelector('.brx-dropdown-content')||menuItem.querySelector('ul')
if(!submenu){return}
submenu.classList.remove('brx-submenu-positioned')})}
const handleResize=()=>{const currentWidth=window.innerWidth
const currentHeight=window.innerHeight
if(currentWidth===lastWidth){return}
clearTimeout(submenuTimeout)
bricksSubmenuBeforePosition()
submenuTimeout=setTimeout(bricksSubmenuPosition,250)
lastWidth=currentWidth
lastHeight=currentHeight}
const waitForStableViewport=()=>{let width=window.innerWidth
let height=window.innerHeight
requestAnimationFrame(()=>{if(width===window.innerWidth&&height===window.innerHeight){lastWidth=width
lastHeight=height
window.addEventListener('resize',handleResize)}else{waitForStableViewport()}})}
waitForStableViewport()}
function bricksMultilevelMenu(){let navNestedElements=bricksQuerySelectorAll(document,'.brxe-nav-nested.multilevel')
navNestedElements.forEach((navNested)=>{let backText=navNested.getAttribute('data-back-text')
let dropdowns=navNested.querySelectorAll('.brxe-dropdown')
dropdowns.forEach((dropdown)=>{dropdown.classList.add('brx-has-multilevel')
dropdown.setAttribute('data-toggle','click')
dropdown.setAttribute('data-back-text',backText)})})
let multilevelItems=bricksQuerySelectorAll(document,'.brx-has-multilevel')
multilevelItems.forEach((menuItem)=>{let backText=menuItem.getAttribute('data-back-text')||'Back'
let submenus=bricksQuerySelectorAll(menuItem,'ul')
submenus.forEach((submenu,index)=>{if(index===0){return}
let backLink=document.createElement('a')
backLink.classList.add('brx-multilevel-back')
backLink.setAttribute('href','#')
backLink.innerText=backText
let backListItem=document.createElement('li')
backListItem.classList.add('menu-item')
backListItem.appendChild(backLink)
submenu.insertBefore(backListItem,submenu.firstChild)
backLink.addEventListener('click',function(e){e.preventDefault()
let activeMenuItem=e.target.closest('.active')
if(activeMenuItem){activeMenuItem.classList.remove('open')
activeMenuItem.classList.remove('active')
let submenuToggle=activeMenuItem.querySelector('.brx-submenu-toggle > button')
if(submenuToggle){submenuToggle.setAttribute('aria-expanded',false)}
let parentMenuItem=activeMenuItem.parentNode.closest('.open')
if(parentMenuItem){parentMenuItem.classList.add('active')
let parentSubmenu=parentMenuItem.querySelector('ul')
if(parentSubmenu){bricksFocusOnFirstFocusableElement(parentSubmenu)}}}})})})}
function bricksNavMenuMobile(){let toggles=bricksQuerySelectorAll(document,'.bricks-mobile-menu-toggle')
if(!toggles.length){return}
let navMenuObserver=new MutationObserver((mutations)=>{bricksSetVh()
mutations.forEach((mutation)=>{if(mutation.target.classList.contains('show-mobile-menu')){document.body.classList.add('no-scroll')}else{document.body.classList.remove('no-scroll')}})})
toggles.forEach((toggle)=>{let navMenu=toggle.closest('.brxe-nav-menu')
navMenuObserver.observe(navMenu,{attributes:true,attributeFilter:['class']})})
let lastFocusedElement=null
document.addEventListener('click',(e)=>{let mobileMenuToggle=e.target.closest('.bricks-mobile-menu-toggle')
if(mobileMenuToggle){let navMenu=mobileMenuToggle.closest('.brxe-nav-menu')
navMenu.classList.toggle('show-mobile-menu')
let expanded=navMenu.classList.contains('show-mobile-menu')
let ariaLabel=expanded?window.bricksData.i18n.closeMobileMenu:window.bricksData.i18n.openMobileMenu
mobileMenuToggle.setAttribute('aria-expanded',expanded)
mobileMenuToggle.setAttribute('aria-label',ariaLabel)
if(expanded){lastFocusedElement=document.activeElement
setTimeout(()=>{let navMenuMobile=navMenu.querySelector('.bricks-mobile-menu-wrapper')
bricksFocusOnFirstFocusableElement(navMenuMobile)
navMenuMobile.addEventListener('keydown',(event)=>bricksTrapFocus(event,navMenuMobile))},100)}else{if(lastFocusedElement){lastFocusedElement.focus()}}}})
document.addEventListener('click',(e)=>{let navMenu=e.target.closest('.brxe-nav-menu')
if(!navMenu){return}
let mobileMenuToggle=navMenu.querySelector('.bricks-mobile-menu-toggle')
if(e.target.classList.contains('bricks-mobile-menu-overlay')){navMenu.classList.remove('show-mobile-menu')
navMenu.querySelector('.bricks-mobile-menu-toggle').setAttribute('aria-expanded',false)
mobileMenuToggle.setAttribute('aria-expanded',false)
mobileMenuToggle.setAttribute('aria-label',window.bricksData.i18n.openMobileMenu)}
else if(e.target.closest('.bricks-mobile-menu-wrapper')){let navLinkUrl=e.target.tagName==='A'?e.target.getAttribute('href'):''
if(navLinkUrl.length>1&&navLinkUrl.includes('#')){navMenu.classList.remove('show-mobile-menu')
mobileMenuToggle.setAttribute('aria-expanded',false)
mobileMenuToggle.setAttribute('aria-label',window.bricksData.i18n.openMobileMenu)}}})
document.addEventListener('keyup',(e)=>{if(e.key==='Escape'){let openMobileMenu=document.querySelector('.brxe-nav-menu.show-mobile-menu')
if(openMobileMenu){openMobileMenu.classList.remove('show-mobile-menu')
let toggle=openMobileMenu.querySelector('.bricks-mobile-menu-toggle')
if(toggle){toggle.setAttribute('aria-expanded',false)
toggle.setAttribute('aria-label',window.bricksData.i18n.openMobileMenu)
setTimeout(()=>{toggle.focus()},10)}}}})}
const bricksBackToTopFn=new BricksFunction({parentNode:document,selector:'.brxe-back-to-top',eachElement:(element)=>{element.addEventListener('click',function(e){e.preventDefault()
window.scrollTo({top:0,behavior:element.hasAttribute('data-smooth-scroll')?'smooth':'auto'})})
let visibleAfter=element.dataset.visibleAfter||0
let visibleOnScrollUp=element.classList.contains('up')
if(visibleAfter||visibleOnScrollUp){let lastScrollTop=0
window.addEventListener('scroll',function(){let scrollTop=document.documentElement.scrollTop
let visible=true
if(visibleOnScrollUp){if(scrollTop>lastScrollTop){visible=false}else{visible=true}
lastScrollTop=scrollTop}
if(window.scrollY>visibleAfter&&visible){visible=true}else{visible=false}
if(visible){element.classList.add('visible')}else{element.classList.remove('visible')}})}}})
function bricksBackToTop(){bricksBackToTopFn.run()}
function bricksGetFocusables(node){let focusableElements=node.querySelectorAll('a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])')
return Array.prototype.filter.call(focusableElements,(element)=>{if(element.hasAttribute('inert')||element.closest('[inert]')){return false}
return window.getComputedStyle(element).display!=='none'})}
function bricksGetVisibleFocusables(node){return bricksGetFocusables(node).filter((element)=>{return element.offsetWidth>0||element.offsetHeight>0})}
const bricksPauseMediaFn=new BricksFunction({parentNode:document,selector:'video, audio, iframe[src*="youtube"], iframe[src*="vimeo"]',subscribeEvents:['bricks/popup/close'],forceReinit:true,eachElement:(element)=>{if((element.tagName==='VIDEO'||element.tagName==='AUDIO')&&element.pause&&typeof element.pause==='function'){element.pause()
return}
if(element.tagName==='IFRAME'){let src=element.getAttribute('src')
let isYoutube=src.includes('youtube')
let isVimeo=src.includes('vimeo')
let command=isYoutube?{event:'command',func:'pauseVideo',args:''}:{method:'pause'}
if(isVimeo||isYoutube){element.contentWindow.postMessage(JSON.stringify(command),'*')
return}}},listenerHandler:(event)=>{if(event?.type){switch(event.type){case'bricks/popup/close':let popupElement=event?.detail?.popupElement
if(popupElement){bricksPauseMediaFn.run({parentNode:popupElement})}
break}}}})
const bricksAnchorLinksFn=new BricksFunction({parentNode:document,selector:'a[data-brx-anchor][href*="#"]',frontEndOnly:true,eachElement:(anchor)=>{const setLinkActive=(link,active=true)=>{let isNavitem=link.closest('.menu-item')||false
if(active){link.setAttribute('aria-current','page')
if(isNavitem){link.closest('.menu-item').classList.add('current-menu-item')}}else{link.removeAttribute('aria-current')
if(isNavitem){link.closest('.menu-item').classList.remove('current-menu-item')}}}
let currentURLHash=window.location.hash||false
if(currentURLHash&&currentURLHash.length>1){let anchorLinkHash=anchor.getAttribute('href').split('#')[1]||false
if(anchorLinkHash&&anchorLinkHash===currentURLHash.substring(1)){let nearestNav=anchor.closest('.bricks-nav-menu, .brxe-nav-nested')||false
if(nearestNav){let navMenuItems=nearestNav.querySelectorAll('.menu-item')
navMenuItems.forEach((item)=>{let anchorLinks=item.querySelectorAll('a:not([data-brx-anchor])')
if(anchorLinks.length>0){item.classList.remove('current-menu-item')
anchorLinks.forEach((link)=>{link.removeAttribute('aria-current')})}})}
setLinkActive(anchor)}}
anchor.addEventListener('click',(e)=>{let nearestNav=anchor.closest('.bricks-nav-menu, .brxe-nav-nested')||false
if(nearestNav){let navMenuItems=nearestNav.querySelectorAll('.menu-item')
navMenuItems.forEach((item)=>{item.classList.remove('current-menu-item')
let anchorLinks=item.querySelectorAll('a[aria-current="page"]')
anchorLinks.forEach((link)=>{link.removeAttribute('aria-current')})})}
setLinkActive(anchor)})}})
function bricksAnchorLinks(){bricksAnchorLinksFn.run()}
function bricksGetQueryResult(queryId,isPopState=false,nonceRefreshed=false){return new Promise(function(resolve,reject){if(!queryId){reject('No queryId provided')
return}
if(typeof window.bricksUtils.getFiltersForQuery!=='function'){reject('Query filters JS not loaded')
return}
const queryInstance=window.bricksData.queryLoopInstances[queryId]||false
if(!queryInstance){reject('Query instance not found')
return}
if(!nonceRefreshed){bricksUtils.maybeAbortXhr(queryId)}
let url=window.bricksData.restApiUrl.concat('query_result')
let allFilters=window.bricksUtils.getFiltersForQuery(queryId,'filterId')
let selectedFilters=window.bricksUtils.getSelectedFiltersForQuery(queryId)
let afTags=window.bricksUtils.getDynamicTagsForParse(queryId)
let originalQueryVars=queryInstance?.originalQueryVars==='[]'?queryInstance?.queryVars:queryInstance?.originalQueryVars
let queryData={postId:window.bricksData.postId,queryElementId:queryId,originalQueryVars:originalQueryVars,pageFilters:window.bricksData.pageFilters||false,filters:allFilters,selectedFilters:selectedFilters,afTags:afTags,nonce:window.bricksData.nonce,baseUrl:window.bricksData.baseUrl,lang:window.bricksData.language||false,mainQueryId:window.bricksData.mainQueryId||false}
if(window.bricksData.multilangPlugin==='wpml'&&(window.location.search.includes('lang=')||window.bricksData.wpmlUrlFormat!=3)){url=url.concat('?lang='+window.bricksData.language)}
window.bricksData.queryLoopInstances[queryId].isLoading=1
if(!nonceRefreshed&&!window.bricksData.queryLoopInstances[queryId].xhrAborted){document.dispatchEvent(new CustomEvent('bricks/ajax/start',{detail:{queryId:queryId,isPopState:isPopState}}))}
let xhr=new XMLHttpRequest()
window.bricksData.queryLoopInstances[queryId].xhr=xhr
xhr.open('POST',url,true)
xhr.setRequestHeader('Content-Type','application/json; charset=UTF-8')
xhr.setRequestHeader('X-WP-Nonce',window.bricksData.wpRestNonce)
xhr.onreadystatechange=function(){if(xhr.readyState===XMLHttpRequest.DONE){if(window.bricksData.queryLoopInstances[queryId].xhr===xhr){window.bricksData.queryLoopInstances[queryId].xhr=null
window.bricksData.queryLoopInstances[queryId].xhrAborted=false}
let status=xhr.status
let res
try{res=JSON.parse(xhr.response)}catch(e){reject('Invalid response from server')
return}
if(status===0||(status>=200&&status<400)){window.bricksData.queryLoopInstances[queryId].isLoading=0
let error=res?.error||false
if(error){console.error('error: bricksGetQueryResult',error)
reject(error)}else{resolve(res)}
document.dispatchEvent(new CustomEvent('bricks/ajax/end',{detail:{queryId:queryId}}))
document.dispatchEvent(new CustomEvent('bricks/ajax/query_result/completed',{detail:{queryId:queryId}}))}else if(res?.code==='rest_cookie_invalid_nonce'){if(!nonceRefreshed){bricksRegenerateNonceAndRetryQuery(queryId).then(resolve).catch(reject)}else{reject('Nonce verification failed after refresh')}}else{reject(`Request failed with status ${status}`)}}}
xhr.send(JSON.stringify(queryData))})}
function bricksRegenerateNonceAndRetryQuery(queryId){return new Promise((resolve,reject)=>{let xhrNonce=new XMLHttpRequest()
xhrNonce.open('POST',window.bricksData.ajaxUrl,true)
xhrNonce.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
xhrNonce.onreadystatechange=function(){if(xhrNonce.readyState===XMLHttpRequest.DONE){if(xhrNonce.status>=200&&xhrNonce.status<400){let response
try{response=JSON.parse(xhrNonce.responseText)}catch(e){reject('Invalid response from server when regenerating nonce')
return}
if(response.success&&response.data){window.bricksData.nonce=response.data.bricks_nonce
window.bricksData.wpRestNonce=response.data.rest_nonce
let isPopState=false
let nonceRefreshed=true
bricksGetQueryResult(queryId,isPopState,nonceRefreshed).then(resolve).catch(reject)}else{reject('Failed to regenerate nonces: Invalid response structure')}}else{reject('Failed to regenerate nonce')}}}
xhrNonce.send('action=bricks_regenerate_query_nonce')})}
function bricksDisplayQueryResult(targetQueryId,res){const html=res?.html||false
const styles=res?.styles||false
const popups=res?.popups||false
const updatedQuery=res?.updated_query||false
const updatedFilters=res?.updated_filters||false
const parsedAfTags=res?.parsed_af_tags||false
const queryInstance=window.bricksData.queryLoopInstances[targetQueryId]||false
const resultsContainer=queryInstance?.resultsContainer||false
if(!queryInstance||!resultsContainer){return}
const queryComponentId=queryInstance?.componentId||false
const selectorId=queryComponentId?queryComponentId:targetQueryId
const gutterSizer=resultsContainer.querySelector('.bricks-gutter-sizer')
const isotopSizer=resultsContainer.querySelector('.bricks-isotope-sizer')
const actualLoopDOM=resultsContainer.querySelectorAll(`.brxe-${targetQueryId}, .bricks-posts-nothing-found`)
const loopStartComment=document.createNodeIterator(resultsContainer,NodeFilter.SHOW_COMMENT,{acceptNode:function(node){return node.nodeValue===`brx-loop-start-${targetQueryId}`}}).nextNode()
const hasOldResults=actualLoopDOM.length>0||loopStartComment
if(hasOldResults){resultsContainer.querySelectorAll(`.brxe-${selectorId}, .bricks-posts-nothing-found`).forEach((el)=>el.remove())}
if(html){if(hasOldResults){if(loopStartComment){const firstTag=html.match(/<\s*([a-z0-9]+)([^>]+)?>/i)
let tempDiv=null
if(firstTag&&(firstTag[1]==='td'||firstTag[1]==='tr')){tempDiv=document.createElement('tbody')}else{tempDiv=document.createElement('div')}
tempDiv.innerHTML=html
let newNodes=Array.from(tempDiv.childNodes)
newNodes.reverse()
newNodes.forEach((node)=>{if(loopStartComment.nextSibling){loopStartComment.parentNode?.insertBefore(node,loopStartComment.nextSibling)}else{loopStartComment.parentNode?.appendChild(node)}})
tempDiv.remove()}}else{resultsContainer.insertAdjacentHTML('beforeend',html)}}
if(gutterSizer){resultsContainer.appendChild(gutterSizer)}
if(isotopSizer){resultsContainer.appendChild(isotopSizer)}
const oldLoopPopupNodes=document.querySelectorAll(`.brx-popup[data-popup-loop="${targetQueryId}"]`)
oldLoopPopupNodes.forEach((el)=>el.remove())
if(popups){document.body.insertAdjacentHTML('beforeend',popups)}
document.dispatchEvent(new CustomEvent('bricks/ajax/nodes_added',{detail:{queryId:targetQueryId}}))
if(styles){let styleElement=document.querySelector(`#brx-query-styles-${targetQueryId}`)
if(!styleElement){styleElement=document.createElement('style')
styleElement.id=`brx-query-styles-${targetQueryId}`document.body.appendChild(styleElement)}
styleElement.innerHTML=styles}
if(updatedQuery){bricksUtils.updateQueryResultStats(targetQueryId,'query',updatedQuery)}
if(parsedAfTags){window.bricksUtils.updateParsedDynamicTags(targetQueryId,parsedAfTags)}
if(updatedQuery?.query_vars?.paged!==undefined){window.bricksData.queryLoopInstances[targetQueryId].page=parseInt(updatedQuery.query_vars.paged)}
if(updatedQuery?.max_num_pages!==undefined){window.bricksData.queryLoopInstances[targetQueryId].maxPages=parseInt(updatedQuery.max_num_pages)}
if(updatedQuery?.start!==undefined){window.bricksData.queryLoopInstances[targetQueryId].start=parseInt(updatedQuery.start)}
if(updatedQuery?.end!==undefined){window.bricksData.queryLoopInstances[targetQueryId].end=parseInt(updatedQuery.end)}
if(updatedFilters){for(let filterId in updatedFilters){const filterHtml=updatedFilters[filterId]
const filterInstance=window.bricksData.filterInstances[filterId]||false
if(!filterInstance){continue}
if(filterInstance.filterType==='search'){continue}
const dummyDiv=document.createElement('div')
dummyDiv.innerHTML=filterHtml
const newFilterElement=dummyDiv.childNodes[0]
filterInstance.filterElement.replaceWith(newFilterElement)
filterInstance.filterElement=newFilterElement
dummyDiv.remove()}}
bricksUtils.hideOrShowLoadMoreButtons(targetQueryId)
document.dispatchEvent(new CustomEvent('bricks/ajax/query_result/displayed',{detail:{queryId:targetQueryId}}))
if(queryInstance.infiniteScroll){setTimeout(()=>{let newQueryTrail=Array.from(queryInstance.resultsContainer?.querySelectorAll(`.brxe-${selectorId}:not(.brx-popup)`)).pop()
if(!newQueryTrail){return}
newQueryTrail.dataset.queryElementId=targetQueryId
if(BricksIsInViewport(newQueryTrail)){bricksQueryLoadPage(newQueryTrail)}
else{new BricksIntersect({element:newQueryTrail,callback:(newQueryTrail)=>bricksQueryLoadPage(newQueryTrail),once:true,rootMargin:queryInstance.observerMargin})}},250)}}
function bricksGetYouTubeVideoLinkData(url){if(!url){return{url:'',id:null}}
const youtubeRegex=/(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|shorts\/|live\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i
const match=url.match(youtubeRegex)
if(match&&match[1]){const videoId=match[1]
const embedUrl=`https://www.youtube.com/embed/${videoId}`return{url:embedUrl,id:videoId}}
return{url,id:null}}
function bricksSetVh(){const vh=window.innerHeight*0.01
document.documentElement.style.setProperty('--bricks-vh',`${vh}px`)}
function bricksRunAllFunctions(){if(!window.bricksFunctions){return}
window.bricksFunctions.forEach((fn)=>{if(fn.run&&typeof fn.run==='function'){fn.run()}})}
let bricksIsFrontend
let bricksTimeouts={}
document.addEventListener('DOMContentLoaded',(event)=>{bricksIsFrontend=document.body.classList.contains('bricks-is-frontend')
bricksNavMenu()
bricksMultilevelMenu()
bricksNavMenuMobile()
bricksStickyHeader()
bricksOnePageNavigation()
bricksSkipLinks()
bricksFacebookSDK()
bricksSearchToggle()
bricksPopups()
bricksSwiper()
bricksSplide()
bricksPhotoswipe()
bricksPrettify()
bricksAccordion()
bricksAnimatedTyping()
bricksAudio()
bricksCountdown()
bricksCounter()
bricksTableOfContents()
bricksPricingTables()
bricksVideo()
bricksLazyLoad()
bricksAnimation()
bricksPieChart()
bricksPostReadingProgressBar()
bricksProgressBar()
bricksForm()
bricksInitQueryLoopInstances()
bricksQueryPagination()
bricksInteractions()
bricksAlertDismiss()
bricksTabs()
bricksVideoOverlayClickDetector()
bricksBackgroundVideoInit()
bricksPostReadingTime()
bricksBackToTop()
bricksNavNested()
bricksOffcanvas()
bricksToggle()
bricksSubmenuListeners()
bricksSubmenuPosition(250)
bricksAjaxLoader()
bricksAnchorLinks()
bricksIsotope()
bricksIsotopeListeners()
window.addEventListener('load',bricksSubmenuWindowResizeHandler)
window.addEventListener('resize',()=>{Object.keys(bricksTimeouts).forEach((key)=>{clearTimeout(bricksTimeouts[key])})
if(bricksIsFrontend){bricksTimeouts.bricksVh=setTimeout(bricksSetVh,250)}
else{bricksTimeouts.bricksSwiper=setTimeout(bricksSwiper,250)
bricksTimeouts.bricksSplide=setTimeout(bricksSplide,250)}
bricksTimeouts.bricksToggleDisplay=setTimeout(bricksToggleDisplay,100)
bricksTimeouts.bricksNavMenuMobileToggleDisplay=setTimeout(bricksNavMenuMobileToggleDisplay,100)})
setTimeout(()=>{let interactions=Array.isArray(window.bricksData?.interactions)?window.bricksData.interactions:[]
if(interactions.find((interaction)=>interaction?.trigger==='scroll')){document.addEventListener('scroll',bricksScrollInteractions)}},100)})