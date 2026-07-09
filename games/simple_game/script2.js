const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const startButton = document.getElementById('startButton');
const gravityLabel = document.getElementById('gravityLabel');
const objective = document.getElementById('objective');

const keys = {};
let running = false;
let gameOver = false;
let won = false;

const world = {
  width: canvas.width,
  height: canvas.height,
  gravity: 1,
  gravityStrength: 0.16,
};

const player = {
  x: 118,
  y: 102,
  size: 16,
  speed: 2.2,
  color: '#f6d7c2',
};

const walls = [
  { x: 0, y: 0, w: canvas.width, h: 16 },
  { x: 0, y: 0, w: 16, h: canvas.height },
  { x: canvas.width - 16, y: 0, w: 16, h: canvas.height },
  { x: 0, y: canvas.height - 16, w: canvas.width, h: 16 },
  { x: 260, y: 90, w: 18, h: 132 },
  { x: 260, y: 300, w: 18, h: 148 },
  { x: 650, y: 90, w: 18, h: 132 },
  { x: 650, y: 300, w: 18, h: 148 },
];

const furniture = [
  { x: 92, y: 308, w: 70, h: 46, color: '#8d5d2b' },
  { x: 458, y: 108, w: 54, h: 54, color: '#7c4e19' },
  { x: 760, y: 300, w: 70, h: 46, color: '#8d5d2b' },
  { x: 430, y: 390, w: 76, h: 34, color: '#7f4c1c' },
];

const plates = [
  { x: 186, y: 456, w: 36, h: 12, active: false, label: 'hall' },
  { x: 720, y: 456, w: 36, h: 12, active: false, label: 'library' },
];

const doors = [
  { x: 290, y: 96, w: 24, h: 108, open: false },
  { x: 642, y: 96, w: 24, h: 108, open: false },
  { x: 468, y: 406, w: 24, h: 92, open: false },
];

const items = [
  {
    id: 'crate',
    x: 186,
    y: 76,
    w: 44,
    h: 44,
    vx: 0,
    vy: 0,
    color: '#8f5f2e',
    resting: false,
  },
  {
    id: 'paperweight',
    x: 728,
    y: 84,
    w: 24,
    h: 24,
    vx: 0,
    vy: 0,
    color: '#f1db7a',
    resting: false,
  },
];

const cats = [
  {
    x: 170,
    y: 160,
    size: 24,
    speed: 0.72,
    patrol: [
      { x: 150, y: 150 },
      { x: 320, y: 150 },
      { x: 320, y: 390 },
      { x: 150, y: 390 },
    ],
    targetIndex: 0,
    color: '#f5eedc',
  },
  {
    x: 740,
    y: 370,
    size: 22,
    speed: 0.6,
    patrol: [
      { x: 710, y: 340 },
      { x: 850, y: 340 },
      { x: 850, y: 470 },
      { x: 710, y: 470 },
    ],
    targetIndex: 0,
    color: '#efe0bf',
  },
];

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isHidden() {
  return furniture.some((piece) => {
    const px = player.x + player.size / 2;
    const py = player.y + player.size / 2;
    const fx = piece.x + piece.w / 2;
    const fy = piece.y + piece.h / 2;
    return Math.abs(px - fx) < 60 && Math.abs(py - fy) < 46;
  });
}

function resetGame() {
  gameOver = false;
  won = false;
  running = false;
  world.gravity = 1;
  player.x = 118;
  player.y = 102;

  plates.forEach((plate) => {
    plate.active = false;
  });
  doors.forEach((door) => {
    door.open = false;
  });

  items.forEach((item, index) => {
    item.x = index === 0 ? 186 : 728;
    item.y = index === 0 ? 76 : 84;
    item.vx = 0;
    item.vy = 0;
    item.resting = false;
  });

  cats.forEach((cat, index) => {
    cat.targetIndex = 0;
    cat.x = index === 0 ? 170 : 740;
    cat.y = index === 0 ? 160 : 370;
  });

  updateHud();
  overlay.classList.remove('hidden');
  overlayTitle.textContent = 'A miniature mansion awaits';
  overlayText.textContent = 'Flip gravity to make the crate and paperweight fall onto the plates, then slip through the final archway.';
  startButton.textContent = 'Enter the diorama';
}

