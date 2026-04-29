/** Converte unidades do GET /curriculum/me no formato de progresso por período usado no mapa. */
export function curriculumUnitsToPeriodProgress(
  units: Array<{
    period: { id: string };
    lessons: Array<{
      id: string;
      progress: { stars: number; bestPercentage: number } | null;
    }>;
  }>
): Record<string, { completed: boolean; stars: number; correct: number; total: number }> {
  const out: Record<string, { completed: boolean; stars: number; correct: number; total: number }> = {};
  for (const u of units) {
    const main =
      u.lessons.find((l) => l.id.endsWith("_main")) ??
      u.lessons.find((l) => l.progress != null) ??
      u.lessons[0];
    if (!main?.progress) continue;
    const p = main.progress;
    const pct = p.bestPercentage ?? 0;
    const completed = p.stars >= 1 || pct >= 70;
    if (!completed) continue;
    out[u.period.id] = {
      completed: true,
      stars: p.stars,
      correct: Math.max(0, Math.round((pct / 100) * 10)),
      total: 10,
    };
  }
  return out;
}
