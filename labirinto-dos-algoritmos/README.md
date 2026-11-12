# 🤖 Labirinto dos Algoritmos

**Jogo educativo de programação em blocos para o 5º ano do Ensino Fundamental (Educação Digital).**

O robô **Byte** está preso em labirintos de um universo tecnológico. Para escapar, os estudantes montam
algoritmos com blocos encaixáveis (no estilo Scratch) e veem o Byte executar cada comando em um
cenário **3D low poly** com câmera isométrica.

- **25 fases** em **5 mundos**, com dificuldade progressiva
- **Programação em blocos real** (Blockly): os blocos são lidos por um interpretador próprio e executados passo a passo
- O bloco que está rodando fica **destacado** enquanto o Byte se move
- **Pontuação** de até 100 por fase, **3 estrelas**, **23 conquistas** e **ranking** com pódio (da turma ou do aparelho)
- **Grupos por turma** (5º A, 5º B e 5º C): primeiro nome dos integrantes e uma **senha de 3 figuras**, sem e-mail
- **Salvamento online** (opcional, numa planilha do Google Drive do professor): o grupo continua em outra aula, em qualquer aparelho
- **Avatares de corpo inteiro** (pessoa ou 7 bichos) e uma **loja**: as **moedas 🪙** das fases compram roupas, chapéus, óculos, bichinhos e fundos
- **Laboratório de Criação** (liberado após as 25 fases) para criar e testar labirintos
- Feito para **tablets** (toque, botões grandes, retrato e paisagem) e computadores
- Funciona **offline** depois do primeiro acesso (PWA); sem internet, o progresso fica no aparelho e sobe depois

---

## ▶️ Como executar

O jogo é um site estático (HTML, CSS e JavaScript). Não precisa instalar nada.

1. **Direto no navegador:** dê dois cliques em `index.html`.
   Tudo funciona, exceto o modo offline (que exige um endereço `http`).
2. **Com um servidor local** (recomendado para testar o modo offline):

   ```bash
   cd labirinto-dos-algoritmos
   python3 -m http.server 8000
   ```

   e abra <http://localhost:8000> no navegador.

Navegadores recomendados: Chrome / Edge (Windows, Android, ChromeOS) e Safari (iPad, Mac), em versões atuais.

---

## 🌐 Como publicar no GitHub Pages

1. No GitHub, abra o repositório e vá em **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **Deploy from a branch**.
3. Selecione a branch `main` e a pasta `/ (root)` e clique em **Save**.
4. Aguarde 1 ou 2 minutos. O jogo ficará em:

   `https://<seu-usuario>.github.io/<nome-do-repositorio>/labirinto-dos-algoritmos/`

Todos os caminhos são relativos, então o jogo funciona em qualquer pasta. Depois de abrir a página
uma vez com internet, os arquivos ficam guardados no aparelho e o jogo funciona **sem internet**.

> **Dica para tablets:** abra o endereço no navegador e use “Adicionar à tela inicial”. O jogo abre em
> tela cheia, como um aplicativo.

---

## ☁️ Grupos, turmas e salvamento online

1. **JOGAR** → escolham a **turma** (5º A, 5º B ou 5º C) → **Grupo novo**.
2. Escrevam o **primeiro nome** de cada integrante (até 6), escolham o **personagem** e uma **senha de 3 figuras** (🐶 🚀 ⭐…).
3. Na próxima aula, em qualquer tablet ou computador: **JOGAR** → turma → toquem no grupo → senha de figuras.

Para o progresso ir para a internet, o professor instala uma vez o **servidor das turmas** (Google Apps Script, grátis,
cerca de 10 minutos) e cola o endereço em `config.json`. O passo a passo está em
[`google-apps-script/LEIA-ME.md`](google-apps-script/LEIA-ME.md). A planilha no Drive do professor mostra, para cada grupo:
turma, integrantes, senha de figuras, pontos, estrelas, fases concluídas, fase atual, moedas e conquistas.

Sem o servidor configurado (ou sem internet), tudo continua funcionando e fica salvo **no aparelho**. Quando a internet
volta, o que ficou guardado é enviado sozinho.

## 🪙 Moedas, avatar e loja

- Cada fase concluída dá **10 moedas** + **5 por estrela**; cada conquista dá **10** (as especiais, **20**).
  As moedas vêm do progresso: **repetir uma fase não dá moedas de novo**, mas melhorar as estrelas dá.
- Em **👕 Avatar e Loja** o grupo escolhe pessoa (6 tons de pele, 10 cabelos, 10 cores de cabelo) ou bicho
  (gato, cachorro, coelho, urso, panda, raposa, leão) e personaliza roupas, calçados, chapéus, óculos, itens de pescoço,
  objetos na mão, itens nas costas (capa, asas, jetpack…), bichinhos e fundos. São mais de 60 itens.
