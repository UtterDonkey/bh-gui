// ==UserScript==
// @name         Shitty School Internet Fix
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @author       Pixelbulb
// @description  Attempts to fix some of the shitty school internet problems.
// @match        *://*/*
// @match        *://*
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://www.fife.gov.uk/
// @downloadURL  https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/fix.user.js
// @updateURL    https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/fix.user.js
// @grant        none
// ==/UserScript==
const observer = new MutationObserver(mutations =>{
    for(const mutation of mutations) {
        for(const element of mutation.addedNodes) {
            let tries = 0;
            element.addEventListener('error', () => {
                console.log(tries)
                tries++;
                if(tries > 3) return;
                element.setAttribute('src', element.getAttribute('src'))
            })
        }
    }
});
observer.observe(document.body,  { childList: true, subtree: true });
document.querySelectorAll('*[src]').forEach(e =>e.setAttribute('src', e.getAttribute('src')));
