/**
 * Estrutura pedagógica de uma fase (missão).
 * Para criar ou revisar uma fase, edite os arquivos em src/content/phases/.
 * O gabarito dos testes fica separado em src/content/quizKeys.ts.
 */

export type Difficulty = 'facil' | 'intermediario' | 'dificil';

/** Tipos de bloco do Kodu, usados para colorir as representações das regras. */
export type TileKind = 'sensor' | 'filter' | 'action' | 'modifier' | 'empty';

export interface Tile {
  /** Texto do bloco exatamente como aparece no Kodu (em inglês na maioria das versões). */
  label: string;
  kind: TileKind;
  /** Tradução ou explicação curta em português. */
  pt?: string;
}

export interface Rule {
  /** Número da linha no editor do Kodu (1, 2, 3...). */
  line: number;
  when: Tile[];
  do: Tile[];
  /** Nível de recuo (regra subordinada). 0 = sem recuo. */
  indent?: number;
  /** Página do programa (1 a 12). Padrão: 1. */
  page?: number;
}

export interface RuleExplanation {
  /** Personagem/objeto que recebe esta programação. */
  character: string;
  rules: Rule[];
  explanation: string;
}

export interface Step {
  title: string;
  /** Instrução detalhada. Pode ter várias frases. */
  detail: string;
  /** Onde clicar / qual ferramenta usar, destacado visualmente. */
  where?: string;
  /** Verificação rápida: como saber que este passo deu certo. */
  check?: string;
  /** Regras ilustradas neste passo (opcional). */
  rules?: RuleExplanation;
}

export interface ChecklistItem {
  id: string;
  text: string;
  /** Itens obrigatórios contam para o critério de conclusão. */
  required: boolean;
}

export interface Troubleshoot {
  problem: string;
  solution: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  /** Explicação mostrada depois da correção (não revela a alternativa certa diretamente). */
  explanation: string;
}

export interface Phase {
  id: number;
  module: 1 | 2 | 3 | 4 | 5;
  title: string;
  difficulty: Difficulty;
  /** Faixa de tempo estimada em minutos (é apenas uma estimativa). */
  estimatedMinutes: [number, number];
  objective: string;
  skills: string[];
  prerequisites: number[];
  materials: string[];
  /** O que esta fase acrescenta ao projeto acumulativo. */
  projectLink: string;
  concept: { title: string; paragraphs: string[]; example?: string };
  steps: Step[];
  rules: RuleExplanation[];
  expectedResult: string;
  checklist: ChecklistItem[];
  /** Três níveis de dica: geral, específica e demonstração orientada. */
  hints: [string, string, string];
  troubleshooting: Troubleshoot[];
  /** Perguntas para orientar o aluno antes de avançar. */
  guidingQuestions: string[];
  quiz: QuizQuestion[];
  /** Mínimo de acertos para considerar o teste aprovado. */
  quizPassMin: number;
  completionCriteria: string[];
  extraChallenge: string;
  reflection: { prompt: string; guide: string };
  /** Termos do glossário apresentados nesta fase (ids de glossary.ts). */
  glossary: string[];
  /** Diagramas ilustrativos exibidos na seção de conceito. */
  diagrams?: DiagramId[];
  /** Observações sobre diferenças entre versões do Kodu. */
  versionNotes?: string[];
}

export type DiagramId = 'toolbar' | 'mouse' | 'rule-anatomy' | 'states' | 'debug' | 'iteration' | 'counter';

export interface Module {
  id: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  color: string;
}