function updateHud() {
  gravityLabel.textContent = `Gravity: ${world.gravity === 1 ? 'Normal' : 'Upside Down'}`;
  const solved = plates.filter((plate) => plate.active).length;
  if (won) {
    objective.textContent = 'Objective: You escaped the paper cats.';
  } else if (solved === 2) {
    objective.textContent = 'Objective: The final archway is ready. Reach the exit.';
  } else {
    objective.textContent = `Objective: Drop the crate and paperweight onto the plates (${solved}/2).`;
  }
}

function beginGame() {
  running = true;
  overlay.classList.add('hidden');
  updateHud();
}

function toggleGravity() {
  if (!running || gameOver || won) return;
  world.gravity *= -1;
  updateHud();
}

function updatePlayer() {
  let moveX = 0;
  let moveY = 0;

  if (keys['ArrowRight'] || keys['d']) moveX += 1;
  if (keys['ArrowLeft'] || keys['a']) moveX -= 1;
  if (keys['ArrowDown'] || keys['s']) moveY += 1;
  if (keys['ArrowUp'] || keys['w']) moveY -= 1;

  if (moveX !== 0 && moveY !== 0) {
    const scale = 1 / Math.sqrt(2);
    moveX *= scale;
    moveY *= scale;
  }

  player.x += moveX * player.speed;
  player.y += moveY * player.speed;

  const next = { x: player.x, y: player.y, w: player.size, h: player.size };
  for (const wall of walls) {
    if (rectsOverlap(next, wall)) {
      player.x -= moveX * player.speed;
      player.y -= moveY * player.speed;
      break;
    }
  }

  for (const piece of furniture) {
    const box = { x: piece.x, y: piece.y, w: piece.w, h: piece.h };
    if (rectsOverlap(next, box)) {
      player.x -= moveX * player.speed;
      player.y -= moveY * player.speed;
      break;
    }
  }

  player.x = clamp(player.x, 24, canvas.width - player.size - 24);
  player.y = clamp(player.y, 24, canvas.height - player.size - 24);
}

function updateItems() {
  items.forEach((item) => {
    item.vy += world.gravity * world.gravityStrength;
    item.vy *= 0.96;
    item.x += item.vx;
    item.y += item.vy;

    if (item.y < 24) {
      item.y = 24;
      item.vy = 0;
      item.resting = true;
    }
    if (item.y + item.h > canvas.height - 24) {
      item.y = canvas.height - 24 - item.h;
      item.vy = 0;
      item.resting = true;
    }
    if (item.x < 24) {
      item.x = 24;
      item.vx = 0;
    }
    if (item.x + item.w > canvas.width - 24) {
      item.x = canvas.width - 24 - item.w;
      item.vx = 0;
    }

    for (const wall of walls) {
      if (rectsOverlap({ x: item.x, y: item.y, w: item.w, h: item.h }, wall)) {
        item.y -= item.vy;
        item.vy = 0;
        item.resting = true;
        break;
      }
    }

    for (const piece of furniture) {
      const box = { x: piece.x, y: piece.y, w: piece.w, h: piece.h };
      if (rectsOverlap({ x: item.x, y: item.y, w: item.w, h: item.h }, box)) {
        item.y = piece.y - item.h;
        item.vy = 0;
        item.resting = true;
        break;
      }
    }

    plates.forEach((plate) => {
      if (rectsOverlap({ x: item.x, y: item.y, w: item.w, h: item.h }, plate)) {
        plate.active = true;
      }
    });
  });
}

function updateCats() {
  cats.forEach((cat) => {
    const target = cat.patrol[cat.targetIndex];
    const dx = target.x - cat.x;
    const dy = target.y - cat.y;
    const mag = Math.hypot(dx, dy) || 1;
    cat.x += (dx / mag) * cat.speed;
    cat.y += (dy / mag) * cat.speed;

    if (Math.hypot(target.x - cat.x, target.y - cat.y) < 1.4) {
      cat.targetIndex = (cat.targetIndex + 1) % cat.patrol.length;
    }
  });
}

