# 🦊 CAÇADORES DE LETRAS

**Uma aventura em busca das letras perdidas!**

Jogo educativo de alfabetização em formato *Escape Room* para estudantes do 1º e 2º ano do Ensino Fundamental (6 e 7 anos).
A criança recebe uma missão, explora um cenário ilustrado, encontra as letras escondidas e forma a palavra pedida — acompanhada pela **LUPA**, uma raposa exploradora.

- 30 fases jogáveis em 3 mundos (Floresta das Letras, Oceano Misterioso e Castelo dos Desafios)
- 30 cenários ilustrados em SVG, cada um com composição própria
- Letras repetidas contadas corretamente (ex.: CASA tem dois **A** no cenário)
- Cenários lotados de objetos, no estilo “Onde está?”: de 60 a 125 itens extras por fase, espalhados de um jeito diferente a cada partida
- Letras camufladas: cores parecidas com o cenário, inclinadas e às vezes parcialmente cobertas por folhas, bolhas ou teias
- Muitas letras distratoras (de 7 a 19 por fase), que aumentam com a dificuldade
- Dicas progressivas, cronômetro por fase e da aventura, estrelas e recompensas
- Perfis de estudantes (apenas apelidos), progresso salvo no navegador
- Painel do Professor com PIN, histórico e exportação em CSV
- Funciona sem internet depois do primeiro carregamento
- Sem servidor, sem banco de dados, sem login e sem dependências externas

---

## ▶️ Como executar

O jogo é um site estático. Você pode:

1. **Abrir direto no navegador:** dê dois cliques em `index.html`.
   (Nesse modo tudo funciona, exceto o modo offline, que exige um endereço `http`.)
2. **Usar um servidor local** (recomendado para testar o modo offline):
   ```bash
   cd caca-as-letras
   python3 -m http.server 8000
   ```
   e acesse <http://localhost:8000>.

Navegadores testados: Chrome/Edge (notebook e desktop), Chrome Android e Safari (iPad). Para tablets, prefira a orientação **horizontal**.

---

## 🌐 Como publicar no GitHub Pages

1. No GitHub, abra o repositório e vá em **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **GitHub Actions** (a publicação de todos os projetos
   do repositório é feita pelo arquivo `.github/workflows/pages.yml`, veja o README principal).
3. A cada alteração no `main` o site é publicado sozinho. Em 1 ou 2 minutos o jogo ficará em:

   `https://marcioalbinods.github.io/Testes/caca-as-letras/`

Todos os caminhos do projeto são relativos, então o jogo funciona em qualquer subpasta.
Depois que a página abrir uma vez, ela fica guardada no aparelho e pode ser jogada sem internet.

> Dica: se preferir um endereço mais curto, copie o conteúdo desta pasta para um repositório próprio (ex.: `cacadores-de-letras`) e publique a raiz dele.

---

## 🔤 Como alterar as palavras

As palavras ficam em **`js/levels.js`**, na lista `RAW`:

```js
const RAW = [
  ['SOL', 3], ['LUA', 3], ['GATO', 3], ...
];
```

Cada item é `['PALAVRA', quantidadeDeLetrasDistratoras]`.

- Use apenas letras maiúsculas, sem acento (A–Z).
- Fases 1–10 pertencem ao Mundo 1, 11–20 ao Mundo 2 e 21–30 ao Mundo 3.
- Para a palavra nova ter uma ilustração na tela de conclusão, adicione um desenho com o mesmo nome em **`js/illustrations.js`** (objeto `I`). Se não houver desenho, a palavra aparece escrita no lugar da imagem.
- Verifique se o cenário tem esconderijos suficientes (letras da palavra + distratoras). Se faltar, o jogo completa automaticamente com posições livres, mas o ideal é acrescentar esconderijos (veja abaixo).

---

## 🎚️ Como deixar o jogo mais fácil ou mais difícil

