if(window.bricksUtils){window.bricksUtils.updateLiveSearchTerm=function(targetQueryId,searchValue){const liveSearchTerms=document.querySelectorAll(`span[data-brx-ls-term="${targetQueryId}"]`)
liveSearchTerms.forEach((term)=>{term.innerHTML=searchValue})}
window.bricksUtils.hideLiveSearchWrapper=function(targetQueryId){const liveSearchWrappers=document.querySelectorAll(`[data-brx-ls-wrapper="${targetQueryId}"]`)
liveSearchWrappers.forEach((wrapper)=>{wrapper.classList.remove('brx-ls-active')})}
window.bricksUtils.showLiveSearchWrapper=function(targetQueryId){const liveSearchWrappers=document.querySelectorAll(`[data-brx-ls-wrapper="${targetQueryId}"]`)
liveSearchWrappers.forEach((wrapper)=>{wrapper.classList.add('brx-ls-active')})}
window.bricksUtils.updateSelectedFilters=function(targetQueryId,filterInstance,customURL=false){const filterId=filterInstance.filterId||false
const queryInstance=window.bricksData.queryLoopInstances[targetQueryId]||false
if(!filterId||!targetQueryId||!queryInstance){return}
const targetIsLiveSearch=queryInstance?.isLiveSearch||false
if(!window.bricksData.selectedFilters[targetQueryId]){window.bricksData.selectedFilters[targetQueryId]={}}
let newUrl=customURL?customURL:window.location.origin+window.location.pathname
const isFilterInstanceEmpty=(filterInstance)=>{return(filterInstance.currentValue===''||(filterInstance.currentValue===0&&filterInstance.filterType==='pagination')||(Array.isArray(filterInstance.currentValue)&&filterInstance.currentValue.length===0)||(filterInstance.filterType==='range'&&JSON.stringify(filterInstance.currentValue)===JSON.stringify([filterInstance.min,filterInstance.max])))}
const rearrangeSelectedFilters=(targetQueryId)=>{if(!window.bricksData.selectedFilters[targetQueryId]){return}
let newSelectedFilters={}
let filterIndex=0
Object.keys(window.bricksData.selectedFilters[targetQueryId]).forEach((key)=>{const filterId=window.bricksData.selectedFilters[targetQueryId][key]
newSelectedFilters[filterIndex]=filterId
filterIndex++})
window.bricksData.selectedFilters[targetQueryId]=newSelectedFilters}
if(isFilterInstanceEmpty(filterInstance)){Object.keys(window.bricksData.selectedFilters[targetQueryId]).forEach((key)=>{if(window.bricksData.selectedFilters[targetQueryId][key]===filterId){delete window.bricksData.selectedFilters[targetQueryId][key]
const thisFilter=window.bricksData.filterInstances[filterId]||false
if(thisFilter&&thisFilter.filterType==='pagination'){newUrl=newUrl.replace(/\/page\/[0-9]+/g,'')}}})
rearrangeSelectedFilters(targetQueryId)}else{const isFilterIdExist=Object.values(window.bricksData.selectedFilters[targetQueryId]).includes(filterId)
if(!isFilterIdExist){let filterIndex=Object.keys(window.bricksData.selectedFilters[targetQueryId]).length
window.bricksData.selectedFilters[targetQueryId][filterIndex]=filterId}}
if(filterInstance.filterType!=='pagination'&&window.bricksData.selectedFilters[targetQueryId]){let paginationRemoved=false
Object.keys(window.bricksData.selectedFilters[targetQueryId]).forEach((key)=>{const filterId=window.bricksData.selectedFilters[targetQueryId][key]
const filterInstance=window.bricksData.filterInstances[filterId]||false
if(filterInstance&&filterInstance.filterType==='pagination'){delete window.bricksData.selectedFilters[targetQueryId][key]
bricksUtils.resetFilterValue(filterInstance)
paginationRemoved=true}})
rearrangeSelectedFilters(targetQueryId)
if(paginationRemoved&&!targetIsLiveSearch){newUrl=newUrl.replace(/\/page\/[0-9]+/g,'')}}
if(filterInstance.filterType==='apply'){window.bricksData.selectedFilters[targetQueryId]={}
let allFilters=bricksUtils.getFiltersForQuery(targetQueryId)
allFilters.forEach((fInstance)=>{if(isFilterInstanceEmpty(fInstance)){return}
const isFilterIdExist=Object.values(window.bricksData.selectedFilters[targetQueryId]).includes(fInstance.filterId)
if(!isFilterIdExist){let filterIndex=Object.keys(window.bricksData.selectedFilters[targetQueryId]).length
window.bricksData.selectedFilters[targetQueryId][filterIndex]=fInstance.filterId}})}
if(filterInstance.filterType==='reset'){window.bricksData.selectedFilters[targetQueryId]={}}
if(queryInstance?.disableUrlParams){return}
if(targetIsLiveSearch){newUrl=window.location.href}else{let params=bricksUtils.buildFilterUrlParams(targetQueryId)
newUrl=params?`${newUrl}?${params}`:newUrl}
bricksUtils.updatePushState(targetQueryId,newUrl)}
window.bricksUtils.resetFilterValue=function(filter,targetValue=false){const filterType=filter.filterType
const element=filter.filterElement
const originalValue=filter.originalValue
const targetQueryId=filter.targetQueryId
switch(filterType){case'search':element.value=originalValue
filter.currentValue=originalValue
const searchIcon=element.nextElementSibling||false
if(searchIcon){if(originalValue===''){searchIcon.classList.remove('brx-show')}else{searchIcon.classList.add('brx-show')}}
bricksUtils.updateLiveSearchTerm(targetQueryId,originalValue)
break
case'select':element.value=originalValue
filter.currentValue=originalValue
break
case'pagination':filter.currentValue=originalValue
break
case'radio':element.value=originalValue
filter.currentValue=originalValue
const radioInputs=element.querySelectorAll('input')
radioInputs.forEach((radioInput)=>{if(radioInput.value!==originalValue){radioInput.checked=false}else{radioInput.checked=true}})
break
case'checkbox':const updateCheckboxes=(checkboxInputs,valueSet)=>{checkboxInputs.forEach((checkboxInput)=>{checkboxInput.checked=valueSet.has(checkboxInput.value)})}
if(targetValue!==false){filter.currentValue=filter.currentValue.filter((value)=>value!==targetValue)
const checkboxInputs=element.querySelectorAll('input')
updateCheckboxes(checkboxInputs,new Set([targetValue]))}else{filter.currentValue=[...originalValue]
const checkboxInputs=element.querySelectorAll('input')
updateCheckboxes(checkboxInputs,new Set(originalValue))}
break
case'datepicker':const flatpickrInstance=filter.datepicker||false
if(!flatpickrInstance){return}
flatpickrInstance.clear()
flatpickrInstance.setDate(originalValue,false)
filter.currentValue=originalValue
break
case'range':filter.currentValue=[...originalValue]
break}}
window.bricksUtils.buildFilterUrlParams=function(targetQueryId){let brxUrlParams=new URLSearchParams()
let oriUrlParams=new URLSearchParams(window.location.search)
let otherParams={}
oriUrlParams.forEach((value,key)=>{let paramKey=key.replace(/\[.*?\]/g,'[]')
paramKey=paramKey.replace('[]','')
if(!paramKey.includes('brx_')&&!window.bricksData.filterNiceNames.includes(paramKey)){otherParams[key]=value}})
Object.keys(otherParams).forEach((key)=>{brxUrlParams.append(key,otherParams[key])})
if(Object.keys(window.bricksData.selectedFilters[targetQueryId]).length>0){Object.keys(window.bricksData.selectedFilters[targetQueryId]).forEach((key)=>{const filterId=window.bricksData.selectedFilters[targetQueryId][key]
const filterInstance=window.bricksData.filterInstances[filterId]||false
if(!filterInstance){return}
let value=filterInstance.currentValue
let urlKey=filterInstance.filterNiceName||`brx_${filterId}`if(value===''||(Array.isArray(value)&&value.length===0)){return}
if(filterInstance.filterType==='pagination'){return}
if(Array.isArray(value)){urlKey=`${urlKey}[]`value.forEach((v)=>{brxUrlParams.append(urlKey,v)})}else{brxUrlParams.append(urlKey,value)}})}
return brxUrlParams.toString()??''}
window.bricksUtils.updatePushState=function(targetQueryId,url){if(!targetQueryId||!url){return}
let instancesValue={}
let allTargetQueryIds=bricksUtils.currentPageTargetQueryIds()
allTargetQueryIds.forEach((targetQueryId)=>{instancesValue[targetQueryId]={}
let allFilters=bricksUtils.getFiltersForQuery(targetQueryId)
allFilters.forEach((filterInstance)=>{instancesValue[targetQueryId][filterInstance.filterId]=filterInstance.currentValue})})
let selectedFiltersState=window.bricksData.selectedFilters
window.history.pushState({isBricksFilter:true,targetQueryId:targetQueryId,selectedFilters:selectedFiltersState,instancesValue:instancesValue},'',url)}
window.bricksUtils.getFiltersForQuery=function(targetQueryId,property=false){if(!window.bricksData.filterInstances||Object.keys(window.bricksData.filterInstances).length<1){return[]}
const filters=Object.values(window.bricksData.filterInstances).filter((filter)=>{return filter.targetQueryId===targetQueryId})||[]
if(property){return filters.map((filter)=>{return filter[property]})}
return filters}
window.bricksUtils.currentPageTargetQueryIds=function(){if(!window.bricksData.filterInstances||Object.keys(window.bricksData.filterInstances).length<1){return[]}
const targetQueryIds=Object.values(window.bricksData.filterInstances).reduce((acc,filter)=>{if(!acc.includes(filter.targetQueryId)){acc.push(filter.targetQueryId)}
return acc},[])
return targetQueryIds}
window.bricksUtils.getSelectedFiltersForQuery=function(targetQueryId){if(!window.bricksData.selectedFilters||!window.bricksData.selectedFilters[targetQueryId]||!window.bricksData.filterInstances||Object.keys(window.bricksData.filterInstances).length<1){return[]}
let selectedFilters=Object.values(window.bricksData.selectedFilters[targetQueryId]).reduce((acc,filterId)=>{let filter=window.bricksData.filterInstances[filterId]||false
if(filter){acc[filter.filterId]=filter.currentValue}
return acc},{})
return selectedFilters}
window.bricksUtils.fetchFilterResults=function(targetQueryId,isPopState=false){if(!targetQueryId||!window.bricksData.queryLoopInstances[targetQueryId]){return}
bricksGetQueryResult(targetQueryId,isPopState).then((res)=>{bricksDisplayQueryResult(targetQueryId,res)}).catch((err)=>{if(!window.bricksData.queryLoopInstances[targetQueryId].xhrAborted){console.log('bricksGetQueryResult:error',err)}})}
window.bricksUtils.getDynamicTagsForParse=function(targetQueryId){const dynamicTags=[]
const activeFiltersCountDDs=Object.values(window.bricksData.activeFiltersCountInstances).filter((instance)=>{return(instance?.targetQueryId===targetQueryId&&instance?.dynamicTag.startsWith('active_filters_count'))})
activeFiltersCountDDs.forEach((instance)=>{dynamicTags.push(instance.dynamicTag)})
return dynamicTags}
window.bricksUtils.updateParsedDynamicTags=function(targetQueryId,parsedDynamicTags){const activeFiltersCountDDs=Object.values(window.bricksData.activeFiltersCountInstances).filter((instance)=>{return(instance?.targetQueryId===targetQueryId&&instance?.dynamicTag.startsWith('active_filters_count'))})
activeFiltersCountDDs.forEach((instance)=>{const dynamicTag=instance.dynamicTag
const element=instance.element
if(parsedDynamicTags[dynamicTag]&&element.isConnected){element.innerHTML=parsedDynamicTags[dynamicTag]}})}}
const bricksFiltersFn=new BricksFunction({parentNode:document,selector:'[data-brx-filter]',frontEndOnly:true,eachElement:(element)=>{const filterSettings=JSON.parse(element.dataset?.brxFilter)||false
if(!filterSettings){return}
const filterId=filterSettings?.filterId||false
const targetQueryId=filterSettings?.targetQueryId||false
const filterType=filterSettings?.filterType||false
const filterAction=filterSettings?.filterAction||false
const niceName=filterSettings?.filterNiceName||''
if(!filterId||!targetQueryId||!filterType||!filterAction){return}
if(!window.bricksData.filterInstances){window.bricksData.filterInstances={}}
if(!window.bricksData.filterInstances[filterId]){filterSettings.filterElement=element
filterSettings.currentValue=''
filterSettings.originalValue=''
switch(filterType){case'search':if(element.value){filterSettings.currentValue=element.value}
break
case'select':if(element.value){filterSettings.currentValue=element.value}
break
case'reset':break
case'apply':break
case'active-filters':break
case'radio':let radioValue=element.querySelector('input:checked')
if(radioValue){filterSettings.currentValue=radioValue.value}
break
case'checkbox':const checkboxValue=element.querySelectorAll('input:checked')
if(checkboxValue.length){let currentValue=Array.from(checkboxValue).map((input)=>{return input.value})
filterSettings.currentValue=currentValue}else{filterSettings.currentValue=[]}
filterSettings.originalValue=[]
break
case'pagination':const currentPage=bricksUtils.getPageNumberFromUrl(window.location.href)
filterSettings.currentValue=currentPage
if(currentPage>1){if(!window.bricksData.selectedFilters[targetQueryId]){window.bricksData.selectedFilters[targetQueryId]={}}
const isFilterIdExist=Object.values(window.bricksData.selectedFilters[targetQueryId]).includes(filterId)
if(!isFilterIdExist){let filterIndex=Object.keys(window.bricksData.selectedFilters[targetQueryId]).length
window.bricksData.selectedFilters[targetQueryId][filterIndex]=filterId}}
break
case'datepicker':let flatpickrOptions=element.dataset.bricksDatepickerOptions||false
if(flatpickrOptions){flatpickrOptions=JSON.parse(flatpickrOptions)
if(flatpickrOptions.defaultDate){if(Array.isArray(flatpickrOptions.defaultDate)){flatpickrOptions.defaultDate=flatpickrOptions.defaultDate.join(',')}
filterSettings.currentValue=flatpickrOptions.defaultDate}}
break
case'range':const rangeValueLow=element.querySelector('input.min[type="number"]')||0
const rangeValueHigh=element.querySelector('input.max[type="number"]')||0
let currentValue=[filterSettings.min,filterSettings.max]
if(rangeValueLow){currentValue[0]=parseInt(rangeValueLow.value)}
if(rangeValueHigh){currentValue[1]=parseInt(rangeValueHigh.value)}
filterSettings.currentValue=[...currentValue]
filterSettings.originalValue=[filterSettings.min,filterSettings.max]
break}
window.bricksData.filterInstances[filterId]=filterSettings
if(niceName!==''&&window.bricksData.filterNiceNames&&!window.bricksData.filterNiceNames.includes(niceName)){window.bricksData.filterNiceNames.push(niceName)}}
element.dataset.brxFilter=true}})
function bricksFilters(){bricksFiltersFn.run()}
const bricksSearchFilterFn=new BricksFunction({parentNode:document,selector:'.brxe-filter-search input[data-brx-filter]',frontEndOnly:true,eachElement:(element)=>{const filterInstance=Object.values(window.bricksData.filterInstances).find((filter)=>{return filter.filterElement===element})||false
if(!filterInstance){return}
const filterId=filterInstance?.filterId||false
const targetQueryId=filterInstance?.targetQueryId||false
const filterMethod=filterInstance?.filterMethod||'ajax'
const filterApplyOn=filterInstance?.filterApplyOn||'change'
const filterInputDebounce=filterInstance?.filterInputDebounce||500
const filterMinChars=filterInstance?.filterMinChars||3
if(filterMethod==='ajax'){const hideOrShowIcon=(searchValue)=>{const icon=element.nextElementSibling||false
if(!icon){return}
if(searchValue===''){icon.classList.remove('brx-show')}else{icon.classList.add('brx-show')}}
const search=(e)=>{const searchValue=element.value
const isEnter=e.key==='Enter'
hideOrShowIcon(searchValue)
if(!isEnter&&searchValue===filterInstance.currentValue){return}
filterInstance.currentValue=searchValue
const queryInstance=window.bricksData.queryLoopInstances[targetQueryId]||false
if(!queryInstance){return}
if(queryInstance?.isLiveSearch&&searchValue===''){bricksUtils.hideLiveSearchWrapper(targetQueryId)
return}
if(!isEnter&&searchValue.length&&searchValue.length<filterMinChars){return}
if(!isEnter&&(!targetQueryId||filterApplyOn==='click')){return}
bricksUtils.updateLiveSearchTerm(targetQueryId,searchValue)
bricksUtils.updateSelectedFilters(targetQueryId,filterInstance)
bricksUtils.fetchFilterResults(targetQueryId)}
if(filterApplyOn==='change'){element.addEventListener('keyup',()=>bricksUtils.maybeAbortXhr(targetQueryId))
element.addEventListener('keyup',bricksUtils.debounce(search,filterInputDebounce))}else{element.addEventListener('input',search)
element.addEventListener('keyup',(e)=>{if(e.key==='Enter'){search(e)}})}
element.addEventListener('focus',(e)=>{const searchValue=e.target.value
const queryInstance=window.bricksData.queryLoopInstances[targetQueryId]||false
if(!queryInstance){return}
if(queryInstance?.isLiveSearch&&searchValue!==''){bricksUtils.showLiveSearchWrapper(targetQueryId)}})
const clearIcon=element.nextElementSibling||false
if(!clearIcon){return}
if(!clearIcon.classList.contains('icon')){return}
const clearSearchInputValue=(e)=>{e.preventDefault()
element.value=''
element.focus()
search(new KeyboardEvent('keyup',{key:'Enter'}))}
clearIcon.addEventListener('click',(e)=>clearSearchInputValue(e))
clearIcon.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){clearSearchInputValue(e)}})}else{}}})
function bricksSearchFilter(){bricksSearchFilterFn.run()}
const bricksSelectFilterFn=new BricksFunction({parentNode:document,selector:'.brxe-filter-select[data-brx-filter]',frontEndOnly:true,eachElement:(element)=>{const filterInstance=Object.values(window.bricksData.filterInstances).find((filter)=>{return filter.filterElement===element})||false
if(!filterInstance){return}
const filterId=filterInstance?.filterId||false
const targetQueryId=filterInstance?.targetQueryId||false
const filterMethod=filterInstance?.filterMethod||'ajax'
const filterSource=filterInstance?.filterSource||false
const filterApplyOn=filterInstance?.filterApplyOn||'change'
if(!targetQueryId){return}
if(filterMethod==='ajax'){element.addEventListener('change',function(e){const selectValue=e.target.value
if(selectValue===filterInstance.currentValue){return}
filterInstance.currentValue=selectValue
if(filterApplyOn!=='change'){return}
const queryInstance=window.bricksData.queryLoopInstances[targetQueryId]||false
if(!queryInstance){return}
bricksUtils.updateSelectedFilters(targetQueryId,filterInstance)
bricksUtils.fetchFilterResults(targetQueryId)})}}})
function bricksSelectFilter(){bricksSelectFilterFn.run()}
const bricksRadioFilterFn=new BricksFunction({parentNode:document,selector:'.brxe-filter-radio[data-brx-filter] input',frontEndOnly:true,eachElement:(radioInput)=>{const filterElement=radioInput.closest('[data-brx-filter]')||false
if(!filterElement){return}
const filterInstance=Object.values(window.bricksData.filterInstances).find((filter)=>{return filter.filterElement===filterElement})||false
if(!filterInstance){return}
const filterId=filterInstance?.filterId||false
const targetQueryId=filterInstance?.targetQueryId||false
const filterMethod=filterInstance?.filterMethod||'ajax'
const filterApplyOn=filterInstance?.filterApplyOn||'change'
if(!targetQueryId){return}
radioInput.addEventListener('keydown',function(e){if(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault()
let currentInput=e.target
let liNode=currentInput.closest('li')
if(e.key==='ArrowDown'||e.key==='ArrowRight'){let nextLiNode=liNode.nextElementSibling
while(nextLiNode&&nextLiNode.querySelector('input')&&nextLiNode.querySelector('input').disabled){nextLiNode=nextLiNode.nextElementSibling}
if(nextLiNode&&nextLiNode.querySelector('input')){nextLiNode.querySelector('input').focus()}}else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){let prevLiNode=liNode.previousElementSibling
while(prevLiNode&&prevLiNode.querySelector('input')&&prevLiNode.querySelector('input').disabled){prevLiNode=prevLiNode.previousElementSibling}
if(prevLiNode&&prevLiNode.querySelector('input')){prevLiNode.querySelector('input').focus()}}}})
if(filterMethod==='ajax'){const updateClass=()=>{const allNodesWithActiveClass=filterElement.querySelectorAll('.brx-option-active')||false
if(allNodesWithActiveClass){allNodesWithActiveClass.forEach((node)=>{node.classList.remove('brx-option-active')})}
const checkedRadio=filterElement.querySelector('input:checked')||false
if(checkedRadio){const liNode=checkedRadio.closest('li')||false
if(liNode){liNode.classList.add('brx-option-active')}
const labelNode=checkedRadio.closest('label')||false
if(labelNode){labelNode.classList.add('brx-option-active')}
const spanNode=checkedRadio.nextElementSibling||false
if(spanNode){spanNode.focus()
spanNode.classList.add('brx-option-active')}}}
radioInput.addEventListener('click',function(e){if(filterInstance.currentValue===radioInput.value){if(radioInput.value===''){return}
const otherInputs=filterElement.querySelectorAll('input')||false
if(otherInputs){otherInputs.forEach((input)=>{input.removeAttribute('checked')})}
let allOption=filterElement.querySelector('input[value=""]')||false
if(allOption){allOption.checked=true
allOption.setAttribute('checked','checked')}
radioInput.checked=false
radioInput.removeAttribute('checked')
filterInstance.currentValue=''
radioInput.dispatchEvent(new Event('change'),{bubbles:true})}else{const otherInputs=filterElement.querySelectorAll('input')||false
otherInputs.forEach((input)=>{if(input!==radioInput){input.removeAttribute('checked')}})
radioInput.checked=true
radioInput.setAttribute('checked','checked')
filterInstance.currentValue=radioInput.value}
updateClass()})
if(filterApplyOn==='change'){radioInput.addEventListener('change',function(e){const queryInstance=window.bricksData.queryLoopInstances[targetQueryId]||false
if(!queryInstance){return}
bricksUtils.updateSelectedFilters(targetQueryId,filterInstance)
bricksUtils.fetchFilterResults(targetQueryId)})}}}})
function bricksRadioFilter(){bricksRadioFilterFn.run()}
const bricksRangeFilterFn=new BricksFunction({parentNode:document,selector:'.brxe-filter-range[data-brx-filter] input[type="number"]',frontEndOnly:true,eachElement:(rangeInput)=>{const filterElement=rangeInput.closest('[data-brx-filter]')||false
if(!filterElement){return}
const filterInstance=Object.values(window.bricksData.filterInstances).find((filter)=>{return filter.filterElement===filterElement})||false
if(!filterInstance){return}
const filterId=filterInstance?.filterId||false
const targetQueryId=filterInstance?.targetQueryId||false
const filterMethod=filterInstance?.filterMethod||'ajax'
const filterApplyOn=filterInstance?.filterApplyOn||'change'
if(!targetQueryId){return}
if(filterMethod==='ajax'){rangeInput.addEventListener('change',function(e){const currentInputType=rangeInput.classList.contains('min')?'min':'max'
let rangeValueLow=currentInputType==='min'?rangeInput.value:filterElement.querySelector('input.min[type="number"]').value||0
let rangeValueHigh=currentInputType==='max'?rangeInput.value:filterElement.querySelector('input.max[type="number"]').value||0
rangeValueLow=parseFloat(rangeValueLow)
rangeValueHigh=parseFloat(rangeValueHigh)
if(isNaN(rangeValueLow)||isNaN(rangeValueHigh)){return}
if(rangeValueLow>rangeValueHigh){if(currentInputType==='min'){rangeValueLow=rangeValueHigh
rangeInput.value=rangeValueLow}else{rangeValueHigh=rangeValueLow
rangeInput.value=rangeValueHigh}}
if(rangeValueLow<filterInstance.min){rangeValueLow=filterInstance.min
rangeInput.value=rangeValueLow}else if(rangeValueLow>filterInstance.max){rangeValueLow=filterInstance.max
rangeInput.value=rangeValueLow}
let rangeValue=[rangeValueLow,rangeValueHigh]
if(rangeValue===filterInstance.currentValue){return}
filterInstance.currentValue=[...rangeValue]
if(filterApplyOn!=='change'){return}
const queryInstance=window.bricksData.queryLoopInstances[targetQueryId]||false
if(!queryInstance){return}
bricksUtils.updateSelectedFilters(targetQueryId,filterInstance)
bricksUtils.fetchFilterResults(targetQueryId)})}}})
function bricksRangeFilter(){bricksRangeFilterFn.run()}
function bricksRangeValueUpdater(){document.addEventListener('bricks/ajax/query_result/displayed',function(event){const targetQueryId=event.detail.queryId||false
if(!targetQueryId){return}
const allFilters=bricksUtils.getFiltersForQuery(targetQueryId)
const rangeFilters=allFilters.filter((filter)=>{return filter.filterType==='range'})
if(rangeFilters.length>0){rangeFilters.forEach((filter)=>{const filterElement=filter.filterElement
const minInput=filterElement.querySelector('input.min[type="number"]')
const maxInput=filterElement.querySelector('input.max[type="number"]')
if(!minInput||!maxInput){return}
const minVal=parseFloat(minInput.value)||0
const maxVal=parseFloat(maxInput.value)||0
filter.currentValue=[minVal,maxVal]})}})}
const bricksRangeSliderUIFn=new BricksFunction({parentNode:document,selector:'.brxe-filter-range[data-brx-filter] input[type="range"]',frontEndOnly:true,eachElement:(rangeInput)=>{const filterElement=rangeInput.closest('[data-brx-filter]')||false
if(!filterElement){return}
const filterInstance=Object.values(window.bricksData.filterInstances).find((filter)=>{return filter.filterElement===filterElement})||false
if(!filterInstance){return}
const isRTL=document.dir==='rtl'||document.documentElement.dir==='rtl'
const maxInput=filterElement.querySelector('input.max[type="range"]')
const minInput=filterElement.querySelector('input.min[type="range"]')
const updateText=(rangeInputType,rangeValue)=>{const valueWrapper=filterElement.querySelector(`.value-wrap .${rangeInputType} .value`)
if(valueWrapper){rangeValue=parseFloat(rangeValue)||0
if(filterInstance?.decimalPlaces){rangeValue=rangeValue.toLocaleString('en-US',{minimumFractionDigits:filterInstance.decimalPlaces,maximumFractionDigits:filterInstance.decimalPlaces})}
if(filterInstance?.thousands&&filterInstance?.separator){rangeValue=rangeValue.toLocaleString('en-US').replaceAll(',',filterInstance?.separator)}else if(filterInstance?.thousands){rangeValue=rangeValue.toLocaleString('en-US')}
valueWrapper.innerText=rangeValue}}
const updateTrack=(rangeInputType,rangeValue)=>{const track=filterElement.querySelector('.slider-track')
if(track){if(!Array.isArray(filterInstance.currentValue)||filterInstance.currentValue.length<2){return}
let minVal=rangeInputType==='lower'?rangeValue:filterInstance.currentValue[0]
let maxVal=rangeInputType==='lower'?filterInstance.currentValue[1]:rangeValue
if(minVal>=maxVal){minVal=maxVal}
if(maxVal<=minVal){maxVal=minVal}
let filterMin=parseFloat(minInput.getAttribute('min')||0)
let filterMax=parseFloat(maxInput.getAttribute('max')||0)
if(filterMin===filterMax){filterMax=filterMin+1}
if(minVal<filterMin){minVal=filterMin}
if(maxVal>filterMax){maxVal=filterMax}
const minPercent=((minVal-filterMin)/(filterMax-filterMin))*100
const maxPercent=((maxVal-filterMin)/(filterMax-filterMin))*100
if(!isNaN(minPercent)&&!isNaN(maxPercent)){const width=maxPercent-minPercent
if(width<=2){track.style.visibility='hidden'}else{track.style.visibility='visible'}
if(isRTL){track.style.right=`${minPercent}%`}else{track.style.left=`${minPercent}%`}
track.style.width=`${width}%`}}}
rangeInput.addEventListener('input',function(e){const rangeValue=parseFloat(e.target.value)||0
const rangeInputType=rangeInput.classList.contains('min')?'lower':'upper'
updateText(rangeInputType,rangeValue)
updateTrack(rangeInputType,rangeValue)})
rangeInput.addEventListener('change',function(e){const currentInputType=rangeInput.classList.contains('min')?'lower':'upper'
let rangeValueLow=currentInputType==='lower'?rangeInput.value:filterElement.querySelector('input.min[type="range"]').value||0
let rangeValueHigh=currentInputType==='upper'?rangeInput.value:filterElement.querySelector('input.max[type="range"]').value||0
rangeValueLow=parseFloat(rangeValueLow)
rangeValueHigh=parseFloat(rangeValueHigh)
if(rangeValueLow>rangeValueHigh){if(currentInputType==='lower'){rangeValueLow=rangeValueHigh
rangeInput.value=rangeValueLow}else{rangeValueHigh=rangeValueLow
rangeInput.value=rangeValueHigh}}
if(rangeValueLow<filterInstance.min){rangeInput.value=rangeValueLow}else if(rangeValueLow>filterInstance.max){rangeInput.value=rangeValueLow}
updateText(currentInputType,rangeInput.value)
const rangeInputNumberLow=filterElement.querySelector(`input.min[type="number"]`)
if(rangeInputNumberLow){rangeInputNumberLow.value=rangeValueLow}
const rangeInputNumberHigh=filterElement.querySelector(`input.max[type="number"]`)
if(rangeInputNumberHigh){rangeInputNumberHigh.value=rangeValueHigh}
if(currentInputType==='lower'){rangeInputNumberLow.dispatchEvent(new Event('change'))}else{rangeInputNumberHigh.dispatchEvent(new Event('change'))}})}})
function bricksRangeSliderUI(){bricksRangeSliderUIFn.run()}
const bricksCheckboxFilterFn=new BricksFunction({parentNode:document,selector:'.brxe-filter-checkbox[data-brx-filter] input',frontEndOnly:true,eachElement:(checkboxInput)=>{const filterElement=checkboxInput.closest('[data-brx-filter]')||false
if(!filterElement){return}
const filterInstance=Object.values(window.bricksData.filterInstances).find((filter)=>{return filter.filterElement===filterElement})||false
if(!filterInstance){return}
const filterId=filterInstance?.filterId||false
const targetQueryId=filterInstance?.targetQueryId||false
const filterMethod=filterInstance?.filterMethod||'ajax'
const filterApplyOn=filterInstance?.filterApplyOn||'change'
const autoCheck=filterInstance?.autoCheck||false
const hierarchy=filterInstance?.hierarchy||false
if(!targetQueryId){return}
if(filterMethod==='ajax'){checkboxInput.addEventListener('change',function(e){const checkboxValue=e.target.value
const currentValue=[...filterInstance.currentValue]||[]
const index=currentValue.indexOf(checkboxValue)
let childrenCheckboxes=[]
const updateClass=(cb)=>{const liNode=cb.closest('li')||false
if(liNode){if(cb.checked){liNode.classList.add('brx-option-active')}
if(!cb.checked){liNode.classList.remove('brx-option-active')}}
const labelNode=cb.closest('label')||false
if(labelNode){if(cb.checked){labelNode.classList.add('brx-option-active')}
if(!cb.checked){labelNode.classList.remove('brx-option-active')}}
const spanNode=cb.nextElementSibling||false
if(spanNode){if(cb.checked){spanNode.classList.add('brx-option-active')}
if(!cb.checked){spanNode.classList.remove('brx-option-active')}}}
if(autoCheck&&hierarchy){let liNode=e.target.closest('li[data-depth]')||false
if(liNode){let currentDepth=parseInt(liNode.dataset.depth)||0
let nextLiNode=liNode.nextElementSibling||false
while(nextLiNode){let nextLiDepth=parseInt(nextLiNode.dataset.depth)||0
if(nextLiDepth<=currentDepth){break}
let nextCheckbox=nextLiNode.querySelector('input[type="checkbox"]')
if(nextCheckbox){childrenCheckboxes.push(nextCheckbox)}
nextLiNode=nextLiNode.nextElementSibling||false}}}
if(!e.target.checked&&index>-1){if(index>-1){currentValue.splice(index,1)
if(autoCheck&&hierarchy&&childrenCheckboxes.length){childrenCheckboxes.forEach((childCheckbox)=>{childCheckbox.checked=false
updateClass(childCheckbox)
const childCheckboxValue=childCheckbox.value
const childIndex=currentValue.indexOf(childCheckboxValue)
if(childIndex>-1){currentValue.splice(childIndex,1)}})}}}
if(e.target.checked&&index===-1){currentValue.push(checkboxValue)
if(autoCheck&&hierarchy&&childrenCheckboxes.length){childrenCheckboxes.forEach((childCheckbox)=>{childCheckbox.checked=true
updateClass(childCheckbox)
const childCheckboxValue=childCheckbox.value
const childIndex=currentValue.indexOf(childCheckboxValue)
if(childIndex===-1){currentValue.push(childCheckboxValue)}})}}
filterInstance.currentValue=[...currentValue]
filterInstance.filterElement.name=checkboxInput.name
updateClass(checkboxInput)
if(filterApplyOn!=='change'){return}
const queryInstance=window.bricksData.queryLoopInstances[targetQueryId]||false
if(!queryInstance){return}
bricksUtils.updateSelectedFilters(targetQueryId,filterInstance)
bricksUtils.fetchFilterResults(targetQueryId)})}}})
function bricksCheckboxFilter(){bricksCheckboxFilterFn.run()}
const bricksDatePickerFilterFn=new BricksFunction({parentNode:document,selector:'.brxe-filter-datepicker[data-brx-filter]',frontEndOnly:true,eachElement:(element)=>{const filterInstance=Object.values(window.bricksData.filterInstances).find((filter)=>{return filter.filterElement===element})||false
if(!filterInstance){return}
const filterId=filterInstance?.filterId||false
const targetQueryId=filterInstance?.targetQueryId||false
const filterMethod=filterInstance?.filterMethod||'ajax'
const filterSource=filterInstance?.filterSource||false
const filterApplyOn=filterInstance?.filterApplyOn||'change'
if(!targetQueryId){return}
if(filterMethod==='ajax'){let flatpickrOptions=element.dataset?.bricksDatepickerOptions||false
if(flatpickrOptions){if(filterInstance.datepicker){filterInstance.datepicker.destroy()}
flatpickrOptions=JSON.parse(flatpickrOptions)
flatpickrOptions.disableMobile=true
flatpickrOptions.onReady=(a,b,fp)=>{const ariaLabel=element.getAttribute('aria-label')||'Date'
fp.altInput.setAttribute('aria-label',ariaLabel)
if(element.id){fp.altInput.setAttribute('id',element.id)
element.removeAttribute('id')}}
flatpickrOptions.onChange=(selectedDates,dateStr,instance)=>{const flatpickrType=instance.config.mode
const timeEnabled=instance.config.enableTime
if(flatpickrType==='single'){if(!Array.isArray(selectedDates)||selectedDates.length!==1){return}}else if(flatpickrType==='range'){if(!Array.isArray(selectedDates)||selectedDates.length!==2){return}}
const dates=dateStr.split(filterInstance.datepicker?.l10n?.rangeSeparator||' - ')
let ymdDates=[]
dates.forEach((date,index)=>{let parsedDate=filterInstance.datepicker.parseDate(date,filterInstance.datepicker.config.altFormat)
let month=parsedDate.getMonth()+1
let day=parsedDate.getDate()
let year=parsedDate.getFullYear()
if(month<10){month='0'+month}
if(day<10){day='0'+day}
ymdDates[index]=`${year}-${month}-${day}`if(filterInstance.datepicker.config.enableTime){let hour=parsedDate.getHours()
let minute=parsedDate.getMinutes()
if(hour<10){hour='0'+hour}
if(minute<10){minute='0'+minute}
ymdDates[index]+=` ${hour}:${minute}`}})
let bricksDateStr=ymdDates.join(',')
if(bricksDateStr===filterInstance.currentValue){return}
filterInstance.currentValue=bricksDateStr
if(filterApplyOn!=='change'){return}
const queryInstance=window.bricksData.queryLoopInstances[targetQueryId]||false
if(!queryInstance){return}
bricksUtils.updateSelectedFilters(targetQueryId,filterInstance)
bricksUtils.fetchFilterResults(targetQueryId)}
filterInstance.datepicker=flatpickr(element,flatpickrOptions)}}}})
function bricksDatePickerFilter(){bricksDatePickerFilterFn.run()}
const bricksActiveFilterFn=new BricksFunction({parentNode:document,selector:'.brxe-filter-active-filters[data-brx-filter] [data-filter-id]',frontEndOnly:true,eachElement:(clearButton)=>{const filterElement=clearButton.closest('[data-brx-filter]')||false
if(!filterElement){return}
const filterInstance=Object.values(window.bricksData.filterInstances).find((filter)=>{return filter.filterElement===filterElement})||false
if(!filterInstance){return}
const filterId=filterInstance?.filterId||false
const targetQueryId=filterInstance?.targetQueryId||false
const filterMethod=filterInstance?.filterMethod||'ajax'
const filterSource=filterInstance?.filterSource||false
const filterApplyOn=filterInstance?.filterApplyOn||'change'
if(!targetQueryId){return}
const targetFilterId=clearButton.dataset.filterId||false
const clearValue=clearButton.dataset.filterValue||false
const urlParam=clearButton.dataset.filterUrlParam||''
if(!targetFilterId){return}
if(filterMethod==='ajax'){clearButton.addEventListener('click',function(e){const targetFilterInstance=Object.values(window.bricksData.filterInstances).find((filter)=>{return(filter.filterId===targetFilterId||(urlParam!==''&&urlParam===filter.filterNiceName&&clearValue==filter.currentValue&&targetQueryId===filter.targetQueryId))})||false
if(!targetFilterInstance){return}
bricksUtils.resetFilterValue(targetFilterInstance,clearValue)
bricksUtils.updateSelectedFilters(targetQueryId,targetFilterInstance)
bricksUtils.fetchFilterResults(targetQueryId)})}}})
function bricksActiveFilter(){bricksActiveFilterFn.run()}
const bricksResetFilterFn=new BricksFunction({parentNode:document,selector:`.brxe-filter-submit[type='reset'][data-brx-filter]`,frontEndOnly:true,eachElement:(element)=>{const filterInstance=Object.values(window.bricksData.filterInstances).find((filter)=>{return filter.filterElement===element})||false
if(!filterInstance){return}
const filterId=filterInstance?.filterId||false
const targetQueryId=filterInstance?.targetQueryId||false
const filterMethod=filterInstance?.filterMethod||'ajax'
if(!targetQueryId){return}
if(filterMethod==='ajax'){element.addEventListener('click',function(e){const filterIntances=Object.values(window.bricksData.filterInstances).filter((filter)=>{return filter.targetQueryId===targetQueryId})
const queryInstance=window.bricksData.queryLoopInstances[targetQueryId]||false
if(!filterIntances.length){return}
filterIntances.forEach((filter)=>{bricksUtils.resetFilterValue(filter)})
if(queryInstance?.isLiveSearch){bricksUtils.hideLiveSearchWrapper(targetQueryId)
return}
bricksUtils.updateSelectedFilters(targetQueryId,filterInstance)
bricksUtils.fetchFilterResults(targetQueryId)})}else{}}})
function bricksResetFilter(){bricksResetFilterFn.run()}
const bricksApplyFilterFn=new BricksFunction({parentNode:document,selector:`.brxe-filter-submit[type='submit'][data-brx-filter]`,frontEndOnly:true,eachElement:(element)=>{const filterInstance=Object.values(window.bricksData.filterInstances).find((filter)=>{return filter.filterElement===element})||false
if(!filterInstance){return}
const filterId=filterInstance?.filterId||false
const targetQueryId=filterInstance?.targetQueryId||false
const filterMethod=filterInstance?.filterMethod||'ajax'
const redirectTo=filterInstance?.redirectTo||false
const newTab=filterInstance?.newTab||false
if(!targetQueryId){return}
if(filterMethod==='ajax'){element.addEventListener('click',function(e){const queryInstance=window.bricksData.queryLoopInstances[targetQueryId]||false
if(!queryInstance){return}
bricksUtils.updateSelectedFilters(targetQueryId,filterInstance)
if(!redirectTo){bricksUtils.fetchFilterResults(targetQueryId)}else{let params=bricksUtils.buildFilterUrlParams(targetQueryId)
let url=params?`${redirectTo}?${params}`:redirectTo
if(newTab){window.open(`${url}`,'_blank')}else{window.location.href=url}}})}else{}}})
function bricksApplyFilter(){bricksApplyFilterFn.run()}
const bricksPaginationFilterFn=new BricksFunction({parentNode:document,selector:'.brxe-pagination[data-brx-filter] a',frontEndOnly:true,eachElement:(button)=>{const filterElement=button.closest('[data-brx-filter]')||false
if(!filterElement){return}
const filterInstance=Object.values(window.bricksData.filterInstances).find((filter)=>{return filter.filterElement===filterElement})||false
if(!filterInstance){return}
const filterId=filterInstance?.filterId||false
const targetQueryId=filterInstance?.targetQueryId||false
const filterMethod=filterInstance?.filterMethod||'ajax'
let allFilters=bricksUtils.getFiltersForQuery(filterInstance.targetQueryId)
allFilters=allFilters.filter((filter)=>{return filter.filterType!=='pagination'})
if(!allFilters.length){filterElement.removeAttribute('data-brx-filter')
return}
const updateAllPaginationInstancesCurrentPage=(targetQueryId,currentPage)=>{const paginationIntances=Object.values(window.bricksData.filterInstances).filter((filter)=>{return filter.targetQueryId===targetQueryId&&filter.filterType==='pagination'})
if(!paginationIntances.length){return}
paginationIntances.forEach((pagination)=>{pagination.currentValue=currentPage})}
if(filterMethod==='ajax'){button.addEventListener('click',function(e){e.preventDefault()
const link=e.currentTarget
const queryInstance=window.bricksData.queryLoopInstances[targetQueryId]||false
if(!queryInstance){return}
const href=link.href||false
if(!href){return}
let clickedPageNumber=bricksUtils.getPageNumberFromUrl(href)
if(parseInt(clickedPageNumber)<1){return}
updateAllPaginationInstancesCurrentPage(targetQueryId,clickedPageNumber)
let overwriteURL=new URL(link.href)
overwriteURL.search=''
bricksUtils.updateSelectedFilters(targetQueryId,filterInstance,overwriteURL)
bricksUtils.fetchFilterResults(targetQueryId)})}else{}}})
function bricksPaginationFilter(){bricksPaginationFilterFn.run()}
const bricksFiltersA11yHandlerFn=new BricksFunction({parentNode:document,selector:'span.brx-option-text[tabindex]',frontEndOnly:true,eachElement:(span)=>{const linkedInput=span.previousElementSibling||false
if(!linkedInput){return}
if(linkedInput.tagName!=='INPUT'){return}
span.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault()
linkedInput.click()}})}})
function bricksFiltersA11yHandler(){bricksFiltersA11yHandlerFn.run()}
const bricksActiveFiltersCountDDFn=new BricksFunction({parentNode:document,selector:'span[data-brx-af-count][data-brx-af-dd]',frontEndOnly:true,eachElement:(element)=>{const dynamicTag=element.dataset.brxAfDd||false
const targetQueryId=element.dataset.brxAfCount||false
if(!targetQueryId||!dynamicTag){return}
if(!window.bricksData.activeFiltersCountInstances){window.bricksData.activeFiltersCountInstances=[]}
let foundInstance=window.bricksData.activeFiltersCountInstances.find((instance)=>{return instance.element===element})
if(foundInstance){element.removeAttribute('data-brx-af-dd')
return}
window.bricksData.activeFiltersCountInstances.push({element:element,targetQueryId:targetQueryId,dynamicTag:dynamicTag})
element.dataset.brxAfDd=true}})
function bricksActiveFiltersCountDD(){bricksActiveFiltersCountDDFn.run()}
function bricksLiveSearchWrappersInit(){document.addEventListener('bricks/ajax/start',function(event){const queryId=event.detail.queryId||false
const isPopStateCall=event.detail?.isPopState||false
if(!queryId||isPopStateCall){return}
const queryInstance=window.bricksData.queryLoopInstances[queryId]||false
if(queryInstance?.isLiveSearch){bricksUtils.showLiveSearchWrapper(queryId)}})
document.addEventListener('click',(e)=>{const activeElement=e.target
const allTargetQueryIds=bricksUtils.currentPageTargetQueryIds()
allTargetQueryIds.forEach((targetQueryId)=>{const filterIntances=Object.values(window.bricksData.filterInstances).filter((filter)=>{return filter.targetQueryId===targetQueryId&&filter.filterElement===activeElement})
if(filterIntances.length){return}
const closestLiveSearchWrapper=activeElement.closest('[data-brx-ls-wrapper]')
if(closestLiveSearchWrapper?.dataset?.brxLsWrapper===targetQueryId){return}
if(activeElement.classList.contains('icon')){return}
bricksUtils.hideLiveSearchWrapper(targetQueryId)})})}
function bricksDisableFiltersOnLoad(){document.addEventListener('bricks/ajax/start',function(event){const queryId=event.detail.queryId||false
if(!queryId){return}
const queryInstance=window.bricksData.queryLoopInstances[queryId]||false
if(!queryInstance){return}
const filterIntances=Object.values(window.bricksData.filterInstances).filter((filter)=>{return filter.targetQueryId===queryId})
if(!filterIntances.length){return}
filterIntances.forEach((filter)=>{if(filter.filterType==='search'){return}
const filterElement=filter.filterElement??false
if(!filterElement){return}
filterElement.disabled=true
filterElement.classList.add('brx-filter-disabled')
filterElement.querySelectorAll('input').forEach((input)=>{input.disabled=true})})})
document.addEventListener('bricks/ajax/end',function(event){const queryId=event.detail.queryId||false
if(!queryId){return}
const queryInstance=window.bricksData.queryLoopInstances[queryId]||false
if(!queryInstance){return}
const filterIntances=Object.values(window.bricksData.filterInstances).filter((filter)=>{return filter.targetQueryId===queryId})
if(!filterIntances.length){return}
filterIntances.forEach((filter)=>{const filterElement=filter.filterElement??false
if(!filterElement){return}
filterElement.disabled=false
filterElement.classList.remove('brx-filter-disabled')
filterElement.querySelectorAll('input').forEach((input)=>{input.disabled=false})})})}
function bricksInitBrowserState(){if(!bricksIsFrontend){return}
let instancesValue={}
let allTargetQueryIds=bricksUtils.currentPageTargetQueryIds()
allTargetQueryIds.forEach((targetQueryId)=>{instancesValue[targetQueryId]={}
let allFilters=bricksUtils.getFiltersForQuery(targetQueryId)
allFilters.forEach((filterInstance)=>{instancesValue[targetQueryId][filterInstance.filterId]=filterInstance.currentValue})})
let selectedFilters=window.bricksData.selectedFilters
window.history.replaceState({isBricksFilter:true,targetQueryId:'',selectedFilters:selectedFilters,instancesValue:instancesValue},'',window.location.href)}
function bricksBrowserHistorySupport(){if(!bricksIsFrontend){return}
if('scrollRestoration'in history){history.scrollRestoration='manual'}
window.addEventListener('popstate',function(event){if(event.state&&event.state.isBricksFilter){const targetQueryId=event.state.targetQueryId||false
const selectedFilters=event.state.selectedFilters||[]
const instancesValue=event.state.instancesValue||[]
window.bricksData.selectedFilters=selectedFilters
if(Object.keys(instancesValue).length){Object.keys(instancesValue).forEach((queryId)=>{Object.keys(instancesValue[queryId]).forEach((filterId)=>{const filterInstance=window.bricksData.filterInstances[filterId]||false
if(!filterInstance){return}
window.bricksData.filterInstances[filterId].currentValue=instancesValue[queryId][filterId]})})}
if(!targetQueryId){let queryIds=bricksUtils.currentPageTargetQueryIds()
queryIds.forEach((queryId)=>{bricksUtils.fetchFilterResults(queryId,true)})}else{bricksUtils.fetchFilterResults(targetQueryId,true)}}})}
function bricksSearchValueUpdater(){document.addEventListener('bricks/ajax/query_result/displayed',function(event){const targetQueryId=event.detail.queryId||false
if(!targetQueryId){return}
const allFilters=bricksUtils.getFiltersForQuery(targetQueryId)
const searchFilters=allFilters.filter((filter)=>{return filter.filterType==='search'})
if(searchFilters.length>0){searchFilters.forEach((filter)=>{const filterElement=filter.filterElement
const currentValue=filter.currentValue
if(filterElement.value!==currentValue){filterElement.value=currentValue
bricksUtils.updateLiveSearchTerm(targetQueryId,currentValue)}})}})}
function bricksRestoreFocusOnFilter(){let lastFocused={elementId:false,input:false}
document.addEventListener('focusin',(event)=>{const activeElement=event.target
const filterElement=activeElement.closest('[data-brx-filter]')
if(filterElement){const filterInstance=Object.values(window.bricksData.filterInstances).find((filter)=>{return filter.filterElement===filterElement})
if(filterInstance){lastFocused.elementId=filterInstance.filterId
if(filterInstance.filterType==='range'){lastFocused.input=activeElement}else{lastFocused.input=activeElement.parentElement?.querySelector('input')||false}}}})
document.addEventListener('bricks/ajax/query_result/displayed',function(event){if(lastFocused.elementId&&lastFocused.input){const filterInstance=Object.values(window.bricksData.filterInstances).find((filter)=>{return filter.filterId===lastFocused.elementId})
if(filterInstance&&filterInstance.filterElement){const filterElement=filterInstance.filterElement
const inputs=filterElement.querySelectorAll('input')
const matchingInput=Array.from(inputs).find((input)=>{return input.name===lastFocused.input.name&&input.value===lastFocused.input.value})
if(matchingInput){let focusable=matchingInput.parentElement.querySelector('[tabindex]')||false
if(focusable){focusable.focus()}else{matchingInput.focus()}
if(filterInstance.filterType==='range'&&matchingInput.tagName==='INPUT'&&matchingInput.type==='range'){if(!Array.isArray(filterInstance.currentValue)||filterInstance.currentValue.length<2){return}
if(filterInstance.currentValue[0]!==filterInstance.currentValue[1]){return}
matchingInput.style.zIndex=3
let siblingClass=matchingInput.classList.contains('min')?'max':'min'
let siblingInput=filterElement.querySelector(`input.${siblingClass}[type='range']`)
if(siblingInput){siblingInput.style.zIndex=2}}}}}})}
function bricksFilterOptionsInteractions(){const checkFilterOptionsCount=(targetQueryId)=>{const filterInstances=Object.values(window.bricksData.filterInstances).filter((filter)=>{return((targetQueryId==='initial'||filter.targetQueryId===targetQueryId)&&(filter.filterType==='active-filters'||filter.filterType==='checkbox'||filter.filterType==='datepicker'||filter.filterType==='search'||filter.filterType==='select'||filter.filterType==='radio'||filter.filterType==='range'))})
if(!filterInstances.length){return}
const eventNames={'bricks/filter/option/notempty':[],'bricks/filter/option/empty':[]}
filterInstances.forEach((filter)=>{if(!filter.filterElement||!filter.filterId||!filter.filterType){return}
let totalOptions
switch(filter.filterType){case'active-filters':totalOptions=filter.filterElement.innerHTML
break
case'datepicker':totalOptions=filter.currentValue
break
case'range':if(filter.min!=filter.currentValue[0]||filter.max!=filter.currentValue[1]){totalOptions=1}
break
case'search':totalOptions=filter.filterElement.value
break
case'select':totalOptions=filter.filterElement.querySelectorAll(':scope > option:not(.placeholder)')?.length
break
default:totalOptions=filter.filterElement.querySelectorAll(':scope > li:not(.brx-option-all)')?.length
break}
if(totalOptions){eventNames['bricks/filter/option/notempty'].push(filter.filterId)}else{eventNames['bricks/filter/option/empty'].push(filter.filterId)}})
Object.keys(eventNames).forEach((eventName)=>{const event=new CustomEvent(eventName,{detail:{filterElementIds:eventNames[eventName]}})
document.dispatchEvent(event)})}
document.addEventListener('bricks/ajax/query_result/displayed',function(event){const targetQueryId=event.detail.queryId||false
if(!targetQueryId){return}
checkFilterOptionsCount(targetQueryId)})
checkFilterOptionsCount('initial')}
document.addEventListener('DOMContentLoaded',function(event){bricksFilters()
bricksLiveSearchWrappersInit()
bricksSearchFilter()
bricksSearchValueUpdater()
bricksSelectFilter()
bricksResetFilter()
bricksApplyFilter()
bricksPaginationFilter()
bricksRadioFilter()
bricksRangeFilter()
bricksRangeValueUpdater()
bricksRangeSliderUI()
bricksCheckboxFilter()
bricksDatePickerFilter()
bricksActiveFilter()
bricksActiveFiltersCountDD()
bricksDisableFiltersOnLoad()
bricksInitBrowserState()
bricksBrowserHistorySupport()
bricksFiltersA11yHandler()
bricksRestoreFocusOnFilter()
bricksFilterOptionsInteractions()})