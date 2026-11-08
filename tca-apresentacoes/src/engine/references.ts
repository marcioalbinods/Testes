import type { RefEntry, Source } from '../types';
import { fixText } from './text';

/** Normaliza um link digitado pelos estudantes (sem inventar nada). */
export function normalizeLink(raw: string): { url?: string; ok: boolean } {
  const t = raw.trim();
  if (!t) return { ok: false };
  if (/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(t)) return { url: t, ok: true };
  if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s]*)?$/i.test(t)) return { url: 'https://' + t, ok: true };
  return { ok: false };
}

export type Reliability = 'institucional' | 'jornalistico' | 'atencao' | 'desconhecido';

const INSTITUTIONAL = /\.(gov|gov\.br|edu|edu\.br|leg\.br|jus\.br|mp\.br|int)(\/|$)|(^|\.)(ibge|fiocruz|ipea|inpe|embrapa|unicef|unesco|who|paho|un|undp|wwf|sbp|sbc|scielo|capes|cnpq|butantan|usp|unicamp|unesp|ufrj|ufmg|unb)\.|\.org\.br(\/|$)/i;
const PRESS = /(^|\.)(g1\.globo|globo|folha\.uol|uol|estadao|bbc|cnnbrasil|agenciabrasil\.ebc|ebc|nexojornal|correiobraziliense|oglobo\.globo|veja\.abril|exame|terra|r7|cartacapital|piaui\.folha|apublica|nationalgeographic|superinteressante|super\.abril|nytimes|theguardian|reuters|apnews)\./i;
const CAUTION = /(^|\.)(brainly|wikipedia|blogspot|wordpress|medium|tiktok|instagram|facebook|youtube|youtu\.be|x|twitter|kwai|pinterest|quora|reddit|todamateria|mundoeducacao|brasilescola|resumos?)\./i;

export function reliability(s: Source): Reliability {
  const { url } = normalizeLink(s.link);
  const hay = (url ?? '') + ' ' + s.site.toLowerCase();
  let host = '';
  try {
    host = url ? new URL(url).hostname + '/' : '';
  } catch {
    host = '';
  }
  if (INSTITUTIONAL.test(host) || /\b(universidade|instituto|minist[eé]rio|secretaria|prefeitura|governo|organiza[cç][aã]o mundial|unicef|unesco|ibge|fiocruz|onu|nações unidas)\b/i.test(hay)) return 'institucional';
  if (CAUTION.test(host) || /\b(wikip[eé]dia|brainly|blog|tiktok|instagram|youtube)\b/i.test(hay)) return 'atencao';
  if (PRESS.test(host)) return 'jornalistico';
  return 'desconhecido';
}

export const RELIABILITY_LABEL: Record<Reliability, string> = {
  institucional: 'Instituição ou pesquisa: ótima fonte',
  jornalistico: 'Veículo jornalístico: boa fonte, confira a data',
  atencao: 'Atenção: confirme essa informação em outra fonte confiável',
  desconhecido: 'Confira se o site é confiável (quem escreveu? qual instituição?)',
};

/** Monta a referência apenas com os dados informados. Nada é inventado. */
export function buildReference(s: Source): RefEntry | null {
  const site = fixText(s.site).trim();
  const title = s.title.trim();
  const author = s.author.trim();
  const date = s.accessDate.trim();
  if (!site && !title && !author && !s.link.trim()) return null;
  const parts: string[] = [];
  const needs: string[] = [];
  if (author) parts.push(author.replace(/\.$/, '') + '.');
  else needs.push('autor ou instituição');
  if (title) parts.push(title.replace(/\.$/, '') + '.');
  else needs.push('título');
  if (site && site.toLowerCase() !== author.toLowerCase()) parts.push(site.replace(/\.$/, '') + '.');
  else if (!site && !author) needs.push('nome do site ou publicação');
  const link = normalizeLink(s.link);
  if (link.url) parts.push('Disponível em: ' + link.url + '.');
  else if (s.link.trim()) needs.push('link incompleto');
  if (date) parts.push('Acesso em: ' + date + '.');
  return { text: parts.join(' '), link: link.url, needsCheck: needs };
}

export function buildReferences(sources: Source[]): RefEntry[] {
  return sources
    .map(buildReference)
    .filter((r): r is RefEntry => !!r)
    .sort((a, b) => a.text.localeCompare(b.text, 'pt-BR', { sensitivity: 'base' }));
}