- **Quantidade de objetos espalhados:** em `js/scenes.js`, procure `const count = [0, 62, 70, 88][world] + i * 4;`. Os números 62, 70 e 88 são a base de cada mundo (Floresta, Oceano, Castelo). Diminua para deixar o cenário mais limpo.
- **Letras distratoras:** em `js/levels.js`, o segundo número de cada palavra na lista `RAW`.
- **Tamanho, inclinação e camuflagem das letras:** em `js/levels.js`, `CDL.LETTER_STYLE`:
  - `size`: tamanho da letra;
  - `rot`: inclinação máxima;
  - `cover`: chance de a letra ficar parcialmente coberta (0 = nunca, 1 = sempre);
  - `outline`: contorno claro (maior = mais fácil de ver).
- **Cores de camuflagem:** em `js/levels.js`, `CDL.CAMO_COLORS`.

## ➕ Como adicionar novas fases

1. Em `js/levels.js`, acrescente a palavra na lista `RAW`.
2. Em `js/scenes.js`, crie o cenário com o número da nova fase:

   ```js
   S[31] = { name: 'Nome do Cenário', build(b) {
     sky(b, '#7FD3FF', '#E3F7FF');          // céu em degradê
     ground(b, 700, '#6CC160', '#4FA548');  // chão
     b.add('tree', 200, 700, 1.2);          // objeto (nome, x, y, escala, opções)
     b.add('house', 800, 700, 1, { roof: '#7B61FF' });
     b.spot(500, 300);                      // esconderijo extra para letras
   } };
   ```

   O cenário usa um quadro de **1600 × 900**. Cada objeto já cria esconderijos próprios (na copa da árvore, na janela da casa etc.). Use `{ noSpot: true }` para um objeto não receber letras.
3. Ajuste em `js/levels.js` a regra do mundo (`world`) e, em `CDL.WORLDS`, o `last` do mundo, se for o caso.
4. Se quiser, acrescente a ilustração da palavra em `js/illustrations.js`.

Os objetos disponíveis estão em `js/art.js` (árvores, flores, animais, corais, peixes, navio, torres, tronos, estantes, dragão, e muitos outros).

---

## 🎨 Como substituir os cenários

Há duas formas:

- **Editar a composição SVG** do cenário em `js/scenes.js` (trocar cores, objetos e posições).
- **Usar uma imagem pronta** (PNG/JPG/SVG): coloque o arquivo em `assets/scenarios/` e, no cenário desejado, use:

  ```js
  S[5] = { name: 'Meu Cenário', build(b) {
    b.raw('<image href="assets/scenarios/meu-cenario.jpg" x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice"/>');
    b.spot(300, 400).spot(800, 250).spot(1200, 600); // onde as letras podem aparecer
  } };
  ```

  Crie esconderijos suficientes com `b.spot(x, y)` (coordenadas no quadro de 1600 × 900). Lembre-se de acrescentar o arquivo à lista `FILES` em `sw.js` para que funcione offline.

---

## 🔒 Como configurar o PIN do professor

Abra **`js/config.js`** e altere:

```js
teacherPin: '0694',
```

Use de 4 a 6 números. O PIN atual é **0694**.

> Observação: por ser um site estático, o PIN impede o acesso casual das crianças ao painel, mas não é uma proteção de segurança forte.

---

## 👩‍🏫 Painel do Professor

Na tela inicial, toque em **🔒 PAINEL DO PROFESSOR** (canto inferior direito) e digite o PIN. O painel permite:

- ver todos os perfis com fases concluídas, estrelas, tempo total, dicas e erros;
- abrir o detalhe de cada perfil: situação das 30 fases, melhor e último tempo, tempo total por fase, tentativas, dicas, tentativas incorretas e histórico de partidas;
- **criar perfil**, **selecionar perfil** para jogar, **renomear**, **liberar todas as fases**, **reiniciar o progresso** e **excluir perfil**;
- **exportar resultados em CSV** (todos os perfis ou um só) e exportar o histórico completo. O CSV usa `;` como separador e abre direto no Excel/LibreOffice/Google Planilhas.

Os dados ficam no **LocalStorage** do navegador do aparelho. Cada tablet/computador guarda seus próprios perfis. Limpar os dados do navegador apaga o progresso — exporte o CSV periodicamente.

---

## 🎮 Regras do jogo

