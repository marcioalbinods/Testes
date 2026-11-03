# 🤖 O que vem primeiro? — Missão Passo a Passo

**Jogo educativo de sequências lógicas para o 3º ano do Ensino Fundamental (9 e 10 anos).**

Habilidade trabalhada — **EF03TPA03**: *Desenvolver a capacidade lógica por meio da identificação e
estruturação passo a passo das ações para a resolução de tarefas propostas.*

O robô **Pipo** precisa realizar tarefas do dia a dia, mas as instruções dele ficaram embaralhadas.
Os estudantes descobrem o que vem primeiro, o que vem depois e como concluir cada tarefa. Depois de
organizar, o Pipo **executa a sequência na tela**: se estiver certa, a tarefa é concluída; se estiver
fora de ordem, acontece uma situação engraçada que ajuda a entender o erro.

- **15 missões** em **3 níveis** (fácil, médio e desafiador), todas jogáveis
- **84 ilustrações próprias** em SVG (nada de emojis no lugar das imagens)
- **6 tipos de atividade** + simulação do robô
- Aceita **todas as ordens logicamente válidas** (não só uma resposta)
- Dicas que fazem pensar, sem punir o erro; tentativas ilimitadas
- Pontuação, estrelas e 4 medalhas
- Funciona com **toque** (tablets Android e iPad), **mouse** e **teclado**
- **Sem cadastro, sem login, sem banco de dados, sem servidor.** Nenhum dado pessoal é coletado
- Funciona **offline** depois do primeiro acesso (PWA)

---

## ▶️ Como executar

O jogo é um site estático (HTML, CSS e JavaScript puro). Não precisa instalar nada.

1. **Direto no navegador:** dê dois cliques em `index.html`.
   Tudo funciona, exceto o modo offline (que exige um endereço `http`).
2. **Com um servidor local** (para testar o modo offline):

   ```bash
   cd "3o ano/o-que-vem-primeiro"
   python3 -m http.server 8000
   ```

   e abra <http://localhost:8000> no navegador.

Navegadores recomendados: Chrome / Edge (Windows, Android, ChromeOS) e Safari (iPad, Mac), em versões atuais.

## 🌐 Publicar no GitHub Pages

1. No GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
2. Escolha a branch `main` e a pasta `/ (root)` e salve.
3. Em 1 ou 2 minutos o jogo fica em:

   `https://<seu-usuario>.github.io/<nome-do-repositorio>/3o%20ano/o-que-vem-primeiro/`

Todos os caminhos são relativos. Depois de abrir uma vez com internet, o jogo funciona **sem internet**.
No tablet, use “Adicionar à tela inicial” para abrir em tela cheia, como um aplicativo.

---

## 🗺️ Missões

| Nível | Missão | Tipo de atividade |
|---|---|---|
| **1 · Aprendiz de Organização** (fácil, 3 etapas) | 1. Escovando os dentes | Organize as etapas + simulação |
| | 2. Lavando as mãos | Organize as etapas + simulação |
| | 3. Calçando os sapatos | O que acontece depois? (2 perguntas) |
| | 4. Preparando um sanduíche | Organize as etapas + simulação |
| | 5. Plantando uma semente | Organize + o que acontece depois? |
| **2 · Organizador de Tarefas** (médio, 5 etapas) | 6. Organizando a mochila | Organize (várias ordens válidas) |
| | 7. Salada de frutas | Qual etapa falta? + organize |
| | 8. Preparando-se para a escola | Organize (várias ordens válidas) |
| | 9. Construindo uma torre | O que vem depois? + organize |
| | 10. Organizando o quarto | Qual etapa falta? + organize (várias ordens) |
| **3 · Mestre das Sequências** (desafiador) | 11. O robô precisa de ajuda! | Descubra o erro (2 etapas trocadas) |
| | 12. Qual etapa está faltando? | 5 etapas, 4 opções de resposta |
| | 13. A missão da horta | Organize 6 etapas |
| | 14. Duas maneiras de resolver | Encontre uma ordem e depois **outra diferente** (12 ordens válidas) |
| | 15. O grande desafio da lógica | Ação desnecessária → organizar 6 etapas → corrigir o plano da barraca → escolher o plano da volta |

### Como o jogo aceita mais de uma resposta

