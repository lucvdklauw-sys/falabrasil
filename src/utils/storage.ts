import type { UserProgress } from "../types";

const STORAGE_KEY = "bp-nl:progress:v1";

export function loadProgress(): UserProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProgress;
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
  return {
    hearts: 5,
    maxHearts: 5,
    points: 0,
    streak: 0,
    lastActiveDate: null,
    dailyGoal: 20,
    wordsProgress: {},
    history: [],
  };
}