- **Missão:** a palavra aparece em letras grandes no início da fase.
- **Coleta:** toque/clique nas letras do cenário. Letras corretas voam para a área de coleta, na posição certa da palavra. A caixinha amarela indica a próxima letra sugerida.
- **Letra errada:** a letra balança, aparece “Essa não! Continue procurando!” — sem perder pontos.
- **Letras repetidas:** cada ocorrência existe separadamente no cenário e precisa ser encontrada.
- **Letras coletadas** ficam apagadas, com um ✔, e não podem ser tocadas de novo.
- **Dicas (PRECISO DE UMA DICA!):** 1ª toque mostra a região aproximada; 2ª mostra estrelinhas perto da letra; 3ª destaca a letra por alguns segundos. As dicas são contadas, mas nunca bloqueiam a criança.
- **Estrelas (1 a 3):**
  - ⭐ concluir a missão;
  - ⭐ usar poucas dicas (até 1 dica; até 2 em palavras com 7 letras ou mais);
  - ⭐ procurar com atenção (até 2 erros; até 3 em palavras longas) **ou** encontrar as letras na ordem da palavra.
  A velocidade não é usada como critério.
- **Cronômetros:** tempo da fase e tempo total da aventura, calculados por horário (timestamps) — continuam corretos mesmo se a aba for trocada. O tempo para durante a pausa.
- **Recompensas:** comemoração com estrelas e confetes a cada fase, medalha especial ao completar cada mundo e certificado final “VOCÊ É UM VERDADEIRO CAÇADOR DE LETRAS!” (pode ser impresso).

---

## 🗂️ Estrutura do projeto

```
caca-as-letras/
├── index.html              telas do jogo
├── manifest.webmanifest    instalação como aplicativo
├── sw.js                   modo offline
├── css/
│   ├── style.css           visual geral, menus, painel
│   ├── game.css            tela de jogo, letras, animações
│   └── responsive.css      tablets e notebooks
├── js/
│   ├── config.js           PIN do professor e opções
│   ├── art.js              biblioteca de ilustrações SVG
│   ├── scenes.js           os 30 cenários
│   ├── levels.js           mundos, palavras e distribuição das letras
│   ├── illustrations.js    desenhos das 30 palavras
│   ├── character.js        a LUPA
│   ├── audio.js            efeitos sonoros e narração
│   ├── timer.js            cronômetro
│   ├── progress.js         perfis e LocalStorage
│   ├── effects.js          confetes, estrelas, medalhas
│   ├── game.js             lógica da missão
│   ├── teacher-panel.js    painel do professor
│   └── app.js              navegação entre telas
├── assets/
│   ├── fonts/              fonte Fredoka (licença OFL)
│   ├── icons/              ícones do aplicativo
│   └── scenarios/          (opcional) imagens de cenários próprios
└── tests/
    └── teste-completo.js   teste automatizado das 30 fases
```

Os sons são gerados pelo próprio navegador (Web Audio), por isso não há arquivos de áudio. A narração usa a voz em português do aparelho, quando disponível, e pode ser desligada em **CONFIGURAÇÕES**.

---

## ✅ Teste automatizado

O arquivo `tests/teste-completo.js` joga as 30 fases e verifica: letras de cada palavra (inclusive repetidas), distratoras, letras dentro do cenário e sem sobreposição, área de toque, mensagens de erro, impossibilidade de coletar a mesma letra duas vezes, dicas 1-2-3, cronômetro (inclusive com troca de aba simulada e pausa), salvamento após recarregar, recompensas de mundo, tela final, troca de perfis, painel do professor (PIN, CSV, liberar fases, reiniciar), configurações, responsividade (iPad, tablet Android, notebook, desktop) e erros no console.

```bash
cd caca-as-letras
python3 -m http.server 8765 &
npm install playwright     # apenas na primeira vez
npx playwright install chromium
node tests/teste-completo.js
```

---

## 📜 Créditos e licenças

- Ilustrações, personagem, sons e código: originais deste projeto.
- Fonte [Fredoka](https://github.com/hafontia/Fredoka-One) — SIL Open Font License 1.1 (`assets/fonts/OFL-LICENSE.txt`).
