// ==UserScript==
// @name         VPN
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=microsoft.com
// @downloadURL  https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/vpn.user.js
// @updateURL    https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/vpn.user.js
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    if(location.href.startsWith('https://data.pixelbulb.online/vpn')){
        const url = new URL(location.href).searchParams.get('url');
        setInterval(() =>{
            Array.from(document.querySelectorAll('*[href]')).forEach(e =>{
                if(e.getAttribute('href').startsWith('https://data.pixelbulb.online/vpn')) return;
                e.setAttribute('href', 'https://data.pixelbulb.online/vpn?url=' + encodeURIComponent(new URL(e.getAttribute('href'), url).href));
            });
            Array.from(document.querySelectorAll('*[src]')).forEach(e =>{
                if(e.getAttribute('src').startsWith('https://data.pixelbulb.online/vpn')) return;
                e.setAttribute('src', 'https://data.pixelbulb.online/vpn?url=' + encodeURIComponent(new URL(e.getAttribute('src'), url).href));
            });
        }, 100);
    }else if(document.referrer === 'https://data.pixelbulb.online/') {
        location.replace('https://data.pixelbulb.online/vpn?url=' + encodeURIComponent(location.href));
    }

})();
