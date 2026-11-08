import type { MediaId, ProjectForm } from '../types';

export const SCHOOL_NAME = 'EMEF Oliveira Viana';

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const emptyForm = (): ProjectForm => ({
  school: SCHOOL_NAME,
  grade: '8º ano',
  className: '',
  period: '',
  groupName: '',
  advisor: '',
  members: [{ id: uid(), name: '' }],
  workTitle: '',
  theme: '',
  problem: '',
  whyChosen: '',
  whyImportant: '',
  affected: '',
  whereScope: [],
  whereDetail: '',
  discoveries: [],
  causes: '',
  consequences: '',
  dataText: '',
  dataPoints: [],
  surprising: '',
  learned: '',
  conclusion: '',
  sources: [],
  change: '',
  intervention: '',
  objective: '',
  audience: '',
  how: '',
  resources: '',
  results: '',
  media: [],
  otherMedia: '',
  mediaWhy: '',
  mediaHow: '',
  mediaMessage: '',
  mediaResult: '',
});

export const CLASS_OPTIONS = ['8º A', '8º B', '8º C'];
export const SCOPE_OPTIONS = ['Na escola', 'No bairro', 'Na cidade', 'No estado', 'No Brasil', 'No mundo'];

export interface MediaOption {
  id: MediaId;
  name: string;
  short: string;
  examples: string;
  icon: string;
}

export const MEDIA_OPTIONS: MediaOption[] = [
  { id: 'video', name: 'Vídeo', short: 'Vídeo', icon: 'video', examples: 'Documentário, curta-metragem, entrevista, campanha audiovisual ou vídeo de conscientização.' },
  { id: 'podcast', name: 'Podcast', short: 'Podcast', icon: 'mic', examples: 'Programa de áudio, entrevistas, debates ou episódios informativos.' },
  { id: 'cartazes', name: 'Cartazes e materiais gráficos', short: 'Cartazes', icon: 'image', examples: 'Cartazes, folders, panfletos e infográficos.' },
  { id: 'redes', name: 'Redes sociais', short: 'Redes sociais', icon: 'share', examples: 'Campanha digital, publicações informativas, vídeos curtos e materiais de conscientização.' },
  { id: 'fotografia', name: 'Fotografia', short: 'Fotografia', icon: 'camera', examples: 'Exposição fotográfica, ensaio ou registro de situações relacionadas ao tema.' },
  { id: 'teatro', name: 'Teatro e expressão artística', short: 'Teatro', icon: 'drama', examples: 'Esquetes, dramatizações, apresentações e performances.' },
  { id: 'jornalismo', name: 'Jornalismo e comunicação', short: 'Jornalismo', icon: 'newspaper', examples: 'Jornal escolar, reportagem, entrevista ou mural informativo.' },
  { id: 'jogos', name: 'Jogos e experiências interativas', short: 'Jogos', icon: 'gamepad', examples: 'Quiz, jogo educativo, desafios e atividades participativas.' },
  { id: 'presencial', name: 'Ações presenciais', short: 'Ações presenciais', icon: 'users', examples: 'Rodas de conversa, palestras, oficinas, campanhas e mobilizações na escola ou comunidade.' },
  { id: 'outra', name: 'Outras possibilidades', short: 'Outra mídia', icon: 'sparkles', examples: 'Tem outra ideia? Escreva qual é.' },
];

export const mediaName = (id: MediaId, other: string) =>
  id === 'outra' ? other.trim() || 'Outra mídia' : MEDIA_OPTIONS.find((m) => m.id === id)?.short ?? id;

export const STEPS = [
  { n: 1, short: 'Grupo', title: 'Vamos construir a apresentação do nosso TCA?' },
  { n: 2, short: 'Tema', title: 'Sobre o que estamos pesquisando?' },
  { n: 3, short: 'Descobertas', title: 'Hora de compartilhar nossas descobertas!' },
  { n: 4, short: 'Fontes', title: 'De onde vieram nossas informações?' },
  { n: 5, short: 'Intervenção', title: 'Como podemos contribuir para transformar essa realidade?' },
  { n: 6, short: 'Revisão', title: 'Nossa pesquisa está pronta para virar uma apresentação!' },
];
