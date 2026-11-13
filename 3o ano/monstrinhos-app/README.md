# 🧪 MONSTRINHOS! – O Laboratório das Criaturas Fantásticas

Jogo educativo de criação digital para o **3º ano** (8 e 9 anos), aulas de Educação Digital, em tablets e notebooks.

**Habilidade:** EF03TPA05 – Desenvolver processos de produções autorais a partir de imagens, sons e vídeos, com senso estético.

As duplas inventam um monstrinho peça por peça, dão vida a ele (movimentos, expressões, dança, sons e voz),
criam a identidade (personalidade, comida, superpoder, gostos, passaporte), constroem um habitat, vivem
5 aventuras com a própria criatura e produzem uma história em quadrinhos animada. Tudo é salvo na nuvem
(Supabase) e continua na aula seguinte, em qualquer aparelho, com o código da dupla.

- Código-fonte: esta pasta (`3o ano/monstrinhos-app/`)
- Site pronto para publicar: `3o ano/monstrinhos/` (gerado pelo `npm run build`)
- Banco de dados: [`supabase/migrations/20261112000000_monstrinhos.sql`](supabase/migrations/20261112000000_monstrinhos.sql)

---

## 1. O que o jogo tem

| Etapa | Missões | O que a dupla cria |
|---|---|---|
| 1. O Laboratório de Criação | 1 a 5 | Editor de personagens: 15 cabeças, 10 corpos, 20 olhos, 20 bocas, 15 orelhas, 15 chifres, 8 antenas, 6 espinhos, 15 braços, 15 pernas, 20 caudas, 8 asas, 20 enfeites, 11 texturas, 30 cores. Arrastar, tamanho, girar, espelhar, desfazer/refazer, "surpresa", animação de nascimento (ovo) e nome. |
| 2. Dê Vida ao seu Monstrinho | 6 a 10 | 9 animações personalizáveis (velocidade e tamanho), editor de expressões (sobrancelhas, olhos, boca, efeitos, olhar), coreografia com 8 passos e 6 músicas, laboratório de 29 sons sintetizados com linha do tempo de 3 trilhas × 8 batidas, volume e "voz grossa/fina", gravação de voz (quando a turma permite). |
| 3. Quem é meu Monstrinho? | 11 a 15 | Personalidade (8 jeitos), comida favorita (arrastar até a boca), 12 superpoderes com efeitos, gostos, medos imaginários, hábitos, lugar favorito e o **Passaporte do Monstrinho** (com carimbo e impressão). |
| 4. Construa seu Habitat | 16 a 20 | 7 mundos, 8 céus, 6 climas, 6 efeitos de luz e ~45 objetos (árvores, pedras, rio, lago, cachoeira, casas, cavernas, plantas, bichinhos...). Arrastar, redimensionar, girar, espelhar, duplicar, excluir, camadas, desfazer. **EXPLORAR MEU MUNDO!** com setas do teclado, botões na tela ou toque; objetos reagem com animação e som. |
| 5. As Grandes Aventuras | 21 a 25 | Floresta misteriosa (6 tesouros escondidos em lugares diferentes para cada dupla, pistas e surpresas), O amigo perdido (conversa + 4 jeitos de ajudar, inclusive usando o superpoder, o som e a comida que a dupla criou + cartão), A ponte quebrada (várias soluções: ponte de objetos, cogumelo, balões, cipó, asas, superpoder), A grande tempestade (no habitat da dupla, construir abrigo; pode guardar o abrigo no habitat), A festa (convidados, decoração, música, danças, efeitos e o show). |
| 6. Meu Estúdio de Histórias | 26 a 30 | Editor de 4 a 10 quadros: cenários (o habitat da dupla, lugares das aventuras, mundos, cores), personagens, expressões, movimentos, balões (fala, pensamento, grito, legenda), texto do narrador, efeito sonoro, narração gravada, duração e transição. **ASSISTIR À MINHA HISTÓRIA!** e publicação na **exposição privada da dupla**. |

Progressão: mapa de ilhas com missões que se desbloqueiam em ordem, estrelas (1 a 3, valorizando experimentar),
6 medalhas de etapa, 19 troféus, comemorações. **Sem ranking entre crianças**, sem tempo, sem punição.
Depois de concluir, a dupla pode voltar a qualquer ferramenta e modificar suas criações ("Criar à vontade").

Acessibilidade: botões grandes, frases curtas, guia (Zuzu), botão 🔊 em cada missão e opção "Ler em voz alta"
(voz do próprio aparelho), sons e volume ajustáveis, respeita "reduzir movimento" do sistema.

---

## 2. Configurar o Supabase (passo a passo, uma vez só)

Você precisa de uma conta gratuita em <https://supabase.com>.

