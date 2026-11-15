# 🤖 Treinando uma IA sem preconceitos — NEXUS LAB

*Uma missão pela tecnologia, diversidade e justiça digital.*

Jogo digital educativo para o **8º ano do Ensino Fundamental (Educação Digital)**. O estudante é recrutado
pela organização fictícia **NEXUS LAB** como especialista em Inteligência Artificial e precisa investigar e
corrigir a **NEXUS AI**, uma IA que passou a reproduzir estereótipos e decisões discriminatórias.

Temas: inteligência artificial, racismo algorítmico, preconceito e discriminação, diversidade e
representatividade, dados e algoritmos, ética e responsabilidade tecnológica.

## Como jogar

- Abra `index.html` no navegador (Chrome, Edge ou Safari) — funciona até sem servidor.
- Publicado no GitHub Pages: `https://<seu-usuario>.github.io/<repositorio>/ia-sem-preconceitos/`
- Funciona com mouse, toque (tablets) e teclado. Depois de carregado uma vez pelo GitHub Pages, funciona **offline**.
- Sem cadastro, sem banco de dados externo, sem envio de dados: o progresso fica **só no navegador** (localStorage).

## Estrutura do jogo

Abertura cinematográfica → criação do personagem (avatar + apelido) → mapa de missões → 6 missões → avaliação final → cerimônia de formatura com certificado para imprimir.

| Missão | Desafios e mecânicas |
|---|---|
| 1. A IA aprendeu errado? | Gerar imagens e escanear padrões · classificar cartões (estereótipo × diversidade) · quadro de hipóteses ligadas a evidências |
| 2. Organizando os dados | Montar base de dados arrastando cartões (medidores de diversidade e qualidade) · comparar 3 bases (números × ficha técnica) · ampliar base com orçamento e gráficos antes/depois |
| 3. Detetives do racismo algorítmico | Dossiê de investigação (reconhecimento facial) · marca-texto em currículos + critérios da “caixa-preta” · encontrar perfis gêmeos com recomendações diferentes |
| 4. Corrigindo a IA | Arrastar ferramentas para corrigir dados · editor de regras do algoritmo · simulação antes/depois com gráfico, cálculos e ciclo da IA responsável |
| 5. Teste de qualidade | Esteira de testes surpresa · relatório com taxas de erro por grupo (cálculo e gráfico) · sala de decisões com consequências e “simulação do futuro” |
| 6. A grande missão final | 7 etapas: investigar, analisar evidências, identificar grupos prejudicados, revisar dados, corrigir critérios, testar com perfis gêmeos e escrever a justificativa da solução |

São **24 desafios** (mais de 50 etapas interativas). Ao errar, o jogador recebe explicação, pode tentar de novo
e recebe dicas progressivas — a resposta não é entregue de imediato.

**Progressão:** XP, 7 níveis, pontuação por missão, medalhas (bronze/prata/ouro) — Detetive dos Dados,
Guardião(ã) da Diversidade, Investigador(a) de Algoritmos, Desenvolvedor(a) Consciente, Auditor(a) de Qualidade
e Especialista em Ética Digital —, 10 conquistas especiais e o **Arquivo de Inspirações**, com 12 cartões
de pessoas negras reais da ciência e da tecnologia (Katherine Johnson, Sônia Guimarães, Gladys West,
Enedina Alves Marques, Joy Buolamwini, Nina da Hora, Mark Dean, Timnit Gebru, Jerry Lawson, Tarcízio Silva,
Alan Emtage e Lonnie Johnson). A pontuação valoriza justificar decisões (bônus) e corrigir erros (+10 XP).

## Menu do professor

Acesso discreto: botão **π** no rodapé da tela inicial, atalho **Ctrl + Shift + P** ou segurar o símbolo
da NEXUS AI na tela inicial por 2 segundos. **Código: `2040`** (pode ser alterado em `js/data.js`, campo `teacherPin`).

Permite consultar o progresso salvo (missões, pontos, erros corrigidos, dicas, medalhas, tempo de jogo e a
justificativa final), copiar o relatório, desbloquear as missões para demonstração, reiniciar o jogo, apagar
os dados e iniciar uma **nova partida para outra dupla** (o resumo da anterior fica no histórico do dispositivo).

## Cuidados pedagógicos

- Todas as pessoas, empresas, bases e números dos desafios são **fictícios** e identificados como simulação.
- O jogo nunca pede para classificar a raça de alguém por foto: cor/raça aparece como dado **autodeclarado**
  (categorias do IBGE) e as imagens geradas usam uma escala de tons de pele, explicando que tom de pele não é raça.
- Estereótipos aparecem sempre como algo a ser identificado e corrigido, nunca como verdade.
- Os vieses são explicados a partir de dados, escolhas humanas, critérios e formas de uso.

## Organização dos arquivos

```
index.html            página do jogo
css/style.css         identidade visual
js/data.js            CONTEÚDO: história, missões, desafios, respostas, medalhas, inspirações
js/art.js             ilustrações vetoriais próprias (pessoas, NEXUS AI, ícones, medalhas)
js/audio.js           efeitos sonoros e música sintetizados (Web Audio, sem arquivos)
js/engine.js          salvamento, XP, níveis, conquistas, arrastar e soltar
js/mechanics.js       as 20 mecânicas de jogo
js/app.js             telas, fluxo, HUD, menu do professor
sw.js, manifest       funcionamento offline
assets/               fontes (licença OFL) e ícones
tools/                servidor local e teste automático que joga as 6 missões
```

Teste automático: `node tools/serve.js 8765` e, em outro terminal, `node tools/e2e.js 1024 768`.
