// matching-game.js
// Fully integrated Matching Game for Wiley Teaches Typing
// Features:
// - Automatic leveling
// - Performance-based level jumps
// - Persistent progress
// - Reset support
// - Fullscreen mode
// - Fallback images
// - Wiley-style UI

// -------------------------------
// IMAGE POOLS (with fallback)
// -------------------------------
const DEFAULT_IMAGES = [
  "assets/matching/default/icon_01.png",
  "assets/matching/default/icon_02.png",
  "assets/matching/default/icon_03.png",
  "assets/matching/default/icon_04.png",
  "assets/matching/default/icon_05.png",
  "assets/matching/default/icon_06.png",
  "assets/matching/default/icon_07.png",
  "assets/matching/default/icon_08.png",
  "assets/matching/default/icon_09.png",
  "assets/matching/default/icon_10.png",
  "assets/matching/default/icon_11.png",
  "assets/matching/default/icon_12.png"
];

// Grade-specific pools (optional)
const IMAGE_POOLS = {
  0: DEFAULT_IMAGES,
  1: DEFAULT_IMAGES,
  2: DEFAULT_IMAGES,
  3: DEFAULT_IMAGES,
  4: DEFAULT_IMAGES,
  5: DEFAULT_IMAGES,
  6: DEFAULT_IMAGES,
  7: DEFAULT_IMAGES,
  8: DEFAULT_IMAGES,
  9: DEFAULT_IMAGES,
  10: DEFAULT_IMAGES,
  11: DEFAULT_IMAGES,
  12: DEFAULT_IMAGES
};

