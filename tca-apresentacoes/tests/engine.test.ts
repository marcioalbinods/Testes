import { describe, expect, it } from 'vitest';
import { fixText, toBullets, dedupe, splitEnumeration, findStats, shorten, mainIdea } from '../src/engine/text';
import { buildDeck } from '../src/engine/buildDeck';
import { buildGuide } from '../src/engine/guide';
import { layoutDeck } from '../src/engine/layout';
import { themeById } from '../src/engine/themes';
import { buildReference } from '../src/engine/references';
import { exampleForm } from '../src/data/example';
import { emptyForm, uid } from '../src/data/constants';

describe('correções', () => {
  it('corrige erros comuns sem mudar o sentido', () => {
    expect(fixText('a poluicao do rio nao e boa pq mata os peixes')).toBe('A poluição do rio não e boa porque mata os peixes');
    expect(fixText('vc sabia que a violencia tbm afeta a saude?')).toBe('Você sabia que a violência também afeta a saúde?');
    expect(fixText('O LIXO ESTA EM TODO LUGAR NA CIDADE SEGUNDO A ONU')).toContain('ONU');
  });
  it('não mexe em links', () => {
    expect(fixText('veja www.site.gov.br/informacao')).toContain('www.site.gov.br/informacao');
  });
});

describe('síntese', () => {
  it('transforma parágrafo em tópicos e tira enrolação', () => {
    const b = toBullets('Nós descobrimos que o lixo eletrônico tem metais pesados. Também descobrimos que pouca gente recicla. Basicamente, os metais contaminam o solo e a água dos rios da região.');
    expect(b.length).toBe(3);
    expect(b[0]).toBe('O lixo eletrônico tem metais pesados');
  });
  it('mantém hipóteses como hipóteses', () => {
    const b = toBullets('A gente acha que as pessoas não sabem onde descartar.');
    expect(b[0]).toMatch(/^Acreditamos que/);
  });
  it('remove repetições', () => {
    const d = dedupe(['A luz da tela atrapalha a melatonina, o hormônio do sono', 'Descobrimos que a luz da tela pode atrapalhar a produção de melatonina, que é o hormônio do sono']);
    expect(d.length).toBe(1);
  });
  it('separa enumerações', () => {
    expect(splitEnumeration('Falta de informação, pobreza, descaso das autoridades e consumo exagerado')).toHaveLength(4);
  });
  it('encurta frases longas', () => {
    const s = shorten('O desmatamento da Amazônia aumentou muito nos últimos anos, principalmente por causa da criação de gado e da expansão da soja, segundo dados do instituto', 100);
    expect(s.length).toBeLessThanOrEqual(101);
  });
  it('acha números', () => {
    expect(findStats('Segundo a pesquisa, 45% dos jovens dormem mal. Em 2023 houve mudanças.')[0].value).toBe('45%');
  });
});

describe('referências', () => {
  it('não inventa e sinaliza o que falta', () => {
    const r = buildReference({ id: '1', site: 'IBGE', title: '', link: 'ibge.gov.br', author: '', accessDate: '', found: '' })!;
    expect(r.text).toBe('IBGE. Disponível em: https://ibge.gov.br.');
    expect(r.needsCheck).toEqual(['autor ou instituição', 'título']);
  });
});

function report(form: ReturnType<typeof emptyForm>) {
  const deck = buildDeck(form);
  const guide = buildGuide(form, deck);
  const pages = layoutDeck(deck.slides, themeById(deck.themeId), form.theme);
  return { deck, guide, pages };
}

describe('apresentação', () => {
  it('exemplo gera 8 a 12 slides sem texto demais', () => {
    const { deck, guide, pages } = report(exampleForm());
    console.log('TEMA:', deck.themeId);
    deck.slides.forEach((s, i) => {
      console.log(`\n#${i + 1} ${s.kind} — ${s.title}`);
      s.fields.forEach((f) => console.log('  ', f.key, '=>', JSON.stringify(f.value)));
      s.chart && console.log('   chart', JSON.stringify(s.chart));
      s.refs && console.log('   refs', JSON.stringify(s.refs));
    });
    console.log('AVISOS', deck.warnings);
    console.log('PERGUNTAS', guide.questions.map((q) => q.q + ' => ' + q.answer.slice(0, 90)));
    expect(deck.slides.length).toBeGreaterThanOrEqual(8);
    expect(deck.slides.length).toBeLessThanOrEqual(12);
    expect(guide.questions.length).toBeGreaterThanOrEqual(5);
    expect(guide.questions.length).toBeLessThanOrEqual(8);
    expect(pages.length).toBe(deck.slides.length);
    // nenhum slide com mais de ~90 palavras
    pages.forEach((p, i) => {
      const words = p.filter((x) => x.t === 'text').map((x: any) => x.paras.map((q: any) => q.text).join(' ')).join(' ').split(/\s+/).length;
      expect(words, 'slide ' + (i + 1)).toBeLessThan(145);
    });
  });
  it('trabalho quase vazio não inventa conteúdo', () => {
    const f = emptyForm();
    f.theme = 'Poluição dos rios';
    f.members = [{ id: uid(), name: 'Ana' }];
    const { deck } = report(f);
    expect(deck.themeId).toBe('natureza');
    const disc = deck.slides.find((s) => s.kind === 'discoveries')!;
    expect(disc.fields[0].value).toEqual([]);
    expect(deck.warnings.length).toBeGreaterThan(3);
  });
  it('detecta temas', () => {
    const t = (theme: string) => { const f = emptyForm(); f.theme = theme; return buildDeck(f).themeId; };
    expect(t('Cyberbullying nas redes sociais')).toBe('serio');
    expect(t('Fake news e inteligência artificial')).toBe('tecnologia');
    expect(t('Ansiedade e saúde mental na adolescência')).toBe('saude');
    expect(t('Racismo e desigualdade no Brasil')).toBe('sociedade');
    expect(t('A evasão escolar')).toBe('educacao');
    expect(t('Desmatamento da Amazônia')).toBe('natureza');
  });
});

describe('guia', () => {
  it('sugere conceitos da própria pesquisa', () => {
    const f = exampleForm();
    const deck = buildDeck(f);
    const g = buildGuide(f, deck);
    g.sections.forEach((s) => console.log(s.title, '=>', s.concepts.join(', ')));
    expect(g.sections.some((s) => s.concepts.includes('melatonina'))).toBe(true);
  });
});
