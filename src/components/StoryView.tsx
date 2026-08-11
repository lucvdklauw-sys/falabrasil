import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Story } from "../types";
import { useTTS } from "../hooks/useTTS";
import { ClickableText } from "./ClickableText";
import { Mascot } from "./Mascot";
import { shuffle } from "../utils/exercises";

type Phase = "reading" | "quiz" | "done";

/** The reading screen for a theme's Verhaal (story): ~250-400 words of
 * authentic Brazilian Portuguese, read sentence-by-sentence with every
 * word clickable (LingQ-style), full-story audio with sentence
 * highlighting, followed by a short comprehension quiz. */
export function StoryView({ story, onExit, onComplete }: { story: Story; onExit: () => void; onComplete: () => void }) {
  const { speak, speakSequence, stop, speakingIndex } = useTTS();
  const [phase, setPhase] = useState<Phase>("reading");
  const [showTranslations, setShowTranslations] = useState(false);

  useEffect(() => stop, [stop]); // stop any audio on unmount

  function playAll() {
    speakSequence(story.sentences.map((s) => s.pt));
  }

  if (phase === "quiz") {
    return (
      <StoryQuiz
        story={story}
        onExit={onExit}
        onFinish={() => {
          onComplete();
          setPhase("done");
        }}
      />
    );
  }

  if (phase === "done") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-16 text-center">
        <Mascot mood="excited" size={120} />
        <h2 className="font-display text-2xl font-bold text-blue-950">Verhaal afgerond! 📖</h2>
        <p className="text-blue-900/60">Je hebt "{story.titleNl}" gelezen en de vragen beantwoord.</p>
        <button onClick={onExit} className="btn-pop rounded-full bg-emerald-600 px-6 py-3 font-bold text-white shadow-md hover:bg-emerald-700">
          Terug naar thema
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={onExit} aria-label="Sluiten" className="btn-pop text-2xl text-blue-900/40 hover:text-blue-900">✕</button>
        <span className="text-sm font-bold uppercase tracking-wide text-blue-900/40">Verhaal</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-2xl font-extrabold text-blue-950">{story.titleNl}</h1>
        <p className="font-display mt-0.5 text-lg font-bold text-emerald-700" lang="pt-BR">{story.titlePt}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={playAll}
            className="btn-pop flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
          >
            🔊 Lees hele verhaal voor
          </button>
          {speakingIndex !== null && (
            <button onClick={stop} className="btn-pop rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100">
              ⏹ Stop
            </button>
          )}
          <button
            onClick={() => setShowTranslations((s) => !s)}
            className="btn-pop rounded-full border border-blue-100 px-4 py-2 text-sm font-bold text-blue-900/70 hover:bg-blue-50"
          >
            {showTranslations ? "Verberg vertaling" : "Toon vertaling"}
          </button>
        </div>

        <p className="mt-3 text-xs text-blue-900/40">
          Tik op een <span className="underline decoration-emerald-400 decoration-2">onderstreept</span> woord voor de vertaling.
        </p>

        <div className="mt-6 space-y-3 text-lg leading-relaxed">
          {story.sentences.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <button
                onClick={() => speak(s.pt)}
                aria-label="Beluister deze zin"
                className="btn-pop mt-1 shrink-0 rounded-full bg-emerald-50 p-1.5 text-sm text-emerald-700 hover:bg-emerald-100"
              >
                🔊
              </button>
              <div>
                <ClickableText text={s.pt} highlighted={speakingIndex === i} />
                {showTranslations && <p className="mt-0.5 text-sm text-blue-900/50">{s.nl}</p>}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            stop();
            setPhase("quiz");
          }}
          className="btn-pop mt-8 w-full rounded-2xl bg-blue-900 py-3 font-bold text-white shadow-md hover:bg-blue-800"
        >
          Ga verder naar de vragen →
        </button>
      </motion.div>
    </div>
  );
}

function StoryQuiz({ story, onExit, onFinish }: { story: Story; onExit: () => void; onFinish: () => void }) {
  const questions = useMemo(() => shuffle(story.questions), [story]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const q = questions[index];
  const done = index >= questions.length;

  useEffect(() => {
    if (done) onFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (done) return null;

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correctIndex) setCorrectCount((c) => c + 1);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:py-10">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={onExit} aria-label="Sluiten" className="btn-pop text-2xl text-blue-900/40 hover:text-blue-900">✕</button>
        <span className="text-sm font-bold uppercase tracking-wide text-blue-900/40">
          Begripsvraag {index + 1} / {questions.length}
        </span>
      </div>
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-blue-950">{q.questionNl}</h2>
        <div className="mt-5 flex flex-col gap-3">
          {q.options.map((opt, i) => {
            let style = "border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50";
            if (selected !== null) {
              if (i === q.correctIndex) style = "border-emerald-500 bg-emerald-50 text-emerald-900";
              else if (i === selected) style = "border-red-400 bg-red-50 text-red-800";
              else style = "border-gray-100 bg-white opacity-60";
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={selected !== null}
                className={`btn-pop rounded-2xl border-2 px-4 py-3 text-left font-semibold shadow-sm transition-colors ${style}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <button
            onClick={() => {
              setSelected(null);
              setIndex((idx) => idx + 1);
            }}
            autoFocus
            className="btn-pop mt-5 w-full rounded-2xl bg-blue-900 py-3 font-bold text-white shadow-md hover:bg-blue-800"
          >
            Volgende
          </button>
        )}
      </div>
      <p className="mt-3 text-center text-sm text-blue-900/40">Score tot nu toe: {correctCount} / {index + (selected !== null ? 1 : 0)}</p>
    </div>
  );
}
