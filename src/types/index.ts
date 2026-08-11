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
  points: number; // also used as XP for the level system
  streak: number;
  lastActiveDate: string | null; // yyyy-mm-dd, for streak calc
  dailyGoal: number; // words/exercises per day
  wordsProgress: Record<string, WordProgress>;
  history: DailyActivity[];
  themeProgress: Record<string, ThemeProgress>;
  moduleProgress: Record<string, ModuleProgressEntry>;
  earnedBadgeIds: string[];
}

// ============================================================================
// Exercises
// ============================================================================

export type ExerciseKind =
  | "target-to-source"
  | "source-to-target"
  | "type-in"
  | "sentence-match"
  | "cloze"
  | "word-in-context";

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

// ============================================================================
// Course structure — Modules, each containing exactly 5 Themes. A Theme
// reuses an existing vocabulary Category as its word set, and additionally
// carries a Story, a Dialogue, and a Theme Quiz. After 5 themes, a Module
// Exam gates progress to the next module. This is deliberately layered on
// top of the existing Category/Word data — no vocabulary duplication.
// ============================================================================

export interface CourseModule {
  id: string;
  titleNl: string;
  order: number;
  /** exactly 5 category ids, in the order they unlock within this module */
  themeIds: string[];
}

// ----------------------------------------------------------------------------
// Reading content: Stories & Dialogues. Every Portuguese word is glossable
// (LingQ-style click-to-translate). Glosses are NOT stored per-sentence —
// they're resolved at render time from the 300-word dataset plus a shared
// glossary of common function words (see utils/glossary.ts), so authoring
// a story is just writing pt/nl sentence pairs.
// ----------------------------------------------------------------------------

export interface WordGloss {
  nl: string; // Dutch meaning of this exact token as used here
  note?: string; // optional short grammar note (verb tense, gender, etc.)
}

export interface ReadingSentence {
  pt: string;
  nl: string;
}

export interface ComprehensionQuestion {
  id: string;
  questionNl: string;
  options: string[];
  correctIndex: number;
}

export interface Story {
  id: string;
  themeId: string; // categoryId
  titleNl: string;
  titlePt: string;
  sentences: ReadingSentence[];
  questions: ComprehensionQuestion[];
}

export interface DialogueLine {
  speaker: "A" | "B";
  pt: string;
  nl: string;
}

export interface Dialogue {
  id: string;
  themeId: string;
  titleNl: string;
  scenario: string; // e.g. "Restaurant", "Aeroporto"
  speakerA: string; // Brazilian character name
  speakerB: string;
  lines: DialogueLine[];
  questions: ComprehensionQuestion[];
}

// ============================================================================
// Progress: themes, modules, badges. Layered alongside the existing
// per-word WordProgress / UserProgress — nothing here replaces those.
// ============================================================================

export interface ThemeProgress {
  themeId: string;
  wordsDone: boolean;
  storyDone: boolean;
  dialogueDone: boolean;
  quizDone: boolean;
  quizScore: number; // best %, 0-100
}

export interface ModuleProgressEntry {
  moduleId: string;
  examDone: boolean;
  examScore: number; // best %, 0-100
}

export interface Badge {
  id: string;
  titleNl: string;
  descriptionNl: string;
  icon: string;
}
