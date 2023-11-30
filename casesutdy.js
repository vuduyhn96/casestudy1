let canvas = document.querySelector('canvas');
let c = canvas.getContext('2d');

let scoreEl = document.querySelector('#scoreEl');
let modalEl = document.querySelector('#modalEl');
let modalScoreDisplay = document.querySelector('#modalScoreDisplay');
let buttonEl = document.querySelector('#buttonEl');
let startButtonAd = document.querySelector('#startButtonAd');
let startModalEl = document.querySelector('#startModalEl');
let nameInput = document.querySelector('#nameInput');
let nameDisplay = document.querySelector('#nameDisplay');
canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

let friction = 0.98;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

let x = canvas.width / 2;
let y = canvas.height / 2;

let player;
let projectiles = [];
let enemies = [];
let particles = [];
let animationId;
let intervalId;
let score = 0;

function init() {
    player = new Player(x, y, 10, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    modalEl.style.display = 'none';
}

function spawnEnemies() {
    intervalId = setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;
        let x;
        let y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        let color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        let angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        let velocity = { x: Math.cos(angle), y: Math.sin(angle) };

        enemies.push(new Enemy(x, y, radius, color, velocity));
        console.log(enemies);
    }, 1000);
}

function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.draw();
    for (let index = particles.length - 1; index >= 0; index--) {
        let particle = particles[index];

        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    }
    for (let index = projectiles.length - 1; index >= 0; index--) {
        let projectile = projectiles[index];

        projectile.update();

        if (
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            projectiles.splice(index, 1);
        }
    }
    for (let index = enemies.length - 1; index >= 0; index--) {
        let enemy = enemies[index];

        enemy.update();
        let dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        if (dist - enemy.radius - player.radius < 1) {
            clearInterval(intervalId);
            cancelAnimationFrame(animationId);
            modalEl.style.display = 'block';
            modalScoreDisplay.innerHTML = score;
        }
        for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
            let projectile = projectiles[projectileIndex];

            let dist = Math.hypot(
                projectile.x - enemy.x,
                projectile.y - enemy.y
            );

            if (dist - enemy.radius - projectile.radius < 1) {
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(
                        new Particle(
                            projectile.x,
                            projectile.y,
                            Math.random() * 2,
                            enemy.color,
                            {
                                x: (Math.random() - 0.5) * (Math.random() * 6),
                                y: (Math.random() - 0.5) * (Math.random() * 6)
                            }
                        )
                    );
                }

                if (enemy.radius - 10 > 5) {
                    score += 100;
                    scoreEl.innerHTML = score;
                    gsap.to(enemy, {
                        radius: enemy.radius - 10,
                    });

                    projectiles.splice(projectileIndex, 1);

                } else {
                    score += 150;
                    scoreEl.innerHTML = score;
                    enemies.splice(index, 1);
                    projectiles.splice(projectileIndex, 1);
                }
            }
        }
    }
}

addEventListener('click', (event) => {
    console.log(projectiles);
    let angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    );
    const velocity = {
        x: Math.cos(angle) * 4,
        y: Math.sin(angle) * 4,
    };
    projectiles.push(
        new Projectile(
            canvas.width / 2,
            canvas.height / 2,
            5,
            'white',
            velocity
        )
    );
});

buttonEl.addEventListener('click', () => {
    clearInterval(intervalId);
    cancelAnimationFrame(animationId);
    init();
    animate();
    spawnEnemies();
    modalEl.style.display = 'none';
});

startButtonAd.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    startModalEl.style.display = 'none';
    let nameInputValue = nameInput.value || '';
    let nameElement = document.getElementById('name');
    if (nameElement) {
        nameElement.textContent = ` ${nameInputValue}`;
    }
});

init();