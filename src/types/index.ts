// ============================================================================
// Core domain types — designed for multi-language, multi-level expansion.
// Today: pt-BR from nl. Tomorrow: any target language from any source
// language, 1000+ words, full grammar modules, A1-C2 levels, listening,
// speaking, AI conversation practice, sentence drills, exams.
// ============================================================================

/** ISO-ish language codes. Extend as new languages are added. */
export type LanguageCode = "nl" | "pt-BR";

/** CEFR levels — reserved for future content tagging (not yet used by data). */
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Difficulty = "makkelijk" | "gemiddeld" | "moeilijk";

/** A skill area — today only "vocabulaire" is implemented. */
export type SkillArea =
  | "vocabulaire"
  | "grammatica"
  | "luisteren"
  | "spreken"
  | "zinnen"
  | "gesprek";

export interface Category {
  id: string;
  /** Dutch display name */
  nameNl: string;
  /** Portuguese display name (for future target-language UI toggle) */
  namePt: string;
  icon: string; // emoji, swappable for real icon set later
  color: string; // tailwind gradient class token
  order: number;
}

/** A single vocabulary item. Deliberately language-pair agnostic in shape:
 *  `source` = word in the language the learner already knows,
 *  `target` = word in the language being learned.
 *  For now source is always Dutch and target always pt-BR, but the shape
 *  allows adding e.g. en->pt-BR or nl->es without redesign. */
export interface Word {
  id: string; // stable unique id, e.g. "w-0001"
  source: string; // Dutch word
  target: string; // Portuguese (Brazilian) word
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  categoryId: string;
  difficulty: Difficulty;
  level: CefrLevel; // reserved for future leveling; all v1 words are A1
  exampleSource: string; // Dutch example sentence
  exampleTarget: string; // Portuguese example sentence
  phonetic?: string; // simple phonetic hint (optional)
  tags?: string[]; // e.g. ["noun","masculine"] reserved for future grammar module
}

// ============================================================================
// Progress / SRS (spaced repetition)
// ============================================================================

export interface WordProgress {
  wordId: string;
  timesCorrect: number;
  timesWrong: number;
  /** Leitner-style box 1 (new/hard) .. 5 (mastered) */
  box: 1 | 2 | 3 | 4 | 5;
  lastReviewedAt: string | null; // ISO date
  nextDueAt: string | null; // ISO date — when this word should resurface
  learned: boolean; // true once box >= 4 and at least 1 correct rep
  favorite: boolean;

  /** Learning-pipeline gates: a brand-new word must be introduced (seen,
   *  heard, with an example sentence) before any exercise appears, and may
   *  only be TYPED once it has been answered correctly at least once in
   *  BOTH multiple-choice directions — never on first sight. */
  introduced: boolean;
  mcSourceToTargetCorrect: boolean; // NL -> PT multiple choice, ever correct
  mcTargetToSourceCorrect: boolean; // PT -> NL multiple choice, ever correct
}

export interface CategoryStats {
  categoryId: string;
  wordsLearned: number;
  wordsTotal: number;
  mistakes: number;
  bestScore: number; // best % across exercise attempts in this category
}

export interface DailyActivity {
  date: string; // yyyy-mm-dd
  wordsReviewed: number;
  correct: number;
  wrong: number;
}

export interface UserProgress {
  hearts: number;
  maxHearts: number;
  points: number;
  streak: number;
  lastActiveDate: string | null; // yyyy-mm-dd, for streak calc
  dailyGoal: number; // words/exercises per day
  wordsProgress: Record<string, WordProgress>;
  history: DailyActivity[];
}

// ============================================================================
// Exercises
// ============================================================================

export type ExerciseKind = "target-to-source" | "source-to-target" | "type-in" | "sentence-match";

export interface ExerciseResult {
  wordId: string;
  correct: boolean;
  kind: ExerciseKind;
}

// ============================================================================
// Module system — v1 only implements the "Basiswoorden" module, but the
// shape supports future modules (grammar, listening, speaking, exams, etc.)
// ============================================================================

export interface LearningModule {
  id: string;
  titleNl: string;
  skill: SkillArea;
  level: CefrLevel;
  /** implemented modules render real content; others show "binnenkort" */
  implemented: boolean;
}
