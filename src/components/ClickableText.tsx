import { useState } from "react";
import { segmentText } from "../utils/glossaryResolve";

/** Renders Portuguese text where every recognizable word is clickable —
 * tapping it shows the Dutch meaning inline (and an example sentence when
 * we have one), "Zoals LingQ": read without needing to leave the page for
 * a dictionary. Falls back to plain, non-interactive text for anything we
 * can't resolve (punctuation, unknown proper nouns, etc.). */
export function ClickableText({
  text,
  className = "",
  highlighted = false,
}: {
  text: string;
  className?: string;
  highlighted?: boolean;
}) {
  const segments = segmentText(text);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <span
      className={`${className} ${highlighted ? "rounded-lg bg-yellow-200/70 px-1 shadow-sm" : ""}`}
      lang="pt-BR"
    >
      {segments.map((seg, i) => {
        if (!seg.clickable || !seg.gloss) {
          return <span key={i}>{seg.text}</span>;
        }
        const isOpen = openIdx === i;
        return (
          <span key={i} className="relative inline-block">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className={`rounded px-0.5 underline decoration-emerald-400 decoration-2 underline-offset-2 transition-colors hover:bg-emerald-50 ${
                isOpen ? "bg-emerald-100" : ""
              }`}
            >
              {seg.text}
            </button>
            {isOpen && (
              <span
                role="tooltip"
                className="absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-[13rem] -translate-x-1/2 rounded-xl border border-emerald-100 bg-white p-2.5 text-left text-sm normal-case text-blue-950 shadow-lg"
              >
                <span className="block font-bold text-emerald-700">{seg.gloss.nl}</span>
                {seg.gloss.note && (
                  <span className="mt-1 block text-xs italic text-blue-900/60" lang="pt-BR">
                    {seg.gloss.note}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setOpenIdx(null)}
                  aria-label="Sluiten"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-900 text-[10px] font-bold text-white shadow"
                >
                  ✕
                </button>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
