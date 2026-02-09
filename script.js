// Custom A-Frame component for the Walking Fish
AFRAME.registerComponent('walking-fish', {
    init: function () {
        const el = this.el;

        // Create a central body
        const body = document.createElement('a-sphere');
        body.setAttribute('radius', 0.5);
        body.setAttribute('scale', '1 0.8 1.4');
        body.setAttribute('material', {
            color: '#FF4D4D',
            roughness: 0.3,
            metalness: 0.2
        });
        el.appendChild(body);

        // Fish Tail
        const tail = document.createElement('a-cone');
        tail.setAttribute('radius-bottom', 0.3);
        tail.setAttribute('radius-top', 0.01);
        tail.setAttribute('height', 0.6);
        tail.setAttribute('position', '0 0 -1');
        tail.setAttribute('rotation', '90 0 0');
        tail.setAttribute('material', { color: '#FF4D4D' });
        el.appendChild(tail);

        // Animation for tail
        tail.setAttribute('animation', {
            property: 'rotation',
            from: '90 -15 0',
            to: '90 15 0',
            dir: 'alternate',
            dur: 400,
            loop: true,
            easing: 'easeInOutQuad'
        });

        // Side Fins
        const finConfigs = [{ x: 0.5, y: 0, r: 45, side: 'right' }, { x: -0.5, y: 0, r: -45, side: 'left' }];
        finConfigs.forEach(pos => {
            const fin = document.createElement('a-triangle');
            fin.setAttribute('vertex-a', '0 0.2 0');
            fin.setAttribute('vertex-b', '0 -0.2 0');
            fin.setAttribute('vertex-c', '0.4 0 0');
            fin.setAttribute('material', { color: '#FF4D4D', side: 'double' });
            fin.setAttribute('position', `${pos.x} 0 0.2`);
            fin.setAttribute('rotation', `0 0 ${pos.r}`);
            el.appendChild(fin);
        });

        // Eyes
        const eyeConfigs = [{ x: 0.3, z: 0.6 }, { x: -0.3, z: 0.6 }];
        eyeConfigs.forEach(pos => {
            const eye = document.createElement('a-sphere');
            eye.setAttribute('radius', 0.1);
            eye.setAttribute('material', { color: '#000' });
            eye.setAttribute('position', `${pos.x} 0.2 ${pos.z}`);
            el.appendChild(eye);
        });

        // Legs
        const legPositions = [
            { x: 0.25, z: 0.3 }, { x: -0.25, z: 0.3 },
            { x: 0.25, z: -0.2 }, { x: -0.25, z: -0.2 }
        ];

        legPositions.forEach((pos, index) => {
            const leg = document.createElement('a-cylinder');
            leg.setAttribute('radius', 0.05);
            leg.setAttribute('height', 0.5);
            leg.setAttribute('material', { color: '#FFC0CB' });
            leg.setAttribute('position', `${pos.x} -0.4 ${pos.z}`);

            const delay = (index % 2 === 0) ? 0 : 250;
            leg.setAttribute('animation', {
                property: 'rotation',
                from: '-20 0 0',
                to: '20 0 0',
                dir: 'alternate',
                dur: 500,
                delay: delay,
                loop: true,
                easing: 'easeInOutQuad'
            });
            el.appendChild(leg);
        });

        // Overall walking bobbing animation
        el.setAttribute('animation', {
            property: 'position',
            dir: 'alternate',
            dur: 500,
            loop: true,
            easing: 'easeInOutQuad',
            from: '0 0 0',
            to: '0 0.1 0' // Slight bobbing up and down
        });
    }
});

// App Logic
document.querySelector('#start-btn').addEventListener('click', () => {
    const overlay = document.querySelector('#ui-overlay');
    const status = document.querySelector('#status');
    status.innerText = "Requesting Location...";

    // Hide UI
    overlay.classList.add('hidden');

    // Show refresh button after initial start
    document.querySelector('#refresh-btn').style.display = 'block';

    // Get location and spawn fish
    getCurrentLocationAndSpawn();
});

document.querySelector('#refresh-btn').addEventListener('click', () => {
    // Remove existing fish
    const existingFish = document.querySelector('#my-fish');
    if (existingFish) existingFish.parentNode.removeChild(existingFish);
    const existingBadge = document.querySelector('#info-badge');
    if (existingBadge) existingBadge.parentNode.removeChild(existingBadge);

    getCurrentLocationAndSpawn();
});

function getCurrentLocationAndSpawn() {
    const status = document.querySelector('#status');
    status.innerText = "Requesting Location..."; // Update status for refresh

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                spawnFish(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
                console.warn("Location error, entering Preview Mode: ", err);
                status.innerText = "Preview Mode (No GPS)"; // Update status for error
                spawnFish(null, null);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    } else {
        spawnFish(null, null);
    }
}

function spawnFish(userLat, userLon) {
    const container = document.querySelector('#fish-container');
    const fish = document.createElement('a-entity');
    fish.setAttribute('id', 'my-fish');
    fish.setAttribute('walking-fish', '');
    // Removed look-at to prevent weird tilting

    // Scale for visibility without being overwhelming
    fish.setAttribute('scale', '2 2 2');

    // For GPS Mode, we want it definitely further. 0.0003 is ~33m.
    if (userLat && userLon) {
        // GPS Mode
        const offsetLat = userLat + 0.0003;
        const offsetLon = userLon + 0.0003;
        fish.setAttribute('gps-entity-place', `latitude: ${offsetLat}; longitude: ${offsetLon};`);
        console.log(`Fish spawned at GPS: ${offsetLat}, ${offsetLon}`);
    } else {
        // Preview Mode: eye level (y: 0) and 30m ahead
        fish.setAttribute('position', '0 0 -30');
        console.log("Fish spawned in Preview Mode (30m ahead)");
    }

    container.appendChild(fish);

    const badge = document.createElement('div');
    badge.id = 'info-badge';
    badge.innerText = userLat ? "🐠 Fish spotted further ahead! Look around." : "🐠 Preview Mode: Fish placed 30m ahead.";
    document.body.appendChild(badge);

    // Dynamic Follow (Optional): Update position every 10 seconds to stay near user
    setInterval(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const currentLat = pos.coords.latitude;
            const currentLon = pos.coords.longitude;
            // Update to a new nearby spot if user moves too far
            // For now, let's just keep it at its original spot for 'world' immersion,
            // but we could update gps-entity-place here if we wanted it to 'follow'
        });
    }, 10000);
}
