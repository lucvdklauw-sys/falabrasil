import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CategoryStats, ExerciseKind, ThemeProgress, UserProgress, Word, WordProgress } from "../types";
import { words } from "../data/words";
import { categories } from "../data/categories";
import { defaultProgress, loadProgress, saveProgress, todayStr } from "../utils/storage";
import { applyReviewResult, createInitialWordProgress, markIntroduced, reviewPriority } from "../utils/srs";
import { computeEarnedBadgeIds } from "../utils/gamification";
import { isDifficult, isKnown, wordStatus } from "../utils/wordStatus";

function emptyThemeProgress(themeId: string): ThemeProgress {
  return { themeId, wordsDone: false, storyDone: false, dialogueDone: false, quizDone: false, quizScore: 0 };
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress() ?? defaultProgress());

  // Persist on every change. This is the primary save path.
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Belt-and-suspenders: some mobile browsers (notably iOS Safari/PWA)
  // don't reliably run the effect above before a tab is backgrounded or
  // closed. Keep a ref with the latest progress and force a synchronous
  // flush on the events that actually fire in those situations, so a
  // refresh / app-switch / close never loses the most recent answer.
  const progressRef = useRef(progress);
  progressRef.current = progress;
  useEffect(() => {
    const flush = () => saveProgress(progressRef.current);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Handle streak reset on new day (no more hearts to refill — practice is unlimited).
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
        wordsProgress: { ...p.wordsProgress, [wordId]: updated },
        history: history.slice(-90), // keep last 90 days
      };
    });
  }, []);

  /** Records an answer from the standalone Schrijftest / write-practice
   * mode. Updates word progress and daily history exactly like a normal
   * answer. Practice is unlimited — there is no hearts/life system. */
  const recordTypingAnswer = useCallback((wordId: string, correct: boolean, direction: "nl-pt" | "pt-nl" = "nl-pt") => {
    setProgress((p) => {
      const current = p.wordsProgress[wordId] ?? createInitialWordProgress(wordId);
      const kind: ExerciseKind = direction === "nl-pt" ? "type-in" : "target-to-source";
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
        wordsProgress: { ...p.wordsProgress, [wordId]: updated },
        history: history.slice(-90),
      };
    });
  }, []);

  /** Marks a word as "introduced" — kept for backward-compatible word
   * progress shape; no longer gates anything in the free-choice practice
   * flow, but still useful metadata (has the learner ever seen this word). */
  const markWordIntroduced = useCallback((wordId: string) => {
    setProgress((p) => {
      const current = p.wordsProgress[wordId] ?? createInitialWordProgress(wordId);
      if (current.introduced) return p;
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

  /** Builds a review queue for a category: due/new words prioritized,
   * mistakes resurface sooner (spaced repetition). count defaults to the
   * full category — practice sessions are no longer capped. */
  const getReviewQueue = useCallback(
    (categoryId: string, count?: number): Word[] => {
      const catWords = words.filter((w) => w.categoryId === categoryId);
      const withPriority = catWords.map((w) => ({
        word: w,
        priority: reviewPriority(progress.wordsProgress[w.id]),
      }));
      withPriority.sort((a, b) => a.priority - b.priority);
      const limited = count ? withPriority.slice(0, count) : withPriority;
      return limited.map((x) => x.word);
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
        if (isKnown(wp)) learned++;
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

  // "Known" now means a solid learning status (bekend/beheerst), computed
  // consistently everywhere via wordStatus() — not just "answered once".
  const totalLearned = useMemo(
    () => words.filter((w) => isKnown(progress.wordsProgress[w.id])).length,
    [progress.wordsProgress]
  );

  const totalDifficult = useMemo(
    () => words.filter((w) => isDifficult(progress.wordsProgress[w.id])).length,
    [progress.wordsProgress]
  );

  const wordStatusOf = useCallback(
    (wordId: string) => wordStatus(progress.wordsProgress[wordId]),
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

  // ==========================================================================
  // Theme / Module progression (Module 1 course structure)
  // ==========================================================================

  const getThemeProgress = useCallback(
    (themeId: string): ThemeProgress => progress.themeProgress[themeId] ?? emptyThemeProgress(themeId),
    [progress.themeProgress]
  );

  const markThemeStep = useCallback(
    (themeId: string, step: "wordsDone" | "storyDone" | "dialogueDone" | "quizDone", score?: number) => {
      setProgress((p) => {
        const current = p.themeProgress[themeId] ?? emptyThemeProgress(themeId);
        const updated: ThemeProgress = {
          ...current,
          [step]: true,
          quizScore: step === "quizDone" && score !== undefined ? Math.max(current.quizScore, score) : current.quizScore,
        };
        return { ...p, themeProgress: { ...p.themeProgress, [themeId]: updated } };
      });
    },
    []
  );

  const recordModuleExam = useCallback((moduleId: string, score: number) => {
    setProgress((p) => {
      const current = p.moduleProgress[moduleId];
      const passed = score >= 80;
      return {
        ...p,
        moduleProgress: {
          ...p.moduleProgress,
          [moduleId]: {
            moduleId,
            examDone: (current?.examDone ?? false) || passed,
            examScore: Math.max(current?.examScore ?? 0, score),
          },
        },
      };
    });
  }, []);

  const earnedBadgeIds = useMemo(
    () => computeEarnedBadgeIds(progress, totalLearned, words.length),
    [progress, totalLearned]
  );

  useEffect(() => {
    const newOnes = earnedBadgeIds.filter((id) => !progress.earnedBadgeIds.includes(id));
    if (newOnes.length === 0) return;
    setProgress((p) => ({ ...p, earnedBadgeIds: [...new Set([...p.earnedBadgeIds, ...newOnes])] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earnedBadgeIds]);

  return {
    progress,
    getWordProgress,
    recordAnswer,
    recordTypingAnswer,
    markWordIntroduced,
    toggleFavorite,
    getReviewQueue,
    categoryStats,
    totalLearned,
    totalDifficult,
    wordStatusOf,
    overallAccuracy,
    todayCount,
    totalWords: words.length,
    getThemeProgress,
    markThemeStep,
    recordModuleExam,
  };
}
