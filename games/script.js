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
const pauseButton = document.getElementById("pauseButton");

const keys = {};
const projectiles = [];
const fallingHazards = [];
const powerUps = [];
const bossShards = [];
const confettiPieces = [];
const goalDodges = 500;
const maxStage = 10;
const stageDuration = 20;
const buffThreshold = 20;
const dayNightInterval = 100;

let gameState = "ready";
let animationFrameId = null;
let lastTimestamp = 0;
let elapsedTime = 0;
let stage = 1;
let dodgeCount = 0;
let cannonFlash = 0;
let powerupTimer = 0;
let arenaPaddingX = 90;
let arenaPaddingY = 110;
let buffMessage = "";
let buffMessageTimer = 0;
let timeOfDay = "day";
let attackCooldown = 0;
let bossSpawnTimer = 0;
let bossCheckpointShown = false;

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
const boss = {
  active: false,
  health: 6000,
  maxHealth: 6000,
};

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  arenaPaddingX = Math.min(90, Math.max(58, canvas.width * 0.12));
  arenaPaddingY = Math.min(110, Math.max(84, canvas.height * 0.16));
  canvas.style.touchAction = "none";
  if (gameState !== "ready") {
    rocket.x = Math.min(canvas.width - arenaPaddingX, Math.max(arenaPaddingX, rocket.x));
    rocket.y = Math.min(canvas.height - 90, Math.max(arenaPaddingY, rocket.y));
  } else {
    rocket.x = canvas.width / 2;
    rocket.y = canvas.height - 90;
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
  fallingHazards.length = 0;
  powerUps.length = 0;
  bossShards.length = 0;
  confettiPieces.length = 0;
  rocket.x = canvas.width / 2;
  rocket.y = canvas.height - 90;
  rocket.boostActive = false;
  rocket.boostTimer = 0;
  rocket.immunityTimer = 0;
  rocket.smallHitboxTimer = 0;
  timeOfDay = "day";
  attackCooldown = 0;
  bossSpawnTimer = 0;
  boss.active = false;
  boss.health = 6000;
  boss.maxHealth = 6000;
  bossCheckpointShown = false;
  buffMessage = "Gold = attack blast, Cyan = shield, Purple = shrink";
  buffMessageTimer = 2.8;
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

function togglePause() {
  if (gameState === "running") {
    gameState = "paused";
    pauseButton.textContent = "Resume";
  } else if (gameState === "paused") {
    gameState = "running";
    pauseButton.textContent = "Pause";
    lastTimestamp = performance.now();
    animationFrameId = requestAnimationFrame(loop);
  }
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
    activeBuff = `ATTACK READY`;
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
  if (buffMessageTimer > 0) {
    buffMessageTimer = Math.max(0, buffMessageTimer - deltaTime);
  }

  if (stage < maxStage && elapsedTime >= stage * stageDuration) {
    stage += 1;
    cannons.length = 0;
    buildCannons();
  }

  if (stage === 5 && !boss.active) {
    boss.active = true;
    boss.health = 6000;
    boss.maxHealth = 6000;
    bossSpawnTimer = 0;
    if (!bossCheckpointShown) {
      bossCheckpointShown = true;
      buffMessage = "Checkpoint: Stage 5 — Void Gate. Avoid the black shards.";
      buffMessageTimer = 3.2;
    }
  }
  if (stage !== 5) {
    boss.active = false;
  }

  if (attackCooldown > 0) {
    attackCooldown = Math.max(0, attackCooldown - deltaTime);
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
  if ((keys[" "] || keys.Space || keys.Enter) && attackCooldown <= 0 && rocket.boostActive) {
    triggerAttack();
    attackCooldown = 0.45;
  }

  rocket.x = Math.max(arenaPaddingX, Math.min(canvas.width - arenaPaddingX, rocket.x));
  rocket.y = Math.max(arenaPaddingY, Math.min(canvas.height - 90, rocket.y));

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

  const hazardSpawnChance = Math.max(0.007, 0.025 - stage * 0.0012);
  if (Math.random() < hazardSpawnChance) {
    spawnHazard();
  }

  if (boss.active) {
    bossSpawnTimer += deltaTime;
    if (bossSpawnTimer >= 0.65) {
      spawnBossShard();
      bossSpawnTimer = 0;
    }
  }

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
      if (dodgeCount > 0 && dodgeCount % dayNightInterval === 0) {
        timeOfDay = timeOfDay === "day" ? "night" : "day";
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

  for (let i = fallingHazards.length - 1; i >= 0; i -= 1) {
    const hazard = fallingHazards[i];
    hazard.y += hazard.vy * deltaTime;
    hazard.x += hazard.vx * deltaTime;

    const hitboxRadius = rocket.smallHitboxTimer > 0 ? rocket.size * 0.58 : rocket.size;
    if (Math.hypot(hazard.x - rocket.x, hazard.y - rocket.y) <= hazard.radius + hitboxRadius) {
      if (rocket.immunityTimer > 0) {
        rocket.immunityTimer = 0;
        fallingHazards.splice(i, 1);
      } else {
        endGame(false);
        return;
      }
    }

    if (hazard.y - hazard.radius > canvas.height) {
      fallingHazards.splice(i, 1);
    }
  }

  for (let i = bossShards.length - 1; i >= 0; i -= 1) {
    const shard = bossShards[i];
    shard.x += shard.vx * deltaTime;
    shard.y += shard.vy * deltaTime;
    shard.vy += 10 * deltaTime;

    const hitboxRadius = rocket.smallHitboxTimer > 0 ? rocket.size * 0.58 : rocket.size;
    if (Math.hypot(shard.x - rocket.x, shard.y - rocket.y) <= shard.radius + hitboxRadius) {
      if (rocket.immunityTimer > 0) {
        rocket.immunityTimer = 0;
        bossShards.splice(i, 1);
      } else {
        endGame(false);
        return;
      }
    }

    if (shard.explosive && shard.y > canvas.height * 0.45) {
      burstShard(shard.x, shard.y);
      bossShards.splice(i, 1);
      continue;
    }

    if (shard.y - shard.radius > canvas.height || shard.x < -120 || shard.x > canvas.width + 120) {
      bossShards.splice(i, 1);
    }
  }

  for (let i = powerUps.length - 1; i >= 0; i -= 1) {
    const powerUp = powerUps[i];
    const hitboxRadius = rocket.smallHitboxTimer > 0 ? rocket.size * 0.58 : rocket.size;
    if (Math.hypot(powerUp.x - rocket.x, powerUp.y - rocket.y) <= powerUp.radius + hitboxRadius) {
      collectPowerUp(powerUp);
      powerUps.splice(i, 1);
    }
  }

  for (let i = confettiPieces.length - 1; i >= 0; i -= 1) {
    const piece = confettiPieces[i];
    piece.x += piece.vx * deltaTime;
    piece.y += piece.vy * deltaTime;
    piece.vy += 180 * deltaTime;
    piece.life -= deltaTime;
    if (piece.life <= 0) {
      confettiPieces.splice(i, 1);
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

function spawnHazard() {
  const size = 8 + Math.random() * 8;
  const hazard = {
    x: 80 + Math.random() * (canvas.width - 160),
    y: -20,
    vx: (Math.random() - 0.5) * 55,
    vy: 180 + stage * 20 + Math.random() * 50,
    radius: size,
    color: Math.random() > 0.6 ? "#f28c28" : "#ff4d4d",
  };
  fallingHazards.push(hazard);
}

function spawnPowerUp() {
  const types = ["attack", "immunity", "shrink"];
  const type = types[Math.floor(Math.random() * types.length)];
  const powerUp = {
    x: 70 + Math.random() * (canvas.width - 140),
    y: canvas.height - 44,
    radius: 16,
    type,
  };
  powerUps.push(powerUp);
}

function collectPowerUp(powerUp) {
  if (powerUp.type === "attack") {
    rocket.boostActive = true;
    rocket.boostTimer = 10;
    buffMessage = "Attack ready! Press space to blast nearby hazards.";
  } else if (powerUp.type === "immunity") {
    rocket.immunityTimer = 8;
    buffMessage = "Shield active! One hit won't stop you.";
  } else if (powerUp.type === "shrink") {
    rocket.smallHitboxTimer = 8;
    buffMessage = "Hitbox reduced!";
  }
  buffMessageTimer = 2.4;
  spawnConfetti(powerUp.x, powerUp.y);
}

function triggerAttack() {
  const radius = 90;
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    if (Math.hypot(projectile.x - rocket.x, projectile.y - rocket.y) <= radius) {
      projectiles.splice(i, 1);
    }
  }
  for (let i = fallingHazards.length - 1; i >= 0; i -= 1) {
    const hazard = fallingHazards[i];
    if (Math.hypot(hazard.x - rocket.x, hazard.y - rocket.y) <= radius) {
      fallingHazards.splice(i, 1);
    }
  }
  for (let i = bossShards.length - 1; i >= 0; i -= 1) {
    const shard = bossShards[i];
    if (Math.hypot(shard.x - rocket.x, shard.y - rocket.y) <= radius) {
      bossShards.splice(i, 1);
      if (boss.active) {
        boss.health = Math.max(0, boss.health - 280);
      }
    }
  }
  if (boss.active && boss.health <= 0) {
    boss.active = false;
    buffMessage = "Void Gate shattered!";
    buffMessageTimer = 2.2;
  } else {
    buffMessage = "Blast! Nearby hazards cleared.";
    buffMessageTimer = 1.8;
  }
}

function render() {
  drawBackground();
  drawGround();
  drawCannons();
  drawBoss();
  drawHazards();
  drawPowerUps();
  drawRocket();
  drawProjectiles();
  drawBossShards();
  drawConfetti();
  drawBuffMessage();
}

function drawBackground() {
  const isNight = timeOfDay === "night";
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, isNight ? "#071322" : "#8ed0ff");
  gradient.addColorStop(0.5, isNight ? "#1f3558" : "#b9e7ff");
  gradient.addColorStop(1, isNight ? "#060816" : "#f8f6d1");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (isNight) {
    for (let i = 0; i < 22; i += 1) {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(60 + i * 38, 70 + ((i % 3) * 20), 1.6 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = "rgba(255, 230, 120, 0.5)";
    ctx.beginPath();
    ctx.arc(canvas.width - 140, 95, 42, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.strokeRect(arenaPaddingX, arenaPaddingY, canvas.width - arenaPaddingX * 2, canvas.height - arenaPaddingY * 2 - 40);
  ctx.restore();

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
  const isNight = timeOfDay === "night";
  ctx.fillStyle = isNight ? "#0d1423" : "#1c4d2f";
  ctx.fillRect(0, canvas.height - 54, canvas.width, 54);
  ctx.fillStyle = isNight ? "#20374b" : "#3a7c42";
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
  const scale = 1 + Math.min(3, stage - 1) * 0.05;
  ctx.save();
  ctx.translate(rocket.x, rocket.y);
  ctx.scale(scale, scale);

  ctx.shadowBlur = 24;
  ctx.shadowColor = "rgba(93, 178, 255, 0.45)";

  ctx.fillStyle = "#f6f7ff";
  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.lineTo(16, 22);
  ctx.lineTo(10, 18);
  ctx.lineTo(0, 28);
  ctx.lineTo(-10, 18);
  ctx.lineTo(-16, 22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#0f1630";
  ctx.fillRect(-12, -8, 24, 20);
  ctx.fillStyle = "#4a8cff";
  ctx.fillRect(-8, -8, 16, 16);
  ctx.fillStyle = "#4dffeb";
  ctx.fillRect(-4, -28, 8, 18);

  ctx.fillStyle = "#ff8b3d";
  ctx.beginPath();
  ctx.moveTo(-8, 18);
  ctx.lineTo(0, 34);
  ctx.lineTo(8, 18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ff5f5f";
  ctx.fillRect(-3, 2, 6, 8);

  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(-10, 0, 4, 0, Math.PI * 2);
  ctx.arc(10, 0, 4, 0, Math.PI * 2);
  ctx.fill();

  if (rocket.boostActive) {
    ctx.fillStyle = "#7df9ff";
    ctx.beginPath();
    ctx.moveTo(-5, 26);
    ctx.lineTo(0, 42);
    ctx.lineTo(5, 26);
    ctx.closePath();
    ctx.fill();
  }
  if (rocket.immunityTimer > 0) {
    ctx.strokeStyle = "#7df9ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 2, 30, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
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

function drawBoss() {
  if (!boss.active) return;
  const x = canvas.width / 2;
  const y = 86;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-140, 12, 280, 12);
  ctx.fillStyle = "#ff3b3b";
  ctx.fillRect(-140, 12, (boss.health / boss.maxHealth) * 280, 12);
  ctx.fillStyle = "#fff";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`VOID GATE ${boss.health}/${boss.maxHealth}`, 0, 8);
  ctx.restore();

  ctx.save();
  ctx.translate(x, y + 28);
  ctx.fillStyle = "#141a25";
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ff4d4d";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#7d35ff";
  ctx.beginPath();
  ctx.arc(0, 0, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHazards() {
  fallingHazards.forEach((hazard) => {
    ctx.beginPath();
    ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
    ctx.fillStyle = hazard.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff2a8";
    ctx.stroke();
  });
}

function drawPowerUps() {
  powerUps.forEach((powerUp) => {
    ctx.save();
    ctx.translate(powerUp.x, powerUp.y);
    ctx.fillStyle = powerUp.type === "attack" ? "#f4b942" : powerUp.type === "immunity" ? "#5ce1e6" : "#8f7cff";
    ctx.beginPath();
    ctx.arc(0, 0, powerUp.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(powerUp.type === "attack" ? "A" : powerUp.type === "immunity" ? "I" : "S", 0, 0);
    ctx.restore();
  });
}

function drawBossShards() {
  bossShards.forEach((shard) => {
    ctx.beginPath();
    ctx.arc(shard.x, shard.y, shard.radius, 0, Math.PI * 2);
    ctx.fillStyle = shard.color;
    ctx.fill();
    if (shard.explosive) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffd166";
      ctx.stroke();
    }
  });
}

function drawConfetti() {
  confettiPieces.forEach((piece) => {
    ctx.fillStyle = piece.color;
    ctx.fillRect(piece.x, piece.y, piece.size, piece.size * 0.7);
  });
}

function drawBuffMessage() {
  if (buffMessageTimer <= 0) {
    return;
  }
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "rgba(7, 14, 30, 0.85)";
  ctx.fillRect(20, 70, 320, 46);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.strokeRect(20, 70, 320, 46);
  ctx.fillStyle = "#f6f7ff";
  ctx.font = "14px sans-serif";
  ctx.fillText(buffMessage, 34, 100);
  ctx.restore();
}

function spawnConfetti(x, y) {
  for (let i = 0; i < 18; i += 1) {
    confettiPieces.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 220,
      vy: -120 - Math.random() * 140,
      size: 4 + Math.random() * 4,
      color: ["#ffd166", "#ff6b6b", "#7df9ff", "#b388ff"][Math.floor(Math.random() * 4)],
      life: 1.2,
    });
  }
}

function burstShard(x, y) {
  for (let i = 0; i < 6; i += 1) {
    bossShards.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 180,
      vy: -140 - Math.random() * 90,
      radius: 4 + Math.random() * 4,
      color: ["#ffd166", "#ff6b6b", "#7df9ff"][Math.floor(Math.random() * 3)],
      explosive: false,
    });
  }
}

function spawnBossShard() {
  const styles = [
    { radius: 11, color: "#ffd59e", vx: (Math.random() - 0.5) * 90, vy: 180 + Math.random() * 80, explosive: false },
    { radius: 15, color: "#ff6b6b", vx: (Math.random() - 0.5) * 120, vy: 190 + Math.random() * 90, explosive: false },
    { radius: 24, color: "#0f0f11", vx: (Math.random() - 0.5) * 60, vy: 220 + Math.random() * 80, explosive: false },
    { radius: 13, color: "#b388ff", vx: (Math.random() - 0.5) * 110, vy: 205 + Math.random() * 90, explosive: true },
  ];
  const style = styles[Math.floor(Math.random() * styles.length)];
  bossShards.push({
    x: canvas.width / 2 + (Math.random() - 0.5) * 80,
    y: 132,
    vx: style.vx,
    vy: style.vy,
    radius: style.radius,
    color: style.color,
    explosive: style.explosive,
  });
}

function handlePointerDown(event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  for (let i = powerUps.length - 1; i >= 0; i -= 1) {
    const powerUp = powerUps[i];
    if (Math.hypot(powerUp.x - x, powerUp.y - y) <= powerUp.radius + 6) {
      collectPowerUp(powerUp);
      powerUps.splice(i, 1);
      break;
    }
  }
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

canvas.addEventListener("pointerdown", handlePointerDown);
window.addEventListener("resize", resizeCanvas);

overlayButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);

resizeCanvas();
updateHud();
render();
