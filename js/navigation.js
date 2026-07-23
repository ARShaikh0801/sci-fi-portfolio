/* ═══════════════════════════════════════════════════════
   NAVIGATION — Tab-Based Section Switching (eDEX-UI style)
   ═══════════════════════════════════════════════════════ */

const Navigation = (() => {
    let tabs = [];
    let sections = [];
    let currentSection = 'landing';
    let shellPath, shellStatus;
    let onSectionChange = null;

    const sectionNames = {
        'landing': '~/home',
        'about': '~/about',
        'experience': '~/experience',
        'education': '~/education',
        'projects': '~/projects',
        'skills': '~/skills',
        'certifications': '~/certifications',
        'achievements': '~/achievements',
        'resume': '~/resume',
        'contact': '~/contact',
    };

    function init(changeCallback) {
        onSectionChange = changeCallback;
        tabs = document.querySelectorAll('#nav-tabs .nav-tab');
        sections = document.querySelectorAll('.content-section');
        shellPath = document.querySelector('#shell-header .shell-path');
        shellStatus = document.querySelector('#shell-header .shell-status');

        // Attach click handlers
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.section;
                if (target) navigateTo(target);
            });
        });

        // Handle URL hash
        const hash = window.location.hash.replace('#', '');
        if (hash && sectionNames[hash]) {
            navigateTo(hash, false);
        } else {
            navigateTo('landing', false);
        }

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyNav);

        // Browser back/forward
        window.addEventListener('popstate', () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && sectionNames[hash]) {
                navigateTo(hash, false);
            }
        });
    }

    function navigateTo(sectionId, updateHash = true) {
        // Play click sound
        if (typeof AudioFX !== 'undefined') AudioFX.play('click');

        // Update tabs
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.section === sectionId);
        });

        // Update sections with animation
        sections.forEach(section => {
            if (section.id === 'section-' + sectionId) {
                section.classList.add('active');
                section.style.animation = 'none';
                section.offsetHeight; // force reflow
                section.style.animation = 'sectionFadeIn 0.5s ease forwards';
            } else {
                section.classList.remove('active');
            }
        });

        // Update shell header path
        if (shellPath) {
            shellPath.textContent = sectionNames[sectionId] || '~/' + sectionId;
        }

        // Update shell status
        if (shellStatus) {
            const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
            shellStatus.textContent = timestamp + ' ◄ CONNECTED';
        }

        currentSection = sectionId;

        // Update URL hash
        if (updateHash) {
            history.pushState(null, '', '#' + sectionId);
        }

        // Scroll main content to top
        const shellContent = document.getElementById('shell-content');
        if (shellContent) shellContent.scrollTop = 0;

        // Trigger callback
        if (onSectionChange) onSectionChange(sectionId);
    }

    function handleKeyNav(e) {
        // Only handle if not typing in a form
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const tabList = Array.from(tabs);
        const currentIndex = tabList.findIndex(t => t.classList.contains('active'));

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % tabList.length;
            const nextSection = tabList[nextIndex].dataset.section;
            navigateTo(nextSection);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + tabList.length) % tabList.length;
            const prevSection = tabList[prevIndex].dataset.section;
            navigateTo(prevSection);
        }
    }

    function getCurrentSection() {
        return currentSection;
    }

    return { init, navigateTo, getCurrentSection };
})();
