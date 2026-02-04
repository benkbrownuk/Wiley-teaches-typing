// app.js
// Main wiring for Wiley Teaches Typing

// Global state
const state = {
  studentName: "",
  grade: "",
  level: 1,
  sessions: 0,
  bestWpm: 0,
  bestAcc: 0,
  lastSection: "None",
  lastReport: "",
  difficulty: getDifficultyForGrade(3)
};

function loadState() {
  const saved = localStorage.getItem("wileyTypingState");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(state, parsed);
      state.difficulty = getDifficultyForGrade(state.grade || 3);
    } catch {}
  }
  updateGlobalUI();
}

function saveState() {
  localStorage.setItem("wileyTypingState", JSON.stringify(state));
}

function updateGlobalUI() {
  const userInfo = document.getElementById("userInfo");
  if (state.studentName && state.grade) {
    userInfo.innerHTML =
      state.studentName +
      ' <span class="badge">Grade ' +
      state.grade +
      "</span>";
  } else {
    userInfo.textContent = "Not signed in";
  }
  document.getElementById("statSessions").textContent = state.sessions;
  document.getElementById("statBestWpm").textContent = state.bestWpm;
  document.getElementById("statBestAcc").textContent = state.bestAcc;
  document.getElementById("statLastSection").textContent = state.lastSection;

  const levelBadge = document.getElementById("levelBadge");
  let label = "Level " + state.level;
  if (state.level < 3) label += " • Beginner";
  else if (state.level < 6) label += " • Growing";
  else label += " • Pro";
  levelBadge.textContent = label;

  // Difficulty line
  const diff = state.difficulty;
  document.getElementById("targetWpm").textContent = diff.wpm;
  document.getElementById("targetAcc").textContent = diff.accuracy;
  document.getElementById("learnTargetWpm").textContent = diff.wpm;
  document.getElementById("learnTargetAcc").textContent = diff.accuracy;
  document.getElementById("workTargetAcc").textContent = Math.max(90, diff.accuracy);
}

function updateProgress(sectionName, wpm, acc) {
  state.sessions += 1;
  state.lastSection = sectionName;
  if (wpm > state.bestWpm) state.bestWpm = Math.round(wpm);
  if (acc > state.bestAcc) state.bestAcc = Math.round(acc);
  if (wpm >= state.difficulty.wpm && acc >= state.difficulty.accuracy) state.level += 1;
  saveState();
  updateGlobalUI();
}

// LOGIN
const startBtn = document.getElementById("startBtn");
startBtn.addEventListener("click", () => {
  const name = document.getElementById("studentName").value.trim();
  const grade = document.getElementById("studentGrade").value;
  if (!name || !grade) {
    alert("Please enter your name and select your grade.");
    return;
  }
  state.studentName = name;
  state.grade = grade;
  state.difficulty = getDifficultyForGrade(grade);
  FrogGame.setDifficulty(state.difficulty);
  BalloonGame.setDifficulty(state.difficulty);
  saveState();
  updateGlobalUI();
  document.getElementById("loginCard").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");
  newLearnTarget();
  newWorkParagraph();
});

// TABS
const tabButtons = document.querySelectorAll(".tab-btn");
const tabs = {
  learnTab: document.getElementById("learnTab"),
  workTab: document.getElementById("workTab"),
  gamesTab: document.getElementById("gamesTab"),
  testTab: document.getElementById("testTab"),
  freeTab: document.getElementById("freeTab")
};

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-tab");
    Object.keys(tabs).forEach((id) => {
      tabs[id].classList.toggle("hidden", id !== target);
    });
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// LEARN SECTION
const learnSentences = [
  "asdf jkl; keep your fingers on home row",
  "The quick brown fox jumps over the lazy dog",
  "Practice makes progress, not perfection",
  "Type each word carefully and stay relaxed",
  "Little by little, your speed will grow"
];
const learnTargetEl = document.getElementById("learnTarget");
const learnInputEl = document.getElementById("learnInput");
const learnFeedbackEl = document.getElementById("learnFeedback");
const learnNewTargetBtn = document.getElementById("learnNewTargetBtn");
let learnStartTime = null;

