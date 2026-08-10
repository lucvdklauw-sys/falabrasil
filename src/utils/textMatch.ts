/** Normalize a typed answer: lowercase, trim, collapse spaces, strip accents
 * so minor typos / missing accents don't fail a beginner learner. */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9\s]/g, "") // strip punctuation
    .trim()
    .replace(/\s+/g, " ");
}

/** Levenshtein distance for small-typo tolerance. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = tmp;
    }
  }
  return dp[n];
}

/** Accepts small typos: allows 1 edit for words up to 6 chars, 2 for longer. */
export function isCloseEnough(typed: string, answer: string): boolean {
  const a = normalize(typed);
  const b = normalize(answer);
  if (a === b) return true;
  if (a.length === 0) return false;
  const tolerance = b.length <= 6 ? 1 : 2;
  return levenshtein(a, b) <= tolerance;
}
