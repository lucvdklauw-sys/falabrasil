import type { WordGloss } from "../types";
import { words as allWords } from "../data/words";
import { glossary } from "../data/glossary";

// Build a lookup from the 300-word dataset: normalized Portuguese target
// word -> { nl: source word, note: the word's example sentence as a bonus
// context hint }. This means every word already taught in the app is
// automatically clickable in Stories and Dialogues with zero extra content
// work — only story-specific vocabulary needs the shared glossary.
const wordLookup = new Map<string, WordGloss>();
for (const w of allWords) {
  const key = w.target.toLowerCase();
  if (!wordLookup.has(key)) {
    wordLookup.set(key, { nl: w.source, note: w.exampleTarget });
  }
}

// Known multi-word phrases (e.g. "por favor"), longest first, checked
// before falling back to single-word lookup.
const PHRASES = Object.keys(glossary)
  .filter((k) => k.includes(" "))
  .sort((a, b) => b.split(" ").length - a.split(" ").length);

export interface TextSegment {
  text: string; // exact original substring (preserves case/punctuation)
  clickable: boolean;
  gloss?: WordGloss;
}

function normalize(w: string): string {
  return w.toLowerCase();
}

function resolveWord(word: string): WordGloss | undefined {
  const key = normalize(word);
  return wordLookup.get(key) ?? glossary[key];
}

/** Splits Portuguese text into segments for rendering as clickable words.
 * Words (letters/numbers) become clickable spans with a resolved gloss;
 * everything else (spaces, punctuation) is passed through untouched. Known
 * multi-word phrases (e.g. "por favor") are grouped into one clickable
 * segment so they gloss as a unit instead of two disconnected words. */
export function segmentText(text: string): TextSegment[] {
  const tokens = text.match(/[\p{L}\p{N}]+|[^\p{L}\p{N}]+/gu) ?? [];
  const isWordTok = (t: string) => /[\p{L}\p{N}]/u.test(t);
  const segments: TextSegment[] = [];
  let i = 0;

  while (i < tokens.length) {
    if (!isWordTok(tokens[i])) {
      segments.push({ text: tokens[i], clickable: false });
      i++;
      continue;
    }

    // Try each known phrase: does the token sequence starting at i spell it
    // out (ignoring whitespace tokens in between)?
    let matched: { end: number; text: string; gloss: WordGloss } | null = null;
    for (const phrase of PHRASES) {
      const words = phrase.split(" ");
      let j = i;
      let wordIdx = 0;
      let ok = true;
      while (wordIdx < words.length) {
        while (j < tokens.length && !isWordTok(tokens[j])) j++; // skip whitespace
        if (j >= tokens.length || normalize(tokens[j]) !== words[wordIdx]) {
          ok = false;
          break;
        }
        j++;
        wordIdx++;
      }
      if (ok) {
        matched = { end: j, text: tokens.slice(i, j).join(""), gloss: glossary[phrase] };
        break;
      }
    }

    if (matched) {
      segments.push({ text: matched.text, clickable: true, gloss: matched.gloss });
      i = matched.end;
      continue;
    }

    const gloss = resolveWord(tokens[i]);
    segments.push({ text: tokens[i], clickable: !!gloss, gloss });
    i++;
  }

  return segments;
}
