import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ExerciseKind, Word } from "../types";
import {
  buildClozeSentence,
  buildOptions,
  buildSentenceOptions,
  buildWordInContextOptions,
  buildPracticeItems,
  type PracticeItem,
  type PracticeMode,
} from "../utils/exercises";
import { pickCorrectMessage, pickWrongMessage } from "../utils/encouragement";
import { useTTS } from "../hooks/useTTS";
import { Mascot } from "./Mascot";
import { QuizCard, SentenceCard, ClozeCard, WordInContextCard, FeedbackPanel, type FeedbackState } from "./ExerciseCards";

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

const MODE_LABELS: Record<PracticeMode, string> = {
  "pt-nl": "Portugees → Nederlands",
  "nl-pt": "Nederlands → Portugees",
  context: "Woorden in zinnen",
  mixed: "Gemengde oefening",
};

/** Runs one free, unlimited practice session in a chosen mode over a word
 * set. No hearts, no forced progression — every question already shows
 * full context (word + example sentence + audio), and after answering the
 * feedback panel always shows the example sentence + translation, correct
 * or not, so the word is reinforced in context every time. */
export function PracticeSession({
  title,
  wordSet,
  mode,
  onExit,
  onAnswer,
  onSessionComplete,
  onChangeMode,
}: {
  title: string;
  wordSet: Word[];
  mode: PracticeMode;
  onExit: () => void;
  onAnswer: (wordId: string, correct: boolean, kind: ExerciseKind) => void;
  onSessionComplete?: () => void;
  onChangeMode?: () => void;
}) {
  const { speak } = useTTS();
  const [items, setItems] = useState<PracticeItem[]>(() => buildPracticeItems(wordSet, mode));
  const [sessionKey, setSessionKey] = useState(0);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [message, setMessage] = useState("");
  const [mistakeWordIds, setMistakeWordIds] = useState<string[]>([]);
  const [completedFired, setCompletedFired] = useState(false);

  const current = items[index];
  const done = index >= items.length;

  useEffect(() => {
    if (done && !completedFired) {
      setCompletedFired(true);
      onSessionComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const options = useMemo(() => {
    if (!current) return [];
    if (current.kind === "source-to-target") return buildOptions(current.word, "target");
    if (current.kind === "target-to-source") return buildOptions(current.word, "source");
    if (current.kind === "sentence-match") return buildSentenceOptions(current.word);
    if (current.kind === "cloze") return buildClozeSentence(current.word).options;
    return buildWordInContextOptions(current.word);
  }, [current]);

  const clozeSentence = useMemo(() => {
    if (!current || current.kind !== "cloze") return "";
    return buildClozeSentence(current.word).blanked;
  }, [current]);

  function correctAnswerFor(kind: ExerciseKind, word: Word): string {
    if (kind === "target-to-source") return word.source;
    if (kind === "sentence-match") return word.exampleSource;
    return word.target;
  }

  function handleChoice(choice: string) {
    if (feedback !== "idle" || !current) return;
    const kind = current.kind;
    const correctAnswer = correctAnswerFor(kind, current.word);
    const correct = choice === correctAnswer;
    setSelected(choice);
    setFeedback(correct ? "correct" : "wrong");
    setCorrectCount((c) => c + (correct ? 1 : 0));
    setMessage(correct ? pickCorrectMessage() : pickWrongMessage());
    onAnswer(current.word.id, correct, kind);
    if (!correct) setMistakeWordIds((m) => [...m, current.word.id]);
    if (correct) {
      fireConfetti();
      if (kind !== "sentence-match") speak(current.word.target);
    }
  }

  function handleSkip() {
    if (feedback !== "idle" || !current) return;
    setSelected(null);
    setFeedback("wrong");
    setMessage(pickWrongMessage());
    onAnswer(current.word.id, false, current.kind);
    setMistakeWordIds((m) => [...m, current.word.id]);
  }

  function next() {
    setFeedback("idle");
    setSelected(null);
    setIndex((i) => i + 1);
  }

  function restart() {
    setItems(buildPracticeItems(wordSet, mode));
    setSessionKey((k) => k + 1);
    setIndex(0);
    setFeedback("idle");
    setSelected(null);
    setCorrectCount(0);
    setMistakeWordIds([]);
    setCompletedFired(false);
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-blue-900/70">Geen woorden gevonden.</p>
        <button onClick={onExit} className="btn-pop mt-4 rounded-full bg-emerald-600 px-6 py-2 font-bold text-white">Terug</button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((correctCount / items.length) * 100);
    const uniqueMistakes = [...new Map(mistakeWordIds.map((id) => [id, items.find((s) => s.word.id === id)?.word])).values()].filter(
      (w): w is Word => !!w
    );
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-12 text-center">
        <Mascot mood={pct >= 70 ? "excited" : "happy"} size={130} />
        <h2 className="font-display text-2xl font-bold text-blue-950">
          {pct >= 90 ? "Muito bem! 🎉" : pct >= 60 ? "Bom trabalho! 👏" : "Boa tentativa! 💪"}
        </h2>
        <p className="text-blue-900/60">
          Je had {correctCount} van {items.length} goed <span className="font-bold text-emerald-700">({pct}%)</span>.
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

  const progressPct = Math.round((index / items.length) * 100);
  const correctAnswerDisplay = correctAnswerFor(current.kind, current.word);
  const correctAnswerLang = current.kind === "target-to-source" || current.kind === "sentence-match" ? undefined : "pt-BR";

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:py-10">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onExit} aria-label="Oefening sluiten" className="btn-pop text-2xl text-blue-900/40 hover:text-blue-900">✕</button>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 sm:flex">
          {title} · {MODE_LABELS[mode]}
        </span>
        <div
          className="h-3 flex-1 overflow-hidden rounded-full bg-emerald-100"
          role="progressbar"
          aria-valuenow={index}
          aria-valuemin={0}
          aria-valuemax={items.length}
          aria-label="Voortgang in deze sessie"
        >
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-sm font-bold text-blue-900/50">{index + 1}/{items.length}</span>
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
          {current.kind === "cloze" && (
            <ClozeCard
              blanked={clozeSentence}
              options={options}
              selected={selected}
              feedback={feedback}
              correctAnswer={current.word.target}
              onChoose={handleChoice}
              onSkip={handleSkip}
              onSpeak={() => speak(current.word.exampleTarget)}
            />
          )}
          {current.kind === "word-in-context" && (
            <WordInContextCard
              word={current.word}
              options={options}
              selected={selected}
              feedback={feedback}
              correctAnswer={current.word.target}
              onChoose={handleChoice}
              onSkip={handleSkip}
              onSpeak={() => speak(current.word.exampleTarget)}
            />
          )}

          <FeedbackPanel
            feedback={feedback}
            correctMessage={message}
            wrongMessage={message}
            correctAnswerLabel={correctAnswerDisplay}
            correctAnswerLang={correctAnswerLang}
            word={current.word}
            hideExample={current.kind === "sentence-match"}
            onSpeak={() => speak(current.kind === "target-to-source" || current.kind === "source-to-target" ? current.word.target : current.word.exampleTarget)}
            onNext={next}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
