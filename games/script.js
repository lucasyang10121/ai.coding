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
const projectiles = [];
const powerUps = [];
const goalDodges = 500;
const maxStage = 10;
const stageDuration = 20;
const buffThreshold = 20;

let gameState = "ready";
let animationFrameId = null;
let lastTimestamp = 0;
let elapsedTime = 0;
let stage = 1;
let dodgeCount = 0;
let cannonFlash = 0;
let powerupTimer = 0;

const rocket = {
  x: 0,
  y: 0,
  size: 28,
  baseSpeed: 320,
  boostSpeed: 430,
  boostActive: false,
  boostTimer: 0,
  immunityTimer: 0,
  smallHitboxTimer: 0,
};

const cannons = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (gameState !== "ready") {
    rocket.x = Math.min(canvas.width - 40, Math.max(40, rocket.x));
    rocket.y = Math.min(canvas.height - 60, Math.max(80, rocket.y));
  } else {
    rocket.x = canvas.width / 2;
    rocket.y = canvas.height - 80;
  }
}

function resetGame() {
  gameState = "running";
  lastTimestamp = 0;
  elapsedTime = 0;
  stage = 1;
  dodgeCount = 0;
  cannonFlash = 0;
  powerupTimer = 0;
  projectiles.length = 0;
  powerUps.length = 0;
  rocket.x = canvas.width / 2;
  rocket.y = canvas.height - 80;
  rocket.boostActive = false;
  rocket.boostTimer = 0;
  rocket.immunityTimer = 0;
  rocket.smallHitboxTimer = 0;
  cannons.length = 0;
  buildCannons();
  updateHud();
}

function buildCannons() {
  cannons.push({ x: canvas.width / 2, y: 72, fireTimer: 1.2, fireCooldown: 1.2, flash: 0 });
  if (stage >= 5) {
    cannons.push({ x: 90, y: 72, fireTimer: 1.7, fireCooldown: 1.7, flash: 0 });
  }
  if (stage >= 7) {
    cannons.push({ x: canvas.width - 90, y: 72, fireTimer: 1.4, fireCooldown: 1.4, flash: 0 });
  }
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
    ? `Rocket survived ${dodgeCount} dodges and reached the end of the cannon storm.`
    : `Rocket was hit after ${dodgeCount} dodges. Try again and stay sharp.`;
  overlayButton.textContent = won ? "Play Again" : "Try Again";
}

function updateHud() {
  scoreEl.textContent = dodgeCount;
  stageEl.textContent = stage;
  let activeBuff = "OFF";
  if (rocket.boostActive) {
    activeBuff = `BOOST ${rocket.boostTimer.toFixed(1)}s`;
  } else if (rocket.immunityTimer > 0) {
    activeBuff = `IMMUNE ${rocket.immunityTimer.toFixed(1)}s`;
  } else if (rocket.smallHitboxTimer > 0) {
    activeBuff = `SHRINK ${rocket.smallHitboxTimer.toFixed(1)}s`;
  }
  buffEl.textContent = activeBuff;
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

  if (stage < maxStage && elapsedTime >= stage * stageDuration) {
    stage += 1;
    cannons.length = 0;
    buildCannons();
  }

  if (rocket.boostActive) {
    rocket.boostTimer = Math.max(0, rocket.boostTimer - deltaTime);
    if (rocket.boostTimer <= 0) {
      rocket.boostActive = false;
    }
  }
  if (rocket.immunityTimer > 0) {
    rocket.immunityTimer = Math.max(0, rocket.immunityTimer - deltaTime);
  }
  if (rocket.smallHitboxTimer > 0) {
    rocket.smallHitboxTimer = Math.max(0, rocket.smallHitboxTimer - deltaTime);
  }

  const moveSpeed = rocket.boostActive ? rocket.boostSpeed : rocket.baseSpeed;
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
  rocket.y = Math.max(80, Math.min(canvas.height - 60, rocket.y));

  cannonFlash = Math.max(0, cannonFlash - deltaTime);

  cannons.forEach((cannon) => {
    cannon.fireTimer -= deltaTime;
    const fireInterval = Math.max(0.3, 1.3 - (stage - 1) * 0.09);
    if (cannon.fireTimer <= 0) {
      spawnProjectile(cannon);
      cannon.fireTimer = fireInterval;
      cannon.flash = 0.16;
      cannonFlash = 0.16;
    }
  });

  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    projectile.x += projectile.vx * deltaTime;
    projectile.y += projectile.vy * deltaTime;

    const hitboxRadius = rocket.smallHitboxTimer > 0 ? rocket.size * 0.58 : rocket.size;
    if (Math.hypot(projectile.x - rocket.x, projectile.y - rocket.y) <= projectile.radius + hitboxRadius) {
      if (rocket.immunityTimer > 0) {
        rocket.immunityTimer = 0;
        projectiles.splice(i, 1);
      } else {
        endGame(false);
        return;
      }
    }

    if (projectile.y - projectile.radius > canvas.height || projectile.x < -100 || projectile.x > canvas.width + 100) {
      projectiles.splice(i, 1);
      dodgeCount += 1;
      if (dodgeCount >= goalDodges) {
        endGame(true);
        return;
      }
      if (dodgeCount > 0 && dodgeCount % buffThreshold === 0 && !rocket.boostActive) {
        rocket.boostActive = true;
        rocket.boostTimer = 10;
      }
    }
  }

  powerupTimer += deltaTime;
  if (powerUps.length < 2 && powerupTimer >= 8) {
    spawnPowerUp();
    powerupTimer = 0;
  }

  for (let i = powerUps.length - 1; i >= 0; i -= 1) {
    const powerUp = powerUps[i];
    const hitboxRadius = rocket.smallHitboxTimer > 0 ? rocket.size * 0.58 : rocket.size;
    if (Math.hypot(powerUp.x - rocket.x, powerUp.y - rocket.y) <= powerUp.radius + hitboxRadius) {
      applyPowerUp(powerUp.type);
      powerUps.splice(i, 1);
    }
  }

  updateHud();
}

