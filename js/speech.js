"use strict";

var SR = (function(){
    var commonWords = ['it', 'the', 'is', 'a', 'are', 'as', 'but'];
    var grouped_words, words = '';
    var currentWordId = 0;
    var sectionHTML;
    var pieces = 1;
    var recognition;
    var srRunning = false;
    var srPause = false;
    
    var createWordId = function createWordId(word) {
        var match = word.match(/[a-zA-Z]+/g);
    
        if (match) {
            return match.join('-').toLowerCase();
        }
    };
    
    var wordClickHandler = function wordClickHandler() {
        document.querySelectorAll('.word').forEach(function (word) {
            word.addEventListener('click', function (e) {
                document.getElementById('teleprompter000').innerHTML = sectionHTML;
                scrollToWordId(e.target.dataset.id, true);
                wordClickHandler();
            });
        });
    };
    
    var scrollToWordId = function scrollToWordId(id) {
        scrollTo(document.querySelectorAll("span[data-id=\"".concat(id, "\"]"))[0], true);
    };
    
    var scrollTo = function scrollTo(element) {
        var wordWasClicked = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    
        if (element) {
            // Don't Scroll if the word is too far away
            if (!wordWasClicked && element.dataset.id > parseInt(currentWordId) + 5) return;
            currentWordId = element.dataset.id;
            var y = element.getBoundingClientRect().top + window.scrollY;
            //console.log(element.offsetTop);
            //console.log(document.getElementsByTagName('article')[0].scrollTop);
            window.scroll({
                top: y - window.innerHeight / 3,
                behavior: 'smooth'
            });
            element.setAttribute('id', '');
            var unspokenWords = document.querySelectorAll('section span:not(.highlighted)');
    
            for (var x = 0; x < unspokenWords.length; x++) {
                var span = unspokenWords[x];
    
                if (parseInt(span.dataset.id) < parseInt(currentWordId)) {
                    if (!span.className.includes('highlighted')) {
                        span.classList.add('highlighted');
                        span.setAttribute('id', '');
                    }
                } else {
                    break;
                }
            }
    
            element.classList.add('highlighted');
        }
    };

    var scrollToOnly = function scrollToOnly(element) {
        if (element) {
            var y = element.getBoundingClientRect().top + window.scrollY;
            window.scroll({
                top: y - window.innerHeight / 3,
                behavior: 'smooth'
            });
        }
    }
    
    var startSR = function startSR() {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Your browser does not support Speech Recognition. Please use Google Chrome on a PC or laptop.');
            return;
        }
    
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
    
        recognition.onend = function () {
            try {
                if (srRunning) {
                    recognition.start();
                }
            } catch (error) {
            }
        };
    
        recognition.onresult = function (event) {
            if (!srPause) {
                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    var progress = event.results[i][0].transcript.split(' ');
                    var phrase = progress.splice(progress.length - pieces, progress.length);
                    phrase = phrase.join('-').toLowerCase();
                    //console.log(phrase);
                    if (phrase.length > 2 && !commonWords.includes(phrase)) {
                        scrollTo(document.getElementById(phrase));
                    }
                }
            }
        };
        srRunning = true;
        init();
        recognition.start();
    };
    
    var stopSR = function stopSR() {
        if (srRunning) {
            srRunning = false;
            recognition.stop();
        }
    }
    
    var init = function init() {
        currentWordId = 0;
        words = document.getElementById('teleprompter000').innerText;
        document.getElementById('teleprompter000').innerHTML = '';
        grouped_words = [];
        if (words.length == 0) {
            words = localStorage.getItem("words");
        }
        words = words || "This voice activated teleprompter listens to your voice and scrolls automatically when you press play. It's free and works in Chrome broswer in Windows, Mac, and Android. It makes recording your scripts fast, easy, and fun! HOW TO USE: After reading these instructions, delete them and copy/paste your own script into this window, or use the open file button to load a text document. Once your script is ready, press the play button to start teleprompting. INSTRUCTIONS: If you ever need to read these instructions again, save the script you're working on and press the 'New Document' icon above. FEATURES: When using a teleprompter, you can mirror flip your text horizontally and vertically using the buttons above. To deactivate voice scrolling and use normal scrolling, click the 'Exit' icon in the middle. When the script is listening for your voice, the timer will start counting. Click the 'Pause' button if you need to pause it. The 'Rewind' button will restart your script from the start, allowing you to rerecord it. TIPS: This default script will allow you to practice your teleprompter simply by pressing play. SPONSOR: And now a special message from our sponsors--us! A lot of you have been asking how I make videos. Right now, I’m standing in front of a chromakey backdrop. By combining this with a teleprompter, I’m able to script all my lines in advance, adding the visuals during post processing. A teleprompter is a beamsplitter mirror that displays my script in front of a camera. Using a teleprompter allows me to thoroughly research detailed scripts in advance and deliver them effortlessly. The magic is in the transparent mirror, which provides tint-free visibility for my camera to record through. Because my notes are in front of the camera lens, I can keep direct eye contact with you. Hi, I'm Krista, videographer, actress, and everything else I want to be when using a teleprompter! I made this software to help you deliver your message quickly and confidently on camera. BUILDING A TELEPROMPTER? Check our our website TeleprompterMirror.com, we provide all the details for off-the-shelf parts you'll need to make a professional teleprompter. TROUBLESHOOTING: If your voice isn't being recognized, try opening a new window in your Chrome browser. As it works using Google Voice API, you'll find that it doesn't work in other browsers such as Safari, Edge, or Firefox. It works on Windows, Mac, and Android devices when using Chrome. If you're recording using an android device and hearing distracting beeping sounds when talking, simply mute your phone or tablet.";
        localStorage.setItem("words", words);
        words = words.replace(/\s/g, ' ');
        words = words.replace(/\n/g, ' <br/> ');
        var split = words.split(' ');
        var phrase = [];
    
        for (var i = 0; i < split.length; i++) {
            if (phrase.length != pieces && split[i]) {
                phrase.push(split[i]);
            }
    
            if (phrase.length === pieces) {
                grouped_words.push(phrase);
                phrase = [];
            }
    
            if (i === split.length - 1) {
                grouped_words.push(phrase);
            }
        }
    
        var html = [];
        var iterator = 1;
        grouped_words.forEach(function (group) {
            if (group[0] && !group[0].includes("<br/>")) {
                var id = createWordId(group[0]);
                html.push("<span data-id=".concat(iterator, " id=\"").concat(id, "\" class=\"word\">").concat(group.join(' '), "</span>"));
            } else {
                html.push('<br />');
            }
            iterator++;
        });
        sectionHTML = html.join(' ');
        document.getElementById('teleprompter000').innerHTML = sectionHTML;
        scrollToOnly(document.querySelectorAll('section span:nth-child(1)')[0]);
        wordClickHandler();
    };
    var reset = function reset() {
        srPause = false;
        words = "";
        localStorage.setItem("words", words);
        document.getElementById('teleprompter000').innerHTML = words;
        init();
    };
    var pause = function pause() {
        srPause = !srPause;
    };
    
    init();
    return { start:startSR, stop:stopSR, reset:reset, pause:pause, restart:init };
})();
