document.addEventListener('DOMContentLoaded', function() {
    const videoFrame = document.getElementById('intro-video');
    const anniversaryPage = document.getElementById('anniversary-page');
    const videoContainer = document.getElementById('video-container');
    const downloadBtn = document.getElementById('download-btn');
    const continueBtn = document.getElementById('continue-btn');
    const backBtn = document.getElementById('back-btn');

    // Download button functionality
    downloadBtn.addEventListener('click', function() {
        const link = document.createElement('a');
        link.href = 'https://drive.usercontent.google.com/download?id=1Nx1AUP9u-eVda9OY8gHVw95PI3o0fmsK&export=download&confirm=t';
        link.download = '0428.mov';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    continueBtn.addEventListener('click', function() {
        videoContainer.style.display = 'none';
        anniversaryPage.classList.remove('hidden');
        setTimeout(() => {
            anniversaryPage.classList.add('show');
        }, 100);
        initFloatingObjects();
    });

    videoFrame.addEventListener('load', function() {
        setTimeout(() => {
            continueBtn.classList.remove('hidden');
        }, 5000);
    });

    backBtn.addEventListener('click', function() {
        anniversaryPage.classList.remove('show');
        setTimeout(() => {
            anniversaryPage.classList.add('hidden');
            videoContainer.style.display = 'flex';
        }, 500);
    });

    // Floating objects with simple physics
    function initFloatingObjects() {
        const canvas = document.getElementById('floating-objects');
        const ctx = canvas.getContext('2d');
        if (canvas.dataset.initialized === 'true') return;
        canvas.dataset.initialized = 'true';

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const kirbyImage = new Image();
        kirbyImage.src = 'Kirby.png';

        const objects = [];
        const numObjects = 10;
        let activeObject = null;
        let dragOffset = { x: 0, y: 0 };
        let lastPointerSample = null;
        let releaseVelocity = { x: 0, y: 0 };
        const flingMultiplier = 0.35;
        const stopThreshold = 0.12;

        const getCanvasPosition = (event) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        };

        const findObjectAt = (x, y) => {
            for (let i = objects.length - 1; i >= 0; i--) {
                const obj = objects[i];
                const dx = x - obj.x;
                const dy = y - obj.y;
                if (Math.sqrt(dx * dx + dy * dy) <= obj.radius) {
                    return obj;
                }
            }
            return null;
        };

        const setCanvasCursor = (state) => {
            canvas.classList.toggle('grabbing', state === 'grabbing');
            document.body.style.cursor = state === 'grabbing' ? 'grabbing' : '';
        };

        window.addEventListener('pointerdown', (event) => {
            const { x, y } = getCanvasPosition(event);
            const obj = findObjectAt(x, y);
            if (!obj) return;

            activeObject = obj;
            activeObject.isDragging = true;
            dragOffset.x = x - obj.x;
            dragOffset.y = y - obj.y;
            activeObject.vx = 0;
            activeObject.vy = 0;
            lastPointerSample = { x, y, time: event.timeStamp };
            releaseVelocity = { x: 0, y: 0 };
            setCanvasCursor('grabbing');
        });

        window.addEventListener('pointermove', (event) => {
            const { x, y } = getCanvasPosition(event);
            if (activeObject) {
                const currentSample = { x, y, time: event.timeStamp };
                if (lastPointerSample) {
                    const dt = Math.max(currentSample.time - lastPointerSample.time, 1);
                    const nextVelocity = {
                        x: (currentSample.x - lastPointerSample.x) / dt,
                        y: (currentSample.y - lastPointerSample.y) / dt
                    };
                    releaseVelocity.x = releaseVelocity.x * 0.35 + nextVelocity.x * 0.65;
                    releaseVelocity.y = releaseVelocity.y * 0.35 + nextVelocity.y * 0.65;
                }

                activeObject.x = x - dragOffset.x;
                activeObject.y = y - dragOffset.y;
                activeObject.vx = 0;
                activeObject.vy = 0;
                lastPointerSample = currentSample;
            } else {
                const hovered = findObjectAt(x, y);
                document.body.style.cursor = hovered ? 'grab' : '';
            }
        });

        const releaseObject = (event) => {
            if (!activeObject) return;
            const speed = Math.hypot(releaseVelocity.x, releaseVelocity.y);

            activeObject.isDragging = false;
            if (speed < stopThreshold) {
                activeObject.vx = 0;
                activeObject.vy = 0;
                activeObject.rotationSpeed *= 0.5;
            } else {
                activeObject.vx = releaseVelocity.x / flingMultiplier;
                activeObject.vy = releaseVelocity.y / flingMultiplier;
                activeObject.rotationSpeed = Math.max(
                    -0.25,
                    Math.min(0.25, activeObject.vx * 0.01)
                );
            }

            activeObject = null;
            lastPointerSample = null;
            releaseVelocity = { x: 0, y: 0 };
            setCanvasCursor(false);
        };

        window.addEventListener('pointerup', releaseObject);
        window.addEventListener('pointercancel', releaseObject);

        kirbyImage.onload = function() {
            for (let i = 0; i < numObjects; i++) {
                objects.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    radius: 24,
                    size: 48,
                    rotation: 0,
                    rotationSpeed: 0,
                    isDragging: false
                });
            }

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                objects.forEach((obj, i) => {
                    if (!obj.isDragging) {
                        obj.x += obj.vx;
                        obj.y += obj.vy;
                    }

                    // Update rotation
                    obj.rotation += obj.rotationSpeed;
                    obj.rotationSpeed *= 0.98;

                    // Bounce off walls
                    if (obj.x - obj.radius < 0) {
                        obj.x = obj.radius;
                        obj.vx = Math.abs(obj.vx);
                    }
                    if (obj.x + obj.radius > canvas.width) {
                        obj.x = canvas.width - obj.radius;
                        obj.vx = -Math.abs(obj.vx);
                    }
                    if (obj.y - obj.radius < 0) {
                        obj.y = obj.radius;
                        obj.vy = Math.abs(obj.vy);
                    }
                    if (obj.y + obj.radius > canvas.height) {
                        obj.y = canvas.height - obj.radius;
                        obj.vy = -Math.abs(obj.vy);
                    }

                    // Check collisions with other objects
                    for (let j = i + 1; j < objects.length; j++) {
                        const other = objects[j];
                        const dx = obj.x - other.x;
                        const dy = obj.y - other.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < obj.radius + other.radius) {
                            obj.rotationSpeed += 0.05;
                            other.rotationSpeed += 0.05;
                            const angle = Math.atan2(dy, dx);
                            const sin = Math.sin(angle);
                            const cos = Math.cos(angle);
                            const v1x = obj.vx * cos + obj.vy * sin;
                            const v1y = obj.vy * cos - obj.vx * sin;
                            const v2x = other.vx * cos + other.vy * sin;
                            const v2y = other.vy * cos - other.vx * sin;
                            const temp = v1x;
                            obj.vx = v2x * cos - v1y * sin;
                            obj.vy = v1y * cos + v2x * sin;
                            other.vx = temp * cos - v2y * sin;
                            other.vy = v2y * cos + temp * sin;
                            const overlap = obj.radius + other.radius - distance;
                            obj.x += overlap * 0.5 * Math.cos(angle);
                            obj.y += overlap * 0.5 * Math.sin(angle);
                            other.x -= overlap * 0.5 * Math.cos(angle);
                            other.y -= overlap * 0.5 * Math.sin(angle);
                        }
                    }

                    ctx.save();
                    ctx.translate(obj.x, obj.y);
                    ctx.rotate(obj.rotation);
                    ctx.drawImage(kirbyImage, -obj.size / 2, -obj.size / 2, obj.size, obj.size);
                    ctx.restore();
                });

                requestAnimationFrame(animate);
            }

            animate();
        };
    }
});
