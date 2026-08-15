import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import { useProgress } from "./hooks/useProgress";
import { categories } from "./data/categories";
import { modules } from "./data/modules";
import { stories } from "./data/stories";
import { dialogues } from "./data/dialogues";
import { words as allWords } from "./data/words";
import { levelFromXp } from "./utils/gamification";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { BackgroundDecor } from "./components/BackgroundDecor";
import { AppBanners } from "./components/AppBanners";
import { Mascot } from "./components/Mascot";
import { ModuleMap } from "./components/ModuleMap";
import { ThemeHub, type ThemeStep } from "./components/ThemeHub";
import { PracticeModePicker } from "./components/PracticeModePicker";

const Dictionary = lazy(() => import("./components/Dictionary").then((m) => ({ default: m.Dictionary })));
const Stats = lazy(() => import("./components/Stats").then((m) => ({ default: m.Stats })));
const MyWords = lazy(() => import("./components/MyWords").then((m) => ({ default: m.MyWords })));
const TypingTest = lazy(() => import("./components/TypingTest").then((m) => ({ default: m.TypingTest })));
const StoryView = lazy(() => import("./components/StoryView").then((m) => ({ default: m.StoryView })));
const DialogueView = lazy(() => import("./components/DialogueView").then((m) => ({ default: m.DialogueView })));
const ThemeQuiz = lazy(() => import("./components/ThemeQuiz").then((m) => ({ default: m.ThemeQuiz })));
const ModuleExam = lazy(() => import("./components/ModuleExam").then((m) => ({ default: m.ModuleExam })));

export type View =
  | "dashboard"
  | "dictionary"
  | "stats"
  | "mywords"
  | "practice"
  | "typetest"
  | "module"
  | "theme"
  | "story"
  | "dialogue"
  | "themequiz"
  | "moduleexam";

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
    toggleFavorite,
    categoryStats,
    totalLearned,
    totalDifficult,
    overallAccuracy,
    todayCount,
    totalWords,
    getThemeProgress,
    markThemeStep,
    recordModuleExam,
  } = useProgress();

  const [view, setView] = useState<View>("dashboard");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  // Non-null while the current /practice session was launched from the
  // Module 1 "Woorden oefenen" step — completing it marks that theme step
  // done and returns to the theme hub instead of the flat dashboard.
  const [themeExerciseId, setThemeExerciseId] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const module1 = modules[0];
  const activeModule = module1; // v1 only ships one module

  function startCategory(categoryId: string) {
    setThemeExerciseId(null);
    setActiveCategoryId(categoryId);
    setView("practice");
  }

  function startThemeWords(themeId: string) {
    setThemeExerciseId(themeId);
    setActiveCategoryId(themeId);
    setView("practice");
  }

  function exitPractice() {
    if (themeExerciseId) {
      setActiveCategoryId(themeExerciseId);
      setThemeExerciseId(null);
      setView("theme");
    } else {
      setActiveCategoryId(null);
      setView("dashboard");
    }
  }

  function navigate(v: View) {
    if (v !== "practice") setActiveCategoryId(null);
    setThemeExerciseId(null);
    setView(v);
  }

  function openModule() {
    setView("module");
  }

  function openTheme(themeId: string) {
    setActiveCategoryId(themeId);
    setView("theme");
  }

  function selectThemeStep(step: ThemeStep) {
    if (!activeCategoryId) return;
    if (step === "words") startThemeWords(activeCategoryId);
    else if (step === "story") setView("story");
    else if (step === "dialogue") setView("dialogue");
    else if (step === "quiz") setView("themequiz");
  }

  // Move focus to the main region on view change — helps screen-reader and
  // keyboard users land where the new content actually is.
  useEffect(() => {
    mainRef.current?.focus();
  }, [view]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? null;
  const activePracticeWords = activeCategoryId ? allWords.filter((w) => w.categoryId === activeCategoryId) : [];
  const level = levelFromXp(progress.points);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen">
        <a href="#main-content" className="skip-link">
          Ga naar hoofdinhoud
        </a>
        <BackgroundDecor />
        <AppBanners />
        <Navbar
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
              getThemeProgress={getThemeProgress}
              onOpenModule={openModule}
              level={level}
            />
          )}

          {view === "module" && activeModule && (
            <ModuleMap
              module={activeModule}
              getThemeProgress={getThemeProgress}
              examDone={progress.moduleProgress[activeModule.id]?.examDone ?? false}
              examScore={progress.moduleProgress[activeModule.id]?.examScore ?? 0}
              onSelectTheme={openTheme}
              onSelectExam={() => setView("moduleexam")}
              onBack={() => navigate("dashboard")}
            />
          )}

          {view === "theme" && activeCategory && (
            <ThemeHub
              category={activeCategory}
              themeProgress={getThemeProgress(activeCategory.id)}
              onSelectStep={selectThemeStep}
              onBack={() => setView("module")}
            />
          )}

          {view === "practice" && activeCategory && activePracticeWords.length > 0 && (
            <PracticeModePicker
              title={activeCategory.nameNl}
              wordSet={activePracticeWords}
              onExit={exitPractice}
              onAnswer={recordAnswer}
              onWriteAnswer={recordTypingAnswer}
              onSessionComplete={themeExerciseId ? () => markThemeStep(themeExerciseId, "wordsDone") : undefined}
            />
          )}

          <Suspense fallback={<ViewLoader />}>
            {view === "dictionary" && (
              <Dictionary getWordProgress={getWordProgress} toggleFavorite={toggleFavorite} />
            )}

            {view === "mywords" && (
              <MyWords getWordProgress={getWordProgress} toggleFavorite={toggleFavorite} />
            )}

            {view === "stats" && (
              <Stats
                progress={progress}
                totalLearned={totalLearned}
                totalDifficult={totalDifficult}
                totalWords={totalWords}
                overallAccuracy={overallAccuracy}
                categoryStats={categoryStats}
              />
            )}

            {view === "typetest" && <TypingTest onAnswer={recordTypingAnswer} />}

            {view === "story" && activeCategoryId && (() => {
              const story = stories.find((s) => s.themeId === activeCategoryId);
              if (!story) return null;
              return (
                <StoryView
                  story={story}
                  onExit={() => setView("theme")}
                  onComplete={() => markThemeStep(activeCategoryId, "storyDone")}
                />
              );
            })()}

            {view === "dialogue" && activeCategoryId && (() => {
              const dialogue = dialogues.find((d) => d.themeId === activeCategoryId);
              if (!dialogue) return null;
              return (
                <DialogueView
                  dialogue={dialogue}
                  onExit={() => setView("theme")}
                  onComplete={() => markThemeStep(activeCategoryId, "dialogueDone")}
                />
              );
            })()}

            {view === "themequiz" && activeCategory && (
              <ThemeQuiz
                category={activeCategory}
                words={allWords.filter((w) => w.categoryId === activeCategory.id)}
                onExit={() => setView("theme")}
                onFinish={(score) => {
                  markThemeStep(activeCategory.id, "quizDone", score);
                  setView("theme");
                }}
              />
            )}

            {view === "moduleexam" && activeModule && (
              <ModuleExam
                module={activeModule}
                onExit={() => setView("module")}
                onFinish={(score) => {
                  recordModuleExam(activeModule.id, score);
                  setView("module");
                }}
              />
            )}
          </Suspense>
        </main>
      </div>
    </MotionConfig>
  );
}
