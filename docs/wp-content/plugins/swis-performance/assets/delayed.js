const swisEventList = ['keydown', 'mousemove', 'scroll', 'wheel', 'touchstart', 'touchend', 'touchmove'];

const swisAutoLoadTimeout = setTimeout(swisLoadScripts, swisAutoLoadDuration * 1000);

swisEventList.forEach(function(event) {
    window.addEventListener(event, swisTriggerScriptLoad, { passive: true })
});

function swisTriggerScriptLoad() {
    swisLoadScripts();
    clearTimeout(swisAutoLoadTimeout);
    swisEventList.forEach(function(event) {
         window.removeEventListener(event, swisTriggerScriptLoad, { passive: true });
    });
}

function swisLoadScripts() {
    document.querySelectorAll("script[data-swis-src]").forEach(function(scriptTag) {
        scriptTag.setAttribute("src", scriptTag.getAttribute("data-swis-src"));
    });
}