1. **Criar o projeto:** no painel do Supabase clique em **New project**. Escolha um nome (ex.: `monstrinhos`),
   uma senha forte para o banco (guarde-a) e a região **South America (São Paulo)**. Aguarde ficar pronto.
2. **Criar as tabelas, a segurança e o armazenamento:** abra **SQL Editor → New query**, copie TODO o conteúdo de
   [`supabase/migrations/20261112000000_monstrinhos.sql`](supabase/migrations/20261112000000_monstrinhos.sql),
   cole e clique em **Run**. Deve aparecer “Success”. (Pode rodar de novo sem problema.)
   Isso cria: tabelas, políticas RLS, funções seguras, o bucket privado `gravacoes` do Storage e as políticas dele.
3. **Ligar o login anônimo dos estudantes:** **Authentication → Sign In / Providers** (ou *Providers*) →
   ative **Allow anonymous sign-ins** → **Save**. Deixe **Allow new users to sign up** ligado
   (é exigido para o login anônimo). As crianças **não** criam conta, e-mail nem senha.
4. **Ajustar o limite de entradas por rede:** toda a escola costuma usar a mesma internet (mesmo IP).
   Em **Authentication → Rate Limits**, aumente **Anonymous sign-ins** para pelo menos **150 por hora**.
   (Cada aparelho entra uma vez e reaproveita a sessão.)
5. **Criar a conta do professor:** **Authentication → Users → Add user → Create new user**, informe seu e-mail e
   uma senha forte e marque **Auto Confirm User**. Depois, no **SQL Editor**, rode (trocando o e-mail):

   ```sql
   insert into public.teachers (user_id, name)
   select id, 'Prof. Márcio' from auth.users where email = 'seu-email@escola.com'
   on conflict do nothing;
   ```

   Repita para cada professor que deve ver as turmas.
6. **Copiar o endereço e a chave pública:** **Project Settings → API** (ou *Data API / API Keys*):
   copie a **Project URL** e a chave **anon / publishable**.
   ⚠️ **Nunca** use a chave `service_role` / `secret` no site. O jogo recusa essa chave se ela for colocada por engano.

### Edge Functions

Não são necessárias. Tudo o que precisa de servidor (criar projeto, gerar código, validar código com limite de
tentativas, salvar com controle de versão, ações do professor) roda **dentro do banco**, em funções
`SECURITY DEFINER` que conferem a permissão antes de agir. Isso dá a mesma segurança de uma Edge Function e a
instalação fica muito mais simples (só o passo 2, sem linha de comando).

## 3. Ligar o site ao Supabase

**Jeito fácil (sem programar):** edite o arquivo `3o ano/monstrinhos/config.json` (no GitHub: abra o arquivo →
ícone de lápis → cole os valores → *Commit changes*):

```json
{
  "supabaseUrl": "https://SEU-PROJETO.supabase.co",
  "supabaseAnonKey": "COLE-AQUI-A-CHAVE-ANON-PUBLICA"
}
```

**Jeito alternativo (ao gerar o site):** copie `.env.example` para `.env`, preencha `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY` e rode `npm run build`.

Enquanto nada for configurado, o jogo mostra a tela “Falta configurar o salvamento online”.

## 4. Publicar o site

O site já está pronto na pasta `3o ano/monstrinhos/`. Com o GitHub Pages ativado no repositório
(**Settings → Pages → Deploy from a branch → `main` / root**), ele fica em:

`https://<seu-usuario>.github.io/<repositorio>/3o%20ano/monstrinhos/`

Também está listado em `3o ano/index.html`. Funciona em qualquer hospedagem de site estático
(Netlify, Vercel, servidor da escola): basta copiar a pasta `3o ano/monstrinhos/`.

Para gerar de novo depois de mudar o código:

```bash
cd "3o ano/monstrinhos-app"
```

```bash
npm install
```

```bash
npm run build
```

O `build` apaga e recria `3o ano/monstrinhos/` — confira o `config.json` depois (ou use o `.env`).

## 5. Painel do professor

Endereço: o mesmo do jogo com `#/professor` no final (há também o link “Área do professor” na tela inicial):
`https://<seu-usuario>.github.io/<repositorio>/3o%20ano/monstrinhos/#/professor`

Entre com o e-mail e a senha do passo 5. O painel tem:

