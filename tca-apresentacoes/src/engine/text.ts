// Motor local de síntese de textos (sem inteligência artificial externa).
// Regras simples e previsíveis: corrigir, dividir em ideias, enxugar,
// remover repetições e escolher os tópicos mais relevantes.
// Nunca cria informação nova: só reorganiza o que os estudantes escreveram.

const STOPWORDS = new Set(
  (
    'a o as os um uma uns umas de da do das dos em na no nas nos por pela pelo pelas pelos para pra pro com sem sob sobre ' +
    'e ou mas que se como quando onde porque pois porem também tambem muito muita muitos muitas mais menos já ja ainda ' +
    'isso isto esse essa esses essas este esta estes estas aquele aquela aquilo ele ela eles elas nós nos eu tu você voce ' +
    'vocês voces seu sua seus suas nosso nossa nossos nossas meu minha lhe lhes me te ser ter estar ir fazer ' +
    'é e foi são sao era eram está esta estão estao tem têm tinha há ha vai vão pode podem deve devem ' +
    'ao aos à às num numa entre até ate após apos cada todo toda todos todas outro outra outros outras ' +
    'qual quais quem nem não nao sim só so bem mal assim então entao gente grupo pessoas coisa coisas ' +
    'acho achamos acreditamos pensamos descobrimos aprendemos vimos percebemos sobre tipo vez vezes'
  ).split(/\s+/),
);

export const stripAccents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

// ---------------- Correções ortográficas seguras ----------------

const WORD_FIXES: Record<string, string> = {
  vc: 'você', vcs: 'vocês', voce: 'você', voces: 'vocês', pq: 'porque', tb: 'também', tbm: 'também', tambem: 'também',
  mt: 'muito', mto: 'muito', mts: 'muitos', mtas: 'muitas', q: 'que', oq: 'o que', n: 'não', nao: 'não', hj: 'hoje',
  td: 'tudo', tds: 'todos', msm: 'mesmo', qnd: 'quando', qdo: 'quando', qd: 'quando', entao: 'então', porem: 'porém',
  alem: 'além', atraves: 'através', saude: 'saúde', agua: 'água', ate: 'até', so: 'só', ja: 'já', concerteza: 'com certeza',
  derrepente: 'de repente', nois: 'nós', ninguem: 'ninguém', alguem: 'alguém', pra: 'para', pras: 'para as', pros: 'para os',
  tá: 'está', tao: 'tão', sao: 'são', familia: 'família', familias: 'famílias', dificil: 'difícil', facil: 'fácil', util: 'útil',
  varios: 'vários', varias: 'várias', numero: 'número', numeros: 'números', criancas: 'crianças', crianca: 'criança',
  midia: 'mídia', midias: 'mídias', publico: 'público', ultimos: 'últimos', ultimas: 'últimas', ultimo: 'último',
  unico: 'único', unica: 'única', proprio: 'próprio', propria: 'própria', propositos: 'propósitos', obvio: 'óbvio',
  paises: 'países', ambito: 'âmbito', indice: 'índice', indices: 'índices', fisica: 'física', fisico: 'físico',
  psicologica: 'psicológica', psicologico: 'psicológico', politica: 'política', politicas: 'políticas', economica: 'econômica',
  economico: 'econômico', tecnologica: 'tecnológica', estatistica: 'estatística', estatisticas: 'estatísticas', area: 'área',
  areas: 'áreas', especie: 'espécie', especies: 'espécies', residuos: 'resíduos', lixao: 'lixão', fome: 'fome',
  sera: 'será', serao: 'serão', voluntario: 'voluntário', saudaveis: 'saudáveis', exercicio: 'exercício', exercicios: 'exercícios',
  inicio: 'início', corrego: 'córrego', corregos: 'córregos', onibus: 'ônibus', medico: 'médico', medicos: 'médicos',
  lampada: 'lâmpada', rapido: 'rápido', rapida: 'rápida', pratico: 'prático', otimo: 'ótimo', historia: 'história',
  materia: 'matéria', materias: 'matérias', policia: 'polícia', transito: 'trânsito', eletronico: 'eletrônico',
  eletronicos: 'eletrônicos', eletronica: 'eletrônica', plastico: 'plástico', plasticos: 'plásticos', organico: 'orgânico',
  organicos: 'orgânicos', toxico: 'tóxico', toxicos: 'tóxicos', agrotoxico: 'agrotóxico', agrotoxicos: 'agrotóxicos',
  quimico: 'químico', quimicos: 'químicos', climatico: 'climático', climaticas: 'climáticas', climatica: 'climática',
  ecologico: 'ecológico', tecnologico: 'tecnológico', basico: 'básico', basica: 'básica', publicos: 'públicos',
  publicas: 'públicas', politico: 'político', historico: 'histórico', periodo: 'período', mae: 'mãe', maes: 'mães',
  hospitais: 'hospitais', veiculo: 'veículo', veiculos: 'veículos', mosquitos: 'mosquitos', analise: 'análise',
  pesquisa: 'pesquisa', obrigatorio: 'obrigatório', necessario: 'necessário', necessaria: 'necessária', saudavel: 'saudável',
  agressao: 'agressão', depressao: 'depressão', ansiedade: 'ansiedade', adolescencia: 'adolescência', amazonia: 'Amazônia',
  brasilia: 'Brasília', };

