function bricksAdminGutenbergEditWithBricks(){if(window.self!==window.top){return}
var editWithBricksLink=document.querySelector('#wp-admin-bar-edit_with_bricks a')
if(!editWithBricksLink){editWithBricksLink=document.createElement('a')
editWithBricksLink.id='wp-admin-bar-edit_with_bricks'
editWithBricksLink.href=window.bricksData.builderEditLink
editWithBricksLink.innerText=window.bricksData.i18n.editWithBricks}
window.wp.data.subscribe(function(){setTimeout(function(){var postHeaderToolbar=document.querySelector('.edit-post-header-toolbar')
if(postHeaderToolbar&&postHeaderToolbar instanceof HTMLElement&&!postHeaderToolbar.querySelector('#toolbar-edit_with_bricks')){var editWithBricksButton=document.createElement('a')
editWithBricksButton.id='toolbar-edit_with_bricks'
editWithBricksButton.classList.add('button')
editWithBricksButton.classList.add('button-primary')
editWithBricksButton.innerText=editWithBricksLink.innerText
editWithBricksButton.href=editWithBricksLink.href
postHeaderToolbar.append(editWithBricksButton)
editWithBricksButton.addEventListener('click',function(e){e.preventDefault()
var title=window.wp.data.select('core/editor').getEditedPostAttribute('title')
var postId=window.wp.data.select('core/editor').getCurrentPostId()
if(!title){window.wp.data.dispatch('core/editor').editPost({title:'Bricks #'+postId})}
window.wp.data.dispatch('core/editor').savePost()
var redirectToBuilder=function(url){setTimeout(function(){if(window.wp.data.select('core/editor').isSavingPost()||window.wp.data.select('core/editor').isAutosavingPost()){redirectToBuilder(url)}else{window.location.href=url}},400)}
redirectToBuilder(e.target.href)})}},1)})}
function bricksHandleEmptyContent(){let rootContainer=document.querySelector('.is-root-container')
let attempts=0
const maxAttempts=10
function tryFindContainer(){if(attempts>=maxAttempts){return}
rootContainer=document.querySelector('.is-root-container')
if(!rootContainer){attempts++
setTimeout(tryFindContainer,50)
return}
if(window.self!==window.top){handleEmptyContentCore(rootContainer)}else{const editorIframe=document.querySelector('iframe[name="editor-canvas"]')
if(!editorIframe&&window.wp&&window.wp.data){window.wp.data.subscribe(function(){setTimeout(function(){handleEmptyContentCore(rootContainer)},1)})}}}
tryFindContainer()}
function handleEmptyContentCore(rootContainer){if(rootContainer&&!rootContainer.querySelector('.bricks-block-editor-notice-wrapper')&&window.bricksData.showBuiltWithBricks==1&&!window.useDefaultEditor){rootContainer.querySelectorAll(':scope > *').forEach((el)=>{if(!el.classList.contains('bricks-block-editor-notice-wrapper')){el.style.display='none'}})
const editorWrapper=document.createElement('div')
editorWrapper.className='bricks-block-editor-notice-wrapper'
const message=document.createElement('p')
message.className='bricks-editor-message'
message.textContent=window.bricksData.i18n.bricksActiveMessage
const buttonWrapper=document.createElement('div')
buttonWrapper.className='bricks-editor-buttons'
const editButton=document.createElement('a')
editButton.className='button button-primary'
editButton.href=window.bricksData.builderEditLink||'#'
editButton.textContent=window.bricksData.i18n.editWithBricks
editButton.addEventListener('click',(e)=>{e.preventDefault()
if(window.self!==window.top){window.top.postMessage({type:'bricksOpenBuilder',url:window.bricksData.builderEditLink},'*')}else{window.location.href=window.bricksData.builderEditLink}})
const defaultEditorLink=document.createElement('a')
defaultEditorLink.className='button'
defaultEditorLink.href='#'
defaultEditorLink.textContent=window.bricksData.i18n.useDefaultEditor
defaultEditorLink.addEventListener('click',(e)=>{e.preventDefault()
window.useDefaultEditor=true
rootContainer.querySelectorAll(':scope > *').forEach((el)=>{if(!el.classList.contains('bricks-block-editor-notice-wrapper')){el.style.display=''}})
editorWrapper.remove()})
buttonWrapper.append(editButton,defaultEditorLink)
editorWrapper.append(message,buttonWrapper)
rootContainer.appendChild(editorWrapper)}}
if(window.self===window.top){window.addEventListener('message',(event)=>{if(event.data.type==='bricksOpenBuilder'){window.location.href=event.data.url}})}
document.addEventListener('DOMContentLoaded',function(e){bricksAdminGutenbergEditWithBricks()
bricksHandleEmptyContent()})