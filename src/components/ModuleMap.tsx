import { motion } from "framer-motion";
import type { CourseModule, ThemeProgress } from "../types";
import { categories } from "../data/categories";

function isThemeComplete(tp: ThemeProgress | undefined): boolean {
  return !!tp && tp.wordsDone && tp.storyDone && tp.dialogueDone && tp.quizDone;
}

/** The Module map: a vertical path of exactly 5 themes followed by a
 * Module-examen node, Duolingo-style but kept visually mature (no
 * childish animation) — flag-color gradient nodes, clean lock states. */
export function ModuleMap({
  module,
  getThemeProgress,
  examDone,
  examScore,
  onSelectTheme,
  onSelectExam,
  onBack,
}: {
  module: CourseModule;
  getThemeProgress: (themeId: string) => ThemeProgress;
  examDone: boolean;
  examScore: number;
  onSelectTheme: (themeId: string) => void;
  onSelectExam: () => void;
  onBack: () => void;
}) {
  const themeStates = module.themeIds.map((id, i) => {
    const tp = getThemeProgress(id);
    const complete = isThemeComplete(tp);
    const prevComplete = i === 0 || isThemeComplete(getThemeProgress(module.themeIds[i - 1]));
    return { id, tp, complete, unlocked: prevComplete };
  });
  const allThemesComplete = themeStates.every((t) => t.complete);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onBack} aria-label="Terug" className="btn-pop text-2xl text-blue-900/40 hover:text-blue-900">←</button>
        <div>
          <h1 className="font-display text-xl font-extrabold text-blue-950 sm:text-2xl">{module.titleNl}</h1>
          <p className="text-sm text-blue-900/50">5 thema&apos;s + module-examen</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        {themeStates.map((t, i) => {
          const cat = categories.find((c) => c.id === t.id);
          if (!cat) return null;
          const stepsDone = [t.tp.wordsDone, t.tp.storyDone, t.tp.dialogueDone, t.tp.quizDone].filter(Boolean).length;
          return (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              disabled={!t.unlocked}
              onClick={() => onSelectTheme(t.id)}
              className={`btn-pop flex w-full max-w-md items-center gap-4 rounded-3xl border-2 p-4 text-left shadow-sm transition-colors sm:p-5 ${
                t.complete
                  ? "border-emerald-400 bg-emerald-50"
                  : t.unlocked
                  ? "border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50"
                  : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl text-white shadow ${
                  t.unlocked ? cat.color : "from-gray-300 to-gray-400"
                }`}
                aria-hidden="true"
              >
                {t.unlocked ? cat.icon : "🔒"}
              </span>
              <span className="flex-1">
                <span className="block font-display text-lg font-bold text-blue-950">
                  Thema {i + 1}: {cat.nameNl}
                </span>
                <span className="mt-0.5 block text-sm text-blue-900/50">
                  {t.complete ? "Voltooid ✅" : t.unlocked ? `${stepsDone}/4 onderdelen klaar` : "Vergrendeld"}
                </span>
              </span>
            </motion.button>
          );
        })}

        <div className="my-2 h-8 w-0.5 bg-emerald-200" aria-hidden="true" />

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          disabled={!allThemesComplete}
          onClick={onSelectExam}
          className={`btn-pop flex w-full max-w-md items-center gap-4 rounded-3xl border-2 p-4 text-left shadow-sm transition-colors sm:p-5 ${
            examDone
              ? "border-yellow-400 bg-yellow-50"
              : allThemesComplete
              ? "border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50"
              : "border-gray-100 bg-gray-50 opacity-60"
          }`}
        >
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl text-white shadow ${
              allThemesComplete ? "from-yellow-400 to-yellow-600" : "from-gray-300 to-gray-400"
            }`}
            aria-hidden="true"
          >
            {allThemesComplete ? "🏆" : "🔒"}
          </span>
          <span className="flex-1">
            <span className="block font-display text-lg font-bold text-blue-950">Module-examen</span>
            <span className="mt-0.5 block text-sm text-blue-900/50">
              {examDone ? `Gehaald — beste score ${examScore}%` : allThemesComplete ? "Beschikbaar — minimaal 80% nodig" : "Rond eerst alle 5 thema's af"}
            </span>
          </span>
        </motion.button>
      </div>
    </div>
  );
}