Cada etapa sabe **de quais outras etapas depende** (por exemplo, “Vestir o uniforme” depende de
“Higienizar-se”). Uma sequência está correta quando **todas as dependências são respeitadas**.
Assim, todas as ordens que fazem sentido são aceitas automaticamente. Exemplos:

- Missão 8: tomar café antes **ou** depois de vestir o uniforme — as duas valem.
- Missão 14: existem 12 maneiras corretas de arrumar os materiais; o estudante precisa achar duas.
- Missão 15: varetas antes **ou** depois das estacas — tanto faz.

## 🎮 Formas de interação

- **Arrastar e soltar** os cartões (dedo, caneta ou mouse)
- **Tocar em dois cartões** para trocá-los de lugar
- **Setas ◀ ▶** embaixo de cada cartão (alternativa acessível)
- **Teclado:** Tab escolhe o cartão, Enter seleciona, setas movem
- Botão **Ouvir** (leitura em voz alta, quando o aparelho tem voz em português)

## ⭐ Pontuação e conquistas

| Item | Pontos |
|---|---|
| Missão concluída | 100 |
| Sem usar dicas | +30 |
| Pensou antes de agir (nenhuma tentativa errada) | +20 |
| Investigador: cada etapa errada descoberta e corrigida | +25 |
| Missão 14: descobriu outra maneira | +30 |

Estrelas: ⭐⭐⭐ sem erros e sem dicas · ⭐⭐ até 2 erros/dicas · ⭐ concluiu.
O jogo guarda **a melhor pontuação** de cada missão. Não existe cronômetro: o jogo valoriza o raciocínio,
não a velocidade.

Medalhas: **Estrela de Aprendiz** (Nível 1), **Medalha de Organizador** (Nível 2),
**Troféu de Investigador** (Missões 11 e 12) e **Medalha de Mestre da Lógica** (todas as 15 missões).

## 👩‍🏫 Área do professor

As missões são liberadas uma de cada vez. Para testar qualquer fase:

1. Tela inicial → **Como jogar** → **Área do professor** (ou abra o endereço com `?professor` no final).
2. Digite o código **3030**.
3. Ative **“Liberar todas as missões para teste”** e use os botões **Testar** de cada missão.

No mesmo painel é possível **apagar o progresso** do aparelho. Desligue o modo de teste antes de entregar
o aparelho aos estudantes.

## 🔒 Privacidade

O progresso (missões concluídas, pontos e estrelas) fica salvo apenas no navegador do aparelho
(`localStorage`). O jogo não pede nome, e-mail ou qualquer dado pessoal e não envia nada para a internet.

---

## 🧩 Estrutura do código

```
o-que-vem-primeiro/
├── index.html            página única do jogo
├── manifest.webmanifest  instalação como aplicativo (PWA)
├── sw.js                 modo offline
├── css/style.css         visual e layout responsivo
├── js/
│   ├── logic.js          regras: validação de ordens, pontuação, medalhas (sem tela, testável)
│   ├── data.js           as 15 missões: textos, etapas, dependências, dicas e feedbacks
│   ├── art.js            kit de ilustração SVG + 84 cenas
│   ├── robot.js          o robô Pipo e suas expressões
│   ├── activities.js     mecânicas (organizar, depois, falta, erro, desnecessária, plano) e simulação
│   ├── mission.js        condução da missão: etapas, dicas, pausa, resultado
│   ├── screens.js        início, mapa, como jogar, conquistas, professor, encerramento
│   ├── ui.js, audio.js, store.js, app.js
├── assets/               fonte Fredoka (licença OFL) e ícones
└── tests/
    ├── teste-logica.js   confere as 15 missões e as regras (node)
    └── teste-completo.js joga as 15 missões no navegador (Playwright)
```

### Testes

```bash
node tests/teste-logica.js
```

```bash
node tests/teste-completo.js
```

O teste completo joga as 15 missões pela interface usando toque, arraste com mouse, arraste com o dedo,
setas e teclado; confere pontuação, desbloqueio em ordem, medalhas, progresso salvo após recarregar,
pausa, reinício, modo professor, 5 tamanhos de tela (notebook, tablet deitado e em pé, iPad, celular) e
a ausência de erros no navegador. As capturas de tela ficam em `tests/capturas/`.
