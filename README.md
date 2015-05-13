# Webbing
A template to package web apps for Firefox OS.

## Goals
There a tons of well-written mobile web apps that would work wonderfully as Firefox OS apps. However, having an app that just loads a mobile site poses some issues. 

* Users can navigate off of your domain, making it hard or impossible for the user to get back to your site.
* Initial loading of the site can take a while, leaving the user with a blank screen.
* The app experience can be confusing when the user's device is not connected to the internet.

Webbing solves those issues by providing the following features:

* A footer with back navigation can appear over your site when the user navigates off-domain, allowing them to return to your app.
* A modern splash screen is shown with a nice animation while the user waits for the inital load of your app.
* The user will be shown a "No Network Connection" message when they are not connected to the internet.
* Localization is already integrated using Mozilla's L20n.js. Instructions on using it can be found [here](https://github.com/l20n/l20n.js).

## Configuration

### Setting You App URL
By default, the app will load [yahoo.com](https://www.yahoo.com). To change this to your app's URL, simply change the value of ```core_site_url``` in ```locales/app.en-US.properties``` and ```locales/app.es.properties``` to be the URL of your site.

### Changing the Look
Yahoo's theme may be purple, but yours probably isn't. To change how webbing looks, simply edit ```css/style.css```, or add another stylesheet that overrides the styles set in ```css/style.css```. Finding the right property to change shouldn't be too bad, but here are some common ones:

* To change the splash screen color, edit the ```background-color``` property of ```#spinner```.
* To change the footer color, edit the ```background-color``` property of ```#footer```.
* To change the footer text color, edit the ```color``` property of ```#footer span```.

And don't forget to swap out Yahoo's icons in ```img/``` to your own.

### Changing the Behavior
If you're javascript-saavy, altering the behavior of webbing should be pretty simple. Simply poke around ```js/script.js``` and tweak things to your liking.

#### Changing When the Footer Appears
A common thing that you might want to change is when the footer appears, so we broke out that configuration into a file called ```webbing.json```. Here, you can specify the patterns of the URL's where you'd like the footer to show or hide. Patterns are given as regular expressions. Here's the rundown of all the possible values in your config.

```javascript
{
    // Describes the configuration for the footer that contains a back button.
    "footer": {
        // A list of URL patterns that describe pages you DON'T want the footer to appear on. You can use {APP_URL} to
        // specify the app url for the current locale. Note: If the current url does not match a pattern listed in this 
        // blacklist, the footer WILL be shown.
        "blacklist": ["^{APP_URL}.*$"],

        // A list of URL patters that describe pages you always DO want the footer to appear on. These will take
        // precedence over the patterns specified in "blacklist". You can use {APP_URL} to specify the app url for the 
        // current locale.
        "whitelist": []
    },
    // Describes properties relating to the loading screen that shows when your app is launching
    "loading_indicator": {
        // The maximum time the loading screen will show (in milliseconds). If you don't set this property, then the 
        // loading screen will be dismissed when the page is fully loaded. You can set this if you want to hide
        // the loading screen after a specified time, even if the page hasn't finished loaded yet.
        // IMPORTANT: Due to the amount of work being done while the app is loading, this interval may not be accurate.
        // On most sites variances should be small (~250ms), but could be up to 1000ms when loading complicated websites.
        "max_load_time": 2000
    }
}
```
**Important**: Because these patterns are strings, don't forget to escape backslashes. For example, if you wanted to blacklist ```http://mysite.com```, you would write the pattern as ```http://mysite\\.com```.

The default ```webbing.json``` file will hide the footer on any URL in your app's domain, and show it whenever your user navigate's off-domain.


### Credits
This template was inspired by the work of the Harald Kirschner and Louis Stowasser
* Project Code: https://github.com/louisstow/splashpack

L20n
* Project Code: https://github.com/l20n/l20n.js
* Copyright (c) 2012, Mozilla Foundation
* License: https://github.com/l20n/l20n.js/blob/master/LICENSE

spin.js
* Project Code: https://github.com/fgnass/spin.js
* Copyright (c) 2011-2014 Felix Gnass
* License: https://github.com/fgnass/spin.js/blob/master/LICENSE.txt
