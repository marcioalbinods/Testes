# Testes

## 1. Lógica do jogo (rápido, sem servidor)

```bash
npm test
```

## 2. Backend real (SQL + RLS + Storage) e ponta a ponta (navegador)

Usa a imagem oficial do PostgreSQL do Supabase (`supabase/postgres`) e o serviço oficial de Storage
(`supabase/storage-api`) em Docker, com o arquivo SQL de produção. Os serviços de Auth e REST do Supabase são
substituídos por uma **ponte de teste** (`harness/gateway.mjs`) que executa cada pedido como o papel
`authenticated` com as *claims* do JWT — exatamente como o Supabase faz —, então as políticas RLS e as funções
são testadas de verdade. (A ponte existe porque o ambiente de desenvolvimento não conseguiu baixar as imagens
de Auth/REST; ela não faz parte do jogo.)

```bash
bash tests/harness/start-local.sh
```

```bash
node tests/harness/gateway.mjs
```

Em outro terminal:

```bash
node tests/backend/backend.test.mjs
```

Para os testes no navegador, crie `.env.local` com `VITE_SUPABASE_URL=http://127.0.0.1:54321` e qualquer
`VITE_SUPABASE_ANON_KEY` com 20+ caracteres, rode `npm run dev` e depois:

```bash
node tests/e2e/run.mjs
```

```bash
node tests/e2e/recording.mjs
```

`run.mjs` cobre os 18 testes obrigatórios: cadastro de duplas nas 3 turmas, não duplicar, recuperação pelo código,
salvamento automático, fechar e reabrir, outro aparelho, personalização completa, as 30 missões jogadas pela interface,
habitat, histórias e player, painel do professor (login, relatório, ver projeto, liberar gravação), isolamento entre
duplas, reiniciar dupla, reiniciar turma sem afetar as outras, excluir dupla, tablet (toque) e notebook (teclado),
queda de internet, conflito entre dois aparelhos e troca de dupla. Capturas de tela ficam em `tests/e2e/output/`.