- Dá para **experimentar** antes de comprar. Mudar a cor de um item comprado é grátis.
- O avatar aparece na tela inicial, na lista de grupos, no ranking e na tela de vitória.

## 🗺️ Mundos e fases

| Mundo | Conceito | Fases |
|---|---|---|
| 🌱 1. Vale dos Primeiros Passos | Sequência lógica e orientação espacial | Acordando o Byte · Caminho das baterias · Desvio perigoso · A porta misteriosa · Primeiro grande escape |
| 🌲 2. Floresta das Repetições | Laços de repetição e otimização | Corredor infinito · Escadaria robótica · Energia perdida · Caminho simétrico · Fábrica de comandos |
| 🏰 3. Fortaleza das Decisões | Condições e sensores | Sensor de paredes · Chave misteriosa · Corredor de lasers · Duas possibilidades · Labirinto adaptável |
| 🧪 4. Laboratório dos Códigos | Variáveis, depuração e otimização | Bateria limitada · Contador de cristais · Código corrompido · Caminho econômico · Programação completa |
| 💠 5. Núcleo do Algoritmo | Integração de tudo | Labirinto misterioso · O perseguidor · Sala dos interruptores · Último circuito · O grande escape |

Algumas fases testam o mesmo programa em **2 ou 3 mapas diferentes**. Assim, um programa “decorado”
não funciona e os estudantes percebem por que precisam de **condições e sensores**.

### Blocos disponíveis

- **Movimento:** avançar, virar à esquerda, virar à direita
- **Repetição:** repetir 2/3/4/5/10 vezes (o número pode ser trocado), repetir até chegar ao portal, repetir enquanto
- **Condições:** se… então, se… senão (já prontos com “obstáculo”, “bateria”, “chave”, “porta”…)
- **Sensores:** obstáculo à frente, caminho à frente/esquerda/direita, objeto à frente, porta à frente, Byte tem chave, laser ligado, perigo à frente, energia, não
- **Variáveis:** criar variável, adicionar valor, diminuir valor, verificar valor
- **Controle:** quando iniciar, esperar, parar

Os blocos aparecem aos poucos, conforme o mundo. Nenhum bloco usa campo de digitação: tudo é escolhido
em listas, para o teclado virtual do tablet não aparecer.

---

## ⭐ Pontuação

Cada fase vale até **100 pontos**:

| Critério | Pontos |
|---|---|
| Concluir o desafio | 40 |
| Eficiência (quantidade de blocos em relação à solução ideal, com tolerância) | 20 |
| Uso do conceito da fase (repetição, SE/SENÃO, variável…) | 15 |
| Itens coletados (baterias e cristais) | 15 |
| Desafio extra da fase (ex.: “no máximo 5 blocos”) | 10 |

- ⭐ 1 estrela ao concluir · ⭐⭐ 70 pontos ou mais · ⭐⭐⭐ 90 pontos ou mais
- **Errar não tira pontos.** O estudante pode testar quantas soluções quiser.
- Vale sempre a **melhor** pontuação de cada fase (repetir não duplica nada).
- Soluções diferentes da “oficial” também são aceitas e pontuam.

---

## 🏆 Ranking e resultados

- O ranking mostra posição, grupo, pontos, fases concluídas, estrelas e mundos desbloqueados, com
  pódio animado. Há ranking **geral, por mundo, por fase e de conquistas**.
- Com o servidor das turmas: **ranking da turma** (☁️ 5º A, 5º B, 5º C) com os grupos de todos os aparelhos.
  Sempre há também o ranking **📍 Este aparelho**.
- Sem servidor, dá para reunir resultados de vários aparelhos: em cada um, use **Ranking → Exportar** (JSON ou CSV) e,
  no aparelho do professor, **Ranking → Importar**. Os arquivos levam turma e integrantes, mas não a senha de figuras.
- O CSV abre no Excel / Google Planilhas (separador `;`).
- Os grupos criados na versão antiga (“Jogador 1”, “Jogador 2”…) aparecem em **Jogadores antigos deste aparelho**:
  ao tocar, o grupo completa o cadastro (turma, nomes e senha) sem perder o progresso.

## 👩‍🏫 Para o professor

- **Modo demonstração:** em *Configurações*, **segure o botão por 3 segundos**. Ele libera todas as
  fases e o Laboratório e mostra “Ver solução” nas dicas (bom para projetar em sala).
- **Reiniciar progresso:** em *Configurações* (de um grupo ou do aparelho todo), sempre com confirmação.
  Reiniciar um grupo zera também as moedas e os itens comprados (e o progresso online).
