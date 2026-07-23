/* ═══════════════════════════════════════════════════════
   CLOCK — Live Clock Module (eDEX-UI mod_clock style)
   ═══════════════════════════════════════════════════════ */

const Clock = (() => {
    let clockElement, dateElement, uptimeElement;
    let startTime;
    let intervalId;

    function init() {
        clockElement = document.getElementById('clock-display');
        dateElement = document.getElementById('date-display');
        uptimeElement = document.getElementById('uptime-display');
        startTime = Date.now();

        if (clockElement) {
            update();
            intervalId = setInterval(update, 1000);
        }
    }

    function update() {
        const now = new Date();

        // Time display: HH : MM : SS
        if (clockElement) {
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            clockElement.innerHTML =
                `<span>${hours[0]}</span><span>${hours[1]}</span>` +
                `<em>:</em>` +
                `<span>${minutes[0]}</span><span>${minutes[1]}</span>` +
                `<em>:</em>` +
                `<span>${seconds[0]}</span><span>${seconds[1]}</span>`;
        }

        // Date display
        if (dateElement) {
            const year = now.getFullYear();
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                           'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const month = months[now.getMonth()];
            const day = String(now.getDate()).padStart(2, '0');
            const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            const dayName = days[now.getDay()];

            dateElement.textContent = `${year} ${month} ${day} ${dayName}`;
        }

        // Uptime display
        if (uptimeElement) {
            const elapsed = Date.now() - startTime;
            const totalSec = Math.floor(elapsed / 1000);
            const h = Math.floor(totalSec / 3600);
            const m = Math.floor((totalSec % 3600) / 60);
            const s = totalSec % 60;

            uptimeElement.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
    }

    function destroy() {
        if (intervalId) clearInterval(intervalId);
    }

    return { init, destroy };
})();
