import { useMemo, useState } from "react";
import type { CourseModule, Word } from "../types";
import { words as allWords } from "../data/words";
import { categories } from "../data/categories";
import { shuffle } from "../utils/exercises";
import { QuizRunner, buildQuizItems, type QuizItem } from "./QuizRunner";

const PASS_THRESHOLD = 80;
const EXAM_COVERAGE = 0.7; // ~70% of the combined module vocabulary

function buildExamWords(module: CourseModule): Word[] {
  const pool = allWords.filter((w) => module.themeIds.includes(w.categoryId));
  const count = Math.max(1, Math.round(pool.length * EXAM_COVERAGE));
  return shuffle(pool).slice(0, count);
}

/** The Module-examen: automatically offered after all 5 themes in a module
 * are complete. Uses ~70% of the module's combined vocabulary, fully
 * mixed, multiple choice only (no spelling yet). Requires >=80% to pass
 * and unlock the next module. */
export function ModuleExam({
  module,
  onExit,
  onFinish,
}: {
  module: CourseModule;
  onExit: () => void;
  onFinish: (scorePct: number) => void;
}) {
  const examWords = useMemo(() => buildExamWords(module), [module]);
  const [items, setItems] = useState<QuizItem[]>(() => buildQuizItems(examWords));
  const [sessionKey, setSessionKey] = useState(0);

  const themeNames = module.themeIds
    .map((id) => categories.find((c) => c.id === id)?.nameNl)
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <QuizRunner
        key={sessionKey}
        title={`Module-examen — ${module.titleNl}`}
        items={items}
        passThreshold={PASS_THRESHOLD}
        onExit={onExit}
        onFinish={onFinish}
        onRetryMistakes={(mistakes) => {
          setItems(buildQuizItems(mistakes));
          setSessionKey((k) => k + 1);
        }}
      />
      {items.length > 0 && (
        <p className="mx-auto -mt-2 max-w-xl px-4 text-center text-xs text-blue-900/40">
          Onderwerpen: {themeNames}
        </p>
      )}
    </div>
  );
}
