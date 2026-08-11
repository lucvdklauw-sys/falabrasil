import type { CourseModule } from "../types";

// Module 1: the five foundational everyday-life themes. Each module groups
// exactly 5 themes, followed by a Module Exam covering ~70% of their words.
// New modules can be appended here later (toekomstbestendig / future-proof).
export const modules: CourseModule[] = [
  {
    id: "module-1",
    titleNl: "Module 1 — Het dagelijks leven",
    order: 1,
    themeIds: ["familie", "huis", "eten", "werk", "school"],
  },
];

export function moduleForTheme(themeId: string): CourseModule | undefined {
  return modules.find((m) => m.themeIds.includes(themeId));
}
