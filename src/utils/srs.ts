import type { ExerciseKind, WordProgress } from "../types";

/** Simple Leitner-style spaced repetition.
 * Box 1 -> review same session again soon
 * Box 2 -> review after ~1 day
 * Box 3 -> review after ~3 days
 * Box 4 -> review after ~7 days
 * Box 5 -> mastered, review after ~21 days
 */
const BOX_INTERVAL_DAYS: Record<number, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
  5: 21,
};

export function createInitialWordProgress(wordId: string): WordProgress {
  return {
    wordId,
    timesCorrect: 0,
    timesWrong: 0,
    box: 1,
    lastReviewedAt: null,
    nextDueAt: null,
    learned: false,
    favorite: false,
    introduced: false,
    mcSourceToTargetCorrect: false,
    mcTargetToSourceCorrect: false,
  };
}

/** True once a word has been answered correctly at least once in BOTH
 * multiple-choice directions — the gate that unlocks the typing exercise.
 * A brand-new word must never be typed on first sight. */
export function canType(progress: WordProgress | undefined): boolean {
  return !!progress?.mcSourceToTargetCorrect && !!progress?.mcTargetToSourceCorrect;
}

export function applyReviewResult(
  progress: WordProgress,
  correct: boolean,
  kind: ExerciseKind
): WordProgress {
  const now = new Date();
  let box = progress.box;
  if (correct) {
    box = Math.min(5, box + 1) as WordProgress["box"];
  } else {
    box = 1; // wrong answers drop back to box 1 -> resurface soon
  }
  const intervalDays = BOX_INTERVAL_DAYS[box] ?? 0;
  const nextDue = new Date(now);
  nextDue.setDate(nextDue.getDate() + intervalDays);

  return {
    ...progress,
    timesCorrect: progress.timesCorrect + (correct ? 1 : 0),
    timesWrong: progress.timesWrong + (correct ? 0 : 1),
    box,
    lastReviewedAt: now.toISOString(),
    nextDueAt: nextDue.toISOString(),
    learned: box >= 4 && progress.timesCorrect + (correct ? 1 : 0) > 0,
    mcSourceToTargetCorrect:
      progress.mcSourceToTargetCorrect || (kind === "source-to-target" && correct),
    mcTargetToSourceCorrect:
      progress.mcTargetToSourceCorrect || (kind === "target-to-source" && correct),
  };
}

export function markIntroduced(progress: WordProgress): WordProgress {
  return { ...progress, introduced: true };
}

/** Words due for review get priority; unseen words next; mastered words last.
 * This is what gives the "foute woorden komen vaker terug" behaviour. */
export function reviewPriority(progress: WordProgress | undefined): number {
  if (!progress || progress.nextDueAt === null) return 0; // never studied: high priority
  const due = new Date(progress.nextDueAt).getTime();
  const now = Date.now();
  if (due <= now) return 1 - progress.box * 0.01; // due now: priority by box (lower box = higher prio)
  return 10 + progress.box; // not due yet: low priority
}
