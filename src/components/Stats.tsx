import { motion } from "framer-motion";
import type { CategoryStats, DailyActivity, ThemeProgress, UserProgress } from "../types";
import { badges } from "../data/badges";
import { modules } from "../data/modules";
import { categories } from "../data/categories";
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

function ThemeBar({ nameNl, icon, pct, done }: { nameNl: string; icon: string; pct: number; done: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-blue-950">
          <span aria-hidden="true">{icon}</span> {nameNl} {done && <span aria-hidden="true">✅</span>}
        </span>
        <span className="font-bold text-blue-900/50">{pct}%</span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-emerald-50">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </div>
  );
}

export function Stats({
  progress,
  totalLearned,
  totalDifficult,
  totalWords,
  overallAccuracy,
  categoryStats,
}: {
  progress: UserProgress;
  totalLearned: number;
  totalDifficult: number;
  totalWords: number;
  overallAccuracy: number;
  categoryStats: Record<string, CategoryStats>;
}) {
  const totalReviewed = progress.history.reduce((s, h) => s + h.wordsReviewed, 0);
  const todayCount = progress.history.find((h) => h.date === new Date().toISOString().slice(0, 10))?.wordsReviewed ?? 0;
  const overallPct = totalWords === 0 ? 0 : Math.round((totalLearned / totalWords) * 100);

  const module1 = modules[0];
  const themesCompleted = module1
    ? module1.themeIds.filter((id) => {
        const tp: ThemeProgress | undefined = progress.themeProgress[id];
        return !!tp && tp.wordsDone && tp.storyDone && tp.dialogueDone && tp.quizDone;
      }).length
    : 0;

  const quizScores = module1 ? module1.themeIds.map((id) => progress.themeProgress[id]?.quizScore ?? 0).filter((s) => s > 0) : [];
  const avgQuizScore = quizScores.length ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : null;
  const examScores = Object.values(progress.moduleProgress).map((m) => m.examScore).filter((s) => s > 0);
  const avgExamScore = examScores.length ? Math.round(examScores.reduce((a, b) => a + b, 0) / examScores.length) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="font-display text-2xl font-bold text-blue-950">📊 Mijn voortgang</h1>
      <p className="mt-1 text-blue-900/50">Jouw voortgang in het Braziliaans Portugees.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard icon="📚" label="Woorden bekend" value={`${totalLearned}/${totalWords}`} sub={`${overallPct}% totale voortgang`} />
        <StatCard icon="⚠️" label="Moeilijke woorden" value={`${totalDifficult}`} />
        <StatCard icon="🎓" label="Thema's voltooid" value={module1 ? `${themesCompleted}/${module1.themeIds.length}` : "0/0"} />
        <StatCard icon="🎯" label="Juist percentage" value={`${overallAccuracy}%`} />
        {avgQuizScore !== null && <StatCard icon="📝" label="Gem. themaquizscore" value={`${avgQuizScore}%`} />}
        {avgExamScore !== null && <StatCard icon="🏆" label="Gem. examenscore" value={`${avgExamScore}%`} />}
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

      {module1 && (
        <div className="mt-6 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <h3 className="font-display font-bold text-blue-950">Voortgang per thema — {module1.titleNl}</h3>
          <div className="mt-4 flex flex-col gap-4">
            {module1.themeIds.map((id) => {
              const cat = categories.find((c) => c.id === id);
              const stats = categoryStats[id];
              const tp = progress.themeProgress[id];
              if (!cat || !stats) return null;
              const pct = stats.wordsTotal === 0 ? 0 : Math.round((stats.wordsLearned / stats.wordsTotal) * 100);
              const done = !!tp && tp.wordsDone && tp.storyDone && tp.dialogueDone && tp.quizDone;
              return <ThemeBar key={id} nameNl={cat.nameNl} icon={cat.icon} pct={pct} done={done} />;
            })}
          </div>
        </div>
      )}

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
