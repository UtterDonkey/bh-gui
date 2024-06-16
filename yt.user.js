// ==UserScript==
// @name         YouTube AdBlocker
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Block all YouTube ads with this simple script.
// @author       UtterDonkey
// @match        *://*.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @downloadURL  https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/yt.user.js
// @updateURL    https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/yt.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    function removePageAds() {

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
                    if (childElement?.data.targetId && childElement?.data.targetId !== "engagement-panel-macro-markers-description-chapters") {
                        //Skipping the Chapters section
                        element.style.display = 'none';
                    }
                });
            }
        });

    }
    let prevVolume = null;
    let prevSpeed = null;
    function getSponsors(subtitles) {
        // console.log(subtitles);
        let sponsors = [];
        let sponsor = false;
        let sponsorStart = null;
        const video = document.querySelector('video');
        const pathData = document.querySelector('path.ytp-heat-map-path')?.getAttribute?.('d');
        if (pathData) usedPath = true;
        const desc = getDesc();
        if (desc.length) usedDesc = true;
        function endPoint(start, single) {
            if (!pathData) return Infinity;
            function extractHeightsFromPath(d) {
                return d.split(/[\s,]+/).slice(3).filter((_, i) => i % 7 === 6 || i % 7 === 2 || i % 7 === 4).map(Number);
            }
            const yCoords = extractHeightsFromPath(pathData).map(n => 100 - n);
            const thisPos = Math.floor(start / video.duration * yCoords.length);
            let i = thisPos;
            while ((yCoords[i] < yCoords[i - 1] * 1.5) && i < yCoords.length) i++;
            return i * .9 / yCoords.length * video.duration;
        }

        function isEndChapter(start, lastStart) {
            for (const d of desc) {
                if (start > d && lastStart <= d) return true;
            }
            return false;
        }
        function check(iterations) {
            let lastStart = 0;
            for (const ev of subtitles.events) {
                if (!ev.segs) continue;

                const text = ev.segs.map(s => s.utf8).join(' ').toLowerCase().trim().replaceAll('  ', ' ').replaceAll('  ', ' ');
                if ((text.includes('sponsor') || text.includes('made possible by')) && !sponsor) {
                    sponsor = true;
                    sponsorStart = ev.tStartMs;
                }
                if (sponsor && ev.tStartMs - sponsorStart < 300_000 && ((iterations > 1 && ev.dDurationMs > 7000 && ev.segs.length === 1) || ((text.includes('get back to') || text.includes('now back to') || text.includes('s continue') || text.includes('let\'s start') || text.includes('s begin') || text.includes('s kick off') || text.includes('out of the way') || text.includes('let\'s get on')) && ((iterations > 0 && ev.tStartMs - sponsorStart < 100_000) || (iterations > 1 || ev.tStartMs - sponsorStart < 150_000))) || (iterations > 0 && (text.includes('the link') || text.includes('their link') || text.includes('our link')) || isEndChapter(ev.tStartMs / 1000, lastStart / 1000) || (iterations > 1 && video && pathData && ev.tStartMs > endPoint(sponsorStart / 1000) * 1000)))) {
                    sponsor = false;
                    if (ev.tStartMs - sponsorStart > 5000 && !sponsors.find(s => s[0] === sponsorStart)) sponsors.push([sponsorStart, (iterations > 1 && video && pathData && ev.tStartMs > endPoint(sponsorStart / 1000) * 1000) ? lastStart : (ev.tStartMs + ((isNaN(ev.dDurationMs) || ev.dDurationMs > 7000) ? 0 : ev.dDurationMs))]);
                }
                if (ev.tStartMs) lastStart = ev.tStartMs;
            }
        }
        check();
        if (sponsor) check(1);
        if (sponsor) check(2);
        // console.log(sponsors);

        return sponsors;
    }

    let sponsors = null;
    let sponsorTime = null;
    let lastId = null;
    let usedPath = false;
    let usedDesc = false;

    function getDesc() {
        try {
            return Array.from(document.querySelectorAll('.yt-core-attributed-string__link')).map(a => a.href && a.href.startsWith('https://') && new URL(a.href).searchParams.get('t')).filter(a => a?.endsWith?.('s')).map(a => +a.slice(0, -1));
        } catch {
            return [];
        }
    }



    window.trueRequest = XMLHttpRequest;
    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        if (url.includes('timedtext')) {
            (async () => {
                await new Promise(resolve => {
                    const interval = setInterval(() => {
                        if (this.responseText) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 100);
                });
                sponsors = getSponsors(JSON.parse(this.responseText));
                sponsorTime = Date.now();
            })();
        }
        return open.call(this, method, url, ...rest);
    };
    let skipSpeed = 2.5;
    setInterval(() => {
        try {
            const ad = document.querySelector('div.ad-showing')?.querySelector?.('video');
            if (ad.playbackRate < 10) {
                if (!ad.paused) {
                    skipSpeed = Math.min(skipSpeed + 0.25, 10);
                    prevSpeed = ad.playbackRate;
                    prevVolume = ad.volume;
                    ad.playbackRate = skipSpeed;
                    ad.volume = 0;
                }
            } else if (ad.playbackRate > 2) {
                ad.playbackRate = prevSpeed ?? 1;
                ad.volume = prevVolume ?? 1;
            }

        } catch { }
        try {
            if (document.querySelector('div.ad-showing')) document.querySelector('button.ytp-skip-ad-button').click();
        } catch { }

    });
    setInterval(() => {
        try {
            removePageAds();
        } catch { }
        const id = new URL(location.href).searchParams.get('v');
        const video = document.querySelector('video.html5-main-video');
        const pathData = document.querySelector('path.ytp-heat-map-path')?.getAttribute?.('d');
        const desc = getDesc();

        if (((pathData && !usedPath) || (id && lastId !== id) || (desc.length && !usedDesc)) && video && !(video.paused && video.currentTime === 0)) {

            if ((id && lastId !== id)) {
                usedPath = false;
                usedDesc = false;
            }

            lastId = id;
            setTimeout(async () => {
                if (Date.now() - sponsorTime > 10000) {
                    try {
                        document.querySelector('.ytp-caption-window-container').style.display = 'none';
                        document.querySelector('.ytp-subtitles-button').click();

                        await new Promise(resolve => {
                            const interval = setInterval(() => {
                                if (Date.now() - sponsorTime < 10000) {
                                    clearInterval(interval);
                                    resolve();
                                }
                            });
                        });
                        document.querySelector('.ytp-subtitles-button').click();
                        document.querySelector('.ytp-caption-window-container').style.display = '';
                    } catch { }
                }
            }, 5000);
        }
        if (!sponsors) return;

        if (video) {
            const timeMs = video.currentTime * 1000;
            let sponsor = false;
            for (const s of sponsors) {
                if (timeMs > s[0] && timeMs < s[1] && (s[1] > 30_000 || usedPath)) {
                    sponsor = true;
                    if (document.querySelector('.skip-sponsor')) {
                        document.querySelector('.skip-sponsor').onclick = () => {
                            video.currentTime = s[1] / 1000;
                        }
                    } else {
                        document.querySelector('.html5-video-player').insertAdjacentHTML('beforeend', '<button class="ytp-skip-ad-button skip-sponsor" id="skip-button:3" style="translate: 0 -10px;"><div class="ytp-skip-ad-button__text">Skip Sponsor</div><span class="ytp-skip-ad-button__icon"><svg height="100%" viewBox="-6 -6 36 36" width="100%"><path d="M5,18l10-6L5,6V18L5,18z M19,6h-2v12h2V6z" fill="#fff"></path></svg></span></button>');
                    }
                }
            }
            if (!sponsor && document.querySelector('.skip-sponsor')) {
                document.querySelector('.skip-sponsor').remove();
            }
        }
    }, 100);
})();
