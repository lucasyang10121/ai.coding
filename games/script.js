const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const stageEl = document.getElementById("stage");
const buffEl = document.getElementById("buff");
const goalEl = document.getElementById("goal");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const overlayButton = document.getElementById("overlayButton");

const keys = {};
const balls = [];
const goalDodges = 100;
const stageDuration = 20;
const buffThreshold = 20;

let gameState = "ready";
let animationFrameId = null;
let lastTimestamp = 0;
let elapsedTime = 0;
let stage = 1;
let spawnTimer = 0;
let dodgeCount = 0;
let cannonFlash = 0;

const rocket = {
  x: canvas.width / 2,
  y: canvas.height - 95,
  size: 28,
  baseSpeed: 260,
  buffSpeed: 360,
  buffActive: false,
  buffTimer: 0,
};

function resetGame() {
  gameState = "running";
  lastTimestamp = 0;
  elapsedTime = 0;
  stage = 1;
  spawnTimer = 0;
  dodgeCount = 0;
  cannonFlash = 0;
  balls.length = 0;
  rocket.x = canvas.width / 2;
  rocket.y = canvas.height - 95;
  rocket.buffActive = false;
  rocket.buffTimer = 0;
  updateHud();
}

function startGame() {
  resetGame();
  overlay.classList.add("hidden");
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(loop);
}

function endGame(won) {
  gameState = won ? "won" : "over";
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  overlay.classList.remove("hidden");
  overlayTitle.textContent = won ? "You Win!" : "Game Over";
  overlayText.textContent = won
    ? `Rocket survived ${dodgeCount} dodges and cleared the cannon storm.`
    : `Rocket was hit after ${dodgeCount} dodges. Try again and stay sharp.`;
  overlayButton.textContent = won ? "Play Again" : "Try Again";
}

function updateHud() {
  scoreEl.textContent = dodgeCount;
  stageEl.textContent = stage;
  buffEl.textContent = rocket.buffActive ? `ON ${rocket.buffTimer.toFixed(1)}s` : "OFF";
  goalEl.textContent = goalDodges;
}

function loop(timestamp) {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
  }

  const deltaTime = Math.min(0.033, (timestamp - lastTimestamp) / 1000);
  lastTimestamp = timestamp;

  if (gameState === "running") {
    update(deltaTime);
    render();
    animationFrameId = requestAnimationFrame(loop);
  } else {
    render();
  }
}

function update(deltaTime) {
  elapsedTime += deltaTime;

  if (elapsedTime >= stage * stageDuration && stage < 10) {
    stage += 1;
  }

  if (rocket.buffActive) {
    rocket.buffTimer = Math.max(0, rocket.buffTimer - deltaTime);
    if (rocket.buffTimer <= 0) {
      rocket.buffActive = false;
    }
  }

  const moveSpeed = rocket.buffActive ? rocket.buffSpeed : rocket.baseSpeed;
  if (keys.ArrowLeft || keys.a || keys.A) {
    rocket.x -= moveSpeed * deltaTime;
  }
  if (keys.ArrowRight || keys.d || keys.D) {
    rocket.x += moveSpeed * deltaTime;
  }
  if (keys.ArrowUp || keys.w || keys.W) {
    rocket.y -= moveSpeed * deltaTime;
  }
  if (keys.ArrowDown || keys.s || keys.S) {
    rocket.y += moveSpeed * deltaTime;
  }

  rocket.x = Math.max(34, Math.min(canvas.width - 34, rocket.x));
  rocket.y = Math.max(60, Math.min(canvas.height - 50, rocket.y));

  spawnTimer += deltaTime;
  const spawnInterval = Math.max(0.24, 1.15 - (stage - 1) * 0.095);
  if (spawnTimer >= spawnInterval) {
    spawnBall();
    spawnTimer = 0;
    cannonFlash = 0.16;
  }

  cannonFlash = Math.max(0, cannonFlash - deltaTime);

  for (let i = balls.length - 1; i >= 0; i -= 1) {
    const ball = balls[i];
    ball.x += ball.vx * deltaTime;
    ball.y += ball.vy * deltaTime;

    if (
      Math.hypot(ball.x - rocket.x, ball.y - rocket.y) <= ball.radius + rocket.size * 0.7
    ) {
      endGame(false);
      return;
    }

    if (ball.y - ball.radius > canvas.height) {
      balls.splice(i, 1);
      dodgeCount += 1;
      if (dodgeCount >= goalDodges) {
        endGame(true);
        return;
      }
      if (dodgeCount > 0 && dodgeCount % buffThreshold === 0 && !rocket.buffActive) {
        rocket.buffActive = true;
        rocket.buffTimer = 10;
      }
    }
  }

  updateHud();
}

function spawnBall() {
  const radius = 12 + Math.random() * 8;
  const ball = {
    x: 40 + Math.random() * (canvas.width - 80),
    y: 90,
    vx: (Math.random() - 0.5) * 120 + stage * 8,
    vy: 180 + stage * 45 + Math.random() * 35,
    radius,
  };
  balls.push(ball);
}

function render() {
  drawBackground();
  drawCannon();
  drawRocket();
  drawBalls();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#101b35");
  gradient.addColorStop(1, "#060816");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 70);
  ctx.lineTo(canvas.width, canvas.height - 70);
  ctx.stroke();
  ctx.restore();
}

function drawCannon() {
  const cannonX = canvas.width / 2;
  const cannonY = 70;
  ctx.save();
  ctx.translate(cannonX, cannonY);

  ctx.fillStyle = "#2f3640";
  ctx.fillRect(-28, -12, 56, 24);
  ctx.fillRect(-18, -24, 36, 20);
  ctx.fillRect(-10, -36, 20, 24);

  ctx.fillStyle = cannonFlash > 0 ? "#ffb347" : "#ff6b6b";
  ctx.fillRect(-8, -40, 16, 28);

  ctx.fillStyle = "#1a1d23";
  ctx.fillRect(-6, -12, 12, 16);
  ctx.restore();
}

function drawRocket() {
  ctx.save();
  ctx.translate(rocket.x, rocket.y);

  ctx.fillStyle = "#f7f7ff";
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.lineTo(18, 20);
  ctx.lineTo(10, 18);
  ctx.lineTo(0, 28);
  ctx.lineTo(-10, 18);
  ctx.lineTo(-18, 20);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#4a8cff";
  ctx.fillRect(-10, -10, 20, 24);
  ctx.fillRect(-5, -28, 10, 18);

  ctx.fillStyle = "#ff8e3c";
  ctx.beginPath();
  ctx.moveTo(-8, 18);
  ctx.lineTo(0, 32);
  ctx.lineTo(8, 18);
  ctx.closePath();
  ctx.fill();

  if (rocket.buffActive) {
    ctx.fillStyle = "#7df9ff";
    ctx.beginPath();
    ctx.moveTo(-5, 28);
    ctx.lineTo(0, 40);
    ctx.lineTo(5, 28);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawBalls() {
  balls.forEach((ball) => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ff4d4d";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#8f0000";
    ctx.stroke();
  });
}

window.addEventListener("keydown", (event) => {
  keys[event.key] = true;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(event.key)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

overlayButton.addEventListener("click", startGame);

updateHud();
render();
