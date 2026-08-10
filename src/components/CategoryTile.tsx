import { motion } from "framer-motion";
import type { Category, CategoryStats } from "../types";
import { ProgressBar } from "./ProgressBar";

export function CategoryTile({
  category,
  stats,
  onClick,
}: {
  category: Category;
  stats: CategoryStats;
  onClick: () => void;
}) {
  const pct = stats.wordsTotal === 0 ? 0 : Math.round((stats.wordsLearned / stats.wordsTotal) * 100);
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      aria-label={`${category.nameNl}, ${pct}% voltooid, ${stats.wordsLearned} van ${stats.wordsTotal} woorden geleerd${stats.mistakes > 0 ? `, ${stats.mistakes} fouten` : ""}`}
      className="btn-pop flex flex-col rounded-3xl border border-emerald-100 bg-white p-4 text-left shadow-sm hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div aria-hidden="true" className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${category.color} text-2xl shadow-inner`}>
          {category.icon}
        </div>
        <span aria-hidden="true" className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{pct}%</span>
      </div>
      <h3 className="font-display mt-3 text-base font-bold text-blue-950">{category.nameNl}</h3>
      <p className="text-xs text-blue-900/50">{category.namePt}</p>
      <div className="mt-3">
        <ProgressBar value={stats.wordsLearned} max={stats.wordsTotal} />
      </div>
      <div aria-hidden="true" className="mt-2 flex items-center justify-between text-[11px] font-medium text-blue-900/50">
        <span>{stats.wordsLearned}/{stats.wordsTotal} woorden</span>
        {stats.mistakes > 0 && <span className="text-red-600">{stats.mistakes} fouten</span>}
      </div>
    </motion.button>
  );
}