function spawnProjectile(cannon) {
  const radius = 10 + Math.random() * 4;
  const drift = cannon.x < canvas.width / 2 ? 55 : cannon.x > canvas.width / 2 ? -55 : 0;
  const projectile = {
    x: cannon.x,
    y: cannon.y + 16,
    vx: drift + (Math.random() - 0.5) * 12,
    vy: 220 + stage * 50 + Math.random() * 30,
    radius,
  };
  projectiles.push(projectile);
}

function spawnPowerUp() {
  const types = ["boost", "immunity", "shrink"];
  const type = types[Math.floor(Math.random() * types.length)];
  const powerUp = {
    x: 70 + Math.random() * (canvas.width - 140),
    y: canvas.height - 44,
    radius: 16,
    type,
  };
  powerUps.push(powerUp);
}

function applyPowerUp(type) {
  if (type === "boost") {
    rocket.boostActive = true;
    rocket.boostTimer = 10;
  } else if (type === "immunity") {
    rocket.immunityTimer = 8;
  } else if (type === "shrink") {
    rocket.smallHitboxTimer = 8;
  }
}

function render() {
  drawBackground();
  drawGround();
  drawCannons();
  drawPowerUps();
  drawRocket();
  drawProjectiles();
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
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 70);
  ctx.lineTo(canvas.width, canvas.height - 70);
  ctx.stroke();
  ctx.restore();
}

function drawGround() {
  ctx.fillStyle = "#132336";
  ctx.fillRect(0, canvas.height - 54, canvas.width, 54);
  ctx.fillStyle = "#27415b";
  ctx.fillRect(0, canvas.height - 54, canvas.width, 8);
}

function drawCannons() {
  cannons.forEach((cannon) => {
    ctx.save();
    ctx.translate(cannon.x, cannon.y);
    ctx.fillStyle = "#2f3640";
    ctx.fillRect(-26, -8, 52, 18);
    ctx.fillRect(-18, -20, 36, 16);
    ctx.fillRect(-10, -30, 20, 16);
    ctx.fillStyle = cannon.flash > 0 ? "#ffd56b" : "#ff5d5d";
    ctx.fillRect(-8, -34, 16, 24);
    ctx.fillStyle = "#1a1d23";
    ctx.fillRect(-6, -8, 12, 14);
    ctx.restore();
  });
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

  if (rocket.boostActive) {
    ctx.fillStyle = "#7df9ff";
    ctx.beginPath();
    ctx.moveTo(-5, 28);
    ctx.lineTo(0, 40);
    ctx.lineTo(5, 28);
    ctx.closePath();
    ctx.fill();
  }
  if (rocket.immunityTimer > 0) {
    ctx.strokeStyle = "#7df9ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 2, 24, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawProjectiles() {
  projectiles.forEach((projectile) => {
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ff4d4d";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#8f0000";
    ctx.stroke();
  });
}

function drawPowerUps() {
  powerUps.forEach((powerUp) => {
    ctx.save();
    ctx.translate(powerUp.x, powerUp.y);
    ctx.fillStyle = powerUp.type === "boost" ? "#f4b942" : powerUp.type === "immunity" ? "#5ce1e6" : "#8f7cff";
    ctx.beginPath();
    ctx.arc(0, 0, powerUp.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(powerUp.type === "boost" ? "B" : powerUp.type === "immunity" ? "I" : "S", 0, 0);
    ctx.restore();
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

window.addEventListener("resize", resizeCanvas);

overlayButton.addEventListener("click", startGame);

resizeCanvas();
updateHud();
render();