function newLearnTarget() {
  const sentence =
    learnSentences[Math.floor(Math.random() * learnSentences.length)];
  learnTargetEl.textContent = sentence;
  learnInputEl.value = "";
  learnFeedbackEl.textContent = "Start typing and press Enter when done.";
  learnFeedbackEl.className = "feedback";
  learnStartTime = null;
}

learnNewTargetBtn.addEventListener("click", newLearnTarget);

learnInputEl.addEventListener("keydown", (e) => {
  if (!learnStartTime) learnStartTime = Date.now();
  if (e.key === "Enter") {
    e.preventDefault();
    const elapsed = (Date.now() - learnStartTime) / 1000;
    const stats = computeStats(
      learnTargetEl.textContent,
      learnInputEl.value,
      elapsed
    );
    learnFeedbackEl.textContent =
      "WPM: " +
      stats.wpm +
      " • Accuracy: " +
      stats.accuracy +
      "% • Errors: " +
      stats.errors;
    learnFeedbackEl.className =
      "feedback " + (stats.accuracy >= state.difficulty.accuracy ? "good" : "bad");

    state.lastReport =
      "Section: Learn\nSentence: " +
      learnTargetEl.textContent +
      "\nTyped: " +
      learnInputEl.value +
      "\nWPM: " +
      stats.wpm +
      "\nAccuracy: " +
      stats.accuracy +
      "%\nErrors: " +
      stats.errors;
    document.getElementById("reportArea").textContent = state.lastReport;
    updateProgress("Learn", stats.wpm, stats.accuracy);
  }
});

// WORK SECTION
const workParagraphs = [
  "Typing is a skill that grows with steady practice. Focus on each letter and keep a gentle rhythm.",
  "In this assignment, your goal is to copy the paragraph as accurately as you can. Take your time.",
  "Good posture, relaxed hands, and careful eyes will help you become a stronger typist every day."
];
const workTargetEl = document.getElementById("workTarget");
const workInputEl = document.getElementById("workInput");
const workFeedbackEl = document.getElementById("workFeedback");
const workNewParagraphBtn = document.getElementById("workNewParagraphBtn");
const workCheckBtn = document.getElementById("workCheckBtn");
let workStartTime = null;

function newWorkParagraph() {
  const paragraph =
    workParagraphs[Math.floor(Math.random() * workParagraphs.length)];
  workTargetEl.textContent = paragraph;
  workInputEl.value = "";
  workFeedbackEl.textContent = "Type the paragraph, then click Check work.";
  workFeedbackEl.className = "feedback";
  workStartTime = Date.now();
}

workNewParagraphBtn.addEventListener("click", newWorkParagraph);

workCheckBtn.addEventListener("click", () => {
  if (!workStartTime) workStartTime = Date.now();
  const elapsed = (Date.now() - workStartTime) / 1000;
  const stats = computeStats(
    workTargetEl.textContent,
    workInputEl.value,
    elapsed
  );
  workFeedbackEl.textContent =
    "WPM: " +
    stats.wpm +
    " • Accuracy: " +
    stats.accuracy +
    "% • Errors: " +
    stats.errors;
  workFeedbackEl.className =
    "feedback " + (stats.accuracy >= Math.max(90, state.difficulty.accuracy) ? "good" : "bad");

  state.lastReport =
    "Section: Work\nParagraph: " +
    workTargetEl.textContent +
    "\nTyped: " +
    workInputEl.value +
    "\nWPM: " +
    stats.wpm +
    "\nAccuracy: " +
    stats.accuracy +
    "%\nErrors: " +
    stats.errors;
  document.getElementById("reportArea").textContent = state.lastReport;
  updateProgress("Work", stats.wpm, stats.accuracy);
});

// GAMES SECTION – TOGGLE
const frogContainer = document.getElementById("frogGameContainer");
const balloonContainer = document.getElementById("balloonGameContainer");
const gameToggleButtons = document.querySelectorAll(".game-toggle");

gameToggleButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const game = btn.getAttribute("data-game");
    gameToggleButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    if (game === "frog") {
      frogContainer.classList.remove("hidden");
      balloonContainer.classList.add("hidden");
    } else {
      frogContainer.classList.add("hidden");
      balloonContainer.classList.remove("hidden");
    }
  });
});

// FROG GAME WIRING
const gameStartBtn = document.getElementById("gameStartBtn");
const gameInputEl = document.getElementById("gameInput");

gameStartBtn.addEventListener("click", () => {
  FrogGame.setDifficulty(state.difficulty);
  FrogGame.reset();
  FrogGame.startMovement();
});

gameInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const result = FrogGame.handleInputEnter();
    const attempts = result.attempts || 0;
    const acc = result.accuracy || 0;
    if (attempts > 0) {
      updateProgress("Games (Frog)", attempts * 2, acc);
      state.lastReport =
        "Section: Games (Frog Typing)\nEstimated attempts: " +
        attempts +
        "\nEstimated accuracy: " +
        acc +
        "%";
      document.getElementById("reportArea").textContent = state.lastReport;
    }
  }
});

// BALLOON GAME WIRING
const balloonStartBtn = document.getElementById("balloonStartBtn");
const balloonInputEl = document.getElementById("balloonInput");
const balloonModeModal = document.getElementById("balloonModeModal");

balloonStartBtn.addEventListener("click", () => {
  BalloonGame.setDifficulty(state.difficulty);
  BalloonGame.openModeModal();
});

balloonModeModal.addEventListener("click", (e) => {
  const mode = e.target.getAttribute("data-mode");
  if (!mode) return;
  if (mode === "cancel") {
    BalloonGame.closeModeModal();
    return;
  }
  BalloonGame.closeModeModal();
  BalloonGame.startGame(mode === "timed" ? BalloonGame.MODES.TIMED : BalloonGame.MODES.ESCAPE);
});

balloonInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const result = BalloonGame.handleInputEnter();
    const score = result.score || 0;
    const combo = result.combo || 0;
    const escaped = result.escaped || 0;
    const acc = score > 0 ? Math.min(100, 70 + combo * 2) : 0; // rough estimate
    updateProgress("Games (Balloon)", combo * 3, acc);
    state.lastReport =
      "Section: Games (Balloon Pop)\nScore: " +
      score +
      "\nCombo: " +
      combo +
      "\nEscaped: " +
      escaped +
      "\nEstimated accuracy: " +
      acc +
      "%";
    document.getElementById("reportArea").textContent = state.lastReport;
  }
});

// TEST SECTION
const testTargetEl = document.getElementById("testTarget");
const testInputEl = document.getElementById("testInput");
const testTimeEl = document.getElementById("testTime");
const testWpmEl = document.getElementById("testWpm");
const testAccEl = document.getElementById("testAcc");
const testFeedbackEl = document.getElementById("testFeedback");
const testStartBtn = document.getElementById("testStartBtn");
const testTexts = [
  "Typing tests help you measure your speed and accuracy. Stay calm and keep your eyes on the text.",
  "During this one minute test, try to type as much of the passage as you can without rushing.",
  "Accuracy is more important than speed at first. With practice, both will improve together."
];
let testTimer = null;
let testRemaining = 60;
let testStartTime = null;

function newTestText() {
  const text = testTexts[Math.floor(Math.random() * testTexts.length)];
  testTargetEl.textContent = text;
  testInputEl.value = "";
  testFeedbackEl.textContent =
    "When the test starts, type the text above until time runs out.";
  testFeedbackEl.className = "feedback";
}

function startTest() {
  newTestText();
  testRemaining = 60;
  testTimeEl.textContent = testRemaining;
  testWpmEl.textContent = "0";
  testAccEl.textContent = "0";
  testStartTime = Date.now();
  if (testTimer) clearInterval(testTimer);
  testTimer = setInterval(() => {
    testRemaining--;
    testTimeEl.textContent = testRemaining;
    if (testRemaining <= 0) {
      clearInterval(testTimer);
      testTimer = null;
      finishTest();
    }
  }, 1000);
}