function checkDetection() {
  cats.forEach((cat) => {
    const px = player.x + player.size / 2;
    const py = player.y + player.size / 2;
    const cx = cat.x + cat.size / 2;
    const cy = cat.y + cat.size / 2;
    const visibleDistance = Math.hypot(px - cx, py - cy);
    if (visibleDistance < 112 && !isHidden()) {
      gameOver = true;
      running = false;
      overlay.classList.remove('hidden');
      overlayTitle.textContent = 'Spotted by the origami cats';
      overlayText.textContent = 'The cats were too slow to be sneaky, but they still noticed your tiny footsteps. Try again.';
      startButton.textContent = 'Retry the diorama';
    }
  });
}

function checkWin() {
  if (plates.every((plate) => plate.active)) {
    doors.forEach((door) => {
      door.open = true;
    });
    const atExit = player.x > 430 && player.x < 520 && player.y > 370;
    if (atExit) {
      won = true;
      running = false;
      overlay.classList.remove('hidden');
      overlayTitle.textContent = 'The mansion gives up its secrets';
      overlayText.textContent = 'You turned the cardboard house inside out and escaped the sleepy guards.';
      startButton.textContent = 'Play again';
    }
  }
}

function drawBackground() {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, '#41362a');
  bg.addColorStop(0.5, '#24170f');
  bg.addColorStop(1, '#11110f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#f7d5b2';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  ctx.fillStyle = '#3b2a20';
  ctx.fillRect(48, 42, canvas.width - 96, canvas.height - 84);
  ctx.fillStyle = '#f4dcc0';
  ctx.fillRect(58, 52, canvas.width - 116, canvas.height - 104);

  ctx.strokeStyle = '#c66b2a';
  ctx.lineWidth = 4;
  ctx.strokeRect(58, 52, canvas.width - 116, canvas.height - 104);
}

function drawRooms() {
  const rooms = [
    { x: 76, y: 90, w: 180, h: 150, color: '#d8a06a' },
    { x: 350, y: 90, w: 240, h: 150, color: '#b88d52' },
    { x: 76, y: 290, w: 180, h: 130, color: '#d8a06a' },
    { x: 350, y: 290, w: 240, h: 130, color: '#b88d52' },
  ];

  rooms.forEach((room) => {
    ctx.fillStyle = room.color;
    ctx.fillRect(room.x, room.y, room.w, room.h);
    ctx.strokeStyle = '#5f3c17';
    ctx.lineWidth = 3;
    ctx.strokeRect(room.x, room.y, room.w, room.h);

    ctx.strokeStyle = 'rgba(255,255,255,0.38)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(room.x + 6, room.y + 8);
    ctx.lineTo(room.x + room.w - 8, room.y + 8);
    ctx.moveTo(room.x + 8, room.y + room.h - 8);
    ctx.lineTo(room.x + room.w - 8, room.y + room.h - 8);
    ctx.stroke();
  });

  ctx.strokeStyle = '#7f4f21';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(260, 90);
  ctx.lineTo(260, 240);
  ctx.moveTo(650, 90);
  ctx.lineTo(650, 240);
  ctx.moveTo(260, 300);
  ctx.lineTo(260, 448);
  ctx.moveTo(650, 300);
  ctx.lineTo(650, 448);
  ctx.stroke();

  ctx.fillStyle = '#f7e9ca';
  ctx.fillRect(120, 50, 84, 24);
  ctx.fillRect(142, 50, 40, 38);
  ctx.fillRect(400, 54, 46, 22);
  ctx.fillRect(730, 54, 70, 22);
}

function drawFurniture() {
  furniture.forEach((piece) => {
    ctx.fillStyle = piece.color;
    ctx.fillRect(piece.x, piece.y, piece.w, piece.h);
    ctx.strokeStyle = '#4d2d10';
    ctx.lineWidth = 2;
    ctx.strokeRect(piece.x, piece.y, piece.w, piece.h);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(piece.x + 6, piece.y + 6, piece.w - 12, 8);
  });
}

