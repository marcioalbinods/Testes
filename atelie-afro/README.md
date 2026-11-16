# 🎨 Ateliê Afro — 50 desenhos, infinitas cores!

Aplicativo de colorir para o **2º ano do Ensino Fundamental** (7 e 8 anos), feito para as
atividades do **Novembro Negro** nas aulas de Educação Digital.

Valoriza a identidade negra, a beleza dos cabelos afro, a cultura afro-brasileira e o
protagonismo de pessoas negras. Não há jeito certo de pintar: a criança escolhe as cores livremente.

## O que tem

- **50 desenhos originais** em SVG vetorial, em 5 coleções de 10:
  1. Nossos cabelos, nossa beleza
  2. Nossa gente, nossas histórias
  3. Cultura afro-brasileira
  4. Arte, estampas e natureza
  5. Sonhos, talentos e possibilidades
- **Pintura por toque**: escolha a cor e toque numa área fechada. Só aquela área é pintada, e os contornos pretos ficam sempre por cima.
- **44 cores**, com 10 tons de pele do mais claro ao mais escuro (nenhum aparece como "o certo").
- **Ferramentas**: pintar, borracha, desfazer, refazer, aumentar e diminuir (também com dois dedos), ajustar, limpar (com confirmação), salvar imagem (PNG), "Terminei!" e tela cheia.
- **Galeria** com miniaturas coloridas e o estado de cada desenho: novo (círculo tracejado), começado (pincel azul) e pronto (estrela amarela).
- **Salvamento automático** no próprio aparelho (localStorage). Dá para apagar uma pintura (lixeira no cartão) ou todo o progresso (engrenagem na tela inicial).
- **Comemoração** com estrelas e mensagens ("Que lindo!", "Você arrasou!"…) e sons opcionais.
- **Funciona sem internet** depois de aberto uma vez (service worker) e pode ser instalado como aplicativo no Android ("Adicionar à tela inicial").
- Não pede nome, e-mail nem senha, e não coleta nenhum dado. Não usa banco de dados externo.

## Como abrir

- **No computador:** abra o arquivo `index.html` no navegador.
- **Online (GitHub Pages):** veja abaixo.

## Publicar no GitHub Pages

1. No repositório do GitHub, vá em **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **Deploy from a branch**.
3. Escolha a branch `main` e a pasta `/ (root)` e clique em **Save**.
4. Depois de alguns minutos o jogo fica em:
   `https://<seu-usuario>.github.io/<nome-do-repositorio>/atelie-afro/`

### Instalar nos tablets Android

Abra o endereço acima no Chrome do tablet, toque no menu **⋮** e depois em
**Adicionar à tela inicial** (ou **Instalar aplicativo**). Depois disso o Ateliê Afro abre como
um aplicativo e funciona mesmo sem internet.

## Organização do código

```
atelie-afro/
├── index.html              telas: início, galeria, pintura e janelas
├── css/style.css           visual (responsivo: paisagem, retrato e celular)
├── js/
│   ├── art/core.js         formas vetoriais (regiões fechadas, curvas, fitas)
│   ├── art/people.js       pessoas: rostos, 18 penteados afro, corpos e poses
│   ├── art/props.js        objetos: instrumentos, natureza, escola, profissões
│   ├── desenhos/           registro + as 5 coleções (colecao1.js … colecao5.js)
│   ├── paleta.js           as 44 cores
│   ├── pintura.js          ferramenta de pintura, zoom, desfazer e salvar imagem
│   ├── galeria.js          galeria e miniaturas
│   ├── salvar.js           salvamento no aparelho
│   ├── som.js              efeitos sonoros (gerados no navegador)
│   ├── icones.js           ícones
│   └── app.js              navegação, comemoração e tela inicial
├── sw.js, manifest.webmanifest   funcionamento offline e instalação
├── assets/                 ícones e fonte Fredoka (licença OFL)
└── tools/                  scripts de verificação (não são usados pelo jogo)
```

## Verificação automática

Com Node.js e Playwright instalados, dentro da pasta `atelie-afro`:

```bash
python3 -m http.server 8765
```

```bash
node tools/verificar.js
```

O script confere: 50 desenhos, 10 por coleção, regiões coloríveis e fechadas, toque pintando só a
região certa em todos os desenhos, desfazer/refazer, borracha, limpar, salvamento automático,
progresso após recarregar, estados na galeria, telas pequenas sem rolagem horizontal, botões
funcionando e ausência de dependências externas.
