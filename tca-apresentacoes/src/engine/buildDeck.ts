// Editor pedagógico: transforma as respostas do formulário em slides organizados.
import type { ChartDatum, Deck, ProjectForm, SlideData, SlideField } from '../types';
import { mediaName } from '../data/constants';
import { buildReferences } from './references';
import { detectTheme } from './themes';
import { DUP_THRESHOLD, findStats, fixText, joinNames, lowerFirst, mainIdea, parseNumber, similarity, toBullets } from './text';

let counter = 0;
const sid = (k: string) => `${k}-${Date.now().toString(36)}-${counter++}`;

const text = (key: string, label: string, value: string, missing?: string): SlideField => ({
  key,
  label,
  type: 'text',
  value,
  missing: value ? undefined : missing,
});
const list = (key: string, label: string, value: string[], missing?: string): SlideField => ({
  key,
  label,
  type: 'list',
  value,
  missing: value.length ? undefined : missing,
});

export const fieldValue = (s: SlideData, key: string) => s.fields.find((f) => f.key === key)?.value;
export const fieldText = (s: SlideData, key: string) => {
  const v = fieldValue(s, key);
  return Array.isArray(v) ? v.join(' ') : v ?? '';
};
export const fieldList = (s: SlideData, key: string) => {
  const v = fieldValue(s, key);
  return Array.isArray(v) ? v.filter((x) => x.trim()) : v ? [v] : [];
};

export function workTitle(f: ProjectForm) {
  return fixText(f.workTitle).trim() || fixText(f.theme).trim() || 'Nosso TCA';
}

export function autoTheme(f: ProjectForm) {
  return detectTheme([f.theme, f.workTitle, f.problem].join(' '), [f.whyImportant, f.causes, f.consequences, ...f.discoveries.map((d) => d.text)].join(' '));
}

