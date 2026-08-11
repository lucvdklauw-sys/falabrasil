import { useState } from "react";
import type { Category, Word } from "../types";
import { QuizRunner, buildQuizItems, type QuizItem } from "./QuizRunner";

/** The Themaquiz: only this theme's words, fully shuffled, mixing all
 * multiple-choice exercise forms so the quiz never feels the same twice. */
export function ThemeQuiz({
  category,
  words,
  onExit,
  onFinish,
}: {
  category: Category;
  words: Word[];
  onExit: () => void;
  onFinish: (scorePct: number) => void;
}) {
  const [items, setItems] = useState<QuizItem[]>(() => buildQuizItems(words));
  const [sessionKey, setSessionKey] = useState(0);

  return (
    <QuizRunner
      key={sessionKey}
      title={`Themaquiz — ${category.nameNl}`}
      items={items}
      onExit={onExit}
      onFinish={onFinish}
      onRetryMistakes={(mistakes) => {
        setItems(buildQuizItems(mistakes));
        setSessionKey((k) => k + 1);
      }}
    />
  );
}
