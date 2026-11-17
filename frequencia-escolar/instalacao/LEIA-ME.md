# Instalação rápida — FREQUÊNCIA ESCOLAR (1 arquivo)

> **Escola com turmas já definidas:** use o arquivo **personalizado** que recebeu, que já contém as turmas e os estudantes, em vez do `Code.gs` desta pasta. O `Code.gs` daqui não tem nenhuma turma: depois de instalar, as turmas são cadastradas em Administração → Turmas.

O sistema inteiro está num **único arquivo**: [`Code.gs`](Code.gs). Ele reúne o código do servidor e as telas (HTML, CSS e JavaScript) embutidas no final. **Não é preciso criar nenhum arquivo HTML.**

O `appsscript.json` é **opcional**: ele fixa o fuso horário e as permissões, mas o sistema funciona sem ele.

> **Como copiar:** abra o [`Code.gs`](Code.gs) no GitHub e clique em **"Copy raw file"** (ícone de duas folhas, no canto superior direito). Isso copia o arquivo inteiro. No Apps Script, clique dentro do arquivo, aperte **Ctrl+A** e depois **Ctrl+V**. No Mac, use **Cmd** no lugar de Ctrl.

Use um **computador** para a instalação.

## 1. Criar o projeto
1. Abra **https://script.google.com** com a conta que será a **dona do sistema** (de preferência a institucional).
2. Clique em **+ Novo projeto** e renomeie para `FREQUÊNCIA ESCOLAR`.

## 2. Colar o código
1. Abra o arquivo **Código.gs**. Ele pode continuar com esse nome.
2. Aperte **Ctrl+A**, cole o `Code.gs` com **Ctrl+V** e salve com **Ctrl+S**.
3. Confira as duas pontas do arquivo:
   - a primeira linha começa com `/**`;
   - a última linha é `};`.

> Se você já tinha criado arquivos `Index`, `Styles`, `JavaScript` ou `Mensagem`, pode apagá-los: três pontinhos → Excluir. O sistema usa as telas embutidas.

## 3. Instalar
1. Na caixa de funções, ao lado de **▶ Executar**, escolha **`setupSistema`** e clique em **▶ Executar**.
2. Autorize: **Revisar permissões** → sua conta → se aparecer "O Google não verificou este app", **Avançado** → **Acessar (não seguro)** → **Permitir**.
3. O registro deve terminar com `✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO`.
4. Escolha **`instalarBackupDiario`** (perto do fim da lista) → **▶ Executar**. Isso liga o backup diário.

## 4. Publicar
- **Primeira vez:** **Implantar → Nova implantação** → engrenagem → **App da Web**, e preencha:
  - **Executar como:** **Eu**
  - **Quem pode acessar:** **Qualquer pessoa em [domínio da escola]**

  Clique em **Implantar** e copie o link que termina em `/exec`.
- **Ao atualizar o código, sem mudar o link:** **Implantar → Gerenciar implantações** → lápis → **Versão: Nova versão** → **Implantar**.

## 4b. (Opcional) Consulta de ausentes sem login
Crie uma **segunda** implantação: **Implantar → Nova implantação → App da Web**, com **Executar como: Eu** e **Quem pode acessar: Qualquer pessoa**. Depois cole o endereço dela no sistema, em **Administração → Consulta sem login**. Em cada atualização, publique a **Nova versão** nas duas implantações.

## 5. Primeiro acesso
1. Abra o link `/exec`. Você entra como **ADMIN**.
2. Em **Administração → Configurações**, preencha o nome da escola.
3. Em **Administração → Usuários**, corrija o seu nome e cadastre os professores (e-mail da conta Google, perfil PROFESSOR, turma).

## Se algo der errado
| Mensagem | O que fazer |
|---|---|
| `SyntaxError` no `Código.gs` | O conteúdo colado está incompleto ou errado. Copie de novo com "Copy raw file", depois Ctrl+A e Ctrl+V. |
| "Sistema não instalado" | Execute o `setupSistema` (passo 3). |
| "Acesso não autorizado" | O e-mail não está cadastrado em Administração → Usuários. |
| "Não foi possível confirmar sua identidade" | Em "Quem pode acessar", escolha o domínio da escola (veja a seção 3.1 do README principal). |
| "Neste momento, não é possível abrir o ficheiro" | O navegador está com várias contas Google conectadas. Abra o link numa janela anônima, entrando só com a conta institucional. |
| O link mostra a versão antiga | Publique uma **Nova versão** (passo 4). |

Executar o `setupSistema` mais de uma vez **não duplica nada**.
