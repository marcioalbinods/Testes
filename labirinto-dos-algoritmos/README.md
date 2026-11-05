# 🤖 Labirinto dos Algoritmos

**Jogo educativo de programação em blocos para o 5º ano do Ensino Fundamental (Educação Digital).**

O robô **Byte** está preso em labirintos de um universo tecnológico. Para escapar, os estudantes montam
algoritmos com blocos encaixáveis (no estilo Scratch) e veem o Byte executar cada comando em um
cenário **3D low poly** com câmera isométrica.

- **25 fases** em **5 mundos**, com dificuldade progressiva
- **Programação em blocos real** (Blockly): os blocos são lidos por um interpretador próprio e executados passo a passo
- O bloco que está rodando fica **destacado** enquanto o Byte se move
- **Pontuação** de até 100 por fase, **3 estrelas**, **23 conquistas** e **rankings locais** com pódio
- **Laboratório de Criação** (liberado após as 25 fases) para criar e testar labirintos
- Feito para **tablets** (toque, botões grandes, retrato e paisagem) e computadores
- **Sem cadastro, sem login, sem banco de dados, sem servidor.** Tudo fica salvo no próprio aparelho
- Funciona **offline** depois do primeiro acesso (PWA)

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

## 🏆 Ranking (local) e resultados

- Não há cadastro: ao criar um jogador, o estudante pode **digitar o nome** (opcional, até 20 letras) ou tocar em “Pular” e ser o **“Jogador 1”, “Jogador 2”…**. O nome pode ser trocado no botão ✏️ ou em *Configurações*.
- O ranking mostra posição, jogador, pontos, fases concluídas, estrelas e mundos desbloqueados, com
  pódio animado. Há ranking **geral, por mundo, por fase e de conquistas**.
- **O ranking é local:** cada tablet ou computador tem o seu. Não existe competição online.
- Para reunir resultados de vários aparelhos: em cada um, use **Ranking → Exportar** (JSON ou CSV) e,
  no aparelho do professor, **Ranking → Importar**. Os jogadores de outros aparelhos aparecem com o
  código do aparelho (ex.: “Ana · aparelho K7MP”). Os arquivos exportados levam o nome digitado. Nada é enviado pela internet.
- O CSV abre no Excel / Google Planilhas (separador `;`).

## 👩‍🏫 Para o professor

- **Modo demonstração:** em *Configurações*, **segure o botão por 3 segundos**. Ele libera todas as
  fases e o Laboratório e mostra “Ver solução” nas dicas (bom para projetar em sala).
- **Reiniciar progresso:** em *Configurações* (de um jogador ou do aparelho todo), sempre com confirmação.
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
de tablet (iPad e Android, retrato e paisagem) e o funcionamento **offline**. As capturas de tela ficam
em `tests/resultados/`.

---

## 🗂️ Estrutura

```
labirinto-dos-algoritmos/
├── index.html              telas do jogo
├── manifest.webmanifest    PWA (instalar / tela cheia)
├── sw.js                   service worker (modo offline)
├── css/                    base, telas, fase e responsividade
├── js/
│   ├── levels.js           mundos, 25 fases e soluções de referência
│   ├── engine.js           grade lógica determinística (movimento, itens, portas, lasers…)
│   ├── interpreter.js      interpretador dos blocos (com proteção contra laço infinito)
│   ├── scoring.js          pontuação e estrelas
│   ├── achievements.js     conquistas
│   ├── storage.js          salvamento local, exportar e importar
│   ├── blocks.js           blocos Blockly em português e conversão blocos ⇄ programa
│   ├── byte3d.js           o robô Byte e suas animações
│   ├── scene3d.js          cenários 3D low poly (Three.js)
│   ├── game.js             tela da fase (editor + 3D + execução)
│   ├── ranking.js          rankings e pódio
│   ├── lab.js              Laboratório de Criação
│   ├── screens.js          início, mapa, conquistas, ajuda, configurações
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

O jogo não pede e-mail, turma ou senha. O nome do jogador é **opcional** e fica só no aparelho (e nos arquivos que o professor exportar). O jogo não usa Supabase, Firebase ou
outro banco de dados e não envia nenhuma informação para a internet. Todo o progresso fica no
`localStorage` do navegador do próprio aparelho.

## Créditos

- [Three.js](https://threejs.org) — licença MIT
- [Blockly](https://developers.google.com/blockly) — licença Apache 2.0
- Fonte [Fredoka](https://fonts.google.com/specimen/Fredoka) — SIL Open Font License
