import type { ExerciseKind, Word, WordProgress } from "../types";
import { words as allWords } from "../data/words";

/** A single step in a learning session. "intro" is a non-answerable
 * presentation step (word, audio, example sentence) — every other kind is
 * an answerable exercise. Typing is deliberately NOT part of this pipeline
 * — it lives in the separate, optional "Schrijftest" mode that covers all
 * 300 words on demand instead of being forced into every session. */
export type StepKind = "intro" | ExerciseKind;

export interface LearningStep {
  word: Word;
  kind: StepKind;
}

// The pool of exercise kinds used once a word is "graduated" (introduced +
// both MC directions ever correct). Mixed randomly so no session feels the
// same: listening/word-choice both directions, sentence-context matching,
// cloze (fill in the missing word), and word-in-context recognition.
const REVIEW_KINDS: ExerciseKind[] = [
  "source-to-target",
  "target-to-source",
  "sentence-match",
  "cloze",
  "word-in-context",
];

// Minimum number of OTHER steps that must appear before the same word can
// resurface. This is what stops a session from feeling like "1x luisteren,
// 1x kiezen, dan andersom" in a predictable row — words get mixed together.
const MIN_REPEAT_GAP = 2;

// Never let the same exercise KIND appear more than 2x in a row, even
// across different words — "nooit meer dan twee keer dezelfde oefenvorm
// achter elkaar".
const MAX_SAME_KIND_STREAK = 2;

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

/** Interleaves several per-word step queues into a single session. Each
 * word's own steps keep their required internal order (e.g. "intro" always
 * comes first for that word), but different words are woven together with
 * a cooldown so the same word's steps never land back-to-back. On top of
 * that, a second pass avoids the same exercise KIND repeating more than
 * MAX_SAME_KIND_STREAK times in a row, regardless of which word it's for —
 * this is the "husselen" pass: instead of doing all of one word's steps
 * consecutively then moving to the next, the whole session is shuffled
 * step-by-step, and exercise *forms* are mixed too. */
function interleaveQueues(queues: LearningStep[][]): LearningStep[] {
  const active = queues.map((q) => [...q]).filter((q) => q.length > 0);
  const result: LearningStep[] = [];
  const lastPositionByQueue = new Map<number, number>();

  while (active.some((q) => q.length > 0)) {
    const withSteps = active.map((q, i) => ({ i, q })).filter(({ q }) => q.length > 0);
    const eligibleByWord = withSteps.filter(({ i }) => {
      const last = lastPositionByQueue.get(i);
      return last === undefined || result.length - last > MIN_REPEAT_GAP;
    });
    let pool = eligibleByWord.length > 0 ? eligibleByWord : withSteps;

    // Avoid the same exercise kind running MAX_SAME_KIND_STREAK times in a
    // row: if the tail of `result` is already at the streak cap, filter out
    // candidates whose next step shares that kind (unless nothing else
    // is available, in which case we have no choice).
    const tailLen = Math.min(result.length, MAX_SAME_KIND_STREAK);
    const tail = result.slice(-tailLen);
    const streaking = tailLen === MAX_SAME_KIND_STREAK && tail.every((s) => s.kind === tail[0].kind);
    if (streaking) {
      const bannedKind = tail[0].kind;
      const filtered = pool.filter(({ q }) => q[0].kind !== bannedKind);
      if (filtered.length > 0) pool = filtered;
    }

    const pick = pool[Math.floor(Math.random() * pool.length)];
    const step = pick.q.shift()!;
    result.push(step);
    lastPositionByQueue.set(pick.i, result.length - 1);
  }
  return result;
}

/** Builds a learning session that respects the natural acquisition order:
 * a brand-new word is always Introduced -> seen in both multiple-choice
 * directions -> and immediately also checked in context via a short,
 * easy example sentence ("zinnen waarvan de bijpassende vertaling gevonden
 * moet worden"). A word already fully "known" (introduced + both MC
 * directions ever correct) gets a single review step, randomly rotated
 * across all 5 review exercise kinds.
 *
 * Steps from different words are interleaved rather than grouped into
 * fixed per-word blocks, and the interleaver also caps how many times the
 * same exercise kind can appear consecutively — see interleaveQueues(). */
