import { motion } from "framer-motion";
import type { View } from "../App";

export function Navbar({
  hearts,
  maxHearts,
  points,
  streak,
  learned,
  total,
  view,
  onNavigate,
}: {
  hearts: number;
  maxHearts: number;
  points: number;
  streak: number;
  learned: number;
  total: number;
  view: View;
  onNavigate: (v: View) => void;
}) {
  const navItem = (v: View, label: string, icon: string) => (
    <button
      onClick={() => onNavigate(v)}
      aria-label={label}
      aria-current={view === v ? "page" : undefined}
      className={`btn-pop flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold transition-colors sm:px-4 ${
        view === v
          ? "bg-emerald-600 text-white shadow-md"
          : "text-blue-900/70 hover:bg-emerald-50"
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6">
        <button
          onClick={() => onNavigate("dashboard")}
          aria-label="FalaBrasil — terug naar startpagina"
          className="font-display flex items-center gap-2 text-lg font-extrabold tracking-tight text-blue-950 sm:text-xl"
        >
          <span className="text-2xl" aria-hidden="true">🦜</span>
          <span className="hidden xs:inline sm:inline">
            <span className="text-emerald-600">Fala</span>
            <span className="text-yellow-600">Bra</span>
            <span className="text-blue-800">sil</span>
          </span>
        </button>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Hoofdnavigatie">
          {navItem("dashboard", "Start", "🏠")}
          {navItem("dictionary", "Woordenboek", "📖")}
          {navItem("stats", "Statistieken", "📊")}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3" role="group" aria-label="Jouw voortgang">
          <div className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-sm font-bold text-red-700 sm:px-3">
            <span aria-hidden="true">❤️</span>
            <motion.span key={hearts} initial={{ scale: 1.4 }} animate={{ scale: 1 }}>
              <span className="sr-only">Levens: </span>
              {hearts}/{maxHearts}
            </motion.span>
          </div>
          <div className="hidden items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700 sm:flex">
            <span aria-hidden="true">⭐</span>
            <motion.span key={points} initial={{ scale: 1.4 }} animate={{ scale: 1 }}>
              <span className="sr-only">Punten: </span>
              {points}
            </motion.span>
          </div>
          <div className="hidden items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-700 sm:flex">
            <span aria-hidden="true">🔥</span>
            <span>
              <span className="sr-only">Streak: </span>
              {streak}
            </span>
          </div>
          <div className="hidden items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 md:flex">
            <span aria-hidden="true">📚</span>
            <span>
              <span className="sr-only">Woorden geleerd: </span>
              {learned}/{total}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