export function buildDeck(f: ProjectForm, themeId?: string): Deck {
  const used: string[] = [];
  const keywords = [f.theme, f.problem, f.workTitle];
  const take = (items: string[]) => {
    used.push(...items);
    return items;
  };
  const B = (t: string | string[], max: number, maxLen = 110, enumerations = false) =>
    take(toBullets(t, { max, maxLen, exclude: used, keywords, enumerations }));

  const slides: SlideData[] = [];
  const warnings: string[] = [];
  const members = f.members.map((m) => fixText(m.name).trim()).filter(Boolean);
  const title = workTitle(f);
  const themeText = fixText(f.theme).trim();

  // 1. Capa
  const info = [f.school.trim(), [f.grade || '8º ano', f.className.trim()].filter(Boolean).join(' · '), f.period].filter(Boolean).join(' · ');
  slides.push({
    id: sid('cover'),
    kind: 'cover',
    title,
    fields: [
      text('subtitle', 'Tema / subtítulo', f.workTitle.trim() && themeText ? themeText : mainIdea(f.problem, 110)),
      list('members', 'Integrantes', members, 'Adicionem os nomes dos integrantes.'),
      text('group', 'Nome do grupo', fixText(f.groupName).trim()),
      text('info', 'Escola, série e turma', info),
      text('advisor', 'Prof. Orientador', fixText(f.advisor).trim()),
    ],
    notes: '',
  });

  // 2. Apresentação do tema
  const context = B(f.whyImportant, 3, 120);
  const why = B(f.whyChosen, 3, 110);
  slides.push({
    id: sid('theme'),
    kind: 'theme',
    title: 'Apresentação do tema',
    fields: [
      text('theme', 'Tema', themeText, 'Escrevam qual é o tema do TCA.'),
      list('context', 'Contextualização (por que importa)', context, 'Expliquem por que esse assunto é importante para a sociedade.'),
      list('why', 'Por que escolhemos este tema', why, 'Contem por que o grupo escolheu esse tema.'),
    ],
    notes: '',
  });

  // 3. Problema investigado
  const problem = mainIdea(f.problem, 170);
  if (problem) used.push(problem);
  const where = [...f.whereScope, ...B(f.whereDetail, 2, 70, true)];
  slides.push({
    id: sid('problem'),
    kind: 'problem',
    title: 'O problema investigado',
    fields: [
      text('problem', 'Qual é o problema?', problem, 'Descrevam o problema ou a situação que vão investigar.'),
      list('where', 'Onde acontece', where, 'Indiquem onde o problema acontece.'),
      list('affected', 'Quem é afetado', B(f.affected, 4, 80, true), 'Digam quem são as pessoas mais afetadas.'),
    ],
    notes: '',
  });

  // 4. Descobertas (+ destaques numéricos)
  const points = f.dataPoints
    .map((d) => ({ ...d, n: parseNumber(d.value), label: /^[a-zà-ÿ]/.test(d.label.trim()) ? lowerFirst(fixText(d.label).trim()) : fixText(d.label).trim() }))
    .filter((d) => d.value.trim() && d.label);
  let highlights: string[] = points.slice(0, 2).map((d) => `${d.value.trim()}${d.unit.trim() === '%' ? '%' : d.unit.trim() ? ' ' + d.unit.trim() : ''} — ${d.label}`);
  if (!highlights.length) {
    highlights = findStats([f.dataText, ...f.discoveries.map((d) => d.text)].join('\n'))
      .slice(0, 2)
      .map((s) => `${s.value} — ${s.context}`);
  }
  used.push(...highlights.map((h) => h.split(' — ')[1] ?? h));
  const discoveries = B([...f.discoveries.map((d) => d.text), f.dataText], 8, 120);
  const parts = discoveries.length > 4 ? [discoveries.slice(0, Math.ceil(discoveries.length / 2)), discoveries.slice(Math.ceil(discoveries.length / 2))] : [discoveries];
  parts.forEach((items, i) => {
    slides.push({
      id: sid('disc'),
      kind: 'discoveries',
      title: parts.length > 1 ? `O que descobrimos? (${i + 1}/${parts.length})` : 'O que descobrimos?',
      fields: [
        list('items', 'Principais descobertas', items, 'Adicionem descobertas da pesquisa na Etapa 3.'),
        list('highlights', 'Destaques numéricos (valor — explicação)', i === 0 ? highlights : []),
      ],
      notes: '',
    });
  });
  if (!discoveries.length) warnings.push('Ainda não há descobertas suficientes. Voltem à Etapa 3 e complementem a pesquisa.');

  // Slide extra com gráfico, apenas se o grupo informou 2 ou mais números
  const numeric = points.filter((d) => d.n !== null);
  if (numeric.length >= 2) {
    const units = [...new Set(numeric.map((d) => d.unit.trim()))];
    const chart: ChartDatum[] = numeric.slice(0, 6).map((d) => ({
      label: d.label.length > 60 ? d.label.slice(0, 57).trimEnd() + '…' : d.label,
      value: d.n as number,
      display: d.value.trim() + (d.unit.trim() === '%' ? '%' : ''),
    }));
    const origins = [...new Set(numeric.map((d) => fixText(d.origin).trim()).filter(Boolean))];
    slides.push({
      id: sid('data'),
      kind: 'data',
      title: 'O que os números mostram',
      chart,
      chartUnit: units.length === 1 ? units[0] : '',
      fields: [
        text('note', 'De onde vieram os dados', origins.length ? 'Fonte dos dados: ' + origins.join('; ') : 'Dados informados pelo grupo: confiram a fonte de cada número.'),
      ],
      notes: '',
    });
    if (units.length > 1) warnings.push('Os números do gráfico têm unidades diferentes. Verifiquem se faz sentido compará-los.');
  }

  // 5. Causas e consequências
  slides.push({
    id: sid('causes'),
    kind: 'causes',
    title: 'Causas e consequências',
    fields: [
      list('causes', 'Principais causas', B(f.causes, 4, 85, true), 'Escrevam as principais causas do problema.'),
      list('consequences', 'Consequências', B(f.consequences, 4, 85, true), 'Escrevam as consequências do problema.'),
    ],
    notes: '',
  });

  // 6. Reflexões
  const conclusion = mainIdea(f.conclusion, 200);
  if (conclusion) used.push(conclusion);
  slides.push({
    id: sid('reflection'),
    kind: 'reflection',
    title: 'O que pensamos sobre isso?',
    fields: [
      text('conclusion', 'Conclusão do grupo até agora', conclusion, 'Escrevam a principal conclusão do grupo.'),
      list('surprising', 'O que mais chamou a atenção', B(f.surprising, 3, 100), 'Contem o que mais surpreendeu o grupo.'),
    ],
    notes: '',
  });

  // 7. Intervenção
  const proposal = mainIdea(f.intervention, 170);
  if (proposal) used.push(proposal);
  const objective = mainIdea(f.objective, 130);
  const audience = mainIdea(f.audience, 110);
  const change = mainIdea(f.change, 130);
  used.push(objective, audience, change);
  slides.push({
    id: sid('intervention'),
    kind: 'intervention',
    title: 'Nossa proposta de intervenção',
    fields: [
      text('proposal', 'Qual ação o grupo propõe?', proposal, 'Descrevam a intervenção que o grupo propõe.'),
      text('objective', 'Objetivo', objective, 'Qual é o objetivo da ação?'),
      text('audience', 'Quem queremos alcançar', audience, 'Quem vocês querem alcançar?'),
      text('change', 'O que queremos mudar', change),
    ],
    notes: '',
  });

  // 8. Como colocar em prática
  const media = f.media.map((m) => mediaName(m, f.otherMedia));
  const steps = B(f.how, 4, 70, true);
  slides.push({
    id: sid('practice'),
    kind: 'practice',
    title: 'Como vamos colocar em prática?',
    fields: [
      list('media', 'Mídias escolhidas', media, 'Escolham pelo menos uma mídia na Etapa 5.'),
      list('strategy', 'Estratégia de comunicação', B([f.mediaHow, f.mediaWhy], steps.length >= 4 ? 1 : 2, 100)),
      list('steps', 'Etapas de realização (em ordem)', steps, 'Expliquem como vão realizar a intervenção.'),
      list('resources', 'Recursos necessários', B(f.resources, 6, 40, true)),
      list('results', 'Resultados esperados', B([f.results, f.mediaResult], 2, 100), 'Que resultados vocês esperam?'),
    ],
    notes: '',
  });

  // 9. Considerações finais
  const message = mainIdea(f.mediaMessage, 150) || mainIdea(f.change, 150) || conclusion;
  if (message) used.push(message);
  const learned = B(f.learned, 3, 140);
  let act = B(f.change, 2, 130);
  if (!act.length) act = toBullets(f.whyImportant, { max: 1, maxLen: 100 }).filter((x) => !message || similarity(x, message) < DUP_THRESHOLD);
  slides.push({
    id: sid('final'),
    kind: 'final',
    title: 'Considerações finais',
    fields: [
      text('message', 'Principal mensagem do grupo', message, 'Qual é a mensagem principal do grupo?'),
      list('learned', 'O que aprendemos', learned, 'Contem o que aprenderam na pesquisa.'),
      list('act', 'Por que é importante agir', act),
      text('thanks', 'Agradecimento', members.length ? 'Obrigado! ' + joinNames(members) : 'Obrigado!'),
    ],
    notes: '',
  });

  // 10. Referências (5 por slide)
  const refs = buildReferences(f.sources);
  const chunks = refs.length ? Array.from({ length: Math.ceil(refs.length / 5) }, (_, i) => refs.slice(i * 5, i * 5 + 5)) : [[]];
  chunks.forEach((r, i) =>
    slides.push({
      id: sid('refs'),
      kind: 'references',
      title: chunks.length > 1 ? `Fontes e referências (${i + 1}/${chunks.length})` : 'Fontes e referências',
      refs: r,
      fields: [],
      notes: '',
    }),
  );
  if (!refs.length) warnings.push('Nenhuma fonte foi registrada. Uma boa pesquisa precisa de fontes confiáveis (Etapa 4).');
  const unchecked = refs.filter((r) => r.needsCheck.length).length;
  if (unchecked) warnings.push(`${unchecked} referência(s) estão incompletas e precisam ser conferidas.`);

  slides.forEach((s, i) => {
    s.fields.forEach((fl) => {
      if (fl.missing) warnings.push(`Slide ${i + 1} (${s.title}): ${fl.missing}`);
    });
  });

  return {
    slides,
    themeId: themeId || autoTheme(f),
    generatedAt: new Date().toISOString(),
    warnings: [...new Set(warnings)],
  };
}
