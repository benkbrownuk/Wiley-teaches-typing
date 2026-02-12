// matching-levels.js
// Level configuration for the Matching Game (Grades K–12)
// This file defines the structure of each level: rows, columns, and optional time limits.
// The Matching Game logic (matching-game.js) handles auto-leveling, performance jumps,
// persistence, and progression.

// ------------------------------------------------------
// GRADE LABELS (0 = Kindergarten)
// ------------------------------------------------------
const GRADES = [
  "Kindergarten", // index 0
  "Grade 1",      // index 1
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12"
];

// ------------------------------------------------------
// LEVEL GENERATOR
// Generates 30 levels per grade.
// Difficulty increases by:
// - More pairs
// - Larger grids
// - Stricter time limits (Grade 2+)
// ------------------------------------------------------
function generateLevelsForGrade(gradeIndex) {
  const levels = [];

  for (let level = 1; level <= 30; level++) {
    // Base pairs scale with grade
    const basePairs = 2 + gradeIndex; // K=2 pairs, Grade 12=14 pairs
    const extraPairs = Math.floor((level - 1) / 3); // every 3 levels adds a pair
    const totalPairs = basePairs + extraPairs;

    const cardCount = totalPairs * 2;

    // Compute rows/cols close to a square
    let rows = Math.floor(Math.sqrt(cardCount));
    while (cardCount % rows !== 0) {
      rows--;
    }
    const cols = cardCount / rows;

    // Time limit (Grade 2+)
    let timeLimit = null;
    if (gradeIndex >= 2) {
      const baseTime = 180 - gradeIndex * 5; // higher grades get less time
      const difficultyFactor = (level - 1) * 2;
      timeLimit = Math.max(40, baseTime - difficultyFactor);
    }

    levels.push({
      level,
      rows,
      cols,
      timeLimit
    });
  }

  return levels;
}

// ------------------------------------------------------
// BUILD LEVEL CONFIG FOR ALL GRADES
// LEVEL_CONFIG[gradeIndex][levelIndex]
// ------------------------------------------------------
const LEVEL_CONFIG = {};
for (let g = 0; g < GRADES.length; g++) {
  LEVEL_CONFIG[g] = generateLevelsForGrade(g);
}
