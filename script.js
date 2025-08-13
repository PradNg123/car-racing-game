// --- CAR RACING GAME SCRIPT WITH PLAYER + ENEMY CAR IMAGES + SOUNDS ---

// Setup Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

// Load Player Car Image
const carImg = new Image();
carImg.src = "images/car.png"; // Your player car image

// Load Enemy Car Images (different colors)
const enemyCarImages = [new Image(), new Image(), new Image()];
enemyCarImages[0].src = "images/black.png";
enemyCarImages[1].src = "images/voilet.png";
enemyCarImages[2].src = "images/yellow.png";

// Load Sounds
const countdownSound = new Audio("sound/countdown.mp3");
const racingSound = new Audio("sound/racing.mp3");
const collisionSound = new Audio("sound/collision.mp3");
racingSound.loop = true; // Loop racing sound

// Player car properties
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 90,
    speed: 5
};

// Enemy cars array
let enemies = [];
let enemySpeed = 4;
let score = 0;
let gameOver = false;
let gameStarted = false; // To control countdown before game start
let spawnTimeoutId = null; // to store timeout id for spawning enemies

// Key controls
const keys = {};
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

// Mobile button controls
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const restartBtn = document.getElementById('restartBtn');

leftBtn.addEventListener('touchstart', () => keys["ArrowLeft"] = true);
leftBtn.addEventListener('touchend', () => keys["ArrowLeft"] = false);
leftBtn.addEventListener('mousedown', () => keys["ArrowLeft"] = true);
leftBtn.addEventListener('mouseup', () => keys["ArrowLeft"] = false);

rightBtn.addEventListener('touchstart', () => keys["ArrowRight"] = true);
rightBtn.addEventListener('touchend', () => keys["ArrowRight"] = false);
rightBtn.addEventListener('mousedown', () => keys["ArrowRight"] = true);
rightBtn.addEventListener('mouseup', () => keys["ArrowRight"] = false);

// Restart button click event
restartBtn.addEventListener('click', resetGame);

// Draw player car
function drawPlayer() {
    ctx.drawImage(carImg, player.x, player.y, player.width, player.height);
}

// Draw enemies
function drawEnemies() {
    enemies.forEach((enemy, index) => {
        ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
        enemy.y += enemySpeed;

        // Remove off-screen enemies
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });
}

// Spawn new enemy car, avoiding horizontal overlap
function spawnEnemy() {
    const enemyWidth = 50;
    const enemyHeight = 90;

    let enemyX;
    let tries = 0;
    const maxTries = 10;

    do {
        enemyX = Math.floor(Math.random() * (canvas.width - enemyWidth));
        tries++;
        // Check if this X is too close (< enemyWidth) to any existing enemy
        const tooClose = enemies.some(e => Math.abs(e.x - enemyX) < enemyWidth);
        if (!tooClose) break;
    } while (tries < maxTries);

    const randomCarImg = enemyCarImages[Math.floor(Math.random() * enemyCarImages.length)];
    enemies.push({ x: enemyX, y: -enemyHeight, width: enemyWidth, height: enemyHeight, img: randomCarImg });
}

// Spawn enemies repeatedly with random delay between 1.2s and 2.2s
function startSpawning() {
    function spawnWithRandomDelay() {
        if (gameOver) return; // stop spawning if game over
        spawnEnemy();
        const delay = 1200 + Math.random() * 1000; // 1200ms to 2200ms
        spawnTimeoutId = setTimeout(spawnWithRandomDelay, delay);
    }
    spawnWithRandomDelay();
}

// Update game state
function update() {
    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;
    if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;

    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    // Collision detection
    enemies.forEach(enemy => {
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            gameOver = true;
            racingSound.pause();
            collisionSound.play();

            if(spawnTimeoutId) {
                clearTimeout(spawnTimeoutId);
                spawnTimeoutId = null;
            }
        }
    });

    // Increase score
    score++;
}

// Draw background road
function drawRoad() {
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, i);
        ctx.lineTo(canvas.width / 2, i + 20);
        ctx.stroke();
    }
}

// Draw score
function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
}

// Game loop
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over!", 120, 300);
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Final Score: ${score}`, 140, 340);

        restartBtn.style.display = 'block';  // Show restart button

        return;
    }

    restartBtn.style.display = 'none';  // Hide restart button during game

    drawRoad();
    drawPlayer();
    drawEnemies();
    drawScore();
    update();

    requestAnimationFrame(gameLoop);
}

// Reset and restart the game
function resetGame() {
    // Reset variables
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 100;
    enemies = [];
    enemySpeed = 4;
    score = 0;
    gameOver = false;

    restartBtn.style.display = 'none';
    racingSound.pause();
    racingSound.currentTime = 0;

    startCountdown();
}

// Countdown before start
function startCountdown() {
    let countdown = 3;
    countdownSound.play();

    const countdownInterval = setInterval(() => {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.fillText(countdown, canvas.width / 2 - 15, canvas.height / 2);

        countdown--;
        if (countdown < 0) {
            clearInterval(countdownInterval);
            gameStarted = true;
            racingSound.play();
            startSpawning(); // start spawning enemies with random delay now
            gameLoop();
        }
    }, 1000);
}

// Start game when all images are loaded
let loadedImages = 0;
const totalImages = 1 + enemyCarImages.length; // player + enemies
function imageLoaded() {
    loadedImages++;
    if (loadedImages === totalImages) {
        startCountdown();
    }
}
carImg.onload = imageLoaded;
enemyCarImages.forEach(img => img.onload = imageLoaded);
