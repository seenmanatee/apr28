document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('intro-video');
    const anniversaryPage = document.getElementById('anniversary-page');
    const videoContainer = document.getElementById('video-container');
    const videoError = document.getElementById('video-error');
    const downloadBtn = document.getElementById('download-btn');
    const backBtn = document.getElementById('back-btn');

    console.log('Video element:', video);
    console.log('Video sources:', video.querySelectorAll('source'));

    // Download button functionality
    downloadBtn.addEventListener('click', function() {
        const link = document.createElement('a');
        link.href = '0428.mp4';
        link.download = '0428.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Back button functionality
    backBtn.addEventListener('click', function() {
        anniversaryPage.classList.remove('show');
        setTimeout(() => {
            anniversaryPage.classList.add('hidden');
            videoContainer.style.display = 'flex';
            video.currentTime = 0;
            video.play();
        }, 500);
    });

    video.addEventListener('error', function() {
        console.error('Video failed to load');
        videoError.style.display = 'block';
    });

    video.addEventListener('ended', function() {
        videoContainer.style.display = 'none';
        anniversaryPage.classList.remove('hidden');
        setTimeout(() => {
            anniversaryPage.classList.add('show');
        }, 100);
        initFloatingObjects();
    });

    // Floating objects with simple physics
    function initFloatingObjects() {
        const canvas = document.getElementById('floating-objects');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const kirbyImage = new Image();
        kirbyImage.src = 'Kirby.png';

        const objects = [];
        const numObjects = 10;

        kirbyImage.onload = function() {
            for (let i = 0; i < numObjects; i++) {
                objects.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    radius: 20,
                    size: 40,
                    rotation: 0,
                    rotationSpeed: 0
                });
            }

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                objects.forEach((obj, i) => {
                    obj.x += obj.vx;
                    obj.y += obj.vy;

                    // Update rotation
                    obj.rotation += obj.rotationSpeed;
                    // Gradually slow down rotation
                    obj.rotationSpeed *= 0.98;

                    // Bounce off walls
                    if (obj.x - obj.radius < 0 || obj.x + obj.radius > canvas.width) {
                        obj.vx = -obj.vx;
                    }
                    if (obj.y - obj.radius < 0 || obj.y + obj.radius > canvas.height) {
                        obj.vy = -obj.vy;
                    }

                    // Check collisions with other objects
                    for (let j = i + 1; j < objects.length; j++) {
                        const other = objects[j];
                        const dx = obj.x - other.x;
                        const dy = obj.y - other.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < obj.radius + other.radius) {
                            // Trigger rotation on collision
                            obj.rotationSpeed += 0.05;
                            other.rotationSpeed += 0.05;

                            // Simple collision response
                            const angle = Math.atan2(dy, dx);
                            const sin = Math.sin(angle);
                            const cos = Math.cos(angle);

                            // Rotate velocities
                            const v1x = obj.vx * cos + obj.vy * sin;
                            const v1y = obj.vy * cos - obj.vx * sin;
                            const v2x = other.vx * cos + other.vy * sin;
                            const v2y = other.vy * cos - other.vx * sin;

                            // Swap velocities along the collision axis
                            const temp = v1x;
                            obj.vx = v2x * cos - v1y * sin;
                            obj.vy = v1y * cos + v2x * sin;
                            other.vx = temp * cos - v2y * sin;
                            other.vy = v2y * cos + temp * sin;

                            // Separate objects
                            const overlap = obj.radius + other.radius - distance;
                            obj.x += overlap * 0.5 * Math.cos(angle);
                            obj.y += overlap * 0.5 * Math.sin(angle);
                            other.x -= overlap * 0.5 * Math.cos(angle);
                            other.y -= overlap * 0.5 * Math.sin(angle);
                        }
                    }

                    // Draw Kirby image with rotation
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