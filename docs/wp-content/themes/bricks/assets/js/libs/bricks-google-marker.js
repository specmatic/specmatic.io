class BricksGoogleMarker extends google.maps.OverlayView{constructor(options){super()
this.position=options.position instanceof google.maps.LatLng?options.position:new google.maps.LatLng(options.position.lat,options.position.lng)
this.content=options.content
this.map=options.map
this.title=options.title||''
this.zIndex=options.zIndex||1
this.clickable=options.clickable!==false
this.visible=options.visible!==false
this.div=null
this.clickListener=null
this.keyUpListener=null
this.markerData=options.markerData||{}
this.setMap(this.map)}
onAdd(){this.div=document.createElement('div')
this.div.className='brx-google-marker'
this.div.style.position='absolute'
this.div.style.cursor=this.clickable?'pointer':'default'
this.div.style.zIndex=this.zIndex
this.div.style.transform='translate(-50%, -100%)'
this.div.title=this.title||'Google Marker'
this.div.setAttribute('role','button')
this.div.setAttribute('tabindex','0')
if(!this.visible){this.div.style.display='none'}
if(typeof this.content==='string'){this.div.innerHTML=this.content}else if(this.content instanceof HTMLElement){this.div.appendChild(this.content)}
if(this.clickable){this.clickListener=()=>{google.maps.event.trigger(this,'click')}
this.div.addEventListener('click',this.clickListener)}
this.keyUpListener=(event)=>{if(event.key==='Enter'){event.preventDefault()
google.maps.event.trigger(this,'click')}
else if(event.key==='Tab'){this.map.panTo(this.getPosition())}
else if(event.key==='Escape'){event.preventDefault()
if(this.markerData?.locationInfo?.infoBox){google.maps.event.trigger(this.markerData.locationInfo.infoBox,'closeclick')
this.markerData.locationInfo.infoBox?.close()}}}
this.div.addEventListener('keyup',this.keyUpListener)
const panes=this.getPanes()
panes.overlayMouseTarget.appendChild(this.div)}
draw(){if(!this.div)return
const overlayProjection=this.getProjection()
const position=overlayProjection.fromLatLngToDivPixel(this.position)
if(position){this.div.style.left=position.x+'px'
this.div.style.top=position.y+'px'}}
onRemove(){if(this.div){if(this.clickListener){this.div.removeEventListener('click',this.clickListener)}
if(this.keyUpListener){this.div.removeEventListener('keydown',this.keyUpListener)}
if(this.div.parentNode){this.div.parentNode.removeChild(this.div)}
this.div=null}}
getPosition(){return this.position instanceof google.maps.LatLng?this.position:new google.maps.LatLng(this.position.lat,this.position.lng)}
setPosition(position){this.position=position instanceof google.maps.LatLng?position:new google.maps.LatLng(position.lat,position.lng)
this.draw()}
setVisible(visible){this.visible=visible
if(this.div){this.div.style.display=visible?'block':'none'}}
getVisible(){return this.visible}
setMap(map){super.setMap(map)}
setContent(content){this.content=content
if(this.div){if(typeof content==='string'){this.div.innerHTML=content}else if(content instanceof HTMLElement){this.div.innerHTML=''
this.div.appendChild(content)}}}
setZIndex(zIndex){this.zIndex=zIndex
if(this.div){this.div.style.zIndex=zIndex}}}