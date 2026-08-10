/** Daily rotating tips from Tuca, the mascot — a small touch that makes the
 * dashboard feel alive instead of static. Seeded by date so it's stable
 * for the whole day rather than flickering on every visit. */
const TIPS = [
  "Oi! Ik ben Tuca, jouw taalcoach. Vamos começar! 🇧🇷",
  "Wist je dat 'obrigado' door mannen gezegd wordt, en 'obrigada' door vrouwen?",
  "Braziliaans Portugees klinkt zachter dan Europees Portugees — vooral de 's' aan het eind.",
  "Tip: oefen elke dag een klein beetje. Vijf minuten per dag werkt beter dan één keer per week een uur.",
  "'Tudo bem?' is de meest gebruikte Braziliaanse groet — letterlijk 'alles goed?'",
  "Fouten maken hoort erbij — elke fout helpt je brein het woord beter te onthouden!",
  "Brazilië heeft meer dan 210 miljoen inwoners — en jij leert nu hun taal!",
  "Probeer woorden hardop na te zeggen, ook al voelt het gek. Het went snel.",
  "'Você' wordt in Brazilië veel gebruikter dan 'tu' — heel anders dan in Portugal!",
  "Nieuwsgierig naar de uitspraak? Klik overal op het luidspreker-icoon 🔊.",
];

export function dailyTip(): string {
  const day = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < day.length; i++) hash = (hash * 31 + day.charCodeAt(i)) >>> 0;
  return TIPS[hash % TIPS.length];
}
