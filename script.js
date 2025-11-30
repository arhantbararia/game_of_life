// Configuration
let CELL_SIZE = 10;  // cell size in pixels
const GRID_SIZE = 4000; // A large number for a pseudo-infinite grid
const ALIVE_COLOR = 'white';
const DEAD_COLOR = 'black';
const TICK_INTERVAL = 100; // ms between generations
const MIN_CELL_SIZE = 2;
const MAX_CELL_SIZE = 50;

// State
let grid = [];
let rows, cols;
let canvas, ctx;
let view = { x: 0, y: 0 }; // Top-left corner of the viewport in grid coordinates
let running = false;
let drawing = false;
let isPanning = false;
let lastPanPos = { x: 0, y: 0 };
let spacebarDown = false;
let timerId = null;

// RLE Preset Patterns
const presets = {
  glider: 'x = 3, y = 3, rule = B3/S23\nbo$2bo$3o!',
  gosper_glider_gun: 'x = 36, y = 9, rule = B3/S23\n24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!',
  pulsar: 'x = 17, y = 17, rule = B3/S23\n2b3o3b3o2$o4bobo4bo$o4bobo4bo$o4bobo4bo$2b3o3b3o2$$2b3o3b3o2$o4bobo4bo$o4bobo4bo$o4bobo4bo$2b3o3b3o!',
  synth: 'x = 167, y = 88, rule = B3/S23\n53bo$53bobo$53b2o$$17bobo$18b2o$18bo45bo$62b2o$63b2o$$$$$$$$38bo$38bobo42bo51b2o6b2o$38b2o41b2o47b2o2bo2bo4bo2bo2b2o$82b2o45bo2b2ob2o6b2ob2o2bo$127b2ob3o14b3ob2o$126bo4bo16bo4bo$129bo20bo$6bobo$7b2o33bo82bo3bo20bo3bo$7bo32b2o84b3o22b3o$41b2o$$$120bo38bo$117bo3bo36bo3bo$42bo73bo4bo36bo4bo$bo40bobo71bo4bo36bo4bo$2bo39b2o71bo2bobo38bobo2bo$3o111bobo46bobo$114bob2o44b2obo$115b2o46b2o$115bo48bo$69b3o42bo50bo$69bo43bobo48bobo$62bo7bo42bobo48bobo$61b2o51bo50bo$54b3o4bobo$32bo21bo$33bo21bo$24bobo4b3o$25b2o87bo50bo$17bo7bo87bobo48bobo$18bo94bobo48bobo$16b3o95bo50bo$115bo48bo$115b2o46b2o$114bob2o44b2obo$85b3o26bobo46bobo$44b2o39bo29bo2bobo38bobo2bo$43bobo40bo29bo4bo36bo4bo$45bo70bo4bo36bo4bo$117bo3bo36bo3bo$120bo38bo$$$45b2o$46b2o32bo45b3o22b3o$45bo33b2o44bo3bo20bo3bo$79bobo$129bo20bo$126bo4bo16bo4bo$127b2ob3o14b3ob2o$4b2o123bo2b2ob2o6b2ob2o2bo$5b2o41b2o80b2o2bo2bo4bo2bo2b2o$4bo42bobo85b2o6b2o$49bo$$$$$$$$$23b2o$24b2o$23bo45bo$68b2o$68bobo$$33b2o$32bobo$34bo!',
  butterfly: 'x = 112, y = 75, rule = B3/S23\n15bo13bo52bo13bo$14bobo11bobo50bobo11bobo$13b2ob2o9b2ob2o48b2ob2o9b2ob2o$13b2o3bo7bo3b2o48b2o3bo7bo3b2o$14bob4o5b4obo50bob4o5b4obo$14b2o3bo5bo3b2o50b2o3bo5bo3b2o$18b3o3b3o58b3o3b3o$15b2o2bo5bo2b2o52b2o2bo5bo2b2o$15b4o2b3o2b4o52b4o2b3o2b4o$15bobo3b3o3bobo52bobo3b3o3bobo$13b3o2bo7bo2b3o48b3o2bo7bo2b3o$18bo2bobo2bo58bo2bobo2bo$20bo3bo62bo3bo$13b2o15b2o48b2o15b2o$18b2o2bo2b2o58b2o2bo2b2o$21b3o64b3o$$$$$$87bo$86b3o$86bob2o$87b3o$87b2o$$$$4bo5bo90bo5bo$3b3o3b3o88b3o3b3o$2bo2bo3bo2bo86bo2bo3bo2bo$b3o7b3o84b3o7b3o$2bobo5bobo86bobo5bobo$4b2o3b2o90b2o3b2o$o4bo3bo4bo82bo4bo3bo4bo$5bo3bo92bo3bo$2o3bo3bo3b2o82b2o3bo3bo3b2o$2bo2bo3bo2bo86bo2bo3bo2bo$4bo5bo90bo5bo$$$$$$$$$$$$$$$$$$$$$$$$$43bo5bo12bo5bo$42bobo3bobo10bobo3bobo$41b2ob2ob2ob2o8b2ob2ob2ob2o$41bo2bo3bo2bo8bo2bo3bo2bo$39b2ob2o5b2ob2o4b2ob2o5b2ob2o$40b2o9b2o6b2o9b2o$41b2o7b2o8b2o7b2o$42bo7bo10bo7bo$39b2o11b2o4b2o11b2o$40b3o7b3o6b3o7b3o$43bobobobo12bobobobo!',
  max_filler: 'x = 27, y = 27, rule = B3/S23\n18bo$17b3o$12b3o4b2o$11bo2b3o2bob2o$10bo3bobo2bobo$10bo4bobobobob2o$12bo4bobo3b2o$4o5bobo4bo3bob3o$o3b2obob3ob2o9b2o$o5b2o5bo$bo2b2obo2bo2bob2o$7bobobobobobo5b4o$bo2b2obo2bo2bo2b2obob2o3bo$o5b2o3bobobo3b2o5bo$o3b2obob2o2bo2bo2bob2o2bo$4o5bobobobobobo$10b2obo2bo2bob2o2bo$13bo5b2o5bo$b2o9b2ob3obob2o3bo$2b3obo3bo4bobo5b4o$2b2o3bobo4bo$2b2obobobobo4bo$5bobo2bobo3bo$4b2obo2b3o2bo$6b2o4b3o$7b3o$8bo!',
  game_of_life_text: 'x = 68, y = 35, rule = B3/S23\n59b2o$59bo$b7ob8ob3o4b2ob2o6b2o2b9ob3o3b2o4b6o$b7ob8ob4o3b2ob2o6b2o2b9ob3o3b2o3b7o$b2o6b2o4b2ob2obo3b2ob3o5b2o2b2o5b2o2b3ob3o3b2o$b2o6b2o4b2ob2ob2o2b2o2b2o4b2o3b2o5b2o3b2ob2o5bo$b2o6b2o4b2ob2o2b2ob2o2b3o3b2o3b2o5b2o3b5o5bo$b2o6b2o4b2ob2o3bob2o3b2o2b2o4b2o5b2o4b3o6b6o$b2o6b2o4b2ob2o3b4o3b3ob2o4b2o5b2o4b3o7b5o$b7ob8ob2o4b3o4b4o5b9o4b2o12bo$b7ob8ob3o4b2o5b2o6b9o2b4o11b2o$51b3o8b5o$61b6o$8ob8ob11ob6o3b9o2b7o$8ob8ob11ob6o3b9o2b7o$2o7b2o4b2ob2o3b2o2b2ob2o7b2o5b2o2b2o$2o7b2o4b2ob2o3b2o2b2ob2o7b2o5b2o2b2o$2ob5ob8ob2o3b2o2b2ob6o3b2o5b2o2b6o$2ob5ob8ob2o3b2o2b2ob6o3b2o5b2o2b6o$2o4b2ob2o4b2ob2o3b2o2b2ob2o7b2o5b2o2b3o$2o4b2ob2o4b2ob2o3b2o2b2ob2o7b2o5b2o2b3o$2o4b2ob2o4b2ob2o3b2o2b2ob6o3b9o2b3o$8ob2o4b2ob2o3b2o2b2ob6o3b9o2b3o$$$23b2o6b2o2b7ob7o$23b2o6b2o2b7ob7o$23b2o6b2o2b2o6b2o$23b2o6b2o2b2o6b2o$23b2o6b2o2b5o3b5o$23b2o6b2o2b5o3b5o$23b2o6b2o2b2o6b2o$23b2o6b2o2b2o6b2o$23b7ob2o2b2o6b7o$23b7ob2o2b2o6b7o!',
};

