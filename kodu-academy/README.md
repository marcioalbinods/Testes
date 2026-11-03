# Kodu Academy

Plataforma web para alunos do Ensino Fundamental aprenderem **Kodu Game Lab** de forma autônoma, em **20 fases** (5 módulos × 4 fases), do primeiro mundo até um jogo autoral completo — com **painel do professor** para acompanhar cada aluno.

- **Aluno:** entra com um código individual (sem e-mail), segue missões com passo a passo detalhado, checklist com salvamento automático, 3 níveis de dica, “Se não funcionar”, teste corrigido no servidor, reflexão e revisão. A próxima fase só abre quando os critérios são cumpridos.
- **Professor:** turmas, cadastro de alunos e códigos, visão geral, acompanhamento com filtros, mapa de fases, relatório individual (checklists, respostas, tentativas, dicas, reflexões, histórico), liberação manual de fases com registro de motivo, exportação CSV.

> **Situação atual:** o código está completo e testado. O uso real em sala depende de criar o projeto Supabase e publicar o site (passos abaixo, seção 3). Enquanto o Supabase não estiver configurado, o site funciona em **modo demonstração**, claramente sinalizado, com dados apenas no navegador.

---

## 1. Arquitetura

| Parte | Tecnologia | Observação |
|---|---|---|
| Interface | React 18 + TypeScript + Vite | `HashRouter` (funciona no GitHub Pages sem configuração) |
| Hospedagem | GitHub Pages via GitHub Actions | `.github/workflows/deploy.yml` |
| Banco e autenticação | Supabase (PostgreSQL + Auth) | plano gratuito atende uma escola |
| Segurança | Row Level Security em todas as tabelas + funções SQL validadas | alunos não escrevem diretamente em tabelas |

**Como os alunos se identificam:** o professor cadastra o aluno e o sistema gera um código (ex.: `K7MP-4XQA`, sem caracteres ambíguos). No navegador, o aluno recebe uma sessão anônima do Supabase Auth; ao digitar o código, a função `student_login` vincula essa sessão ao aluno. O mesmo código funciona em qualquer computador. O código é guardado só como **HMAC-SHA256 com segredo no servidor** — nem o professor consegue lê-lo depois de gerado (por isso ele é exibido uma única vez; se perder, gera-se outro). Há limite de tentativas (8 erros em 15 min por sessão e limite global).

**Como os professores se identificam:** e-mail e senha no Supabase Auth. Uma conta só vira “professor” quando o administrador executa `private.promote_to_teacher(...)` no SQL Editor — não existe cadastro público de professor.

**Integridade do progresso:** toda escrita do aluno passa por funções SQL (`save_checklist`, `submit_quiz`, `complete_phase`...) que verificam se a fase está liberada e se os critérios foram cumpridos. **O gabarito dos testes fica só no banco** (tabela `quiz_keys`, sem acesso para alunos e professores) e não entra no site publicado quando o Supabase está configurado.

**Critérios de conclusão de cada fase** (iguais no servidor e na interface): todos os itens obrigatórios do checklist + aprovação no teste (mínimo por fase) + reflexão com ≥ 20 caracteres + confirmação de revisão das instruções.

## 2. Estrutura de pastas

```
src/
  content/            ← CONTEÚDO PEDAGÓGICO (edite aqui)
    phases/module1..5.ts   20 fases, cada uma com os 20 elementos exigidos
    quizKeys.ts            gabarito (vai para o banco; não é importado pela interface real)
    glossary.ts, modules.ts, tiles.ts (blocos do Kodu conferidos no código-fonte oficial)
    validate.ts            verificações automáticas de completude
  lib/                progressão, correção, análises do painel, CSV
  services/           supabaseBackend.ts (real) e demoBackend.ts (demonstração)
  pages/              páginas do aluno, do professor e públicas
  components/         layout, regras ilustradas, diagramas, seções da fase
supabase/
  migrations/         esquema, funções, segurança (RLS) e conteúdo (gerado)
  tests/              testes SQL de segurança (rodam num PostgreSQL local)
scripts/              gerador do SQL de conteúdo e teste do banco
docs/                 guias rápidos do professor e do aluno
```

## 3. Configuração para uso real (o que depende de você)

### 3.1 Criar o banco no Supabase (≈ 15 min)
1. Crie uma conta em <https://supabase.com> e um **novo projeto** (região sugerida: *South America (São Paulo)*). Guarde a senha do banco.
2. Abra **SQL Editor** → *New query*, cole todo o conteúdo de **`supabase/setup-completo.sql`** e clique em *Run* (ele contém as 4 migrações abaixo, já em ordem). Se preferir, execute cada arquivo de `supabase/migrations/` nesta ordem:
   1. `20261027000001_schema.sql`
   2. `20261027000002_functions.sql`
   3. `20261027000003_security.sql`
   4. `20261027000004_content.sql`
   (Alternativa: com o Supabase CLI, `supabase link` e `supabase db push`.)
3. **Authentication → Sign In / Providers:** ative **“Allow anonymous sign-ins”** (é o que permite o login dos alunos por código). Mantenha a confirmação de e-mail ativada.
   *Observação:* mesmo que alguém crie uma conta por e-mail, ela não tem acesso a nada — o papel de professor só é dado pelo passo 5.
4. **Authentication → Users → Add user → Create new user:** crie sua conta de professor (e-mail + senha forte, marque *Auto Confirm User*).
5. No **SQL Editor**, execute (com seus dados):
   ```sql
   select private.promote_to_teacher('seu-email@escola.br', 'Prof. Seu Nome');
   ```
