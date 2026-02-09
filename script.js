// A-Frame 强制组件注册
AFRAME.registerComponent('walking-fish', {
    init: function () {
        const el = this.el;

        // 1. 鱼身 (椭圆)
        const body = document.createElement('a-sphere');
        body.setAttribute('radius', '0.5');
        body.setAttribute('scale', '1 0.8 1.4');
        body.setAttribute('material', 'color: #FF4D4D; shader: flat;');
        el.appendChild(body);

        // 2. 鱼尾 (锥体)
        const tail = document.createElement('a-cone');
        tail.setAttribute('radius-bottom', '0.3');
        tail.setAttribute('radius-top', '0.01');
        tail.setAttribute('height', '0.6');
        tail.setAttribute('position', '0 0 -1');
        tail.setAttribute('rotation', '90 0 0');
        tail.setAttribute('material', 'color: #FF4D4D; shader: flat;');
        tail.setAttribute('animation', 'property: rotation; from: 90 -20 0; to: 90 20 0; dir: alternate; dur: 400; loop: true; easing: easeInOutQuad');
        el.appendChild(tail);

        // 3. 腿部 (四条柱子)
        const legPositions = [
            { x: 0.3, z: 0.3 }, { x: -0.3, z: 0.3 },
            { x: 0.3, z: -0.3 }, { x: -0.3, z: -0.3 }
        ];

        legPositions.forEach((pos, index) => {
            const leg = document.createElement('a-cylinder');
            leg.setAttribute('radius', '0.06');
            leg.setAttribute('height', '0.5');
            leg.setAttribute('position', `${pos.x} -0.5 ${pos.z}`);
            leg.setAttribute('material', 'color: #FFA07A; shader: flat;');

            const delay = (index % 2 === 0) ? 0 : 250;
            leg.setAttribute('animation', `property: rotation; from: -20 0 0; to: 20 0 0; dir: alternate; dur: 500; delay: ${delay}; loop: true; easing: easeInOutQuad`);
            el.appendChild(leg);
        });

        // 整体上下起伏
        el.setAttribute('animation', 'property: position; to: 0 0.1 0; dir: alternate; dur: 500; loop: true; easing: easeInOutQuad');
    }
});

function log(msg) {
    const status = document.getElementById('status');
    if (status) status.innerText = msg;
    console.log(msg);
}

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('ui-overlay').classList.add('hidden');
    document.getElementById('refresh-btn').style.display = 'block';
    startAR();
});

document.getElementById('refresh-btn').addEventListener('click', () => {
    const fish = document.getElementById('my-fish');
    if (fish) fish.parentNode.removeChild(fish);
    startAR();
});

function startAR() {
    log("Trying to find GPS...");

    // 室内降级逻辑：如果在 3.5 秒内 GPS 没反应，直接进入预览模式
    const timeout = setTimeout(() => {
        log("Indoor Mode: Placing fish 3m ahead");
        spawnFish(null, null);
    }, 3500);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                clearTimeout(timeout);
                log(`GPS Fixed! Accuracy: ${pos.coords.accuracy}m`);
                if (pos.coords.accuracy > 50) {
                    log("Weak GPS (Indoor). Using Nearby Mode.");
                    spawnFish(null, null);
                } else {
                    spawnFish(pos.coords.latitude, pos.coords.longitude);
                }
            },
            (err) => {
                clearTimeout(timeout);
                log("GPS Failed. Using Nearby Mode.");
                spawnFish(null, null);
            },
            { enableHighAccuracy: true }
        );
    } else {
        clearTimeout(timeout);
        log("No Geolocation support.");
        spawnFish(null, null);
    }
}

function spawnFish(lat, lon) {
    const scene = document.querySelector('a-scene');
    const fish = document.createElement('a-entity');
    fish.setAttribute('id', 'my-fish');
    fish.setAttribute('walking-fish', '');
    fish.setAttribute('scale', '1.5 1.5 1.5');

    if (lat && lon) {
        // GPS 模式
        fish.setAttribute('gps-entity-place', `latitude: ${lat + 0.00005}; longitude: ${lon + 0.00005};`);
    } else {
        // 室内/预览模式：直接固定在相机前方 3 米，地板高度
        fish.setAttribute('position', '0 -1.2 -3');
    }

    scene.appendChild(fish);
}
