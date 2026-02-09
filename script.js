// Custom A-Frame component for the Walking Fish
AFRAME.registerComponent('walking-fish', {
    init: function () {
        const el = this.el;

        // Fish Body
        const body = document.createElement('a-entity');
        body.setAttribute('geometry', {
            primitive: 'sphere',
            radius: 0.5,
            height: 0.8
        });
        body.setAttribute('scale', '0.6 0.4 1'); // Flatten a bit
        body.setAttribute('material', {
            color: '#FF6B6B',
            roughness: 0.3,
            metalness: 0.2
        });
        el.appendChild(body);

        // Fish Tail
        const tail = document.createElement('a-entity');
        tail.setAttribute('geometry', {
            primitive: 'cone',
            radiusBottom: 0.2,
            radiusTop: 0.01,
            height: 0.4
        });
        tail.setAttribute('position', '0 0 -0.8');
        tail.setAttribute('rotation', '90 0 0');
        tail.setAttribute('material', { color: '#FF6B6B' });
        el.appendChild(tail);

        // Animation for tail
        tail.setAttribute('animation', {
            property: 'rotation',
            from: '80 0 0',
            to: '100 0 0',
            dir: 'alternate',
            dur: 500,
            loop: true,
            easing: 'easeInOutQuad'
        });

        // Side Fins
        const finConfigs = [{ x: 0.4, y: 0, r: 45 }, { x: -0.4, y: 0, r: -45 }];
        finConfigs.forEach(pos => {
            const fin = document.createElement('a-entity');
            fin.setAttribute('geometry', { primitive: 'triangle', vertexA: '0 0.2 0', vertexB: '0 -0.2 0', vertexC: '0.3 0 0' });
            fin.setAttribute('material', { color: '#FF6B6B', side: 'double' });
            fin.setAttribute('position', `${pos.x} ${pos.y} 0`);
            fin.setAttribute('rotation', `0 0 ${pos.r}`);
            el.appendChild(fin);
        });

        // Eyes
        const eyeConfigs = [{ x: 0.2, z: 0.4 }, { x: -0.2, z: 0.4 }];
        eyeConfigs.forEach(pos => {
            const eye = document.createElement('a-entity');
            eye.setAttribute('geometry', { primitive: 'sphere', radius: 0.08 });
            eye.setAttribute('material', { color: '#000' });
            eye.setAttribute('position', `${pos.x} 0.1 ${pos.z}`);
            el.appendChild(eye);
        });

        // Legs
        const legPositions = [
            { x: 0.3, z: 0.2, id: 'leg1' },
            { x: -0.3, z: 0.2, id: 'leg2' },
            { x: 0.3, z: -0.2, id: 'leg3' },
            { x: -0.3, z: -0.2, id: 'leg4' }
        ];

        legPositions.forEach((pos, index) => {
            const leg = document.createElement('a-entity');
            leg.setAttribute('geometry', { primitive: 'cylinder', radius: 0.05, height: 0.4 });
            leg.setAttribute('material', { color: '#FFA07A' });
            leg.setAttribute('position', `${pos.x} -0.4 ${pos.z}`);

            // Walking animation
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
            to: '0 0.05 0' // Subtle bob
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

    // Get location and spawn fish
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                spawnFish(lat, lon);
            },
            (err) => {
                console.warn("Location error, entering Preview Mode: ", err);
                status.innerText = "Preview Mode (No GPS)";
                spawnFish(null, null); // Spawn in front of camera
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    } else {
        spawnFish(null, null);
    }
});

function spawnFish(userLat, userLon) {
    const container = document.querySelector('#fish-container');
    const fish = document.createElement('a-entity');
    fish.setAttribute('id', 'my-fish');
    fish.setAttribute('walking-fish', '');
    fish.setAttribute('scale', '4 4 4');

    if (userLat && userLon) {
        // GPS Mode
        const offsetLat = userLat + 0.00008;
        const offsetLon = userLon + 0.00008;
        fish.setAttribute('gps-entity-place', `latitude: ${offsetLat}; longitude: ${offsetLon};`);
        console.log(`Fish spawned at GPS: ${offsetLat}, ${offsetLon}`);
    } else {
        // Preview Mode (Static Position in front of camera)
        fish.setAttribute('position', '0 -1 -10');
        console.log("Fish spawned in Preview Mode");
    }

    container.appendChild(fish);

    const badge = document.createElement('div');
    badge.id = 'info-badge';
    badge.innerText = userLat ? "🐠 Fish spotted nearby! Look around." : "🐠 Preview Mode: Fish placed 10m ahead.";
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