// Initialize when page loads
window.onload = () => {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');

  resizeCanvas();
  initGrid();
  loadPreset('game_of_life_text'); // Load default preset
  
  // Controls
  document.getElementById('startStop').addEventListener('click', toggleStart);
  document.getElementById('reset').addEventListener('click', () => {
    stop();
    initGrid();
    drawGrid();
  });
  document.getElementById('presets').addEventListener('change', (e) => {
    const presetName = e.target.value;
    loadPreset(presetName);
    e.target.value = ""; // Reset dropdown selection
  });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Prevent right-click menu
  });

  // Listen for spacebar
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') spacebarDown = true;
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') spacebarDown = false;
  });

  // Allow user to draw on the grid when the simulation is not running
  const drawCell = (e) => {
    if (running) return; // Don't allow drawing while simulation is running
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const c = Math.floor(x / CELL_SIZE + view.x);
    const r = Math.floor(y / CELL_SIZE + view.y);

    if (grid[r] && grid[r][c] !== undefined) {
      grid[r][c] = 1;
      drawGrid();
    }
  };

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0 && spacebarDown) { // Space + Left mouse button for panning
      isPanning = true;
      lastPanPos = { x: e.clientX, y: e.clientY };
    } else if (e.button === 0) { // Left mouse button only for drawing
      drawing = true;
      drawCell(e);
    }
  });
  canvas.addEventListener('mousemove', (e) => {
    // Only draw if not panning
    if (drawing && !isPanning) {
      drawCell(e);
    } else if (isPanning) {
      const dx = e.clientX - lastPanPos.x;
      const dy = e.clientY - lastPanPos.y;

      view.x -= dx / CELL_SIZE;
      view.y -= dy / CELL_SIZE;

      lastPanPos = { x: e.clientX, y: e.clientY };
      drawGrid();
    }
  });
  canvas.addEventListener('mouseup', () => {
    drawing = false;
    isPanning = false;
  });

  canvas.addEventListener('wheel', (e) => {
    handleZoom(e);
  });

  window.addEventListener('resize', () => {
    stop();
    resizeCanvas(); // This will just resize the canvas element, not the grid
    initGrid();
    drawGrid();
  });
};

