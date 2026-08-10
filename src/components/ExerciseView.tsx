import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Category, ExerciseKind, Word, WordProgress } from "../types";
import { buildLearningSteps, buildOptions, buildSentenceOptions, type LearningStep } from "../utils/exercises";
import { pickCorrectMessage, pickWrongMessage } from "../utils/encouragement";
import { useTTS } from "../hooks/useTTS";
import { Mascot } from "./Mascot";

type FeedbackState = "idle" | "correct" | "wrong";

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

export function ExerciseView({
  category,
  queue,
  hearts,
  getWordProgress,
  onAnswer,
  onIntroduced,
  onExit,
  onRestartMistakes,
}: {
  category: Category;
  queue: Word[];
  hearts: number;
  getWordProgress: (wordId: string) => WordProgress;
  onAnswer: (wordId: string, correct: boolean, kind: ExerciseKind) => void;
  onIntroduced: (wordId: string) => void;
  onExit: () => void;
  onRestartMistakes?: (words: Word[]) => void;
}) {
  const { speak } = useTTS();
  // Built once, at mount, from a live snapshot of progress at that moment.
  // The parent freezes `queue` per session (and remounts this component via
  // a `key` when starting a new one), so later progress updates elsewhere
  // in the app never reshuffle a session that's already in progress.
  const [session] = useState<LearningStep[]>(() => buildLearningSteps(queue, getWordProgress));
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [message, setMessage] = useState("");
  const [mistakeWordIds, setMistakeWordIds] = useState<string[]>([]);

  const current = session[index];
  const done = index >= session.length;
  const outOfHearts = hearts <= 0;
  const totalAnswerable = useMemo(() => session.filter((s) => s.kind !== "intro").length, [session]);

  // Auto-play pronunciation once when a brand-new word is introduced.
  useEffect(() => {
    if (current?.kind === "intro") speak(current.word.target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // Escape closes the exercise (skips confirmation — progress is saved per-answer already)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onExit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  const options = useMemo(() => {
    if (!current) return [];
    if (current.kind === "source-to-target") return buildOptions(current.word, "target");
    if (current.kind === "target-to-source") return buildOptions(current.word, "source");
    if (current.kind === "sentence-match") return buildSentenceOptions(current.word);
    return [];
  }, [current]);

  function registerResult(correct: boolean, kind: ExerciseKind) {
    setCorrectCount((c) => c + (correct ? 1 : 0));
    setMessage(correct ? pickCorrectMessage() : pickWrongMessage());
    onAnswer(current.word.id, correct, kind);
    if (!correct) setMistakeWordIds((m) => [...m, current.word.id]);
    if (correct) {
      fireConfetti();
      if (kind !== "sentence-match") speak(current.word.target);
    }
  }

  function correctAnswerFor(kind: ExerciseKind, word: Word): string {
    if (kind === "target-to-source") return word.source;
    if (kind === "sentence-match") return word.exampleSource;
    return word.target;
  }

  function handleChoice(choice: string) {
    if (feedback !== "idle" || !current || current.kind === "intro") return;
    const kind = current.kind;
    const correctAnswer = correctAnswerFor(kind, current.word);
    const correct = choice === correctAnswer;
    setSelected(choice);
    setFeedback(correct ? "correct" : "wrong");
    registerResult(correct, kind);
  }

  function handleSkip() {
    if (feedback !== "idle" || !current || current.kind === "intro") return;
    setSelected(null);
    setFeedback("wrong");
    registerResult(false, current.kind);
  }

  function handleIntroContinue() {
    if (!current) return;
    onIntroduced(current.word.id);
    setIndex((i) => i + 1);
  }

  function next() {
    setFeedback("idle");
    setSelected(null);
    setIndex((i) => i + 1);
  }

  if (!session.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-blue-900/70">Geen woorden gevonden in deze categorie.</p>
        <button onClick={onExit} className="btn-pop mt-4 rounded-full bg-emerald-600 px-6 py-2 font-bold text-white">
          Terug
        </button>
      </div>
    );
  }

  if (outOfHearts && !done && feedback === "idle") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-16 text-center">
        <Mascot mood="sad" size={120} />
        <h2 className="font-display text-2xl font-bold text-blue-950">Geen levens meer!</h2>
        <p className="text-blue-900/60">Kom morgen terug, of oefen een andere categorie zodra je levens hersteld zijn.</p>
        <button onClick={onExit} className="btn-pop rounded-full bg-emerald-600 px-6 py-3 font-bold text-white shadow-md">
          Terug naar overzicht
        </button>
      </div>
    );
  }

  if (done) {
    const pct = totalAnswerable === 0 ? 100 : Math.round((correctCount / totalAnswerable) * 100);
    const uniqueMistakes = [...new Map(mistakeWordIds.map((id) => [id, session.find((s) => s.word.id === id)?.word])).values()].filter(
      (w): w is Word => !!w
    );
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-12 text-center">
        <Mascot mood={pct >= 70 ? "excited" : "happy"} size={130} />
        <h2 className="font-display text-2xl font-bold text-blue-950">
          {pct >= 90 ? "Muito bem! 🎉" : pct >= 60 ? "Bom trabalho! 👏" : "Boa tentativa! 💪"}
        </h2>
        <p className="text-blue-900/60">
          Je had {correctCount} van {totalAnswerable} goed <span className="font-bold text-emerald-700">({pct}%)</span>.
        </p>

        {uniqueMistakes.length > 0 && (
          <div className="w-full rounded-3xl border border-red-100 bg-red-50/60 p-4 text-left">
            <p className="text-sm font-bold text-red-700">Nog even oefenen:</p>
            <ul className="mt-2 space-y-1 text-sm text-blue-950">
              {uniqueMistakes.map((w) => (
                <li key={w.id} className="flex justify-between">
                  <span lang="pt-BR" className="font-semibold">{w.target}</span>
                  <span className="text-blue-900/50">{w.source}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          {uniqueMistakes.length > 0 && onRestartMistakes && (
            <button
              onClick={() => onRestartMistakes(uniqueMistakes)}
              className="btn-pop rounded-full bg-blue-900 px-6 py-3 font-bold text-white shadow-md hover:bg-blue-800"
            >
              Oefen deze {uniqueMistakes.length} woorden opnieuw
            </button>
          )}
          <button onClick={onExit} className="btn-pop rounded-full bg-emerald-600 px-6 py-3 font-bold text-white shadow-md hover:bg-emerald-700">
            Terug naar overzicht
          </button>
        </div>
      </div>
    );
  }

  const progressPct = Math.round((index / session.length) * 100);
  const correctAnswerDisplay = current.kind !== "intro" ? correctAnswerFor(current.kind, current.word) : "";
  const correctAnswerLang = current.kind === "target-to-source" || current.kind === "sentence-match" ? "nl" : "pt-BR";

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:py-10">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onExit} aria-label="Oefening sluiten" className="btn-pop text-2xl text-blue-900/40 hover:text-blue-900">✕</button>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 sm:flex">
          <span aria-hidden="true">{category.icon}</span>
          {category.nameNl}
        </span>
        <div
          className="h-3 flex-1 overflow-hidden rounded-full bg-emerald-100"
          role="progressbar"
          aria-valuenow={index}
          aria-valuemin={0}
          aria-valuemax={session.length}
          aria-label="Voortgang in deze sessie"
        >
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-sm font-bold text-red-700">
          <span aria-hidden="true">❤️</span> <span className="sr-only">Levens:</span>{hearts}
        </span>
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
          {current.kind === "intro" && (
            <IntroCard word={current.word} onSpeak={() => speak(current.word.target)} onContinue={handleIntroContinue} />
          )}

          {current.kind === "source-to-target" && (
            <QuizCard
              prompt="Welk woord betekent:"
              promptWord={current.word.source}
              options={options}
              selected={selected}
              feedback={feedback}
              correctAnswer={current.word.target}
              onChoose={handleChoice}
              onSkip={handleSkip}
            />
          )}
          {current.kind === "target-to-source" && (
            <QuizCard
              prompt="Wat betekent dit woord?"
              promptWord={current.word.target}
              promptLang="pt-BR"
              speakPrompt
              options={options}
              selected={selected}
              feedback={feedback}
              correctAnswer={current.word.source}
              onChoose={handleChoice}
              onSkip={handleSkip}
              onSpeak={() => speak(current.word.target)}
            />
          )}
          {current.kind === "sentence-match" && (
            <SentenceCard
              word={current.word}
              options={options}
              selected={selected}
              feedback={feedback}
              correctAnswer={current.word.exampleSource}
              onChoose={handleChoice}
              onSkip={handleSkip}
              onSpeak={() => speak(current.word.exampleTarget)}
            />
          )}

          {feedback !== "idle" && current.kind !== "intro" && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-5 rounded-2xl p-4 ${
                feedback === "correct" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"
              }`}
            >
              <div className="flex items-start gap-3">
                <Mascot mood={feedback === "correct" ? "excited" : "sad"} size={44} />
                <div className="flex-1">
                  <p className="font-bold">{feedback === "correct" ? `✅ ${message}` : `❌ ${message}`}</p>
                  {feedback === "wrong" && (
                    <p className="mt-1 text-sm">
                      Het juiste antwoord is: <strong lang={correctAnswerLang}>{correctAnswerDisplay}</strong>
                    </p>
                  )}
                  {/* Example sentence is always shown after an answer — except for
                      sentence-match, where the sentence itself WAS the exercise. */}
                  {current.kind !== "sentence-match" && (
                    <p className="mt-2 text-sm italic">
                      <span lang="pt-BR">{current.word.exampleTarget}</span>
                      <br />
                      <span className="not-italic text-xs opacity-70">{current.word.exampleSource}</span>
                    </p>
                  )}
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

function IntroCard({
  word,
  onSpeak,
  onContinue,
}: {
  word: Word;
  onSpeak: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-900/40">Nieuw woord</p>
      <h2 className="font-display mt-2 text-2xl font-bold text-blue-900/70">{word.source}</h2>
      <p className="font-display mt-1 text-4xl font-extrabold text-emerald-700" lang="pt-BR">{word.target}</p>

      <button
        onClick={onSpeak}
        aria-label={`Beluister uitspraak van ${word.target}`}
        className="btn-pop mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-3xl text-white shadow-md hover:bg-emerald-700"
      >
        🔊
      </button>
      <p className="mt-2 text-xs font-semibold text-blue-900/40">Tik om de uitspraak nogmaals te horen</p>

      <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-left">
        <p className="font-semibold text-blue-950" lang="pt-BR">{word.exampleTarget}</p>
        <p className="mt-1 text-sm text-blue-900/60">{word.exampleSource}</p>
      </div>

      <button
        onClick={onContinue}
        className="btn-pop mt-6 w-full rounded-2xl bg-emerald-600 py-3 font-bold text-white shadow-md hover:bg-emerald-700"
      >
        Verder
      </button>
    </div>
  );
}

function QuizCard({
  prompt,
  promptWord,
  promptLang,
  options,
  selected,
  feedback,
  correctAnswer,
  onChoose,
  onSkip,
  onSpeak,
  speakPrompt,
}: {
  prompt: string;
  promptWord: string;
  promptLang?: string;
  options: string[];
  selected: string | null;
  feedback: FeedbackState;
  correctAnswer: string;
  onChoose: (choice: string) => void;
  onSkip: () => void;
  onSpeak?: () => void;
  speakPrompt?: boolean;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (feedback !== "idle") return;
      const n = Number(e.key);
      if (n >= 1 && n <= options.length) onChoose(options[n - 1]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [options, feedback, onChoose]);

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-900/40">{prompt}</p>
      <div className="mt-2 flex items-center gap-3">
        <h2 className="font-display text-3xl font-extrabold text-blue-950" lang={promptLang}>{promptWord}</h2>
        {speakPrompt && onSpeak && (
          <button onClick={onSpeak} aria-label="Beluister uitspraak" className="btn-pop rounded-full bg-emerald-50 p-2 text-xl text-emerald-700 hover:bg-emerald-100">
            🔊
          </button>
        )}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((opt, i) => {
          const isSelected = selected === opt;
          const isCorrectOpt = opt === correctAnswer;
          let style = "border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50";
          if (feedback !== "idle") {
            if (isCorrectOpt) style = "border-emerald-500 bg-emerald-50 text-emerald-900";
            else if (isSelected) style = "border-red-400 bg-red-50 text-red-800";
            else style = "border-gray-100 bg-white opacity-60";
          }
          return (
            <button
              key={opt}
              disabled={feedback !== "idle"}
              onClick={() => onChoose(opt)}
              className={`btn-pop flex min-h-[52px] items-center gap-2 rounded-2xl border-2 px-4 py-3 text-left text-base font-semibold shadow-sm transition-colors ${style}`}
            >
              <span aria-hidden="true" className="text-xs font-bold text-blue-900/30">{i + 1}</span>
              <span lang={promptLang ? "nl" : "pt-BR"}>{opt}</span>
            </button>
          );
        })}
      </div>
      {feedback === "idle" && (
        <button onClick={onSkip} className="btn-pop mt-4 text-sm font-semibold text-blue-900/40 hover:text-blue-900/70">
          Ik weet het niet →
        </button>
      )}
    </div>
  );
}

/** "Find the matching translation" — shows a short Portuguese example
 * sentence (with audio) and asks the learner to pick its correct Dutch
 * translation from a list, so vocabulary is also tested in context rather
 * than as isolated words. */
function SentenceCard({
  word,
  options,
  selected,
  feedback,
  correctAnswer,
  onChoose,
  onSkip,
  onSpeak,
}: {
  word: Word;
  options: string[];
  selected: string | null;
  feedback: FeedbackState;
  correctAnswer: string;
  onChoose: (choice: string) => void;
  onSkip: () => void;
  onSpeak: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (feedback !== "idle") return;
      const n = Number(e.key);
      if (n >= 1 && n <= options.length) onChoose(options[n - 1]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [options, feedback, onChoose]);

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-900/40">Welke vertaling hoort bij deze zin?</p>
      <div className="mt-2 flex items-start gap-3 rounded-2xl bg-blue-50 p-4">
        <p className="font-display flex-1 text-xl font-bold text-blue-950" lang="pt-BR">{word.exampleTarget}</p>
        <button onClick={onSpeak} aria-label="Beluister zin" className="btn-pop shrink-0 rounded-full bg-white p-2 text-xl text-emerald-700 shadow-sm hover:bg-emerald-50">
          🔊
        </button>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {options.map((opt, i) => {
          const isSelected = selected === opt;
          const isCorrectOpt = opt === correctAnswer;
          let style = "border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50";
          if (feedback !== "idle") {
            if (isCorrectOpt) style = "border-emerald-500 bg-emerald-50 text-emerald-900";
            else if (isSelected) style = "border-red-400 bg-red-50 text-red-800";
            else style = "border-gray-100 bg-white opacity-60";
          }
          return (
            <button
              key={opt}
              disabled={feedback !== "idle"}
              onClick={() => onChoose(opt)}
              className={`btn-pop flex min-h-[52px] items-start gap-2 rounded-2xl border-2 px-4 py-3 text-left text-base font-semibold shadow-sm transition-colors ${style}`}
            >
              <span aria-hidden="true" className="mt-0.5 text-xs font-bold text-blue-900/30">{i + 1}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {feedback === "idle" && (
        <button onClick={onSkip} className="btn-pop mt-4 text-sm font-semibold text-blue-900/40 hover:text-blue-900/70">
          Ik weet het niet →
        </button>
      )}
    </div>
  );
}
