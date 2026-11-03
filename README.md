# 📚 Meus Sites Educativos

Este repositório reúne os meus 4 projetos educativos, **cada um na sua própria pasta**.
A página inicial (`index.html`) tem atalhos para todos eles.

🏠 **Página inicial:** <https://marcioalbinods.github.io/Testes/>

| | Projeto | Pasta | Abrir online |
|---|---|---|---|
| ➗ | **Divisão Passo a Passo**: divisão pelo método da chave | [`divisao/`](divisao/) | [abrir](https://marcioalbinods.github.io/Testes/divisao/) |
| 🦊 | **Caçadores de Letras**: jogo de alfabetização (30 fases) | [`caca-as-letras/`](caca-as-letras/) | [jogar](https://marcioalbinods.github.io/Testes/caca-as-letras/) |
| 🤖 | **Labirinto dos Algoritmos**: programação em blocos (25 fases) | [`labirinto-dos-algoritmos/`](labirinto-dos-algoritmos/) | [jogar](https://marcioalbinods.github.io/Testes/labirinto-dos-algoritmos/) |
| 🎮 | **Kodu Academy**: plataforma do Kodu Game Lab com painel do professor | [`kodu-academy/`](kodu-academy/) | [abrir](https://marcioalbinods.github.io/Testes/kodu-academy/) |

Cada pasta tem um `README.md` com as instruções daquele projeto.

## Organização

```
Testes/
├── index.html                  ← página inicial com os atalhos
├── divisao/                    ← Divisão Passo a Passo
├── caca-as-letras/             ← Caçadores de Letras
├── labirinto-dos-algoritmos/   ← Labirinto dos Algoritmos
├── kodu-academy/               ← Kodu Academy (React + Supabase)
└── .github/workflows/pages.yml ← publica tudo no GitHub Pages
```

## Publicar online (GitHub Pages)

A Kodu Academy precisa ser compilada antes de ir para o ar, por isso a publicação é feita
automaticamente pelo GitHub Actions (arquivo `.github/workflows/pages.yml`), que junta os 4 projetos num site só.

Para ativar (uma vez só):

1. No GitHub, vá em **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **GitHub Actions**.
3. A cada alteração no `main`, os sites são testados e publicados sozinhos.
   Para publicar na hora: **Actions → “Publicar os sites no GitHub Pages” → Run workflow**.
