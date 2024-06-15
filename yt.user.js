// ==UserScript==
// @name         YouTube AdBlocker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Block all YouTube ads with this simple script.
// @author       UtterDonkey
// @match        *://*.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @downloadURL  https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/yt.user.js
// @updateURL    https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/yt.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function removePageAds(){

        const sponsor = document.querySelectorAll("div#player-ads.style-scope.ytd-watch-flexy, div#panels.style-scope.ytd-watch-flexy");
        const style = document.createElement('style');

        style.textContent = `
            ytd-action-companion-ad-renderer,
            ytd-display-ad-renderer,
            ytd-video-masthead-ad-advertiser-info-renderer,
            ytd-video-masthead-ad-primary-video-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-ad-slot-renderer,
            yt-about-this-ad-renderer,
            yt-mealbar-promo-renderer,
            ytd-statement-banner-renderer,
            ytd-ad-slot-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-banner-promo-renderer-background
            statement-banner-style-type-compact,
            .ytd-video-masthead-ad-v3-renderer,
            div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint,
            div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer,
            div#main-container.style-scope.ytd-promoted-video-renderer,
            div#player-ads.style-scope.ytd-watch-flexy,
            ad-slot-renderer,
            ytm-promoted-sparkles-web-renderer,
            masthead-ad,
            tp-yt-iron-overlay-backdrop,

            #masthead-ad {
                display: none !important;
            }
        `;

        document.head.appendChild(style);

        sponsor?.forEach((element) => {
            if (element.getAttribute("id") === "rendering-content") {
                element.childNodes?.forEach((childElement) => {
                    if (childElement?.data.targetId && childElement?.data.targetId !=="engagement-panel-macro-markers-description-chapters"){
                        //Skipping the Chapters section
                        element.style.display = 'none';
                    }
                });
            }
        });

    }
    let prevVolume = null;
    let prevSpeed = null;
    setInterval(() => {
        try {
            if(document.querySelector('div.ad-showing') && document.querySelector('div.ad-showing').querySelector('video').playbackRate < 10) {
                prevSpeed = document.querySelector('div.ad-showing').querySelector('video').playbackRate;
                prevVolume = document.querySelector('div.ad-showing').querySelector('video').volume;
                document.querySelector('div.ad-showing').querySelector('video').playbackRate = 10;
                document.querySelector('div.ad-showing').querySelector('video').volume = 0;
            } else if (document.querySelector('div.ad-showing').querySelector('video').playbackRate >= 10) {
                document.querySelector('div.ad-showing').querySelector('video').playbackRate = prevSpeed ?? 1;
                document.querySelector('div.ad-showing').querySelector('video').volume = prevVolume ?? 1;
            }

        }catch {}
        try {
            document.querySelector('button.ytp-skip-ad-button').click();
        }catch {}

    });
    setInterval(() => {
        try {
            removePageAds();
        }catch {}
    }, 100);
})();
