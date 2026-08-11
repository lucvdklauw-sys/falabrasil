import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ExerciseKind, Word } from "../types";
import {
  buildClozeSentence,
  buildOptions,
  buildSentenceOptions,
  buildWordInContextOptions,
  shuffle,
} from "../utils/exercises";
import { useTTS } from "../hooks/useTTS";
import { Mascot } from "./Mascot";

export type QuizKind = Extract<
  ExerciseKind,
  "source-to-target" | "target-to-source" | "sentence-match" | "cloze" | "word-in-context"
>;

export interface QuizItem {
  word: Word;
  kind: QuizKind;
}

/** Builds a shuffled multiple-choice quiz session for a set of words,
 * rotating across all 5 MC-based exercise kinds so no quiz feels the same
 * — used by both the per-theme quiz and the module exam. Purely
 * client-side/random; no persistence here. */
export function buildQuizItems(quizWords: Word[]): QuizItem[] {
  const kinds: QuizKind[] = ["source-to-target", "target-to-source", "sentence-match", "cloze", "word-in-context"];
  const items = quizWords.map((word, i) => ({ word, kind: kinds[i % kinds.length] }));
  return shuffle(items);
}

function promptAndOptions(item: QuizItem): { prompt: string; promptText: string; promptLang?: string; options: string[]; correctAnswer: string } {
  const { word, kind } = item;
  if (kind === "source-to-target") {
    return { prompt: "Welk woord betekent:", promptText: word.source, options: buildOptions(word, "target"), correctAnswer: word.target };
  }
  if (kind === "target-to-source") {
    return { prompt: "Wat betekent dit woord?", promptText: word.target, promptLang: "pt-BR", options: buildOptions(word, "source"), correctAnswer: word.source };
  }
  if (kind === "sentence-match") {
    return {
      prompt: "Welke vertaling hoort bij deze zin?",
      promptText: word.exampleTarget,
      promptLang: "pt-BR",
      options: buildSentenceOptions(word),
      correctAnswer: word.exampleSource,
    };
  }
  if (kind === "cloze") {
    const { blanked, options } = buildClozeSentence(word);
    return { prompt: "Welk woord ontbreekt?", promptText: blanked, promptLang: "pt-BR", options, correctAnswer: word.target };
  }
  // word-in-context
  return {
    prompt: `Welk woord in deze zin betekent "${word.source}"?`,
    promptText: word.exampleTarget,
    promptLang: "pt-BR",
    options: buildWordInContextOptions(word),
    correctAnswer: word.target,
  };
}

