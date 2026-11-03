import type { Module } from './types';

export const MODULES: Module[] = [
  {
    id: 1,
    title: 'Primeiros passos no Kodu',
    description: 'Conhecer a interface, construir um mundo e programar o primeiro movimento.',
    color: 'var(--mod-1)',
  },
  {
    id: 2,
    title: 'Programação e interação',
    description: 'Dominar a estrutura WHEN/DO, controlar personagens e criar interações.',
    color: 'var(--mod-2)',
  },
  {
    id: 3,
    title: 'Construção de jogos',
    description: 'Cenários, coleta, pontuação e condições de vitória e derrota.',
    color: 'var(--mod-3)',
  },
  {
    id: 4,
    title: 'Lógica, desafios e depuração',
    description: 'Páginas, inimigos, tempo, vidas e correção de erros.',
    color: 'var(--mod-4)',
  },
  {
    id: 5,
    title: 'Projetos avançados e autoria',
    description: 'Planejar, construir, testar e apresentar um jogo autoral.',
    color: 'var(--mod-5)',
  },
];

export const DIFFICULTY_LABEL = {
  facil: 'Fácil',
  intermediario: 'Intermediário',
  dificil: 'Difícil',
} as const;
