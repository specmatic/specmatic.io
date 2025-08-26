function bricksAdminClassicEditor(){var bricksEditor=document.getElementById('bricks-editor')
var wpEditor=document.getElementById('postdivrich')
if(!bricksEditor||!wpEditor){return}
var bricksButton=document.createElement('button')
bricksButton.type='button'
bricksButton.id='switch-bricks'
bricksButton.classList.add('wp-switch-editor','switch-bricks')
bricksButton.innerText=window.bricksData.title
var editorTabs=wpEditor.querySelector('.wp-editor-tabs')
if(editorTabs){editorTabs.appendChild(bricksButton)}
bricksEditor.after(wpEditor)
document.addEventListener('click',function(e){if(e.target.id==='switch-bricks'){e.preventDefault()
e.stopPropagation()
wpEditor.style.display='none'
bricksEditor.style.display='block'
document.getElementById('bricks-editor-mode').value='bricks'}
else if(['content-html','content-tmce'].indexOf(e.target.id)!==-1){wpEditor.style.display='block'
bricksEditor.style.display='none'
document.getElementById('bricks-editor-mode').value='wordpress'}})
if(window.bricksData.renderWithBricks){bricksButton.click()}}
function bricksAdminImport(){var importForm=document.getElementById('bricks-admin-import-form')
if(!importForm){return}
var addNewButton=document.querySelector('#wpbody-content .page-title-action')
if(!addNewButton){return}
var templateTagsButton=document.getElementById('bricks-admin-template-tags')
if(templateTagsButton){addNewButton.after(templateTagsButton)}
var templateBundlesButton=document.getElementById('bricks-admin-template-bundles')
if(templateBundlesButton){addNewButton.after(templateBundlesButton)}
var importButton=document.getElementById('bricks-admin-import-action')
if(importButton){addNewButton.after(importButton)}
var importFormContent=document.getElementById('bricks-admin-import-form-wrapper')
addNewButton.after(importFormContent)
var toggleTemplateImporter=document.querySelectorAll('.bricks-admin-import-toggle')
toggleTemplateImporter.forEach(function(toggle){toggle.addEventListener('click',function(){importFormContent.style.display=importFormContent.style.display==='block'?'none':'block'})})
var progressDiv=document.querySelector('#bricks-admin-import-form-wrapper .import-progress')
importForm.addEventListener('submit',function(event){event.preventDefault()
var formData=new FormData(importForm)
var files=document.getElementById('bricks_import_files').files
for(var i=0;i<files.length;i++){var file=files[i]
formData.append('files['+i+']',file)}
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:formData,processData:false,contentType:false,beforeSend:()=>{importForm.setAttribute('disabled','disabled')
if(progressDiv){progressDiv.classList.add('is-active')}},success:function(res){importForm.removeAttribute('disabled')
if(progressDiv){progressDiv.classList.remove('is-active')}
location.reload()}})})}
function bricksAdminSaveLicenseKey(){var licenseKeyForm=document.getElementById('bricks-license-key-form')
if(!licenseKeyForm){return}
var action=licenseKeyForm.action.value
var nonce=licenseKeyForm.nonce.value
var submitButton=licenseKeyForm.querySelector('input[type=submit]')
licenseKeyForm.addEventListener('submit',function(e){e.preventDefault()
submitButton.disabled=true
var licenseKey=licenseKeyForm.license_key.value
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:action,licenseKey:licenseKey,nonce:nonce},success:function(response){if(action==='bricks_deactivate_license'){location.reload()}else if(action==='bricks_activate_license'){if(response.success){if(response.data.hasOwnProperty('message')){licenseKeyForm.querySelector('.success-message').innerHTML=response.data.message}
setTimeout(()=>{location.reload()},1000)}else{submitButton.disabled=false
if(response.data.hasOwnProperty('message')){licenseKeyForm.querySelector('.error-message').innerHTML=response.data.message}}}}})})}
function bricksAdminToggleLicenseKey(){var toggleLicenseKeyIcon=document.getElementById('bricks-toggle-license-key')
if(!toggleLicenseKeyIcon){return}
toggleLicenseKeyIcon.addEventListener('click',function(e){e.preventDefault()
if(e.target.classList.contains('dashicons-hidden')){e.target.classList.remove('dashicons-hidden')
e.target.classList.add('dashicons-visibility')
e.target.previousElementSibling.type='text'}else{e.target.classList.remove('dashicons-visibility')
e.target.classList.add('dashicons-hidden')
e.target.previousElementSibling.type='password'}})}
function bricksAdminSettings(){var settingsForm=document.querySelector('#bricks-settings')
if(!settingsForm){return}
var settingsTabs=document.querySelectorAll('#bricks-settings-tabs-wrapper a')
var settingsFormTables=settingsForm.querySelectorAll('table')
function showTab(tabId){var tabTable=document.getElementById(tabId)
for(var i=0;i<settingsFormTables.length;i++){var table=settingsFormTables[i]
if(table.getAttribute('id')===tabId){table.classList.add('active')}else{table.classList.remove('active')}}}
for(var i=0;i<settingsTabs.length;i++){settingsTabs[i].addEventListener('click',function(e){e.preventDefault()
var tabId=e.target.getAttribute('data-tab-id')
if(!tabId){return}
location.hash=tabId
window.scrollTo({top:0})
for(var i=0;i<settingsTabs.length;i++){settingsTabs[i].classList.remove('nav-tab-active')}
e.target.classList.add('nav-tab-active')
showTab(tabId)})}
var activeTabId=location.hash.replace('#','')
if(activeTabId){var activeTab=document.querySelector('[data-tab-id="'+activeTabId+'"]')
if(activeTab){activeTab.click()}}
var submitWrapper=settingsForm.querySelector('.submit-wrapper')
var spinner=settingsForm.querySelector('.spinner.saving')
if(!settingsForm){return}
settingsForm.addEventListener('submit',function(e){e.preventDefault()})
var saveSettingsButton=settingsForm.querySelector('input[name="save"]')
if(saveSettingsButton){saveSettingsButton.addEventListener('click',function(){if(submitWrapper){submitWrapper.remove()}
if(spinner){spinner.classList.add('is-active')}
window.jQuery.ajax({type:'POST',url:window.bricksData.ajaxUrl,data:{action:'bricks_save_settings',formData:window.jQuery(settingsForm).serialize(),nonce:window.bricksData.nonce},success:function(){let hash=window.location.hash
window.location.href=window.location.search+=`&bricks_notice=settings_saved${hash}`}})})}
var resetSettingsButton=settingsForm.querySelector('input[name="reset"]')
if(resetSettingsButton){resetSettingsButton.addEventListener('click',function(){var confirmed=confirm(window.bricksData.i18n.confirmResetSettings)
if(!confirmed){return}
if(submitWrapper){submitWrapper.remove()}
if(spinner){spinner.classList.add('is-active')}
window.jQuery.ajax({type:'POST',url:window.bricksData.ajaxUrl,data:{action:'bricks_reset_settings',nonce:window.bricksData.nonce},success:function(){window.location.href=window.location.search+='&bricks_notice=settings_resetted'}})})}
var enableCodeExecutionCheckbox=settingsForm.querySelector('input[name="executeCodeEnabled"]')
if(enableCodeExecutionCheckbox){enableCodeExecutionCheckbox.addEventListener('click',function(e){var executeCodeCapabilities=settingsForm.querySelectorAll('input[name^="executeCodeCapabilities"')
executeCodeCapabilities.forEach(function(checkboxInput){checkboxInput.disabled=!e.target.checked})})}}
function bricksAdminGenerateCssFiles(){button=document.querySelector('#bricks-css-loading-generate button')
if(!button){return}
button.addEventListener('click',function(e){e.preventDefault()
button.setAttribute('disabled','disabled')
button.classList.add('wait')
var resultsEl=document.querySelector('#bricks-css-loading-generate .results')
if(resultsEl){resultsEl.classList.remove('hide')
var results=resultsEl.querySelector('ul')
var counter=resultsEl.querySelector('.count')
var done=resultsEl.querySelector('.done')
results.innerHTML=''
counter.innerHTML=0
if(done){done.remove()}
var theEnd=resultsEl.querySelector('.end')
if(theEnd){theEnd.remove()}}
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_get_css_files_list',nonce:bricksData.nonce},success:function(res){bricksAdminGenerateCssFile(0,results,counter,res.data)}})})}
function bricksAdminCodeReview(){let viewMode='individual'
const reviewCount=document.querySelector('.bricks-code-review-description')
const showAllButton=document.querySelector('.bricks-code-review-action.show-all')
const individualButton=document.querySelector('.bricks-code-review-action.individual')
const codeReviewItems=document.querySelectorAll('.bricks-code-review-item')
const prevButton=document.querySelector('.bricks-code-review-action.prev')
const nextButton=document.querySelector('.bricks-code-review-action.next')
const checkedButtons=document.querySelectorAll('.bricks-code-review-item-check')
if(!showAllButton||!codeReviewItems||!individualButton){return}
const recalculateTotalReviewed=(count='up')=>{let totalReviewed=document.querySelector('.bricks-code-review-total-reviewed')
let totalMarked=totalReviewed.innerText
totalMarked=totalMarked?parseInt(totalMarked):1
if(count==='up'){totalMarked++}
else{totalMarked--}
if(totalReviewed){totalReviewed.innerText=totalMarked}}
showAllButton.addEventListener('click',function(e){e.preventDefault()
viewMode='all'
reviewCount.classList.add('action-hide')
showAllButton.classList.add('action-hide')
individualButton.classList.remove('action-hide')
prevButton.classList.add('action-hide')
nextButton.classList.add('action-hide')
codeReviewItems.forEach(function(item){item.classList.remove('item-hide')})})
individualButton.addEventListener('click',function(e){e.preventDefault()
viewMode='individual'
reviewCount.classList.remove('action-hide')
individualButton.classList.add('action-hide')
showAllButton.classList.remove('action-hide')
prevButton.classList.remove('action-hide')
nextButton.classList.remove('action-hide')
codeReviewItems.forEach(function(item){item.classList.add('item-hide')})
let currentItem=document.querySelector('.bricks-code-review-item.item-current')
if(currentItem){currentItem.classList.remove('item-hide')}})
prevButton.addEventListener('click',function(e){e.preventDefault()
let currentItem=document.querySelector('.bricks-code-review-item.item-current')
let previousItem=currentItem.previousElementSibling
if(previousItem){currentItem.classList.remove('item-current')
currentItem.classList.add('item-hide')
previousItem.classList.add('item-current')
previousItem.classList.remove('item-hide')
recalculateTotalReviewed('down')}})
nextButton.addEventListener('click',function(e){e.preventDefault()
let currentItem=document.querySelector('.bricks-code-review-item.item-current')
let nextItem=currentItem.nextElementSibling
if(nextItem){currentItem.classList.remove('item-current')
currentItem.classList.add('item-hide')
nextItem.classList.add('item-current')
nextItem.classList.remove('item-hide')
recalculateTotalReviewed('up')}})
if(checkedButtons.length){checkedButtons.forEach(function(button){button.addEventListener('click',function(e){e.preventDefault()
let item=button.closest('.bricks-code-review-item')
if(item){item.classList.add('item-marked')
recalculateTotalReviewed()
if(viewMode==='individual'){setTimeout(()=>{nextButton.click()},400)}}})})}}
function bricksAdminBreakpointsRegenerateCssFiles(){let button=document.getElementById('breakpoints-regenerate-css-files')
if(!button){return}
let checkIcon=button.querySelector('i')
button.addEventListener('click',function(e){e.preventDefault()
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_regenerate_bricks_css_files',nonce:bricksData.nonce},beforeSend:()=>{button.setAttribute('disabled','disabled')
button.classList.add('wait')
checkIcon.classList.add('hide')},success:function(res){button.removeAttribute('disabled')
button.classList.remove('wait')
checkIcon.classList.remove('hide')}})})}
function bricksAdminGenerateCssFile(index,results,counter,data){return jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_regenerate_css_file',data:data[index],index:index},success:function(res){var fileName=res.data.hasOwnProperty('file_name')?res.data.file_name:false
if(fileName){var html=''
var count=counter?parseInt(counter.innerText):0
if(Array.isArray(fileName)){fileName.forEach(function(fileName){html+='<li>'+fileName+'</li>'
count++})}else{html+='<li>'+fileName+'</li>'
count++}
if(!res.success){html=html.replace('<li>','<li class="error">')}
if(results){results.insertAdjacentHTML('afterbegin',html)}
if(counter){counter.innerText=count}}}}).then(function(res){if(index===data.length){var button=document.querySelector('#bricks-css-loading-generate button')
button.removeAttribute('disabled')
button.classList.remove('wait')
var infoText=document.querySelector('#bricks-css-loading-generate .info')
if(infoText){infoText.remove()}
if(results){results.insertAdjacentHTML('beforebegin','<div class="done">... THE END :)</div>')}}
else{bricksAdminGenerateCssFile(index+1,results,counter,data)}})}
function bricksAdminRunConverter(){var converterButtons=document.querySelectorAll('.bricks-run-converter')
if(!converterButtons.length){return}
converterButtons.forEach(function(button){button.addEventListener('click',function(e){e.preventDefault()
let data={action:'bricks_get_converter_items',nonce:bricksData.nonce,convert:[]}
if(button.id==='bricks-run-converter-global-elements'){data.convert.push('globalElementsToComponents')}
if(document.getElementById('convert_element_ids_classes').checked){data.convert.push('elementClasses')}
if(document.getElementById('convert_container').checked){data.convert.push('container')}
if(document.getElementById('add_position_relative').checked){data.convert.push('addPositionRelative')}
if(document.getElementById('entry_animation_to_interaction').checked){data.convert.push('entryAnimationToInteraction')}
if(!data.convert.length){return}
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data,beforeSend:()=>{button.setAttribute('disabled','disabled')
button.classList.add('wait')},success:(res)=>{console.info('bricks_get_converter_items',res.data)
let index=0
let data=res.data.items
let convert=res.data.convert
bricksAdminConvert(index,data,convert)}})})})}
function bricksAdminConvert(index,data,convert){return jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_run_converter',nonce:bricksData.nonce,data:data[index],convert:convert},success:function(res){var button=document.querySelector('.bricks-run-converter[disabled]')
var resultsEl=button.parentNode.querySelector('.results')
if(!resultsEl){resultsEl=document.createElement('div')
resultsEl.classList.add('results')
var resultsList=document.createElement('ul')
resultsEl.appendChild(resultsList)
button.parentNode.appendChild(resultsEl)}
else if(resultsEl&&index===0){resultsEl.querySelector('ul').innerHTML=''}
var label=res.data.hasOwnProperty('label')?res.data.label:false
if(label){var resultItem=document.createElement('li')
resultItem.innerHTML=label
resultsEl.querySelector('ul').prepend(resultItem)}
console.warn('run_converter',index,label,res.data)
if(index===data.length){button.removeAttribute('disabled')
button.classList.remove('wait')
var resultItem=document.createElement('li')
resultItem.classList.add('done')
resultItem.innerText='... THE END :)'
resultsEl.querySelector('ul').prepend(resultItem)}
else{bricksAdminConvert(index+1,data,convert)}}})}
function bricksTemplateShortcodeCopyToClipboard(){var copyToClipboardElements=document.querySelectorAll('.bricks-copy-to-clipboard')
if(!copyToClipboardElements){return}
copyToClipboardElements.forEach(function(element){element.addEventListener('click',function(e){if(navigator.clipboard){if(!window.isSecureContext){alert('Clipboard API rejected: Not in secure context (HTTPS)')
return}
if(element.classList.contains('copied')){e.preventDefault()
return}
var content=element.value
var message=element.getAttribute('data-success')
navigator.clipboard.writeText(content)
element.value=message
element.classList.add('copied')
setTimeout(function(){element.value=content
element.classList.remove('copied')},2000)}})})}
function bricksDismissHttpsNotice(){setTimeout(()=>{let dismissButton=document.querySelector('.brxe-https-notice .notice-dismiss')
if(dismissButton){dismissButton.addEventListener('click',function(){jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_dismiss_https_notice',nonce:bricksData.nonce}})})}},400)}
function bricksDropFormSubmissionsTable(){let button=document.getElementById('bricks-drop-form-db')
if(!button){return}
button.addEventListener('click',function(e){e.preventDefault()
var confirmed=confirm(bricksData.i18n.confirmDropFormSubmissionsTable)
if(!confirmed){return}
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_form_submissions_drop_table',nonce:bricksData.nonce},beforeSend:()=>{button.setAttribute('disabled','disabled')
button.classList.add('wait')},success:function(res){button.removeAttribute('disabled')
button.classList.remove('wait')
alert(res.data.message)
location.reload()}})})}
function bricksResetFormSubmissionsTable(){let button=document.getElementById('bricks-reset-form-db')
if(!button){return}
button.addEventListener('click',function(e){e.preventDefault()
var confirmed=confirm(bricksData.i18n.confirmResetFormSubmissionsTable)
if(!confirmed){return}
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_form_submissions_reset_table',nonce:bricksData.nonce},beforeSend:()=>{button.setAttribute('disabled','disabled')
button.classList.add('wait')},success:function(res){button.removeAttribute('disabled')
button.classList.remove('wait')
alert(res.data.message)
location.reload()}})})}
function bricksDeleteFormSubmissionsByFormId(){if(!document.body.classList.contains('bricks_page_bricks-form-submissions')){return}
let deleteButtons=document.querySelectorAll('.column-actions [data-form-id]')
for(var i=0;i<deleteButtons.length;i++){let button=deleteButtons[i]
button.addEventListener('click',function(e){e.preventDefault()
let formId=button.getAttribute('data-form-id')
var confirmed=confirm(bricksData.i18n.confirmResetFormSubmissionsFormId.replace('[form_id]',`"${formId}"`))
if(!confirmed){return}
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_form_submissions_delete_form_id',nonce:bricksData.nonce,formId:formId},beforeSend:()=>{button.setAttribute('disabled','disabled')
button.classList.add('wait')},success:function(res){button.removeAttribute('disabled')
button.classList.remove('wait')
alert(res.data.message)
location.reload()}})})}}
function bricksDismissInstagramAccessTokenNotice(){setTimeout(()=>{let dismissButton=document.querySelector('.brxe-instagram-token-notice .notice-dismiss')
if(dismissButton){dismissButton.addEventListener('click',function(){jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_dismiss_instagram_access_token_notice',nonce:bricksData.nonce}})})}},400)}
function bricksRemoteTemplateUrls(){let addMoreButton=document.getElementById('add-remote-template-button')
if(!addMoreButton){return}
addMoreButton.addEventListener('click',function(e){e.preventDefault()
let remoteTemplateWrappers=document.querySelectorAll('.remote-template-wrapper')
let remoteTemplateWrapper=remoteTemplateWrappers[remoteTemplateWrappers.length-1]
if(!remoteTemplateWrapper){return}
let clone=remoteTemplateWrapper.cloneNode(true)
let labels=clone.querySelectorAll('label')
labels.forEach((label)=>{label.setAttribute('for',label.getAttribute('for').replace(/\[(\d+)\]/,function(match,index){return'['+(parseInt(index)+1)+']'}))})
let inputs=clone.querySelectorAll('input')
inputs.forEach((input)=>{input.value=''
input.name=input.name.replace(/\[(\d+)\]/,function(match,index){return'['+(parseInt(index)+1)+']'})
input.id=input.id.replace(/\[(\d+)\]/,function(match,index){return'['+(parseInt(index)+1)+']'})})
remoteTemplateWrapper.after(clone)})}
function bricksDeleteTemplateScreenshots(){let button=document.getElementById('delete-template-screenshots-button')
if(!button){return}
button.addEventListener('click',function(e){e.preventDefault()
var confirmed=confirm(bricksData.i18n.confirmDeleteTemplateScreenshots)
if(!confirmed){return}
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_delete_template_screenshots',nonce:bricksData.nonce},beforeSend:()=>{button.setAttribute('disabled','disabled')
button.classList.add('wait')},success:function(res){button.removeAttribute('disabled')
button.classList.remove('wait')
alert(res.data.message)
if(res.success){location.reload()}}})})}
function bricksReindexFilters(){let button=document.getElementById('bricks-reindex-filters')
let progressText=document.querySelector('.indexer-progress')
let indexButton=document.getElementById('bricks-run-index-job')
if(!button||!progressText||!indexButton){return}
button.addEventListener('click',function(e){e.preventDefault()
var confirmed=confirm(bricksData.i18n.confirmReindexFilters)
if(!confirmed){return}
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_reindex_query_filters',nonce:bricksData.nonce},beforeSend:()=>{button.setAttribute('disabled','disabled')
button.classList.add('wait')},success:function(res){button.removeAttribute('disabled')
button.classList.remove('wait')
if(res.success){progressText.innerText=res.data.message
setTimeout(()=>{indexButton.setAttribute('data-no-confirm','true')
indexButton.click()},500)}else{console.error('bricks_reindex_query_filters:error',res.data)}}})})}
function bricksRunIndexJob(){let button=document.getElementById('bricks-run-index-job')
let progressText=document.querySelector('.indexer-progress')
let checkIcon=button?button.querySelector('i'):false
let removeJobsDiv=document.getElementById('bricks-remove-jobs-wrapper')
let removeJobsButton=document.getElementById('bricks-remove-index-jobs')
let queryFiltersTd=document.getElementById('bricks-query-filter-td')
let halted=false
if(!button||!progressText||!checkIcon||!removeJobsButton||!removeJobsDiv){return}
const IndexerObserver=()=>{jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_run_index_job',nonce:bricksData.nonce},success:function(res){let progress=res?.data?.progress||false
let pending=res?.data?.pending||false
if(progressText&&progress){progressText.innerHTML=progress}
if(pending==0||halted){button.removeAttribute('disabled')
button.classList.remove('wait')
checkIcon.classList.remove('hide')
if(halted&&pending>0){removeJobsDiv.classList.remove('hide')}}else{setTimeout(()=>{IndexerObserver()},3000)}},beforeSend:()=>{button.setAttribute('disabled','disabled')
button.classList.add('wait')
removeJobsDiv.classList.add('hide')}})}
let isRunning=button.classList.contains('wait')
if(isRunning){IndexerObserver()}
button.addEventListener('click',function(e){e.preventDefault()
let noConfirm=button.getAttribute('data-no-confirm')
if(!noConfirm){var confirmed=confirm(bricksData.i18n.confirmTriggerIndexJob)
if(!confirmed){return}}
IndexerObserver()
button.removeAttribute('data-no-confirm')
checkIcon.classList.add('hide')
removeJobsDiv.classList.add('hide')})
removeJobsButton.addEventListener('click',function(e){e.preventDefault()
var confirmed=confirm(bricksData.i18n.confirmRemoveAllIndexJobs)
if(!confirmed){return}
halted=true
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_remove_all_index_jobs',nonce:bricksData.nonce},success:function(res){if(res.success){setTimeout(()=>{alert(res.data.message)
location.reload()},10000)}},beforeSend:()=>{removeJobsButton.setAttribute('disabled','disabled')
removeJobsButton.classList.add('wait')
queryFiltersTd.classList.add('blocking')
let infoDiv=document.createElement('div')
infoDiv.classList.add('blocking-info-wrapper')
infoDiv.innerHTML=`<p class="message info">${bricksData.i18n.removingIndexJobsInfo}</p>`queryFiltersTd.appendChild(infoDiv)}})})}
function bricksFixElementDB(){let button=document.getElementById('bricks-fix-filter-element-db')
if(!button){return}
button.addEventListener('click',function(e){e.preventDefault()
var confirmed=confirm(bricksData.i18n.confirmFixElementDB)
if(!confirmed){return}
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_fix_filter_element_db',nonce:bricksData.nonce},beforeSend:()=>{button.setAttribute('disabled','disabled')
button.classList.add('wait')},success:function(res){button.removeAttribute('disabled')
button.classList.remove('wait')
alert(res.data.message)
location.reload()}})})}
function bricksRegenerateCodeSignatures(){let button=document.getElementById('bricks-regenerate-code-signatures')
if(!button){return}
button.addEventListener('click',function(e){e.preventDefault()
var confirmed=confirm(bricksData.i18n.confirmRegenerateCodeSignatures)
if(!confirmed){return}
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_regenerate_code_signatures',nonce:bricksData.nonce},beforeSend:()=>{button.setAttribute('disabled','disabled')
button.classList.add('wait')},success:function(res){button.removeAttribute('disabled')
button.classList.remove('wait')
alert(res.data.message)
if(res.success){location.reload()}else{console.error('bricks_regenerate_code_element_signatures:error',res.data)}}})})}
function bricksAdminCodeReviewFilter(){let filterSelect=document.getElementById('code-review-filter')
if(!filterSelect){return}
filterSelect.addEventListener('change',(e)=>{let url=new URL(window.location.href)
url.searchParams.set('code-review',e.target.value)
window.location.href=url.toString()})}
function bricksAdminGlobalElementsReview(){const convertButtons=document.querySelectorAll('.bricks-convert-global-elements')
convertButtons.forEach((button)=>{button.addEventListener('click',(e)=>{e.preventDefault()
let unlinkNestables=false
let reviewItemNode=e.target.closest('.bricks-code-review-item')
if(reviewItemNode&&reviewItemNode.querySelector('.nestable')){unlinkNestables=confirm(window.bricksData.i18n.globalElementsConvertConfirm)}
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_convert_global_elements',nonce:bricksData.nonce,postId:button.getAttribute('data-post-id'),unlinkNestables:unlinkNestables},beforeSend:()=>{button.setAttribute('disabled','disabled')
button.classList.add('wait')},success:(res)=>{button.removeAttribute('disabled')
button.classList.remove('wait')
if(res.data.message){alert(res.data.message)}
location.reload()}})})})}
function bricksAdminMaintenanceTemplateListener(){let maintenanceTemplateSelect=document.getElementById('maintenance-template')
let maintenanceTemplateSelectSection=document.getElementById('maintenance-template-section')
let renderSection=document.getElementById('maintenance-render-section')
if(!renderSection){return}
function toggleRenderOptions(){let selectedValue=maintenanceTemplateSelect.value
if(selectedValue===''){renderSection.style.display='none'
maintenanceTemplateSelectSection.style.borderBottom='none'}else{renderSection.style.display='block'
maintenanceTemplateSelectSection.style.borderBottom='1px solid var(--admin-color-border)'}}
toggleRenderOptions()
maintenanceTemplateSelect.addEventListener('change',toggleRenderOptions)}
function bricksTemplateThumbnailAddScrollAnimation(){const thumbnails=document.querySelectorAll('.template_thumbnail a')
thumbnails.forEach((thumbnail)=>{const img=thumbnail.querySelector('img')
function checkImageHeight(){const imgHeight=img.getBoundingClientRect().height
const thumbnailHeight=thumbnail.getBoundingClientRect().height
if(imgHeight>thumbnailHeight){const scrollAmount=thumbnailHeight-imgHeight
const duration=calculateScrollDuration(scrollAmount)
thumbnail.classList.add('scroll')
thumbnail.addEventListener('mouseenter',()=>{startScrollAnimation(img,0,scrollAmount,duration)})
thumbnail.addEventListener('mouseleave',()=>{const currentTop=parseFloat(img.style.top)||scrollAmount
startScrollAnimation(img,currentTop,0,duration)})}}
function calculateScrollDuration(scrollAmount){const baseDuration=2000
const maxScrollAmount=200
return(Math.abs(scrollAmount)*baseDuration)/ maxScrollAmount}
function startScrollAnimation(img,startTop,endTop,duration){let animationFrame
let start
function scroll(timestamp){if(!start)start=timestamp
const elapsed=timestamp-start
const progress=Math.min(elapsed / duration,1)
img.style.top=startTop+(endTop-startTop)*progress+'px'
if(progress<1){animationFrame=requestAnimationFrame(scroll)}}
cancelAnimationFrame(animationFrame)
animationFrame=requestAnimationFrame(scroll)}
img.addEventListener('load',checkImageHeight)
if(img.complete){checkImageHeight()}})}
function bricksAdminAuthUrlBehaviorListener(){let behaviorSelect=document.getElementById('wp_auth_url_behavior')
let redirectPageWrapper=document.getElementById('wp_auth_url_redirect_page_wrapper')
if(!behaviorSelect||!redirectPageWrapper){return}
function toggleRedirectPageOption(){if(behaviorSelect.value==='custom'){redirectPageWrapper.style.display='block'}else{redirectPageWrapper.style.display='none'}}
toggleRedirectPageOption()
behaviorSelect.addEventListener('change',toggleRedirectPageOption)}
function bricksAdminWooSettings(){let ajaxErrorSelect=document.getElementById('woocommerceAjaxErrorAction')
let ajaxErrorActionDiv=document.getElementById('wooAjaxErrorScrollToNotice')
if(ajaxErrorSelect&&ajaxErrorActionDiv){ajaxErrorSelect.addEventListener('change',function(e){if(e.target.value==='notice'){ajaxErrorActionDiv.classList.remove('hide')}else{ajaxErrorActionDiv.classList.add('hide')}})}}
function bricksCreateMultiselect(selectId,options={}){const select=document.getElementById(selectId)
const wrapper=select?.parentElement
if(!select||!wrapper){return}
const defaults={placeholder:window.bricksData?.i18n?.selectItems,searchPlaceholder:window.bricksData?.i18n?.searchItems,dataAttribute:'data-item-id',ajaxSearch:false,ajaxOptions:{action:'bricks_get_posts',params:{},minSearchLength:2,debounceTime:300}}
const config={...defaults,...options}
if(options.ajaxOptions){config.ajaxOptions={...defaults.ajaxOptions,...options.ajaxOptions}}
const control=document.createElement('div')
control.setAttribute('data-control','select')
control.className='multiple bricks-multiselect'
control.setAttribute('tabindex','0')
const input=document.createElement('div')
input.className='input'
const optionsWrapper=document.createElement('div')
optionsWrapper.className='options-wrapper'
const searchWrapper=document.createElement('div')
searchWrapper.className='searchable-wrapper'
searchWrapper.innerHTML=`
  <input class="searchable" type="text" spellcheck="false" placeholder="${config.searchPlaceholder}">
  <span class="search-status"></span>
 `const dropdown=document.createElement('ul')
dropdown.className='dropdown'
if(!config.ajaxSearch){populateDropdownFromSelect()}else{populateDropdownFromSelectedOptions()
if(Array.from(select.selectedOptions).length===0){const initialMessage=document.createElement('li')
initialMessage.className='message'
initialMessage.innerHTML=`<span>${window.bricksData?.i18n?.typeToSearch}</span>`dropdown.appendChild(initialMessage)}}
optionsWrapper.appendChild(searchWrapper)
optionsWrapper.appendChild(dropdown)
control.appendChild(input)
control.appendChild(optionsWrapper)
select.style.display='none'
select.after(control)
function populateDropdownFromSelect(){dropdown.innerHTML=''
Array.from(select.options).forEach((option,index)=>{const li=document.createElement('li')
li.setAttribute('data-index',index)
li.setAttribute('data-value',option.value)
li.className=option.selected?'selected':''
li.innerHTML=`<span>${option.text}</span>`dropdown.appendChild(li)})}
function populateDropdownFromSelectedOptions(){dropdown.innerHTML=''
Array.from(select.selectedOptions).forEach((option,index)=>{const li=document.createElement('li')
li.setAttribute('data-index',index)
li.setAttribute('data-value',option.value)
li.className='selected'
li.innerHTML=`<span>${option.text}</span>`dropdown.appendChild(li)})}
const updateSelection=()=>{input.innerHTML=''
input.className='input'
const selected=Array.from(select.selectedOptions)
if(selected.length){input.classList.add('has-value')
selected.forEach((option)=>{const value=document.createElement('span')
value.className='value'
value.setAttribute(config.dataAttribute,option.value)
value.innerHTML=`
     ${option.text}
     <span class="dashicons dashicons-no-alt" data-name="close-box"></span>
    `input.appendChild(value)})}else{input.innerHTML=`
    <span class="placeholder">${config.placeholder}</span>
    <span class="dashicons dashicons-arrow-down"></span>
   `}}
updateSelection()
control.addEventListener('click',(e)=>{const isSearchInput=e.target.classList.contains('searchable')
if(!isSearchInput){control.classList.toggle('open')
if(control.classList.contains('open')){const searchInput=control.querySelector('.searchable')
if(searchInput){setTimeout(()=>{searchInput.focus()},10)}}}})
dropdown.addEventListener('click',(e)=>{const li=e.target.closest('li')
if(li&&!li.classList.contains('message')&&!li.classList.contains('loading')){const value=li.getAttribute('data-value')
const option=select.querySelector(`option[value="${value}"]`)
if(option){option.selected=!option.selected
li.classList.toggle('selected')
updateSelection()}}})
input.addEventListener('click',(e)=>{const closeBox=e.target.closest('[data-name="close-box"]')
if(closeBox){e.stopPropagation()
const tag=closeBox.closest('.value')
const itemId=tag.getAttribute(config.dataAttribute)
const option=select.querySelector(`option[value="${itemId}"]`)
if(option){option.selected=false
const li=dropdown.querySelector(`li[data-value="${itemId}"]`)
if(li){li.classList.remove('selected')}
updateSelection()}}})
function debounce(func,wait){let timeout
return function(...args){const context=this
clearTimeout(timeout)
timeout=setTimeout(()=>func.apply(context,args),wait)}}
function performAjaxSearch(searchTerm){const searchStatus=searchWrapper.querySelector('.search-status')
searchStatus.textContent=window.bricksData?.i18n?.searching
searchStatus.classList.add('active')
const loadingItem=document.createElement('li')
loadingItem.className='loading'
loadingItem.innerHTML=`<span>${window.bricksData?.i18n?.searching}</span>`const selectedItems=Array.from(dropdown.querySelectorAll('li.selected'))
dropdown.innerHTML=''
selectedItems.forEach((item)=>dropdown.appendChild(item))
dropdown.appendChild(loadingItem)
const data={action:config.ajaxOptions.action,search:searchTerm,...config.ajaxOptions.params}
if(window.bricksData?.nonce){data.nonce=window.bricksData.nonce}
jQuery.ajax({type:'GET',url:window.bricksData?.ajaxUrl,data:data,success:function(response){const loadingItems=dropdown.querySelectorAll('li.loading')
loadingItems.forEach((item)=>item.remove())
searchStatus.textContent=''
searchStatus.classList.remove('active')
if(response.success&&response.data){const selectedValues=Array.from(select.selectedOptions).map((opt)=>opt.value)
Object.entries(response.data).forEach(([id,title])=>{if(!select.querySelector(`option[value="${id}"]`)){const newOption=document.createElement('option')
newOption.value=id
newOption.text=title
newOption.selected=selectedValues.includes(id)
select.appendChild(newOption)}})
const selectedItems=Array.from(dropdown.querySelectorAll('li.selected'))
dropdown.innerHTML=''
selectedItems.forEach((item)=>dropdown.appendChild(item))
Object.entries(response.data).forEach(([id,title])=>{if(dropdown.querySelector(`li[data-value="${id}"]`)){return}
const li=document.createElement('li')
li.setAttribute('data-value',id)
li.className=selectedValues.includes(id)?'selected':''
li.innerHTML=`<span>${title}</span>`dropdown.appendChild(li)})
if(dropdown.children.length===0){const noResults=document.createElement('li')
noResults.className='message'
noResults.innerHTML=`<span>${window.bricksData?.i18n?.noResults}</span>`dropdown.appendChild(noResults)}}else{const errorItem=document.createElement('li')
errorItem.className='message error'
errorItem.innerHTML=`<span>${window.bricksData?.i18n?.searchError}</span>`dropdown.appendChild(errorItem)}},error:function(){const loadingItems=dropdown.querySelectorAll('li.loading')
loadingItems.forEach((item)=>item.remove())
searchStatus.textContent=''
searchStatus.classList.remove('active')
const errorItem=document.createElement('li')
errorItem.className='message error'
errorItem.innerHTML=`<span>${window.bricksData?.i18n?.searchError}</span>`dropdown.appendChild(errorItem)}})}
const debouncedSearch=debounce(function(searchTerm){performAjaxSearch(searchTerm)},config.ajaxOptions.debounceTime)
const searchInput=searchWrapper.querySelector('.searchable')
searchInput.addEventListener('input',(e)=>{const search=e.target.value.toLowerCase()
if(config.ajaxSearch){const messageItems=dropdown.querySelectorAll('li.message')
messageItems.forEach((item)=>item.remove())
if(search===''){populateDropdownFromSelectedOptions()
if(dropdown.children.length===0){const initialMessage=document.createElement('li')
initialMessage.className='message'
initialMessage.innerHTML=`<span>${window.bricksData?.i18n?.typeToSearch}</span>`dropdown.appendChild(initialMessage)}
return}
if(search.length>=config.ajaxOptions.minSearchLength){debouncedSearch(search)}else if(search.length>0){const minLengthMessage=document.createElement('li')
minLengthMessage.className='message'
minLengthMessage.innerHTML=`<span>${window.bricksData?.i18n?.minSearchLength}</span>`const selectedItems=Array.from(dropdown.querySelectorAll('li.selected'))
dropdown.innerHTML=''
selectedItems.forEach((item)=>dropdown.appendChild(item))
dropdown.appendChild(minLengthMessage)}}else{Array.from(dropdown.children).forEach((li)=>{const text=li.textContent.toLowerCase()
li.style.display=text.includes(search)?'':'none'})}})
document.addEventListener('click',(e)=>{if(!control.contains(e.target)){control.classList.remove('open')}})}
function bricksElementManger(){let elementManagerForm=document.getElementById('bricks-element-manager')
if(!elementManagerForm){return}
elementFilters=document.querySelectorAll('button[data-filter-by]')
elementFilters.forEach((filter)=>{filter.addEventListener('click',function(e){e.preventDefault()
let filterActive=e.target.classList.contains('active')
let filterBy=filter.dataset.filterBy
let iconNode=e.target.querySelector('i')
if(iconNode){if(filterActive){iconNode.classList.remove('dashicons-remove')
iconNode.classList.add('dashicons-insert')}else{iconNode.classList.remove('dashicons-insert')
iconNode.classList.add('dashicons-remove')}}
if(filterActive){filter.classList.remove('button-primary')
filter.classList.add('button-scondary')}else{filter.classList.remove('button-secondary')
filter.classList.add('button-primary')}
if(filterActive){if(filterBy==='unused'){delete elementManagerForm.dataset.filterUnused}
if(filterBy==='native'){delete elementManagerForm.dataset.filterNative}
if(filterBy==='custom'){delete elementManagerForm.dataset.filterCustom}}else{if(filterBy==='unused'){elementManagerForm.dataset.filterUnused='on'}
if(filterBy==='native'){elementManagerForm.dataset.filterNative='on'}
if(filterBy==='custom'){elementManagerForm.dataset.filterCustom='on'}}
filter.classList.toggle('active')})})
elementManagerForm.addEventListener('click',function(e){let elementStatus=e.target.dataset.status
if(elementStatus){let submitWrapper=elementManagerForm.querySelector('.submit-wrapper')
if(submitWrapper){submitWrapper.classList.add('sticky')}
Array.from(e.target.parentNode.children).forEach((child)=>{child.classList.remove('current')})
e.target.classList.add('current')
let tableRow=e.target.closest('tr')
if(tableRow){tableRow.dataset.status=e.target.dataset.status}}
let elementPermission=e.target.closest('.element-permission input')
if(elementPermission){if(elementPermission.value==='all'){let row=elementPermission.closest('tr')
let inputs=row.querySelectorAll('.element-permission input')
inputs.forEach((input)=>{if(input.value!=='all'){input.checked=elementPermission.checked}})}
else{if(!elementPermission.checked){let row=elementPermission.closest('tr')
let allInput=row.querySelector('.element-permission input[value="all"]')
if(allInput){allInput.checked=false}}
else{let row=elementPermission.closest('tr')
let inputs=row.querySelectorAll('.element-permission input')
let allChecked=true
inputs.forEach((input)=>{if(input.value!=='all'&&!input.checked){allChecked=false}})
if(allChecked){let allInput=row.querySelector('.element-permission input[value="all"]')
if(allInput){allInput.checked=true}}}}}})
elementManagerForm.addEventListener('submit',function(e){e.preventDefault()
let elements={}
let tableRows=elementManagerForm.querySelectorAll('tbody tr')
tableRows.forEach((row)=>{let elementName=row.dataset.name
let elementStatus=row.dataset.status
elements[elementName]={status:elementStatus,permission:[]}
let permissions=row.querySelectorAll('.element-permission input:checked')
permissions.forEach((permission)=>{elements[elementName].permission.push(permission.value)})})
let resetElementManager=document.activeElement.getAttribute('name')==='reset'
if(resetElementManager){let letsReset=confirm('Are you sure you want to reset the element manager?')
if(!letsReset){return}}
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_save_element_manager',elements:elements,nonce:bricksData.nonce,reset:resetElementManager},beforeSend:()=>{elementManagerForm.classList.add('wait')},success:function(){elementManagerForm.classList.remove('wait')
if(resetElementManager){alert('Element manager has been reset.')
location.reload()}else{alert('Element manager has been saved.')
let submitWrapper=elementManagerForm.querySelector('.submit-wrapper')
if(submitWrapper){submitWrapper.classList.remove('sticky')}}}})})}
function bricksAdminElementManagerUsage(){if(!document.getElementById('bricks-element-manager')){return}
const BATCH_SIZE=25
let elementsToProcess=[]
let processingElements=false
document.querySelectorAll('.element-usage').forEach((cell)=>{const elementName=cell.dataset.elementName
if(elementName){elementsToProcess.push(elementName)}})
function processNextBatch(){if(processingElements||elementsToProcess.length===0){return}
processingElements=true
const batch=elementsToProcess.splice(0,BATCH_SIZE)
getElementUsageCount(batch)
setTimeout(()=>{processingElements=false
processNextBatch()},200)}
function getElementUsageCount(elementNames){const formData=new FormData()
formData.append('action','bricks_get_element_usage_count')
formData.append('nonce',bricksData.nonce)
formData.append('elementNames',elementNames)
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_get_element_usage_count',nonce:bricksData.nonce,elementNames:elementNames},success:function(response){const countByElementName=response.data?.results||{}
elementNames.forEach((elementName)=>{const cell=document.querySelector(`.element-usage[data-element-name="${elementName}"]`)
if(cell){cell.innerHTML=countByElementName[elementName]?.count||'-'
cell.closest('tr').setAttribute('data-count',countByElementName[elementName]?.count||0)}})}})}
processNextBatch()}
function bricksAdminCustomCapabilities(){const wrapper=document.querySelector('.bricks-custom-capabilities-wrapper')
if(!wrapper){return}
const addCapabilityButton=wrapper.querySelector('.new-capability')
const capabilitiesList=wrapper.querySelector('.bricks-custom-capabilities-list')
const customCapabilitiesInput=wrapper.querySelector('input[name="customCapabilities"]')
let capabilities=[]
if(customCapabilitiesInput&&customCapabilitiesInput.value){try{capabilities=JSON.parse(customCapabilitiesInput.value)}catch(e){console.error('Error parsing capabilities:',e)}}
function hasAccessBuilderPermissions(modal){const accessBuilderSection=modal.querySelector('.permission-section[data-section="access_builder"]')
if(!accessBuilderSection)return false
const accessBuilderCheckboxes=accessBuilderSection.querySelectorAll('input[type="checkbox"][name="permissions[]"]')
return Array.from(accessBuilderCheckboxes).some((checkbox)=>checkbox.checked)}
function toggleNonAccessBuilderCheckboxes(modal,enable){const allSections=modal.querySelectorAll('.permission-section')
allSections.forEach((section)=>{if(section.dataset.section==='access_builder')return
const checkboxes=section.querySelectorAll('input[type="checkbox"][name="permissions[]"]')
const enableAllCheckbox=section.querySelector('.enable-all-checkbox')
checkboxes.forEach((checkbox)=>{checkbox.disabled=!enable
if(!enable){checkbox.checked=false}})
if(enableAllCheckbox){enableAllCheckbox.disabled=!enable
enableAllCheckbox.checked=enable&&Array.from(checkboxes).every((checkbox)=>checkbox.checked)}})}
function updateCapabilitiesInput(){if(customCapabilitiesInput){customCapabilitiesInput.value=JSON.stringify(capabilities)}}
function renderCapabilities(){capabilitiesList.innerHTML=''
if(window.bricksData.defaultCapabilities){capabilitiesList.innerHTML+=`<div class="sub">${window.bricksData.i18n.defaultCapabilities}</div>`Object.entries(window.bricksData.defaultCapabilities).forEach(([capId,capLabel])=>{const capabilityItem=document.createElement('div')
capabilityItem.className='capability-item'
capabilityItem.dataset.capability=capId
capabilityItem.dataset.isDefault='true'
capabilityItem.innerHTML=`
     <div class="capability-header">
      <div class="capability-name">${capLabel} <em>(${window.bricksData.i18n.default})</em></div>
      <div class="capability-actions">
       <button type="button" class="button view-capability">
        ${window.bricksData.i18n.view}
       </button>
      </div>
     </div>
    `capabilitiesList.appendChild(capabilityItem)})}
if(capabilities.length){let hr=document.createElement('hr')
hr.className='capabilities-separator'
capabilitiesList.appendChild(hr)
capabilitiesList.innerHTML+=`<div class="sub">${window.bricksData.i18n.customCapabilities}</div>`capabilitiesList.innerHTML+=`<div class="description">${window.bricksData.i18n.customCapabilitiesDescription}</div>`}
capabilities.forEach((capability)=>{const capabilityItem=document.createElement('div')
capabilityItem.className='capability-item'
capabilityItem.dataset.capability=capability.id
capabilityItem.innerHTML=`
    <div class="capability-header">
     <div class="capability-name">${capability.label}</div>
     <div class="capability-actions">
      <button type="button" class="button edit-capability">
       ${window.bricksData.i18n.edit}
      </button>
      <button type="button" class="button duplicate-capability">
      ${window.bricksData.i18n.duplicate}
      </button>
      <button type="button" class="button delete-capability">
      ${window.bricksData.i18n.delete}
      </button>
     </div>
    </div>
   `capabilitiesList.appendChild(capabilityItem)})}
function closeModal(){const modal=document.querySelector('.bricks-capability-modal')
const backdrop=document.querySelector('.bricks-capability-modal-backdrop')
if(modal)modal.remove()
if(backdrop)backdrop.remove()}
function saveCapabilityChanges(modal,capabilityId){const nameInput=modal.querySelector('input[name="capability-name"]')
const descriptionInput=modal.querySelector('textarea[name="capability-description"]')
const checkboxes=modal.querySelectorAll('input[type="checkbox"][name="permissions[]"]')
const nameError=modal.querySelector('.capability-name-error')
const label=nameInput.value.trim()
const description=descriptionInput.value.trim()
if(!label){nameError.textContent=window.bricksData.i18n.capabilityNameRequired
nameInput.classList.add('error')
return false}
if(window.bricksData.defaultCapabilities&&Object.keys(window.bricksData.defaultCapabilities).includes(capabilityId)&&(!capabilityId||label!==capabilityId)){nameError.textContent=window.bricksData.i18n.capabilityNameReserved
nameInput.classList.add('error')
return false}
const nameExists=capabilities.some((cap)=>cap.id===label&&(!capabilityId||label!==capabilityId))
if(nameExists){nameError.textContent=window.bricksData.i18n.capabilityNameExists
nameInput.classList.add('error')
return false}
const selectedPermissions=[]
checkboxes.forEach((checkbox)=>{if(checkbox.checked){selectedPermissions.push(checkbox.value)}})
if(capabilityId){const index=capabilities.findIndex((cap)=>cap.id===capabilityId)
if(index!==-1){if(label!==capabilities[index].label){const builderAccessSelects=document.querySelectorAll('select[name^="builderCapabilities"]')
builderAccessSelects.forEach((select)=>{const option=Array.from(select.options).find((option)=>option.value===capabilityId)
if(option){option.textContent=label}})}
capabilities[index]={id:capabilityId,label:label,description:description,permissions:selectedPermissions}}}else{const newId=generateCapabilityId()
capabilities.push({id:newId,label:label,description:description,permissions:selectedPermissions})
updateBuilderAccessDropdowns({id:newId,label:label})}
updateCapabilitiesInput()
renderCapabilities()
return true}
function showCapabilityModal(capabilityId,isViewOnly){const modalHTML=renderModalTemplate(capabilityId,isViewOnly)
document.body.insertAdjacentHTML('beforeend',modalHTML)
const modal=document.querySelector('.bricks-capability-modal')
const closeButtons=modal.querySelectorAll('.close-modal')
const nameInput=modal.querySelector('input[name="capability-name"]')
const checkboxes=modal.querySelectorAll('input[type="checkbox"][name="permissions[]"]')
const backdrop=document.querySelector('.bricks-capability-modal-backdrop')
closeButtons.forEach((button)=>{button.addEventListener('click',()=>{if(!isViewOnly){saveCapabilityChanges(modal,capabilityId)}
closeModal()})})
if(backdrop){backdrop.addEventListener('click',()=>{if(!isViewOnly){saveCapabilityChanges(modal,capabilityId)}
closeModal()})}
document.addEventListener('keydown',function escHandler(e){if(e.key==='Escape'){if(!isViewOnly){saveCapabilityChanges(modal,capabilityId)}
closeModal()
document.removeEventListener('keydown',escHandler)}})
if(isViewOnly){if(nameInput)nameInput.disabled=true
checkboxes.forEach((checkbox)=>{checkbox.disabled=true})}
if(!isViewOnly){const hasAccess=hasAccessBuilderPermissions(modal)
toggleNonAccessBuilderCheckboxes(modal,hasAccess)
const accessBuilderSection=modal.querySelector('.permission-section[data-section="access_builder"]')
if(accessBuilderSection){const accessBuilderCheckboxes=accessBuilderSection.querySelectorAll('input[type="checkbox"][name="permissions[]"]')
accessBuilderCheckboxes.forEach((checkbox)=>{checkbox.addEventListener('change',()=>{const hasAccess=hasAccessBuilderPermissions(modal)
toggleNonAccessBuilderCheckboxes(modal,hasAccess)
saveCapabilityChanges(modal,capabilityId)})})}}
if(!isViewOnly){modal.querySelectorAll('.permission-section').forEach((section)=>{const sectionCheckboxes=section.querySelectorAll('input[type="checkbox"][name="permissions[]"]')
const enableAllCheckbox=section.querySelector('.enable-all-checkbox')
const allChecked=Array.from(sectionCheckboxes).every((checkbox)=>checkbox.checked)
enableAllCheckbox.checked=allChecked
enableAllCheckbox.addEventListener('change',function(){if(section.dataset.section!=='access_builder'&&!hasAccessBuilderPermissions(modal)){this.checked=false
return}
const isChecked=this.checked
sectionCheckboxes.forEach((checkbox)=>{if(!checkbox.disabled){checkbox.checked=isChecked}})
if(section.dataset.section==='access_builder'){toggleNonAccessBuilderCheckboxes(modal,isChecked)}
saveCapabilityChanges(modal,capabilityId)})})
checkboxes.forEach((checkbox)=>{checkbox.addEventListener('change',function(){const section=this.closest('.permission-section')
const sectionCheckboxes=section.querySelectorAll('input[type="checkbox"][name="permissions[]"]')
const enableAllCheckbox=section.querySelector('.enable-all-checkbox')
const allChecked=Array.from(sectionCheckboxes).every((checkbox)=>checkbox.checked||checkbox.disabled)
enableAllCheckbox.checked=allChecked
if(section.dataset.section==='access_builder'){const hasAccess=hasAccessBuilderPermissions(modal)
toggleNonAccessBuilderCheckboxes(modal,hasAccess)}
saveCapabilityChanges(modal,capabilityId)})})}
if(nameInput&&!isViewOnly){nameInput.addEventListener('input',function(){const nameError=modal.querySelector('.capability-name-error')
nameInput.classList.remove('error')
nameError.textContent=''
saveCapabilityChanges(modal,capabilityId)})}}
function renderModalTemplate(capabilityId,isViewOnly){let capability={id:'',label:'',description:'',permissions:[]}
if(capabilityId){if(window.bricksData.defaultCapabilityPermissions&&window.bricksData.defaultCapabilityPermissions[capabilityId]){const defaultCapData=window.bricksData.defaultCapabilityPermissions[capabilityId]
capability={id:capabilityId,label:defaultCapData.label,permissions:defaultCapData.permissions||[]}}else{const existingCapability=capabilities.find((cap)=>cap.id===capabilityId)
if(existingCapability){capability=existingCapability}}}
const isDefaultCapability=window.bricksData.defaultCapabilityPermissions?.[capabilityId]
return`
  <div class="bricks-capability-modal">
   <div class="bricks-capability-modal-header">
    <h2>${
     isViewOnly
      ? window.bricksData.i18n.view
      : capability.id
       ? window.bricksData.i18n.editCapability
       : window.bricksData.i18n.newCapability
    }</h2>
    <button type="button" class="close-modal">
     <span class="dashicons dashicons-no-alt"></span>
    </button>
   </div>
   <div class="bricks-capability-modal-content">
    <div class="capability-name-wrapper">
     <label for="capability-name">${window.bricksData.i18n.capabilityName}</label>
     <span class="capability-id" title="${window.bricksData.i18n.capability}: ${
      window.bricksData.i18n.capabilityKey
     }">${capability.id}</span>
     <input type="text" name="capability-name" id="capability-name" value="${capability.label}" ${
      isViewOnly || isDefaultCapability ? 'disabled' : ''
     }>
     <div class="capability-name-error"></div>
    </div>
    ${
     !isDefaultCapability
      ? `<div class="capability-description-wrapper"><label for="capability-description">${window.bricksData.i18n.description}</label><textarea name="capability-description"id="capability-description"rows="3"${isViewOnly?'disabled':''}>${capability.description||''}</textarea></div>`
      : ''
    }
    <div class="capability-permissions">
     ${Object.entries(window.bricksData.builderAccessPermissions)
      .map(
       ([sectionKey, section]) => `<div class="permission-section"data-section="${sectionKey}"><div class="section-header"><h3>${section.label}</h3><label class="enable-all-wrapper"><input type="checkbox"class="enable-all-checkbox"${isViewOnly?'disabled':''}><span>${window.bricksData.i18n.enableAll}</span></label><div class="description">${section.description||''}</div></div><div class="permission-grid">${Object.entries(section.permissions).map(([permissionId,permissionLabel])=>`
         <label class="permission-item">
          <input type="checkbox" name="permissions[]" value="${permissionId}" ${
           capability.permissions.includes(permissionId) ? 'checked' : ''
          } ${isViewOnly ? 'disabled' : ''}>
          <span>${permissionLabel}</span>
         </label>
        `).join('')}</div></div>`
      )
      .join('')}
    </div>
   </div>
   <div class="bricks-capability-modal-footer">
    <div class="save-reminder">${window.bricksData.i18n.saveSettingsToApplyChanges}</div>
    <button type="button" class="button close-modal">${window.bricksData.i18n.close}</button>
   </div>
  </div>
  <div class="bricks-capability-modal-backdrop"></div>
  `}
function updateBuilderAccessDropdowns(capability){const builderAccessSelects=document.querySelectorAll('select[name^="builderCapabilities"]')
if(!builderAccessSelects.length){return}
const newOption=document.createElement('option')
newOption.value=capability.id
newOption.textContent=capability.label
builderAccessSelects.forEach((select)=>{if(select.disabled){return}
const existingOption=select.querySelector(`option[value="${capability.id}"]`)
if(existingOption){existingOption.remove()}
const fullAccessOption=Array.from(select.options).find((option)=>option.value==='bricks_full_access')
if(fullAccessOption){select.insertBefore(newOption.cloneNode(true),fullAccessOption)}else{select.appendChild(newOption.cloneNode(true))}})}
function generateRandomString(length=6){return Math.random().toString(36).substring(2,2+length)}
function generateCapabilityId(){return`bricks_builder_access_${generateRandomString()}`}
if(addCapabilityButton){addCapabilityButton.addEventListener('click',function(){const newCapability={id:generateCapabilityId(),label:window.bricksData.i18n.newCapability,permissions:[]}
capabilities.push(newCapability)
updateCapabilitiesInput()
updateBuilderAccessDropdowns(newCapability)
renderCapabilities()
showCapabilityModal(newCapability.id)})}
function updateBuilderAccessDropdowns(capability){const builderAccessSelects=document.querySelectorAll('select[name^="builderCapabilities"]')
if(!builderAccessSelects.length){return}
const newOption=document.createElement('option')
newOption.value=capability.id
newOption.textContent=capability.label
builderAccessSelects.forEach((select)=>{if(select.disabled){return}
const existingOption=select.querySelector(`option[value="${capability.id}"]`)
if(existingOption){existingOption.remove()}
const fullAccessOption=Array.from(select.options).find((option)=>option.value==='bricks_full_access')
if(fullAccessOption){select.insertBefore(newOption.cloneNode(true),fullAccessOption)}else{select.appendChild(newOption.cloneNode(true))}})}
renderCapabilities()
if(capabilitiesList){capabilitiesList.addEventListener('click',function(e){const capabilityItem=e.target.closest('.capability-item')
if(!capabilityItem){return}
const capabilityId=capabilityItem.dataset.capability
if(e.target.classList.contains('view-capability')){showCapabilityModal(capabilityId,true)}
else if(e.target.classList.contains('edit-capability')){showCapabilityModal(capabilityId)}
else if(e.target.classList.contains('duplicate-capability')||e.target.closest('.duplicate-capability')){const capability=capabilities.find((cap)=>cap.id===capabilityId)
if(capability){const newId=generateCapabilityId()
const duplicatedCapability={id:newId,label:`${capability.label} (${window.bricksData.i18n.duplicate})`,description:capability.description||'',permissions:[...capability.permissions]}
capabilities.push(duplicatedCapability)
updateCapabilitiesInput()
updateBuilderAccessDropdowns(duplicatedCapability)
renderCapabilities()}}
else if(e.target.classList.contains('delete-capability')||e.target.closest('.delete-capability')){const confirmed=confirm(window.bricksData.i18n.confirmDeleteCapability)
if(confirmed){capabilities=capabilities.filter((cap)=>cap.id!==capabilityId)
const builderAccessSelects=document.querySelectorAll('select[name^="builderCapabilities"]')
builderAccessSelects.forEach((select)=>{const option=select.querySelector(`option[value="${capabilityId}"]`)
if(option){option.remove()}})
updateCapabilitiesInput()
renderCapabilities()}}})}}
function bricksAdminTemplateExclusion(){bricksCreateMultiselect('excludedTemplates',{placeholder:window.bricksData?.i18n?.selectTemplates,searchPlaceholder:window.bricksData?.i18n?.searchTemplates,dataAttribute:'data-template-id'})}
function bricksAdminMaintenanceExcludedPosts(){bricksCreateMultiselect('maintenanceExcludedPosts',{placeholder:window.bricksData?.i18n?.selectPosts,searchPlaceholder:window.bricksData?.i18n?.searchPosts,dataAttribute:'data-post-id',ajaxSearch:true,ajaxOptions:{action:'bricks_get_posts',params:{postType:'any',postStatus:'publish',excludePostTypes:['bricks_template','attachment']},minSearchLength:2,debounceTime:300}})}
function bricksAttributeImageSwatches(){document.addEventListener('click',function(e){if(!e.target.matches('.bricks_swatch_image_upload'))return
e.preventDefault()
const button=e.target
const parent=button.parentNode
const imageIdInput=parent.querySelector('input[name="swatch_image_value"], input[name="swatch_default_image"]')
const imagePreview=parent.querySelector('.swatch-image-preview')
let wp=window.wp
if(!wp.media.frames.file_frame){wp.media.frames.file_frame=wp.media({multiple:false})}
wp.media.frames.file_frame.off('select').on('select',function(){const attachment=wp.media.frames.file_frame.state().get('selection').first().toJSON()
imageIdInput.value=attachment.id
if(imagePreview){imagePreview.src=attachment.url}else{const img=document.createElement('img')
img.src=attachment.url
img.className='swatch-image-preview'
img.style.cssText='max-width: 150px; display: block; margin-bottom: 8px;'
button.parentNode.insertBefore(img,button)}
button.nextElementSibling.style.display=''})
wp.media.frames.file_frame.open()})
document.addEventListener('click',function(e){if(!e.target.matches('.bricks_swatch_image_remove'))return
e.preventDefault()
const button=e.target
const parent=button.parentNode
const imageIdInput=parent.querySelector('input[name="swatch_image_value"], input[name="swatch_default_image"]')
const imagePreview=parent.querySelector('.swatch-image-preview')
imageIdInput.value=''
if(imagePreview){imagePreview.remove()}
button.style.display='none'})}
function bricksAttributeColorSwatches(){document.addEventListener('click',function(e){if(!e.target.matches('.bricks-remove-color')){return}
e.preventDefault()
const inputId=e.target.dataset.input
const input=document.getElementById(inputId)
const wrapper=input.closest('.bricks-color-swatch-wrapper')
wrapper.innerHTML=`
   <div style="display: inline-block">
    <button type="button" class="button show-color-picker" data-input-id="${inputId}">
     ${window.bricksData.i18n.selectColor}
    </button>
    <input type="hidden" name="${input.name}" id="${inputId}" value="none">
   </div>
  `})
document.addEventListener('click',function(e){if(!e.target.matches('.show-color-picker')){return}
const inputId=e.target.dataset.inputId
const wrapper=e.target.closest('div')
const inputName=inputId==='swatch_default_color'?'swatch_default_color':'swatch_color_value'
wrapper.outerHTML=`
   <div class="bricks-color-input-wrapper" style="position: relative; display: inline-block;">
    <input type="color" name="${inputName}" id="${inputId}" class="bricks-color-input">
    <button type="button" class="button bricks-remove-color" data-input="${inputId}">
     ${window.bricksData.i18n.remove}
    </button>
   </div>
  `const colorInput=document.getElementById(inputId)
if(!openColorPicker(e,colorInput)){colorInput.focus()
setTimeout(()=>{colorInput.click()},10)}})
document.addEventListener('click',function(e){if(!e.target.matches('input[type="color"].bricks-color-input')){return}
openColorPicker(e,e.target)})
const openColorPicker=(e,targetInput)=>{if(navigator.userAgent.indexOf('Chrome')!==-1){const currentColor=targetInput.value||'#ffffff'
const tempInput=document.createElement('input')
tempInput.type='color'
tempInput.value=currentColor
tempInput.style.position='absolute'
tempInput.style.left=e.pageX-5+'px'
tempInput.style.top=e.pageY-5+'px'
tempInput.style.padding='0'
tempInput.style.margin='0'
tempInput.style.width='1px'
tempInput.style.height='1px'
tempInput.style.opacity='0.01'
tempInput.style.pointerEvents='none'
tempInput.style.zIndex='999999'
tempInput.addEventListener('input',function(){targetInput.value=tempInput.value})
tempInput.addEventListener('change',function(){targetInput.value=tempInput.value
document.body.removeChild(tempInput)})
document.body.appendChild(tempInput)
tempInput.focus()
tempInput.click()
return true}
return false}}
function bricksAttributeSwatchTypeVisibility(){const swatchType=document.getElementById('swatch_type')
const fallbacks=document.querySelectorAll('.bricks-swatch-fallback')
if(!swatchType)return
function updateVisibility(){const type=swatchType.value
fallbacks.forEach((el)=>{el.style.display='none'})
if(type){const fallbackField=document.querySelector('.bricks-swatch-fallback-'+type)
if(fallbackField){fallbackField.style.display=''}}}
swatchType.addEventListener('change',updateVisibility)
updateVisibility()}
function bricksCleanupOrphanedElements(){let button=document.getElementById('cleanup-all-orphaned-elements')
if(!button){return}
button.addEventListener('click',function(e){e.preventDefault()
var confirmed=confirm(bricksData.i18n.confirmCleanupOrphanedElements)
if(!confirmed){return}
jQuery.ajax({type:'POST',url:bricksData.ajaxUrl,data:{action:'bricks_cleanup_orphaned_elements',nonce:bricksData.nonce},beforeSend:()=>{button.setAttribute('disabled','disabled')
button.classList.add('wait')},success:function(res){button.removeAttribute('disabled')
button.classList.remove('wait')
if(res.success){alert(res.data.message)
location.reload()}else{alert(res.data.message||bricksData.i18n.errorOccurred)}},error:function(){button.removeAttribute('disabled')
button.classList.remove('wait')
alert(bricksData.i18n.errorOccurredCleaningUpOrphanedElements)}})})}
function bricksScanOrphanedElements(){let button=document.getElementById('scan-orphaned-elements')
let resultsContainer=document.getElementById('orphaned-elements-results')
if(!button||!resultsContainer){return}
button.addEventListener('click',function(e){e.preventDefault()
jQuery.ajax({type:'POST',url:window.bricksData.ajaxUrl,data:{action:'bricks_scan_orphaned_elements',nonce:window.bricksData.nonce},beforeSend:()=>{button.setAttribute('disabled','disabled')
button.classList.add('wait')},success:function(res){button.removeAttribute('disabled')
button.classList.remove('wait')
if(res.success){bricksDisplayOrphansScanResults(res.data,resultsContainer)}else{alert(res.data.message||window.bricksData.i18n.error)}},error:function(){button.removeAttribute('disabled')
button.classList.remove('wait')
alert(window.bricksData.i18n.errorOccurredScanningOrphanedElements)}})})}
function bricksDisplayOrphansScanResults(data,container){let html=''
if(data.total_orphans===0){html='<div class="separator"></div>'
html+='<p class="message success"><strong>'+
window.bricksData.i18n.noOrphanedElementsFound+'</strong></p>'}else{html='<div class="separator"></div>'
let errorMessage=window.bricksData.i18n.orphanedElementsFoundMessage.replace('%1$d',data.total_orphans).replace('%2$d',data.total_posts)
html+='<h3 class="hero">'+
window.bricksData.i18n.results+': '+
window.bricksData.i18n.orphanedElementsReview+'</h3>'
html+='<p class="message error"><strong>'+errorMessage+'</strong></p>'
html+='<div class="actions-wrapper" style="margin: 15px 0;">'
html+='<button type="button" id="cleanup-all-orphaned-elements" class="ajax button button-primary" style="margin-right: 10px;">'
html+='<span class="text">'+window.bricksData.i18n.cleanupAllOrphanedElements+'</span>'
html+='<span class="spinner is-active"></span>'
html+='<i class="dashicons dashicons-yes hide"></i>'
html+='</button>'
html+='</div>'
html+='<div class="orphaned-posts-list">'
html+='<ul>'
for(let postId in data.orphaned_by_post_id){let postData=data.orphaned_by_post_id[postId]
let permalink=postData.permalink
let editUrl
if(permalink.indexOf('?')===-1){editUrl=`${permalink}?${window.bricksData.builderParam}=run`}else{editUrl=`${permalink}&${window.bricksData.builderParam}=run`}
html+='<li>'
html+='<a href="'+editUrl+'" target="_blank">'
html+='<strong>'+postData.post_title+'</strong>'
html+='</a>'
html+=' - '
html+='<span style="color: #d63638;">'
html+=window.bricksData.i18n.orphanedElementsCountMessage.replace('%d',postData.total_orphans)
html+='</span>'
html+='</li>'}
html+='</ul>'
html+='</div>'}
container.innerHTML=html
container.style.display='block'
if(data.total_orphans>0){bricksCleanupOrphanedElements()}}
document.addEventListener('DOMContentLoaded',function(e){bricksAdminClassicEditor()
bricksAdminImport()
bricksAdminSaveLicenseKey()
bricksAdminToggleLicenseKey()
bricksAdminSettings()
bricksAdminRunConverter()
bricksAdminBreakpointsRegenerateCssFiles()
bricksAdminGenerateCssFiles()
bricksAdminCodeReview()
bricksAdminCodeReviewFilter()
bricksAdminCustomCapabilities()
bricksAdminGlobalElementsReview()
bricksTemplateShortcodeCopyToClipboard()
bricksDismissHttpsNotice()
bricksDismissInstagramAccessTokenNotice()
bricksDropFormSubmissionsTable()
bricksResetFormSubmissionsTable()
bricksDeleteFormSubmissionsByFormId()
bricksRemoteTemplateUrls()
bricksDeleteTemplateScreenshots()
bricksReindexFilters()
bricksRunIndexJob()
bricksFixElementDB()
bricksRegenerateCodeSignatures()
bricksCleanupOrphanedElements()
bricksScanOrphanedElements()
bricksAdminGlobalElementsReview()
bricksTemplateThumbnailAddScrollAnimation()
bricksAdminMaintenanceTemplateListener()
bricksAdminAuthUrlBehaviorListener()
bricksAdminWooSettings()
bricksAdminTemplateExclusion()
bricksAdminMaintenanceExcludedPosts()
bricksElementManger()
bricksAdminElementManagerUsage()
bricksAttributeImageSwatches()
bricksAttributeColorSwatches()
bricksAttributeSwatchTypeVisibility()
let tableContainer=document.querySelector('.wp-list-table-container')
let tablenavTop=document.querySelector('.tablenav.top')
let tablenavBottom=document.querySelector('.tablenav.bottom')
if(tableContainer&&tablenavTop){tableContainer.parentNode.insertBefore(tablenavTop,tableContainer)}
if(tableContainer&&tablenavBottom){tableContainer.parentNode.insertBefore(tablenavBottom,tableContainer.nextSibling)}
let formSubmissionsForm=document.getElementById('bricks-form-submissions')
let searchBox=formSubmissionsForm?formSubmissionsForm.querySelector('.search-box input[type=search]'):false
if(searchBox){searchBox.placeholder=window.bricksData?.i18n.formSubmissionsSearchPlaceholder}})