// Guia de apresentação oral: ajuda o grupo a estudar e explicar cada slide.
import type { Deck, ProjectForm, SlideData } from '../types';
import { mediaName } from '../data/constants';
import { fieldList, fieldText } from './buildDeck';
import { reliability } from './references';
import { fixText, joinNames, keyTerms, lowerFirst, shorten } from './text';

export interface GuideSection {
  number: number;
  title: string;
  presenter: string;
  explain: string;
  important: string[];
  ownWords: string[];
  concepts: string[];
  message: string;
}

export interface GuideQuestion {
  q: string;
  answer: string;
  hasAnswer: boolean;
  tip: string;
}

export interface Guide {
  sections: GuideSection[];
  questions: GuideQuestion[];
  general: string[];
}

const NO_INFO = 'Vocês ainda não registraram essa informação. Conversem em grupo e voltem à pesquisa antes da apresentação.';

const full = (s: string, max = 420) => {
  const t = shorten(fixText(s).replace(/\n+/g, '. ').replace(/\.\s*\./g, '.'), max);
  return t && !/[.!?…]$/.test(t) ? t + '.' : t;
};

function slideTexts(s: SlideData): string[] {
  const out: string[] = [];
  s.fields.forEach((f) => (Array.isArray(f.value) ? out.push(...f.value) : f.value && out.push(f.value)));
  s.refs?.forEach((r) => out.push(r.text));
  return out.filter(Boolean);
}

