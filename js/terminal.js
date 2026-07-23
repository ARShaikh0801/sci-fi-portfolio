/* ═══════════════════════════════════════════════════════
   TERMINAL — Typewriter Effect Engine with Audio Support
   ═══════════════════════════════════════════════════════ */

const Terminal = (() => {
    const defaultOptions = {
        speed: 30,          // ms per character
        startDelay: 0,      // ms before typing starts
        cursor: true,       // show blinking cursor
        html: false,        // allow HTML content
        sound: true,        // play typing sound
    };

    /**
     * Check if element is currently active and visible on page
     */
    function isElementVisible(el) {
        if (!el) return false;
        const parentSection = el.closest('.content-section');
        if (parentSection && !parentSection.classList.contains('active')) {
            return false;
        }
        return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
    }

    /**
     * Type text into an element character by character.
     * @param {HTMLElement} element - Target element
     * @param {string} text - Text to type
     * @param {object} options - Typing options
     * @returns {Promise} Resolves when typing is complete
     */
    function typeText(element, text, options = {}) {
        const opts = { ...defaultOptions, ...options };

        return new Promise((resolve) => {
            setTimeout(() => {
                let i = 0;
                element.textContent = '';

                if (opts.cursor) {
                    element.classList.add('cursor-blink');
                }

                const interval = setInterval(() => {
                    if (i < text.length) {
                        const char = text.charAt(i);
                        if (opts.html) {
                            element.innerHTML += char;
                        } else {
                            element.textContent += char;
                        }

                        // Play typing sound ONLY if element is currently visible/active
                        if (opts.sound && char !== ' ' && isElementVisible(element) && typeof AudioFX !== 'undefined') {
                            AudioFX.play('type');
                        }

                        i++;
                    } else {
                        clearInterval(interval);
                        if (opts.cursor) {
                            // Keep cursor blinking for a moment, then remove
                            setTimeout(() => {
                                element.classList.remove('cursor-blink');
                                resolve();
                            }, 800);
                        } else {
                            resolve();
                        }
                    }
                }, opts.speed);
            }, opts.startDelay);
        });
    }

    /**
     * Type multiple lines sequentially into a container.
     * @param {HTMLElement} container - Container element
     * @param {Array<string>} lines - Array of text lines
     * @param {object} options - Typing options
     * @returns {Promise}
     */
    async function typeLines(container, lines, options = {}) {
        const opts = { ...defaultOptions, ...options, cursor: false };

        for (const line of lines) {
            const lineEl = document.createElement('div');
            lineEl.className = 'terminal-line';
            container.appendChild(lineEl);
            await typeText(lineEl, line, opts);
        }
    }

    /**
     * Create a typing effect that cycles through texts.
     * @param {HTMLElement} element - Target element
     * @param {Array<string>} texts - Array of texts to cycle
     * @param {object} options - Typing options
     */
    function typeCycle(element, texts, options = {}) {
        const opts = {
            speed: 50,
            deleteSpeed: 35,
            pauseDuration: 2500,
            sound: true,
            ...options
        };

        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        element.classList.add('cursor-blink');

        function tick() {
            const currentText = texts[textIndex];

            if (isDeleting) {
                element.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                const nextChar = currentText.charAt(charIndex);
                element.textContent = currentText.substring(0, charIndex + 1);
                // Play typing sound ONLY when section is active and element is visible
                if (opts.sound && nextChar !== ' ' && isElementVisible(element) && typeof AudioFX !== 'undefined') {
                    AudioFX.play('type');
                }
                charIndex++;
            }

            let nextDelay = isDeleting ? opts.deleteSpeed : opts.speed;

            if (!isDeleting && charIndex === currentText.length) {
                // Pause at full text
                nextDelay = opts.pauseDuration;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                // Move to next text
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                nextDelay = 300;
            }

            setTimeout(tick, nextDelay);
        }

        setTimeout(tick, opts.speed);
    }

    return { typeText, typeLines, typeCycle };
})();
