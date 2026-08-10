import { useCallback, useEffect, useMemo, useState } from "react";
import type { CategoryStats, ExerciseKind, UserProgress, Word, WordProgress } from "../types";
import { words } from "../data/words";
import { categories } from "../data/categories";
import { defaultProgress, loadProgress, saveProgress, todayStr } from "../utils/storage";
import { applyReviewResult, createInitialWordProgress, markIntroduced, reviewPriority } from "../utils/srs";

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress() ?? defaultProgress());

  // Persist on every change
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Handle streak / daily reset of hearts on new day
  useEffect(() => {
    const today = todayStr();
    if (progress.lastActiveDate === today) return;
    setProgress((p) => {
      let streak = p.streak;
      if (p.lastActiveDate) {
        const last = new Date(p.lastActiveDate);
        const diffDays = Math.round(
          (new Date(today).getTime() - last.getTime()) / 86400000
        );
        if (diffDays === 1) streak = p.streak + 1;
        else if (diffDays > 1) streak = 0;
      }
      return {
        ...p,
        hearts: p.maxHearts,
        lastActiveDate: today,
        streak,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getWordProgress = useCallback(
    (wordId: string): WordProgress => progress.wordsProgress[wordId] ?? createInitialWordProgress(wordId),
    [progress.wordsProgress]
  );

  const recordAnswer = useCallback((wordId: string, correct: boolean, kind: ExerciseKind) => {
    setProgress((p) => {
      const current = p.wordsProgress[wordId] ?? createInitialWordProgress(wordId);
      const updated = applyReviewResult(current, correct, kind);
      const today = todayStr();
      const history = [...p.history];
      const idx = history.findIndex((h) => h.date === today);
      if (idx >= 0) {
        history[idx] = {
          ...history[idx],
          wordsReviewed: history[idx].wordsReviewed + 1,
          correct: history[idx].correct + (correct ? 1 : 0),
          wrong: history[idx].wrong + (correct ? 0 : 1),
        };
      } else {
        history.push({
          date: today,
          wordsReviewed: 1,
          correct: correct ? 1 : 0,
          wrong: correct ? 0 : 1,
        });
      }
      return {
        ...p,
        points: p.points + (correct ? 10 : 0),
        hearts: correct ? p.hearts : Math.max(0, p.hearts - 1),
        wordsProgress: { ...p.wordsProgress, [wordId]: updated },
        history: history.slice(-90), // keep last 90 days
      };
    });
  }, []);

  /** Marks a word as "introduced" — the learner has seen the NL/PT pair,
   * heard it, and read the example sentence. Never gates on correctness;
   * introduction has no right/wrong answer. */
  const markWordIntroduced = useCallback((wordId: string) => {
    setProgress((p) => {
      const current = p.wordsProgress[wordId] ?? createInitialWordProgress(wordId);
      if (current.introduced) return p; // already introduced, no-op
      return {
        ...p,
        wordsProgress: { ...p.wordsProgress, [wordId]: markIntroduced(current) },
      };
    });
  }, []);

  const toggleFavorite = useCallback((wordId: string) => {
    setProgress((p) => {
      const current = p.wordsProgress[wordId] ?? createInitialWordProgress(wordId);
      return {
        ...p,
        wordsProgress: {
          ...p.wordsProgress,
          [wordId]: { ...current, favorite: !current.favorite },
        },
      };
    });
  }, []);

  const restoreHearts = useCallback(() => {
    setProgress((p) => ({ ...p, hearts: p.maxHearts }));
  }, []);

  /** Builds a review queue for a category: due/new words prioritized,
   * mistakes resurface sooner (spaced repetition). */
  const getReviewQueue = useCallback(
    (categoryId: string, count = 10): Word[] => {
      const catWords = words.filter((w) => w.categoryId === categoryId);
      const withPriority = catWords.map((w) => ({
        word: w,
        priority: reviewPriority(progress.wordsProgress[w.id]),
      }));
      withPriority.sort((a, b) => a.priority - b.priority);
      return withPriority.slice(0, count).map((x) => x.word);
    },
    [progress.wordsProgress]
  );

  const categoryStats: Record<string, CategoryStats> = useMemo(() => {
    const stats: Record<string, CategoryStats> = {};
    for (const cat of categories) {
      const catWords = words.filter((w) => w.categoryId === cat.id);
      let learned = 0;
      let mistakes = 0;
      for (const w of catWords) {
        const wp = progress.wordsProgress[w.id];
        if (wp?.learned) learned++;
        if (wp) mistakes += wp.timesWrong;
      }
      stats[cat.id] = {
        categoryId: cat.id,
        wordsLearned: learned,
        wordsTotal: catWords.length,
        mistakes,
        bestScore: 0,
      };
    }
    return stats;
  }, [progress.wordsProgress]);

  const totalLearned = useMemo(
    () => Object.values(progress.wordsProgress).filter((w) => w.learned).length,
    [progress.wordsProgress]
  );

  const overallAccuracy = useMemo(() => {
    let correct = 0;
    let total = 0;
    for (const h of progress.history) {
      correct += h.correct;
      total += h.correct + h.wrong;
    }
    return total === 0 ? 0 : Math.round((correct / total) * 100);
  }, [progress.history]);

  const todayCount = useMemo(() => {
    const today = todayStr();
    return progress.history.find((h) => h.date === today)?.wordsReviewed ?? 0;
  }, [progress.history]);

  return {
    progress,
    getWordProgress,
    recordAnswer,
    markWordIntroduced,
    toggleFavorite,
    restoreHearts,
    getReviewQueue,
    categoryStats,
    totalLearned,
    overallAccuracy,
    todayCount,
    totalWords: words.length,
  };
}
