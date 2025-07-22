function SWISRemoveCriticalCSS() {
        if ( document.querySelector( 'link[data-swis="loading"]' ) ) {
                setTimeout( SWISRemoveCriticalCSS, 200 );
        } else {
                var style = document.getElementById( 'swis-critical-css' );
                if ( style && 'remove' in style ) {
                        style.remove();
                }
        }
};

if ( window.addEventListener ) {
        window.addEventListener( 'load', SWISRemoveCriticalCSS );
} else if ( window.attachEvent ) {
        window.attachEvent( 'onload', SWISRemoveCriticalCSS );
}
