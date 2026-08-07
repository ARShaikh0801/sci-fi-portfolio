/* ═══════════════════════════════════════════════════════
   APP — Main Application Initializer
   ═══════════════════════════════════════════════════════ */

const App = (() => {
    function init() {
        // Start boot sequence
        Boot.enableSkip();
        Boot.init(onBootComplete);
    }

    function onBootComplete() {
        // Activate main UI panels
        Panels.activateUI();

        // Initialize all modules
        setTimeout(() => {
            Navigation.init(onSectionChange);
            Clock.init();
            Stats.init();
            Panels.init();
            Panels.initLineGraphs();
            AudioFX.init();
            if (typeof CyberGlobe !== 'undefined') {
                CyberGlobe.init();
            }

            // Setup CRT filter
            setupCrtFilter();

            // Initialize terminal commands
            if (typeof TerminalCmd !== 'undefined') {
                TerminalCmd.init();
            }

            // Trigger Mike AI Voice Greeting
            if (typeof MikeAI !== 'undefined') {
                MikeAI.startGreeting();
            }

            // Start landing typing effects
            startLandingEffects();

            // Setup contact form
            setupContactForm();
        }, 300);
    }

    function onSectionChange(sectionId) {
        // Re-trigger skill bars when skills section is opened
        if (sectionId === 'skills') {
            Stats.triggerSkillBars();
        }

        // Optimize performance by pausing globe when landing is inactive
        if (typeof CyberGlobe !== 'undefined') {
            if (sectionId === 'landing') {
                CyberGlobe.init();
            } else {
                CyberGlobe.destroy();
            }
        }

        // Play whoosh on section change
        if (typeof AudioFX !== 'undefined') AudioFX.play('whoosh');
    }

    /* ── Landing Page Typing Effects ── */
    function startLandingEffects() {
        const designation = document.getElementById('landing-designation');
        if (designation) {
            Terminal.typeCycle(designation, [
                'Full-Stack Developer',
                'Django Developer',
                'Backend Engineer',
                'Python Developer',
            ], {
                speed: 60,
                deleteSpeed: 35,
                pauseDuration: 2500,
            });
        }
    }

    /* ── Contact Form (Formspree) ── */
    function setupContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        // Play typing audio on key press in form fields
        form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('keydown', (e) => {
                const ignoredKeys = ['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock', 'Escape'];
                if (!ignoredKeys.includes(e.key) && typeof AudioFX !== 'undefined') {
                    AudioFX.play('type');
                }
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('.form-submit');
            const statusEl = form.querySelector('.form-status');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = '[ TRANSMITTING... ]';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    statusEl.className = 'form-status success';
                    statusEl.textContent = '> MESSAGE TRANSMITTED SUCCESSFULLY. I will respond soon.';
                    form.reset();
                    if (typeof AudioFX !== 'undefined') AudioFX.play('boot');
                } else {
                    throw new Error('Transmission failed');
                }
            } catch (error) {
                statusEl.className = 'form-status error';
                statusEl.textContent = '> ERROR: Transmission failed. Please try email directly.';
                if (typeof AudioFX !== 'undefined') AudioFX.play('beep');
            }

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // Hide status after 5 seconds
            setTimeout(() => {
                statusEl.className = 'form-status';
                statusEl.style.display = 'none';
            }, 5000);
        });
    }

    /* ── CRT Filters & Ambient Glitch Effect ── */
    let crtEnabled = true;
    let glitchInterval = null;

    function setupCrtFilter() {
        const toggle = document.getElementById('filter-toggle');
        const overlay = document.getElementById('crt-overlay');

        const updateFilterUI = () => {
            if (toggle) {
                toggle.classList.toggle('active', crtEnabled);
                toggle.textContent = crtEnabled ? '📺 CRT: ON' : '📺 CRT: OFF';
            }
            if (overlay) {
                overlay.className = crtEnabled ? 'crt-active' : '';
            }
        };

        if (toggle) {
            toggle.addEventListener('click', () => {
                crtEnabled = !crtEnabled;
                updateFilterUI();
                if (typeof AudioFX !== 'undefined') AudioFX.play('click');

                if (crtEnabled) {
                    startGlitchTimer();
                } else {
                    stopGlitchTimer();
                }
            });
        }

        // Initial state
        updateFilterUI();
        if (crtEnabled) {
            startGlitchTimer();
        }
    }

    function startGlitchTimer() {
        if (glitchInterval) clearInterval(glitchInterval);
        glitchInterval = setInterval(() => {
            if (!crtEnabled) return;

            document.body.classList.add('glitch-active');
            if (typeof AudioFX !== 'undefined') AudioFX.play('glitch');

            setTimeout(() => {
                document.body.classList.remove('glitch-active');
            }, 300);
        }, 25000);
    }

    function stopGlitchTimer() {
        if (glitchInterval) {
            clearInterval(glitchInterval);
            glitchInterval = null;
        }
        document.body.classList.remove('glitch-active');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { init };
})();
