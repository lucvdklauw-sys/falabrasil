import type { UserProgress } from "../types";

const STORAGE_KEY = "bp-nl:progress:v1";

/** Fills in fields that may be missing from progress saved by an older
 * version of the app (e.g. before Modules/Themes/Badges existed), so
 * returning learners never hit a crash from a stale localStorage shape. */
function normalize(p: Partial<UserProgress>): UserProgress {
  return {
    hearts: p.hearts ?? 5,
    maxHearts: p.maxHearts ?? 5,
    points: p.points ?? 0,
    streak: p.streak ?? 0,
    lastActiveDate: p.lastActiveDate ?? null,
    dailyGoal: p.dailyGoal ?? 20,
    wordsProgress: p.wordsProgress ?? {},
    history: p.history ?? [],
    themeProgress: p.themeProgress ?? {},
    moduleProgress: p.moduleProgress ?? {},
    earnedBadgeIds: p.earnedBadgeIds ?? [],
  };
}

export function loadProgress(): UserProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalize(JSON.parse(raw) as Partial<UserProgress>);
  } catch {
    return null;
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // storage full or unavailable — fail silently, app still works in-memory
  }
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultProgress(): UserProgress {
  return normalize({});
}
