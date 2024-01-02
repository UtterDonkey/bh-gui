// ==UserScript==
// @name         Cheeky Wee Blooket Hacks - Helper
// @namespace    http://tampermonkey.net/
// @version      0.0.3
// @author       Pixelbulb
// @description  This script provides the Blooket Hacks TamperMonkey script with extra features.
// @match        https://*.blooket.com/*
// @match        https://pixelbulb.online/bh-*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=blooket.com
// @downloadURL  https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/helper.user.js
// @updateURL    https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/helper.user.js
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        unsafeWindow
// ==/UserScript==
unsafeWindow.tampermonkeyHelperInstalled = true;
unsafeWindow.GM_setValue = (...d) => GM_setValue(...d);
unsafeWindow.GM_getValue = (...d) => GM_getValue(...d);
unsafeWindow.GM_deleteValue = (...d) => GM_deleteValue(...d);

