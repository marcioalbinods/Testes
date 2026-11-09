# 🎨 MOSAICO SECRETO — O DESAFIO DAS LETRAS E CORES

Jogo educativo de pintura por associação de letras e cores para o **1º ano do Ensino Fundamental**
(6 e 7 anos), feito para as aulas de Educação Digital.

A tela mostra uma grade de quadradinhos, cada um com uma letra em CAIXA ALTA. A legenda no alto
diz a cor de cada letra (ex.: **A = VERMELHO**). A criança toca no quadradinho e ele é pintado
**automaticamente** com a cor da sua letra — não é preciso escolher pincel nem cor. Quando todos
estão pintados, aparece o **desenho secreto**!

## O que tem no jogo

- **50 missões, 50 desenhos diferentes**, em 5 mundos com 10 missões cada:
  | Mundo | Tema | Grade | Dificuldade |
  |---|---|---|---|
  | 1 | Fazenda Encantada | 10 × 10 (100 quadradinhos) | ★ muito fácil |
  | 2 | Fundo do Mar | 12 × 12 (144) | ★★ fácil |
  | 3 | Jardim das Frutas | 14 × 14 (196) | ★★★ médio |
  | 4 | Aventura sobre Rodas | 16 × 16 (256) | ★★★★ difícil |
  | 5 | Mundo da Imaginação | 18 × 18 (324) | ★★★★★ desafio |
- Do mundo 1 ao 5 aumentam o tamanho da grade, o número de cores (de 4 a 8) e a variedade de letras
  (o mundo 1 usa vogais e poucas consoantes; os mundos 3 a 5 usam o alfabeto inteiro).
- **Telas:** início, mapa dos mundos, seleção das missões, mosaico, missão concluída, galeria
  “Minhas descobertas” e Menu do Professor.
- Missões liberadas em ordem (concluídas ✓, disponível piscando, trancadas 🔒).
- O progresso de cada mosaico é salvo: dá para sair e continuar depois.
- Tocar numa cor da legenda faz piscar os quadradinhos daquela letra e a voz diz “Letra A: vermelho”.
- Lupa 🔍 mostra onde ainda falta pintar; botões + e − mudam o tamanho da grade.
- Pintar arrastando o dedo (pode ser desligado), mouse, toque e teclado (setas + Enter).
- Sons gerados no navegador, voz em português, confete e animações de conclusão.
- Funciona sem internet depois do primeiro acesso (service worker).

## Menu do Professor

Acesso pelo botão discreto no canto da tela inicial (pede uma multiplicação simples, para
as crianças não entrarem sem querer). Nele é possível:

- ver o progresso de cada mundo;
- **liberar todas as missões** ou **reiniciar o progresso**;
- ligar/desligar sons, voz, voz a cada quadradinho, pintar arrastando e nomes das cores;
- **imprimir** qualquer missão como atividade de papel (grade com letras + legenda colorida),
  o gabarito colorido, ou as 10 atividades de um mundo de uma vez;
- ver o gabarito das 50 imagens e as orientações pedagógicas.

## Privacidade

Sem login, sem cadastro, sem banco de dados e sem coleta de informações pessoais.
O progresso fica apenas no `localStorage` do navegador usado.

## Como executar

É um site estático: abra `index.html` no navegador, ou rode um servidor local:

```bash
cd mosaico-secreto
python3 -m http.server 8000
```

e acesse <http://localhost:8000>.

## Publicar no GitHub Pages

Com o GitHub Pages ativado no repositório (Settings → Pages → Deploy from a branch → `main` / root),
o jogo fica em `https://<seu-usuario>.github.io/<nome-do-repositorio>/mosaico-secreto/`.

## Como os desenhos são feitos

Os desenhos estão em `js/data.js`, descritos com formas simples (círculos, retângulos, polígonos)
num espaço de 0 a 100. O motor (`js/engine.js`) transforma cada desenho na grade do tamanho da
missão e escolhe as letras de cada cor de forma fixa (a mesma folha impressa sempre bate com a tela).

Para conferir os 50 desenhos de uma vez, abra `tools/preview.html`.
`tools/e2e.js` é um teste automático (Playwright) que percorre as telas e joga uma missão.

## Créditos

Fonte **Fredoka** (SIL Open Font License, ver `assets/fonts/OFL-LICENSE.txt`).