const ACRONYMS = new Set(
  'ONU OMS IBGE SUS ECA UNICEF ONG ONGS INPE IPEA FIOCRUZ USP UNESP UNICAMP BNCC TCA EUA CO2 PIB IDH OCDE UNESCO MEC INEP ANVISA PM IA TV ODS OIT OPAS ABNT CNN BBC G1 UOL SP RJ MG LGBTQIA+ DF EJA SESC SENAI'.split(
    ' ',
  ),
);

function matchCase(orig: string, repl: string) {
  if (orig.length > 1 && orig === orig.toUpperCase()) return repl.toUpperCase();
  if (orig[0] === orig[0].toUpperCase()) return repl[0].toUpperCase() + repl.slice(1);
  return repl;
}

function fixWord(w: string): string {
  const low = w.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(WORD_FIXES, low)) return matchCase(w, WORD_FIXES[low]);
  let r = low;
  // Terminações que, sem acento, não existem em português.
  if (/[a-z]cao$/.test(r)) r = r.replace(/cao$/, 'ção');
  else if (/[a-z]coes$/.test(r)) r = r.replace(/coes$/, 'ções');
  else if (/[a-z]{2}sao$/.test(r)) r = r.replace(/sao$/, 'são');
  else if (/[a-z]{2}soes$/.test(r)) r = r.replace(/soes$/, 'sões');
  else if (/[a-z]{2}encias?$/.test(r)) r = r.replace(/encia(s?)$/, 'ência$1');
  else if (/[a-z]{2}ancias?$/.test(r)) r = r.replace(/ancia(s?)$/, 'ância$1');
  else if (/[a-z]{2,}[aá]vel$/.test(r) && !/ável$/.test(r)) r = r.replace(/avel$/, 'ável');
  else if (/[a-z]{2,}ivel$/.test(r)) r = r.replace(/ivel$/, 'ível');
  else if (/[a-z]{2,}aveis$/.test(r)) r = r.replace(/aveis$/, 'áveis');
  else if (/[a-z]{2,}iveis$/.test(r)) r = r.replace(/iveis$/, 'íveis');
  else if (/^[a-z]{2,}[^aeiou]ao$/.test(r) && r.length >= 4) r = r.replace(/ao$/, 'ão');
  if (r === low) return w;
  return matchCase(w, r);
}

const URL_RE = /\b(?:https?:\/\/|www\.)[^\s]+/gi;