function resizeCanvas() {
  const width = window.innerWidth;
  const controlsHeight = document.getElementById('controls').offsetHeight;
  const height = window.innerHeight - controlsHeight;
  canvas.width = width;
  canvas.height = height - 5; // Small margin

  cols = Math.ceil(canvas.width / CELL_SIZE);
  rows = Math.ceil(canvas.height / CELL_SIZE);
}

function initGrid() {
  grid = new Array(GRID_SIZE);
  for (let r = 0; r < GRID_SIZE; r++) {
    grid[r] = new Array(GRID_SIZE);
    for (let c = 0; c < GRID_SIZE; c++) {
      // Initialize with all dead cells for drawing
      grid[r][c] = 0;
    }
  }
}

function drawGrid() {
  if (!ctx) return;
  ctx.fillStyle = DEAD_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const startRow = Math.floor(view.y);
  const endRow = startRow + Math.ceil(canvas.height / CELL_SIZE) + 1;
  const startCol = Math.floor(view.x);
  const endCol = startCol + Math.ceil(canvas.width / CELL_SIZE) + 1;

  for (let r = startRow; r < endRow; r++) {
    for (let c = startCol; c < endCol; c++) {
      if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length && grid[r][c]) {
        const canvasX = (c - view.x) * CELL_SIZE;
        const canvasY = (r - view.y) * CELL_SIZE;
        ctx.fillStyle = ALIVE_COLOR;
        ctx.fillRect(canvasX, canvasY, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function getNeighborCount(r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = r + dr;
      const cc = c + dc;
      if (grid[rr] && grid[rr][cc] !== undefined) {
        count += grid[rr][cc];
      }
    }
  }
  return count;
}

function step() {
  // --- Performance Optimization ---
  // Find the bounding box of live cells to avoid iterating the whole 4000x4000 grid.
  let minR = GRID_SIZE, maxR = -1, minC = GRID_SIZE, maxC = -1;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c]) {
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }

  // If no cells are alive, no need to do anything.
  if (maxR === -1) {
    stop();
    return;
  }

  // Create a list of changes to apply after checking all cells.
  const changes = [];

  // Iterate only over the bounding box of live cells, plus a 1-cell margin
  // for cells that might become alive.
  for (let r = minR - 1; r <= maxR + 1; r++) {
    for (let c = minC - 1; c <= maxC + 1; c++) {
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) continue;

      const alive = grid[r][c];
      const neighbors = getNeighborCount(r, c);
      const willBeAlive = alive ? (neighbors === 2 || neighbors === 3) : (neighbors === 3);

      if (Boolean(alive) !== willBeAlive) {
        changes.push({ r, c, state: willBeAlive ? 1 : 0 });
      }
    }
  }

  // Apply all the changes at once.
  changes.forEach(change => {
    grid[change.r][change.c] = change.state;
  });

  drawGrid();
}

