/* ═══════════════════════════════════════════════════════
   TERMINAL COMMANDS — Command Parser & Easter Eggs
   ═══════════════════════════════════════════════════════ */

const TerminalCmd = (() => {
    let inputEl = null;
    let logEl = null;
    let drawerEl = null;
    let matrixInterval = null;
    let matrixCanvas = null;
    let matrixCtx = null;

    // Command History Variables
    const commandHistory = [];
    let historyIndex = -1;

    function init() {
        inputEl = document.getElementById('terminal-input');
        logEl = document.getElementById('console-logs');
        drawerEl = document.getElementById('terminal-console-drawer');
        matrixCanvas = document.getElementById('matrix-canvas');

        if (!inputEl) return;

        // Input Keyboard Listeners (Enter, Up Arrow, Down Arrow)
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = inputEl.value.trim();
                if (cmd) {
                    execute(cmd);
                    // Add to history if it's different from the last typed command
                    if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== cmd) {
                        commandHistory.push(cmd);
                    }
                    historyIndex = -1; // Reset history index
                    inputEl.value = '';
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (commandHistory.length === 0) return;
                
                if (historyIndex === -1) {
                    historyIndex = commandHistory.length - 1;
                } else if (historyIndex > 0) {
                    historyIndex--;
                }
                inputEl.value = commandHistory[historyIndex];
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (commandHistory.length === 0 || historyIndex === -1) return;
                
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    inputEl.value = commandHistory[historyIndex];
                } else {
                    historyIndex = -1;
                    inputEl.value = '';
                }
            }
        });

        // Global Keydown Listener to focus terminal when pressing "/"
        document.addEventListener('keydown', (e) => {
            const activeTag = document.activeElement.tagName;
            if (e.key === '/' && activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
                e.preventDefault();
                inputEl.focus();
                inputEl.value = '/';
            }
        });
    }

    function openDrawer() {
        if (drawerEl) {
            drawerEl.classList.add('open');
        }
    }

    function closeDrawer() {
        if (drawerEl) {
            drawerEl.classList.remove('open');
        }
    }

    function log(text, isError = false) {
        if (!logEl) return;
        openDrawer();

        const line = document.createElement('div');
        line.className = 'log-line';
        line.style.color = isError ? 'var(--color-red)' : 'var(--accent-dim)';
        line.textContent = text;
        logEl.appendChild(line);
        logEl.scrollTop = logEl.scrollHeight;
    }

    async function execute(cmdString) {
        const parts = cmdString.split(' ');
        const mainCmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        log(`guest@arshaikh:~$ ${cmdString}`);

        if (typeof AudioFX !== 'undefined') {
            AudioFX.play('type');
        }

        switch (mainCmd) {
            case '/help':
                log('── COMMAND UTILITIES ──');
                log('/retina, /scan   - Trigger ultra-realistic biometric retina scan animation');
                log('/matrix          - Toggle the falling digital matrix code overlay');
                log('/hack            - Start a mock profile security bypass decryption');
                log('/theme -color    - Shift accent theme (-cyan, -green, -red, -yellow, -blue)');
                log('/clear           - Clear console screen history');
                log('/about           - Route: View Profile Biography');
                log('/projects        - Route: View Systems Directory');
                log('/contact         - Route: View Connection Endpoints');
                log('/resume          - Route: View Resume System');
                break;

            case '/retina':
            case '/scan':
                log('[ BIOMETRIC SCANNER ]: INITIATING RETINAL BIOMETRIC VERIFICATION...');
                closeDrawer();
                if (typeof BootSequence !== 'undefined' && BootSequence.triggerRetinaScan) {
                    BootSequence.triggerRetinaScan();
                }
                break;

            case '/clear':
                if (logEl) logEl.innerHTML = '';
                closeDrawer();
                break;

            case '/about':
            case '/projects':
            case '/contact':
            case '/resume':
                const section = mainCmd.substring(1);
                log(`[ ROUTING ]: NAVIGATING TO SECTION [ ${section.toUpperCase()} ]`);
                if (typeof Navigation !== 'undefined') {
                    Navigation.navigateTo(section);
                }
                break;

            case '/theme':
                const themeColor = args[0] ? args[0].toLowerCase().replace(/^-/, '') : '';
                if (themeColor === 'green') {
                    setThemeRGB(68, 255, 136); // Bright matrix green
                    log('[ SYSTEM ]: THEME SHIFTED TO [ MATRIX GREEN ]');
                } else if (themeColor === 'cyan') {
                    setThemeRGB(170, 207, 209); // Default cyber cyan
                    log('[ SYSTEM ]: THEME SHIFTED TO [ CYBER CYAN ]');
                } else if (themeColor === 'red') {
                    setThemeRGB(255, 68, 68); // Alert red
                    log('[ SYSTEM ]: THEME SHIFTED TO [ ALERT RED ]');
                } else if (themeColor === 'yellow') {
                    setThemeRGB(255, 204, 68); // Warn yellow
                    log('[ SYSTEM ]: THEME SHIFTED TO [ WARNING YELLOW ]');
                } else if (themeColor === 'blue') {
                    setThemeRGB(68, 136, 255); // Neon blue
                    log('[ SYSTEM ]: THEME SHIFTED TO [ NEON BLUE ]');
                } else {
                    log('[ ERROR ]: INVALID THEME. Options: -green, -cyan, -red, -yellow, -blue', true);
                }
                break;

            case '/hack':
                await runMockHack();
                break;

            case '/matrix':
                toggleMatrixRain();
                break;

            default:
                log(`[ ERROR ]: COMMAND NOT FOUND: ${mainCmd}. Type /help for assistance.`, true);
                if (typeof AudioFX !== 'undefined') AudioFX.play('beep');
                break;
        }
    }

    function setThemeRGB(r, g, b) {
        document.documentElement.style.setProperty('--color-r', r);
        document.documentElement.style.setProperty('--color-g', g);
        document.documentElement.style.setProperty('--color-b', b);
        
        // Re-trigger graphs and elements to adapt colors
        const canvasList = document.querySelectorAll('.line-graph canvas');
        canvasList.forEach(canvas => {
            canvas.style.borderColor = `rgb(${r}, ${g}, ${b})`;
        });
    }

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function runMockHack() {
        log('── WARNING: INITIATING DATA CORRELATION SECURITY BYPASS ──');
        if (typeof AudioFX !== 'undefined') AudioFX.play('beep');
        await sleep(600);

        log('[ CONNECTING ]: ESTABLISHING SOCKET PORT LINK...');
        if (typeof AudioFX !== 'undefined') AudioFX.play('type');
        await sleep(800);

        log('[ BYPASS ]: STRIKING CLOUD SYSTEM ACCESS CODES... SUCCESS');
        if (typeof AudioFX !== 'undefined') AudioFX.play('type');
        await sleep(700);

        log('[ DECRYPTING ]: EXTRACTING USER PROFILE CLOUD CONTAINER:');
        let pct = 0;
        while (pct < 100) {
            pct += Math.floor(Math.random() * 25) + 10;
            if (pct > 100) pct = 100;
            log(`  - OVERRIDING STORAGE DIRECTORY: [ ${pct}% ] Completed`);
            if (typeof AudioFX !== 'undefined') AudioFX.play('type');
            await sleep(400);
        }

        log('[ VERIFIED ]: ENCRYPTED LOGS ACCESS GRANTED.');
        if (typeof AudioFX !== 'undefined') AudioFX.play('accessGranted');
        
        // Screen Glitch Trigger
        document.body.classList.add('glitch-active');
        setTimeout(() => {
            document.body.classList.remove('glitch-active');
        }, 500);
    }

    /* ── Falling Digital Rain Matrix Overlay ── */
    function toggleMatrixRain() {
        if (!matrixCanvas) return;

        if (matrixInterval) {
            // Stop Matrix
            clearInterval(matrixInterval);
            matrixInterval = null;
            matrixCanvas.style.opacity = '0';
            setTimeout(() => {
                matrixCanvas.style.display = 'none';
            }, 1000);
            log('[ SYSTEM ]: DIGITAL MATRIX RAIN SHUTDOWN.');
            return;
        }

        // Start Matrix
        log('[ SYSTEM ]: LAUNCHING OVERLAY: DIGITAL MATRIX CODE RAIN...');
        matrixCanvas.style.display = 'block';
        matrixCanvas.style.opacity = '0.75';

        matrixCtx = matrixCanvas.getContext('2d');
        resizeMatrixCanvas();
        window.addEventListener('resize', resizeMatrixCanvas);

        const columns = Math.floor(matrixCanvas.width / 16);
        const yPositions = Array(columns).fill(0);
        const chars = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1028347895ABCDEF";

        function step() {
            matrixCtx.fillStyle = 'rgba(5, 8, 13, 0.05)';
            matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            matrixCtx.fillStyle = `rgb(${document.documentElement.style.getPropertyValue('--color-r') || 170}, ${document.documentElement.style.getPropertyValue('--color-g') || 207}, ${document.documentElement.style.getPropertyValue('--color-b') || 209})`;
            matrixCtx.font = '14px monospace';

            yPositions.forEach((y, index) => {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = index * 16;
                matrixCtx.fillText(char, x, y);

                if (y > 100 + Math.random() * 10000) {
                    yPositions[index] = 0;
                } else {
                    yPositions[index] = y + 16;
                }
            });
        }

        matrixInterval = setInterval(step, 45);

        // Auto stop after 10 seconds
        setTimeout(() => {
            if (matrixInterval) {
                toggleMatrixRain();
            }
        }, 10000);
    }

    function resizeMatrixCanvas() {
        if (matrixCanvas) {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
        }
    }

    return { init, log, closeDrawer };
})();
