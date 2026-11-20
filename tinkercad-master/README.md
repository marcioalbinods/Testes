# Tinkercad Master: do zero à modelagem 3D avançada

Curso interativo e gamificado para aprender a modelar no **Tinkercad** usando apenas a aba **Formas básicas**.
São **100 fases em 10 módulos**. Em cada fase você estuda uma referência 3D, constrói o objeto no Tinkercad,
envia o print e recebe a avaliação do **professor Claude**. A aprovação libera a fase seguinte.

## Como abrir

- **Online (GitHub Pages):** com o Pages ativado no repositório (Settings → Pages → branch `main`, pasta `/`),
  o curso fica em `https://<seu-usuario>.github.io/<repositorio>/tinkercad-master/`.
- **No computador:** abra `index.html` no navegador. É preciso internet para carregar as bibliotecas
  (React e Three.js) e as fontes.

Não há cadastro, servidor nem coleta de dados. O progresso fica salvo no próprio navegador.

## Os 10 módulos

| Módulo | Fases | Tema |
|---|---|---|
| 1 | 1–10 | Dominando as formas básicas: inserir, medir, girar, elevar, colorir, navegar, agrupar |
| 2 | 11–20 | Dominando os furos: furo passante, cavidade, corte, encaixe, escareado |
| 3 | 21–30 | Primeiras construções: mesa, cadeira, casa, janela, porta, vaso, banco, estante, luminária, relógio |
| 4 | 31–40 | Precisão e controle: Alinhar, Régua, Duplicar e repetir, Espelhar, rotação precisa, simetria |
| 5 | 41–50 | Objetos funcionais em escala 1:1: porta-lápis, suportes, organizadores, porta-cartões, porta-copos |
| 6 | 51–60 | Objetos realistas: carro, caminhão, avião, veleiro, bicicleta, câmera, computador, teclado, mouse, braço robótico |
| 7 | 61–70 | Arquitetura e ambientes: casas, prédio, garagem, escada, quarto, sala de aula, laboratório, fachada, lote |
| 8 | 71–80 | Personagens e criatividade: manequim, robôs, humano, cachorro, gato, dinossauro, foguete, monstro, escultura |
| 9 | 81–90 | Projetos avançados: luminária articulada, cadeira ergonômica, off-road, impressora 3D, drone, máquina industrial, caixa de engrenagens, estação de trabalho, humanoide, produto |
| 10 | 91–100 | Desafios de especialista: locomotiva, castelo, farol, guitarra, cafeteira, moinho, estação espacial, trator, quarteirão e o **projeto final autoral** |

## O que cada fase tem

Número e nome, dificuldade, objetivo de aprendizagem, **referência 3D** (girável, com modo edição mostrando
os furos e vista explodida com nomes das peças), descrição do resultado, requisitos obrigatórios (com checklist),
formas básicas, ferramentas do Tinkercad, habilidades, **três dicas progressivas** (pista, orientação, passo a passo),
área de entrega do print, critérios de avaliação, feedback, botão **Solicitar avaliação** e botão **Refazer desafio**.
Fases que introduzem uma ferramenta nova trazem um quadro **Novo** explicando como ela funciona.

## Como funciona a avaliação

O app não analisa imagens sozinho. A avaliação visual é feita pelo Claude, na conversa:

1. Carregue o print na área de entrega da fase (arrastar, escolher arquivo ou colar com Ctrl+V).
2. Clique em **Solicitar avaliação** e copie a mensagem pronta (fase, requisitos, critérios e protocolo).
3. Envie a mensagem e o print numa conversa com o Claude.
4. O Claude responde com o parecer (APROVADO, APROVADO COM OBSERVAÇÕES ou PRECISA REFAZER) e,
   quando for o caso, um **código de registro** como `TM-012-A-XXXX`.
5. Digite o código na janela de avaliação. O app confere, registra a pontuação e libera a próxima fase.

O protocolo completo está em [`PROTOCOLO-AVALIACAO.md`](PROTOCOLO-AVALIACAO.md). O código pode ser gerado com:

```bash
node tools/gerar-codigo.js 12 A
```

## Pontuação e conquistas

- Pontos base por fase: 80 + 20 × dificuldade (100 a 180). Total possível: 15.580.
- Dica 1 desconta 10%, dica 2 chega a 25% e dica 3 a 50%. Abrir dicas nunca impede a aprovação.
- "Com observações" vale 80%. Refazer uma fase concluída mantém a melhor pontuação.
- Medalha por módulo (ouro ≥ 90%, prata ≥ 75%, bronze), 16 conquistas, indicador de domínio das
  ferramentas, histórico completo e certificado simbólico ao concluir a fase 100.

## Armazenamento

- Progresso, pontos, tentativas, dicas, checklist e avaliações: `localStorage` (chave `tinkercad-master.v1`).
- Prints: IndexedDB do navegador (reduzidos para até 1600 px).
- Em **Progresso e backup** dá para exportar o progresso como texto, importar em outro navegador ou recomeçar.

## Estrutura dos arquivos

```
tinkercad-master/
├── index.html              página do app (React 18 + htm via CDN, sem etapa de build)
├── styles.css              identidade visual, tema claro/escuro, responsivo
├── js/core.js              formas, ferramentas, pontuação e código de registro
├── js/store.js             localStorage + IndexedDB
├── js/scene.js             visualizador 3D (Three.js + CSG para furos reais)
├── js/app.js               interface (painel, mapa, fase, avaliação, conquistas, histórico...)
├── js/data/m01.js … m10.js as 100 fases (conteúdo + modelo 3D de referência)
├── tools/gerar-codigo.js   gerador do código de registro para o professor
└── PROTOCOLO-AVALIACAO.md  protocolo de avaliação do professor Claude
```

Os modelos de referência são descritos em milímetros no mesmo sistema do Tinkercad (X, Y no plano, Z para cima,
elevação a partir da base), usando só formas equivalentes às da aba Formas básicas.
