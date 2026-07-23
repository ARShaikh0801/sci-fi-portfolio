/* ═══════════════════════════════════════════════════════
   PANELS — Panel Animations & Interactions
   ═══════════════════════════════════════════════════════ */

const Panels = (() => {
    function init() {
        setupLightbox();
        setupResumeDownload();
        setupProjectExpansion();
        setupPanelHoverEffects();
    }

    /* ── Activate Main UI Panels ── */
    function activateUI() {
        const mainUI = document.getElementById('main-ui');
        if (mainUI) {
            mainUI.classList.add('activated');
        }

        // Stagger panel activations
        setTimeout(() => {
            const leftPanel = document.getElementById('left-panel');
            if (leftPanel) leftPanel.classList.add('activated');
        }, 200);

        setTimeout(() => {
            const rightPanel = document.getElementById('right-panel');
            if (rightPanel) rightPanel.classList.add('activated');
        }, 400);
    }

    /* ── Image Lightbox ── */
    function setupLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        const lightboxImg = lightbox.querySelector('img');
        const lightboxClose = lightbox.querySelector('.lightbox-close');

        // Click on certificate/achievement images to enlarge
        document.querySelectorAll('.cert-image, .achievement-image').forEach(img => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('active');
                if (typeof AudioFX !== 'undefined') AudioFX.play('click');
            });
        });

        // Close lightbox
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            if (typeof AudioFX !== 'undefined') AudioFX.play('click');
        };

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    /* ── Resume Download ── */
    function setupResumeDownload() {
        document.querySelectorAll('.resume-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (typeof AudioFX !== 'undefined') AudioFX.play('click');
            });
        });
    }

    /* ── Project Card Expansion ── */
    function setupProjectExpansion() {
        document.querySelectorAll('.data-card[data-expandable]').forEach(card => {
            const details = card.querySelector('.card-details');
            const toggle = card.querySelector('.card-toggle');

            if (toggle && details) {
                toggle.addEventListener('click', () => {
                    const isExpanded = details.style.display !== 'none';
                    details.style.display = isExpanded ? 'none' : 'block';
                    toggle.textContent = isExpanded ? '[ EXPAND ]' : '[ COLLAPSE ]';
                    if (typeof AudioFX !== 'undefined') AudioFX.play('click');
                });
            }
        });
    }

    /* ── Panel Hover Effects ── */
    function setupPanelHoverEffects() {
        document.querySelectorAll('.panel').forEach(panel => {
            panel.addEventListener('mouseenter', () => {
                panel.style.boxShadow = '0 0 15px var(--accent-ghost)';
            });
            panel.addEventListener('mouseleave', () => {
                panel.style.boxShadow = 'none';
            });
        });
    }

    /* ── Decorative Line Graph ── */
    function initLineGraphs() {
        document.querySelectorAll('.line-graph canvas').forEach(canvas => {
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth * 2;
            canvas.height = canvas.offsetHeight * 2;
            ctx.scale(2, 2);

            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;
            let points = [];
            const numPoints = 50;

            // Initialize random points
            for (let i = 0; i < numPoints; i++) {
                points.push(Math.random() * height * 0.6 + height * 0.2);
            }

            function draw() {
                ctx.clearRect(0, 0, width, height);

                // Draw grid lines
                ctx.strokeStyle = 'rgba(170, 207, 209, 0.08)';
                ctx.lineWidth = 0.5;
                for (let y = 0; y < height; y += height / 4) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }

                // Draw line
                ctx.strokeStyle = 'rgba(170, 207, 209, 0.5)';
                ctx.lineWidth = 1;
                ctx.beginPath();

                const segWidth = width / (numPoints - 1);
                for (let i = 0; i < numPoints; i++) {
                    const x = i * segWidth;
                    if (i === 0) {
                        ctx.moveTo(x, points[i]);
                    } else {
                        ctx.lineTo(x, points[i]);
                    }
                }
                ctx.stroke();

                // Fill under line
                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.closePath();
                ctx.fillStyle = 'rgba(170, 207, 209, 0.05)';
                ctx.fill();

                // Shift points
                points.shift();
                points.push(Math.random() * height * 0.6 + height * 0.2);

                requestAnimationFrame(draw);
            }

            draw();
        });
    }

    return { init, activateUI, initLineGraphs };
})();