// -------------------------------
// MATCHING GAME MODULE
// -------------------------------
const MatchingGame = (function () {
  // -------------------------------
  // STATE
  // -------------------------------
  let currentGradeIndex = 0;
  let currentLevel = 1; // 1–30
  let maxLevel = 30;

  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let moves = 0;
  let matchedPairs = 0;
  let totalPairs = 0;

  let timerInterval = null;
  let remainingTime = null;
  let currentTimeLimit = null;

  // -------------------------------
  // DOM ELEMENTS
  // -------------------------------
  const board = document.getElementById("matchingBoard");
  const gradeLabel = document.getElementById("matchingGradeLabel");
  const levelLabel = document.getElementById("matchingLevelLabel");
  const movesLabel = document.getElementById("matchingMovesLabel");
  const timerLabel = document.getElementById("matchingTimerLabel");
  const feedbackEl = document.getElementById("matchingFeedback");
  const startBtn = document.getElementById("matchingStartBtn");

  const flipSound = document.getElementById("flipSound");
  const matchSound = document.getElementById("matchSound");
  const winSound = document.getElementById("winSound");

  // -------------------------------
  // PERSISTENT PROGRESS
  // -------------------------------
  function loadProgress(gradeIndex) {
    const saved = localStorage.getItem("matchingProgress");
    if (!saved) return { grade: gradeIndex, level: 1 };

    try {
      const parsed = JSON.parse(saved);
      if (parsed.grade === gradeIndex) return parsed;
      return { grade: gradeIndex, level: 1 };
    } catch {
      return { grade: gradeIndex, level: 1 };
    }
  }

  function saveProgress() {
    localStorage.setItem(
      "matchingProgress",
      JSON.stringify({
        grade: currentGradeIndex,
        level: currentLevel
      })
    );
  }

  // -------------------------------
  // INITIALIZATION FROM WILEY
  // -------------------------------
  function initFromGrade(wileyGrade) {
    // Map Wiley grade ("K" or "1"–"12") to index
    if (wileyGrade === "K") currentGradeIndex = 0;
    else currentGradeIndex = Math.min(12, Math.max(1, parseInt(wileyGrade, 10)));

    // Load saved progress
    const progress = loadProgress(currentGradeIndex);
    currentLevel = progress.level;

    gradeLabel.textContent = GRADES[currentGradeIndex];
    levelLabel.textContent = `Level ${currentLevel}`;
    movesLabel.textContent = "0";
    timerLabel.textContent = "";
    feedbackEl.textContent = `Resuming Level ${currentLevel}. Press Start to continue.`;
    feedbackEl.className = "feedback";
  }

  // -------------------------------
  // START GAME
  // -------------------------------
  function startGame() {
    enterFullscreen();

    resetState();

    const cfg = LEVEL_CONFIG[currentGradeIndex][currentLevel - 1];
    if (!cfg) return;

    const rows = cfg.rows;
    const cols = cfg.cols;
    const cardCount = rows * cols;

    totalPairs = cardCount / 2;
    currentTimeLimit = cfg.timeLimit || null;

    levelLabel.textContent = `Level ${currentLevel}`;
    movesLabel.textContent = "0";
    timerLabel.textContent = currentTimeLimit ? `Time: ${currentTimeLimit}s` : "";

    // Prepare board
    board.className = "matching-board";
    board.classList.add(`board-${rows}x${cols}`);

    // Build deck
    const images = IMAGE_POOLS[currentGradeIndex] || DEFAULT_IMAGES;
    const chosen = [];
    for (let i = 0; i < totalPairs; i++) {
      chosen.push(images[i % images.length]);
    }
    const deck = shuffle([...chosen, ...chosen]);

    // Render cards
    board.innerHTML = "";
    deck.forEach((imgSrc) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.image = imgSrc;

      const inner = document.createElement("div");
      inner.classList.add("card-inner");

      const front = document.createElement("div");
      front.classList.add("card-face", "card-front");
      front.textContent = "Match";

      const back = document.createElement("div");
      back.classList.add("card-face", "card-back");
      back.style.backgroundImage = `url('${imgSrc}')`;

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);

      card.addEventListener("click", () => handleCardClick(card));

      board.appendChild(card);
    });

    feedbackEl.textContent = "Find all matching pairs!";
    feedbackEl.className = "feedback";

    // Timer
    if (currentTimeLimit) {
      remainingTime = currentTimeLimit;
      timerInterval = setInterval(() => {
        remainingTime--;
        timerLabel.textContent = `Time: ${remainingTime}s`;
        if (remainingTime <= 0) {
          clearInterval(timerInterval);
          endGame(false);
        }
      }, 1000);
    }
  }

  // -------------------------------
  // CARD CLICK
  // -------------------------------
  function handleCardClick(card) {
    if (lockBoard) return;
    if (card === firstCard) return;
    if (card.classList.contains("matched")) return;

    if (flipSound) flipSound.play().catch(() => {});

    card.classList.add("flipped");

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    lockBoard = true;
    moves++;
    movesLabel.textContent = moves.toString();

    checkForMatch();
  }

  // -------------------------------
  // MATCH CHECK
  // -------------------------------
  function checkForMatch() {
    const isMatch = firstCard.dataset.image === secondCard.dataset.image;

    if (isMatch) {
      if (matchSound) matchSound.play().catch(() => {});
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");
      matchedPairs++;

      resetTurn();

      if (matchedPairs === totalPairs) {
        endGame(true);
      }
    } else {
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetTurn();
      }, 800);
    }
  }

  function resetTurn() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  // -------------------------------
  // END GAME
  // -------------------------------
  function endGame(won) {
    clearInterval(timerInterval);

    let accuracy = Math.round((matchedPairs / totalPairs) * 100);
    let moveThreshold = totalPairs * 3;

    let levelJump = 0;

    if (won) {
      if (winSound) winSound.play().catch(() => {});

      // Performance evaluation
      if (accuracy >= 95 && moves <= totalPairs * 2) {
        levelJump = 2;
      } else if (accuracy >= 80 && moves <= moveThreshold) {
        levelJump = 1;
      } else {
        levelJump = 0;
      }

      setTimeout(() => alert("Great job! You completed the level!"), 300);
    } else {
      levelJump = 0;
      setTimeout(() => alert("Time’s up! Try again."), 300);
    }

    // Apply level jump
    if (levelJump > 0) {
      currentLevel = Math.min(maxLevel, currentLevel + levelJump);
    }

    saveProgress();

    // Report to app.js
    if (window.updateMatchingProgress) {
      window.updateMatchingProgress({
        won,
        moves,
        matchedPairs,
        totalPairs,
        timeLimit: currentTimeLimit,
        remainingTime,
        accuracy,
        levelJump,
        newLevel: currentLevel
      });
    }

    exitFullscreen();
  }

  // -------------------------------
  // RESET STATE
  // -------------------------------
  function resetState() {
    clearInterval(timerInterval);
    timerInterval = null;
    remainingTime = null;
    moves = 0;
    matchedPairs = 0;
    totalPairs = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    board.innerHTML = "";
  }

  // -------------------------------
  // FULLSCREEN MODE
  // -------------------------------
  function enterFullscreen() {
    document.querySelector(".tabs").classList.add("hidden");
    document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
    document.getElementById("gamesTab").classList.remove("hidden");
    document.getElementById("matchingGameContainer").classList.add("fullscreen-game");
  }

  function exitFullscreen() {
    document.querySelector(".tabs").classList.remove("hidden");
    document.querySelectorAll(".section").forEach(s => s.classList.remove("hidden"));
    document.getElementById("matchingGameContainer").classList.remove("fullscreen-game");
  }

  // -------------------------------
  // SHUFFLE
  // -------------------------------
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // -------------------------------
  // WIRE UI
  // -------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    if (startBtn) startBtn.addEventListener("click", startGame);
  });

  // -------------------------------
  // PUBLIC API
  // -------------------------------
  return {
    initFromGrade,
    resetProgress: function () {
      currentLevel = 1;
      saveProgress();
      feedbackEl.textContent = "Progress reset. You are now at Level 1.";
      feedbackEl.className = "feedback";
    }
  };
})();
