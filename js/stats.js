/* ═══════════════════════════════════════════════════════
   STATS — Skill Bar Animations & Stat Counters
   ═══════════════════════════════════════════════════════ */

const Stats = (() => {
    let observer;

    function init() {
        setupSkillBarObserver();
        setupStatCounters();
    }

    /* ── Skill Bar Animation (fills when visible) ── */
    function setupSkillBarObserver() {
        const bars = document.querySelectorAll('.stat-fill');
        if (!bars.length) return;

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const fill = entry.target;
                    const targetWidth = fill.dataset.width;
                    if (targetWidth) {
                        // Small delay for stagger effect
                        const delay = parseInt(fill.dataset.delay) || 0;
                        setTimeout(() => {
                            fill.style.width = targetWidth + '%';
                        }, delay);
                    }
                    observer.unobserve(fill);
                }
            });
        }, { threshold: 0.2 });

        bars.forEach(bar => observer.observe(bar));
    }

    /* ── Animated Stat Counters ── */
    function setupStatCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    function animateCounter(element) {
        const target = element.dataset.count;
        const suffix = element.dataset.suffix || '';
        const prefix = element.dataset.prefix || '';
        const numericTarget = parseInt(target);
        const duration = 1500;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * numericTarget);

            element.textContent = prefix + current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = prefix + target + suffix;
            }
        }

        requestAnimationFrame(update);
    }

    /* ── Trigger skill bar animation for a section ── */
    function triggerSkillBars() {
        const bars = document.querySelectorAll('.stat-fill');
        bars.forEach((bar, i) => {
            const targetWidth = bar.dataset.width;
            if (targetWidth) {
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = targetWidth + '%';
                }, i * 80);
            }
        });
    }

    /* ── Reset skill bars (for re-animation) ── */
    function resetSkillBars() {
        const bars = document.querySelectorAll('.stat-fill');
        bars.forEach(bar => {
            bar.style.width = '0%';
        });
    }

    return { init, triggerSkillBars, resetSkillBars };
})();
