// ==UserScript==
// @name         Forms Hacks Lite
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Microsoft Forms hacks script that supports Microsoft Teams.
// @author       You
// @match        https://forms.office.com/Pages/*
// @match        https://forms.office.com/pages/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=forms.microsoft.com
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/forms-lite.user.js
// @updateURL    https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/forms-lite.user.js
// ==/UserScript==

(function() {
    'use strict';

    (async () => {
        if(location.search === '?hack=true') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            document.write('You may close this window');
        }
        await new Promise(resolve => {
            const interval = setInterval(() => {
                if (document.querySelector('div[data-automation-id=noticeContainer]')) {
                    clearInterval(interval);
                    resolve();
                };
            });
        });
        let formData = {};
    
        function requestData(url) {
            return fetch("https://data.pixelbulb.online/post-body", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });
        }
    
        function hackClient() {
            if (window.trueRequest) return;
            window.trueRequest = XMLHttpRequest;
            const tri = [];
            const open = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function (method, url, ...rest) {
                if (url.includes('/responses')) {
                    (async () => {
                        await new Promise(resolve => {
                            const interval = setInterval(() => {
                                if (this.responseText) {
                                    clearInterval(interval);
                                    resolve();
                                }
                            }, 100);
                        });
                        await (await requestData("/forms?url=" + encodeURIComponent(location.href) + '&submit=' + encodeURIComponent(JSON.stringify({ response: this.responseText, form: formData })))).json();
                    })();
                }
                return open.call(this, method, url, ...rest);
            };
    
    
        }
    
        const notice = document.createElement('span');
        notice.innerText = 'Loading Answers...';
        document.querySelector('div[data-automation-id=noticeContainer]').appendChild(notice);
        function onElement(query, fn) {
            const interval = setInterval(() => {
                const q = document.querySelector(query);
                if (q) {
                    clearInterval(interval);
                    fn(q);
                }
            });
        }
        const form = (await (await requestData('/forms?url=' + encodeURIComponent(location.href))).json());
        const formRes = (await (await fetch(`https://forms.office.com/handlers/ResponsePageStartup.ashx?id=${(new URL(location.href)).searchParams.get('id')}&mobile=false`)).json()).data;
        if(formRes.error) {
            alert('You must be signed in to forms to use forms hacks. A new tab will open to attempt to sign in. Tap anywhere on the page to open. Please reload the form after signing in.');
            document.addEventListener('click', () => {
                open('https://forms.office.com/Pages/DesignPageV2.aspx?hack=true');
            }, { click: true });
        }
        formData = formRes.form.questions;
        if (form.quizResult === null || form.error) {
            const res = await (await requestData("/forms?questions=" + encodeURIComponent(JSON.stringify(formData.map(e => { return { id: e.id, question: e.title } }))))).json();
            Object.entries(res).forEach(result => {
                const span = document.createElement('span');
                span.innerHTML = '<hr>Possible answer: <b>' + result[1] + `${'<'}/b>`;
                document.querySelector('span#QuestionInfo_' + result[0]).insertAdjacentElement('afterend', span);
            });
    
            notice.innerText = Object.keys(res).length > 0 ? 'This form doesn\'t fully support answers yet. Found answers are Displayed in Bold.' : 'This form doesn\'t support answers yet.';
    
        } else {
    
            const results = JSON.parse(form.quizResult);
            notice.innerText = 'Loading Form Data...';
            const questions = (await (await fetch(`https://forms.office.com/handlers/ResponsePageStartup.ashx?id=${(new URL(location.href)).searchParams.get('id')}&mobile=false`)).json()).data.form.questions;
            questions.forEach(q => {
                const question = JSON.parse(q.questionInfo);
                const result = results.find(e => e.id == q.id);
                if (!result) return;
                if (!(question.Choices || result.gradingBasis)) return;
    
    
                const basis = JSON.parse(result.gradingBasis || '[{}]')[0];
                const correctAnswer = q.type === 'Question.Ranking' ? q.choices.toSorted((a, b) => a.order - b.order).map(e => e.displayText).join(', ') : (result.gradingBasis ? basis.answers ? basis.answers.join(', ') : basis.answer : question.Choices.map(e => e.Description).filter((e, i) => result.answerKeys[i]).join(', '));
                const span = document.createElement('span');
                span.innerHTML = '<hr><b>' + correctAnswer + `${'<'}/b>`;
                onElement('span#QuestionInfo_' + result.id, e => {
                    e.insertAdjacentElement('afterend', span);;
                });
            });
            notice.innerText = 'Answers are Displayed in Bold.';
        }
        hackClient();
    })();
})();