function start() {
  if (!running) {
    running = true;
    document.getElementById('startStop').innerText = 'Pause';
    timerId = setInterval(step, TICK_INTERVAL);
  }
}

function stop() {
  running = false;
  document.getElementById('startStop').innerText = 'Start';
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function toggleStart() {
  if (running) {
    stop();
  } else {
    start();
  }
}

function handleZoom(e) {
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Position on the grid before zoom
  const gridXBefore = mouseX / CELL_SIZE + view.x;
  const gridYBefore = mouseY / CELL_SIZE + view.y;

  // Update CELL_SIZE
  const zoomFactor = 1.1;
  const oldCellSize = CELL_SIZE;
  if (e.deltaY < 0) { // Zoom in
    CELL_SIZE = Math.min(MAX_CELL_SIZE, CELL_SIZE * zoomFactor);
  } else { // Zoom out
    CELL_SIZE = Math.max(MIN_CELL_SIZE, CELL_SIZE / zoomFactor);
  }

  // Position on the grid after zoom
  view.x = gridXBefore - mouseX / CELL_SIZE;
  view.y = gridYBefore - mouseY / CELL_SIZE;

  resizeCanvas(); // Just resizes canvas element
  drawGrid();
}

function parseRLE(rleString) {
  const pattern = [];
  let currentRow = [];
  let count = 0;

  // Remove header lines
  const data = rleString.split('\n').slice(1).join('');

  for (const char of data) {
    if (char >= '0' && char <= '9') {
      count = count * 10 + parseInt(char, 10);
    } else if (char === 'b' || char === '.') { // Dead cell
      const num = count || 1;
      for (let i = 0; i < num; i++) {
        currentRow.push(0);
      }
      count = 0;
    } else if (char === 'o' || char === 'A') { // Alive cell
      const num = count || 1;
      for (let i = 0; i < num; i++) {
        currentRow.push(1);
      }
      count = 0;
    } else if (char === '$') { // End of line
      const num = count || 1;
      pattern.push(currentRow);
      for (let i = 1; i < num; i++) {
        pattern.push([]);
      }
      currentRow = [];
      count = 0;
    } else if (char === '!') { // End of pattern
      if (currentRow.length > 0) {
        pattern.push(currentRow);
      }
      break;
    }
  }
  return pattern;
}

function loadPreset(name) {
  if (!name) return;
  stop();
  initGrid(); // Clear the grid

  if (name === 'clear') {
    CELL_SIZE = 10; // Reset zoom for a clear canvas
    view = { x: 0, y: 0 };
    resizeCanvas();
    drawGrid();
    return;
  }

  const pattern = parseRLE(presets[name]);
  const patternHeight = pattern.length;
  const patternWidth = Math.max(...pattern.map(row => row.length)); // Get max width

  // --- Auto-zoom to fit the preset ---
  // Add some padding to the canvas dimensions
  const padding = 0.9;
  const canvasWidthForZoom = canvas.width * padding;
  const canvasHeightForZoom = canvas.height * padding;

  // Calculate the best cell size to fit the pattern, but don't go below min or above max
  const cellSizeX = canvasWidthForZoom / patternWidth;
  const cellSizeY = canvasHeightForZoom / patternHeight;
  CELL_SIZE = Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, cellSizeX, cellSizeY));
  // --- End Auto-zoom ---

  // Calculate top-left position to center the pattern on the large grid
  const startRow = Math.floor((GRID_SIZE - patternHeight) / 2);
  const startCol = Math.floor((GRID_SIZE - patternWidth) / 2);

  // Adjust the view so the pattern appears in the middle of the screen
  view.x = startCol - (canvas.width / CELL_SIZE - patternWidth) / 2;
  view.y = startRow - (canvas.height / CELL_SIZE - patternHeight) / 2;

  pattern.forEach((row, r) => {
    row.forEach((cell, c) => {
      const gridRow = startRow + r;
      const gridCol = startCol + c;
      if (grid[gridRow] && grid[gridRow][gridCol] !== undefined) {
        grid[gridRow][gridCol] = cell;
      }
    });
  });

  drawGrid();
}
