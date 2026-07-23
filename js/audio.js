/* ═══════════════════════════════════════════════════════
   AUDIO FX — Sci-Fi Sound Effects (Default Enabled)
   ═══════════════════════════════════════════════════════ */

const AudioFX = (() => {
    let enabled = true; // Enabled by default
    let audioContext = null;

    function ensureAudioContext() {
        if (!audioContext) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                audioContext = new AudioCtx();
            }
        }
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    function init() {
        const toggle = document.getElementById('audio-toggle');
        if (toggle) {
            toggle.classList.toggle('active', enabled);
            toggle.textContent = enabled ? '♫ SFX: ON' : '♫ SFX: OFF';

            toggle.addEventListener('click', () => {
                enabled = !enabled;
                toggle.classList.toggle('active', enabled);
                toggle.textContent = enabled ? '♫ SFX: ON' : '♫ SFX: OFF';

                if (enabled) {
                    ensureAudioContext();
                    play('click');
                }
            });
        }

        // Auto-resume audio context on first user interaction (browser policy)
        const unlockAudio = () => {
            if (enabled) ensureAudioContext();
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };

        document.addEventListener('click', unlockAudio);
        document.addEventListener('keydown', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
    }

    function play(type) {
        if (!enabled) return;
        ensureAudioContext();
        if (!audioContext) return;

        try {
            switch (type) {
                case 'click':
                    synthClick();
                    break;
                case 'boot':
                    synthBoot();
                    break;
                case 'whoosh':
                    synthWhoosh();
                    break;
                case 'beep':
                    synthBeep();
                    break;
                case 'type':
                    synthType();
                    break;
                case 'accessGranted':
                    synthAccessGranted();
                    break;
                case 'glitch':
                    synthGlitch();
                    break;
                default:
                    synthClick();
            }
        } catch (e) {
            // Silently fail if audio context issue occurs
        }
    }

    /* ── Synthesized Click Sound ── */
    function synthClick() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05);

        gain.gain.setValueAtTime(0.08, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);

        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.08);
    }

    /* ── Synthesized Typing Click ── */
    function synthType() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        // Subtle randomized pitch for organic key clicks
        const freq = 1400 + Math.random() * 400;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);

        gain.gain.setValueAtTime(0.02, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0005, audioContext.currentTime + 0.025);

        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.025);
    }

    /* ── Synthesized Boot Sound ── */
    function synthBoot() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.4);
        osc.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.7);

        gain.gain.setValueAtTime(0.08, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.8);
    }

    /* ── Synthesized Whoosh Sound ── */
    function synthWhoosh() {
        const bufferSize = audioContext.sampleRate * 0.15;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const source = audioContext.createBufferSource();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        source.buffer = buffer;
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.15);
        filter.Q.value = 1;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);

        gain.gain.setValueAtTime(0.06, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

        source.start(audioContext.currentTime);
    }

    /* ── Synthesized Beep Sound ── */
    function synthBeep() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, audioContext.currentTime);

        gain.gain.setValueAtTime(0.04, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.1);
    }

    /* ── Synthesized Sci-Fi Access Granted Sound ── */
    function synthAccessGranted() {
        const now = audioContext.currentTime;

        // Sub Bass impact
        const sub = audioContext.createOscillator();
        const subGain = audioContext.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(150, now);
        sub.frequency.exponentialRampToValueAtTime(45, now + 0.4);
        subGain.gain.setValueAtTime(0.25, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        sub.connect(subGain);
        subGain.connect(audioContext.destination);
        sub.start(now);
        sub.stop(now + 0.5);

        // Futuristic 2-tone chime (E5 -> B5)
        const notes = [659.25, 987.77];
        notes.forEach((freq, idx) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const startTime = now + (idx * 0.09);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.45);
        });
    }

    /* ── Synthesized Sci-Fi Glitch Static Sound (TV Static) ── */
    function synthGlitch() {
        const now = audioContext.currentTime;
        const duration = 0.35; // 350ms

        // Noise buffer
        const bufferSize = audioContext.sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Fill buffer with random noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = buffer;

        // Bandpass filter to make it sound like a radio/TV static crackle
        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + duration);
        filter.Q.value = 1.5;

        // Gain node to shape the envelope (crackle spikes: krr-chk-krrr)
        const noiseGain = audioContext.createGain();
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.02); // Initial burst
        noiseGain.gain.setValueAtTime(0.02, now + 0.08); // Dip
        noiseGain.gain.linearRampToValueAtTime(0.12, now + 0.12); // Second spike
        noiseGain.gain.setValueAtTime(0.01, now + 0.20); // Dip
        noiseGain.gain.linearRampToValueAtTime(0.07, now + 0.24); // Third burst
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        noiseSource.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioContext.destination);

        noiseSource.start(now);
        noiseSource.stop(now + duration);
    }

    function isEnabled() {
        return enabled;
    }

    return { init, play, isEnabled, ensureAudioContext };
})();
