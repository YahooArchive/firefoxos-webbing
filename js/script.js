(function app() {
    'use strict';

    // ==========================================================
    // Vars
    // ==========================================================

    var _browser;
    var _footer;
    var _noConnection;
    var _spinner;
    var _url;
    var _config;
    var _loadingTimer;

    var APP_URL;
    
    
    // ==========================================================
    // Events
    // ==========================================================

    window.addEventListener('load', init);
    function init() {
        retrieveElements();
        addListeners();
        onConnectionStatusChange();
    }

    /**
     * Occurs when the online connectivity status of the device has changed.
     */
    function onConnectionStatusChange() {
        if (navigator.onLine) {
            showNoConnection(false);
            showBrowser(true);
            determineFooterVisibility();
        } else {
            showBrowser(false);
            showFooter(false);
            showSpinner(false);
            showNoConnection(true);
        }
    }

    /**
     * Occurs when the URL of the browser element has changed.
     */
    function onUrlChange(event) {
        _url = event.detail;
        determineFooterVisibility();
    }

    /**
     * Occurs when the back button in the footer is clicked.
     */
    function onBackClick(e) {
        e.preventDefault();
        _browser.src = APP_URL;
    }

    /**
     * Occurs when the browser has finished loading the current page
     */
    function onPageLoad(e) {
        // If we have loaded the original 
        if (_url) {
            showSpinner(false);
            showBrowser(true);
            clearInterval(_loadingTimer);
        }
    }

    /**
     * Occurs when the webbing.json config file has been loaded.
     */
    function onConfigLoaded() {
        if (this.readyState === 4 && this.status === 200) {
            _config = JSON.parse(this.response);

            // Setup loading timeout
            if (_config.loading_indicator && _config.loading_indicator.max_load_time) {
                var maxLoadTime = parseInt(_config.loading_indicator.max_load_time);

                // Note: This is a hack. setTimeout() was very, very inaccurate while the app was loading.
                // (e.g. a 2000ms timer might take 3500ms to fire). I'm assuming that it's because a lot of
                // work is being done to render the page, so timeouts lose accuracy. The solution is to poll
                // every 100ms and keep track of how much time passed. These intervals are also very inaccurate,
                // but tend to produce an overall result that is much closer to the expected time. However,
                // that means we can only every guarantee accuracy to 100ms, but that should be sufficient.
                var lastTime = new Date().getTime();
                var totalTime = 0;
                _loadingTimer = setInterval(function() {
                    var currentTime = new Date().getTime();
                    totalTime +=  currentTime - lastTime;
                    lastTime = new Date().getTime();
                    if (totalTime >= maxLoadTime) {
                        onLoadingTimeoutReached();
                        clearInterval(_loadingTimer);
                    }
                }, 100);
            }
        } else {
            onConfigLoadError.call(this);
        }
    }

    /**
     * Occurs when there is an error loading the webbing.json config file.
     */
    function onConfigLoadError() {
        console.error(this.status.text);
    }

    /**
     * Occurs when the page has been localized.
     */
    function onLocalizationReady() {
        APP_URL = document.l10n.getSync('appUrl');

        if (isBrowserApiAvailable()) {
            _browser.src = APP_URL;
        } else {
            window.location.href = APP_URL;
        }

        if (!navigator.onLine) {
            showBrowser(false);
            showFooter(false);
            showSpinner(false);
            showNoConnection(true);
        }
    }

    /**
     * Occurs when we've reached the maximum allowable time to show the loading indicator.
     */
    function onLoadingTimeoutReached() {
        showSpinner(false);
        showBrowser(true);
    }


    // ==========================================================
    // Helpers
    // ==========================================================

    function retrieveElements() {
        _browser = document.getElementById('browser');
        _footer = document.getElementById('footer');
        _noConnection = document.getElementById('no-connection');
        _spinner = document.getElementById('spinner');
        new Spinner({
            'color': '#fff', 
            'lines': 18,
            'radius': 40,
            'length': 15,
            'speed': 0.8,
            'trail': 40
        }).spin(_spinner);
    }

    function addListeners() {
        _browser.addEventListener('mozbrowserlocationchange', onUrlChange);
        _browser.addEventListener('mozbrowserloadend', onPageLoad);
        window.addEventListener('online', onConnectionStatusChange);
        window.addEventListener('offline', onConnectionStatusChange);
        document.getElementById('back-btn').addEventListener('click', onBackClick);
        document.getElementById('back-txt').addEventListener('click', onBackClick);
        document.l10n.ready(onLocalizationReady);

        // Send request to get webbing.json
        var configRequest = new XMLHttpRequest();
        configRequest.addEventListener('load', onConfigLoaded);
        configRequest.addEventListener('error', onConfigLoadError);
        configRequest.open('get', './webbing.json', true);
        configRequest.overrideMimeType('application/json');
        configRequest.send();
    }

    function determineFooterVisibility() {
        if (_url && _config && _config.footer) {
            var whitelist = _config.footer.whitelist;
            var blacklist = _config.footer.blacklist;

            var shouldShow = true;

            // Apply blacklist
            if (blacklist.constructor === Array) {
                for (var i = 0; i < blacklist.length; i++) {
                    var regex = getRegexFromPattern(blacklist[i]);
                    if (regex.test(_url)) {
                        shouldShow = false;
                        break;
                    }
                }
            }

            // Apply whitelist
            if (whitelist.constructor === Array) {
                for (var i = 0; i < whitelist.length; i++) {
                    var regex = getRegexFromPattern(whitelist[i]);
                    if (regex.test(_url)) {
                        shouldShow = true;
                        break;
                    }
                }
            }

            showFooter(shouldShow);
        }
    }

    function isBrowserApiAvailable() {
        if (typeof(_browser.goBack) === 'function') {
            return true;
        }
        return false;
    }

    function getRegexFromPattern(rawString) {
        var regexUrl = APP_URL.replace(/\./g, '\\.');
        regexUrl = regexUrl.replace(/\?/g, '\\?');
        rawString = rawString.replace(/({APP_URL})/g, regexUrl);
        return new RegExp(rawString);
    }

    function showNoConnection(show) {
        if (show) {
            _noConnection.classList.remove('hidden');
        } else {
            _noConnection.classList.add('hidden');
        }
    }

    function showFooter(show) {
        if (show) {
            _footer.classList.remove('hidden');
        } else {
            _footer.classList.add('hidden');
        }
    }

    function showBrowser(show) {
        if (show) {
            if (_browser.classList.contains('hidden')) {
                _browser.classList.remove('hidden');
            }
        } else {
            _browser.classList.add('hidden');
        }
    }

    function showSpinner(show) {
        if (show) {
            _spinner.classList.remove('hidden');
        } else {
            // Only animate if we're currently visible
            if (!_spinner.classList.contains('hidden')) {
                _spinner.classList.add('fadeout');

                // When it's done fading, get rid of the fading class and hide the spinner
                _spinner.addEventListener('animationend', function animationEnd () {
                    _spinner.classList.remove('fadeout');
                    _spinner.classList.add('hidden');
                    _spinner.removeEventListener('animationend', animationEnd);
                });
            }
        }
    }
})();