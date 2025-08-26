const bricksMapFn=new BricksFunction({parentNode:document,selector:'.brxe-map[data-bricks-map-options]',eachElement:async(mapEl,index)=>{const isBuilderPreview=!document.body.classList.contains('bricks-is-frontend')
const defaultCloseButton=`<span class="close-infobox" tabindex="0" role="button">×</span>`const geocodeAddress=async(geocoder,address)=>{return new Promise((resolve,reject)=>{geocoder.geocode({address:address},(results,status)=>{if(status==='OK'){resolve(results)}else{reject(status)}})})}
const updateMarker=(location,mapElId,isActive=false)=>{const mapInstance=window.bricksData.googleMapInstances?.[mapElId]
if(!mapInstance||!location?.marker){return}
const markerIcon=isActive?location?.customMarkerActive:location?.customMarker
location.marker.setContent(markerIcon||null)}
const generateInfoBoxContent=(addressObj,mapElId)=>{if(!addressObj)return''
const{infoTitle:title=false,infoSubtitle:subTitle=false,infoOpeningHours:openingHours=false,infoImages:images={},infoBoxSelector=false,popupNode=false,isAjaxPopup=false}=addressObj
let content=''
if(infoBoxSelector){if(popupNode){if(!isAjaxPopup){const popupContent=popupNode.querySelector('.brx-popup-content')
if(popupContent){const fragment=document.createDocumentFragment()
while(popupContent.firstChild){fragment.appendChild(popupContent.firstChild)}
const wrapper=document.createElement('div')
wrapper.className='brx-infobox-content brx-popup-content'
wrapper.appendChild(fragment)
addressObj.popupContentNode=wrapper
content=`<div class="brx-infobox-content brx-popup-content"></div>`if(!wrapper.querySelector(`[data-interactions*='"action":"closeAddress"']`)){content+=defaultCloseButton}}}else{content=`<div class="brx-infobox-content brx-popup-content"></div>`}}}else{if(title){content+=`<h3 class="title">${title}</h3>`}
if(subTitle){content+=`<p class="subtitle">${subTitle}</p>`}
if(openingHours){const hoursList=openingHours.split('\n').map((hour)=>`<li>${hour}</li>`).join('')
content+=`<ul class="content">${hoursList}</ul>`}
const normalizedImages=Array.isArray(images)?images:images?.images||[]
if(normalizedImages.length){const imageList=normalizedImages.map((image)=>{if(image.thumbnail&&image.src){return`
        <li>
          <a
            data-pswp-src="${image.src}"
            data-pswp-width="${image?.width || 376}"
            data-pswp-height="${image?.height || 376}"
            data-pswp-id="${addressObj.id}">
            <img src="${image.thumbnail}" />
          </a>
        </li>`}
return''}).join('')
content+=`<ul class="images bricks-lightbox">${imageList}</ul>`}
if(content){content+=defaultCloseButton}}
return content}
const getInfoBox=(addressObj,mapElId)=>{const mapInstance=window.bricksData.googleMapInstances[mapElId]||false
if(!mapInstance)return false
const currentLocation=mapInstance.locations.find((location)=>location.id===addressObj.id)
if(!currentLocation)return false
if(currentLocation.infoBox)return currentLocation.infoBox
const infoboxContent=generateInfoBoxContent(addressObj,mapElId)
if(!infoboxContent)return false
const infoBoxWidth=parseInt(addressObj?.infoWidth)||300
const infoBoxOption={content:infoboxContent,disableAutoPan:true,pixelOffset:new google.maps.Size(0,0),alignBottom:false,infoBoxClearance:new google.maps.Size(20,20),enableEventPropagation:false,zIndex:1001,boxStyle:{opacity:1,zIndex:999,top:0,left:0,width:`${infoBoxWidth}px`,minWidth:`${infoBoxWidth}px`},closeBoxURL:'',addressId:addressObj.id,mapElId:mapElId,interactionSelector:addressObj?.infoBoxSelector||false}
if(mapInstance.mapMode==='sync'&&!isBuilderPreview){infoBoxOption.boxClass=`brx-infobox-popup brx-popup brxe-${mapInstance.syncQuery}`if(addressObj?.popupTemplatId){infoBoxOption.boxClass+=` brxe-popup-${addressObj.popupTemplatId}`}}
if(mapInstance.mapMode==='query'&&addressObj.infoBoxSelector&&!isBuilderPreview){infoBoxOption.boxClass=`brx-infobox-popup brx-popup brxe-${mapElId}`if(addressObj?.popupTemplatId){infoBoxOption.boxClass+=` brxe-popup-${addressObj.popupTemplatId}`}}
const infoBox=new InfoBox(infoBoxOption)
const isAjax=addressObj?.popupNode&&addressObj?.isAjaxPopup
const popupId=addressObj?.popupTemplatId||false
const centerInfoBox=()=>{if(infoBox.div_){const infoBoxHeight=infoBox.div_.offsetHeight
const projectedPosition=mapInstance.map.getProjection().fromLatLngToPoint(currentLocation.marker.position)
const infoBoxCenter=mapInstance.map.getProjection().fromPointToLatLng(new google.maps.Point(projectedPosition.x,projectedPosition.y-(infoBoxHeight*getLongitudePerPixel(mapElId))/ 2))
mapInstance.map.panTo(infoBoxCenter)}}
google.maps.event.addListener(infoBox,'domready',(e)=>{if(!isAjax&&addressObj.popupContentNode&&infoBox.div_){const placeholder=infoBox.div_.querySelector('.brx-popup-content')
if(placeholder){placeholder.parentNode.replaceChild(addressObj.popupContentNode,placeholder)}}
if(isAjax&&infoBox.div_){const infoBoxNode=infoBox.div_
const popupNode=addressObj.popupNode
Array.from(popupNode.attributes).forEach((attr)=>{if(attr.name.startsWith('data-brx')||attr.name.startsWith('data-popup')){infoBoxNode.setAttribute(attr.name,attr.value)}})
const popupData={}
const additionalParam=infoBox.div_.getAttribute('data-interaction-loop-id')||false
if(additionalParam)popupData.loopId=additionalParam
bricksOpenPopup(infoBoxNode,0,popupData)
if(popupId){document.addEventListener('bricks/ajax/popup/loaded',(event)=>{if(event.detail?.popupId===popupId){centerInfoBox()
registerInteractionAddresses()
if(!infoBoxNode.querySelector(`[data-interactions*='"action":"closeAddress"']`)){infoBoxNode.innerHTML+=defaultCloseButton
infoBoxNode.querySelector('.close-infobox').addEventListener('click',()=>{google.maps.event.trigger(infoBox,'closeclick')
infoBox.close()},{once:true})}}},{once:true})}}
if(!isAjax){bricksRunAllFunctions()}
centerInfoBox()
const customCloseButton=infoBox?.div_&&infoBox?.div_.querySelector('.close-infobox')
if(customCloseButton){customCloseButton.addEventListener('click',()=>{google.maps.event.trigger(infoBox,'closeclick')
infoBox.close()},{once:true})}})
google.maps.event.addListener(infoBox,'closeclick',()=>{updateMarker(currentLocation,mapElId,false)
adjustMapToFitBounds(mapElId,currentLocation,'closeInfobox')})
if(infoBox.addressId&&infoBox.mapElId){google.maps.event.addListener(infoBox,'infobox_opened',()=>{updateInteractionAttributes('open',infoBox.addressId,infoBox.mapElId)})
google.maps.event.addListener(infoBox,'infobox_closed',()=>{updateInteractionAttributes('close',infoBox.addressId,infoBox.mapElId)})}
currentLocation.infoBox=infoBox
return infoBox}
const adjustMapToFitBounds=(mapElId,location,action='default')=>{const mapInstance=window.bricksData.googleMapInstances[mapElId]||false
if(!mapInstance)return
const{map,bounds,locations}=mapInstance
if(action==='closeInfobox'){map.panTo(location.position)
return}
if(locations.length>0){if(location&&location.position){bounds.extend(location.position)}
if(locations.length>1){map.fitBounds(bounds)
map.panToBounds(bounds)}else if(locations.length===1){map.panTo(locations[0].position)}}}
const getLongitudePerPixel=(mapElId)=>{const map=window.bricksData.googleMapInstances[mapElId]?.map||false
if(!map){return}
let latLng=map.getCenter()
let zoom=map.getZoom()
let pixelDistance=1
let point1=map.getProjection().fromLatLngToPoint(new google.maps.LatLng(latLng.lat()-pixelDistance / Math.pow(2,zoom),latLng.lng()-pixelDistance / Math.pow(2,zoom)))
let point2=map.getProjection().fromLatLngToPoint(new google.maps.LatLng(latLng.lat()+pixelDistance / Math.pow(2,zoom),latLng.lng()+pixelDistance / Math.pow(2,zoom)))
return Math.abs(point2.x-point1.x)}
const syncAddresses=(queryId,mapElId,mapCenter={})=>{const randomId=()=>{return Math.random().toString(36).substring(2,8)}
if(isBuilderPreview){return[{address:mapCenter?.address,latitude:mapCenter?.lat,longitude:mapCenter?.lng,id:randomId(),infoTitle:window.bricksData?.i18n?.locationTitle||'Location Title',infoSubtitle:window.bricksData?.i18n?.locationSubtitle||'Location Subtitle',infoOpeningHours:window.bricksData?.i18n?.locationContent||'Location Content'}]}
const queryInstance=window?.bricksData?.queryLoopInstances[queryId]||false
if(!queryInstance){return[]}
const addressElements=queryInstance.resultsContainer.querySelectorAll(`.brxe-map-connector[data-brx-latitude][data-brx-longitude], [data-brx-address]`)
const addresses=Array.from(addressElements).map((addressElement)=>{const uniqueId=randomId()
const addressObj={latitude:addressElement.getAttribute('data-brx-latitude'),longitude:addressElement.getAttribute('data-brx-longitude'),address:addressElement.getAttribute('data-brx-address'),id:uniqueId,infoBoxSelector:addressElement.getAttribute('data-brx-infobox-selector'),infoWidth:300,popupNode:null,isAjaxPopup:false,popupTemplatId:addressElement.getAttribute('data-brx-infobox-template'),markerAriaLabel:'',markerText:'',markerTextActive:'',marker:{},markerActive:{}}
const markerData=addressElement.getAttribute('data-brx-marker-data')||'{}'
try{const markerDataObj=JSON.parse(markerData)
addressObj.markerAriaLabel=markerDataObj.markerAriaLabel||addressObj.markerAriaLabel
addressObj.markerText=markerDataObj.markerText||addressObj.markerText
addressObj.markerTextActive=markerDataObj.markerTextActive||addressObj.markerTextActive
addressObj.marker=markerDataObj.marker||addressObj.marker
addressObj.markerActive=markerDataObj.markerActive||addressObj.markerActive}catch(e){console.error('Bricks: Invalid JSON data for marker',e)}
if(addressObj.infoBoxSelector){const popup=document.querySelector(`[data-popup-loop-id="${addressObj.infoBoxSelector}"]`)||document.querySelector(`.brx-popup.brxe-${queryId}[data-popup-ajax="1"]`)
if(popup){addressObj.popupNode=popup
addressObj.isAjaxPopup=popup.hasAttribute('data-popup-ajax')
addressObj.infoWidth=parseInt(popup.getAttribute('data-brx-infobox-width'))||addressObj.infoWidth}}
addressElement.setAttribute('data-brx-address-id',uniqueId)
addressElement.setAttribute('data-brx-sync-map-id',mapElId)
return addressObj})
return addresses}
const queryAddresses=(settings,mapElId)=>{const addressesSettings=Array.isArray(settings.addresses)?settings.addresses:[]
const addresses=Array.from(addressesSettings).map((address)=>{const addressObj={latitude:address.latitude,longitude:address.longitude,address:address.address,id:address.id,infoTitle:address.infoTitle,infoSubtitle:address.infoSubtitle,infoOpeningHours:address.infoOpeningHours,infoImages:address.infoImages,infoBoxSelector:address.infoBoxSelector,infoWidth:address.infoWidth||300,popupNode:null,isAjaxPopup:false,popupTemplatId:address.popupTemplatId,markerAriaLabel:address.markerAriaLabel||'',markerText:address.markerText||'',markerTextActive:address.markerTextActive||'',marker:address.marker||{},markerActive:address.markerActive||{}}
if(addressObj.infoBoxSelector){const popup=document.querySelector(`[data-popup-loop-id="${addressObj.infoBoxSelector}"]`)||document.querySelector(`.brx-popup.brxe-${mapElId}[data-popup-ajax="1"]`)
if(popup){addressObj.popupNode=popup
addressObj.isAjaxPopup=popup.hasAttribute('data-popup-ajax')
addressObj.infoWidth=parseInt(popup.getAttribute('data-brx-infobox-width'))||addressObj.infoWidth}}
return addressObj})
return addresses}
const onMarkerClick=(addressObj,mapElId)=>{const mapInstance=window.bricksData.googleMapInstances[mapElId]||false
const map=window.bricksData.googleMapInstances[mapElId]?.map||false
if(!map||!mapInstance){return}
const allLocations=window.bricksData.googleMapInstances[mapElId]?.locations||[]
const currentLocation=allLocations.find((location)=>location.id===addressObj.id)
allLocations.forEach((location)=>{location.infoBox?.close()
updateMarker(location,mapElId,false)})
updateMarker(currentLocation,mapElId,true)
const infoBox=getInfoBox(addressObj,mapElId)
if(infoBox){infoBox.open(map,currentLocation.marker)}else{map.panTo(currentLocation.position)}}
const createMarkerContent=(options)=>{const{type,url,width,height,text,extraClassName}=options
if(type==='text'){const textElement=document.createElement('div')
textElement.className=`brx-marker-text ${extraClassName || ''}`textElement.innerHTML=text||'Marker'
return textElement}else{const img=document.createElement('img')
img.src=url||'data:image/svg+xml;base64,CgkJCQk8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI2cHgiIGhlaWdodD0iMzhweCIgdmlld0JveD0iMCAwIDI2IDM3IiBmaWxsPSJub25lIj4KCQkJCQk8Zz4KCQkJCQkJPHBhdGggZD0iTTEzIDBDNS44MTc1IDAgMCA1Ljc3MzI4IDAgMTIuOTE4MUMwIDIwLjU3MzMgNS41OSAyMy40NDQgOS41NTQ5OSAzMC4wNzg0QzEyLjA5IDM0LjMyMDcgMTEuMzQyNSAzNyAxMyAzN0MxNC43MjI1IDM3IDEzLjk3NSAzNC4yNTY5IDE2LjQ0NSAzMC4xNDIyQzIwLjA4NSAyMy44NTg2IDI2IDIwLjYwNTIgMjYgMTIuOTE4MUMyNiA1Ljc3MzI4IDIwLjE4MjUgMCAxMyAwWiIgZmlsbD0iI0M1MjIxRiIvPgoJCQkJCQk8cGF0aCBkPSJNMTMuMDE2NyAzNUMxMi43ODM2IDM1IDEyLjcxNzEgMzQuOTM0NiAxMi4zMTc2IDMzLjcyNUMxMS45ODQ4IDMyLjY3ODkgMTEuNDg1NCAzMS4wNzY5IDEwLjE4NzMgMjkuMTE1NEM4LjkyMjMzIDI3LjE4NjYgNy41OTA4NSAyNS42MTczIDYuMzI1OTQgMjQuMTEzNUMzLjM2MzM5IDIwLjUxNzQgMSAxNy43MDU3IDEgMTIuNjM4NUMxLjAzMzI5IDYuMTk4MDggNi4zOTI1MSAxIDEzLjAxNjcgMUMxOS42NDA4IDEgMjUgNi4yMzA3OCAyNSAxMi42Mzg1QzI1IDE3LjcwNTcgMjIuNjY5OSAyMC41NSAxOS42NzQxIDI0LjE0NjJDMTguNDQyNSAyNS42NSAxNy4xNDQzIDI3LjIxOTMgMTUuODc5MyAyOS4xMTU0QzE0LjYxNDQgMzEuMDQ0MiAxNC4wODE4IDMyLjYxMzUgMTMuNzQ5IDMzLjY1OTZDMTMuMzQ5NSAzNC45MzQ2IDEzLjI0OTcgMzUgMTMuMDE2NyAzNVoiIGZpbGw9IiNFQTQzMzUiLz4KCQkJCQkJPHBhdGggZD0iTTEzIDE4QzE1Ljc2MTQgMTggMTggMTUuNzYxNCAxOCAxM0MxOCAxMC4yMzg2IDE1Ljc2MTQgOCAxMyA4QzEwLjIzODYgOCA4IDEwLjIzODYgOCAxM0M4IDE1Ljc2MTQgMTAuMjM4NiAxOCAxMyAxOFoiIGZpbGw9IiNCMzE0MTIiLz4KCQkJCQk8L2c+CgkJCQk8L3N2Zz4='
img.className=url?`brx-marker-img ${extraClassName || ''}`:`brx-marker-img default ${extraClassName || ''}`img.alt='Map marker'
if(width)img.style.width=width+'px'
if(height)img.style.height=height+'px'
return img}}
const renderMapMarker=(addressObj,position,mapElId)=>{const mapInstance=window.bricksData.googleMapInstances[mapElId]||false
const map=window.bricksData.googleMapInstances[mapElId]?.map||false
const settings=mapInstance?.settings||false
if(!map||!mapInstance||!addressObj||!position||!settings){return}
const locationInfo={id:addressObj.id,infoTitle:addressObj.infoTitle,address:addressObj,position:position,customMarker:false,customMarkerActive:false,marker:false}
const createCustomMarker=(type,settings,locationInfo,active=false)=>{if(type==='text'){const markerText=active?locationInfo?.address?.markerTextActive||locationInfo?.address?.markerText||settings?.markerTextActive||settings?.markerText||'Marker':locationInfo?.address?.markerText||settings?.markerText||'Marker'
return createMarkerContent({type:'text',text:markerText,extraClassName:active?'active':''})}else{const url=active?locationInfo?.address?.markerActive?.url||locationInfo?.address?.marker?.url||settings?.markerActive||settings?.marker||'':locationInfo?.address?.marker?.url||settings?.marker||''
const width=active?locationInfo?.address?.markerActive?.width||locationInfo?.address?.markerWidth||settings?.markerActiveWidth||settings?.markerWidth||'40':locationInfo?.address?.markerWidth||settings?.markerWidth||'40'
const height=active?locationInfo?.address?.markerActive?.height||locationInfo?.address?.markerHeight||settings?.markerActiveHeight||settings?.markerHeight||'40':locationInfo?.address?.markerHeight||settings?.markerHeight||'40'
return createMarkerContent({type:'image',url,width,height,extraClassName:active?'active':''})}}
locationInfo.customMarker=createCustomMarker(settings.markerType,settings,locationInfo)
locationInfo.customMarkerActive=createCustomMarker(settings.markerType,settings,locationInfo,true)
locationInfo.marker=new BricksGoogleMarker({position:position,content:locationInfo.customMarker,map:map,title:addressObj?.markerAriaLabel||addressObj?.infoTitle||addressObj?.id||'',clickable:true,markerData:{addressObj:addressObj,locationInfo:locationInfo}})
if(!locationInfo.marker){return}
mapInstance.locations.push(locationInfo)
locationInfo.marker.setMap(map)
google.maps.event.addListener(locationInfo.marker,'click',()=>{onMarkerClick(addressObj,mapElId)})}
const renderLocations=async(mapElId,addresses,trigger='pageLoad')=>{try{await renderMapMarkers(mapElId,addresses)
dispatchMarkersRenderedEvent(mapElId)
adjustMap(mapElId,trigger)}catch(error){console.error('Error rendering map markers:',error)
throw error}
async function renderMapMarkers(mapElId,addresses){const geocoder=new google.maps.Geocoder()
for(const addressObj of addresses){try{if(addressObj?.latitude&&addressObj?.longitude){renderMapMarker(addressObj,{lat:parseFloat(addressObj.latitude),lng:parseFloat(addressObj.longitude)},mapElId)}else if(addressObj?.address){const results=await geocodeAddress(geocoder,addressObj.address)
if(results){const position=results[0].geometry.location
renderMapMarker(addressObj,position,mapElId)}}}catch(error){console.warn('Geocode error:',error)}}}
function dispatchMarkersRenderedEvent(mapElId){document.dispatchEvent(new CustomEvent(`bricks/map/markers/rendered/${mapElId}`))}
function adjustMap(mapElId,trigger){const mapInstance=window.bricksData.googleMapInstances[mapElId]||false
if(!mapInstance){return}
const{map,mapOptions,locations}=mapInstance
if(trigger==='syncQuery'&&!mapInstance.fitMapOnMarkersChange){return}
if(locations.length<1){map.setZoom(mapOptions.zoom)
map.panTo(mapOptions.center)}else if(locations.length===1&&trigger==='pageLoad'){const singleLocation=locations[0]
if(singleLocation.position){map.panTo(singleLocation.position)}
const mapIdleListener=google.maps.event.addListener(map,'idle',()=>{map.setZoom(mapOptions.zoom)
google.maps.event.removeListener(mapIdleListener)})}else{mapInstance.bounds=new google.maps.LatLngBounds()
locations.forEach((location)=>{if(location.position&&location.position.lat&&location.position.lng){mapInstance.bounds.extend(location.position)}})
map.fitBounds(mapInstance.bounds)
map.panToBounds(mapInstance.bounds)
if(locations.length===1){const mapIdleListener=google.maps.event.addListener(map,'idle',()=>{map.setZoom(mapOptions.zoom)
google.maps.event.removeListener(mapIdleListener)})}}}}
const registerInteractionAddresses=()=>{const interactionElements=document.querySelectorAll('[data-interactions*="openAddress"], [data-interactions*="closeAddress"]')
if(interactionElements.length<1)return
interactionElements.forEach((el)=>{let loopId,mapLocation
if(el.closest('.brx-infobox-popup[data-interaction-loop-id]')&&el.closest('.brx-popup[data-popup-ajax="1"]')){loopId=el.closest('.brx-infobox-popup[data-interaction-loop-id]').dataset.interactionLoopId
mapLocation=document.querySelector(`.brxe-map-connector[data-brx-infobox-selector="${loopId}"]`)}else{loopId=el.dataset?.interactionLoopId
mapLocation=document.querySelector(`.brxe-map-connector[data-brx-infobox-selector="${loopId}"]`)}
if(!mapLocation){mapLocation=el.closest('[data-brx-address-id][data-brx-sync-map-id')}
if(!mapLocation||!loopId)return
const{brxAddressId:addressId,brxSyncMapId:mapId}=mapLocation.dataset
if(!addressId||!mapId)return
el.setAttribute('data-brx-infobox-open',addressId)
el.setAttribute('data-brx-infobox-map-id',mapId)})}
const updateInteractionAttributes=(action,addressId,mapElId)=>{if(!addressId||!mapElId)return
const interactionElements=document.querySelectorAll(`[data-brx-infobox-open="${addressId}"][data-brx-infobox-map-id="${mapElId}"]`)
if(interactionElements.length<1)return
interactionElements.forEach((el)=>{if(action==='open'){el.classList.add('infobox-opened')}else if(action==='close'){el.classList.remove('infobox-opened')}})}
setTimeout(async()=>{const settings=(()=>{const mapOptions=mapEl.dataset.bricksMapOptions
if(!mapOptions)return false
try{return JSON.parse(mapOptions)}catch(e){return false}})(mapEl)
const mapElId=mapEl.dataset.scriptId||false
if(!settings||!mapElId)return
if(!window.bricksData.googleMapInstances){window.bricksData.googleMapInstances={}}
if(window.bricksData.googleMapInstances?.[mapElId]){if(window.bricksData.googleMapInstances[mapElId].nodesAddedEvent){document.removeEventListener('bricks/ajax/nodes_added',window.bricksData.googleMapInstances[mapElId].nodesAddedEvent)}
if(window.bricksData.googleMapInstances[mapElId].markersRenderedEvent){document.removeEventListener(`bricks/map/markers/rendered/${mapElId}`,window.bricksData.googleMapInstances[mapElId].markersRenderedEvent)}
if(window.bricksData.googleMapInstances[mapElId].clustererInstance){window.bricksData.googleMapInstances[mapElId].clustererInstance.clearMarkers()}
delete window.bricksData.googleMapInstances[mapElId]}
mapEl.removeAttribute('data-bricks-map-options')
if(settings.disableDefaultUI){Object.assign(settings,{fullscreenControl:false,mapTypeControl:false,streetViewControl:false,zoomControl:false})}
const mapOptions={mapTypeId:settings?.type||'ROADMAP',zoom:settings.zoom?parseInt(settings.zoom):12,gestureHandling:(()=>{if(!settings.draggable)return'none'
if(settings.scrollwheel&&settings.draggable)return'cooperative'
if(!settings.scrollwheel&&settings.draggable)return'greedy'
return'auto'})(),fullscreenControl:settings.fullscreenControl,mapTypeControl:settings.mapTypeControl,streetViewControl:settings.streetViewControl,zoomControl:settings.zoomControl,disableDefaultUI:settings.disableDefaultUI,clickableIcons:settings?.clickableIcons}
const mapId=settings?.googleMapId||false
const useMarkerClusterer=settings?.markerCluster||false
const mapMode=settings?.mapMode||'static'
const syncQuery=settings?.syncQuery||false
const noLocationsText=settings?.noLocationsText||window.bricksData.i18n.noLocationsFound||false
const markerType=settings?.markerType||'image'
const fitMapOnMarkersChange=settings?.fitMapOnMarkersChange||false
if(mapId)mapOptions.mapId=mapId
if(settings?.styles&&!mapId){try{mapOptions.styles=JSON.parse(settings.styles)}catch(e){console.error('Error parsing map styles:',e)}}
if(settings.zoomControl){if(settings?.maxZoom)mapOptions.maxZoom=parseInt(settings.maxZoom)
if(settings?.minZoom)mapOptions.minZoom=parseInt(settings.minZoom)}
const bounds=new google.maps.LatLngBounds()
if(settings?.center){if(settings?.center?.address){const geocoder=new google.maps.Geocoder()
const results=await geocodeAddress(geocoder,settings.center.address)
if(results){mapOptions.center={lat:results[0].geometry.location.lat(),lng:results[0].geometry.location.lng()}}}else if(settings?.center?.latitude&&settings?.center?.longitude){mapOptions.center={lat:parseFloat(settings.center.latitude),lng:parseFloat(settings.center.longitude)}}else{mapOptions.center={lat:52.5164154966524,lng:13.377643715349544}}}
let addresses=[]
switch(mapMode){case'sync':addresses=syncAddresses(syncQuery,mapElId,mapOptions.center)
break
case'query':addresses=queryAddresses(settings,mapElId)
break
case'static':addresses=Array.isArray(settings?.addresses)?settings.addresses:[{address:mapOptions.center}]
break}
const map=new google.maps.Map(mapEl,mapOptions)
window.bricksData.googleMapInstances[mapElId]={map,mapMode,mapOptions,mapId,bounds,settings,locations:[],useMarkerClusterer,clustererInstance:false,syncQuery,noLocationsText,markerType,nodesAddedEvent:false,markersRenderedEvent:false,fitMapOnMarkersChange}
if(syncQuery){window.bricksData.googleMapInstances[mapElId].nodesAddedEvent=async(event)=>{const queryId=event?.detail?.queryId||false
const mapInstance=window.bricksData.googleMapInstances[mapElId]||false
if(!queryId||queryId!==syncQuery||!mapInstance)return
mapInstance.locations.forEach((location)=>{location.infoBox?.close()
location.marker?.setMap(null)
if(!location?.address?.isAjaxPopup&&location?.address?.popupNode&&location?.address?.popupContentNode){const placeholder=location.address.popupNode.querySelector('.brx-popup-content')
if(placeholder){placeholder.parentNode.replaceChild(location.address.popupContentNode,placeholder)}}})
mapInstance.locations=[]
if(mapInstance.useMarkerClusterer&&mapInstance.clustererInstance){mapInstance.clustererInstance.clearMarkers()}
const newAddresses=syncAddresses(syncQuery,mapElId)
await renderLocations(mapElId,newAddresses,'syncQuery')}
document.addEventListener('bricks/ajax/nodes_added',window.bricksData.googleMapInstances[mapElId].nodesAddedEvent)}
window.bricksData.googleMapInstances[mapElId].markersRenderedEvent=()=>{const mapInstance=window.bricksData.googleMapInstances[mapElId]||false
if(!mapInstance)return
const markers=mapInstance.locations.map((location)=>location.marker)
const noLocationsDiv=mapEl.querySelector('.brx-map-no-results')
if(markers.length<1&&mapInstance.noLocationsText){if(!noLocationsDiv){const div=document.createElement('div')
div.classList.add('brx-map-no-results')
div.innerHTML=mapInstance.noLocationsText
mapEl.appendChild(div)}}else{noLocationsDiv?.remove()}
if(mapInstance.useMarkerClusterer){const clustererOptions={map:mapInstance.map,markers:markers,algorithmOptions:{maxZoom:16,radius:60}}
clustererOptions.renderer={render:({count,position},stats)=>{return new BricksGoogleMarker({position:position,content:`<svg class="brx-map-cluster" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="60" height="60"><circle cx="120" cy="120" opacity=".6" r="70"></circle><circle cx="120" cy="120" opacity=".4" r="90"></circle><circle cx="120" cy="120" opacity=".2" r="110"></circle><text x="50%" y="50%" text-anchor="middle" font-size="60" font-weight="600" font-family="roboto,arial,sans-serif" dominant-baseline="middle">${count}</text></svg>`,title:`Cluster of ${count} markers`,clickable:true,zIndex:Number(google.maps.Marker.MAX_ZINDEX)+count})}}
mapInstance.clustererInstance=new markerClusterer.MarkerClusterer(clustererOptions)}
registerInteractionAddresses()}
document.addEventListener(`bricks/map/markers/rendered/${mapElId}`,window.bricksData.googleMapInstances[mapElId].markersRenderedEvent)
await renderLocations(mapElId,addresses,'pageLoad')},index*1000)}})
async function bricksMap(){const beforeBricksMap=()=>{return new Promise((resolve,reject)=>{if(typeof InfoBox!=='undefined'&&typeof markerClusterer!=='undefined'&&typeof BricksGoogleMarker!=='undefined'){return resolve()}
const infoBoxSrc=window?.bricksData?.infoboxScript||false
if(!infoBoxSrc){console.error('InfoBox library URL not found')
return reject(new Error('InfoBox library URL not found'))}
const loadScript=(src,id)=>{return new Promise((resolve,reject)=>{const script=document.createElement('script')
if(!bricksIsFrontend&&window.bricksData?.builderCloudflareRocketLoader){script.setAttribute('data-cfasync','false')}
script.src=src
script.async=true
script.defer=true
script.id=id
script.onload=()=>resolve()
script.onerror=(error)=>reject(error)
document.body.appendChild(script)})}
const markerClustererSrc=window?.bricksData?.markerClustererScript||false
if(!markerClustererSrc){console.error('MarkerClusterer library URL not found')
return reject(new Error('MarkerClusterer library URL not found'))}
const googleMarkerSrc=window?.bricksData?.bricksGoogleMarkerScript||false
if(!googleMarkerSrc){console.error('Bricks Google Marker library URL not found')
return reject(new Error('Bricks Google Marker library URL not found'))}
Promise.all([loadScript(infoBoxSrc,'bricks-google-maps-infobox'),loadScript(googleMarkerSrc,'bricks-google-marker'),loadScript(markerClustererSrc,'bricks-google-maps-markerclusterer')]).then(()=>{resolve()}).catch((error)=>{console.error('Error loading library',error)
reject(error)})})}
await google.maps.importLibrary('marker')
await beforeBricksMap()
bricksMapFn.run()}