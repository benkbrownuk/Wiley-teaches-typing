// shared.js
// Shared utilities, difficulty engine, and word lists for Wiley Teaches Typing

// Grade-based difficulty configuration
const difficultyByGrade = {
  1: { wpm: 5, accuracy: 80, speed: 0.7, spawnRate: 2600, wordLevel: 1 },
  2: { wpm: 8, accuracy: 80, speed: 0.8, spawnRate: 2400, wordLevel: 1 },
  3: { wpm: 12, accuracy: 85, speed: 0.9, spawnRate: 2200, wordLevel: 2 },
  4: { wpm: 15, accuracy: 85, speed: 1.0, spawnRate: 2000, wordLevel: 2 },
  5: { wpm: 18, accuracy: 85, speed: 1.1, spawnRate: 1800, wordLevel: 2 },
  6: { wpm: 22, accuracy: 90, speed: 1.2, spawnRate: 1600, wordLevel: 3 },
  7: { wpm: 26, accuracy: 90, speed: 1.3, spawnRate: 1500, wordLevel: 3 },
  8: { wpm: 30, accuracy: 90, speed: 1.4, spawnRate: 1400, wordLevel: 3 },
  9: { wpm: 35, accuracy: 95, speed: 1.5, spawnRate: 1300, wordLevel: 4 },
  10: { wpm: 40, accuracy: 95, speed: 1.6, spawnRate: 1200, wordLevel: 4 },
  11: { wpm: 45, accuracy: 95, speed: 1.7, spawnRate: 1100, wordLevel: 4 },
  12: { wpm: 50, accuracy: 95, speed: 1.8, spawnRate: 1000, wordLevel: 4 }
};

// Word lists by difficulty level
const wordLists = {
  1: ["cat", "dog", "sun", "hop", "run", "bug", "hat", "red", "blue", "frog"],
  2: ["about", "after", "again", "because", "could", "every", "little", "people", "school", "water"],
  3: ["practice", "keyboard", "typing", "lesson", "student", "teacher", "progress", "accuracy", "speed", "focus"],
  4: ["development", "education", "literacy", "proficiency", "motivation", "discipline", "consistency", "improvement", "challenge", "achievement"]
};

// Utility: get difficulty for a grade
function getDifficultyForGrade(grade) {
  const g = parseInt(grade, 10);
  if (!g || g < 1 || g > 12) return difficultyByGrade[3]; // default
  return difficultyByGrade[g];
}

// Utility: pick a random word based on difficulty level
function getRandomWordByLevel(level) {
  const lvl = Math.min(Math.max(level, 1), 4);
  const list = wordLists[lvl] || wordLists[1];
  return list[Math.floor(Math.random() * list.length)];
}

// Utility: compute typing stats
function computeStats(target, typed, elapsedSeconds) {
  const targetText = target.trim();
  const typedText = typed.trim();
  const targetChars = targetText.length;
  const typedChars = typedText.length;

  let correctChars = 0;
  const len = Math.min(targetChars, typedChars);
  for (let i = 0; i < len; i++) {
    if (targetText[i] === typedText[i]) correctChars++;
  }
  const extraErrors = Math.max(0, typedChars - targetChars);
  const totalErrors = (len - correctChars) + extraErrors;

  const accuracy =
    typedChars === 0 ? 0 : Math.max(0, 100 * (1 - totalErrors / Math.max(typedChars, 1)));

  const minutes = elapsedSeconds / 60;
  const wordsTyped = typedText.split(/\s+/).filter(Boolean).length;
  const wpm = minutes > 0 ? wordsTyped / minutes : 0;

  return {
    accuracy: Math.round(accuracy),
    wpm: Math.round(wpm),
    errors: totalErrors
  };
}
