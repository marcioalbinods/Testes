# TCA — Da Pesquisa à Intervenção

Site para estudantes do **8º ano** organizarem a pesquisa do Trabalho Colaborativo de Autoria (TCA)
e gerarem automaticamente a apresentação de slides para a pré-apresentação aos professores.

## O que o site faz

1. **Seis etapas guiadas**: grupo → tema e problema → descobertas → fontes → intervenção → revisão.
   Campos grandes (bons para toque), exemplos, dicas de "Precisa de ajuda?", validação dos campos obrigatórios
   e barra de progresso.
2. **Editor pedagógico local** (`src/engine/`): corrige erros comuns de digitação e acentuação, divide
   parágrafos em tópicos, tira expressões de enchimento ("Nós descobrimos que…"), elimina ideias repetidas,
   escolhe os tópicos mais relevantes e mantém hipóteses como hipóteses ("Acreditamos que…").
   **Nunca inventa conteúdo**: quando falta informação, o slide mostra uma caixa tracejada pedindo
   para complementar a pesquisa.
3. **Slides 16:9 com 7 estilos visuais** escolhidos pelo assunto (natureza, digital, saúde, sóbrio para
   violência, sociedade, educação, clássico). Gráfico automático quando o grupo informa 2 ou mais números.
   Slides extras só quando o conteúdo justifica (descobertas em duas partes, dados, várias referências).
4. **Referências** montadas só com os dados informados, com aviso "Conferir: falta…" e indicação de
   confiabilidade da fonte (instituição, jornal, atenção).
5. **Guia de apresentação oral**: para cada slide, o que explicar, informações importantes, como dizer com
   as próprias palavras, conceitos para estudar e mensagem principal; mais 8 perguntas que os professores
   podem fazer, com respostas baseadas só no que o grupo escreveu.
6. **Arquivos**: PowerPoint (.pptx editável, com notas do orador), PDF dos slides (com links clicáveis),
   PDF do guia, PDF do resumo da pesquisa e cópia do trabalho (.json) para continuar em outro aparelho.
7. Editor de slides (textos, ordem, ocultar slide, trocar estilo) antes de exportar.

## Privacidade

Sem cadastro, sem login, sem banco de dados, sem analytics. O preenchimento fica salvo só no navegador
(`localStorage`). Fontes, ícones e bibliotecas vão embutidos no próprio arquivo: o site não faz nenhuma
requisição à internet. Nenhuma inteligência artificial externa é usada; a síntese é feita por regras locais.

## Desenvolvimento

```bash
npm install
npm run dev          # servidor local
npm test             # testes do motor de síntese
npm run build:publish  # gera ../tca/index.html (GitHub Pages) e dist-artifact/tca.html
```

Tecnologias: React, TypeScript, Tailwind CSS, PptxGenJS (PowerPoint), jsPDF + html-to-image (PDF).
O build gera **um único arquivo HTML** com tudo dentro, que funciona até offline.

### Estrutura

- `src/steps/` — as seis etapas do formulário
- `src/engine/text.ts` — correção, divisão em tópicos, repetições e relevância
- `src/engine/buildDeck.ts` — organiza as respostas em slides
- `src/engine/layout.ts` — composição visual de cada tipo de slide (mesmo desenho para prévia, PPTX e PDF)
- `src/engine/guide.ts` — guia de apresentação e perguntas
- `src/render/` — prévia em HTML e exportações
- `tests/` — testes automatizados