/** Corrige espaços, pontuação, maiúsculas e erros comuns sem mudar o sentido. */
export function fixText(input: string): string {
  if (!input) return '';
  let s = input.replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim();
  // Texto todo em MAIÚSCULAS: passa para minúsculas, mantendo siglas.
  const letters = s.replace(/[^A-Za-zÀ-ÿ]/g, '');
  if (letters.length > 12 && letters.replace(/[^A-ZÀ-Þ]/g, '').length / letters.length > 0.7) {
    s = s
      .split(/(\s+)/)
      .map((t) => (ACRONYMS.has(t.replace(/[^A-Z0-9+]/g, '')) ? t : t.toLowerCase()))
      .join('');
  }
  // Protege links.
  const urls: string[] = [];
  s = s.replace(URL_RE, (m) => {
    urls.push(m);
    return `\u0000${urls.length - 1}\u0000`;
  });
  s = s.replace(/[A-Za-zÀ-ÿ_]+/g, fixWord);
  s = s
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,;:])(?=[A-Za-zÀ-ÿ])/g, '$1 ')
    .replace(/([.!?])(?=[A-ZÀ-Ý])/g, '$1 ')
    .replace(/([!?.]){2,}/g, (m) => (m.startsWith('.') && m.length === 3 ? '…' : m[0]))
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\bi\b/g, 'e');
  // Maiúscula no início de cada frase.
  s = s.replace(/(^|[.!?]\s+|\n\s*)([a-zà-ÿ])/g, (m, pre: string, ch: string, offset: number, whole: string) => {
    if (/\b(etc|ex|sr|sra|dr|dra|prof)\.\s+$/i.test(whole.slice(0, offset + pre.length))) return m;
    return pre + ch.toUpperCase();
  });
  s = s.replace(/\u0000(\d+)\u0000/g, (_m, i) => urls[Number(i)]);
  return s;
}

// ---------------- Divisão em ideias ----------------

