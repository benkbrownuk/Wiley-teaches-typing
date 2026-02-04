// frog.js
// Simple frog typing game logic

const FrogGame = (function () {
  let score = 0;
  let missed = 0;
  let currentWord = "ready?";
  let frogInterval = null;
  let frogPosition = 10;
  const frogMax = 260;

  let difficulty = getDifficultyForGrade(3); // default, updated by app.js

  const frogEl = () => document.getElementById("frog");
  const flyWordEl = () => document.getElementById("flyWord");
  const scoreEl = () => document.getElementById("gameScore");
  const missedEl = () => document.getElementById("gameMissed");
  const feedbackEl = () => document.getElementById("gameFeedback");
  const inputEl = () => document.getElementById("gameInput");

  function setDifficulty(diff) {
    difficulty = diff;
  }

  function reset() {
    score = 0;
    missed = 0;
    frogPosition = 10;
    scoreEl().textContent = score;
    missedEl().textContent = missed;
    inputEl().value = "";
    feedbackEl().textContent = "Type the word and press Enter.";
    feedbackEl().className = "feedback";
    if (frogEl()) frogEl().style.left = frogPosition + "px";
    newWord();
  }

  function newWord() {
    currentWord = getRandomWordByLevel(difficulty.wordLevel);
    if (flyWordEl()) flyWordEl().textContent = currentWord;
  }

  function startMovement() {
    if (frogInterval) clearInterval(frogInterval);
    const step = 6 * difficulty.speed;
    frogInterval = setInterval(() => {
      frogPosition += step;
      if (!frogEl()) return;
      if (frogPosition >= frogMax) {
        frogPosition = 10;
        frogEl().style.left = frogPosition + "px";
        missed++;
        missedEl().textContent = missed;
        feedbackEl().textContent = "The frog missed the snack!";
        feedbackEl().className = "feedback bad";
        newWord();
      } else {
        frogEl().style.left = frogPosition + "px";
      }
    }, 200);
  }

  function handleInputEnter() {
    const typed = inputEl().value.trim();
    if (!typed) return { attempts: 0, accuracy: 0 };
    if (typed === currentWord) {
      score += 10;
      scoreEl().textContent = score;
      feedbackEl().textContent = "Yum! The frog ate the word.";
      feedbackEl().className = "feedback good";
      frogPosition = 10;
      if (frogEl()) frogEl().style.left = frogPosition + "px";
      newWord();
    } else {
      missed++;
      missedEl().textContent = missed;
      feedbackEl().textContent = "Oops, wrong word. The frog skipped it.";
      feedbackEl().className = "feedback bad";
    }
    inputEl().value = "";
    const attempts = score / 10 + missed;
    const acc = attempts ? (score / 10 / attempts) * 100 : 0;
    return { attempts, accuracy: Math.round(acc) };
  }

  function stop() {
    if (frogInterval) clearInterval(frogInterval);
    frogInterval = null;
  }

  return {
    setDifficulty,
    reset,
    startMovement,
    handleInputEnter,
    stop
  };
})();
