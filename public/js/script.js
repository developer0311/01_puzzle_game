const puzzleContainer = document.getElementById("puzzleContainer");
const startBtn = document.getElementById("startBtn");
const moveCounter = document.getElementById("moveCounter");
const imageInput = document.getElementById("imageInput");
const difficultySelect = document.getElementById("difficultySelect");
const timerDisplay = document.getElementById("timer");
const solveBtn = document.getElementById("solveBtn");
const pauseResumeBtn = document.getElementById("pauseResumeBtn");

let tileCount = 3;
let moves = 0;
let tiles = [];
let correctOrder = [];
let currentImage = new Image();
currentImage.src = "public/images/default.png";
let timer;
let seconds = 0;
let isTimerRunning = false; // Variable to track timer status (running or paused)

// Start the puzzle-solving process
solveBtn.addEventListener("click", solvePuzzle);

// Function to create the puzzle tiles
function createTiles(rows, cols, imageSrc) {
  const grid = document.querySelector(".puzzle-grid");
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  for (let i = 0; i < rows * cols; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");

    // Set the image, size, and position
    tile.style.backgroundImage = `url('${imageSrc}')`;
    tile.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
    tile.style.backgroundPosition = `${(i % cols) * (100 / (cols - 1))}% ${Math.floor(i / cols) * (100 / (rows - 1))}%`;

    grid.appendChild(tile);
  }
}

// Default tile creation
createTiles(3, 3, "public/images/default.png");

// Handle image upload and crop to square
imageInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size, 0, 0, size, size);
        currentImage.src = canvas.toDataURL();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Handle difficulty change
difficultySelect.addEventListener("change", () => {
  tileCount = parseInt(difficultySelect.value);
});

// Start the puzzle with reset functionality
startBtn.addEventListener("click", () => {
  moves = 0;
  moveCounter.textContent = `Moves: ${moves}`;
  seconds = 0; // Reset seconds to 0 when starting a new puzzle
  timerDisplay.textContent = `Time: 0s`; // Reset timer display
  startTimer();
  generatePuzzle();
});

// Generate the puzzle grid with shuffled tiles
function generatePuzzle() {
  puzzleContainer.innerHTML = "";
  puzzleContainer.style.gridTemplateColumns = `repeat(${tileCount}, 1fr)`;
  puzzleContainer.style.gridTemplateRows = `repeat(${tileCount}, 1fr)`;

  const canvas = document.createElement("canvas");
  canvas.width = tileCount * 100;
  canvas.height = tileCount * 100;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

  const tempTiles = [];
  correctOrder = [];
  for (let row = 0; row < tileCount; row++) {
    for (let col = 0; col < tileCount; col++) {
      const canvasTile = document.createElement("canvas");
      canvasTile.width = 100;
      canvasTile.height = 100;
      const tileCtx = canvasTile.getContext("2d");
      tileCtx.drawImage(canvas, col * 100, row * 100, 100, 100, 0, 0, 100, 100);

      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.style.backgroundImage = `url(${canvasTile.toDataURL()})`;
      tile.dataset.index = row * tileCount + col;
      correctOrder.push(tile.dataset.index);
      tempTiles.push(tile);
    }
  }

  shuffleArray(tempTiles);
  tempTiles.forEach((tile) => {
    puzzleContainer.appendChild(tile);
    addDragDrop(tile);
  });
  tiles = tempTiles;
}

// Add drag and drop functionality to each tile
function addDragDrop(tile) {
  tile.setAttribute("draggable", true);

  tile.addEventListener("dragstart", () => {
    tile.classList.add("dragging");
  });

  tile.addEventListener("dragend", () => {
    tile.classList.remove("dragging");
  });

  tile.addEventListener("dragover", (e) => e.preventDefault());

  tile.addEventListener("drop", (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    if (dragging && dragging !== tile) {
      const index1 = tiles.indexOf(dragging);
      const index2 = tiles.indexOf(tile);
      [tiles[index1], tiles[index2]] = [tiles[index2], tiles[index1]];
      renderTiles();
      moves++;
      moveCounter.textContent = `Moves: ${moves}`;
      checkWin();
    }
  });
}

// Render the tiles on the grid
function renderTiles() {
  puzzleContainer.innerHTML = "";
  tiles.forEach((tile) => puzzleContainer.appendChild(tile));
}

// Check if the puzzle is solved
function checkWin() {
  const currentOrder = tiles.map(tile => tile.dataset.index);
  if (currentOrder.join() === correctOrder.join()) {
    const winMsg = document.createElement("div");
    winMsg.className = "win-message";
    winMsg.innerHTML = `<h2>🎉 Puzzle Solved!</h2><p>Moves: ${moves} in ${seconds} seconds</p>`;
    document.body.appendChild(winMsg);
    setTimeout(() => winMsg.remove(), 4000); // Automatically remove the message after a few seconds
    clearInterval(timer); // Stop the timer
    isTimerRunning = false; // Ensure the timer state is updated
  }
}

// Shuffle tiles using Fisher-Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Solve the puzzle by auto-arranging the tiles
function solvePuzzle() {
  tiles.sort((a, b) => {
    return parseInt(a.dataset.index) - parseInt(b.dataset.index);
  });
  renderTiles();
  alert("Puzzle auto-solved!");
}

// Timer to track the time taken to solve the puzzle
function startTimer() {
  if (isTimerRunning) return; // Prevent starting a new timer if it's already running
  isTimerRunning = true;

  timer = setInterval(() => {
    seconds++;
    timerDisplay.textContent = `Time: ${seconds}s`;
  }, 1000);
}

// Pause or Resume the timer
function pauseResumeTimer() {
  if (isTimerRunning) {
    clearInterval(timer);
    isTimerRunning = false;
    pauseResumeBtn.textContent = "Resume Timer"; // Change button text to 'Resume'
  } else {
    startTimer();
    pauseResumeBtn.textContent = "Pause Timer"; // Change button text to 'Pause'
  }
}

// Add event listener to the Pause/Resume button
pauseResumeBtn.addEventListener("click", pauseResumeTimer);

startBtn.addEventListener("click", () => {
  moves = 0;
  moveCounter.textContent = `Moves: ${moves}`;
  startTimer();
  generatePuzzle();
  // Reset the pause/resume button text when a new puzzle is started
  pauseResumeBtn.textContent = "Pause Timer";
});
