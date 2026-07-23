/* ═══════════════════════════════════════════════════════
   CYBER GLOBE — Interactive 3D Canvas Globe centerpiece
   ═══════════════════════════════════════════════════════ */

const CyberGlobe = (() => {
    let canvas = null;
    let ctx = null;
    let animFrame = null;
    let width = 0;
    let height = 0;

    // 3D parameters
    let rotationY = 0;
    const rotationSpeed = 0.005;
    const tilt = 0.35; // Slight tilt
    const radius = 220; // Globe radius

    // Cyber network nodes (lat, lon, status, label)
    const nodes = [
        { lat: 23.60, lon: 72.40, status: 'active', label: 'MEHSANA (HOME)' }, // Home
        { lat: 23.02, lon: 72.57, status: 'active', label: 'AHMEDABAD (VGEC)' }, // College
        { lat: 18.97, lon: 72.82, status: 'active', label: 'MUMBAI_NODE' },
        { lat: 28.61, lon: 77.20, status: 'active', label: 'DELHI_GATEWAY' },
        { lat: 12.97, lon: 77.59, status: 'standby', label: 'BLR_CENTRAL' },
        { lat: 37.77, lon: -122.41, status: 'active', label: 'SF_ROUTE_01' },
        { lat: 51.50, lon: -0.12, status: 'standby', label: 'LND_EDGE' },
        { lat: 35.67, lon: 139.65, status: 'active', label: 'TYO_CORE' },
        { lat: -33.86, lon: 151.20, status: 'standby', label: 'SYD_PORT' },
        { lat: -22.90, lon: -43.17, status: 'active', label: 'RIO_ACCESS' }
    ];

    // Animated data transfer paths
    const transfers = [
        { from: 0, to: 1, progress: 0, speed: 0.02 },
        { from: 0, to: 2, progress: 0.5, speed: 0.015 },
        { from: 1, to: 3, progress: 0.2, speed: 0.012 },
        { from: 2, to: 7, progress: 0.8, speed: 0.008 },
        { from: 3, to: 6, progress: 0.1, speed: 0.01 },
        { from: 5, to: 0, progress: 0.4, speed: 0.014 }
    ];

    function init() {
        canvas = document.getElementById('cyber-globe-canvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);

        // Start loop
        draw();
    }

    function resize() {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        width = rect.width;
        height = rect.height;

        // Support high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    }

    // Convert Lat/Lon to 3D Cartesian coordinates
    function latLonTo3D(lat, lon, r) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        return {
            x: -(r * Math.sin(phi) * Math.sin(theta)),
            y: r * Math.cos(phi),
            z: r * Math.sin(phi) * Math.cos(theta)
        };
    }

    // Rotate 3D point around Y (horizontal) and X (tilt) axes
    function rotatePoint(p, angleY, angleX) {
        // Rotate Y
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;

        // Rotate X (tilt)
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        return { x: x1, y: y2, z: z2 };
    }

    // Simple 3D perspective projection
    function project(p) {
        const distance = 600;
        const scale = distance / (distance - p.z);
        return {
            x: width / 2 + p.x * scale,
            y: height / 2 + p.y * scale,
            visible: p.z > -radius // Don't draw points rotated far behind
        };
    }

    function draw() {
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, width, height);
        rotationY += rotationSpeed;

        const tealAccent = 'rgba(170, 207, 209, 0.1)';
        const tealAccentBright = 'rgba(170, 207, 209, 0.4)';
        const greenAccent = 'rgba(68, 255, 136, 0.7)';

        // 1. Draw Grid lines of Longitude (circles passing through poles)
        const numLongitudes = 8;
        for (let i = 0; i < numLongitudes; i++) {
            const lon = (i / numLongitudes) * 180 - 180;
            ctx.beginPath();
            ctx.strokeStyle = tealAccent;
            ctx.lineWidth = 0.5;

            for (let lat = -90; lat <= 90; lat += 5) {
                const p3d = latLonTo3D(lat, lon, radius);
                const rot = rotatePoint(p3d, rotationY, tilt);
                const proj = project(rot);

                if (lat === -90) {
                    ctx.moveTo(proj.x, proj.y);
                } else {
                    ctx.lineTo(proj.x, proj.y);
                }
            }
            ctx.stroke();
        }

        // 2. Draw Grid lines of Latitude (horizontal circles)
        const numLatitudes = 8;
        for (let i = 1; i < numLatitudes; i++) {
            const lat = (i / numLatitudes) * 180 - 90;
            ctx.beginPath();
            ctx.strokeStyle = tealAccent;
            ctx.lineWidth = 0.5;

            for (let lon = -180; lon <= 180; lon += 5) {
                const p3d = latLonTo3D(lat, lon, radius);
                const rot = rotatePoint(p3d, rotationY, tilt);
                const proj = project(rot);

                if (lon === -180) {
                    ctx.moveTo(proj.x, proj.y);
                } else {
                    ctx.lineTo(proj.x, proj.y);
                }
            }
            ctx.stroke();
        }

        // 3. Project Nodes
        const projectedNodes = nodes.map(node => {
            const p3d = latLonTo3D(node.lat, node.lon, radius);
            const rot = rotatePoint(p3d, rotationY, tilt);
            return {
                proj: project(rot),
                z: rot.z,
                label: node.label,
                status: node.status,
                lat: node.lat,
                lon: node.lon
            };
        });

        // 4. Draw Data Transfer paths
        transfers.forEach(path => {
            const fromNode = projectedNodes[path.from];
            const toNode = projectedNodes[path.to];

            // Only draw path if both nodes are somewhat visible
            if (fromNode.z > -radius/2 && toNode.z > -radius/2) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(170, 207, 209, 0.15)';
                ctx.lineWidth = 1;
                ctx.moveTo(fromNode.proj.x, fromNode.proj.y);
                ctx.lineTo(toNode.proj.x, toNode.proj.y);
                ctx.stroke();

                // Draw moving packet dot
                path.progress += path.speed;
                if (path.progress > 1) path.progress = 0;

                const px = fromNode.proj.x + (toNode.proj.x - fromNode.proj.x) * path.progress;
                const py = fromNode.proj.y + (toNode.proj.y - fromNode.proj.y) * path.progress;

                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fillStyle = greenAccent;
                ctx.fill();
            }
        });

        // 5. Draw Cyber Nodes
        projectedNodes.forEach(node => {
            if (node.z > -radius * 0.3) { // Only draw if on front side
                const blink = Math.sin(Date.now() * 0.005 + node.z) > 0;
                
                // Draw node dot
                ctx.beginPath();
                ctx.arc(node.proj.x, node.proj.y, node.status === 'active' ? 3.5 : 2, 0, Math.PI * 2);
                ctx.fillStyle = node.status === 'active' ? (blink ? greenAccent : 'rgba(68, 255, 136, 0.3)') : tealAccentBright;
                ctx.fill();

                // Blinking signal pulse
                if (node.status === 'active' && blink) {
                    ctx.beginPath();
                    ctx.arc(node.proj.x, node.proj.y, 8, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(68, 255, 136, 0.2)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Node Labels
                ctx.font = '8px monospace';
                ctx.fillStyle = node.status === 'active' ? 'rgba(170, 207, 209, 0.8)' : 'rgba(170, 207, 209, 0.3)';
                ctx.fillText(node.label, node.proj.x + 8, node.proj.y + 3);
            }
        });

        // 6. Cyber HUD Telemetry Diagnostics Overlay
        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(170, 207, 209, 0.6)';
        
        // Coordinates changing based on rotation Y
        const currentLon = ((rotationY * (180 / Math.PI)) % 360 - 180).toFixed(4);
        ctx.fillText(`GEO-LOC: MEHSANA_IN // 23.6000° N, 72.4000° E`, 15, 25);
        ctx.fillText(`SAT_ROTATION: ${currentLon}° W / SPEED: ${rotationSpeed.toFixed(4)} rad/s`, 15, 38);
        ctx.fillText(`LINK_STATUS: STABLE // PACKET_LOSS: 0.00%`, 15, 51);

        const activeSignals = projectedNodes.filter(n => n.z > -radius * 0.3 && n.status === 'active').length;
        ctx.fillText(`ACTIVE_BEACONS: ${activeSignals}/${nodes.length} // DUPLEX_LINKS: ${transfers.length}`, 15, height - 20);

        animFrame = requestAnimationFrame(draw);
    }

    function destroy() {
        if (animFrame) cancelAnimationFrame(animFrame);
        window.removeEventListener('resize', resize);
    }

    return { init, destroy };
})();
