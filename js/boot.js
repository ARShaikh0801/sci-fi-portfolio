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

        // Step 1 Complete -> Transition to User Name Prompt -> Step 2 (Face Scan)
        await sleep(400);
        await promptUserName();
        await sleep(200);
        startStep2_FaceScan();
    }

    /* ── STEP 1.5: User Name Security Clearance Prompt ── */
    function promptUserName() {
        return new Promise((resolve) => {
            // Immediately hide boot text lines and progress bar so they don't linger
            if (bootText) {
                bootText.style.opacity = '0';
                bootText.style.display = 'none';
            }
            if (bootProgress) {
                bootProgress.style.opacity = '0';
                bootProgress.style.display = 'none';
            }

            // Check localStorage with 3-day expiration (3 * 24 * 60 * 60 * 1000 ms)
            const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
            const savedData = localStorage.getItem('visitorNameData');

            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    if (parsed && parsed.name && parsed.timestamp && (Date.now() - parsed.timestamp < THREE_DAYS_MS)) {
                        sessionStorage.setItem('visitorName', parsed.name);
                        if (typeof MikeAI !== 'undefined') {
                            MikeAI.userName = parsed.name;
                        }
                        resolve(parsed.name);
                        return;
                    }
                } catch(e) {}
            }

            const modal = document.getElementById('user-name-modal');
            const form = document.getElementById('name-modal-form');
            const input = document.getElementById('user-name-input');
            
            if (!modal) {
                resolve('Commander');
                return;
            }

            modal.classList.add('active');
            setTimeout(() => input && input.focus(), 150);

            const handleSubmit = (e) => {
                if (e) e.preventDefault();
                let name = input ? input.value.trim() : '';
                if (!name) name = 'Commander';
                
                // Store in sessionStorage and localStorage with timestamp for 3 days
                sessionStorage.setItem('visitorName', name);
                localStorage.setItem('visitorNameData', JSON.stringify({
                    name: name,
                    timestamp: Date.now()
                }));

                if (typeof MikeAI !== 'undefined') {
                    MikeAI.userName = name;
                }

                modal.classList.remove('active');
                if (typeof AudioFX !== 'undefined') AudioFX.play('beep');
                setTimeout(() => resolve(name), 400);
            };

            if (form) {
                form.addEventListener('submit', handleSubmit, { once: true });
            }
        });
    }

    /* ── STEP 2: Face / Retina Scanning Animation ── */
    let webcamStream = null;
    let retinAnimFrame = null;

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async function startStep2_FaceScan() {
        // Ensure boot log text & progress bar stay hidden
        if (bootText) {
            bootText.style.opacity = '0';
            bootText.style.display = 'none';
        }
        if (bootProgress) {
            bootProgress.style.opacity = '0';
            bootProgress.style.display = 'none';
        }

        await sleep(200);

        // Show face scan overlay immediately to avoid black screen during script loading/permission request
        if (faceScanOverlay) faceScanOverlay.classList.add('visible');
        if (faceScanStatus) {
            faceScanStatus.style.color = '';
            faceScanStatus.classList.add('visible');
            faceScanStatus.textContent = 'CONNECTING TO BIOMETRIC CAMERA...';
        }

        let faceDetected = false;
        let usingWebcam = false;
        let trackingTask = null;
        let permissionDenied = false;

        // Try to load tracking.js and tracker data
        try {
            await loadScript("https://cdnjs.cloudflare.com/ajax/libs/tracking.js/1.1.3/tracking-min.js");
            await loadScript("https://cdnjs.cloudflare.com/ajax/libs/tracking.js/1.1.3/data/face-min.js");
        } catch (e) {
            console.warn("Failed to load tracking.js library, defaulting to fake scanning/bypass.");
        }

        // Request webcam access
        const video = document.getElementById('face-scan-video');
        const fallbackCanvas = document.getElementById('face-scan-fallback');

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
            permissionDenied = true;
        }

        if (permissionDenied) {
            if (video) video.style.display = 'none';
            if (fallbackCanvas) fallbackCanvas.style.display = 'none';
            
            // Immediately transition to bypass decryption
            handleDecryptionBypass(true);
            return;
        }

        // Start scanning animation
        await sleep(300);
        if (faceScanFrame) faceScanFrame.classList.add('scanning');
        if (faceScanStatus) {
            faceScanStatus.classList.add('visible');
            faceScanStatus.textContent = 'SCANNING BIOMETRIC DATA...';
        }

        if (typeof AudioFX !== 'undefined') AudioFX.play('beep');

        // Setup tracking if tracking.js loaded successfully
        if (typeof tracking !== 'undefined' && video) {
            try {
                const tracker = new tracking.ObjectTracker('face');
                tracker.setInitialScale(4);
                tracker.setStepSize(2);
                tracker.setEdgesDensity(0.1);
                
                tracker.on('track', function(event) {
                    if (event.data.length > 0) {
                        faceDetected = true;
                    }
                });
                
                trackingTask = tracking.track('#face-scan-video', tracker);
            } catch (trackerErr) {
                console.warn("Error starting face tracker:", trackerErr);
            }
        }

        // Wait up to 6 seconds to detect a face
        let secondsPassed = 0;
        const checkInterval = 100; // check every 100ms
        const maxWaitTime = 6000;  // 6 seconds max wait

        while (secondsPassed < maxWaitTime && !faceDetected) {
            await sleep(checkInterval);
            secondsPassed += checkInterval;

            // Display scanning messages periodically
            if (faceScanStatus) {
                if (secondsPassed === 1500) {
                    faceScanStatus.textContent = 'ANALYZING FACIAL FEATURES...';
                    if (typeof AudioFX !== 'undefined') AudioFX.play('type');
                } else if (secondsPassed === 3000) {
                    faceScanStatus.textContent = 'SEARCHING FOR TARGET FACE...';
                    if (typeof AudioFX !== 'undefined') AudioFX.play('type');
                } else if (secondsPassed === 4500) {
                    faceScanStatus.textContent = '[WARN] NO SUBJECT DETECTED';
                    faceScanStatus.style.color = '#ff3b30';
                    if (typeof AudioFX !== 'undefined') AudioFX.play('beep');
                }
            }
        }

        // Stop tracking task
        if (trackingTask) {
            try { trackingTask.stop(); } catch (e) {}
        }

        // If face is found, proceed to normal ACCESS GRANTED!
        if (faceDetected) {
            if (faceScanStatus) {
                faceScanStatus.style.color = ''; // reset color
                faceScanStatus.textContent = 'MATCHING IDENTITY DATABASE...';
            }
            await sleep(800);
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

            // Cleanup streams
            if (webcamStream) {
                webcamStream.getTracks().forEach(track => track.stop());
                webcamStream = null;
            }

            // Fade out face scan overlay
            if (faceScanOverlay) {
                faceScanOverlay.style.transition = 'opacity 0.5s ease';
                faceScanOverlay.classList.remove('visible');
            }

            await sleep(500);
            startStep3_Decipher();
        } else {
            // Face NOT detected within 6 seconds -> Trigger Decryption Override!
            handleDecryptionBypass(false);
        }
    }

    async function handleDecryptionBypass(isPermissionDenied) {
        // Play futuristic warning sound
        if (typeof AudioFX !== 'undefined') {
            AudioFX.play('warning');
            AudioFX.startAlarm(); // Start the blaring cyber alarm loop
        }

        // Hide scanning components
        const frame = document.getElementById('face-scan-frame');
        const status = document.getElementById('face-scan-status');
        const granted = document.getElementById('face-scan-granted');
        
        if (frame) frame.style.display = 'none';
        if (status) status.style.display = 'none';
        if (granted) granted.style.display = 'none';

        // Show decryption override UI
        const container = document.getElementById('decrypt-bypass-container');
        if (container) {
            container.style.display = 'flex';
        }
        if (faceScanOverlay) {
            faceScanOverlay.classList.add('visible');
        }

        // Update initial terminal message based on cause
        const logsEl = document.getElementById('decrypt-console-logs');
        if (logsEl) {
            logsEl.innerHTML = isPermissionDenied
                ? `<div class="log-fail">[ERROR] WEBCAM INTERFACE OFFLINE (PERMISSION DENIED)</div>
                   <div>INTERFACE LOCKDOWN ACTIVE. SYSTEM SECURED.</div>
                   <div class="blink-cursor-line">> WAITING FOR SECURE BYPASS COMMAND...</div>`
                : `<div class="log-fail">[ERROR] BIOMETRIC VERIFICATION TIMEOUT (SUBJECT NOT DETECTED)</div>
                   <div>INTERFACE LOCKDOWN ACTIVE. LOCAL TERMINAL SHUTDOWN.</div>
                   <div class="blink-cursor-line">> WAITING FOR SECURE BYPASS COMMAND...</div>`;
        }

        // Voice instruction from Mike
        if (typeof MikeAI !== 'undefined' && MikeAI.speak) {
            const speakText = isPermissionDenied
                ? `Attention. Webcam interface is offline. Security lockdown is active. Please click the decrypt button on your screen to bypass.`
                : `Biometric authentication failed. I've initiated manual bypass. Please click the decrypt button to force unlock the interface.`;
            MikeAI.speak(speakText);
        }

        // Setup button trigger
        const decryptBtn = document.getElementById('decrypt-bypass-btn');
        if (decryptBtn) {
            decryptBtn.disabled = false;
            decryptBtn.onclick = async () => {
                decryptBtn.disabled = true;

                // Stop any speaking of Mike immediately
                if (typeof MikeAI !== 'undefined' && MikeAI.stopSpeakingImmediate) {
                    MikeAI.stopSpeakingImmediate();
                }

                // Fetch public IP address to show in logs!
                let ipAddress = '192.168.1.108'; // fallback local IP
                try {
                    const res = await fetch('https://api.ipify.org?format=json');
                    if (res.ok) {
                        const data = await res.json();
                        ipAddress = data.ip;
                    }
                } catch (e) {}

                // Play glitch click sound
                if (typeof AudioFX !== 'undefined') AudioFX.play('glitch');

                // Print logs line by line over 5 seconds
                const logLines = [
                    { t: `[0.0s] INITIATING DIRECT BYPASS EXPLOIT...`, c: 'log-warn' },
                    { t: `[0.6s] CONNECTING TO NET CONTEXT...`, c: '' },
                    { t: `[1.2s] LOCAL NET DIAGNOSTIC COMPLETE.`, c: 'log-success' },
                    { t: `[1.8s] HOST IP CAPTURED: ${ipAddress}`, c: 'log-success' },
                    { t: `[2.4s] SCANNING INTERFACES FOR ACTIVE PORTS [22, 80, 443]...`, c: '' },
                    { t: `[3.0s] CAPTURING PUBLIC CRYPTO SEED BLOCK...`, c: 'log-warn' },
                    { t: `[3.6s] SPOOFING HOST SIGNATURE MATRIX...`, c: '' },
                    { t: `[4.2s] SYSTEM GRANTED INJECTION TOKEN SECURED.`, c: 'log-success' },
                    { t: `[4.8s] DISARMING FIREWALL SECURITY BLOCKADE...`, c: 'log-success' },
                    { t: `[5.0s] LOCKDOWN TERMINATED. SYSTEM AUTHORIZED.`, c: 'log-success' }
                ];

                if (logsEl) {
                    logsEl.innerHTML = '';
                }

                for (let i = 0; i < logLines.length; i++) {
                    const line = logLines[i];
                    await sleep(500); // 10 lines * 500ms = 5000ms (5 seconds)
                    
                    if (logsEl) {
                        const div = document.createElement('div');
                        if (line.c) div.className = line.c;
                        div.textContent = line.t;
                        logsEl.appendChild(div);
                        logsEl.scrollTop = logsEl.scrollHeight;
                    }

                    if (typeof AudioFX !== 'undefined') {
                        AudioFX.play('decrypt'); // Cool synthesized blips instead of standard clicks
                    }
                }

                // Stop the blaring alarm once decryption succeeds
                if (typeof AudioFX !== 'undefined') {
                    AudioFX.stopAlarm();
                }

                // Transition to Access Granted!
                await sleep(500);
                if (container) {
                    container.style.display = 'none';
                }
                
                // Show access granted
                if (granted) {
                    granted.style.display = 'block';
                    granted.classList.add('visible');
                }
                if (typeof AudioFX !== 'undefined') AudioFX.play('accessGranted');

                await sleep(1200);

                // Cleanup streams
                if (webcamStream) {
                    webcamStream.getTracks().forEach(track => track.stop());
                    webcamStream = null;
                }

                // Fade out face scan overlay
                if (faceScanOverlay) {
                    faceScanOverlay.style.transition = 'opacity 0.5s ease';
                    faceScanOverlay.classList.remove('visible');
                }

                await sleep(500);
                startStep3_Decipher();
            };
        }
    }

    /**
     * Animated ultra-realistic biometric retina & iris scan on canvas.
     * Renders fundus retinal blood vessels, optic disc, 3D surface topography mesh,
     * 360 optical laser beam, feature target lock reticles, and live cyber telemetry.
     */
    function startRetinaScanAnimation(canvas) {
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        const cx = W / 2;
        const cy = H / 2;
        const maxR = Math.min(W, H) * 0.42;
        const startTime = Date.now();

        // Fixed optic nerve head position & minutiae feature nodes
        const opticDiscX = cx + maxR * 0.28;
        const opticDiscY = cy - maxR * 0.15;

        // Retinal vascular tree branches (bezier curves starting from optic disc)
        const vesselBranches = [
            { start: [opticDiscX, opticDiscY], cp1: [opticDiscX - 35, opticDiscY - 55], cp2: [cx - 20, cy - maxR * 0.7], end: [cx - maxR * 0.65, cy - maxR * 0.75] },
            { start: [opticDiscX - 35, opticDiscY - 55], cp1: [cx + 10, cy - maxR * 0.5], cp2: [cx + maxR * 0.5, cy - maxR * 0.65], end: [cx + maxR * 0.7, cy - maxR * 0.7] },
            { start: [opticDiscX, opticDiscY], cp1: [opticDiscX - 30, opticDiscY + 55], cp2: [cx - 10, cy + maxR * 0.65], end: [cx - maxR * 0.55, cy + maxR * 0.78] },
            { start: [opticDiscX - 30, opticDiscY + 55], cp1: [cx + 20, cy + maxR * 0.55], cp2: [cx + maxR * 0.55, cy + maxR * 0.6], end: [cx + maxR * 0.75, cy + maxR * 0.55] },
            { start: [opticDiscX, opticDiscY], cp1: [opticDiscX + 40, opticDiscY - 30], cp2: [cx + maxR * 0.6, cy - maxR * 0.3], end: [cx + maxR * 0.78, cy - maxR * 0.25] },
            { start: [opticDiscX, opticDiscY], cp1: [opticDiscX + 45, opticDiscY + 30], cp2: [cx + maxR * 0.65, cy + maxR * 0.35], end: [cx + maxR * 0.8, cy + maxR * 0.35] },
            { start: [opticDiscX, opticDiscY], cp1: [cx + 10, cy - 20], cp2: [cx - 30, cy - 10], end: [cx - maxR * 0.3, cy + 5] }
        ];

        // Biometric feature nodes (for target lock reticles)
        const featureNodes = [
            { x: opticDiscX - 35, y: opticDiscY - 55, label: 'V-BIF 01' },
            { x: cx - 20, y: cy - maxR * 0.7, label: 'V-BIF 02' },
            { x: opticDiscX - 30, y: opticDiscY + 55, label: 'V-BIF 03' },
            { x: cx - 10, y: cy + maxR * 0.65, label: 'V-BIF 04' },
            { x: cx - maxR * 0.3, y: cy + 5, label: 'MACULA' },
            { x: opticDiscX, y: opticDiscY, label: 'OPTIC_DISC' }
        ];

        function draw() {
            const t = (Date.now() - startTime) / 1000;

            ctx.clearRect(0, 0, W, H);

            // Deep obsidian biometric background
            ctx.fillStyle = '#030806';
            ctx.fillRect(0, 0, W, H);

            // Eyeball sclera outer boundary with subtle ambient glow
            const scleraGrad = ctx.createRadialGradient(cx, cy, maxR * 0.2, cx, cy, maxR * 0.98);
            scleraGrad.addColorStop(0, 'rgba(8, 24, 18, 0.95)');
            scleraGrad.addColorStop(0.65, 'rgba(6, 18, 14, 0.9)');
            scleraGrad.addColorStop(1, 'rgba(2, 6, 4, 1)');
            ctx.beginPath();
            ctx.arc(cx, cy, maxR * 0.95, 0, Math.PI * 2);
            ctx.fillStyle = scleraGrad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(68, 255, 136, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 1. TOPOGRAPHICAL 3D SPHERICAL WIREFRAME GRID
            ctx.save();
            ctx.strokeStyle = 'rgba(30, 140, 80, 0.15)';
            ctx.lineWidth = 1;
            for (let rFactor of [0.25, 0.45, 0.65, 0.85]) {
                ctx.beginPath();
                ctx.arc(cx, cy, maxR * rFactor, 0, Math.PI * 2);
                ctx.stroke();
            }
            for (let angle = 0; angle < Math.PI; angle += Math.PI / 6) {
                const rotAngle = angle + t * 0.06;
                ctx.beginPath();
                ctx.ellipse(cx, cy, maxR * 0.9, maxR * 0.35 * Math.abs(Math.sin(rotAngle)), rotAngle, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();

            // 2. MACULA & OPTIC NERVE HEAD (FUNDUS ANATOMY)
            const maculaX = cx - maxR * 0.3;
            const maculaY = cy + 5;
            const maculaGrad = ctx.createRadialGradient(maculaX, maculaY, 2, maculaX, maculaY, maxR * 0.25);
            maculaGrad.addColorStop(0, 'rgba(2, 10, 6, 0.95)');
            maculaGrad.addColorStop(0.5, 'rgba(10, 30, 20, 0.5)');
            maculaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.beginPath();
            ctx.arc(maculaX, maculaY, maxR * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = maculaGrad;
            ctx.fill();

            // Optic Nerve Head (Optic Disc) - glowing oval
            const opticGrad = ctx.createRadialGradient(opticDiscX, opticDiscY, 2, opticDiscX, opticDiscY, 24);
            opticGrad.addColorStop(0, 'rgba(255, 235, 180, 0.9)');
            opticGrad.addColorStop(0.4, 'rgba(68, 255, 170, 0.65)');
            opticGrad.addColorStop(1, 'rgba(40, 180, 100, 0)');
            ctx.beginPath();
            ctx.ellipse(opticDiscX, opticDiscY, 20, 26, 0.2, 0, Math.PI * 2);
            ctx.fillStyle = opticGrad;
            ctx.fill();

            // 3. RETINAL BLOOD VESSEL TREE (VASCULAR PATTERN)
            ctx.save();
            vesselBranches.forEach((b, idx) => {
                ctx.beginPath();
                ctx.moveTo(b.start[0], b.start[1]);
                ctx.bezierCurveTo(b.cp1[0], b.cp1[1], b.cp2[0], b.cp2[1], b.end[0], b.end[1]);
                ctx.strokeStyle = idx % 2 === 0 ? 'rgba(255, 80, 80, 0.75)' : 'rgba(68, 255, 180, 0.7)';
                ctx.lineWidth = idx === 0 || idx === 2 ? 3.5 : 2;
                ctx.shadowColor = idx % 2 === 0 ? '#ff3333' : '#44ff88';
                ctx.shadowBlur = 6;
                ctx.stroke();
            });
            ctx.restore();

            // Vessel blood-flow pulse traveling along vessels
            const pulseT = (t * 1.5) % 1;
            vesselBranches.forEach((b) => {
                const p0 = b.start, p1 = b.cp1, p2 = b.cp2, p3 = b.end;
                const u = pulseT;
                const px = Math.pow(1-u,3)*p0[0] + 3*Math.pow(1-u,2)*u*p1[0] + 3*(1-u)*u*u*p2[0] + u*u*u*p3[0];
                const py = Math.pow(1-u,3)*p0[1] + 3*Math.pow(1-u,2)*u*p1[1] + 3*(1-u)*u*u*p2[1] + u*u*u*p3[1];
                
                ctx.beginPath();
                ctx.arc(px, py, 3.5, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#66ffff';
                ctx.shadowBlur = 10;
                ctx.fill();
            });

            // 4. IRIS TEXTURE & PUPIL DYNAMICS
            const irisInnerR = maxR * 0.22;
            const irisOuterR = maxR * 0.72;
            const numFibers = 120;
            ctx.save();
            for (let i = 0; i < numFibers; i++) {
                const angle = (i / numFibers) * Math.PI * 2;
                const wave = Math.sin(angle * 8 + t * 2) * 4;
                const rStart = irisInnerR + (i % 3 === 0 ? 0 : 4);
                const rEnd = irisOuterR - (i % 2 === 0 ? 0 : 8) + wave;
                const alpha = 0.14 + Math.sin(i * 1.7 + t) * 0.08;
                const isCyan = i % 5 === 0;

                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(angle) * rStart, cy + Math.sin(angle) * rStart);
                ctx.lineTo(cx + Math.cos(angle) * rEnd, cy + Math.sin(angle) * rEnd);
                ctx.strokeStyle = isCyan ? `rgba(100, 240, 255, ${alpha + 0.12})` : `rgba(40, 220, 120, ${alpha})`;
                ctx.lineWidth = i % 4 === 0 ? 1.8 : 0.9;
                ctx.stroke();
            }
            ctx.restore();

            // Iris Collarette ring
            ctx.beginPath();
            const colNum = 24;
            for (let i = 0; i <= colNum; i++) {
                const angle = (i / colNum) * Math.PI * 2;
                const r = irisInnerR * 1.25 + (i % 2 === 0 ? 5 : -4);
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.strokeStyle = 'rgba(68, 255, 200, 0.5)';
            ctx.lineWidth = 1.4;
            ctx.stroke();

            // Central Pupil (hippus pupil pulsation)
            const pupilR = maxR * (0.2 + Math.sin(t * 1.8) * 0.015);
            ctx.beginPath();
            ctx.arc(cx, cy, pupilR, 0, Math.PI * 2);
            ctx.fillStyle = '#010403';
            ctx.fill();
            ctx.strokeStyle = 'rgba(68, 255, 136, 0.75)';
            ctx.lineWidth = 2.2;
            ctx.stroke();

            // Cornea Specular Highlight
            ctx.beginPath();
            ctx.ellipse(cx - maxR * 0.25, cy - maxR * 0.28, maxR * 0.18, maxR * 0.08, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
            ctx.fill();

            // 5. ROTATING OPTICAL LASER SCAN BEAM
            const sweepAngle = (t * 2.2) % (Math.PI * 2);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, maxR * 0.94, sweepAngle - 0.45, sweepAngle);
            ctx.closePath();
            const sweepGrad = ctx.createConicGradient(sweepAngle, cx, cy);
            sweepGrad.addColorStop(0, 'rgba(68, 255, 136, 0.4)');
            sweepGrad.addColorStop(0.08, 'rgba(68, 255, 136, 0.06)');
            sweepGrad.addColorStop(0.2, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = sweepGrad;
            ctx.fill();

            // Primary Laser Leading Beam Line
            const beamX = cx + Math.cos(sweepAngle) * maxR * 0.94;
            const beamY = cy + Math.sin(sweepAngle) * maxR * 0.94;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(beamX, beamY);
            ctx.strokeStyle = '#66ffff';
            ctx.shadowColor = '#44ff88';
            ctx.shadowBlur = 12;
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.restore();

            // Secondary Vertical Laser Line Sweep
            const verticalScanY = cy + Math.sin(t * 2.5) * (maxR * 0.85);
            ctx.beginPath();
            ctx.moveTo(cx - maxR * 0.85, verticalScanY);
            ctx.lineTo(cx + maxR * 0.85, verticalScanY);
            ctx.strokeStyle = 'rgba(255, 75, 75, 0.45)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // 6. TARGET LOCK MINUTIAE RETICLES
            featureNodes.forEach((node, idx) => {
                const dx = node.x - cx;
                const dy = node.y - cy;
                const nodeAngle = Math.atan2(dy, dx);
                let diff = Math.abs((sweepAngle % (Math.PI * 2)) - ((nodeAngle + Math.PI * 2) % (Math.PI * 2)));
                if (diff > Math.PI) diff = Math.PI * 2 - diff;

                const isLocked = diff < 0.6 || Math.sin(t * 4 + idx) > 0.1;

                if (isLocked) {
                    const boxSize = 14;
                    ctx.save();
                    ctx.strokeStyle = '#44ff88';
                    ctx.lineWidth = 1.4;
                    ctx.strokeRect(node.x - boxSize/2, node.y - boxSize/2, boxSize, boxSize);

                    ctx.beginPath();
                    ctx.moveTo(node.x - boxSize, node.y); ctx.lineTo(node.x + boxSize, node.y);
                    ctx.moveTo(node.x, node.y - boxSize); ctx.lineTo(node.x, node.y + boxSize);
                    ctx.strokeStyle = 'rgba(68, 255, 136, 0.6)';
                    ctx.stroke();

                    ctx.font = '11px monospace';
                    ctx.fillStyle = '#66ffff';
                    ctx.fillText(`${node.label} [OK]`, node.x + boxSize + 3, node.y + 4);
                    ctx.restore();

                    if (idx > 0) {
                        const prevNode = featureNodes[idx - 1];
                        ctx.beginPath();
                        ctx.moveTo(prevNode.x, prevNode.y);
                        ctx.lineTo(node.x, node.y);
                        ctx.strokeStyle = 'rgba(68, 255, 200, 0.3)';
                        ctx.setLineDash([3, 3]);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }
                }
            });

            // 7. CYBERPUNK HUD GAUGES & DEGREE TICKS
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, maxR * 0.94, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(68, 255, 136, 0.45)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            for (let deg = 0; deg < 360; deg += 15) {
                const rad = (deg * Math.PI) / 180;
                const inner = maxR * (deg % 45 === 0 ? 0.89 : 0.92);
                const outer = maxR * 0.94;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(rad) * inner, cy + Math.sin(rad) * inner);
                ctx.lineTo(cx + Math.cos(rad) * outer, cy + Math.sin(rad) * outer);
                ctx.strokeStyle = deg % 45 === 0 ? '#44ff88' : 'rgba(68, 255, 136, 0.35)';
                ctx.lineWidth = deg % 45 === 0 ? 1.8 : 1;
                ctx.stroke();
            }

            const progress = Math.min(1, t / 3.0);
            ctx.beginPath();
            ctx.arc(cx, cy, maxR * 0.98, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
            ctx.strokeStyle = '#66ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();

            // 8. TELEMETRY CORNER OVERLAYS
            ctx.font = '12px monospace';
            ctx.fillStyle = '#44ff88';
            ctx.shadowColor = '#44ff88';
            ctx.shadowBlur = 4;
            
            ctx.fillText('RETINA_ID: 0x' + Math.floor((t * 1234) % 65535).toString(16).toUpperCase().padStart(4, '0'), 14, 24);
            ctx.fillText('IR_SPECTRUM: 850nm', 14, 42);
            ctx.fillText('IOP: 14.6 mmHg', 14, H - 26);
            ctx.fillText('VASCULAR MAP: OK', 14, H - 10);

            ctx.textAlign = 'right';
            ctx.fillText('MATCH: ' + (progress * 100).toFixed(1) + '%', W - 14, 24);
            ctx.fillText('NODES: 6/6 LOCKED', W - 14, 42);
            ctx.fillText('MACULA: VERIFIED', W - 14, H - 26);
            ctx.fillText('SHA256: 9F8A...', W - 14, H - 10);
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

    function triggerRetinaScan() {
        if (bootScreen) {
            bootScreen.style.display = 'flex';
            bootScreen.classList.remove('fade-out');
            if (bootTitle) bootTitle.style.display = 'none';
            if (bootSubtitle) bootSubtitle.classList.remove('visible');
        }
        startStep2_FaceScan();
    }

    return { init, enableSkip, triggerRetinaScan };
})();