export function QuizRunner({
  title,
  items,
  passThreshold,
  onExit,
  onFinish,
  onRetryMistakes,
}: {
  title: string;
  items: QuizItem[];
  /** 0-100; when provided, the summary highlights pass/fail against it. */
  passThreshold?: number;
  onExit: () => void;
  onFinish: (scorePct: number, mistakes: Word[]) => void;
  /** When provided, shows an "Oefen alleen mijn fouten" button in the
   *  summary that restarts a fresh quiz using only the missed words. */
  onRetryMistakes?: (mistakes: Word[]) => void;
}) {
  const { speak } = useTTS();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<Word[]>([]);
  const [finished, setFinished] = useState(false);

  const item = items[index];
  const done = index >= items.length;
  const data = useMemo(() => (item ? promptAndOptions(item) : null), [item]);

  useEffect(() => {
    if (done && !finished) {
      const pct = items.length === 0 ? 100 : Math.round((correctCount / items.length) * 100);
      setFinished(true);
      onFinish(pct, mistakes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (!items.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-blue-900/70">Geen woorden om te overhoren.</p>
        <button onClick={onExit} className="btn-pop mt-4 rounded-full bg-emerald-600 px-6 py-2 font-bold text-white">Terug</button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((correctCount / items.length) * 100);
    const passed = passThreshold === undefined || pct >= passThreshold;
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-12 text-center">
        <Mascot mood={passed ? "excited" : "sad"} size={130} />
        <h2 className="font-display text-2xl font-bold text-blue-950">{title} — resultaat</h2>
        <p className="text-blue-900/60">
          Je had {correctCount} van {items.length} goed <span className="font-bold text-emerald-700">({pct}%)</span>.
        </p>
        {passThreshold !== undefined && (
          <p className={`font-bold ${passed ? "text-emerald-700" : "text-red-700"}`}>
            {passed ? `Geslaagd! (minimaal ${passThreshold}% nodig)` : `Nog niet geslaagd — minimaal ${passThreshold}% nodig.`}
          </p>
        )}
        {mistakes.length > 0 && (
          <div className="w-full rounded-3xl border border-red-100 bg-red-50/60 p-4 text-left">
            <p className="text-sm font-bold text-red-700">Nog even oefenen:</p>
            <ul className="mt-2 space-y-1 text-sm text-blue-950">
              {mistakes.map((w) => (
                <li key={w.id} className="flex justify-between">
                  <span lang="pt-BR" className="font-semibold">{w.target}</span>
                  <span className="text-blue-900/50">{w.source}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {mistakes.length > 0 && onRetryMistakes && (
            <button
              onClick={() => onRetryMistakes(mistakes)}
              className="btn-pop rounded-full bg-blue-900 px-6 py-3 font-bold text-white shadow-md hover:bg-blue-800"
            >
              Oefen alleen mijn fouten ({mistakes.length})
            </button>
          )}
          <button onClick={onExit} className="btn-pop rounded-full bg-emerald-600 px-6 py-3 font-bold text-white shadow-md hover:bg-emerald-700">
            Verder
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  function choose(opt: string) {
    if (selected !== null || !item || !data) return;
    setSelected(opt);
    const correct = opt === data.correctAnswer;
    if (correct) setCorrectCount((c) => c + 1);
    else setMistakes((m) => [...m, item.word]);
  }

  function next() {
    setSelected(null);
    setIndex((i) => i + 1);
  }

  const progressPct = Math.round((index / items.length) * 100);

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:py-10">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onExit} aria-label="Sluiten" className="btn-pop text-2xl text-blue-900/40 hover:text-blue-900">✕</button>
        <span className="hidden shrink-0 text-sm font-bold uppercase tracking-wide text-blue-900/40 sm:inline">{title}</span>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-emerald-100" role="progressbar" aria-valuenow={index} aria-valuemin={0} aria-valuemax={items.length}>
          <motion.div className="h-full rounded-full bg-emerald-500" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.3 }} />
        </div>
        <span className="text-sm font-bold text-blue-900/50">{index + 1}/{items.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-900/40">{data.prompt}</p>
          <div className="mt-2 flex items-start gap-3">
            <h2 className="font-display flex-1 text-2xl font-extrabold text-blue-950" lang={data.promptLang}>
              {data.promptText}
            </h2>
            {data.promptLang === "pt-BR" && (
              <button onClick={() => speak(item.word.target === data.promptText ? item.word.target : item.word.exampleTarget)} aria-label="Beluister" className="btn-pop shrink-0 rounded-full bg-emerald-50 p-2 text-xl text-emerald-700 hover:bg-emerald-100">
                🔊
              </button>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.options.map((opt, i) => {
              let style = "border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50";
              if (selected !== null) {
                if (opt === data.correctAnswer) style = "border-emerald-500 bg-emerald-50 text-emerald-900";
                else if (opt === selected) style = "border-red-400 bg-red-50 text-red-800";
                else style = "border-gray-100 bg-white opacity-60";
              }
              return (
                <button
                  key={opt}
                  disabled={selected !== null}
                  onClick={() => choose(opt)}
                  className={`btn-pop flex min-h-[52px] items-center gap-2 rounded-2xl border-2 px-4 py-3 text-left text-base font-semibold shadow-sm transition-colors ${style}`}
                >
                  <span aria-hidden="true" className="text-xs font-bold text-blue-900/30">{i + 1}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <button onClick={next} autoFocus className="btn-pop mt-5 w-full rounded-2xl bg-blue-900 py-3 font-bold text-white shadow-md hover:bg-blue-800">
              Volgende
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
