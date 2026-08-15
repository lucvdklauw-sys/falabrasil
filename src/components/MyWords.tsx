import { useDeferredValue, useMemo, useState } from "react";
import { words } from "../data/words";
import { categories } from "../data/categories";
import type { WordProgress, WordStatus } from "../types";
import { useTTS } from "../hooks/useTTS";
import { wordStatus, WORD_STATUS_LABELS, WORD_STATUS_COLORS } from "../utils/wordStatus";

type FilterMode = "alle" | "bekend" | "moeilijk" | "nieuw" | "favorieten";

const FILTERS: { mode: FilterMode; label: string }[] = [
  { mode: "alle", label: "Alle woorden" },
  { mode: "bekend", label: "Bekende woorden" },
  { mode: "moeilijk", label: "Moeilijke woorden" },
  { mode: "nieuw", label: "Nieuwe woorden" },
  { mode: "favorieten", label: "⭐ Favorieten" },
];

function matchesFilter(mode: FilterMode, status: WordStatus, wp: WordProgress): boolean {
  if (mode === "alle") return true;
  if (mode === "bekend") return status === "bekend" || status === "beheerst";
  if (mode === "moeilijk") return status === "moeilijk";
  if (mode === "nieuw") return status === "nieuw";
  if (mode === "favorieten") return wp.favorite;
  return true;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Nog nooit geoefend";
  const d = new Date(iso);
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

/** "Mijn woorden": browse every word with its individual learning status,
 * correct/wrong tallies and last-practiced date — the ground truth behind
 * the headline counters shown elsewhere in the app. */
export function MyWords({
  getWordProgress,
  toggleFavorite,
}: {
  getWordProgress: (id: string) => WordProgress;
  toggleFavorite: (id: string) => void;
}) {
  const { speak } = useTTS();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [categoryId, setCategoryId] = useState<string>("alle");
  const [filter, setFilter] = useState<FilterMode>("alle");

  const rows = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return words
      .map((w) => ({ word: w, wp: getWordProgress(w.id), status: wordStatus(getWordProgress(w.id)) }))
      .filter(({ word, wp, status }) => {
        if (categoryId !== "alle" && word.categoryId !== categoryId) return false;
        if (!matchesFilter(filter, status, wp)) return false;
        if (q && !word.source.toLowerCase().includes(q) && !word.target.toLowerCase().includes(q)) return false;
        return true;
      });
  }, [deferredQuery, categoryId, filter, getWordProgress]);

  const counts = useMemo(() => {
    const all = words.map((w) => ({ wp: getWordProgress(w.id), status: wordStatus(getWordProgress(w.id)) }));
    return {
      bekend: all.filter((x) => x.status === "bekend" || x.status === "beheerst").length,
      moeilijk: all.filter((x) => x.status === "moeilijk").length,
      nieuw: all.filter((x) => x.status === "nieuw").length,
    };
  }, [getWordProgress]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="font-display text-2xl font-bold text-blue-950">📚 Mijn woorden</h1>
      <p className="mt-1 text-blue-900/50">
        {counts.bekend} bekend · {counts.moeilijk} moeilijk · {counts.nieuw} nog nieuw — van {words.length} woorden totaal.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="mywords-search" className="sr-only">Zoek een woord</label>
        <input
          id="mywords-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek een woord (NL of PT)..."
          className="flex-1 rounded-2xl border-2 border-emerald-100 px-4 py-2.5 outline-none focus:border-emerald-400"
        />
        <label htmlFor="mywords-category" className="sr-only">Filter op categorie</label>
        <select
          id="mywords-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-2xl border-2 border-emerald-100 px-4 py-2.5 outline-none focus:border-emerald-400"
        >
          <option value="alle">Alle categorieën</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.nameNl}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter woorden">
        {FILTERS.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            aria-pressed={filter === mode}
            className={`btn-pop rounded-full px-4 py-1.5 text-sm font-bold ${
              filter === mode ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto self-center text-sm text-blue-900/40" aria-live="polite">{rows.length} woorden</span>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <div className="hidden grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-2 border-b border-emerald-50 bg-emerald-50/50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-blue-900/40 sm:grid">
          <span>Portugees</span>
          <span>Nederlands</span>
          <span>Status</span>
          <span>Goed</span>
          <span>Fout</span>
          <span>Laatst geoefend</span>
        </div>
        {rows.map(({ word, wp, status }) => (
          <div
            key={word.id}
            className="grid grid-cols-2 items-center gap-2 border-b border-emerald-50 px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_1fr_auto_auto_auto_auto]"
          >
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => speak(word.target)}
                aria-label={`Beluister ${word.target}`}
                className="btn-pop rounded-full bg-emerald-50 p-1 text-sm text-emerald-700 hover:bg-emerald-100"
              >
                🔊
              </button>
              <span className="font-bold text-blue-950" lang="pt-BR">{word.target}</span>
            </div>
            <span className="text-blue-900/70">{word.source}</span>
            <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-bold ${WORD_STATUS_COLORS[status]}`}>
              {WORD_STATUS_LABELS[status]}
            </span>
            <span className="text-sm font-semibold text-emerald-700 sm:text-center">{wp.timesCorrect}</span>
            <span className="text-sm font-semibold text-red-600 sm:text-center">{wp.timesWrong}</span>
            <div className="flex items-center justify-between gap-2 sm:justify-start">
              <span className="text-xs text-blue-900/40">{formatDate(wp.lastReviewedAt)}</span>
              <button
                onClick={() => toggleFavorite(word.id)}
                aria-pressed={wp.favorite}
                aria-label={wp.favorite ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
                className="btn-pop text-lg"
              >
                {wp.favorite ? "⭐" : "☆"}
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="px-4 py-10 text-center text-blue-900/40">Geen woorden gevonden.</p>}
      </div>
    </div>
  );
}
