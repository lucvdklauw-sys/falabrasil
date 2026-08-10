import { motion } from "framer-motion";

export function ProgressBar({ value, max, colorClass = "bg-emerald-500" }: { value: number; max: number; colorClass?: string }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-100">
      <motion.div
        className={`h-full rounded-full ${colorClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}
