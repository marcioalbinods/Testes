export interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  passMin: number;
  /** id da pergunta → acertou? */
  results: Record<string, boolean>;
}

/** Correção local (usada só no modo demonstração e nos testes). O modo real corrige no servidor. */
export function gradeQuiz(
  answers: Record<string, string>,
  key: Record<string, string>,
  passMin: number,
): QuizResult {
  const results: Record<string, boolean> = {};
  let score = 0;
  for (const [qid, correct] of Object.entries(key)) {
    const ok = answers[qid] === correct;
    results[qid] = ok;
    if (ok) score++;
  }
  const total = Object.keys(key).length;
  return { score, total, passed: total > 0 && score >= passMin, passMin, results };
}

/** Embaralhamento determinístico (mesma ordem para a mesma semente) — evita "decorar a letra". */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
