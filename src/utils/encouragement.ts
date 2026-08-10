/** Varied, friendly mascot messages so feedback never feels robotic or
 * repetitive. Dutch copy, occasional PT flourish for immersion. */
export const CORRECT_MESSAGES = [
  "Muito bem! 🎉",
  "Isso mesmo! Precies goed.",
  "Perfeito! Helemaal correct.",
  "Je bent een natuurtalent!",
  "Boa! Ga zo door.",
  "Excelente! Dat zit er nu in.",
  "Ótimo! Weer eentje onthouden.",
];

export const WRONG_MESSAGES = [
  "Bijna! Volgende keer lukt het vast.",
  "Geen zorgen, oefening baart kunst.",
  "Não tem problema — dit onthoud je nu extra goed.",
  "Deze komt zo weer voorbij, dan lukt het!",
  "Rustig aan, iedereen leert op zijn eigen tempo.",
];

export function pickCorrectMessage(): string {
  return CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];
}

export function pickWrongMessage(): string {
  return WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];
}
