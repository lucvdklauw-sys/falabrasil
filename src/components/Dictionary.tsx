import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { words } from "../data/words";
import { categories } from "../data/categories";
import type { WordProgress } from "../types";
import { useTTS } from "../hooks/useTTS";
import { isKnown, wordStatus, WORD_STATUS_LABELS, WORD_STATUS_COLORS } from "../utils/wordStatus";

type FilterMode = "alle" | "geleerd" | "nog-oefenen" | "favorieten";

export function Dictionary({
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
  const [openWordId, setOpenWordId] = useState<string | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const dialogHeadingRef = useRef<HTMLHeadingElement>(null);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return words.filter((w) => {
      if (categoryId !== "alle" && w.categoryId !== categoryId) return false;
      const wp = getWordProgress(w.id);
      if (filter === "geleerd" && !isKnown(wp)) return false;
      if (filter === "nog-oefenen" && isKnown(wp)) return false;
      if (filter === "favorieten" && !wp.favorite) return false;
      if (q && !w.source.toLowerCase().includes(q) && !w.target.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [deferredQuery, categoryId, filter, getWordProgress]);

  const openWord = words.find((w) => w.id === openWordId) ?? null;

  function openDetail(id: string, trigger: HTMLElement) {
    lastFocusedRef.current = trigger;
    setOpenWordId(id);
  }

  function closeDetail() {
    setOpenWordId(null);
    lastFocusedRef.current?.focus();
  }

  useEffect(() => {
    if (!openWord) return;
    dialogHeadingRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDetail();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openWord]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="font-display text-2xl font-bold text-blue-950">Woordenboek</h1>
      <p className="mt-1 text-blue-900/50">Zoek en bekijk alle 300 woorden.</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="dict-search" className="sr-only">Zoek een woord</label>
        <input
          id="dict-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek een woord (NL of PT)..."
          className="flex-1 rounded-2xl border-2 border-emerald-100 px-4 py-2.5 outline-none focus:border-emerald-400"
        />
        <label htmlFor="dict-category" className="sr-only">Filter op categorie</label>
        <select
          id="dict-category"
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
        {(
          [
            ["alle", "Alle"],
            ["geleerd", "Geleerd"],
            ["nog-oefenen", "Nog oefenen"],
            ["favorieten", "⭐ Favorieten"],
          ] as [FilterMode, string][]
        ).map(([mode, label]) => (
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
        <span className="ml-auto self-center text-sm text-blue-900/40" aria-live="polite">{filtered.length} woorden</span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((w) => {
          const wp = getWordProgress(w.id);
          return (
            <button
              key={w.id}
              onClick={(e) => openDetail(w.id, e.currentTarget)}
              className="btn-pop flex items-center justify-between rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-left shadow-sm hover:border-emerald-300 hover:shadow-md"
            >
              <div>
                <p className="font-bold text-blue-950" lang="pt-BR">{w.target}</p>
                <p className="text-xs text-blue-900/50">{w.source}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {wp.favorite && <span aria-hidden="true" className="text-amber-500">⭐</span>}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${WORD_STATUS_COLORS[wordStatus(wp)]}`}>
                  {WORD_STATUS_LABELS[wordStatus(wp)]}
                </span>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-blue-900/40">Geen woorden gevonden.</p>
        )}
      </div>

      <AnimatePresence>
        {openWord && (
          <motion.div
            className="fixed inset-0 z-40 flex items-end justify-center bg-blue-950/40 p-0 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetail}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="dict-dialog-title"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2
                    id="dict-dialog-title"
                    ref={dialogHeadingRef}
                    tabIndex={-1}
                    className="font-display text-3xl font-extrabold text-blue-950 outline-none"
                    lang="pt-BR"
                  >
                    {openWord.target}
                  </h2>
                  <p className="text-blue-900/50">{openWord.source}</p>
                </div>
                <button
                  onClick={() => toggleFavorite(openWord.id)}
                  className="btn-pop text-2xl"
                  aria-pressed={getWordProgress(openWord.id).favorite}
                  aria-label={getWordProgress(openWord.id).favorite ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
                >
                  {getWordProgress(openWord.id).favorite ? "⭐" : "☆"}
                </button>
              </div>
              <button
                onClick={() => speak(openWord.target)}
                aria-label={`Beluister uitspraak van ${openWord.target}`}
                className="btn-pop mt-4 flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 font-bold text-emerald-700 hover:bg-emerald-100"
              >
                🔊 Beluister uitspraak
              </button>
              {openWord.phonetic && (
                <p className="mt-2 text-sm text-blue-900/40">Uitspraak: {openWord.phonetic}</p>
              )}
              <div className="mt-4 rounded-2xl bg-blue-50 p-4">
                <p className="font-semibold text-blue-950" lang="pt-BR">{openWord.exampleTarget}</p>
                <p className="mt-1 text-sm text-blue-900/60">{openWord.exampleSource}</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-blue-900/50">
                <span>Categorie: {categories.find((c) => c.id === openWord.categoryId)?.nameNl}</span>
                <span className="capitalize">{openWord.difficulty}</span>
              </div>
              <button
                onClick={closeDetail}
                className="btn-pop mt-5 w-full rounded-2xl bg-blue-900 py-3 font-bold text-white"
              >
                Sluiten
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
