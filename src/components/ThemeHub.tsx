import { motion } from "framer-motion";
import type { Category, ThemeProgress } from "../types";

export type ThemeStep = "words" | "story" | "dialogue" | "quiz";

const STEPS: { key: ThemeStep; icon: string; label: string; doneKey: keyof ThemeProgress }[] = [
  { key: "words", icon: "📚", label: "Woorden leren", doneKey: "wordsDone" },
  { key: "story", icon: "📖", label: "Verhaal", doneKey: "storyDone" },
  { key: "dialogue", icon: "🎭", label: "Dialoog", doneKey: "dialogueDone" },
  { key: "quiz", icon: "📝", label: "Themaquiz", doneKey: "quizDone" },
];

/** The per-theme hub: 4 sequentially-gated steps. Step N+1 unlocks only
 * once step N is marked done in ThemeProgress. */
export function ThemeHub({
  category,
  themeProgress,
  onSelectStep,
  onBack,
}: {
  category: Category;
  themeProgress: ThemeProgress;
  onSelectStep: (step: ThemeStep) => void;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:py-10">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onBack} aria-label="Terug naar module" className="btn-pop text-2xl text-blue-900/40 hover:text-blue-900">←</button>
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">{category.icon}</span>
          <h1 className="font-display text-xl font-extrabold text-blue-950 sm:text-2xl">{category.nameNl}</h1>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {STEPS.map((s, i) => {
          const done = !!themeProgress[s.doneKey];
          const prevDone = i === 0 || !!themeProgress[STEPS[i - 1].doneKey];
          const unlocked = prevDone;
          return (
            <motion.button
              key={s.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              disabled={!unlocked}
              onClick={() => onSelectStep(s.key)}
              className={`btn-pop flex items-center gap-4 rounded-3xl border-2 p-4 text-left shadow-sm transition-colors sm:p-5 ${
                done
                  ? "border-emerald-400 bg-emerald-50"
                  : unlocked
                  ? "border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50"
                  : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm" aria-hidden="true">
                {unlocked ? s.icon : "🔒"}
              </span>
              <span className="flex-1">
                <span className="block font-display text-base font-bold text-blue-950">{s.label}</span>
                <span className="mt-0.5 block text-sm text-blue-900/50">
                  {done ? "Voltooid ✅" : unlocked ? "Beschikbaar" : "Rond het vorige onderdeel eerst af"}
                </span>
              </span>
              {s.key === "quiz" && done && themeProgress.quizScore > 0 && (
                <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
                  {themeProgress.quizScore}%
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
