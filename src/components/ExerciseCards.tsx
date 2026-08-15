import { useEffect } from "react";
import type { Word } from "../types";

export type FeedbackState = "idle" | "correct" | "wrong";

export function QuizCard({
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
export function SentenceCard({
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


/** "Vul het ontbrekende woord in" — the target word is blanked out of its
 * own Portuguese example sentence; the learner picks the right word from
 * 4 options, practising it inside real context instead of in isolation. */
export function ClozeCard({
  blanked,
  options,
  selected,
  feedback,
  correctAnswer,
  onChoose,
  onSkip,
  onSpeak,
}: {
  blanked: string;
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
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-900/40">Welk woord ontbreekt?</p>
      <div className="mt-2 flex items-start gap-3 rounded-2xl bg-blue-50 p-4">
        <p className="font-display flex-1 text-xl font-bold text-blue-950" lang="pt-BR">{blanked}</p>
        <button onClick={onSpeak} aria-label="Beluister zin" className="btn-pop shrink-0 rounded-full bg-white p-2 text-xl text-emerald-700 shadow-sm hover:bg-emerald-50">
          🔊
        </button>
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
              <span lang="pt-BR">{opt}</span>
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

/** "Woord herkennen in context" — given the Dutch meaning, the learner
 * picks which Portuguese word in the (unblanked) sentence carries that
 * meaning, from 4 real-word options. */
export function WordInContextCard({
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
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-900/40">Welk woord betekent:</p>
      <h2 className="font-display mt-2 text-3xl font-extrabold text-blue-950">{word.source}</h2>
      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-blue-50 p-4">
        <p className="flex-1 text-base font-semibold text-blue-950" lang="pt-BR">{word.exampleTarget}</p>
        <button onClick={onSpeak} aria-label="Beluister zin" className="btn-pop shrink-0 rounded-full bg-white p-2 text-xl text-emerald-700 shadow-sm hover:bg-emerald-50">
          🔊
        </button>
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
              <span lang="pt-BR">{opt}</span>
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

/** Shared post-answer feedback panel — shown after EVERY question in the
 * free-choice practice modes (not just wrong ones): correct/wrong state,
 * the correct answer, an audio replay button, and the Portuguese example
 * sentence with its Dutch translation. This is what lets the learner
 * absorb the word in context every single time, win or lose. */
export function FeedbackPanel({
  feedback,
  correctMessage,
  wrongMessage,
  correctAnswerLabel,
  correctAnswerLang,
  word,
  hideExample,
  onSpeak,
  onNext,
  nextLabel = "Volgende",
}: {
  feedback: FeedbackState;
  correctMessage: string;
  wrongMessage: string;
  correctAnswerLabel: string;
  correctAnswerLang?: string;
  word: Word;
  hideExample?: boolean;
  onSpeak: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  if (feedback === "idle") return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`mt-5 rounded-2xl p-4 ${feedback === "correct" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold">{feedback === "correct" ? `✅ ${correctMessage}` : `❌ ${wrongMessage}`}</p>
            <button
              onClick={onSpeak}
              aria-label="Beluister uitspraak opnieuw"
              className="btn-pop rounded-full bg-white/70 p-1.5 text-base hover:bg-white"
            >
              🔊
            </button>
          </div>
          {feedback === "wrong" && (
            <p className="mt-1 text-sm">
              Het juiste antwoord is: <strong lang={correctAnswerLang}>{correctAnswerLabel}</strong>
            </p>
          )}
          {!hideExample && (
            <p className="mt-2 text-sm italic">
              <span lang="pt-BR">{word.exampleTarget}</span>
              <br />
              <span className="not-italic text-xs opacity-70">{word.exampleSource}</span>
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onNext}
        autoFocus
        className="btn-pop mt-4 w-full rounded-2xl bg-blue-900 py-3 font-bold text-white shadow-md hover:bg-blue-800"
      >
        {nextLabel}
      </button>
    </div>
  );
}
