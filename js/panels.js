/* ═══════════════════════════════════════════════════════
   PANELS — Panel Animations & Interactions
   ═══════════════════════════════════════════════════════ */

const Panels = (() => {
    function init() {
        setupLightbox();
        setupResumeDownload();
        setupProjectExpansion();
        setupPanelHoverEffects();
        setupDragAndDrop();
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
            if (leftPanel) {
                leftPanel.classList.add('activated');
                leftPanel.querySelectorAll('.panel').forEach((p, idx) => {
                    p.style.animationDelay = `${0.1 + idx * 0.12}s`;
                });
            }
        }, 200);

        setTimeout(() => {
            const rightPanel = document.getElementById('right-panel');
            if (rightPanel) {
                rightPanel.classList.add('activated');
                rightPanel.querySelectorAll('.panel').forEach((p, idx) => {
                    p.style.animationDelay = `${0.15 + idx * 0.12}s`;
                });
            }
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

    /* ── Interactive Dynamic Activity Line Graph ── */
    function initLineGraphs() {
        let userActivityEnergy = 0;

        // Listen for mouse movements, key presses, and user input to boost signal activity
        window.addEventListener('mousemove', () => { userActivityEnergy = Math.min(userActivityEnergy + 0.35, 3.5); }, { passive: true });
        window.addEventListener('keydown', () => { userActivityEnergy = Math.min(userActivityEnergy + 0.6, 4.5); }, { passive: true });
        window.addEventListener('click', () => { userActivityEnergy = Math.min(userActivityEnergy + 0.8, 5.0); }, { passive: true });

        document.querySelectorAll('.line-graph canvas').forEach(canvas => {
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth * 2;
            canvas.height = canvas.offsetHeight * 2;
            ctx.scale(2, 2);

            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;
            let points = [];
            const numPoints = 50;

            for (let i = 0; i < numPoints; i++) {
                points.push(height * 0.5);
            }

            function draw() {
                ctx.clearRect(0, 0, width, height);

                // Decay user interaction activity energy smoothly over time
                userActivityEnergy *= 0.94;

                // Check if AI is currently speaking or listening
                let aiEnergy = 0;
                if (typeof MikeAI !== 'undefined') {
                    if (MikeAI.isSpeaking) aiEnergy = 3.5;
                    else if (MikeAI.isListening) aiEnergy = 2.0;
                }

                const totalEnergy = 1 + userActivityEnergy + aiEnergy;

                // Draw grid lines
                ctx.strokeStyle = 'rgba(170, 207, 209, 0.08)';
                ctx.lineWidth = 0.5;
                for (let y = 0; y < height; y += height / 4) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }

                // Draw line graph
                const isHighActivity = totalEnergy > 2.5;
                ctx.strokeStyle = isHighActivity ? 'rgba(0, 255, 204, 0.85)' : 'rgba(0, 229, 255, 0.5)';
                ctx.lineWidth = isHighActivity ? 1.5 : 1;
                ctx.shadowBlur = isHighActivity ? 10 : 0;
                ctx.shadowColor = ctx.strokeStyle;

                ctx.beginPath();
                const segWidth = width / (numPoints - 1);
                for (let i = 0; i < numPoints; i++) {
                    const x = i * segWidth;
                    if (i === 0) ctx.moveTo(x, points[i]);
                    else ctx.lineTo(x, points[i]);
                }
                ctx.stroke();

                // Fill under line graph
                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.closePath();
                ctx.fillStyle = isHighActivity ? 'rgba(0, 255, 204, 0.12)' : 'rgba(0, 229, 255, 0.05)';
                ctx.fill();

                // Shift points with dynamic amplitude based on mouse/key/voice activity
                points.shift();
                const noise = (Math.random() - 0.5) * (height * 0.25) * totalEnergy;
                const newPoint = Math.max(4, Math.min(height - 4, (height * 0.5) + noise));
                points.push(newPoint);

                requestAnimationFrame(draw);
            }

            draw();
        });
    }

    let draggedElement = null;

    function setupDragAndDrop() {
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            panel.setAttribute('draggable', 'true');

            panel.addEventListener('dragstart', (e) => {
                draggedElement = panel;
                panel.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', ''); // Required for Firefox
                if (typeof AudioFX !== 'undefined') AudioFX.play('beep');
            });

            panel.addEventListener('dragover', (e) => {
                e.preventDefault();
                return false;
            });

            panel.addEventListener('dragenter', (e) => {
                if (panel !== draggedElement) {
                    panel.classList.add('drag-over');
                }
            });

            panel.addEventListener('dragleave', () => {
                panel.classList.remove('drag-over');
            });

            panel.addEventListener('dragend', () => {
                document.querySelectorAll('.panel').forEach(p => p.classList.remove('dragging', 'drag-over'));
                draggedElement = null;
            });

            panel.addEventListener('drop', (e) => {
                e.stopPropagation();
                if (draggedElement && draggedElement !== panel) {
                    swapNodes(draggedElement, panel);
                    if (typeof AudioFX !== 'undefined') AudioFX.play('click');
                }
                return false;
            });
        });
    }

    function swapNodes(node1, node2) {
        const parent1 = node1.parentNode;
        const parent2 = node2.parentNode;
        const next1 = node1.nextSibling;
        const next2 = node2.nextSibling;

        if (parent1 === parent2 && next1 === node2) {
            parent1.insertBefore(node2, node1);
        } else if (parent1 === parent2 && next2 === node1) {
            parent1.insertBefore(node1, node2);
        } else {
            if (next1) {
                parent2.insertBefore(node1, next2);
                parent1.insertBefore(node2, next1);
            } else {
                parent2.insertBefore(node1, next2);
                parent1.appendChild(node2);
            }
        }
    }

    return { init, activateUI, initLineGraphs };
})();
