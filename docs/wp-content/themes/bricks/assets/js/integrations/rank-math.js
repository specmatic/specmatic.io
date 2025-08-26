function rmGetBricksContentData(originalContent){if(window.bricksRankMath.contentData!==''){return window.bricksRankMath.contentData}
return originalContent}
function rmFetchBricksContent(){jQuery.ajax({url:window.bricksRankMath.ajaxUrl,type:'POST',data:{action:'bricks_get_html_from_content',nonce:window.bricksRankMath.nonce,postId:window.bricksRankMath.postId},success:function(res){if(res.data.html){window.bricksRankMath.contentData=res.data.html}
if(typeof rankMathEditor!=='undefined'&&typeof rankMathEditor.refresh==='function'){rankMathEditor.refresh('content')}},error:function(err){console.error('Error updating content data:',err)}})}
document.addEventListener('DOMContentLoaded',function(){if(!window.bricksRankMath||!window.bricksRankMath.renderWithBricks){return}
wp.hooks.addFilter('rank_math_content','bricks',rmGetBricksContentData)
rmFetchBricksContent()})
if(typeof wp!=='undefined'&&typeof wp.data!=='undefined'&&typeof wp.domReady!=='undefined'&&typeof wp.data.select('core/editor')!=='undefined'&&typeof wp.data.select('core/editor').isSavingPost==='function'&&typeof wp.data.select('core/editor').isAutosavingPost==='function'){wp.domReady(()=>{let isPostSaving=false
wp.data.subscribe(()=>{const currentlySaving=wp.data.select('core/editor').isSavingPost()||wp.data.select('core/editor').isAutosavingPost()
if(currentlySaving&&!isPostSaving){}
if(!currentlySaving&&isPostSaving){window.bricksRankMath.postIsUpdated=true
rmFetchBricksContent()}
isPostSaving=currentlySaving})})}