6. **Project Settings → API** (ou *Data API*): copie a **Project URL** e a chave **anon / publishable**.
   ⚠️ Nunca use a chave `service_role`/`secret` no site.
7. (Recomendado) **Authentication → Attack Protection:** ative CAPTCHA se notar abuso; revise os limites de *Rate Limits* para login anônimo (a escola inteira pode compartilhar o mesmo IP — aumente o limite de anônimos por hora se muitos alunos entrarem ao mesmo tempo).

### 3.2 Publicar no GitHub Pages
Este projeto fica na pasta `kodu-academy/` do repositório [`Testes`](https://github.com/marcioalbinods/Testes),
junto com os outros sites. A publicação é feita pelo arquivo `.github/workflows/pages.yml` (na raiz do repositório),
que testa, compila a Kodu Academy e publica tudo junto.

1. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Coloque a **Project URL** e a chave **publishable/anon** no arquivo `kodu-academy/.env.production` (são valores públicos por natureza; a publicação valida o formato e recusa chaves secretas).
3. **Actions → “Publicar os sites no GitHub Pages” → Run workflow** (ou faça um novo push no `main`). O endereço fica: `https://marcioalbinods.github.io/Testes/kodu-academy/`.
4. Abra o site: o aviso amarelo de “Modo demonstração” **não** deve aparecer. Entre como professor, crie uma turma de teste, cadastre um aluno fictício identificado como teste (ex.: “TESTE – apagar”), entre com o código em outra janela anônima e conclua a fase 1. Depois exclua a turma de teste.

### 3.3 Antes de usar com os alunos
- Instale o Kodu Game Lab nos computadores (Windows) e confirme a versão.
- Informe as famílias/escola sobre o uso da plataforma (ver seção 6) conforme a política da escola.
- Teste em um computador da sala o acesso ao endereço do site e ao `*.supabase.co` (proxies escolares podem bloquear).

## 4. Desenvolvimento e testes

```bash
cd kodu-academy
npm install
npm run dev          # http://localhost:5173 (modo demonstração se não houver .env.local)
npm test             # 42 testes: conteúdo, progressão, CSV, análises, backend de demonstração e fluxos da interface
npm run typecheck
npm run test:db      # aplica as migrações num PostgreSQL local temporário e roda 76 verificações de segurança/RLS
npm run build
```
Para desenvolver contra o Supabase real, copie `.env.example` para `.env.local` e preencha.

O que os testes verificam (resumo): 20 fases completas e coerentes; gabarito válido; fases bloqueadas/liberadas; critérios de conclusão; salvamento e recuperação do progresso (inclusive em outro dispositivo); um aluno não vê dados de outro; professor só vê as próprias turmas; aluno não lê o gabarito nem o hash do código; escrita direta em tabelas negada; liberação manual com motivo e histórico; redefinição de código encerra sessões; limite de tentativas; exclusão em cascata; CSV válido (com proteção contra injeção de fórmulas); filtros e exportação do painel; validação de formulários.

## 5. Como editar ou acrescentar conteúdo
1. Edite a fase em `src/content/phases/moduleN.ts` (o tipo `Phase` em `src/content/types.ts` documenta cada campo). Gabarito em `src/content/quizKeys.ts`.
2. Rode `npm run gen:sql` — valida o conteúdo e regenera `supabase/migrations/20261027000004_content.sql`.
3. Execute esse arquivo no SQL Editor do Supabase (atualiza checklists obrigatórios e gabarito) e faça push (o site é republicado).
4. `npm test` acusa se algo ficou incompleto (ex.: pergunta sem gabarito, fase sem 3 dicas).

Mudar ids de itens de checklist de uma fase já usada pode deixar itens antigos marcados “órfãos”: prefira manter os ids.

## 6. Privacidade (LGPD) e segurança
- Coleta mínima: nome de exibição (recomenda-se primeiro nome + inicial), turma, datas e progresso. Sem e-mail, CPF, telefone, endereço ou foto de alunos. Sem anúncios, rastreadores ou fontes externas.
- Aluno vê só os próprios dados; professor vê só as próprias turmas (RLS no banco, testado).
- Códigos com hash; senhas de professor gerenciadas pelo Supabase Auth.
- Exclusão: aluno (com cascata) ou turma inteira; histórico administrativo sem dados pessoais.
- A escola é a controladora dos dados: registre a finalidade, informe as famílias e defina a retenção (sugestão: até o fim do ano letivo). Página “Privacidade” do site traz o texto para as famílias.
- Sessões anônimas antigas acumulam em *Authentication → Users*; elas não contêm dados pessoais e podem ser apagadas periodicamente.

## 7. Sobre o conteúdo do Kodu
Nomes de ferramentas, controles de mouse e blocos (sensores, filtros, ações, modificadores) foram conferidos no **código-fonte oficial** do Kodu Game Lab (repositório público Microsoft/KoduGameLab: arquivos de cartas, textos de interface e ajuda). Exemplos de detalhes verificados: o comportamento padrão de `scored` sem comparação é “igual” (por isso a trilha ensina `>=`); o `timer` se repete; o Kodu flutua sobre a água (`on water` funciona como perigo). Diferenças entre versões estão indicadas nas fases. As figuras de regras são representações ilustrativas, não capturas de tela.

**Limitações conhecidas:** o checklist é autodeclarado (o servidor garante o teste e os demais critérios, mas não consegue “ver” o mundo do Kodu) — confira por amostragem os mundos salvos, especialmente nas fases 12, 16 e 20. A trilha usa a interface de teclado e mouse.

Kodu Game Lab é um software originalmente da Microsoft Research; este projeto é independente e não afiliado.
