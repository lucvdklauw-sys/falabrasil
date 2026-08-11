import type { UserProgress } from "../types";

/** XP == points (reused, see UserProgress doc comment). Level grows
 * gradually: 200 XP per level, i.e. roughly 20 correct answers. */
export function levelFromXp(xp: number): number {
  return 1 + Math.floor(xp / 200);
}

export function xpIntoLevel(xp: number): { current: number; needed: number } {
  const needed = 200;
  const current = xp % needed;
  return { current, needed };
}

/** Recomputes which badges the learner has earned based on current
 * progress. Pure function — the caller decides whether/how to persist any
 * newly-earned ids into `earnedBadgeIds`. */
export function computeEarnedBadgeIds(progress: UserProgress, totalLearned: number, totalWords: number): string[] {
  const earned = new Set<string>();

  if (totalLearned >= 1) earned.add("eerste-stap");
  if (progress.streak >= 7) earned.add("week-streak");
  if (totalLearned >= totalWords && totalWords > 0) earned.add("driehonderd");

  const themeEntries = Object.values(progress.themeProgress);
  if (themeEntries.some((t) => t.wordsDone && t.storyDone && t.dialogueDone && t.quizDone)) {
    earned.add("eerste-thema");
  }
  const storiesRead = themeEntries.filter((t) => t.storyDone).length;
  if (storiesRead >= 3) earned.add("verhalenlezer");

  const module1 = progress.moduleProgress["module-1"];
  if (module1?.examDone && module1.examScore >= 80) earned.add("module-1");

  return [...earned];
}
