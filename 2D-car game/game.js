const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

// Road occupies the middle; small grass margins on each side.
const ROAD_MARGIN = 40;
const ROAD_LEFT = ROAD_MARGIN;
const ROAD_RIGHT = W - ROAD_MARGIN;
const ROAD_WIDTH = ROAD_RIGHT - ROAD_LEFT;

const CAR_W = 40;
const CAR_H = 70;

const player = {
  x: W / 2 - CAR_W / 2,
  y: H - CAR_H - 20,
  speed: 5,
};

let enemies = [];
let laneOffset = 0;     // for animating the dashed center line
let spawnTimer = 0;
let score = 0;
let baseSpeed = 3;      // how fast the world scrolls / enemies fall
let gameOver = false;

const keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (gameOver && (e.key === " " || e.key === "Enter")) reset();
});
document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function reset() {
  enemies = [];
  player.x = W / 2 - CAR_W / 2;
  score = 0;
  baseSpeed = 3;
  spawnTimer = 0;
  gameOver = false;
}

function spawnEnemy() {
  // Pick a random horizontal position fully inside the road.
  const x = ROAD_LEFT + Math.random() * (ROAD_WIDTH - CAR_W);
  enemies.push({ x, y: -CAR_H });
}

function overlap(a, b) {
  return (
    a.x < b.x + CAR_W &&
    a.x + CAR_W > b.x &&
    a.y < b.y + CAR_H &&
    a.y + CAR_H > b.y
  );
}

function update() {
  if (gameOver) return;

  // Steering.
  if (keys["ArrowLeft"] || keys["a"] || keys["A"]) player.x -= player.speed;
  if (keys["ArrowRight"] || keys["d"] || keys["D"]) player.x += player.speed;

  // Keep player on the road.
  player.x = Math.max(ROAD_LEFT, Math.min(ROAD_RIGHT - CAR_W, player.x));

  // Scroll the road lines.
  laneOffset = (laneOffset + baseSpeed) % 40;

  // Spawn enemies on a timer that tightens as speed grows.
  spawnTimer++;
  if (spawnTimer > Math.max(40, 90 - baseSpeed * 6)) {
    spawnEnemy();
    spawnTimer = 0;
  }

  // Move enemies, score, and detect collisions.
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.y += baseSpeed;

    if (overlap(player, e)) {
      gameOver = true;
    }

    if (e.y > H) {
      enemies.splice(i, 1);
      score++;
      // Gradually ramp difficulty.
      baseSpeed = 3 + score * 0.1;
    }
  }
}

function drawCar(x, y, color) {
  // Body.
  ctx.fillStyle = color;
  ctx.fillRect(x, y, CAR_W, CAR_H);
  // Windshield.
  ctx.fillStyle = "rgba(200, 230, 255, 0.85)";
  ctx.fillRect(x + 6, y + 10, CAR_W - 12, 16);
  // Wheels.
  ctx.fillStyle = "#111";
  ctx.fillRect(x - 4, y + 10, 4, 18);
  ctx.fillRect(x + CAR_W, y + 10, 4, 18);
  ctx.fillRect(x - 4, y + CAR_H - 28, 4, 18);
  ctx.fillRect(x + CAR_W, y + CAR_H - 28, 4, 18);
}

function draw() {
  // Grass.
  ctx.fillStyle = "#2e5d34";
  ctx.fillRect(0, 0, W, H);

  // Road.
  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, H);

  // Edge lines.
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(ROAD_LEFT + 4, 0, 4, H);
  ctx.fillRect(ROAD_RIGHT - 8, 0, 4, H);

  // Dashed center line (animated).
  ctx.fillStyle = "#f2d22e";
  for (let y = -40 + laneOffset; y < H; y += 40) {
    ctx.fillRect(W / 2 - 3, y, 6, 22);
  }

  // Cars.
  enemies.forEach((e) => drawCar(e.x, e.y, "#e63946"));
  drawCar(player.x, player.y, "#4dd0e1");

  // Score.
  ctx.fillStyle = "#fff";
  ctx.font = "20px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 12, 28);

  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "32px system-ui, sans-serif";
    ctx.fillText("Game Over", W / 2, H / 2 - 20);
    ctx.font = "18px system-ui, sans-serif";
    ctx.fillText("Score: " + score, W / 2, H / 2 + 12);
    ctx.fillText("Press Space to restart", W / 2, H / 2 + 44);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
