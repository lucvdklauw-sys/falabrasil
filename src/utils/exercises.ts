import type { ExerciseKind, Word } from "../types";
import { words as allWords } from "../data/words";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

// ============================================================================
// Free-choice practice mode engine — the learner picks HOW they want to
// practise a word set (theme or category); nothing is forced, and practice
// is unlimited (no hearts, no gating, no fixed session length).
// ============================================================================

export type PracticeMode = "pt-nl" | "nl-pt" | "context" | "mixed";

/** The 3 "words in sentences" kinds, and the 2 direct multiple-choice
 * kinds. Write mode is deliberately NOT part of this pool — it always
 * stays a fully separate flow (see WriteSession). */
export type PracticeKind = Extract<
  ExerciseKind,
  "source-to-target" | "target-to-source" | "sentence-match" | "cloze" | "word-in-context"
>;

export interface PracticeItem {
  word: Word;
  kind: PracticeKind;
}

const CONTEXT_KINDS: PracticeKind[] = ["sentence-match", "cloze", "word-in-context"];
const MIXED_KINDS: PracticeKind[] = ["source-to-target", "target-to-source", ...CONTEXT_KINDS];
const MAX_SAME_KIND_STREAK = 2;

function pickKind(pool: PracticeKind[]): PracticeKind {
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Caps how many times the same exercise kind can appear in a row (used by
 * "context" and "mixed" modes, where the kind varies per word) — keeps a
 * session from feeling repetitive even though the learner picked "mixed". */
function dedupeKindStreaks(items: PracticeItem[], pool: PracticeKind[]): PracticeItem[] {
  const result = [...items];
  for (let i = MAX_SAME_KIND_STREAK; i < result.length; i++) {
    const tail = result.slice(i - MAX_SAME_KIND_STREAK, i);
    const streaking = tail.every((t) => t.kind === tail[0].kind);
    if (streaking && result[i].kind === tail[0].kind) {
      const swapIdx = result.findIndex((it, idx) => idx > i && it.kind !== tail[0].kind);
      if (swapIdx !== -1) {
        [result[i], result[swapIdx]] = [result[swapIdx], result[i]];
      } else {
        // no alternative left later in the queue — just pick a different kind
        const alt = pool.find((k) => k !== tail[0].kind);
        if (alt) result[i] = { ...result[i], kind: alt };
      }
    }
  }
  return result;
}

/** Builds one practice session for a chosen mode over a given word set.
 * Every word in the set gets exactly one question — the learner can
 * always start a fresh session (unlimited repetition). */
export function buildPracticeItems(wordSet: Word[], mode: PracticeMode): PracticeItem[] {
  const shuffled = shuffle(wordSet);
  let items: PracticeItem[];

  if (mode === "pt-nl") {
    items = shuffled.map((word) => ({ word, kind: "target-to-source" as const }));
  } else if (mode === "nl-pt") {
    items = shuffled.map((word) => ({ word, kind: "source-to-target" as const }));
  } else if (mode === "context") {
    items = shuffled.map((word) => ({ word, kind: pickKind(CONTEXT_KINDS) }));
    items = dedupeKindStreaks(items, CONTEXT_KINDS);
  } else {
    items = shuffled.map((word) => ({ word, kind: pickKind(MIXED_KINDS) }));
    items = dedupeKindStreaks(items, MIXED_KINDS);
  }

  return items;
}
