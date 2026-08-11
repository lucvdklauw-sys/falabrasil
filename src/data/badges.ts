import type { Badge } from "../types";

// A deliberately small, mature badge set — no childish animation, just a
// clean acknowledgement of real milestones. More can be appended later.
export const badges: Badge[] = [
  {
    id: "eerste-stap",
    titleNl: "Eerste stap",
    descriptionNl: "Je eerste Portugese woord geleerd.",
    icon: "🌱",
  },
  {
    id: "eerste-thema",
    titleNl: "Thema voltooid",
    descriptionNl: "Een volledig thema afgerond: woorden, verhaal, dialoog en quiz.",
    icon: "📘",
  },
  {
    id: "verhalenlezer",
    titleNl: "Verhalenlezer",
    descriptionNl: "Drie verhalen gelezen en de begripsvragen beantwoord.",
    icon: "📖",
  },
  {
    id: "week-streak",
    titleNl: "Vlammend",
    descriptionNl: "Zeven dagen op rij geoefend.",
    icon: "🔥",
  },
  {
    id: "module-1",
    titleNl: "Module 1 voltooid",
    descriptionNl: "Het module-examen gehaald met minimaal 80%.",
    icon: "🏆",
  },
  {
    id: "driehonderd",
    titleNl: "Woordkenner",
    descriptionNl: "Alle 300 woorden geleerd.",
    icon: "💯",
  },
];
