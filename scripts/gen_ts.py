# -*- coding: utf-8 -*-
import json

with open("./words_raw.json", encoding="utf-8") as f:
    data = json.load(f)

def esc(s):
    if s is None:
        return "undefined"
    return json.dumps(s, ensure_ascii=False)

lines = []
lines.append('import type { Word } from "../types";')
lines.append('')
lines.append('// Auto-generated 300-word Basiswoorden dataset (nl -> pt-BR).')
lines.append('// Level: all A1 (v1). Extend with more levels/words later without')
lines.append('// changing the Word shape.')
lines.append('export const words: Word[] = [')

for i, (cat, nl, pt, ex_nl, ex_pt, diff, phon) in enumerate(data, start=1):
    wid = f"w-{i:04d}"
    phon_field = f"    phonetic: {esc(phon)},\n" if phon else ""
    lines.append(
        "  {\n"
        f'    id: "{wid}",\n'
        f'    source: {esc(nl)},\n'
        f'    target: {esc(pt)},\n'
        '    sourceLang: "nl",\n'
        '    targetLang: "pt-BR",\n'
        f'    categoryId: "{cat}",\n'
        f'    difficulty: "{diff}",\n'
        '    level: "A1",\n'
        f'    exampleSource: {esc(ex_nl)},\n'
        f'    exampleTarget: {esc(ex_pt)},\n'
        f"{phon_field}"
        "  },"
    )

lines.append('];')
lines.append('')

out = "\n".join(lines)
with open("../src/data/words.ts", "w", encoding="utf-8") as f:
    f.write(out)

print("wrote", len(data), "words")
