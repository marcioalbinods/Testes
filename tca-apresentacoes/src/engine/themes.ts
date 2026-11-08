import { stripAccents } from './text';

export type Motif = 'leaves' | 'circuit' | 'cross' | 'bands' | 'people' | 'books' | 'orbs';

export interface SlideTheme {
  id: string;
  name: string;
  description: string;
  motif: Motif;
  dark: boolean;
  /** Cores em hexadecimal sem "#". */
  bg: string;
  surface: string;
  sunk: string;
  ink: string;
  muted: string;
  accent: string;
  accent2: string;
  accent3: string;
  onAccent: string;
  line: string;
  link: string;
  keywords: string[];
}

export const THEMES: SlideTheme[] = [
  {
    id: 'natureza',
    name: 'Natureza',
    description: 'Verdes e formas de folhas, para meio ambiente e sustentabilidade.',
    motif: 'leaves',
    dark: false,
    bg: 'F3F8F0', surface: 'FFFFFF', sunk: 'E3EFDC', ink: '12301F', muted: '4C6656',
    accent: '2E7D4F', accent2: '8CC152', accent3: 'E9A93B', onAccent: 'FFFFFF', line: 'C9DDBE', link: '1D6B9A',
    keywords: ['meio ambiente', 'ambiental', 'lixo', 'residuo', 'reciclagem', 'reciclar', 'poluicao', 'desmatamento', 'floresta', 'amazonia', 'clima', 'climatica', 'aquecimento', 'queimada', 'agua', 'rio', 'oceano', 'mar', 'plastico', 'sustentab', 'animal', 'animais', 'fauna', 'flora', 'natureza', 'enchente', 'seca', 'energia', 'agrotoxico', 'saneamento', 'esgoto', 'ecolog', 'biodivers', 'extincao', 'carbono'],
  },
  {
    id: 'tecnologia',
    name: 'Digital',
    description: 'Fundo escuro com linhas de circuito, para tecnologia e internet.',
    motif: 'circuit',
    dark: true,
    bg: '0D1530', surface: '16224A', sunk: '1B2A58', ink: 'EEF2FF', muted: 'A9B5DA',
    accent: '38CFFF', accent2: '8B6CFF', accent3: 'FF5FA2', onAccent: '0D1530', line: '2B3B70', link: '7FDBFF',
    keywords: ['tecnologia', 'internet', 'rede social', 'redes sociais', 'celular', 'smartphone', 'tela', 'jogo', 'games', 'videogame', 'inteligencia artificial', 'algoritmo', 'digital', 'online', 'fake news', 'desinformacao', 'dados pessoais', 'privacidade', 'aplicativo', 'computador', 'robo', 'tiktok', 'instagram', 'youtube', 'influenciador', 'apostas', 'bets'],
  },
  {
    id: 'saude',
    name: 'Saúde',
    description: 'Visual limpo e científico, em azul e verde-água.',
    motif: 'cross',
    dark: false,
    bg: 'F3F9FC', surface: 'FFFFFF', sunk: 'E0F0F6', ink: '0D2A3C', muted: '4D6878',
    accent: '0B7FA8', accent2: '2EBF9B', accent3: 'FF7A66', onAccent: 'FFFFFF', line: 'C5DEE8', link: '0B6FA8',
    keywords: ['saude', 'doenca', 'dengue', 'vacina', 'virus', 'alimentacao', 'obesidade', 'nutricao', 'saude mental', 'ansiedade', 'depressao', 'suicidio', 'droga', 'alcool', 'cigarro', 'vape', 'tabaco', 'sono', 'exercicio', 'sedentarismo', 'hospital', 'medic', 'gravidez', 'higiene', 'diabetes', 'covid', 'epidemia', 'autoestima', 'estresse', 'transtorno'],
  },
  {
    id: 'serio',
    name: 'Sóbrio',
    description: 'Linguagem visual séria e respeitosa, para temas de violência.',
    motif: 'bands',
    dark: true,
    bg: '1B2130', surface: '252C3D', sunk: '2C3447', ink: 'F2F1EC', muted: 'B4B8C4',
    accent: 'D2AE72', accent2: '7F8FB2', accent3: 'C47A6E', onAccent: '1B2130', line: '3A435A', link: 'E3C48F',
    keywords: ['violencia', 'bullying', 'cyberbullying', 'assedio', 'abuso', 'feminicidio', 'crime', 'arma', 'guerra', 'agressao', 'homicidio', 'trafico', 'seguranca publica', 'estupro', 'maus-tratos', 'maus tratos', 'exploracao', 'ataque', 'policia'],
  },
  {
    id: 'sociedade',
    name: 'Sociedade',
    description: 'Roxo e laranja com pontos que lembram pessoas, para desigualdade e direitos.',
    motif: 'people',
    dark: false,
    bg: 'FBF7F2', surface: 'FFFFFF', sunk: 'F1E8F5', ink: '2A1A3C', muted: '6A5A78',
    accent: '7A3E9D', accent2: 'F08A3C', accent3: '2BA39C', onAccent: 'FFFFFF', line: 'E3D6E8', link: '6B3FA0',
    keywords: ['desigualdade', 'pobreza', 'fome', 'racismo', 'preconceito', 'discriminacao', 'machismo', 'genero', 'mulher', 'inclusao', 'deficiencia', 'acessibilidade', 'moradia', 'refugiado', 'imigra', 'direitos', 'lgbt', 'trabalho infantil', 'indigena', 'quilombola', 'renda', 'desemprego', 'populacao de rua', 'situacao de rua', 'idosos', 'etarismo', 'xenofobia', 'intolerancia', 'cidadania'],
  },
  {
    id: 'educacao',
    name: 'Educação e cultura',
    description: 'Índigo com amarelo e formas de livros, para escola, leitura e cultura.',
    motif: 'books',
    dark: false,
    bg: 'F6F5FF', surface: 'FFFFFF', sunk: 'E8E6FB', ink: '1D1A4A', muted: '5B5880',
    accent: '4C44D9', accent2: 'F2A516', accent3: 'E2508F', onAccent: 'FFFFFF', line: 'D6D3F3', link: '3F37C9',
    keywords: ['educacao', 'escola', 'leitura', 'ler', 'evasao', 'professor', 'aprendizagem', 'ensino', 'arte', 'cultura', 'esporte', 'musica', 'biblioteca', 'analfabetismo', 'livro', 'cinema', 'danca', 'patrimonio', 'historia'],
  },
  {
    id: 'tca',
    name: 'TCA clássico',
    description: 'A identidade do TCA: azul, roxo e coral.',
    motif: 'orbs',
    dark: false,
    bg: 'F5F7FF', surface: 'FFFFFF', sunk: 'E7EBFB', ink: '17153B', muted: '575A7D',
    accent: '3B5BDB', accent2: '7C3AED', accent3: 'FF8A5B', onAccent: 'FFFFFF', line: 'D5DBF5', link: '2F4AC0',
    keywords: [],
  },
];

export const themeById = (id: string) => THEMES.find((t) => t.id === id) ?? THEMES[THEMES.length - 1];

/** Escolhe o tema visual a partir das palavras usadas pelo grupo. */
export function detectTheme(main: string, rest: string): string {
  const a = ' ' + stripAccents(main.toLowerCase()) + ' ';
  const b = ' ' + stripAccents(rest.toLowerCase()) + ' ';
  let best = 'tca';
  let bestScore = 0;
  for (const t of THEMES) {
    let sc = 0;
    for (const k of t.keywords) {
      if (a.includes(k)) sc += 3;
      const hits = b.split(k).length - 1;
      sc += Math.min(hits, 3);
    }
    if (sc > bestScore) {
      bestScore = sc;
      best = t.id;
    }
  }
  return bestScore >= 2 ? best : 'tca';
}
