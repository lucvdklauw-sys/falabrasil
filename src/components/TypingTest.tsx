import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { words as allWords } from "../data/words";
import { categories } from "../data/categories";
import { shuffle } from "../utils/exercises";
import { isCloseEnough } from "../utils/textMatch";
import { pickCorrectMessage, pickWrongMessage } from "../utils/encouragement";
import { useTTS } from "../hooks/useTTS";
import { Mascot } from "./Mascot";
import { TypeCard, type TypeFeedback } from "./TypeCard";
import type { Word } from "../types";

async function fireConfetti() {
  const { default: confetti } = await import("canvas-confetti");
  confetti({
    particleCount: 70,
    spread: 65,
    startVelocity: 35,
    origin: { y: 0.7 },
    colors: ["#009739", "#FFDF00", "#002776", "#ffffff"],
  });
}

/** Schrijftest — the standalone, fully optional typing test. Unlike the
 * regular learning flow (where typing was removed entirely), this covers
 * ALL 300 words on demand, filterable by category, with no hearts and no
 * gating: you can test yourself on anything, anytime. */
export function TypingTest({ onAnswer }: { onAnswer: (wordId: string, correct: boolean) => void }) {
  const { speak } = useTTS();
  const [categoryId, setCategoryId] = useState<string>("all");
  const [session, setSession] = useState<Word[] | null>(null);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<TypeFeedback>("idle");
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<Word[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableWords = useMemo(
    () => (categoryId === "all" ? allWords : allWords.filter((w) => w.categoryId === categoryId)),
    [categoryId]
  );

  function start() {
    setSession(shuffle(availableWords));
    setIndex(0);
    setTyped("");
    setFeedback("idle");
    setCorrectCount(0);
    setMistakes([]);
  }

  function stop() {
    setSession(null);
  }

  const current = session ? session[index] : null;
  const done = session !== null && index >= session.length;

  function handleSubmit() {
    if (!current || feedback !== "idle") return;
    const correct = isCloseEnough(typed, current.target);
    setFeedback(correct ? "correct" : "wrong");
    setCorrectCount((c) => c + (correct ? 1 : 0));
    if (!correct) setMistakes((m) => [...m, current]);
    onAnswer(current.id, correct);
    speak(current.target);
    if (correct) fireConfetti();
  }

  function handleSkip() {
    if (!current || feedback !== "idle") return;
    setFeedback("wrong");
    setMistakes((m) => [...m, current]);
    onAnswer(current.id, false);
  }

  function next() {
    setFeedback("idle");
    setTyped("");
    setIndex((i) => i + 1);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  // Setup screen: pick a category (or all 300 words) and start.
  if (!session) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-sm sm:p-8">
          <Mascot mood="neutral" size={90} />
          <h1 className="font-display mt-3 text-2xl font-bold text-blue-950">Schrijftest</h1>
          <p className="mt-2 text-blue-900/60">
            Optioneel: test jezelf door woorden te typen. Dit staat los van je normale leerflow — kies een
            categorie of oefen alle 300 woorden door elkaar.
          </p>

          <label htmlFor="typing-category" className="mt-6 block text-left text-sm font-semibold text-blue-900/70">
            Categorie
          </label>
          <select
            id="typing-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-2xl border-2 border-emerald-200 px-4 py-3 text-base font-semibold text-blue-950 outline-none focus:border-emerald-500"
          >
            <option value="all">Alle woorden ({allWords.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameNl} ({allWords.filter((w) => w.categoryId === c.id).length})
              </option>
            ))}
          </select>

          <button
            onClick={start}
            className="btn-pop mt-6 w-full rounded-2xl bg-emerald-600 py-3 font-bold text-white shadow-md hover:bg-emerald-700"
          >
            Start schrijftest ({availableWords.length} woorden)
          </button>
        </div>
      </div>
    );
  }

  // Results screen.
  if (done) {
    const pct = session.length === 0 ? 100 : Math.round((correctCount / session.length) * 100);
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-12 text-center">
        <Mascot mood={pct >= 70 ? "excited" : "happy"} size={130} />
        <h2 className="font-display text-2xl font-bold text-blue-950">Schrijftest klaar!</h2>
        <p className="text-blue-900/60">
          Je had {correctCount} van {session.length} goed <span className="font-bold text-emerald-700">({pct}%)</span>.
        </p>
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
          <button onClick={start} className="btn-pop rounded-full bg-blue-900 px-6 py-3 font-bold text-white shadow-md hover:bg-blue-800">
            Opnieuw
          </button>
          <button onClick={stop} className="btn-pop rounded-full bg-emerald-600 px-6 py-3 font-bold text-white shadow-md hover:bg-emerald-700">
            Terug
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;
  const progressPct = Math.round((index / session.length) * 100);

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:py-10">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={stop} aria-label="Schrijftest sluiten" className="btn-pop text-2xl text-blue-900/40 hover:text-blue-900">✕</button>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 sm:flex">
          <span aria-hidden="true">✍️</span> Schrijftest
        </span>
        <div
          className="h-3 flex-1 overflow-hidden rounded-full bg-emerald-100"
          role="progressbar"
          aria-valuenow={index}
          aria-valuemin={0}
          aria-valuemax={session.length}
          aria-label="Voortgang in deze schrijftest"
        >
          <motion.div className="h-full rounded-full bg-emerald-500" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
        </div>
        <span className="text-sm font-bold text-blue-900/50">{index + 1}/{session.length}</span>
      </div>

      <AnimatePresence>
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className={feedback === "wrong" ? "shake" : ""}
        >
          <TypeCard
            word={current}
            typed={typed}
            setTyped={setTyped}
            feedback={feedback}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            inputRef={inputRef}
            onSpeak={() => speak(current.target)}
          />

          {feedback !== "idle" && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-5 rounded-2xl p-4 ${feedback === "correct" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}
            >
              <div className="flex items-start gap-3">
                <Mascot mood={feedback === "correct" ? "excited" : "sad"} size={44} />
                <div className="flex-1">
                  <p className="font-bold">
                    {feedback === "correct" ? `✅ ${pickCorrectMessage()}` : `❌ ${pickWrongMessage()}`}
                  </p>
                  {feedback === "wrong" && (
                    <p className="mt-1 text-sm">
                      Het juiste antwoord is: <strong lang="pt-BR">{current.target}</strong>
                    </p>
                  )}
                  <p className="mt-2 text-sm italic">
                    <span lang="pt-BR">{current.exampleTarget}</span>
                    <br />
                    <span className="not-italic text-xs opacity-70">{current.exampleSource}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={next}
                autoFocus
                className="btn-pop mt-4 w-full rounded-2xl bg-blue-900 py-3 font-bold text-white shadow-md hover:bg-blue-800"
              >
                Volgende
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
