// ==UserScript==
// @name         Kahoot Hacks
// @namespace    http://tampermonkey.net/
// @version      0.0.4
// @description  Prototype Kahoot Hacks. Only works on challenges (ie. https://kahoot.io/challenge/*) with quiz/typing questions.
// @author       You
// @match        https://kahoot.it/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kahoot.it
// @downloadURL  https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/kh.user.js
// @updateURL    https://raw.githubusercontent.com/UtterDonkey/bh-gui/main/kh.user.js
// @grant        GM.xmlHttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// ==/UserScript==

(async function() {
    'use strict';
    if(ew Date().getUTCFullYear() !== 2024) {
        if(!GM_getValue('no-trial')) alert('The trial prototype period for Kahoot Hacks has ended. They are no longer active.');
        GM_setValue('no-trial', true);
        return;
    }
    await new Promise(resolve => {
        const interval = setInterval(() => {
            if(location.href.split('/').at(-2) === 'challenge') {
                clearInterval(interval);
                resolve();
            }
        });
    });


    const quizData = await new Promise(resolve => {
        async function getQuizData () {
            const quizId = location.href.split('/').pop();
            const request = await GM.xmlHttpRequest({url: `https://kahoot.it/rest/challenges/${quizId}?includeKahoot=true`});
            const quizData = JSON.parse(request.responseText);
            if(quizData.error) {
                setTimeout(getQuizData, 1000);
            } else {
                resolve(quizData);
            }
        }
        getQuizData();
    });
    unsafeWindow.quizData = quizData;
    const levenshteinDistance=(a,b)=>{if(!a.length)return b.length;if(!b.length)return a.length;const c=[];for(let d=0;d<=b.length;d++){c[d]=[d];for(let e=1;e<=a.length;e++)c[d][e]=0===d?e:Math.min(c[d-1][e]+1,c[d][e-1]+1,c[d-1][e-1]+(a[e-1]===b[d-1]?0:1))}return c[b.length][a.length]};
    function findQuestion(params) {
        const questions = quizData.kahoot.questions;
        const answers = [];
        const altAnswers = [];
        for(const q of questions) {
            let match = true;
            if(params.questionText && q.question !== params.questionText) match = false;
            if(params.imgSrc && !params.imgSrc.includes(q.imageMetadata?.id)) match = false;
            if(params.questionText && !match) {
                const closest = questions.toSorted((a, b) => levenshteinDistance(a.question, q)-levenshteinDistance(b.question, q));
                let matches = params.choices ? closest.filter(e =>JSON.stringify(e.choices.map(e =>e.answer).toSorted()) === JSON.stringify(params.choices.toSorted())) : closest;
                if(params.imgSrc && matches.find(e =>params.imgSrc.includes(e.imageMetadata?.id))) matches = matches.filter(e =>params.imgSrc.includes(e.imageMetadata?.id));
                if(matches.map(e => JSON.stringify(e)).includes(JSON.stringify(q))) altAnswers.push(q);

            }
            if(match) answers.push(q);
        }

        return answers.length < 1 ? altAnswers : answers;
    }

    function findAnswer(question) {
        const answers = [];
        if(question.choices) {
            for(const q of question.choices) {
                if(q.correct) answers.push(q);
            }
        }
        return answers;
    }

    function simulateTyping(textarea, text) {
        const event = new Event('input', {
            bubbles: true
        });
        textarea.dispatchEvent(event);
        const valueSetter = Object.getOwnPropertyDescriptor(textarea.__proto__, 'value').set;
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textarea), 'value').set;
        if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(textarea, text);
        } else {
            valueSetter.call(textarea, text);
        }
        textarea.dispatchEvent(new Event('change', {
            bubbles: true
        }));
    }


    setInterval(() =>{
        try{
            const questions = findQuestion({questionText: document.querySelector('span[class*=question-title__Title]').innerText, imgSrc: document.querySelector('[class*=question-base-image]')?.src, choices: document.querySelector('div[class*=question-choices__QuestionChoices]') ? Array.from(document.querySelectorAll('div[class*=question-choices__QuestionChoices] > *')).map(e =>e.innerText) : false});
            const answers = findAnswer(questions[0]);
            if(questions[0].type === 'open_ended') {
                const questions = findQuestion({questionText: document.querySelector('span[class*=question-title__Title]').innerText});
                const answers = findAnswer(questions[0]);
                simulateTyping(document.querySelector('[class*=AnswerInput]'), answers[0].answer);
                document.querySelector('[class*=SubmitButton]').click();
            } else if(questions[0].type === 'quiz') {

                Array.from(document.querySelectorAll('div[class*=question-choices__QuestionChoices] > *')).find(a => answers[0].answer === a.innerText).click()
            }
        }catch{}
        try{
            document.querySelector('[class*=next-button__Button]').click()
        }catch{}
        try{
            document.querySelector('[class*=scoreboard__Button] button').click()
        }catch{}
    })

})();