export function buildLearningSteps(
  queue: Word[],
  progressOf: (wordId: string) => WordProgress | undefined
): LearningStep[] {
  const perWordQueues: LearningStep[][] = queue.map((word) => {
    const wp = progressOf(word.id);
    const introduced = wp?.introduced ?? false;
    const mcS2T = wp?.mcSourceToTargetCorrect ?? false;
    const mcT2S = wp?.mcTargetToSourceCorrect ?? false;

    if (!introduced) {
      return [
        { word, kind: "intro" as const },
        { word, kind: "source-to-target" as const },
        { word, kind: "target-to-source" as const },
        { word, kind: "sentence-match" as const },
      ];
    }
    if (!mcS2T || !mcT2S) {
      const steps: LearningStep[] = [];
      if (!mcS2T) steps.push({ word, kind: "source-to-target" });
      if (!mcT2S) steps.push({ word, kind: "target-to-source" });
      return steps;
    }
    // fully "graduated" word: one ordinary spaced-repetition review step
    return [{ word, kind: pickReviewKind() }];
  });

  return interleaveQueues(perWordQueues);
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

/** Builds 4 sentence options (1 correct Dutch translation + 3 distractors)
 * for the "find the matching translation" context exercise. Distractors
 * are pulled preferentially from other easy ("makkelijk") sentences, so
 * beginners see short, simple context sentences before anything harder. */
export function buildSentenceOptions(correctWord: Word): string[] {
  const correctAnswer = correctWord.exampleSource;
  const easyPool = allWords.filter((w) => w.difficulty === "makkelijk" && w.id !== correctWord.id);
  const pool = easyPool.length >= 3 ? easyPool : allWords.filter((w) => w.id !== correctWord.id);
  const distractors = shuffle(pool)
    .map((w) => w.exampleSource)
    .filter((v, idx, arr) => v !== correctAnswer && arr.indexOf(v) === idx)
    .slice(0, 3);
  return shuffle([correctAnswer, ...distractors]);
}

function tokenizeWords(text: string): string[] {
  return text.match(/[\p{L}]+/gu) ?? [];
}

/** Builds a cloze ("missing word") exercise: the target word is blanked
 * out of its own Portuguese example sentence, and the learner picks the
 * right word from 4 options — practising the word inside real context
 * rather than in isolation. */
export function buildClozeSentence(word: Word): { blanked: string; options: string[] } {
  const sentence = word.exampleTarget;
  const escaped = word.target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\b${escaped}\\b`, "i");
  const blanked = re.test(sentence) ? sentence.replace(re, "____") : `${sentence} (____)`;

  const sameCategory = allWords.filter(
    (w) => w.categoryId === word.categoryId && w.id !== word.id
  );
  const pool = sameCategory.length >= 3 ? sameCategory : allWords.filter((w) => w.id !== word.id);
  const distractors = shuffle(pool)
    .map((w) => w.target)
    .filter((v, idx, arr) => v.toLowerCase() !== word.target.toLowerCase() && arr.indexOf(v) === idx)
    .slice(0, 3);
  return { blanked, options: shuffle([word.target, ...distractors]) };
}

/** Builds options for "word-in-context": given the Dutch meaning and the
 * full Portuguese sentence, the learner picks which Portuguese word in
 * that sentence carries that meaning. Distractors are preferentially
 * other real words that appear in the same sentence. */
export function buildWordInContextOptions(word: Word): string[] {
  const sentence = word.exampleTarget;
  const tokens = tokenizeWords(sentence).filter(
    (t) => t.toLowerCase() !== word.target.toLowerCase() && t.length > 2
  );
  const uniqueTokens = [...new Set(tokens)];
  let distractors = shuffle(uniqueTokens).slice(0, 3);
  if (distractors.length < 3) {
    const pool = allWords.filter((w) => w.id !== word.id).map((w) => w.target);
    const extra = shuffle(pool)
      .filter((v) => !distractors.includes(v) && v.toLowerCase() !== word.target.toLowerCase())
      .slice(0, 3 - distractors.length);
    distractors = [...distractors, ...extra];
  }
  return shuffle([word.target, ...distractors]);
}
