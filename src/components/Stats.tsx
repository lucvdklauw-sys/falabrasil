import { motion } from "framer-motion";
import type { DailyActivity, UserProgress } from "../types";
import { badges } from "../data/badges";
import { levelFromXp, xpIntoLevel } from "../utils/gamification";

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-blue-900/50">
        <span className="text-xl" aria-hidden="true">{icon}</span>
        {label}
      </div>
      <p className="font-display mt-2 text-3xl font-extrabold text-blue-950">{value}</p>
      {sub && <p className="mt-1 text-xs text-blue-900/40">{sub}</p>}
    </div>
  );
}

function WeekChart({ history }: { history: DailyActivity[] }) {
  const days: DailyActivity[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = history.find((h) => h.date === key);
    days.push(found ?? { date: key, wordsReviewed: 0, correct: 0, wrong: 0 });
  }
  const max = Math.max(1, ...days.map((d) => d.wordsReviewed));

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
      <h3 className="font-display font-bold text-blue-950">Voortgang (laatste 14 dagen)</h3>
      <p className="sr-only">
        Totaal {days.reduce((s, d) => s + d.wordsReviewed, 0)} woorden geoefend in de afgelopen 14 dagen.
      </p>
      <div className="mt-4 flex h-40 items-end gap-1.5" aria-hidden="true">
        {days.map((d) => {
          const h = Math.max(4, (d.wordsReviewed / max) * 100);
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.5 }}
                className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400"
                title={`${d.date}: ${d.wordsReviewed} woorden`}
              />
              <span className="text-[9px] text-blue-900/30">{d.date.slice(8)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Stats({
  progress,
  totalLearned,
  totalWords,
  overallAccuracy,
}: {
  progress: UserProgress;
  totalLearned: number;
  totalWords: number;
  overallAccuracy: number;
}) {
  const totalReviewed = progress.history.reduce((s, h) => s + h.wordsReviewed, 0);
  const todayCount = progress.history.find((h) => h.date === new Date().toISOString().slice(0, 10))?.wordsReviewed ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="font-display text-2xl font-bold text-blue-950">Statistieken</h1>
      <p className="mt-1 text-blue-900/50">Jouw voortgang in het Braziliaans Portugees.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard icon="📚" label="Totaal geleerd" value={`${totalLearned}/${totalWords}`} />
        <StatCard icon="🎯" label="Juist percentage" value={`${overallAccuracy}%`} />
        <StatCard icon="🔁" label="Geoefende woorden" value={`${totalReviewed}`} />
        <StatCard icon="⭐" label="Punten (XP)" value={`${progress.points}`} />
        <StatCard
          icon="🏅"
          label="Niveau"
          value={`${levelFromXp(progress.points)}`}
          sub={`${xpIntoLevel(progress.points).current}/${xpIntoLevel(progress.points).needed} XP tot volgend niveau`}
        />
        <StatCard icon="🔥" label="Streak" value={`${progress.streak} dagen`} />
        <StatCard
          icon="🎯"
          label="Dagelijks doel"
          value={`${Math.min(todayCount, progress.dailyGoal)}/${progress.dailyGoal}`}
          sub="woorden vandaag"
        />
      </div>

      <div className="mt-6">
        <WeekChart history={progress.history} />
      </div>

      <div className="mt-6 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h3 className="font-display font-bold text-blue-950">Badges</h3>
        <p className="mt-1 text-sm text-blue-900/50">
          {progress.earnedBadgeIds.length} van {badges.length} behaald
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {badges.map((b) => {
            const earned = progress.earnedBadgeIds.includes(b.id);
            return (
              <div
                key={b.id}
                className={`flex items-start gap-3 rounded-2xl border p-3 ${
                  earned ? "border-yellow-300 bg-yellow-50" : "border-gray-100 bg-gray-50 opacity-50"
                }`}
              >
                <span className="text-2xl" aria-hidden="true">{b.icon}</span>
                <span>
                  <span className="block text-sm font-bold text-blue-950">{b.titleNl}</span>
                  <span className="block text-xs text-blue-900/50">{b.descriptionNl}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
