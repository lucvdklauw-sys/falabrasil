import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import { useProgress } from "./hooks/useProgress";
import { categories } from "./data/categories";
import type { Word } from "./types";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { BackgroundDecor } from "./components/BackgroundDecor";
import { AppBanners } from "./components/AppBanners";
import { Mascot } from "./components/Mascot";

const Dictionary = lazy(() => import("./components/Dictionary").then((m) => ({ default: m.Dictionary })));
const Stats = lazy(() => import("./components/Stats").then((m) => ({ default: m.Stats })));
const ExerciseView = lazy(() => import("./components/ExerciseView").then((m) => ({ default: m.ExerciseView })));
const TypingTest = lazy(() => import("./components/TypingTest").then((m) => ({ default: m.TypingTest })));

export type View = "dashboard" | "dictionary" | "stats" | "exercise" | "typetest";

function ViewLoader() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3" role="status" aria-label="Laden">
      <Mascot mood="neutral" size={64} />
      <p className="text-sm font-semibold text-blue-900/40">Laden…</p>
    </div>
  );
}

export default function App() {
  const {
    progress,
    getWordProgress,
    recordAnswer,
    recordTypingAnswer,
    markWordIntroduced,
    toggleFavorite,
    getReviewQueue,
    categoryStats,
    totalLearned,
    overallAccuracy,
    todayCount,
    totalWords,
  } = useProgress();

  const [view, setView] = useState<View>("dashboard");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  // Frozen for the lifetime of one exercise session — see ExerciseView for why.
  const [sessionQueue, setSessionQueue] = useState<Word[]>([]);
  const [sessionId, setSessionId] = useState(0);
  const mainRef = useRef<HTMLElement>(null);

  function startCategory(categoryId: string) {
    setActiveCategoryId(categoryId);
    setSessionQueue(getReviewQueue(categoryId, 12));
    setSessionId((s) => s + 1);
    setView("exercise");
  }

  function restartWithMistakes(words: Word[]) {
    setSessionQueue(words);
    setSessionId((s) => s + 1);
  }

  function exitExercise() {
    setActiveCategoryId(null);
    setView("dashboard");
  }

  function navigate(v: View) {
    if (v !== "exercise") setActiveCategoryId(null);
    setView(v);
  }

  // Move focus to the main region on view change — helps screen-reader and
  // keyboard users land where the new content actually is.
  useEffect(() => {
    mainRef.current?.focus();
  }, [view]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? null;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen">
        <a href="#main-content" className="skip-link">
          Ga naar hoofdinhoud
        </a>
        <BackgroundDecor />
        <AppBanners />
        <Navbar
          hearts={progress.hearts}
          maxHearts={progress.maxHearts}
          points={progress.points}
          streak={progress.streak}
          learned={totalLearned}
          total={totalWords}
          view={view}
          onNavigate={navigate}
        />

        <main id="main-content" ref={mainRef} tabIndex={-1} className="outline-none">
          {view === "dashboard" && (
            <Dashboard
              totalLearned={totalLearned}
              totalWords={totalWords}
              categoryStats={categoryStats}
              todayCount={todayCount}
              dailyGoal={progress.dailyGoal}
              onSelectCategory={startCategory}
            />
          )}

          <Suspense fallback={<ViewLoader />}>
            {view === "dictionary" && (
              <Dictionary getWordProgress={getWordProgress} toggleFavorite={toggleFavorite} />
            )}

            {view === "stats" && (
              <Stats
                progress={progress}
                totalLearned={totalLearned}
                totalWords={totalWords}
                overallAccuracy={overallAccuracy}
              />
            )}

            {view === "exercise" && activeCategory && (
              <ExerciseView
                key={sessionId}
                category={activeCategory}
                queue={sessionQueue}
                hearts={progress.hearts}
                getWordProgress={getWordProgress}
                onAnswer={recordAnswer}
                onIntroduced={markWordIntroduced}
                onExit={exitExercise}
                onRestartMistakes={restartWithMistakes}
              />
            )}

            {view === "typetest" && <TypingTest onAnswer={recordTypingAnswer} />}
          </Suspense>
        </main>
      </div>
    </MotionConfig>
  );
}
