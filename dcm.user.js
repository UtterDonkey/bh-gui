// ==UserScript==
// @name         Digital Cinema Media Intro
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://*/*
// @match        http://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=www.dcm.co.uk
// @downloadURL  https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/dcm.user.js
// @updateURL    https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/dcm.user.js
// @grant        GM.xmlHttpRequest
// @connect      data.pixelbulb.online
// @run-at       document-start
// ==/UserScript==

(async function() {
    'use strict';
    const genID = _ => (Math.round(Math.random() * 10e16) + '' + Math.round(Math.random() * 10e16)).replaceAll('.', '');
    const blob = GM.xmlHttpRequest({ url: 'https://data.pixelbulb.online/cinema.mp4', responseType: 'blob' }).then(xml => xml.response);
    const instanceID = genID();
    const runElements = new WeakSet();
    function assignAttribute(element, key, value) {
        if(element.getAttribute(key) === value) return;
        value === null ? element.removeAttribute(key) : element.setAttribute(key, value);
    }
    function cinema(video) {
        if(runElements.has(video.parentElement)) return;

        const source = document.createElement('source');
        async function URIReady() {
            source.src = URL.createObjectURL(await blob);
        }

        video.addEventListener('play', async () => {
            if(runElements.has(video.parentElement) || video.muted) return;
            video.muted = true;
            video.style.opacity = '0';
            await new Promise(resolve => {
                const interval = setInterval(() => {
                    if(!video.paused && video.currentTime > 0) {
                        resolve();
                        clearInterval(interval);
                    }
                }, 100);
            });
            video.style.opacity = '1';
            video.pause();
            runElements.add(video.parentElement);
            video.muted = false;
            const playDisable = new AbortController();
            video.addEventListener('play', () => {
                video.pause();
                if(typeof targetVideo !== 'undefined') targetVideo.play();
            }, { signal: playDisable.signal });
            const playDisableInterval = setInterval(() => {
                if(!video.paused) video.pause();
            });

            const controls = video.getAttribute('controls');
            const autoplay = video.getAttribute('autoplay');
            const volume = video.volume;
            const src = video.getAttribute('src') ?? video.querySelector('source')?.src ?? '';
            const rawSrc = video.getAttribute('src');
            let styleHeight = video.style.height;
            let styleWidth = video.style.width;
            const styleDisplay = video.style.display;
            const clientHeight = video.clientHeight;
            const clientWidth = video.clientWidth;
            video.style.setProperty('height', `${clientHeight}px`, 'important');
            video.style.setProperty('width', `${clientWidth}px`, 'important');
            const observer = new MutationObserver(records => {
                if(typeof targetVideo === 'undefined') return;
                for(const record of records) {
                    if(record.attributeName === 'style') {
                        styleHeight = video.style.height;
                        styleWidth = video.style.width;
                        if(src.startsWith('blob:')) {
                            Object.keys(video.style).forEach(key => {
                                if(key === 'display') return;
                                targetVideo.style.setProperty(key, video.style[key], 'important');
                            })

                        }
                    }
                }
            });

            observer.observe(video, { attributes: true });
            video.removeAttribute('controls');

            await URIReady();
            if(!src.startsWith('blob:')) {
                clearInterval(playDisableInterval);
                playDisable.abort();
            }
            let invisInterval;
            const targetVideo = src.startsWith('blob:') ? (() => {
                const cloned = video.cloneNode(true);
                cloned.id = instanceID;
                video.style.setProperty('display', 'none', 'important');
                invisInterval = setInterval(() => {
                    video.style.setProperty('display', 'none', 'important');
                });
                video.insertAdjacentElement('afterend', cloned);
                return cloned;
            })() : video;


            targetVideo.style.setProperty('display', styleDisplay ? styleDisplay.split(' ')[0] : 'block', 'important');
            const videoUpdate = setInterval(() => {
                if(!document.contains(video) && document.contains(targetVideo)) video = targetVideo.previousElementSibling
            });

            const clickToPlay = new AbortController();
            targetVideo.addEventListener('click', () => {
                targetVideo.play();
            }, { signal: clickToPlay.signal });
            targetVideo.addEventListener('play', () => {
                video.dispatchEvent(new Event('play'));
                video.dispatchEvent(new Event('playing'));
            }, { signal: clickToPlay.signal, once: true });
            video.dispatchEvent(new Event('play'));
            video.dispatchEvent(new Event('playing'));
            targetVideo.setAttribute('autoplay', '');
            targetVideo.removeAttribute('src');
            targetVideo.volume = 1;
            targetVideo.insertAdjacentElement('afterbegin', source);
            targetVideo.load();

            targetVideo.addEventListener('ended', () => {
                source.remove();
                if(!src.startsWith('blob:')) video.load();
                observer.disconnect();
                playDisable.abort();
                clickToPlay.abort();
                clearInterval(playDisableInterval);
                clearInterval(invisInterval);
                clearInterval(videoUpdate);

                video.volume = volume;
                assignAttribute(video, 'controls', controls)
                assignAttribute(video, 'autoplay', autoplay);
                assignAttribute(video, 'src', rawSrc);
                if(src.startsWith('blob:')) {
                    video.style.display = styleDisplay;
                    targetVideo.remove();
                    const interval = setInterval(() => {
                        if(video.paused) video.play();
                        else clearInterval(interval);
                    });
                } else video.addEventListener('canplay', () => {
                    video.style.height = styleHeight;
                    video.style.width = styleWidth;

                    video.play();
                }, { once: true });
            }, { once: true });

        }, { once: true, passive: true });
    }

    const observerOptions = {
        childList: true,
        subtree: true,
    };

    const observer = new MutationObserver(records => {
        for (const record of records) {
            for (const addedNode of record.addedNodes) {
                if(addedNode.tagName === 'VIDEO' && addedNode.id !== instanceID) cinema(addedNode);
                (addedNode?.querySelectorAll?.('video') ?? []).forEach(addedNode => {
                    if(addedNode.id !== instanceID) cinema(addedNode);
                });

            }
        }
    });
    observer.observe(document, observerOptions);

})();
