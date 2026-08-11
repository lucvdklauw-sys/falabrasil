import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Dialogue } from "../types";
import { useTTS } from "../hooks/useTTS";
import { ClickableText } from "./ClickableText";
import { Mascot } from "./Mascot";
import { shuffle } from "../utils/exercises";

type Phase = "dialogue" | "quiz" | "done";

/** The Dialoog screen: a realistic Brazilian everyday conversation (15-25
 * lines) with full and per-line audio + highlighting, clickable words,
 * a simple self-record practice for both roles, and a comprehension quiz. */
export function DialogueView({
  dialogue,
  onExit,
  onComplete,
}: {
  dialogue: Dialogue;
  onExit: () => void;
  onComplete: () => void;
}) {
  const { speak, speakSequence, stop, speakingIndex } = useTTS();
  const [phase, setPhase] = useState<Phase>("dialogue");
  const [showTranslations, setShowTranslations] = useState(true);

  useEffect(() => stop, [stop]);

  function playAll() {
    speakSequence(dialogue.lines.map((l) => l.pt));
  }

  if (phase === "quiz") {
    return (
      <DialogueQuiz
        dialogue={dialogue}
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
        <h2 className="font-display text-2xl font-bold text-blue-950">Dialoog afgerond! 🎭</h2>
        <p className="text-blue-900/60">Je hebt "{dialogue.titleNl}" geoefend en de vragen beantwoord.</p>
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
        <span className="text-sm font-bold uppercase tracking-wide text-blue-900/40">Dialoog</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-2xl font-extrabold text-blue-950">{dialogue.titleNl}</h1>
        <p className="mt-0.5 text-sm font-semibold text-blue-900/50">
          {dialogue.scenario} · {dialogue.speakerA} &amp; {dialogue.speakerB}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={playAll}
            className="btn-pop flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
          >
            🔊 Speel hele dialoog af
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

        <div className="mt-6 space-y-3">
          {dialogue.lines.map((line, i) => {
            const isA = line.speaker === "A";
            const name = isA ? dialogue.speakerA : dialogue.speakerB;
            return (
              <div key={i} className={`flex ${isA ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl border p-3 ${
                    isA ? "border-emerald-100 bg-emerald-50/60" : "border-blue-100 bg-blue-50/60"
                  } ${speakingIndex === i ? "ring-2 ring-yellow-400" : ""}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs font-bold ${isA ? "text-emerald-700" : "text-blue-800"}`}>{name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => speak(line.pt)}
                        aria-label="Beluister deze regel"
                        className="btn-pop rounded-full bg-white/80 p-1 text-sm hover:bg-white"
                      >
                        🔊
                      </button>
                      <RecordButton lineKey={`${dialogue.id}-${i}`} />
                    </div>
                  </div>
                  <div className="mt-1 text-base font-semibold text-blue-950">
                    <ClickableText text={line.pt} />
                  </div>
                  {showTranslations && <p className="mt-0.5 text-sm text-blue-900/50">{line.nl}</p>}
                </div>
              </div>
            );
          })}
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

/** Minimal self-record practice: hold to record your own voice for this
 * line, then play it back to compare with the native pronunciation.
 * Nothing is uploaded or persisted — it lives only in memory for this
 * session, so no consent/storage concerns beyond the mic permission itself. */
function RecordButton({ lineKey }: { lineKey: string }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startRecording() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setUnsupported(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setUnsupported(true);
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    setRecording(false);
  }

  if (unsupported) {
    return <span className="text-[10px] font-semibold text-blue-900/30">geen microfoon</span>;
  }

  return (
    <span className="flex items-center gap-1" key={lineKey}>
      <button
        onClick={recording ? stopRecording : startRecording}
        aria-label={recording ? "Stop opname" : "Neem jezelf op"}
        className={`btn-pop rounded-full p-1 text-sm ${recording ? "animate-pulse bg-red-500 text-white" : "bg-white/80 hover:bg-white"}`}
      >
        {recording ? "⏺" : "🎙️"}
      </button>
      {audioUrl && (
        <audio controls src={audioUrl} className="h-6 max-w-[110px]" />
      )}
    </span>
  );
}

function DialogueQuiz({ dialogue, onExit, onFinish }: { dialogue: Dialogue; onExit: () => void; onFinish: () => void }) {
  const questions = useMemo(() => shuffle(dialogue.questions), [dialogue]);
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
          Luistervraag {index + 1} / {questions.length}
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