export function buildGuide(f: ProjectForm, deck: Deck): Guide {
  const visible = deck.slides.filter((s) => !s.hidden);
  const members = f.members.map((m) => fixText(m.name).trim()).filter(Boolean);
  const theme = fixText(f.theme).trim() || 'o tema';
  const corpus = [f.theme, f.problem, f.whyChosen, f.whyImportant, f.affected, f.causes, f.consequences, f.dataText, f.surprising, f.learned, f.conclusion, f.intervention, f.objective, f.how, ...f.discoveries.map((d) => d.text), ...f.sources.map((s) => s.found)];
  const terms = (texts: string[], n = 4) => keyTerms(texts, n, [], corpus);

  const sections: GuideSection[] = visible.map((s, i) => {
    const presenter = members.length ? members[i % members.length] : '';
    const imp = slideTexts(s).slice(0, 6);
    const sec: GuideSection = { number: i + 1, title: s.title, presenter, explain: '', important: imp, ownWords: [], concepts: [], message: '' };
    switch (s.kind) {
      case 'cover':
        sec.explain = 'Cumprimentar os professores, apresentar os integrantes, o título e o tema do trabalho.';
        sec.important = [s.title, fieldText(s, 'subtitle'), joinNames(fieldList(s, 'members'))].filter(Boolean);
        sec.ownWords = [
          `“Olá! Nós somos ${members.length ? joinNames(members) : 'o grupo'} e o nosso TCA é sobre ${lowerFirst(theme)}.”`,
          'Falem devagar e olhem para o público. Cada integrante pode dizer o próprio nome.',
        ];
        sec.message = `Nosso trabalho é sobre ${lowerFirst(theme)}.`;
        break;
      case 'theme':
        sec.explain = 'O que é o tema, por que ele é importante para a sociedade e por que o grupo o escolheu.';
        sec.ownWords = [
          'Expliquem o tema como se estivessem conversando com alguém que nunca ouviu falar dele.',
          'Contem um exemplo do dia a dia que ajude a entender o assunto.',
          f.whyChosen.trim() ? `“Escolhemos esse tema porque ${lowerFirst(fieldList(s, 'why')[0] ?? '')}.”` : 'Combinem com o grupo por que escolheram esse tema.',
        ];
        sec.concepts = terms([f.theme, f.whyImportant, f.whyChosen], 4);
        sec.message = fieldList(s, 'context')[0] ?? `${theme} é um assunto importante para a sociedade.`;
        break;
      case 'problem':
        sec.explain = 'Qual é o problema investigado, onde ele acontece e quem é mais afetado.';
        sec.ownWords = [
          fieldText(s, 'problem') ? `“O problema que investigamos é: ${lowerFirst(fieldText(s, 'problem'))}.”` : 'Escrevam o problema em uma frase curta.',
          'Mostrem que o problema é real: digam onde ele acontece e deem um exemplo concreto.',
          'Expliquem por que essas pessoas são as mais afetadas.',
        ];
        sec.concepts = terms([f.problem, f.affected, f.whereDetail]);
        sec.message = fieldText(s, 'problem') || 'Qual é o problema que o grupo investiga?';
        break;
      case 'discoveries':
        sec.explain = 'As descobertas mais importantes da pesquisa e os dados que ajudam a entender o problema.';
        sec.ownWords = [
          'Para cada descoberta, digam de qual fonte ela veio.',
          'Ao falar de um número, expliquem o que ele significa: é muito? é pouco? comparado com o quê?',
          'Não leiam o slide: os tópicos são só lembretes do que vocês vão explicar.',
        ];
        sec.concepts = terms([...f.discoveries.map((d) => d.text), f.dataText]);
        sec.message = fieldList(s, 'items')[0] ?? 'O que o grupo descobriu de mais importante?';
        break;
      case 'data':
        sec.explain = 'O que os números mostram e de onde eles vieram.';
        sec.important = (s.chart ?? []).map((c) => `${c.display} — ${c.label}`);
        sec.ownWords = [
          'Comecem dizendo o que o gráfico mostra e qual é a fonte dos dados.',
          'Destaquem o maior e o menor valor e expliquem o que isso indica.',
        ];
        sec.concepts = terms(f.dataPoints.map((d) => d.label));
        sec.message = 'Os dados ajudam a mostrar o tamanho do problema.';
        break;
      case 'causes':
        sec.explain = 'Por que o problema acontece (causas) e o que ele provoca (consequências).';
        sec.ownWords = [
          'Usem a palavra “porque” para ligar as causas ao problema.',
          'Usem “por isso” ou “isso provoca” para explicar as consequências.',
          'Se possível, mostrem como uma causa leva a uma consequência.',
        ];
        sec.concepts = terms([f.causes, f.consequences]);
        sec.message = 'Entender as causas ajuda a pensar em soluções.';
        break;
      case 'reflection':
        sec.explain = 'A opinião e a conclusão do grupo depois da pesquisa.';
        sec.ownWords = [
          '“Depois da pesquisa, nós concluímos que…”',
          'Diferenciem o que é fato (veio das fontes) do que é opinião do grupo.',
          'Contem o que mais surpreendeu vocês e por quê.',
        ];
        sec.concepts = terms([f.conclusion, f.surprising]);
        sec.message = fieldText(s, 'conclusion') || 'Qual é a conclusão do grupo?';
        break;
      case 'intervention':
        sec.explain = 'A ação que o grupo propõe, o objetivo dela e quem ela quer alcançar.';
        sec.ownWords = [
          fieldText(s, 'proposal') ? `“Nossa proposta é: ${lowerFirst(fieldText(s, 'proposal'))}.”` : 'Descrevam a proposta em uma frase.',
          'Expliquem como a ação se liga ao problema que vocês pesquisaram.',
        ];
        sec.concepts = ['intervenção social', 'conscientização', ...terms([f.intervention, f.objective], 2)];
        sec.message = fieldText(s, 'objective') || 'Qual é o objetivo da intervenção?';
        break;
      case 'practice':
        sec.explain = 'As mídias escolhidas, como serão usadas, as etapas e os resultados esperados.';
        sec.ownWords = [
          'Expliquem por que essas mídias combinam com o público que vocês querem alcançar.',
          'Contem as etapas na ordem: primeiro…, depois…, por fim…',
          'Digam como vão saber se a ação deu certo.',
        ];
        sec.concepts = [...f.media.map((m) => mediaName(m, f.otherMedia).toLowerCase()), 'público-alvo'];
        sec.message = fieldList(s, 'results')[0] ?? 'O que esperamos alcançar com a ação?';
        break;
      case 'final':
        sec.explain = 'A mensagem principal do grupo, o que aprenderam e por que é importante agir.';
        sec.ownWords = [
          'Retomem o problema em uma frase e reforcem a mensagem principal.',
          'Agradeçam e convidem os professores para fazer perguntas.',
        ];
        sec.concepts = terms([f.learned, f.change]);
        sec.message = fieldText(s, 'message') || 'Qual é a mensagem principal do grupo?';
        break;
      case 'references':
        sec.explain = 'As fontes consultadas e por que elas são confiáveis.';
        sec.important = (s.refs ?? []).map((r) => r.text);
        sec.ownWords = ['Citem as duas ou três fontes mais importantes e digam o que encontraram em cada uma.', 'Expliquem por que confiam nessas fontes (instituição, pesquisa, especialistas).'];
        sec.concepts = ['fonte confiável', 'referência bibliográfica'];
        sec.message = 'Nossas informações vieram de fontes que podem ser conferidas.';
        break;
    }
    sec.important = sec.important.filter(Boolean).slice(0, 6);
    sec.concepts = [...new Set(sec.concepts.filter(Boolean))].slice(0, 5);
    return sec;
  });

  // ---- Perguntas que os professores podem fazer ----
  const q = (question: string, answer: string, tip: string): GuideQuestion => ({ q: question, answer: answer.trim() || NO_INFO, hasAnswer: !!answer.trim(), tip });
  const sources = f.sources.filter((s) => s.site.trim() || s.title.trim());
  const sortedSources = [...sources].sort((a, b) => Number(reliability(b) === 'institucional') - Number(reliability(a) === 'institucional'));
  const srcAnswer = sortedSources.length
    ? `Consultamos ${joinNames(sortedSources.slice(0, 3).map((s) => fixText(s.site || s.title)))}.` +
      (sortedSources[0].found.trim() ? ` Em ${fixText(sortedSources[0].site || sortedSources[0].title)}, encontramos: ${full(sortedSources[0].found, 220)}` : '')
    : '';
  const discAnswer = f.surprising.trim() ? full(f.surprising) : f.discoveries.length ? full(f.discoveries.map((d) => d.text).slice(0, 2).join(' ')) : '';
  const questions: GuideQuestion[] = [
    q('Por que vocês escolheram esse tema?', full(f.whyChosen), 'Falem também do que vocês sentiram ou observaram no dia a dia.'),
    q('Quais foram as fontes mais importantes da pesquisa?', srcAnswer, 'Saibam dizer quem produziu a informação (instituição, pesquisador ou jornal).'),
    q('O que vocês descobriram de mais relevante?', discAnswer, 'Escolham uma descoberta e expliquem por que ela é importante.'),
    q('Quais são as principais causas do problema?', full(f.causes), 'Tentem explicar a relação entre as causas e as consequências.'),
    q('Quem é mais afetado por esse problema?', full(f.affected), 'Expliquem por que essas pessoas são mais afetadas do que outras.'),
    q('Por que vocês escolheram essa intervenção?', [full(f.change, 200), full(f.objective, 200)].filter(Boolean).join(' '), 'Mostrem como a ação responde ao problema pesquisado.'),
    q(
      `Como ${f.media.length > 1 ? 'as mídias escolhidas podem' : 'a mídia escolhida pode'} ajudar a conscientizar as pessoas?`,
      [full(f.mediaWhy, 250), f.mediaMessage.trim() ? `A mensagem que queremos transmitir é: ${full(f.mediaMessage, 160)}` : ''].filter(Boolean).join(' '),
      'Pensem no público: onde essas pessoas estão e que tipo de conteúdo elas consomem?',
    ),
    q(
      'Como pretendem avaliar se a intervenção teve resultado?',
      [full(f.results, 220), full(f.mediaResult, 200)].filter(Boolean).join(' '),
      'Para pensar: como medir? Por exemplo, contar participantes, fazer perguntas antes e depois da ação ou recolher opiniões. Decidam juntos o que faz sentido para vocês.',
    ),
  ];

  const general = [
    'Estudem o assunto, e não o slide: vocês precisam conseguir explicar com as próprias palavras.',
    'Ensaiem juntos pelo menos uma vez, marcando o tempo de cada integrante.',
    'Quando não souberem uma resposta, digam com sinceridade e expliquem como poderiam descobrir.',
    'Separem fato de opinião: “a pesquisa mostra que…” é diferente de “nós acreditamos que…”.',
    members.length > 1 ? 'A divisão de slides entre os integrantes é só uma sugestão. Combinem entre vocês.' : '',
  ].filter(Boolean);

  return { sections, questions, general };
}

/** Texto do guia de um slide para as notas do orador no PowerPoint. */
export function notesFor(sec: GuideSection): string {
  return [
    sec.presenter ? `Quem apresenta (sugestão): ${sec.presenter}` : '',
    `O que explicar: ${sec.explain}`,
    sec.important.length ? `Informações importantes:\n- ${sec.important.join('\n- ')}` : '',
    sec.ownWords.length ? `Com nossas palavras:\n- ${sec.ownWords.join('\n- ')}` : '',
    sec.concepts.length ? `Conceitos para estudar: ${sec.concepts.join(', ')}` : '',
    `Mensagem principal: ${sec.message}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}
