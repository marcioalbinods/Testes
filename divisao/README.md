# Divisão Passo a Passo (método da chave)

Site para resolver divisões passo a passo, do jeito que se faz no caderno.

## Como usar

1. Digite o **dividendo** e o **divisor** e clique em **Começar**.
2. O dividendo parcial fica destacado em amarelo. Escolha na **caixa de seleção** quantas vezes o divisor cabe nele.
3. O **produto** (divisor × algarismo escolhido) aparece embaixo do dividendo parcial.
   - Se o número for grande demais ou pequeno demais, o site avisa em vermelho.
4. Faça a **subtração** (diferença): clique em *Subtrair* ou, se marcar
   "Quero fazer a subtração sozinho", digite o resultado para conferir.
5. **Baixe** o próximo algarismo e repita até o fim.
6. No final aparecem o quociente, o resto e a prova real (divisor × quociente + resto = dividendo).

Também é possível ver a tabuada do divisor e a lista de todos os passos.

## Rodar

Basta abrir o arquivo `divisao/index.html` no navegador. Não precisa instalar nada.

## Publicar online (GitHub Pages)

No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**
(a publicação de todos os projetos é feita pelo arquivo `.github/workflows/pages.yml`, veja o README principal).
A cada alteração no `main` o site é publicado sozinho em
`https://marcioalbinods.github.io/Testes/divisao/`.
