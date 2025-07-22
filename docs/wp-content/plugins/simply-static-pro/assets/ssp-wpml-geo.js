function WPML_Integration() {

    var languages = {};
    var self = this;

    /**
     * Start the Integration.
     */
    this.start = function start() {
        languages = this.getLanguagesInSwitcher();

        this.registerSwitcher();
        this.switchToClientLanguage();
    }

    /**
     * Redirect to an URL.
     *
     * @param href Full URL.
     */
    this.redirectTo = function redirectTo(href) {
        window.location.replace(href);
    }

    /**
     * Get the stored Language from cookie.
     *
     * @returns {string}
     */
    this.getStoredLanguage = function getStoredLanguage() {
        return this.getCookie('simply_static_lang');
    }

    /**
     * Store a new language in cookie.
     *
     * @param lang Abbreviation of a language (en, de, hr).
     */
    this.storeLanguage = function storeLanguage(lang) {
        return this.setCookie('simply_static_lang', lang, 30);
    }

    /**
     * Get the current language of the page.
     *
     * @returns string|null
     */
    this.getCurrentPageLanguage = function getCurrentPageLanguage() {
        var lang = this.getLanguageFromHref(window.location.href);

        if (!lang) {
            var htmlLang = document.getElementsByTagName('html')[0].getAttribute('lang');
            if (htmlLang) {
                lang = htmlLang.substring(0, 2);
            }
        }
        return lang
    }

    /**
     * Switch to Client Language.
     *
     * @returns {boolean}
     */
    this.switchToClientLanguage = function switchToClientLanguage() {
        // No other present languages for the current page, skip it.
        if (Object.keys(languages).length < 1) {
            return false;
        }

        // Current Browser Language.
        let current_language = navigator.language.substring(0, 2);

        if (this.getStoredLanguage()) {
            // We have the stored language, let's find if we're on it.
            if (this.getStoredLanguage() !== this.getCurrentPageLanguage()) {
                var href = languages[this.getStoredLanguage()] || '';
                if (!href) {
                    return;
                }
                this.redirectTo(href);
            }
            return;
        }

        // Find the current language from all languages on the page and redirect to it.
        for (const [key, value] of Object.entries(languages)) {
            if (key === current_language) {
                this.redirectToNewLanguage(key, value);
            }
        }
    }

    /**
     * Redirect to the new language and store the language.
     *
     * @param lang
     * @param href
     */
    this.redirectToNewLanguage = function redirectToNewLanguage(lang, href) {
        this.storeLanguage(lang);
        this.redirectTo(href);
    }

    /**
     * Register "Switch" method to be triggered by each language click.
     */
    this.registerSwitcher = function registerSwitcher() {
        var links = document.getElementsByClassName('wpml-ls-link');

        for (var l = 0; l < links.length; l++) {
            var link = links[l];

            link.addEventListener('click', this.maybeSwitchLanguage);
        }
    }

    /**
     * Return the language from the URL if we have that URL related to a language in the switcher.
     *
     * @param href
     * @returns {string}
     */
    this.getLanguageFromHref = function getLanguageFromHref(href) {
        if (Object.keys(languages).length < 1) {
            return this.getCurrentLanguage();
        }

        for (var lang in languages) {
            var langHref = languages[lang];

            if (href === langHref) {
                return lang;
            }
        }

        return '';
    }

    /**
     * Maybe switch to a new language.
     * @param event
     * @returns {boolean}
     */
    this.maybeSwitchLanguage = function maybeSwitchLanguage(event) {
        var link = null;
        if (!event.target.classList.contains('wpml-ls-link')) {
            link = event.target.parentElement;
        } else {
            link = event.target;
        }

        var href = link.getAttribute('href');
        var lang = self.getLanguageFromHref(href);

        if (!lang) {
            return true;
        }

        if (lang === self.getCurrentLanguage()) {
            return true;
        }

        self.storeLanguage(lang);
    }

    /**
     * Get Languages in the WPML Switcher.
     *
     * @returns {*}
     */
    this.getLanguagesInSwitcher = function getLanguagesInSwitcher() {
        // Collect language links.
        let languages_links = {};
        let languages = document.getElementsByClassName('wpml-ls-native');


        for (const language of languages) {
            let language_tag = language.getAttribute('lang');
            let language_href = language.parentElement.getAttribute('href');

            // Avada.
            if (!language_href) {
                language_href = language.parentElement.parentElement.getAttribute('href');
            }

            // We may need to modify the tag.
            if (language_tag) {
                if (language_tag.includes("-")) {
                    let parts = language_tag.split('-');
                    languages_links[language_tag] = parts[0];
                } else {
                    languages_links[language_tag] = language_href;
                }
            }
        }

        return languages_links;
    }

    /**
     * Set a Cookie
     *
     * @param cname
     * @param cvalue
     * @param exdays
     */
    this.setCookie = function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    /**
     * Get a Cookie.
     *
     * @param cname
     * @returns {string}
     */
    this.getCookie = function getCookie(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    /**
     * Get Current Language.
     *
     * @returns {string|string}
     */
    this.getCurrentLanguage = function getCurrentLanguage() {
        return this.getStoredLanguage();
    }

    this.start();

    return this;
}

window.simply_static_wpml = new WPML_Integration();