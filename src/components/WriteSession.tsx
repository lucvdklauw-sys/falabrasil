import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Word } from "../types";
import { shuffle } from "../utils/exercises";
import { isCloseEnough } from "../utils/textMatch";
import { pickCorrectMessage, pickWrongMessage } from "../utils/encouragement";
import { useTTS } from "../hooks/useTTS";
import { Mascot } from "./Mascot";
import { TypeCard, type TypeFeedback, type WriteDirection } from "./TypeCard";

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

/** "Zelf schrijven" practice, scoped to one theme/category word set and a
 * chosen direction — fully separate from the multiple-choice modes, per
 * the product requirement. Unlimited: no hearts, always restartable. */
export function WriteSession({
  title,
  wordSet,
  direction,
  onExit,
  onAnswer,
  onSessionComplete,
  onChangeMode,
}: {
  title: string;
  wordSet: Word[];
  direction: WriteDirection;
  onExit: () => void;
  onAnswer: (wordId: string, correct: boolean, direction: WriteDirection) => void;
  onSessionComplete?: () => void;
  onChangeMode?: () => void;
}) {
  const { speak } = useTTS();
  const [session, setSession] = useState<Word[]>(() => shuffle(wordSet));
  const [sessionKey, setSessionKey] = useState(0);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<TypeFeedback>("idle");
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<Word[]>([]);
  const [completedFired, setCompletedFired] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = session[index];
  const done = index >= session.length;

  useEffect(() => {
    if (done && !completedFired) {
      setCompletedFired(true);
      onSessionComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function handleSubmit() {
    if (!current || feedback !== "idle") return;
    const answer = direction === "nl-pt" ? current.target : current.source;
    const correct = isCloseEnough(typed, answer);
    setFeedback(correct ? "correct" : "wrong");
    setCorrectCount((c) => c + (correct ? 1 : 0));
    if (!correct) setMistakes((m) => [...m, current]);
    onAnswer(current.id, correct, direction);
    speak(current.target);
    if (correct) fireConfetti();
  }

  function handleSkip() {
    if (!current || feedback !== "idle") return;
    setFeedback("wrong");
    setMistakes((m) => [...m, current]);
    onAnswer(current.id, false, direction);
  }

  function next() {
    setFeedback("idle");
    setTyped("");
    setIndex((i) => i + 1);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function restart() {
    setSession(shuffle(wordSet));
    setSessionKey((k) => k + 1);
    setIndex(0);
    setTyped("");
    setFeedback("idle");
    setCorrectCount(0);
    setMistakes([]);
    setCompletedFired(false);
  }

  if (!session.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-blue-900/70">Geen woorden gevonden.</p>
        <button onClick={onExit} className="btn-pop mt-4 rounded-full bg-emerald-600 px-6 py-2 font-bold text-white">Terug</button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((correctCount / session.length) * 100);
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-12 text-center">
        <Mascot mood={pct >= 70 ? "excited" : "happy"} size={130} />
        <h2 className="font-display text-2xl font-bold text-blue-950">Schrijfoefening klaar!</h2>
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
          <button onClick={restart} className="btn-pop rounded-full bg-blue-900 px-6 py-3 font-bold text-white shadow-md hover:bg-blue-800">
            Opnieuw oefenen
          </button>
          {onChangeMode && (
            <button onClick={onChangeMode} className="btn-pop rounded-full border-2 border-emerald-200 px-6 py-3 font-bold text-emerald-700 hover:bg-emerald-50">
              Andere oefenvorm
            </button>
          )}
          <button onClick={onExit} className="btn-pop rounded-full bg-emerald-600 px-6 py-3 font-bold text-white shadow-md hover:bg-emerald-700">
            Terug
          </button>
        </div>
      </div>
    );
  }

  const progressPct = Math.round((index / session.length) * 100);

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:py-10">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onExit} aria-label="Sluiten" className="btn-pop text-2xl text-blue-900/40 hover:text-blue-900">✕</button>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 sm:flex">
          <span aria-hidden="true">✍️</span> {title}
        </span>
        <div
          className="h-3 flex-1 overflow-hidden rounded-full bg-emerald-100"
          role="progressbar"
          aria-valuenow={index}
          aria-valuemin={0}
          aria-valuemax={session.length}
        >
          <motion.div className="h-full rounded-full bg-emerald-500" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
        </div>
        <span className="text-sm font-bold text-blue-900/50">{index + 1}/{session.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${sessionKey}-${index}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className={feedback === "wrong" ? "shake" : ""}
        >
          <TypeCard
            word={current}
            direction={direction}
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
                      Het juiste antwoord is:{" "}
                      <strong lang={direction === "nl-pt" ? "pt-BR" : undefined}>
                        {direction === "nl-pt" ? current.target : current.source}
                      </strong>
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