- **Senha esquecida:** veja a coluna “Senha (figuras)” na planilha das turmas.
- **Tablets compartilhados:** ao terminar, *Configurações → Sair do grupo*. Para entrar de novo, o grupo usa a senha.
- **Qualidade gráfica “Leve”:** use em tablets mais simples se o 3D ficar lento.
- Se os dados salvos forem danificados, o jogo avisa, guarda uma cópia de segurança e recomeça sem travar.

---

## 🧪 Testes automáticos

Precisam de Node.js. O teste completo também precisa do Playwright.

```bash
cd labirinto-dos-algoritmos
node tests/teste-motor.js
```

Verifica, sem navegador, que as 25 fases têm solução com 100 pontos e testa movimento, colisões,
portas, lasers, interruptores, drones, perseguidor, energia, variáveis, SE/SENÃO e laços infinitos.

```bash
node tests/teste-completo.js
```

Joga as 25 fases pela interface, arrasta blocos com mouse **e com toque**, testa desbloqueio, pontuação,
estrelas, conquistas, ranking, salvamento, exportar/importar, dados corrompidos, Laboratório, layouts
de tablet (iPad e Android, retrato e paisagem) e o funcionamento **offline**. Também testa grupos e turmas,
avatar, moedas e loja, e o **salvamento online** entre dois aparelhos (com queda de internet), usando o
`google-apps-script/Code.gs` de verdade num servidor simulado (`tests/servidor-simulado.js`).
As capturas de tela ficam em `tests/resultados/`.

---

## 🗂️ Estrutura

```
labirinto-dos-algoritmos/
├── index.html              telas do jogo
├── config.json             endereço do servidor das turmas (vazio = só no aparelho)
├── manifest.webmanifest    PWA (instalar / tela cheia)
├── sw.js                   service worker (modo offline)
├── google-apps-script/     servidor das turmas (Code.gs) e passo a passo (LEIA-ME.md)
├── css/                    base, telas, fase e responsividade
├── js/
│   ├── levels.js           mundos, 25 fases e soluções de referência
│   ├── engine.js           grade lógica determinística (movimento, itens, portas, lasers…)
│   ├── interpreter.js      interpretador dos blocos (com proteção contra laço infinito)
│   ├── scoring.js          pontuação e estrelas
│   ├── achievements.js     conquistas
│   ├── storage.js          salvamento local, grupos, compras, exportar e importar
│   ├── cloud.js            salvamento online (fila quando está sem internet)
│   ├── avatars.js          avatares em SVG, itens da loja e moedas
│   ├── blocks.js           blocos Blockly em português e conversão blocos ⇄ programa
│   ├── byte3d.js           o robô Byte e suas animações
│   ├── scene3d.js          cenários 3D low poly (Three.js)
│   ├── game.js             tela da fase (editor + 3D + execução)
│   ├── ranking.js          rankings e pódio
│   ├── lab.js              Laboratório de Criação
│   ├── screens.js          mapa, conquistas, ajuda, configurações
│   ├── groups.js           início, turmas, grupo novo e senha de figuras
│   ├── shop.js             tela do avatar e loja
│   └── app.js              inicialização
├── vendor/                 Three.js r158 (MIT) e Blockly 11 (Apache 2.0), guardados localmente
├── assets/                 fonte Fredoka (OFL) e ícones
└── tests/                  testes automáticos
```

### Como alterar uma fase

As fases ficam em `js/levels.js`. Cada mapa é desenhado com texto:

```
'#######',      #  parede         .  chão          (espaço) buraco
'#S.B..#',      S  início         E  portal        B  bateria
'#####B#',      C  cristal        K  chave         D  porta
'#E.B..#',      L/M lasers        T/U interruptores
'#######'       |  trilho de drone
```

Depois de mudar uma fase, rode `node tests/teste-motor.js` para conferir se ela continua com solução.

## 🔒 Privacidade

O jogo pede só a **turma**, o **primeiro nome** (ou apelido) dos integrantes e uma **senha de figuras**. Não pede e-mail
nem outros dados pessoais. Sem o servidor das turmas, tudo fica no `localStorage` do aparelho e nada é enviado pela internet.
Com o servidor, os grupos e o progresso ficam também numa planilha **do Google Drive do professor** (nenhum outro
serviço é usado). Os nomes dos grupos de uma turma aparecem para quem escolhe aquela turma no jogo. Apague a planilha
quando o ano letivo terminar.

## Créditos

- [Three.js](https://threejs.org) — licença MIT
- [Blockly](https://developers.google.com/blockly) — licença Apache 2.0
- Fonte [Fredoka](https://fonts.google.com/specimen/Fredoka) — SIL Open Font License
