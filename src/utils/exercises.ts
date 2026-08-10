import type { ExerciseKind, Word, WordProgress } from "../types";
import { words as allWords } from "../data/words";

/** A single step in a learning session. "intro" is a non-answerable
 * presentation step (word, audio, example sentence) — every other kind is
 * an answerable exercise. */
export type StepKind = "intro" | ExerciseKind;

export interface LearningStep {
  word: Word;
  kind: StepKind;
}

const REVIEW_KINDS: ExerciseKind[] = ["source-to-target", "target-to-source", "type-in"];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickReviewKind(): ExerciseKind {
  return REVIEW_KINDS[Math.floor(Math.random() * REVIEW_KINDS.length)];
}

/** Builds a learning session that respects the natural acquisition order:
 * a brand-new word is always Introduced -> seen in both multiple-choice
 * directions -> and only THEN may be typed. A word already fully "known"
 * (introduced + both MC directions ever correct) just gets a single review
 * step, rotated across the three exercise kinds as before.
 *
 * Each word contributes a small ordered "block" of steps; blocks are
 * shuffled relative to each other, but a block's own internal order is
 * never scrambled — that's what guarantees a learner never has to type a
 * word before they've proven, twice, that they recognise it. */
export function buildLearningSteps(
  queue: Word[],
  progressOf: (wordId: string) => WordProgress | undefined
): LearningStep[] {
  const blocks: LearningStep[][] = queue.map((word) => {
    const wp = progressOf(word.id);
    const introduced = wp?.introduced ?? false;
    const mcS2T = wp?.mcSourceToTargetCorrect ?? false;
    const mcT2S = wp?.mcTargetToSourceCorrect ?? false;

    if (!introduced) {
      return [
        { word, kind: "intro" as const },
        { word, kind: "source-to-target" as const },
        { word, kind: "target-to-source" as const },
        { word, kind: "type-in" as const },
      ];
    }
    if (!mcS2T || !mcT2S) {
      const steps: LearningStep[] = [];
      if (!mcS2T) steps.push({ word, kind: "source-to-target" });
      if (!mcT2S) steps.push({ word, kind: "target-to-source" });
      steps.push({ word, kind: "type-in" });
      return steps;
    }
    // fully "graduated" word: one ordinary spaced-repetition review step
    return [{ word, kind: pickReviewKind() }];
  });

  return shuffle(blocks).flat();
}

/** Builds 4 multiple-choice options (1 correct + 3 distractors). */
export function buildOptions(
  correctWord: Word,
  field: "source" | "target"
): string[] {
  const correctAnswer = correctWord[field];
  const sameCategory = allWords.filter(
    (w) => w.categoryId === correctWord.categoryId && w.id !== correctWord.id
  );
  const pool = sameCategory.length >= 3 ? sameCategory : allWords.filter((w) => w.id !== correctWord.id);
  const distractors = shuffle(pool)
    .slice(0, 6)
    .map((w) => w[field])
    .filter((v, idx, arr) => v !== correctAnswer && arr.indexOf(v) === idx)
    .slice(0, 3);
  return shuffle([correctAnswer, ...distractors]);
}
