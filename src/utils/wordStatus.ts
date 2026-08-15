import type { WordProgress, WordStatus } from "../types";

/** Classifies a word into one clear learning status, used everywhere
 * progress is shown (Mijn woorden, Mijn voortgang, badges) and to decide
 * how often a word should resurface via spaced repetition.
 *
 * Rules (checked in order):
 * - "moeilijk": wrong often enough, recently, to need extra attention —
 *   takes priority over box progress, so a word that was once mastered
 *   but is now being missed repeatedly still gets flagged as difficult.
 * - "beheerst": reached the top spaced-repetition box (5) — long
 *   intervals, reliably recalled.
 * - "bekend": solid recall (box >= 3, at least 3 correct reps).
 * - "leren": has been attempted at least once, but not yet solid.
 * - "nieuw": never attempted.
 */
export function wordStatus(wp: WordProgress | undefined): WordStatus {
  if (!wp) return "nieuw";
  const total = wp.timesCorrect + wp.timesWrong;
  if (total === 0) return "nieuw";

  const wrongRatio = wp.timesWrong / total;
  if (wp.timesWrong >= 3 && wrongRatio >= 0.4) return "moeilijk";
  if (wp.box >= 5) return "beheerst";
  if (wp.box >= 3 && wp.timesCorrect >= 3) return "bekend";
  return "leren";
}

export const WORD_STATUS_LABELS: Record<WordStatus, string> = {
  nieuw: "Nieuw",
  leren: "Aan het leren",
  bekend: "Bekend",
  beheerst: "Beheerst",
  moeilijk: "Moeilijk",
};

export const WORD_STATUS_COLORS: Record<WordStatus, string> = {
  nieuw: "bg-gray-100 text-gray-600",
  leren: "bg-blue-100 text-blue-800",
  bekend: "bg-emerald-100 text-emerald-800",
  beheerst: "bg-yellow-100 text-yellow-800",
  moeilijk: "bg-red-100 text-red-800",
};

/** "Known" for headline counters (📚 127/300 woorden bekend) means the
 * learner reliably recalls the word — bekend OR beheerst. A word that's
 * merely "leren" or flagged "moeilijk" doesn't count as known yet. */
export function isKnown(wp: WordProgress | undefined): boolean {
  const s = wordStatus(wp);
  return s === "bekend" || s === "beheerst";
}

export function isDifficult(wp: WordProgress | undefined): boolean {
  return wordStatus(wp) === "moeilijk";
}
