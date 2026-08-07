/* ═══════════════════════════════════════════════════════
   MIKE AI — Gentle, Soft & Intelligent Voice Assistant
   Capabilities:
   1. Indian English Accent (en-IN) Voice Selector
   2. Dynamic Site Knowledge Engine (Role, Location, Education, Projects, Skills, Achievements)
   3. Zero 403 Console Error Web Search Engine
   4. Continuous Hands-Free Auto-Listening Mode
   5. Draggable Floating Orb & Responsive Popup Modal
   ═══════════════════════════════════════════════════════ */

const MikeAI = (() => {
    let userName = 'Commander';
    let isMuted = false;
    let isListening = false;
    let recognition = null;
    let isSpeaking = false;
    let autoListenTimer = null;

    // DOM Elements
    let orbBtn, modalContainer, statusBadge, micBtn, muteBtn, stopBtn, closeBtn, speechBubble, canvas, ctx;
    let animFrame = null;
    let waveOffset = 0;

    // Dragging state for floating orb
    let isDragging = false;
    let dragStartX, dragStartY;
    let hasMoved = false;

    // Developer Jokes Data
    const devJokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "There are 10 types of people in the world: those who understand binary, and those who don't.",
        "A SQL query walks into a bar, walks up to two tables and asks: Can I join you?",
        "Why did the developer quit his job? Because he didn't get arrays!",
        "Hardware: The part of a computer that you can kick. Software: The part you can only curse at.",
        "Why do Java developers wear glasses? Because they don't C sharp!",
        "An optimist says the glass is half full. A pessimist says the glass is half empty. A programmer says the glass is twice as large as it needs to be."
    ];
    let lastJokeIndex = -1;

    // Detailed Site Knowledge Base
    const siteKnowledge = {
        role: "Abdulrauf is a Full-Stack Web Developer and Django Backend Specialist specializing in Python, PostgreSQL, and modern web applications.",
        location: "Abdulrauf lives in Mahesana, Gujarat, India.",
        college: "Abdulrauf is pursuing his B.Tech in Information & Communication Technology at Vishwakarma Government Engineering College (VGEC), Ahmedabad.",
        education: "Abdulrauf achieved an 8.39 CGPA in his B.Tech ICT at VGEC Ahmedabad. He also scored 81.07% in HSC (Science) and 83.83% in SSC.",
        btech: "Abdulrauf is pursuing B.Tech in ICT at Vishwakarma Government Engineering College (VGEC), Ahmedabad from 2023 to 2027 with a stellar CGPA of 8.39.",
        hsc: "Abdulrauf completed HSC Class 12 Science from Shree J.M. Chaudhry Sarvajanik Vidhyalay with 81.07%, ranking 7th in the entire school under GSEB Board.",
        ssc: "Abdulrauf completed SSC Class 10 from Shree J.M. Chaudhry Sarvajanik Vidhyalay with 83.83% under GSEB Board.",
        cgpa: "Abdulrauf's academic CGPA is 8.39 in B.Tech ICT at VGEC Ahmedabad.",
        certifications: "Abdulrauf holds 3 verified certifications: 1. Python Programming from Scaler, 2. Data Visualisation from Tata Group - Forage, and 3. Web Development from LaunchEd in association with IIT Kharagpur Kshitij.",
        scalerCert: "Abdulrauf earned a Python Programming Course Completion Certificate from Scaler in April 2025.",
        tataCert: "Abdulrauf completed Data Visualisation: Empowering Business with Effective Insights certification by Tata Group on Forage in April 2025.",
        launchedCert: "Abdulrauf holds a Web Development Course Completion Certificate from LaunchEd in association with IIT Kharagpur Kshitij, issued in August 2025.",
        name: "His full name is Shaikh Abdulrauf Asifparvez.",
        email: "You can email Abdulrauf directly at arauf0801@gmail.com.",
        social: "You can find Abdulrauf on GitHub at ARShaikh0801 and on LinkedIn as Shaikh Abdulrauf.",
        projects: "Abdulrauf's featured projects are: 1. WorkWhiz Worker Contractor Management System, 2. BuyCart E-Commerce platform, 3. Articlio Blogging Platform, and 4. this eDEX Interactive Portfolio.",
        buycart: "BuyCart is a fully functional E-Commerce web application built using Django, JavaScript, and Tailwind CSS. It features a complete shopping cart, secure checkout, Razorpay payment gateway integration, order tracking, and a powerful admin dashboard.",
        workwhiz: "WorkWhiz is a comprehensive Worker Contractor Management System. It handles contractor registration, worker tracking, attendance management, payroll calculation, and reporting.",
        articlio: "Articlio is a modern Blogging Platform that allows users to create, publish, and manage their own articles. It includes rich text editing, category tagging, user authentication, and a responsive design.",
        skills: "Core technical skills include Python, Django, JavaScript, PostgreSQL, HTML5, CSS3, Tailwind CSS, REST APIs, and Git.",
        achievements: "Abdulrauf's key achievements include ranking 7th in school in HSC Science, building 3 production-ready web apps, participating in 2 national hackathons, and achieving a 8.39 CGPA.",
        rankAchievement: "Abdulrauf ranked 7th in his entire school in HSC Class 12 Science with an 81.07% score.",
        hackathonAchievement: "Abdulrauf participated in 2 competitive hackathons, successfully building working prototypes under tight time constraints.",
        deployedAppsAchievement: "Abdulrauf independently built and deployed 3 live production applications: Articlio, WorkWhiz, and BuyCart.",
        expMilestone: "Abdulrauf has over 2 years of hands-on experience in full-stack web development and Django backend architecture."
    };

    function init() {
        const savedName = sessionStorage.getItem('visitorName');
        if (savedName) userName = savedName;

        orbBtn = document.getElementById('mike-orb');
        modalContainer = document.getElementById('mike-ai-modal');
        statusBadge = document.getElementById('mike-status-badge');
        micBtn = document.getElementById('mike-mic-btn');
        muteBtn = document.getElementById('mike-mute-btn');
        stopBtn = document.getElementById('mike-stop-btn');
        closeBtn = document.getElementById('mike-close-btn');
        speechBubble = document.getElementById('mike-speech-bubble');
        canvas = document.getElementById('mike-audio-canvas');

        if (canvas) ctx = canvas.getContext('2d');

        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = () => {
                getGentleVoice();
            };
        }

        setupOrbDraggable();
        setupEventListeners();
        setupSpeechRecognition();
        startCanvasAnimation();
    }

    function setupEventListeners() {
        if (orbBtn) {
            orbBtn.addEventListener('click', () => {
                if (!hasMoved) toggleModal();
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        if (micBtn) {
            micBtn.addEventListener('click', toggleListening);
        }
        if (muteBtn) {
            muteBtn.addEventListener('click', toggleMute);
        }
    }

    /* ── Draggable Orb Logic ── */
    function setupOrbDraggable() {
        if (!orbBtn) return;

        const onPointerDown = (e) => {
            isDragging = true;
            hasMoved = false;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const rect = orbBtn.getBoundingClientRect();
            dragStartX = clientX - rect.left;
            dragStartY = clientY - rect.top;

            document.addEventListener('mousemove', onPointerMove);
            document.addEventListener('mouseup', onPointerUp);
            document.addEventListener('touchmove', onPointerMove, { passive: false });
            document.addEventListener('touchend', onPointerUp);
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            let left = clientX - dragStartX;
            let top = clientY - dragStartY;

            const maxLeft = window.innerWidth - orbBtn.offsetWidth;
            const maxTop = window.innerHeight - orbBtn.offsetHeight;
            left = Math.max(10, Math.min(maxLeft - 10, left));
            top = Math.max(10, Math.min(maxTop - 10, top));

            orbBtn.style.left = `${left}px`;
            orbBtn.style.top = `${top}px`;
            orbBtn.style.right = 'auto';
            orbBtn.style.bottom = 'auto';

            hasMoved = true;

            if (modalContainer && !modalContainer.classList.contains('hidden')) {
                positionModalNearOrb(left, top);
            }
        };

        const onPointerUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onPointerMove);
            document.removeEventListener('mouseup', onPointerUp);
            document.removeEventListener('touchmove', onPointerMove);
            document.removeEventListener('touchend', onPointerUp);
        };

        orbBtn.addEventListener('mousedown', onPointerDown);
        orbBtn.addEventListener('touchstart', onPointerDown, { passive: false });
    }

    function positionModalNearOrb(left, top) {
        if (!modalContainer || !orbBtn) return;
        const modalWidth = 360;
        let mLeft = left - modalWidth + 60;
        let mTop = top - 280;

        if (mLeft < 10) mLeft = 10;
        if (mLeft + modalWidth > window.innerWidth - 10) mLeft = window.innerWidth - modalWidth - 10;
        if (mTop < 10) mTop = top + 70;

        modalContainer.style.left = `${mLeft}px`;
        modalContainer.style.top = `${mTop}px`;
        modalContainer.style.right = 'auto';
        modalContainer.style.bottom = 'auto';
    }

    function toggleModal() {
        if (!modalContainer) return;
        if (modalContainer.classList.contains('hidden')) {
            openModal();
        } else {
            closeModal();
        }
    }

    function openModal() {
        if (!modalContainer) return;
        modalContainer.classList.remove('hidden');
        if (orbBtn) {
            const rect = orbBtn.getBoundingClientRect();
            positionModalNearOrb(rect.left, rect.top);
        }
    }

    function closeModal() {
        if (!modalContainer) return;
        modalContainer.classList.add('hidden');
    }

    /* ── Strictly Indian Male English Voice Selector (en-IN Male) ── */
    function getGentleVoice() {
        if (!('speechSynthesis' in window)) return null;
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return null;

        const isFemale = (name) => /female|woman|heera|neerja|zira|samantha|victoria|hazel|jenny|aria|google uk english female/i.test(name);
        const isMale = (name) => /male|man|ravi|prabhat|david|mark|george|daniel|alex|google us english male|google uk english male/i.test(name);

        // 1. First Preference: Indian English MALE Voice (en-IN + Male name / NOT female)
        const indianMaleVoice = voices.find(v => {
            const isIndianLang = (v.lang && v.lang.toLowerCase().replace('_', '-').includes('en-in')) || /india|indian|ravi|prabhat|hindi/i.test(v.name);
            return isIndianLang && !isFemale(v.name);
        });

        if (indianMaleVoice) return indianMaleVoice;

        // 2. Second Preference: Any General English MALE Voice
        const generalMaleVoice = voices.find(v => v.lang.startsWith('en') && isMale(v.name) && !isFemale(v.name));
        if (generalMaleVoice) return generalMaleVoice;

        // 3. Fallback: Any English voice that is not explicitly female
        return voices.find(v => v.lang.startsWith('en') && !isFemale(v.name)) || voices[0];
    }

    /* ── 1. Speech Synthesis (TTS) ── */
    let isRecStarting = false;

    function stopSpeakingImmediate() {
        if (isSpeaking) {
            isSpeaking = false;
            if (stopBtn) stopBtn.classList.add('hidden');
            if (autoListenTimer) {
                clearTimeout(autoListenTimer);
                autoListenTimer = null;
            }
            try { window.speechSynthesis.cancel(); } catch(e) {}
            setStatus('LISTENING...', 'listening');
            if (isListening) {
                setTimeout(safeRestartListening, 200);
            }
        }
    }

    function safeRestartListening() {
        if (!recognition || !isListening || isSpeaking || isRecStarting) return;
        try {
            isRecStarting = true;
            recognition.start();
        } catch (err) {
            // Already started or restarting
        } finally {
            setTimeout(() => { isRecStarting = false; }, 300);
        }
    }

    let lastSpokenText = '';

    function speak(text, callback) {
        if (!text) return;
        
        // Clean markdown characters like **, *, #, __, etc.
        const cleanedText = text.replace(/[*#_~`>+\-]/g, '').trim();
        lastSpokenText = cleanedText;
        updateBubble(cleanedText);

        if (isMuted || !('speechSynthesis' in window)) {
            if (callback) callback();
            return;
        }

        // Cleanly cancel any previous utterance
        try { window.speechSynthesis.cancel(); } catch(e) {}

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        const voice = getGentleVoice();
        if (voice) utterance.voice = voice;

        utterance.onstart = () => {
            isSpeaking = true;
            if (stopBtn) stopBtn.classList.remove('hidden');
            setStatus('SPEAKING', 'speaking');
            if (recognition) {
                try { recognition.stop(); } catch(e) {}
            }
        };

        utterance.onend = () => {
            isSpeaking = false;
            if (stopBtn) stopBtn.classList.add('hidden');
            setStatus(isListening ? 'LISTENING' : 'READY', isListening ? 'listening' : 'ready');
            if (callback) callback();

            if (isListening) {
                autoListenTimer = setTimeout(() => {
                    safeRestartListening();
                }, 350);
            }
        };

        utterance.onerror = () => {
            isSpeaking = false;
            if (stopBtn) stopBtn.classList.add('hidden');
            setStatus(isListening ? 'LISTENING' : 'READY', isListening ? 'listening' : 'ready');
            if (callback) callback();
            if (isListening) {
                autoListenTimer = setTimeout(() => {
                    safeRestartListening();
                }, 350);
            }
        };

        window.speechSynthesis.speak(utterance);
    }

    function updateBubble(text) {
        if (speechBubble) {
            speechBubble.style.opacity = '0';
            setTimeout(() => {
                speechBubble.textContent = text;
                speechBubble.style.opacity = '1';
            }, 120);
        }
    }

    function setStatus(text, stateClass) {
        if (!statusBadge) return;
        statusBadge.textContent = text;
        statusBadge.className = 'mike-status-badge ' + (stateClass || '');
    }

    /* ── 2. Greeting on Boot Completion ── */
    function startGreeting() {
        const savedName = sessionStorage.getItem('visitorName') || userName || 'Commander';
        userName = savedName;

        const greetingText = `Hello ${userName}! I am Mike. Welcome to Abdulrauf's portfolio. How can I help you today?`;
        
        setTimeout(() => {
            openModal();
            isListening = true;
            speak(greetingText);
        }, 800);
    }

    /* ── 3. Clean Continuous Speech Recognition (Manual Stop Button Interruption) ── */
    function setupSpeechRecognition() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            console.warn('Speech Recognition API not supported in this browser.');
            return;
        }

        recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        let speechSilenceTimer = null;
        let accumulatedText = '';

        recognition.onstart = () => {
            isRecStarting = false;
            if (micBtn) micBtn.classList.add('active');
            if (!isSpeaking) setStatus('LISTENING...', 'listening');
        };

        recognition.onresult = (event) => {
            // Ignore speech inputs while AI is actively speaking
            if (isSpeaking) {
                return;
            }

            let currentInterim = '';
            let currentFinal = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const textChunk = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    currentFinal += ' ' + textChunk;
                } else {
                    currentInterim += textChunk;
                }
            }

            if (currentFinal) {
                accumulatedText += ' ' + currentFinal;
            }

            const liveQuery = (accumulatedText + ' ' + currentInterim).trim();

            if (liveQuery) {
                updateBubble(`"${liveQuery}"`);

                if (speechSilenceTimer) clearTimeout(speechSilenceTimer);

                // Use a longer pause window (1800ms) if the speech engine has active, unfinished interim words.
                // If the speech engine has finalized the current segment (currentInterim is empty), wait 1000ms.
                const silenceDelay = (currentInterim !== '') ? 1800 : 1000;

                speechSilenceTimer = setTimeout(() => {
                    if (liveQuery.length > 1 && !isSpeaking) {
                        const fullSentence = liveQuery;
                        accumulatedText = '';
                        console.log('Mike Processing Full Sentence:', fullSentence);
                        handleUserQuery(fullSentence);
                    }
                }, silenceDelay);
            }
        };

        recognition.onerror = (event) => {
            console.warn('Speech Recognition notice:', event.error);
            isRecStarting = false;
            if (isListening && !isSpeaking) {
                setTimeout(safeRestartListening, 400);
            }
        };

        recognition.onend = () => {
            isRecStarting = false;
            if (isListening && !isSpeaking) {
                setTimeout(safeRestartListening, 300);
            } else if (!isListening) {
                if (micBtn) micBtn.classList.remove('active');
                if (!isSpeaking) setStatus('READY', 'ready');
            }
        };

        // Watchdog recovery timer: checks every 2.5 seconds to ensure mic state stays alive
        setInterval(() => {
            if (isListening && !isSpeaking && !isRecStarting) {
                safeRestartListening();
            }
        }, 2500);
    }

    function restartListening() {
        safeRestartListening();
    }

    function toggleListening() {
        if (!recognition) {
            speak("Voice recognition is not supported on this browser, but you can tap the command options below!");
            return;
        }

        if (isListening) {
            isListening = false;
            try { recognition.stop(); } catch(e) {}
            if (micBtn) micBtn.classList.remove('active');
            setStatus('READY', 'ready');
            updateBubble("Voice listening stopped.");
        } else {
            isListening = true;
            window.speechSynthesis.cancel();
            restartListening();
            updateBubble(`Listening to you, ${userName}...`);
        }
    }

    function toggleMute() {
        isMuted = !isMuted;
        if (muteBtn) muteBtn.classList.toggle('muted', isMuted);
        if (isMuted) {
            window.speechSynthesis.cancel();
            updateBubble("Voice speech muted.");
        } else {
            updateBubble("Voice active.");
            speak("Audio voice enabled.");
        }
    }

    /**
     * Checks if a query is actually asking about the developer/assistant/site.
     * Used to prevent false-positive matching on generic terms like 'about', 'who', 'where', 'work', etc.
     */
    function isDeveloperQuery(q) {
        // Developer/Assistant/Site context referring words
        const devContextWords = [
            'you', 'your', 'yourself', 'he', 'his', 'him', 'himself', 
            'abdul', 'abdulrauf', 'shaikh', 'rauf', 'developer', 'creator', 
            'author', 'portfolio', 'website', 'site', 'here', 'this', 'mike',
            'project', 'projects', 'skill', 'skills', 'education', 'experience',
            'resume', 'cv', 'certification', 'certifications', 'certs', 'cert',
            'achievement', 'achievements', 'hackathon', 'hackathons'
        ];
        
        // If the query is very short (2 words or less, e.g. "skills", "projects", "about", "show resume"),
        // we treat it as a direct command navigation.
        const words = q.split(/\s+/).filter(Boolean);
        if (words.length <= 2) {
            return true;
        }

        // Otherwise, check if any of the devContextWords is present in the query
        return devContextWords.some(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(q);
        });
    }

    /* ── 4. Intelligent Query Router & Site Knowledge Engine ── */
    async function handleUserQuery(queryText) {
        if (!queryText) return;
        
        // Clean transcript by stripping punctuation and extra spaces for 100% reliable matching
        const rawText = queryText.trim();
        const q = rawText.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

        openModal();
        updateBubble(`"${rawText}"`);
        setStatus('PROCESSING...', 'processing');

        const navigateToSection = (sectionId) => {
            if (typeof Navigation !== 'undefined' && Navigation.navigateTo) {
                Navigation.navigateTo(sectionId);
            } else {
                window.location.hash = '#' + sectionId;
            }
        };

        // ── 4A. MATH & CALCULATIONS ──
        if (q.includes('2 + 2') || q.includes('2+2') || q.includes('2 plus 2')) {
            speak("2 plus 2 equals 4.");
            return;
        }

        // ── 4B. DATE & TIME ──
        if (q.includes('date') || q.includes('time') || q.includes('day is it') || q.includes('today') || q.includes('clock')) {
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const timeStr = now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

            if (q.includes('time')) {
                speak(`The current time is ${timeStr}.`);
            } else {
                speak(`Today is ${dateStr}, and the time is ${timeStr}.`);
            }
            return;
        }

        // ── 4C. WEATHER ──
        if (q.includes('weather') || q.includes('climate') || q.includes('rain')) {
            speak("It's a pleasant day! You can see live connection and weather metrics in your tactical side panel.");
            return;
        }

        // ── 4D. JOKES ──
        if (q.includes('joke') || q.includes('funny') || q.includes('laugh')) {
            let nextIndex = Math.floor(Math.random() * devJokes.length);
            if (nextIndex === lastJokeIndex && devJokes.length > 1) {
                nextIndex = (nextIndex + 1) % devJokes.length;
            }
            lastJokeIndex = nextIndex;
            speak(devJokes[nextIndex]);
            return;
        }

        // ── 4E. GREETINGS & SMALL TALK ──
        if (/\b(hi|hello|hey|greetings|morning|evening)\b/i.test(q)) {
            speak(`Hello ${userName}! How can I assist you with Abdulrauf's portfolio today?`);
            return;
        }
        if (q.includes('how are you')) {
            speak(`I am doing great.`);
            return;
        }
        if (q.includes('who are you') || q.includes('what are you') || q.includes('who is mike')) {
            speak(`I'm Mike, Abdulrauf's personal AI assistant.`);
            return;
        }
        if (q.includes('thank') || q.includes('thanks')) {
            speak(`You're very welcome, ${userName}! Let me know if you need anything else.`);
            return;
        }

        // ── 4F. SPECIFIC SITE KNOWLEDGE MATCHES ──

        // Specific Projects First (Phonetic Speech Recognition Fallbacks)
        if (q.includes('buycart') || q.includes('buy cart') || q.includes('bike art') || q.includes('by cart') || q.includes('buy card') || q.includes('bicard') || q.includes('bycard') || q.includes('e-commerce') || q.includes('ecommerce') || q.includes('shopping')) {
            navigateToSection('projects');
            speak(siteKnowledge.buycart);
            return;
        }
        if (q.includes('workwhiz') || q.includes('workwiz') || q.includes('work whiz') || q.includes('work ways') || q.includes('work with') || q.includes('work links') || q.includes('worker') || q.includes('contractor') || q.includes('labour') || q.includes('labor')) {
            navigateToSection('projects');
            speak(siteKnowledge.workwhiz);
            return;
        }
        if (q.includes('articlio') || q.includes('articleo') || q.includes('articlo') || q.includes('article') || q.includes('articles') || q.includes('artistic') || q.includes('blogging') || q.includes('blog')) {
            navigateToSection('projects');
            speak(siteKnowledge.articlio);
            return;
        }

        // Generic Projects
        if ((/\b(project|projects|work|works|built|created|developed|portfolio|making|make|made)\b/i.test(q) || q.includes('what he made') || q.includes('what has he built') || q.includes('show projects')) && isDeveloperQuery(q)) {
            navigateToSection('projects');
            speak(siteKnowledge.projects);
            return;
        }

        // Specific Education Sub-queries (HSC, SSC, BTech, VGEC)
        const hasSpecificCollege = q.includes('vgec') || q.includes('vishwakarma');
        const hasGenericEducation = q.includes('hsc') || q.includes('ssc') || q.includes('12th') || q.includes('twelth') || q.includes('twelfth') || q.includes('class 12') || q.includes('12 class') || q.includes('10th') || q.includes('tenth') || q.includes('class 10') || q.includes('10 class') || q.includes('btech') || q.includes('b tech') || q.includes('ict') || q.includes('college') || q.includes('university');

        if (q.includes('hsc') || q.includes('12th') || q.includes('twelth') || q.includes('twelfth') || q.includes('class 12') || q.includes('12 class')) {
            if (isDeveloperQuery(q)) {
                navigateToSection('education');
                speak(siteKnowledge.hsc);
                return;
            }
        }
        if (q.includes('ssc') || q.includes('10th') || q.includes('tenth') || q.includes('class 10') || q.includes('10 class')) {
            if (isDeveloperQuery(q)) {
                navigateToSection('education');
                speak(siteKnowledge.ssc);
                return;
            }
        }
        if (hasSpecificCollege || (hasGenericEducation && isDeveloperQuery(q))) {
            navigateToSection('education');
            speak(siteKnowledge.btech);
            return;
        }

        // Generic Education / CGPA
        if (/\b(education|academic|academics|degree|study|studied|cgpa|gpa|marks|grade|grades|school)\b/i.test(q) && isDeveloperQuery(q)) {
            navigateToSection('education');
            speak(siteKnowledge.education);
            return;
        }

        // Specific Certifications (Scaler, Tata, LaunchEd)
        if (q.includes('scaler') || q.includes('scalar') || q.includes('python cert')) {
            navigateToSection('certifications');
            speak(siteKnowledge.scalerCert);
            return;
        }
        if (q.includes('tata') || q.includes('forage') || q.includes('data visualisation') || q.includes('visualization')) {
            navigateToSection('certifications');
            speak(siteKnowledge.tataCert);
            return;
        }
        if (q.includes('launched') || q.includes('iit kharagpur') || q.includes('kharagpur') || q.includes('kshitij')) {
            navigateToSection('certifications');
            speak(siteKnowledge.launchedCert);
            return;
        }

        // Generic Certifications
        if (/\b(certif|certification|certifications|credential|credentials|course|courses|certificate|certificates)\b/i.test(q) && isDeveloperQuery(q)) {
            navigateToSection('certifications');
            speak(siteKnowledge.certifications);
            return;
        }

        // Skills (django, postgres, tailwind are highly specific, other skills or languages require dev context)
        const hasSpecificTools = /\b(django|postgres|postgresql|tailwind)\b/i.test(q);
        const hasGenericOrCommonSkills = /\b(skill|skills|tech|technology|technologies|stack|python|javascript|html|css)\b/i.test(q);
        if (hasSpecificTools || (hasGenericOrCommonSkills && isDeveloperQuery(q))) {
            navigateToSection('skills');
            speak(siteKnowledge.skills);
            return;
        }

        // Experience
        if (/\b(experience|job|jobs|career|work history|background|work experience)\b/i.test(q) && isDeveloperQuery(q)) {
            navigateToSection('experience');
            speak(`Abdulrauf has extensive hands-on experience building production-ready Django web applications, REST APIs, and full-stack web platforms.`);
            return;
        }

        // Specific Achievements Sub-queries
        if ((q.includes('hackathon') || q.includes('hackathons')) && isDeveloperQuery(q)) {
            navigateToSection('achievements');
            speak(siteKnowledge.hackathonAchievement);
            return;
        }
        if ((q.includes('rank') || q.includes('7th') || q.includes('seventh') || q.includes('top student')) && isDeveloperQuery(q)) {
            navigateToSection('achievements');
            speak(siteKnowledge.rankAchievement);
            return;
        }
        if ((q.includes('deployed app') || q.includes('live app') || q.includes('production app')) && isDeveloperQuery(q)) {
            navigateToSection('achievements');
            speak(siteKnowledge.deployedAppsAchievement);
            return;
        }

        // Generic Achievements / Awards
        if (/\b(achievement|achievements|award|awards|honors|milestone|milestones|accomplishment|accomplishments)\b/i.test(q) && isDeveloperQuery(q)) {
            navigateToSection('achievements');
            speak(siteKnowledge.achievements);
            return;
        }

        // Location / City
        const hasSpecificLocation = /\b(mahesana|gujarat|india)\b/i.test(q);
        const hasGenericLocation = /\b(live|location|city|where|reside)\b/i.test(q);
        if ((hasSpecificLocation || hasGenericLocation) && isDeveloperQuery(q)) {
            navigateToSection('about');
            speak(siteKnowledge.location);
            return;
        }

        // Role / Designation / About (Catch-All for generic info)
        if ((/\b(role|position|designation|developer|specialist|who|about|myself|himself|summary)\b/i.test(q) || q.includes('what does he do') || q.includes('who is he')) && isDeveloperQuery(q)) {
            navigateToSection('about');
            speak(siteKnowledge.role);
            return;
        }

        // Contact
        if (q.includes('contact') || q.includes('email') || q.includes('mail') || q.includes('reach') || q.includes('github') || q.includes('linkedin')) {
            if (isDeveloperQuery(q) || q.includes('email') || q.includes('contact')) {
                navigateToSection('contact');
                if (q.includes('github') || q.includes('linkedin')) {
                    speak(siteKnowledge.social);
                } else {
                    speak(siteKnowledge.email);
                }
                return;
            }
        }

        // Resume
        if (q.includes('resume') || q.includes('cv') || q.includes('download')) {
            if (isDeveloperQuery(q) || q.includes('resume') || q.includes('cv')) {
                navigateToSection('resume');
                speak(`You can view and download Abdulrauf's official resume from this page.`);
                return;
            }
        }

        // Terminal - Focus terminal input box without navigating away from current page
        if (q.includes('terminal') || q.includes('command') || q.includes('cmd') || q.includes('cli')) {
            const cmdInput = document.getElementById('cmd-input');
            if (cmdInput) {
                cmdInput.focus();
            }
            speak(`Terminal command input activated at the bottom left. You can type commands like help, skills, projects, experience, certs, or clear.`);
            return;
        }

        // About / Bio
        if ((q.includes('about') || q.includes('bio') || q.includes('background')) && isDeveloperQuery(q)) {
            navigateToSection('about');
            speak(siteKnowledge.role);
            return;
        }

        // Capabilities
        if (q.includes('what can you do') || q.includes('capabilities') || q.includes('introduce yourself') || q.includes('help')) {
            speak(`I can answer any question about Abdulrauf's role, skills, projects, achievements, education, and contact details, or search for information for you!`);
            return;
        }

        // ── 4G. CLEAN WEB SEARCH FALLBACK (NO CONSOLE 403 ERRORS) ──
        await performWebSearch(queryText);
    }

    /* ── 5. Clean Search Engine (No 403 errors, with Serverless Gemini API fallback) ── */
    async function performWebSearch(searchQuery) {
        setStatus('SEARCHING WEB...', 'processing');
        updateBubble(`Searching web for "${searchQuery}"...`);

        // Tier 0: Vercel Serverless Gemini API with Search Grounding
        let serverlessFailed = false;
        try {
            const apiRes = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery })
            });

            if (apiRes.ok) {
                const apiData = await apiRes.json();
                if (apiData && apiData.success && apiData.text) {
                    speak(apiData.text);
                    return;
                }
                if (apiData && apiData.fallback) {
                    serverlessFailed = true;
                }
            } else {
                serverlessFailed = true;
            }
        } catch (apiErr) {
            console.warn('Vercel serverless endpoint not available. Attempting client-side Gemini fallback...', apiErr);
            serverlessFailed = true;
        }

        // Direct Client-Side Gemini Fallback: Let visitor enter keys in localStorage to test locally
        if (serverlessFailed) {
            const localKeys = [];
            for (let k = 1; k <= 5; k++) {
                const keyVal = localStorage.getItem(`GEMINI_API_KEY_${k}`);
                if (keyVal) localKeys.push(keyVal);
            }

            if (localKeys.length > 0) {
                const systemInstruction = `You are Mike, a friendly, professional, male AI portfolio assistant for Shaikh Abdulrauf Asifparvez (Full-Stack Developer, VGEC Ahmedabad). Keep answers concise, clear, and engaging. Speak as a personal representative of Abdulrauf. IMPORTANT: If the user's query is about general topics, facts, or questions unrelated to Abdulrauf, his projects, or his background, answer the question directly, accurately, and naturally. DO NOT force or append portfolio information, links, or mention Abdulrauf unless the topic is relevant to his work.`;

                for (let i = 0; i < localKeys.length; i++) {
                    const apiKey = localKeys[i];
                    try {
                        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ role: 'user', parts: [{ text: searchQuery }] }],
                                systemInstruction: { parts: [{ text: systemInstruction }] }
                            })
                        });

                        if (response.ok) {
                            const data = await response.json();
                            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (text) {
                                speak(text);
                                return;
                            }
                        }
                        console.warn(`Local Gemini key ${i + 1} failed. Rotating...`);
                    } catch (err) {
                        console.error(`Local Gemini key ${i + 1} request error:`, err);
                    }
                }
            } else {
                console.log('No local fallback API keys found in localStorage (GEMINI_API_KEY_1 to GEMINI_API_KEY_5). Bypassing to Wikipedia/DuckDuckGo.');
            }
        }

        // Tier 1: Wikipedia Search API (Free, CORS-enabled Fallback)
        try {
            const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*`;
            const wikiRes = await fetch(searchUrl);
            if (wikiRes.ok) {
                const wikiData = await wikiRes.json();
                if (wikiData && wikiData.query && wikiData.query.search && wikiData.query.search.length > 0) {
                    const topResult = wikiData.query.search[0];
                    const cleanSnippet = topResult.snippet.replace(/<[^>]*>/g, '');
                    speak(`${topResult.title}: ${cleanSnippet}`);
                    return;
                }
            }
        } catch (wikiErr) {}

        // Tier 2: DuckDuckGo Instant Answer API (Free, CORS-enabled Fallback)
        try {
            const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1&skip_disambig=1`;
            const ddgRes = await fetch(ddgUrl);
            if (ddgRes.ok) {
                const ddgData = await ddgRes.json();
                if (ddgData && ddgData.AbstractText) {
                    speak(`Here is what I found: ${ddgData.AbstractText}`);
                    return;
                }
            }
        } catch (ddgErr) {}

        // Clean Natural Response
        speak(`I searched for "${searchQuery}". I can take you directly to Abdulrauf's projects, skills, achievements, or contact details anytime!`);
    }

    /* ── 6. Smooth Organic Voice Frequency Equalizer Visualizer ── */
    function startCanvasAnimation() {
        if (!ctx || !canvas) return;

        let shockwaves = [];

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            waveOffset += 0.03; // Slowed down from 0.12 to 0.03 for smooth breathing motion

            const isUserSpeaking = (isListening && !isSpeaking && recognition);
            const activeColor = isSpeaking ? '#00ffcc' : isUserSpeaking ? '#ffaa00' : '#00e5ff';
            const numBars = 20;
            const innerRadius = 14;

            // Spawn gentle expanding acoustic shockwave rings
            if ((isSpeaking || isUserSpeaking) && Math.random() < 0.08) {
                shockwaves.push({ r: innerRadius, alpha: 0.6, color: activeColor });
            }

            // Render expanding shockwaves smoothly
            for (let i = shockwaves.length - 1; i >= 0; i--) {
                const sw = shockwaves[i];
                ctx.beginPath();
                ctx.arc(cx, cy, sw.r, 0, Math.PI * 2);
                ctx.strokeStyle = sw.color;
                ctx.lineWidth = 1.0;
                ctx.globalAlpha = sw.alpha;
                ctx.stroke();

                sw.r += 0.4;
                sw.alpha -= 0.015;
                if (sw.alpha <= 0 || sw.r > 30) {
                    shockwaves.splice(i, 1);
                }
            }
            ctx.globalAlpha = 1.0;

            // Render Fixed-Position Radial Equalizer Bars (No Rotation, Pure Height Pulsing)
            for (let i = 0; i < numBars; i++) {
                // Fixed angle per bar — zero rotational drift
                const angle = (i / numBars) * Math.PI * 2;
                
                let barHeight = 2;
                if (isSpeaking) {
                    // Smooth, calm sinusoidal height pulsation per bar
                    barHeight = (Math.sin(i * 1.2 + waveOffset * 1.5) * 0.5 + 0.5) * 10 + 2;
                } else if (isUserSpeaking) {
                    barHeight = (Math.sin(i * 1.5 + waveOffset * 2.0) * 0.5 + 0.5) * 8 + 2;
                } else {
                    barHeight = (Math.sin(i * 0.8 + waveOffset * 0.5) * 0.5 + 0.5) * 1.5 + 1.5;
                }

                const x1 = cx + Math.cos(angle) * innerRadius;
                const y1 = cy + Math.sin(angle) * innerRadius;
                const x2 = cx + Math.cos(angle) * (innerRadius + barHeight);
                const y2 = cy + Math.sin(angle) * (innerRadius + barHeight);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = activeColor;
                ctx.lineWidth = isSpeaking || isUserSpeaking ? 2 : 1.2;
                ctx.lineCap = 'round';
                ctx.shadowBlur = isSpeaking || isUserSpeaking ? 10 : 4;
                ctx.shadowColor = activeColor;
                ctx.stroke();
            }

            // Inner Holographic Orb Core with gentle breathing aura
            const coreRadius = 7 + Math.sin(waveOffset * 1.2) * (isSpeaking ? 1.5 : isUserSpeaking ? 1.2 : 0.6);
            ctx.beginPath();
            ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
            ctx.fillStyle = activeColor;
            ctx.shadowBlur = 12;
            ctx.shadowColor = activeColor;
            ctx.fill();

            // Core Gloss Center
            ctx.beginPath();
            ctx.arc(cx - 2, cy - 2, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.fill();

            animFrame = requestAnimationFrame(animate);
        }

        animate();
    }

    function submitTextInput() {
        const inputEl = document.getElementById('mike-text-input');
        if (!inputEl) return;
        const text = inputEl.value.trim();
        if (text) {
            inputEl.value = '';
            handleUserQuery(text);
        }
    }

    return {
        init,
        startGreeting,
        speak,
        stopSpeakingImmediate,
        handleUserQuery,
        submitTextInput,
        get isSpeaking() { return isSpeaking; },
        get isListening() { return isListening; },
        set userName(name) { userName = name; },
        get userName() { return userName; }
    };
})();

// Auto initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    MikeAI.init();
});
