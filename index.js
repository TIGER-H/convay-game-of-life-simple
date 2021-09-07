import { Universe } from "@bezos/wasm-game-of-life";
import { memory } from "@bezos/wasm-game-of-life/wasm_game_of_life_bg";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const universe = Universe.new();
universe.init();
const CELL_SIZE = 5;
universe.set_height(64);
universe.set_width(64);
const height = universe.height();
const width = universe.width();

canvas.width = (CELL_SIZE + 1) * width + 1;
canvas.height = (CELL_SIZE + 1) * height + 1;

// const COLUMNS = canvas.width / CELL_SIZE;
// const ROWS = canvas.height / CELL_SIZE;

const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#ffffff";
const ACTIVE_COLOR = "#000000";

function drawGrid() {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
}

function getIndex(row, column) {
  return row * width + column;
}

const bitInSet = (n, arr) => {
  const byte = Math.floor(n / 8);
  const mask = 1 << n % 8;
  return (arr[byte] & mask) === mask;
};

function drawCells() {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, (width * height) / 8);
  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);
      ctx.fillStyle = bitInSet(idx, cells) ? ACTIVE_COLOR : DEAD_COLOR;
      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
}

let animationId;
function renderLoop() {
  universe.tick();
  drawCells();
  animationId = requestAnimationFrame(renderLoop);
}

let pauseButton = document.getElementById("play-pause");
function play() {
  pauseButton.textContent = "pause";
  renderLoop();
}
pauseButton.addEventListener("click", (e) => {
  if (pauseButton.textContent === "pause") {
    cancelAnimationFrame(animationId);
    pauseButton.textContent = "start";
  } else {
    play();
  }
  console.log("ticked");
});

let randomButton = document.getElementById("random-init");
randomButton.addEventListener("click", (e) => {
  universe.reset();
  universe.init();
  drawCells();
});

let clearButton = document.getElementById("reset");
clearButton.addEventListener("click", (e) => {
  universe.reset();
  drawCells();
  console.log("reset!");
});

canvas.addEventListener("click", (e) => {
  let boundingRect = canvas.getBoundingClientRect();

  let scaleX = canvas.width / boundingRect.width;
  let scaleY = canvas.height / boundingRect.height;

  let canvasLeft = (e.clientX - boundingRect.left) * scaleX;
  let canvasTop = (e.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

  universe.toggle_cell(row, col);
  drawCells();
});

drawGrid();
// renderLoop();
// play();

// 创建网格
// const createBackground = () =>
//   new Array(COLUMNS)
//     .fill(null)
//     .map(() =>
//       new Array(ROWS).fill(null).map(() => Math.floor(Math.random() * 2))
//     );

// let bc = createBackground();
// console.log(bc); // 77x77

// const renderBackground = (bc) => {
//   bc.forEach((r, idx_r) =>
//     r.forEach((e, idx_c) => {
//       ctx.beginPath();
//       ctx.rect(idx_r * CELL_SIZE, idx_c * CELL_SIZE, CELL_SIZE, CELL_SIZE);
//       ctx.fillStyle = e ? ACTIVE_COLOR : DEAD_COLOR;
//       ctx.fill();
//     })
//   );
// };
// renderBackground(bc);

// const next = (bc) => {
//   // 生成下一动画
//   const nextBC = bc.map((e) => [...e]);
//   // 遍历每个cell
//   nextBC.forEach((r) => r.forEach((e) => e));
// };
// const update = () => {
//   // background
//   bc = next(bc);
//   renderBackground(bc);
//   requestAnimationFrame(update);
// };
// requestAnimationFrame(update);