/** Divide um texto em frases/ideias (quebras de linha, marcadores e pontuação). */
export function splitIdeas(text: string): string[] {
  const fixed = fixText(text);
  if (!fixed) return [];
  const lines = fixed
    .split(/\n+|(?:^|\s)[•▪●◦·]\s+|^\s*[-–*]\s+|\s+[-–]\s+(?=[A-ZÀ-Ý])|(?:^|\s)\d{1,2}[).]\s+(?=[A-ZÀ-Ýa-z])/m)
    .flatMap((l) => (l ? l.split(/\n\s*[-–*]\s+/) : []));
  const out: string[] = [];
  for (const line of lines) {
    const parts = line.split(/(?<!\b(?:etc|ex|sr|sra|dr|dra|prof))(?<=[.!?;])\s+(?=[A-ZÀ-Ý0-9"“(])/);
    for (const p of parts) {
      const t = p.replace(/^[\s,;:•\-–*]+/, '').trim();
      if (t.replace(/[^A-Za-zÀ-ÿ0-9]/g, '').length >= 3) out.push(t);
    }
  }
  return out;
}

// ---------------- Enxugar frases ----------------

const FILLERS: [RegExp, string][] = [
  [/^(?:e\s+)?(?:nós|nos|a gente|o grupo|nosso grupo|eu)?\s*(?:descobrimos|descobriu|descobri|percebemos|percebeu|percebi|vimos|viu|aprendemos|aprendeu|aprendi|notamos|observamos|constatamos|identificamos|entendemos|lemos|pesquisamos e vimos)\s+(?:também\s+|tambem\s+)?que\s+/i, ''],
  [/^(?:nós|nos|a gente|o grupo|nosso grupo|eu)?\s*(?:acho|achamos|acha|acreditamos|acredita|pensamos|pensa|penso)\s+que\s+/i, 'Acreditamos que '],
  [/^(?:nós|nos|a gente|o grupo|nosso grupo)?\s*escolhe(?:mos|u)\s+(?:esse|este|o)\s+tema\s+(?:porque|pois|por causa de|por)\s+/i, ''],
  [/^(?:isso|esse assunto|este assunto|esse tema|este tema|esse problema|ele|o tema|o assunto)\s+é\s+importante(?:\s+para\s+a\s+sociedade)?\s+(?:porque|pois)\s+/i, ''],
  [/^(?:o problema|a situação)\s+(?:que\s+(?:nós\s+|a gente\s+)?(?:queremos|vamos|pretendemos)\s+investigar\s+)?é\s+(?:que\s+)?/i, ''],
  [/^(?:as\s+)?principa(?:l|is)\s+causas?\s+(?:do problema\s+)?(?:são|é)\s*:?\s*/i, ''],
  [/^(?:as\s+)?(?:principais\s+)?consequências?\s+(?:do problema\s+|disso\s+)?(?:são|é)\s*:?\s*/i, ''],
  [/^(?:a\s+)?(?:principal\s+)?conclusão\s+(?:do grupo\s+|a que chegamos\s+|que chegamos\s+)?(?:é|foi)\s+(?:que\s+)?/i, ''],
  [/^(?:nós\s+|a gente\s+)?(?:queremos|gostaríamos de|gostariamos de|pretendemos|vamos)\s+(?=fazer|criar|produzir|realizar|montar|organizar|gravar|mostrar|conscientizar|ajudar|levar|divulgar)/i, ''],
  [/^(?:porque|pois|por que|é que)\s+/i, ''],
  [/^(?:então|tipo|bom|basicamente|na verdade|enfim|além disso|também|e também|e|ah|né|daí|aí)\s*,?\s+/i, ''],
];

export function stripFillers(s: string): string {
  let r = s.trim();
  for (let i = 0; i < 3; i++) {
    const before = r;
    for (const [re, rep] of FILLERS) r = r.replace(re, rep);
    if (r === before) break;
  }
  return capitalize(r);
}

export const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const cleanEnd = (s: string) => s.replace(/[\s,;:–-]+$/, '').replace(/\.$/, '').trim();

/** Encurta uma frase sem cortar palavras ao meio, preferindo pausas naturais. */
export function shorten(s: string, max = 110): string {
  let t = s.trim();
  if (t.length <= max) return cleanEnd(t);
  t = t.replace(/\s*\([^)]{0,80}\)/g, '');
  if (t.length <= max) return cleanEnd(t);
  const cuts = [/,\s/g, /\s—\s|\s–\s/g, /:\s/g, /\s(?:porque|pois|já que|uma vez que|enquanto|mas|e também)\s/g];
  for (const re of cuts) {
    let best = -1;
    for (const m of t.matchAll(re)) {
      const i = m.index ?? -1;
      if (i >= max * 0.45 && i <= max) best = i;
    }
    if (best > 0) return cleanEnd(t.slice(0, best));
  }
  for (const m of [...t.matchAll(/\s(?:e|ou)\s/g)].reverse()) {
    const i = m.index ?? -1;
    if (i >= max * 0.55 && i <= max) return cleanEnd(t.slice(0, i));
  }
  const cut = t.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  let words = cleanEnd(cut.slice(0, sp > max * 0.5 ? sp : max)).split(' ');
  while (words.length > 3 && STOPWORDS.has(stripAccents(words[words.length - 1].toLowerCase()))) words = words.slice(0, -1);
  return cleanEnd(words.join(' ')) + '…';
}

// ---------------- Repetições ----------------

const stem = (w: string) => {
  let x = w;
  if (x.length > 4) x = x.replace(/(mente|ções|ção|coes|cao|s)$/, '');
  return x.slice(0, 6);
};

export function contentTokens(s: string): string[] {
  return stripAccents(s.toLowerCase())
    .replace(/[^a-z0-9%\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .map(stem);
}

export function similarity(a: string, b: string): number {
  const A = new Set(contentTokens(a));
  const B = new Set(contentTokens(b));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  A.forEach((t) => B.has(t) && inter++);
  const jac = inter / (A.size + B.size - inter);
  const min = Math.min(A.size, B.size);
  const overlap = min >= 4 ? inter / min : min === 3 && inter === 3 ? 1 : 0;
  return Math.max(jac, overlap * 0.9);
}

export const DUP_THRESHOLD = 0.6;

/** Remove ideias repetidas, mantendo a versão mais completa. */
export function dedupe(items: string[], against: string[] = []): string[] {
  const out: string[] = [];
  for (const it of items) {
    if (against.some((a) => similarity(a, it) >= DUP_THRESHOLD)) continue;
    const j = out.findIndex((o) => similarity(o, it) >= DUP_THRESHOLD);
    if (j === -1) out.push(it);
    else if (informativeness(it) > informativeness(out[j])) out[j] = it;
  }
  return out;
}

const informativeness = (s: string) => contentTokens(s).length + (/\d/.test(s) ? 3 : 0);

// ---------------- Relevância ----------------

export const hasNumber = (s: string) => /\d/.test(s);
export const isHypothesis = (s: string) =>
  /\b(acho|achamos|acreditamos|talvez|pode ser que|provavelmente|possivelmente|imaginamos|suspeitamos|hipótese|parece que)\b/i.test(s);

function score(s: string, keywords: Set<string>): number {
  let sc = 0;
  if (/\d/.test(s)) sc += 3;
  if (/%/.test(s)) sc += 1;
  const toks = contentTokens(s);
  toks.forEach((t) => keywords.has(t) && (sc += 1));
  if (s.length >= 35 && s.length <= 150) sc += 1;
  if (s.length < 18) sc -= 1;
  return sc;
}

/** Quando há ideias demais, escolhe as mais relevantes mantendo a ordem original. */
export function pickRelevant(items: string[], max: number, keywords: string[] = []): string[] {
  if (items.length <= max) return items;
  const kw = new Set(keywords.flatMap(contentTokens));
  const ranked = items.map((s, i) => ({ s, i, sc: score(s, kw) - i * 0.05 })).sort((a, b) => b.sc - a.sc);
  return ranked
    .slice(0, max)
    .sort((a, b) => a.i - b.i)
    .map((r) => r.s);
}

// ---------------- Enumerações ----------------

/** "falta de informação, pobreza e descaso" → três tópicos. */
export function splitEnumeration(s: string): string[] {
  const body = cleanEnd(s);
  const m = body.match(/^(.{0,60}?(?:são|é|como|inclui|incluem|envolve|entre eles|por exemplo)\s*:?\s+)(.+)$/i);
  const head = m && /:|são|como/.test(m[1]) ? m[2] : body;
  const items = head.split(/,\s*|\s+e\s+(?=[^,]+$)|;\s*/).map((x) => x.trim()).filter(Boolean);
  if (items.length < 3 || !items.every((x) => x.split(/\s+/).length <= 8)) return [s];
  // "O sono ajuda na memória, no humor e na saúde" é uma frase, não uma lista.
  const rest = items.slice(1);
  const avg = rest.reduce((a, x) => a + x.split(/\s+/).length, 0) / rest.length;
  const fragments = rest.filter((x) => /^(no|na|nos|nas|em|de|do|da|dos|das|com|para|pela|pelo|ao|à|a|o|as|os)\s/i.test(x)).length;
  const joined = rest.some((x) => /^(mas|porém|que|pois|porque|então|quando|onde|como|se)\b/i.test(x));
  if (joined || fragments >= rest.length / 2 || (avg <= 2 && items[0].split(/\s+/).length > 4)) return [s];
  return items.map(capitalize);
}

// ---------------- Pipeline completo ----------------

export interface BulletOptions {
  max?: number;
  maxLen?: number;
  /** Tópicos já usados em outros slides (para não repetir). */
  exclude?: string[];
  keywords?: string[];
  enumerations?: boolean;
}

/** Transforma um ou mais textos em tópicos curtos, sem repetição. */
export function toBullets(texts: string | string[], opts: BulletOptions = {}): string[] {
  const { max = 5, maxLen = 110, exclude = [], keywords = [], enumerations = false } = opts;
  const arr = Array.isArray(texts) ? texts : [texts];
  let ideas = arr.flatMap(splitIdeas).map(stripFillers);
  if (enumerations) ideas = ideas.flatMap(splitEnumeration);
  ideas = ideas.map((x) => shorten(x, maxLen)).filter((x) => x.replace(/[^A-Za-zÀ-ÿ0-9]/g, '').length >= 3);
  ideas = dedupe(ideas, exclude);
  return pickRelevant(ideas, max, keywords);
}

/** Uma frase-resumo (a ideia principal) de um texto. */
export function mainIdea(text: string, maxLen = 120): string {
  const ideas = splitIdeas(text).map(stripFillers);
  if (!ideas.length) return '';
  return shorten(ideas[0], maxLen);
}

export const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
export const isThin = (s: string, min = 3) => wordCount(s) < min;

// ---------------- Dados numéricos no texto ----------------

export interface FoundStat {
  value: string;
  context: string;
}

/** Encontra números escritos pelos estudantes (ex.: "45% dos jovens..."). */
export function findStats(text: string): FoundStat[] {
  const out: FoundStat[] = [];
  for (const sentence of splitIdeas(text)) {
    const m = sentence.match(/(\d{1,3}(?:[.\s]\d{3})*(?:,\d+)?|\d+(?:[.,]\d+)?)\s?(%|por cento|mil|milhões|milhão|bilhões|bilhão)?/i);
    if (!m) continue;
    // Ignora anos isolados (ex.: "em 2023").
    if (!m[2] && /^(19|20)\d{2}$/.test(m[1])) continue;
    const value = (m[1] + (m[2] ? (m[2] === '%' || /por cento/i.test(m[2]) ? '%' : ' ' + m[2]) : '')).trim();
    out.push({ value, context: shorten(stripFillers(sentence), 120) });
  }
  return out;
}

export function parseNumber(v: string): number | null {
  const t = v.replace(/\s/g, '').replace(/%$/, '');
  if (!t) return null;
  let n: number;
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) n = Number(t.replace(/\./g, '').replace(',', '.'));
  else n = Number(t.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

// ---------------- Termos-chave (para o guia) ----------------

export function keyTerms(texts: string[], n = 6, base: string[] = [], corpus: string[] = texts): string[] {
  const count = (arr: string[]) => {
    const m = new Map<string, { word: string; c: number }>();
    for (const t of arr)
      for (const raw of fixText(t).split(/[^A-Za-zÀ-ÿ-]+/)) {
        const w = raw.toLowerCase();
        if (w.length < 5 || STOPWORDS.has(stripAccents(w)) || STOPWORDS.has(w)) continue;
        const k = stem(stripAccents(w));
        const e = m.get(k);
        if (e) e.c++;
        else m.set(k, { word: w, c: 1 });
      }
    return m;
  };
  const local = count(texts);
  const global = count(corpus);
  const baseStems = new Set(base.flatMap(contentTokens));
  // Conceitos tendem a ser palavras longas e específicas (melatonina, saneamento, leptospirose).
  const verbLike = /(mos|ram|ndo|vam|iam|ava|avam|ria|rem|sse|ar|er|ir|ou|eu|iu)$/;
  return [...local.entries()]
    .map(([k, e]) => ({ word: e.word, g: global.get(k)?.c ?? 0 }))
    .filter((e) => e.word.length >= 7 && !verbLike.test(stripAccents(e.word)) && !baseStems.has(stem(stripAccents(e.word))) && !GENERIC.has(stripAccents(e.word)))
    .map((e) => ({ ...e, sc: e.word.length + (e.g >= 2 ? 3 : 0) + (e.g >= 3 ? 2 : 0) }))
    .sort((a, b) => b.sc - a.sc)
    .slice(0, n)
    .map((e) => e.word);
}

const GENERIC = new Set('primeira primeiro primeiros durante quantos quantas precisam precisa colegas atrapalha atrapalham depois através enquanto dentro desafio semana semanas verdade conseguem algumas alguns qualquer próprio própria adolescentes estudantes moradores principalmente realmente exemplo pesquisa entrevista pessoas pessoa muito muitos muitas importante problema sociedade porque quando sempre maior menor ainda grande pequeno todos todas outros outras forma tempo coisas lugar lugares parte partes nosso nossa escolhemos queremos ficamos descobrimos aprendemos acreditamos sabiamos'.split(' '));

/** Junta nomes: "Ana, Bia e Caio". */
export function joinNames(names: string[]): string {
  const n = names.filter(Boolean);
  if (n.length <= 1) return n[0] ?? '';
  return n.slice(0, -1).join(', ') + ' e ' + n[n.length - 1];
}

/** Coloca a primeira letra em minúscula (para encaixar uma frase dentro de outra). */
export const lowerFirst = (s: string) => (s && !/^[A-Z]{2,}/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
