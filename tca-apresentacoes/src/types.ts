// Tipos do formulário preenchido pelos estudantes.

export interface Member {
  id: string;
  name: string;
}

export interface Discovery {
  id: string;
  text: string;
}

export interface DataPoint {
  id: string;
  /** Valor como foi digitado (ex.: "45", "3,5", "1.200"). */
  value: string;
  /** Unidade: "%", "pessoas", "toneladas"... */
  unit: string;
  /** O que esse número representa. */
  label: string;
  /** Onde o grupo encontrou esse dado (texto livre). */
  origin: string;
}

export interface Source {
  id: string;
  site: string;
  title: string;
  link: string;
  author: string;
  accessDate: string;
  found: string;
}

export type MediaId =
  | 'video'
  | 'podcast'
  | 'cartazes'
  | 'redes'
  | 'fotografia'
  | 'teatro'
  | 'jornalismo'
  | 'jogos'
  | 'presencial'
  | 'outra';

export interface ProjectForm {
  // Etapa 1
  school: string;
  grade: string;
  className: string;
  period: '' | 'Manhã' | 'Tarde';
  groupName: string;
  members: Member[];
  // Etapa 2
  workTitle: string;
  theme: string;
  problem: string;
  whyChosen: string;
  whyImportant: string;
  affected: string;
  whereScope: string[];
  whereDetail: string;
  // Etapa 3
  discoveries: Discovery[];
  causes: string;
  consequences: string;
  dataText: string;
  dataPoints: DataPoint[];
  surprising: string;
  learned: string;
  conclusion: string;
  // Etapa 4
  sources: Source[];
  // Etapa 5
  change: string;
  intervention: string;
  objective: string;
  audience: string;
  how: string;
  resources: string;
  results: string;
  media: MediaId[];
  otherMedia: string;
  mediaWhy: string;
  mediaHow: string;
  mediaMessage: string;
  mediaResult: string;
}

// ---------- Slides ----------

export type SlideKind =
  | 'cover'
  | 'theme'
  | 'problem'
  | 'discoveries'
  | 'data'
  | 'causes'
  | 'reflection'
  | 'intervention'
  | 'practice'
  | 'final'
  | 'references';

export interface SlideField {
  key: string;
  label: string;
  type: 'text' | 'list';
  value: string | string[];
  /** Mensagem exibida quando o campo ficou sem conteúdo. */
  missing?: string;
}

export interface ChartDatum {
  label: string;
  value: number;
  display: string;
}

export interface RefEntry {
  text: string;
  link?: string;
  needsCheck: string[];
}

export interface SlideData {
  id: string;
  kind: SlideKind;
  title: string;
  fields: SlideField[];
  chart?: ChartDatum[];
  chartUnit?: string;
  refs?: RefEntry[];
  /** Notas do orador (vão para o PowerPoint). */
  notes: string;
  hidden?: boolean;
}

export interface Deck {
  slides: SlideData[];
  themeId: string;
  generatedAt: string;
  warnings: string[];
}
