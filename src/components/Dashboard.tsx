import { motion } from "framer-motion";
import { categories } from "../data/categories";
import { modules } from "../data/modules";
import type { CategoryStats, ThemeProgress } from "../types";
import { CategoryTile } from "./CategoryTile";
import { ProgressBar } from "./ProgressBar";
import { Mascot } from "./Mascot";
import { dailyTip } from "../utils/tips";

function isThemeComplete(tp: ThemeProgress | undefined): boolean {
  return !!tp && tp.wordsDone && tp.storyDone && tp.dialogueDone && tp.quizDone;
}

export function Dashboard({
  totalLearned,
  totalWords,
  categoryStats,
  todayCount,
  dailyGoal,
  onSelectCategory,
  getThemeProgress,
  onOpenModule,
  level,
}: {
  totalLearned: number;
  totalWords: number;
  categoryStats: Record<string, CategoryStats>;
  todayCount: number;
  dailyGoal: number;
  onSelectCategory: (categoryId: string) => void;
  getThemeProgress: (themeId: string) => ThemeProgress;
  onOpenModule: (moduleId: string) => void;
  level: number;
}) {
  const goalReached = todayCount >= dailyGoal;
  const module1 = modules[0];
  const module1ThemeIds = new Set(module1?.themeIds ?? []);
  const looseCategories = categories.filter((c) => !module1ThemeIds.has(c.id));
  const themesDone = module1 ? module1.themeIds.filter((id) => isThemeComplete(getThemeProgress(id))).length : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col items-center gap-4 overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-emerald-500 to-blue-800 p-6 text-center text-white shadow-xl sm:flex-row sm:p-10 sm:text-left"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-yellow-300/20 blur-2xl"
        />
        <Mascot mood="happy" size={100} className="shrink-0" />
        <div className="flex-1">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Braziliaans Portugees leren</h1>
          <p className="mt-1 max-w-md text-emerald-50/90">{dailyTip()}</p>
          <p className="mt-1 text-sm font-bold text-yellow-200">Niveau {level}</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar value={totalLearned} max={totalWords} colorClass="bg-yellow-400" />
            </div>
            <span className="whitespace-nowrap text-sm font-bold">
              {totalLearned} / {totalWords} woorden geleerd
            </span>
          </div>
        </div>

        <div className="relative z-10 flex shrink-0 flex-col items-center gap-1.5 rounded-2xl bg-white/15 px-5 py-4 backdrop-blur-sm">
          <span className="text-xs font-bold uppercase tracking-wide text-emerald-50/80">Vandaag</span>
          <span className="font-display text-2xl font-extrabold">
            {Math.min(todayCount, dailyGoal)}/{dailyGoal}
          </span>
          <span className="text-xs text-emerald-50/70">{goalReached ? "Doel gehaald! 🎉" : "woorden geoefend"}</span>
        </div>
      </motion.div>

      {module1 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onOpenModule(module1.id)}
          className="btn-pop mt-8 flex w-full items-center gap-4 rounded-[1.75rem] border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-emerald-50 p-5 text-left shadow-sm transition-colors hover:border-yellow-400 sm:p-6"
        >
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-700 text-3xl text-white shadow" aria-hidden="true">
            🇧🇷
          </span>
          <span className="flex-1">
            <span className="block font-display text-lg font-bold text-blue-950 sm:text-xl">{module1.titleNl}</span>
            <span className="mt-0.5 block text-sm text-blue-900/60">
              Verhalen, dialogen, thema-quizzen en een module-examen — {themesDone}/5 thema&apos;s afgerond
            </span>
          </span>
          <span className="shrink-0 text-2xl text-blue-900/30" aria-hidden="true">→</span>
        </motion.button>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-blue-950">Losse categorieën</h2>
        <span className="text-sm text-blue-900/50">{looseCategories.length} categorieën</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {looseCategories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <CategoryTile
              category={cat}
              stats={categoryStats[cat.id]}
              onClick={() => onSelectCategory(cat.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