- **Visão geral:** duplas cadastradas, projetos iniciados e concluídos, progresso médio, últimos acessos.
- **Abas 3º A, 3º B, 3º C:** nomes, **código**, criação, último acesso, etapa e missão atual, % de progresso.
  - 👁️ **Ver:** monstrinho, personalizações, sons/gravações, passaporte, habitat, aventuras, histórias (assistir) e
    **versões anteriores** (cópias automáticas a cada 20 min de trabalho, com botão Restaurar).
  - ♻️ **Reiniciar** (guarda cópia em “Projetos anteriores”), 🧹 **Excluir projeto** (apaga criações e gravações, mantém dupla e código),
    🗑️ **Excluir dupla** (apaga tudo; exige digitar EXCLUIR).
  - ♻️ **Reiniciar turma** (exige digitar a turma; só aquela turma é afetada).
  - 🎙️ **Gravação de voz: permitida/bloqueada** — começa **bloqueada** em todas as turmas. Libere só com a autorização da escola.
  - 🖨️ **Cartões de código** para imprimir e entregar às duplas.
- **Projetos anteriores:** cópias guardadas nos reinícios (ver e excluir).
- **📄 Exportar relatório:** planilha CSV (abre no Excel/Google Planilhas).

Toda exclusão/reinício pede confirmação.

## 6. Guia de uso em sala

1. **Primeira aula:** cada dupla toca em **✨ Novo projeto**, escolhe a turma, escreve só o **primeiro nome** de cada um e
   toca em **COMEÇAR A AVENTURA!**. Aparece o **código secreto** (ex.: `4KUC-FVTN`): a dupla anota no caderno
   (o professor também vê o código no painel e pode imprimir os cartões).
2. **Durante a aula:** o indicador no topo mostra **Tudo salvo! / Salvando... / Sem conexão / Reconectando... / Erro ao salvar**.
   Se a internet cair, o jogo continua e guarda tudo no aparelho; quando a internet volta, envia sozinho.
3. **Fim da aula:** ⚙️ Menu → **Terminar por hoje / Trocar de dupla**. O trabalho vai para a nuvem e o aparelho fica livre para outra dupla.
4. **Próximas aulas (qualquer aparelho):** **🔑 Já tenho meu projeto** → digitar o código → continua de onde parou.
   Se for o mesmo aparelho e menos de 3 horas depois, aparece **▶ Continuar**. Depois de 3 horas o código é pedido de novo
   (protege a dupla em aparelhos compartilhados).
5. Se a mesma dupla tentar criar outro projeto com os mesmos nomes, o jogo avisa e pede o código (não duplica).

Sugestão de ritmo: 1 etapa por aula (6 a 8 aulas). As missões abrem uma de cada vez; dá para voltar e melhorar tudo depois.

## 7. Segurança e privacidade

- Só **primeiro nome** e **turma**. Sem e-mail, sobrenome, telefone, CPF ou conta pessoal para as crianças.
- Cada aparelho usa um usuário **anônimo** do Supabase. Ele só enxerga um projeto depois de criá-lo ou de digitar o código certo.
- O código é procurado por **hash SHA-256**; o texto do código fica numa tabela que **só professores** leem.
- **Limite de tentativas:** 6 erros por aparelho e 40 por rede a cada 10 minutos (depois bloqueia por 10 minutos).
- **RLS** ligado em todas as tabelas; o navegador não escreve direto em nenhuma tabela — só por funções que conferem a permissão.
- Gravações em bucket **privado**; só a própria dupla e professores ouvem; envio só se a turma estiver liberada.
- Controle de versão: uma versão antiga nunca sobrescreve a mais nova (junção campo a campo; missões concluídas nunca se perdem).
  Um reinício feito pelo professor não é desfeito por um aparelho desatualizado.
- Sem anúncios, rastreadores, galeria pública, chat ou comentários. A “exposição” é privada (dupla + professor).
- Nenhuma credencial administrativa no código do site.

## 8. Desenvolvimento e testes

```bash
npm install
```

```bash
npm run dev        # servidor local (precisa de .env ou public/config.json com um Supabase)
```

```bash
npm test           # testes de lógica (missões, progresso, junção de versões)
```

Testes do backend e de ponta a ponta: veja [`tests/README.md`](tests/README.md).

Estrutura:

- `src/art/` — peças dos monstrinhos (SVG), montagem e animações (`Monster.tsx`), cenários (`scenery.tsx`, `SceneView.tsx`)
- `src/game/` — modelo de dados, 30 missões, progressão/troféus, junção de versões, catálogos
- `src/lib/` — Supabase (`api.ts`), salvamento automático e offline (`sync.ts`), sons sintetizados (`audio.ts`), gravação (`recorder.ts`)
- `src/screens/` — entrada, mapa, conquistas, exposição
- `src/stages/` — ferramentas de cada etapa (creator, life, identity, habitat, adventures, story)
- `src/teacher/` — painel do professor
- `supabase/migrations/` — SQL completo (tabelas, RLS, funções, Storage)

Tecnologias: React 18, TypeScript, Vite, Tailwind CSS, Supabase (PostgreSQL, Auth anônimo, Storage). Sons e músicas são
gerados com a Web Audio API e todas as ilustrações são SVG próprias (sem imagens ou áudios externos).