function drawPlates() {
  plates.forEach((plate) => {
    ctx.fillStyle = plate.active ? '#78d06c' : '#f0f0f0';
    ctx.fillRect(plate.x, plate.y, plate.w, plate.h);
    ctx.strokeStyle = '#6c3f19';
    ctx.lineWidth = 2;
    ctx.strokeRect(plate.x, plate.y, plate.w, plate.h);
    ctx.fillStyle = '#5d3b1f';
    ctx.fillRect(plate.x + 6, plate.y + 2, plate.w - 12, 4);
  });
}

function drawDoors() {
  doors.forEach((door) => {
    ctx.fillStyle = door.open ? '#9fd3b8' : '#6c3f19';
    ctx.fillRect(door.x, door.y, door.w, door.h);
    ctx.strokeStyle = '#3e2410';
    ctx.lineWidth = 2;
    ctx.strokeRect(door.x, door.y, door.w, door.h);
  });
}

function drawItems() {
  items.forEach((item) => {
    ctx.fillStyle = item.color;
    ctx.fillRect(item.x, item.y, item.w, item.h);
    ctx.strokeStyle = '#4d2d10';
    ctx.lineWidth = 2;
    ctx.strokeRect(item.x, item.y, item.w, item.h);
    if (item.id === 'crate') {
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fillRect(item.x + 6, item.y + 6, item.w - 12, 8);
    }
  });
}

function drawCats() {
  cats.forEach((cat) => {
    ctx.save();
    ctx.translate(cat.x, cat.y);
    ctx.fillStyle = cat.color;
    ctx.beginPath();
    ctx.arc(cat.size * 0.5, cat.size * 0.5, cat.size * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4d3a33';
    ctx.fillRect(cat.size * 0.2, cat.size * 0.62, cat.size * 0.6, cat.size * 0.16);
    ctx.fillRect(cat.size * 0.18, cat.size * 0.3, cat.size * 0.17, cat.size * 0.2);
    ctx.fillRect(cat.size * 0.62, cat.size * 0.3, cat.size * 0.17, cat.size * 0.2);
    ctx.restore();
  });
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.size / 2, player.size / 2, player.size / 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4b2f1b';
  ctx.fillRect(player.size * 0.35, player.size * 0.32, player.size * 0.3, player.size * 0.12);
  ctx.fillRect(player.size * 0.25, player.size * 0.72, player.size * 0.5, player.size * 0.08);
  ctx.restore();
}

function drawHUD() {
  ctx.save();
  ctx.fillStyle = 'rgba(7, 4, 2, 0.7)';
  ctx.fillRect(18, 18, 240, 52);
  ctx.fillStyle = '#f7e4c4';
  ctx.font = 'bold 14px Trebuchet MS';
  ctx.fillText(`Gravity: ${world.gravity === 1 ? 'Normal' : 'Upside Down'}`, 30, 42);
  ctx.font = '12px Trebuchet MS';
  ctx.fillText('Space flips the room', 30, 58);
  ctx.restore();
}

function draw() {
  drawBackground();
  drawRooms();
  drawFurniture();
  drawPlates();
  drawDoors();
  drawItems();
  drawCats();
  drawPlayer();
  drawHUD();
}

function loop() {
  if (running && !gameOver && !won) {
    updatePlayer();
    updateItems();
    updateCats();
    checkDetection();
    checkWin();
    updateHud();
  }
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  keys[event.key] = true;
  if (event.code === 'Space') {
    event.preventDefault();
    toggleGravity();
  }
  if (event.key.toLowerCase() === 'r') {
    resetGame();
  }
  if (event.key === 'Enter' && !running && !gameOver && !won) {
    beginGame();
  }
});

window.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

startButton.addEventListener('click', () => {
  if (gameOver || won) {
    resetGame();
  }
  beginGame();
});

resetGame();
loop();
