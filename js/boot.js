/* ═══════════════════════════════════════════════════════
   BOOT SEQUENCE — 3-Step Sequential Startup with Audio
   Step 1: Terminal boot lines (bottom-left)
   Step 2: Face scan animation → ACCESS GRANTED
   Step 3: Name deciphering → Subtitle → Fade out
   ═══════════════════════════════════════════════════════ */

const Boot = (() => {
    const bootLines = [
        { text: '> eDEX-PORTFOLIO v1.0.0', delay: 100, type: 'normal' },
        { text: '> System Architecture: HTML5 / CSS3 / JavaScript', delay: 120, type: 'normal' },
        { text: '> Initializing core modules...', delay: 140, type: 'normal' },
        { text: '> Loading profile data.................. OK', delay: 160, type: 'success' },
        { text: '> Loading project modules............... OK', delay: 160, type: 'success' },
        { text: '> Compiling skill matrix................ OK', delay: 150, type: 'success' },
        { text: '> Fetching certificates................. OK', delay: 150, type: 'success' },
        { text: '> Establishing network links............ OK', delay: 150, type: 'success' },
        { text: '> Configuring UI panels................. OK', delay: 150, type: 'success' },
        { text: '> Running security checks............... PASSED', delay: 150, type: 'success' },
        { text: '> Enabling audio subsystem.............. ACTIVE', delay: 120, type: 'success' },
        { text: '> All systems operational.', delay: 180, type: 'normal' },
        { text: '> SYSTEM READY', delay: 200, type: 'success' },
        { text: '> Initiating biometric verification...', delay: 250, type: 'normal' },
    ];

    let bootScreen, bootText, bootTitle, bootSubtitle, bootProgress, bootProgressBar;
    let faceScanOverlay, faceScanFrame, faceScanStatus, faceScanGranted;
    let onCompleteCallback = null;
    let hasStarted = false;

    function init(callback) {
        onCompleteCallback = callback;
        bootScreen = document.getElementById('boot-screen');
        bootText = document.getElementById('boot-text');
        bootTitle = document.getElementById('boot-title');
        bootSubtitle = document.getElementById('boot-subtitle');
        bootProgress = document.getElementById('boot-progress-container');
        bootProgressBar = document.getElementById('boot-progress-bar');

        // Face scan elements
        faceScanOverlay = document.getElementById('face-scan-overlay');
        faceScanFrame = document.getElementById('face-scan-frame');
        faceScanStatus = document.getElementById('face-scan-status');
        faceScanGranted = document.getElementById('face-scan-granted');

        if (!bootScreen) {
            if (onCompleteCallback) onCompleteCallback();
            return;
        }

        // Entry gate: wait for user click to unlock audio & start boot
        const entryGate = document.getElementById('boot-entry-gate');
        if (entryGate) {
            const startBoot = () => {
                // Unlock AudioContext on this user gesture
                if (typeof AudioFX !== 'undefined') {
                    AudioFX.ensureAudioContext();
                }

                // Fade out entry gate
                entryGate.classList.add('hidden');

                // Start boot after gate fades
                setTimeout(() => {
                    entryGate.style.display = 'none';
                    startStep1();
                }, 500);
            };

            entryGate.addEventListener('click', startBoot, { once: true });
        } else {
            // No gate — start immediately (fallback)
            startStep1();
        }
    }

    /* ── STEP 1: Boot Terminal Lines & Progress Bar (Bottom Left) ── */
    async function startStep1() {
        // Ensure name title and face scan are hidden during Step 1
        if (bootTitle) {
            bootTitle.classList.remove('visible', 'deciphering');
            bootTitle.style.display = 'none';
        }
        if (faceScanOverlay) faceScanOverlay.classList.remove('visible');

        // Show progress bar
        if (bootProgress) bootProgress.classList.add('visible');

        // Print boot lines one by one with typing audio
        for (let i = 0; i < bootLines.length; i++) {
            await sleep(bootLines[i].delay);
            addBootLine(bootLines[i].text, bootLines[i].type);

            if (typeof AudioFX !== 'undefined') {
                AudioFX.play('type');
            }

            // Update progress bar
            if (bootProgressBar) {
                const progress = ((i + 1) / bootLines.length) * 100;
                bootProgressBar.style.width = progress + '%';
            }
        }

        // Step 1 Complete -> Transition to Step 2 (Face Scan)
        await sleep(400);
        startStep2_FaceScan();
    }

    /* ── STEP 2: Face / Retina Scanning Animation ── */
    let webcamStream = null;
    let retinAnimFrame = null;

    async function startStep2_FaceScan() {
        // Fade out boot log lines & progress bar
        if (bootText) {
            bootText.style.opacity = '0';
            bootText.style.transition = 'opacity 0.4s ease';
        }
        if (bootProgress) bootProgress.style.opacity = '0';

        await sleep(400);

        // Request webcam access
        const video = document.getElementById('face-scan-video');
        const fallbackCanvas = document.getElementById('face-scan-fallback');
        let usingWebcam = false;

        try {
            webcamStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 240, height: 300 },
                audio: false
            });
            if (video) {
                video.srcObject = webcamStream;
                video.style.display = 'block';
                if (fallbackCanvas) fallbackCanvas.style.display = 'none';
                usingWebcam = true;
            }
        } catch (err) {
            // Webcam denied — switch to retina/iris scan fallback
            if (video) video.style.display = 'none';
            if (fallbackCanvas) {
                fallbackCanvas.style.display = 'block';
                fallbackCanvas.width = 220;
                fallbackCanvas.height = 220;
                startRetinaScanAnimation(fallbackCanvas);
            }
        }

        // Show face scan overlay
        if (faceScanOverlay) faceScanOverlay.classList.add('visible');

        // Start scanning animation
        await sleep(300);
        if (faceScanFrame) faceScanFrame.classList.add('scanning');
        if (faceScanStatus) {
            faceScanStatus.classList.add('visible');
            faceScanStatus.textContent = usingWebcam
                ? 'SCANNING BIOMETRIC DATA...'
                : 'INITIATING RETINA SCAN...';
        }

        if (typeof AudioFX !== 'undefined') AudioFX.play('beep');

        await sleep(800);
        if (faceScanStatus) faceScanStatus.textContent = usingWebcam
            ? 'ANALYZING FACIAL FEATURES...'
            : 'ANALYZING RETINAL PATTERN...';
        if (typeof AudioFX !== 'undefined') AudioFX.play('type');

        await sleep(800);
        if (faceScanStatus) faceScanStatus.textContent = usingWebcam
            ? 'MATCHING IDENTITY DATABASE...'
            : 'MATCHING IRIS SIGNATURE...';
        if (typeof AudioFX !== 'undefined') AudioFX.play('type');

        await sleep(700);
        if (faceScanStatus) faceScanStatus.textContent = 'VERIFICATION COMPLETE';
        if (typeof AudioFX !== 'undefined') AudioFX.play('beep');

        // Stop scanning, show verified state
        await sleep(300);
        if (faceScanFrame) {
            faceScanFrame.classList.remove('scanning');
            faceScanFrame.classList.add('verified');
        }

        // Show ACCESS GRANTED
        await sleep(400);
        if (faceScanStatus) faceScanStatus.classList.remove('visible');
        if (faceScanGranted) faceScanGranted.classList.add('visible');
        if (typeof AudioFX !== 'undefined') AudioFX.play('accessGranted');

        // Hold for viewer to see ACCESS GRANTED
        await sleep(1200);

        // Cleanup streams & animations
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
        }
        if (retinAnimFrame) {
            cancelAnimationFrame(retinAnimFrame);
            retinAnimFrame = null;
        }

        // Fade out face scan overlay
        if (faceScanOverlay) {
            faceScanOverlay.style.transition = 'opacity 0.5s ease';
            faceScanOverlay.classList.remove('visible');
        }

        await sleep(500);

        // Proceed to Step 3 (Name Deciphering)
        startStep3_Decipher();
    }

    /**
     * Animated retina / iris scan on a canvas element.
     * Draws an eye-like iris with concentric rings, radial lines,
     * a central pupil, and expanding scan rings.
     */
    function startRetinaScanAnimation(canvas) {
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        const cx = W / 2;
        const cy = H / 2;
        const maxR = Math.min(W, H) * 0.42;
        const startTime = Date.now();

        function draw() {
            const t = (Date.now() - startTime) / 1000; // seconds

            ctx.clearRect(0, 0, W, H);

            // Dark background
            ctx.fillStyle = '#060d0a';
            ctx.fillRect(0, 0, W, H);

            // Outer iris rings (concentric circles with varying green tones)
            for (let i = 6; i >= 1; i--) {
                const r = maxR * (i / 6);
                const alpha = 0.12 + (i / 6) * 0.15;
                const hue = 140 + Math.sin(t * 0.8 + i) * 15;
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.strokeStyle = `hsla(${hue}, 90%, 50%, ${alpha})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Iris texture: radial lines from center
            const numLines = 36;
            for (let i = 0; i < numLines; i++) {
                const angle = (i / numLines) * Math.PI * 2 + t * 0.15;
                const innerR = maxR * 0.18;
                const outerR = maxR * (0.7 + Math.sin(t * 2 + i * 0.5) * 0.12);
                const alpha = 0.08 + Math.sin(t * 3 + i) * 0.04;

                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
                ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
                ctx.strokeStyle = `rgba(68, 255, 136, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Iris color fill (subtle gradient)
            const grad = ctx.createRadialGradient(cx, cy, maxR * 0.15, cx, cy, maxR * 0.75);
            grad.addColorStop(0, 'rgba(30, 80, 50, 0.5)');
            grad.addColorStop(0.5, 'rgba(40, 140, 80, 0.15)');
            grad.addColorStop(1, 'rgba(20, 60, 40, 0.05)');
            ctx.beginPath();
            ctx.arc(cx, cy, maxR * 0.75, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // Central pupil
            const pupilR = maxR * (0.14 + Math.sin(t * 1.5) * 0.02);
            ctx.beginPath();
            ctx.arc(cx, cy, pupilR, 0, Math.PI * 2);
            ctx.fillStyle = '#020504';
            ctx.fill();
            ctx.strokeStyle = 'rgba(68, 255, 136, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Pupil highlight
            ctx.beginPath();
            ctx.arc(cx - pupilR * 0.3, cy - pupilR * 0.35, pupilR * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(120, 255, 180, 0.25)';
            ctx.fill();

            // Scanning ring pulse (expands outward repeatedly)
            const scanCycle = (t * 0.7) % 1; // 0→1 repeating
            const scanR = maxR * 0.1 + scanCycle * maxR * 0.9;
            const scanAlpha = 1 - scanCycle;
            ctx.beginPath();
            ctx.arc(cx, cy, scanR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(68, 255, 136, ${scanAlpha * 0.6})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Second offset scan ring
            const scanCycle2 = ((t * 0.7) + 0.5) % 1;
            const scanR2 = maxR * 0.1 + scanCycle2 * maxR * 0.9;
            const scanAlpha2 = 1 - scanCycle2;
            ctx.beginPath();
            ctx.arc(cx, cy, scanR2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(68, 255, 136, ${scanAlpha2 * 0.4})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Corner data text decoration
            ctx.font = '9px monospace';
            ctx.fillStyle = 'rgba(68, 255, 136, 0.4)';
            ctx.fillText('IRIS_ID: 0x' + Math.floor(t * 100 % 65535).toString(16).toUpperCase().padStart(4, '0'), 6, 14);
            ctx.fillText('DEPTH: ' + (2.4 + Math.sin(t) * 0.3).toFixed(2) + 'mm', 6, H - 8);
            ctx.textAlign = 'right';
            ctx.fillText('SCAN ' + Math.min(Math.floor(t / 3.2 * 100), 100) + '%', W - 6, 14);
            ctx.fillText('λ: 850nm', W - 6, H - 8);
            ctx.textAlign = 'left';

            retinAnimFrame = requestAnimationFrame(draw);
        }

        draw();
    }

    /* ── STEP 3: Name Deciphering Animation & Subtitle ── */
    async function startStep3_Decipher() {
        // Make name title visible and launch deciphering animation
        if (bootTitle) {
            bootTitle.style.display = 'block';
            bootTitle.classList.add('visible', 'deciphering');

            // Decipher over 3400ms (3.4s cinematic pace) with audio ticks
            await decipherText(bootTitle, "ABDULRAUF SHAIKH", 3400);

            bootTitle.classList.remove('deciphering');
            bootTitle.style.color = 'var(--accent)';
        }

        // Show subtitle
        await sleep(250);
        if (bootSubtitle) bootSubtitle.classList.add('visible');

        // Hold for visitor to read title & subtitle
        await sleep(1000);

        // Fade out entire boot screen
        if (bootScreen) bootScreen.classList.add('fade-out');

        await sleep(800);
        if (bootScreen) bootScreen.style.display = 'none';

        // Trigger main UI activation
        if (onCompleteCallback) onCompleteCallback();
    }

    /**
     * Decipher / Scramble animation to reveal target string.
     * Scrambles entire string across all letter positions first,
     * then gradually resolves character by character at a cinematic pace.
     */
    function decipherText(element, targetText, duration = 3400) {
        const glyphs = "0123456789ABCDEF!@#$%^&*()_+-=[]{}|;:,.<>?/~αβγδεζηθικλμνξοπρστυφχψω";
        return new Promise((resolve) => {
            const length = targetText.length;
            const startTime = Date.now();
            let audioTickCounter = 0;

            const renderFrame = () => {
                const elapsedTime = Date.now() - startTime;
                const progress = Math.min(elapsedTime / duration, 1);

                // Initial phase (first 25% of time): ALL letter positions scramble simultaneously
                // Resolve phase (25% to 100% of time): letters lock into place sequentially
                let revealedChars = 0;
                if (progress > 0.25) {
                    revealedChars = Math.floor(((progress - 0.25) / 0.75) * length);
                }

                let outputHtml = "";
                for (let i = 0; i < length; i++) {
                    if (targetText[i] === " ") {
                        outputHtml += "&nbsp;";
                    } else if (i < revealedChars) {
                        outputHtml += targetText[i];
                    } else {
                        const randomGlyph = glyphs[Math.floor(Math.random() * glyphs.length)];
                        outputHtml += `<span class="unresolved-char">${randomGlyph}</span>`;
                    }
                }

                element.innerHTML = outputHtml;

                // Subtle audio tick during deciphering
                audioTickCounter++;
                if (audioTickCounter % 2 === 0 && typeof AudioFX !== 'undefined') {
                    AudioFX.play('type');
                }

                return progress >= 1;
            };

            // Render frame 0 immediately (all 16 positions scrambling)
            const isFinished = renderFrame();
            if (isFinished) {
                element.textContent = targetText;
                resolve();
                return;
            }

            const interval = setInterval(() => {
                const done = renderFrame();
                if (done) {
                    clearInterval(interval);
                    element.textContent = targetText;
                    resolve();
                }
            }, 35);
        });
    }

    function addBootLine(text, type) {
        if (!bootText) return;
        const line = document.createElement('div');
        line.className = 'boot-line ' + (type || '');

        if (text.includes(' OK') || text.includes(' PASSED') || text.includes(' ACTIVE')) {
            const parts = text.split(/\s+(OK|PASSED|ACTIVE|STANDBY)\s*$/);
            const mainText = parts[0];
            const tag = parts[1] || '';

            const dotMatch = mainText.match(/^(.*?)(\.{2,})\s*$/);
            if (dotMatch) {
                line.innerHTML = `${dotMatch[1]}<span class="dots">${dotMatch[2]}</span> <span class="ok-tag">${tag}</span>`;
            } else {
                line.innerHTML = `${mainText} <span class="ok-tag">${tag}</span>`;
            }
        } else {
            line.textContent = text;
        }

        bootText.appendChild(line);
        bootText.scrollTop = bootText.scrollHeight;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Skip boot on double-click after started
    function enableSkip() {
        const skipHandler = () => {
            if (hasStarted && bootScreen && !bootScreen.classList.contains('fade-out')) {
                bootScreen.classList.add('fade-out');
                setTimeout(() => {
                    bootScreen.style.display = 'none';
                    if (onCompleteCallback) {
                        onCompleteCallback();
                        onCompleteCallback = null;
                    }
                }, 300);
            }
        };

        setTimeout(() => {
            document.addEventListener('dblclick', skipHandler);
        }, 500);
    }

    return { init, enableSkip };
})();
