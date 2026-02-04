// balloon.js
// Arcade-style Balloon Pop game with Timed and Escape modes

const BalloonGame = (function () {
  const MODES = {
    TIMED: "timed",
    ESCAPE: "escape"
  };

  let mode = MODES.TIMED;
  let score = 0;
  let combo = 0;
  let escaped = 0;
  let timeLeft = 60;
  let running = false;

  let difficulty = getDifficultyForGrade(3); // updated by app.js

  let spawnInterval = null;
  let timerInterval = null;

  const areaEl = () => document.getElementById("balloonArea");
  const scoreEl = () => document.getElementById("balloonScore");
  const comboEl = () => document.getElementById("balloonCombo");
  const escapedEl = () => document.getElementById("balloonEscaped");
  const timeEl = () => document.getElementById("balloonTime");
  const feedbackEl = () => document.getElementById("balloonFeedback");
  const inputEl = () => document.getElementById("balloonInput");
  const modeModalEl = () => document.getElementById("balloonModeModal");

  function setDifficulty(diff) {
    difficulty = diff;
  }

  function openModeModal() {
    modeModalEl().classList.remove("hidden");
  }

  function closeModeModal() {
    modeModalEl().classList.add("hidden");
  }

  function resetState() {
    score = 0;
    combo = 0;
    escaped = 0;
    timeLeft = 60;
    running = false;
    scoreEl().textContent = score;
    comboEl().textContent = combo;
    escapedEl().textContent = escaped;
    timeEl().textContent = timeLeft;
    feedbackEl().textContent = "Type any balloon's word and press Enter.";
    feedbackEl().className = "feedback";
    inputEl().value = "";
    if (areaEl()) areaEl().innerHTML = "";
    clearIntervals();
  }

  function clearIntervals() {
    if (spawnInterval) clearInterval(spawnInterval);
    if (timerInterval) clearInterval(timerInterval);
    spawnInterval = null;
    timerInterval = null;
  }

  function startGame(selectedMode) {
    mode = selectedMode || MODES.TIMED;
    resetState();
    running = true;

    // Timer for timed mode
    if (mode === MODES.TIMED) {
      timerInterval = setInterval(() => {
        timeLeft--;
        timeEl().textContent = timeLeft;
        if (timeLeft <= 0) {
          endGame("Time's up!");
        }
      }, 1000);
    } else {
      // Escape mode: time is informational only
      timeLeft = 60;
      timeEl().textContent = timeLeft;
      timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft < 0) timeLeft = 0;
        timeEl().textContent = timeLeft;
      }, 1000);
    }

    // Balloon spawner
    const baseSpawn = difficulty.spawnRate;
    spawnInterval = setInterval(() => {
      if (!running) return;
      spawnBalloon();
    }, baseSpawn);

    // Also spawn a few at start
    for (let i = 0; i < 3; i++) spawnBalloon();
  }

  function endGame(reason) {
    running = false;
    clearIntervals();
    feedbackEl().textContent = `${reason} Final score: ${score}, combo: ${combo}, escaped: ${escaped}.`;
    feedbackEl().className = "feedback";
  }

  function spawnBalloon() {
    const area = areaEl();
    if (!area) return;

    const balloon = document.createElement("div");
    balloon.className = "balloon";

    const word = getRandomWordByLevel(difficulty.wordLevel);
    balloon.dataset.word = word;
    balloon.textContent = word;

    const areaWidth = area.clientWidth || 600;
    const x = Math.random() * (areaWidth - 80) + 10;
    balloon.style.left = `${x}px`;

    const speed = 0.6 * difficulty.speed + Math.random() * 0.4;
    balloon.dataset.speed = speed.toString();

    area.appendChild(balloon);

    // Movement loop
    const moveInterval = setInterval(() => {
      if (!running) {
        clearInterval(moveInterval);
        if (balloon.parentNode) balloon.parentNode.removeChild(balloon);
        return;
      }
      const currentBottom = parseFloat(balloon.style.bottom || "-40");
      const newBottom = currentBottom + speed * 2;
      balloon.style.bottom = `${newBottom}px`;

      if (newBottom > area.clientHeight + 20) {
        clearInterval(moveInterval);
        if (balloon.parentNode) balloon.parentNode.removeChild(balloon);
        escaped++;
        escapedEl().textContent = escaped;
        combo = 0;
        comboEl().textContent = combo;
        feedbackEl().textContent = "A balloon escaped!";
        feedbackEl().className = "feedback bad";
        if (mode === MODES.ESCAPE && escaped >= 10) {
          endGame("Too many balloons escaped.");
        }
      }
    }, 40);
  }

  function handleInputEnter() {
    if (!running) return { score, combo, escaped };

    const typed = inputEl().value.trim().toLowerCase();
    if (!typed) return { score, combo, escaped };

    const balloons = Array.from(areaEl().querySelectorAll(".balloon"));
    const match = balloons.find(b => (b.dataset.word || "").toLowerCase() === typed);

    if (match) {
      // Pop balloon
      match.classList.add("pop");
      const wordLen = (match.dataset.word || "").length;
      setTimeout(() => {
        if (match.parentNode) match.parentNode.removeChild(match);
      }, 200);

      // Score & combo
      combo++;
      const basePoints = 10 + Math.max(0, wordLen - 3) * 2;
      const multiplier = 1 + Math.floor(combo / 5) * 0.5;
      const gained = Math.round(basePoints * multiplier);
      score += gained;

      scoreEl().textContent = score;
      comboEl().textContent = combo;
      feedbackEl().textContent = `Nice! +${gained} points (combo x${multiplier.toFixed(1)})`;
      feedbackEl().className = "feedback good";
    } else {
      // Wrong word
      combo = 0;
      comboEl().textContent = combo;
      feedbackEl().textContent = "No balloon with that word. Try again.";
      feedbackEl().className = "feedback bad";
    }

    inputEl().value = "";
    return { score, combo, escaped };
  }

  return {
    MODES,
    openModeModal,
    closeModeModal,
    startGame,
    resetState,
    handleInputEnter,
    setDifficulty
  };
})();
