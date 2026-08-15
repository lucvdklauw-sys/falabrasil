import { normalize } from "../utils/textMatch";
import type { Word } from "../types";

const ACCENTS = ["ã", "õ", "á", "é", "í", "ó", "ú", "â", "ê", "ô", "ç", "à"];

export type TypeFeedback = "idle" | "correct" | "wrong";
export type WriteDirection = "nl-pt" | "pt-nl";

/** The typing exercise card, shared by the standalone Schrijftest and the
 * per-theme/category "Zelf schrijven" practice mode. Supports both
 * directions: NL→PT (type the Portuguese word) and PT→NL (type the Dutch
 * word) — spelling is checked with light typo/accent tolerance, and
 * capitalisation is ignored (see utils/textMatch.ts). */
export function TypeCard({
  word,
  direction,
  typed,
  setTyped,
  feedback,
  onSubmit,
  onSkip,
  inputRef,
  onSpeak,
}: {
  word: Word;
  direction: WriteDirection;
  typed: string;
  setTyped: (v: string) => void;
  feedback: TypeFeedback;
  onSubmit: () => void;
  onSkip: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSpeak: () => void;
}) {
  function insertAccent(ch: string) {
    inputRef.current?.focus();
    setTyped(typed + ch);
  }

  const prompt = direction === "nl-pt" ? word.source : word.target;
  const promptLang = direction === "nl-pt" ? undefined : "pt-BR";
  const label = direction === "nl-pt" ? "Typ het Portugese woord voor:" : "Typ de Nederlandse vertaling van:";
  const placeholder = direction === "nl-pt" ? "Typ het Portugese woord..." : "Typ de Nederlandse vertaling...";

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-900/40">{label}</p>
        {direction === "pt-nl" && (
          <button onClick={onSpeak} aria-label="Beluister uitspraak" className="btn-pop rounded-full bg-emerald-50 p-1.5 text-base text-emerald-700 hover:bg-emerald-100">
            🔊
          </button>
        )}
      </div>
      <h2 className="font-display mt-2 text-3xl font-extrabold text-blue-950" lang={promptLang}>{prompt}</h2>
      <div className="mt-6">
        <label htmlFor="type-answer" className="sr-only">{label}</label>
        <input
          id="type-answer"
          ref={inputRef}
          value={typed}
          disabled={feedback !== "idle"}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && normalize(typed).length > 0) onSubmit();
          }}
          placeholder={placeholder}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full rounded-2xl border-2 border-emerald-200 px-4 py-3 text-lg font-semibold text-blue-950 outline-none focus:border-emerald-500"
        />

        {feedback === "idle" && direction === "nl-pt" && (
          <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Speciale tekens invoegen">
            {ACCENTS.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => insertAccent(ch)}
                className="btn-pop min-w-[34px] rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-sm font-bold text-emerald-800 hover:bg-emerald-100"
                aria-label={`Voeg teken ${ch} toe`}
              >
                {ch}
              </button>
            ))}
          </div>
        )}

        {feedback === "idle" && (
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={onSubmit}
              disabled={normalize(typed).length === 0}
              className="btn-pop flex-1 rounded-2xl bg-emerald-600 py-3 font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-40"
            >
              Controleer
            </button>
            <button onClick={onSkip} className="btn-pop text-sm font-semibold text-blue-900/40 hover:text-blue-900/70">
              Weet niet
            </button>
          </div>
        )}
        {direction === "nl-pt" && (
          <button onClick={onSpeak} aria-label="Beluister uitspraak" className="btn-pop mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            🔊 Beluister uitspraak
          </button>
        )}
      </div>
    </div>
  );
}
