// Fitness tracking only: stored measurements are user-entered observations, not medical assessments.
export const BODY_FIELDS = [
  { key: 'waistCm', label: 'Derék (cm)' },
  { key: 'chestCm', label: 'Mellkas (cm)' },
  { key: 'hipsCm', label: 'Csípő (cm)' },
  { key: 'armCm', label: 'Felkar (cm)' },
  { key: 'thighCm', label: 'Comb (cm)' }
];
export function parseMeasurement(input) {
  const number = (raw, min, max, required = false) => {
    if (raw == null || String(raw).trim() === '') {
      if (required) throw new Error('A testsúly megadása kötelező.');
      return null;
    }
    const n = Number(String(raw).replace(',', '.'));
    if (!Number.isFinite(n) || n < min || n > max) throw new Error('A mért érték kívül esik a megengedett tartományon.');
    return Math.round(n * 10) / 10;
  };
  const measurement = { weightKg: number(input.weightKg, 20, 600, true) };
  for (const { key } of BODY_FIELDS) measurement[key] = number(input[key], 10, 400);
  return measurement;
}
export function bodySummary(measurements) {
  const sorted = [...(measurements || [])].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted.at(-1) || null;
  const previous = sorted.length > 1 ? sorted.at(-2) : null;
  return {
    latest, previous,
    changeKg: previous && latest ? Math.round((latest.weightKg - previous.weightKg) * 10) / 10 : null,
    history: sorted.map(({ id, date, weightKg }) => ({ id, day: date.slice(0, 10), value: weightKg }))
  };
}
