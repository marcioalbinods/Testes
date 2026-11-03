import type { Phase } from './types';
import { GLOSSARY } from './glossary';

/** Verifica a coerência do conteúdo. Retorna a lista de problemas (vazia = tudo certo). */
export function validateContent(phases: Phase[], keys: Record<number, Record<string, string>>): string[] {
  const problems: string[] = [];
  const glossaryIds = new Set(GLOSSARY.map((g) => g.id));
  phases.forEach((p, idx) => {
    const where = `Fase ${p.id}`;
    if (p.id !== idx + 1) problems.push(`${where}: numeração fora de ordem (esperado ${idx + 1})`);
    const expectedModule = Math.ceil(p.id / 4);
    if (p.module !== expectedModule) problems.push(`${where}: módulo ${p.module}, esperado ${expectedModule}`);
    if (!p.title || !p.objective) problems.push(`${where}: título/objetivo ausente`);
    if (p.skills.length < 2) problems.push(`${where}: poucas habilidades`);
    if (p.materials.length < 1) problems.push(`${where}: materiais ausentes`);
    if (p.steps.length < 5) problems.push(`${where}: tutorial com menos de 5 passos`);
    if (p.checklist.filter((c) => c.required).length < 3) problems.push(`${where}: checklist com menos de 3 itens obrigatórios`);
    const ids = p.checklist.map((c) => c.id);
    if (new Set(ids).size !== ids.length) problems.push(`${where}: ids de checklist repetidos`);
    if (p.hints.length !== 3 || p.hints.some((h) => h.length < 20)) problems.push(`${where}: precisa de 3 dicas completas`);
    if (p.troubleshooting.length < 3) problems.push(`${where}: "Se não funcionar" com menos de 3 itens`);
    if (p.quiz.length < 4) problems.push(`${where}: teste com menos de 4 perguntas`);
    if (p.quizPassMin < 1 || p.quizPassMin > p.quiz.length) problems.push(`${where}: quizPassMin inválido`);
    if (p.completionCriteria.length < 3) problems.push(`${where}: critérios de conclusão incompletos`);
    if (!p.extraChallenge) problems.push(`${where}: desafio extra ausente`);
    if (!p.reflection.prompt) problems.push(`${where}: reflexão ausente`);
    if (!p.expectedResult) problems.push(`${where}: resultado esperado ausente`);
    if (p.prerequisites.some((r) => r >= p.id)) problems.push(`${where}: pré-requisito posterior à fase`);
    if (p.id > 1 && !p.prerequisites.includes(p.id - 1)) problems.push(`${where}: deve exigir a fase anterior`);
    p.glossary.forEach((g) => {
      if (!glossaryIds.has(g)) problems.push(`${where}: termo de glossário inexistente "${g}"`);
    });
    const k = keys[p.id];
    if (!k) {
      problems.push(`${where}: gabarito ausente`);
      return;
    }
    const qids = p.quiz.map((q) => q.id);
    if (new Set(qids).size !== qids.length) problems.push(`${where}: ids de pergunta repetidos`);
    p.quiz.forEach((q) => {
      if (q.options.length < 3) problems.push(`${where} ${q.id}: menos de 3 alternativas`);
      if (!k[q.id]) problems.push(`${where} ${q.id}: sem resposta no gabarito`);
      else if (!q.options.some((o) => o.id === k[q.id])) problems.push(`${where} ${q.id}: gabarito aponta para alternativa inexistente`);
    });
    Object.keys(k).forEach((qid) => {
      if (!qids.includes(qid)) problems.push(`${where}: gabarito tem pergunta inexistente ${qid}`);
    });
  });
  GLOSSARY.forEach((g) => {
    if (g.phase < 1 || g.phase > phases.length) problems.push(`Glossário "${g.id}": fase inválida`);
  });
  return problems;
}
