import { useState } from "react";
import { motion } from "framer-motion";
import type { ExerciseKind, Word } from "../types";
import type { PracticeMode } from "../utils/exercises";
import type { WriteDirection } from "./TypeCard";
import { PracticeSession } from "./PracticeSession";
import { WriteSession } from "./WriteSession";

type Screen = { kind: "pick" } | { kind: "practice"; mode: PracticeMode } | { kind: "write-pick" } | { kind: "write"; direction: WriteDirection };

const MODE_OPTIONS: { mode: PracticeMode; icon: string; title: string; sub: string }[] = [
  { mode: "pt-nl", icon: "🇧🇷", title: "Portugees → Nederlands", sub: "Zie het Portugese woord, kies de Nederlandse betekenis" },
  { mode: "nl-pt", icon: "🇳🇱", title: "Nederlands → Portugees", sub: "Zie het Nederlandse woord, kies het Portugese woord" },
  { mode: "context", icon: "🧩", title: "Woorden in zinnen", sub: "Herken het woord vanuit een Portugese zin" },
  { mode: "mixed", icon: "🔀", title: "Gemengde oefening", sub: "Alle bovenstaande vormen door elkaar" },
];

/** "Hoe wil je oefenen?" — the entry point for practising one word set
 * (a theme or a loose category). The learner picks their own mode; there
 * is no forced order and no limit on how often they can practise. Writing
 * is deliberately kept as a separate branch from the multiple-choice
 * modes, with its own direction sub-choice. */
export function PracticeModePicker({
  title,
  wordSet,
  onExit,
  onAnswer,
  onWriteAnswer,
  onSessionComplete,
}: {
  title: string;
  wordSet: Word[];
  onExit: () => void;
  onAnswer: (wordId: string, correct: boolean, kind: ExerciseKind) => void;
  onWriteAnswer: (wordId: string, correct: boolean, direction: WriteDirection) => void;
  onSessionComplete?: () => void;
}) {
  const [screen, setScreen] = useState<Screen>({ kind: "pick" });

  if (screen.kind === "practice") {
    return (
      <PracticeSession
        title={title}
        wordSet={wordSet}
        mode={screen.mode}
        onExit={onExit}
        onAnswer={onAnswer}
        onSessionComplete={onSessionComplete}
        onChangeMode={() => setScreen({ kind: "pick" })}
      />
    );
  }

  if (screen.kind === "write") {
    return (
      <WriteSession
        title={title}
        wordSet={wordSet}
        direction={screen.direction}
        onExit={onExit}
        onAnswer={onWriteAnswer}
        onSessionComplete={onSessionComplete}
        onChangeMode={() => setScreen({ kind: "pick" })}
      />
    );
  }

  if (screen.kind === "write-pick") {
    return (
      <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => setScreen({ kind: "pick" })} aria-label="Terug" className="btn-pop text-2xl text-blue-900/40 hover:text-blue-900">←</button>
          <h1 className="font-display text-xl font-bold text-blue-950">✍️ Zelf schrijven — {title}</h1>
        </div>
        <p className="mb-6 text-blue-900/60">Kies een richting om te oefenen.</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setScreen({ kind: "write", direction: "nl-pt" })}
            className="btn-pop flex items-center gap-4 rounded-3xl border-2 border-emerald-100 bg-white p-5 text-left shadow-sm hover:border-emerald-300 hover:bg-emerald-50"
          >
            <span className="text-2xl" aria-hidden="true">🇳🇱→🇧🇷</span>
            <span>
              <span className="block font-display text-lg font-bold text-blue-950">Nederlands → Braziliaans Portugees</span>
              <span className="mt-0.5 block text-sm text-blue-900/50">Typ het Portugese woord</span>
            </span>
          </button>
          <button
            onClick={() => setScreen({ kind: "write", direction: "pt-nl" })}
            className="btn-pop flex items-center gap-4 rounded-3xl border-2 border-emerald-100 bg-white p-5 text-left shadow-sm hover:border-emerald-300 hover:bg-emerald-50"
          >
            <span className="text-2xl" aria-hidden="true">🇧🇷→🇳🇱</span>
            <span>
              <span className="block font-display text-lg font-bold text-blue-950">Braziliaans Portugees → Nederlands</span>
              <span className="mt-0.5 block text-sm text-blue-900/50">Typ de Nederlandse vertaling</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onExit} aria-label="Sluiten" className="btn-pop text-2xl text-blue-900/40 hover:text-blue-900">✕</button>
        <h1 className="font-display text-xl font-bold text-blue-950">📚 Woorden oefenen — {title}</h1>
      </div>
      <p className="mb-6 text-blue-900/60">
        Hoe wil je oefenen? Kies zelf een vorm — je kunt zo vaak en zo lang oefenen als je wilt.
      </p>

      <div className="flex flex-col gap-3">
        {MODE_OPTIONS.map((opt, i) => (
          <motion.button
            key={opt.mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setScreen({ kind: "practice", mode: opt.mode })}
            className="btn-pop flex items-center gap-4 rounded-3xl border-2 border-emerald-100 bg-white p-5 text-left shadow-sm hover:border-emerald-300 hover:bg-emerald-50"
          >
            <span className="text-2xl" aria-hidden="true">{opt.icon}</span>
            <span>
              <span className="block font-display text-lg font-bold text-blue-950">{opt.title}</span>
              <span className="mt-0.5 block text-sm text-blue-900/50">{opt.sub}</span>
            </span>
          </motion.button>
        ))}

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: MODE_OPTIONS.length * 0.04 }}
          onClick={() => setScreen({ kind: "write-pick" })}
          className="btn-pop flex items-center gap-4 rounded-3xl border-2 border-yellow-200 bg-yellow-50/50 p-5 text-left shadow-sm hover:border-yellow-300 hover:bg-yellow-50"
        >
          <span className="text-2xl" aria-hidden="true">✍️</span>
          <span>
            <span className="block font-display text-lg font-bold text-blue-950">Zelf schrijven</span>
            <span className="mt-0.5 block text-sm text-blue-900/50">Typ het woord zelf — aparte oefenvorm, twee richtingen</span>
          </span>
        </motion.button>
      </div>
    </div>
  );
}
