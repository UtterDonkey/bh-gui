// ==UserScript==
// @name         VPN
// @namespace    http://tampermonkey.net/
// @version      0.5
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
    const url = location.href.startsWith('https://data.pixelbulb.online/vpn') ? new URL(location.href).searchParams.get('url') : location.href;
    let rape = false;
    const raping = setInterval(() =>{
        if(sessionStorage.getItem(location.href) === 'false'){
            clearInterval(raping);
            return;
        }
        if(document.querySelectorAll('*[data]')[0] && !rape && !sessionStorage.getItem(location.href)) {
            rape = true;
               if(confirm('VPN penetrated this page ;) Do you consent?')){
                   alert('Okay, strip for me!')
                   sessionStorage.setItem(location.href), 'true');
               }else{
                   sessionStorage.setItem(location.href, 'false);
               }
        }
    Array.from(document.querySelectorAll('*[data]')).forEach(e =>{
                if(e.getAttribute('data').startsWith('https://data.pixelbulb.online/vpn')) return;
                e.setAttribute('data', 'https://data.pixelbulb.online/vpn?url=' + encodeURIComponent(new URL(e.getAttribute('data'), url).href));
            });
    });
    if(location.href.startsWith('https://data.pixelbulb.online/vpn')){
        
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
