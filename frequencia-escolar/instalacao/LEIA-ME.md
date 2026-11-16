# Instalação rápida — FREQUÊNCIA ESCOLAR

Esta pasta tem **só os 5 arquivos** que vão para o Google Apps Script:

| Arquivo | Tipo no Apps Script | Nome a usar |
|---|---|---|
| `appsscript.json` | Manifesto (já existe no projeto) | `appsscript.json` |
| `Code.gs` | Script (já existe no projeto) | `Code` |
| `Index.html` | HTML | `Index` |
| `Styles.html` | HTML | `Styles` |
| `JavaScript.html` | HTML | `JavaScript` |

`Code.gs` reúne todos os arquivos de servidor de `src/` num só. O funcionamento é idêntico.

> **Como copiar um arquivo do GitHub:** abra o arquivo na página do GitHub e clique no botão **"Copy raw file"** (ícone de duas folhas, no canto superior direito do conteúdo). Isso copia o arquivo inteiro de uma vez. Depois, no Apps Script, clique dentro do arquivo, aperte **Ctrl+A** para selecionar tudo e **Ctrl+V** para colar. No Mac, use **Cmd** no lugar de Ctrl.

Use um **computador**. A instalação não funciona bem pelo tablet ou celular.

---

## Passo 1 — Criar o projeto (2 min)
1. Entre em **https://script.google.com** com a conta que será a **dona do sistema**. De preferência, use a conta institucional da escola.
2. Clique em **+ Novo projeto**.
3. Clique em **"Projeto sem título"** e renomeie para `FREQUÊNCIA ESCOLAR`.

## Passo 2 — Manifesto `appsscript.json` (1 min)
1. Clique na **engrenagem** (Configurações do projeto), no menu da esquerda.
2. Marque **"Mostrar arquivo de manifesto 'appsscript.json' no editor"**.
3. Clique em **< >** (Editor) e abra **appsscript.json**.
4. Apague tudo (Ctrl+A, Delete), cole o conteúdo de `appsscript.json` e salve com **Ctrl+S**.

## Passo 3 — Código do servidor (1 min)
1. Clique no arquivo **Código.gs**. Ele aparece como `Código` ou `Code`.
2. Clique nos três pontinhos ao lado dele → **Renomear** → digite `Code`.
3. Apague o conteúdo, cole o conteúdo de `Code.gs` e salve com **Ctrl+S**.

## Passo 4 — Os 3 arquivos HTML (3 min)
Faça isto três vezes, uma para cada arquivo: **Index**, **Styles** e **JavaScript**.
1. Clique no **+** ao lado de "Arquivos" e escolha **HTML** (não "Script": arquivo HTML colado num Script gera o erro `Unexpected token '<'`).
2. Digite o nome **sem** `.html`, respeitando maiúsculas e minúsculas, e aperte **Enter**.
3. Apague o conteúdo de exemplo e cole o arquivo correspondente.
4. Salve com **Ctrl+S**.

No final, a lista da esquerda deve ter exatamente: `appsscript.json`, `Code.gs`, `Index.html`, `Styles.html`, e `JavaScript.html`. O arquivo de código pode continuar com o nome `Código.gs`.

## Passo 5 — Instalar (2 min)
1. Opcional: no início de `Code.gs`, troque `var NOME_ESCOLA_INICIAL = '';` por `var NOME_ESCOLA_INICIAL = 'NOME DA SUA ESCOLA';` e salve.
2. Na barra de cima, escolha a função **`setupSistema`** na lista ao lado de "Depurar" e clique em **▶ Executar**.
3. Clique em **Revisar permissões** e escolha a sua conta.
4. Se aparecer **"O Google não verificou este app"**, clique em **Avançado** → **Acessar FREQUÊNCIA ESCOLAR (não seguro)**. É normal: o app é seu.
5. Clique em **Permitir**.
6. No **Registro de execução**, procure: `✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO`.
7. Escolha a função **`instalarBackupDiario`** → **▶ Executar**. Isso liga o backup diário.

## Passo 6 — Publicar (2 min)
1. Clique em **Implantar** → **Nova implantação**.
2. Clique na engrenagem ao lado de "Selecionar tipo" → **App da Web**.
3. Preencha:
   - **Descrição:** `Versão 1.0 — piloto`
   - **Executar como:** **Eu**
   - **Quem pode acessar:**
     - **Conta institucional (Google Workspace):** escolha **"Qualquer pessoa em [nome da escola]"**.
     - **Conta Gmail pessoal:** leia a seção 3.1 do README principal antes de escolher. Com Gmail pessoal e "Executar como: Eu", só você conseguirá entrar.
4. Clique em **Implantar** e copie o **URL do app da Web** (termina em `/exec`).

## Passo 7 — Primeiro acesso
1. Abra o link. Você entra como **ADMIN**.
2. Em **Administração → Configurações**, preencha o **nome da escola** e clique em **Salvar**.
3. Em **Administração → Usuários → Cadastrar usuário**, cadastre cada professor: nome, e-mail da conta Google, perfil **PROFESSOR** e turma **TURMA PILOTO**.
4. Peça a um professor que abra o link. Ele deve ver o próprio nome no topo.

## Se algo der errado
| Mensagem | O que fazer |
|---|---|
| `SyntaxError: Unexpected token '<'` no `Código.gs` | Um conteúdo HTML foi colado no arquivo de código. Cole de novo o `Code.gs` no `Código.gs` e crie os HTML pelo **+ → HTML**. |
| `ReferenceError: ... is not defined` ao executar | Algum arquivo ficou faltando ou com conteúdo incompleto. Confira os 5 arquivos e cole de novo pelo botão "Copy raw file". |
| `Arquivo não permitido` ou página em branco | O nome de um HTML está diferente de `Index`, `Styles` ou `JavaScript`. |
| "Não foi possível confirmar sua identidade" para o professor | É a situação descrita no item 3.1 do README (conta Gmail pessoal ou domínio diferente). |
| "Acesso não autorizado" | O e-mail ainda não foi cadastrado em Administração → Usuários. |

Executar `setupSistema` mais de uma vez **não duplica nada**. Se tiver dúvida, pode rodar de novo e depois executar `verificarSistema`.