function finishTest() {
  const elapsed = (Date.now() - testStartTime) / 1000;
  const stats = computeStats(
    testTargetEl.textContent,
    testInputEl.value,
    elapsed
  );
  testWpmEl.textContent = stats.wpm;
  testAccEl.textContent = stats.accuracy;
  testFeedbackEl.textContent =
    "Test finished. WPM: " +
    stats.wpm +
    " • Accuracy: " +
    stats.accuracy +
    "% • Errors: " +
    stats.errors;
  testFeedbackEl.className =
    "feedback " + (stats.accuracy >= state.difficulty.accuracy ? "good" : "bad");

  state.lastReport =
    "Section: Test\nText: " +
    testTargetEl.textContent +
    "\nTyped: " +
    testInputEl.value +
    "\nWPM: " +
    stats.wpm +
    "\nAccuracy: " +
    stats.accuracy +
    "%\nErrors: " +
    stats.errors;
  document.getElementById("reportArea").textContent = state.lastReport;
  updateProgress("Test", stats.wpm, stats.accuracy);
}

testStartBtn.addEventListener("click", startTest);

// FREE TYPING
const freeInputEl = document.getElementById("freeInput");
const freeTimeEl = document.getElementById("freeTime");
const freeWpmEl = document.getElementById("freeWpm");
const freeAccEl = document.getElementById("freeAcc");
const freeFeedbackEl = document.getElementById("freeFeedback");
const freeResetBtn = document.getElementById("freeResetBtn");
let freeStartTime = null;
let freeTimer = null;
let freeChars = 0;
let freeErrors = 0;

function resetFree() {
  freeInputEl.value = "";
  freeStartTime = null;
  freeChars = 0;
  freeErrors = 0;
  freeTimeEl.textContent = "0";
  freeWpmEl.textContent = "0";
  freeAccEl.textContent = "100";
  freeFeedbackEl.textContent = "Just type. Stats will update automatically.";
  freeFeedbackEl.className = "feedback";
  if (freeTimer) clearInterval(freeTimer);
  freeTimer = null;
}

freeResetBtn.addEventListener("click", resetFree);

freeInputEl.addEventListener("input", () => {
  if (!freeStartTime) {
    freeStartTime = Date.now();
    freeTimer = setInterval(() => {
      const elapsed = (Date.now() - freeStartTime) / 1000;
      freeTimeEl.textContent = Math.round(elapsed);
      const text = freeInputEl.value;
      const words = text.split(/\s+/).filter(Boolean).length;
      const minutes = elapsed / 60;
      const wpm = minutes > 0 ? words / minutes : 0;
      freeWpmEl.textContent = Math.round(wpm);
      const acc =
        freeChars === 0
          ? 100
          : Math.max(0, 100 * (1 - freeErrors / Math.max(freeChars, 1)));
      freeAccEl.textContent = Math.round(acc);
    }, 1000);
  }
  const text = freeInputEl.value;
  freeChars = text.length;
  freeErrors = Math.floor(freeChars * 0.05);
  freeFeedbackEl.textContent =
    "Keep going! This mode is for relaxed practice.";
});

// PDF REPORT
const pdfBtn = document.getElementById("pdfBtn");
pdfBtn.addEventListener("click", () => {
  if (!state.lastReport) {
    alert("No activity report available yet.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const title = "Wiley Teaches Typing - Session Report";
  doc.setFontSize(14);
  doc.text(title, 10, 15);
  doc.setFontSize(11);
  const meta =
    "Student: " +
    (state.studentName || "Unknown") +
    " | Grade: " +
    (state.grade || "N/A") +
    " | Level: " +
    state.level;
  doc.text(meta, 10, 23);
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(state.lastReport, 180);
  doc.text(lines, 10, 35);
  doc.save("wiley_teaches_typing_report.pdf");
});

// INITIAL LOAD
loadState();
if (state.studentName && state.grade) {
  document.getElementById("loginCard").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");
  newLearnTarget();
  newWorkParagraph();
} else {
  document.getElementById("reportArea").textContent =
    "No activity yet. Complete a Learn, Work, Game, Test, or Free Typing session to see a summary here.";
}
