class BricksYoastContentData{constructor(){if(typeof YoastSEO==='undefined'||typeof YoastSEO.analysis==='undefined'||typeof YoastSEO.analysis.worker==='undefined'){return}
YoastSEO.app.registerPlugin('BricksYoastContentData',{status:'ready'})
this.registerModifications()}
registerModifications(){const callback=this.addContent.bind(this)
YoastSEO.app.registerModification('content',callback,'BricksYoastContentData',100)}
addContent(data){if(window.bricksYoast.contentData!==''){return window.bricksYoast.contentData}
return data}}
function yoastFetchBricksContent(){jQuery.ajax({url:window.bricksYoast.ajaxUrl,type:'POST',data:{action:'bricks_get_html_from_content',nonce:window.bricksYoast.nonce,postId:window.bricksYoast.postId},success:function(res){if(res.data.html){window.bricksYoast.contentData=res.data.html}
if(typeof YoastSEO!=='undefined'&&typeof YoastSEO.app!=='undefined'&&typeof YoastSEO.app.refresh==='function'){YoastSEO.app.refresh()}},error:function(err){console.error('Error updating content data:',err)}})}
document.addEventListener('DOMContentLoaded',function(){if(!window.bricksYoast||!window.bricksYoast.renderWithBricks){return}
yoastFetchBricksContent()})
if(typeof YoastSEO!=='undefined'&&typeof YoastSEO.app!=='undefined'){new BricksYoastContentData()}else{jQuery(window).on('YoastSEO:ready',function(){new BricksYoastContentData()})}
if(typeof wp!=='undefined'&&typeof wp.data!=='undefined'&&typeof wp.domReady!=='undefined'&&typeof wp.data.select('core/editor')!=='undefined'&&typeof wp.data.select('core/editor').isSavingPost==='function'&&typeof wp.data.select('core/editor').isAutosavingPost==='function'){wp.domReady(()=>{let isPostSaving=false
wp.data.subscribe(()=>{const currentlySaving=wp.data.select('core/editor').isSavingPost()||wp.data.select('core/editor').isAutosavingPost()
if(currentlySaving&&!isPostSaving){}
if(!currentlySaving&&isPostSaving){yoastFetchBricksContent()}
isPostSaving=currentlySaving})})}