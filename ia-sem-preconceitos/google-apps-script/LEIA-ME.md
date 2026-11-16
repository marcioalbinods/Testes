# Salvamento online das duplas (8º A, B, C · 9º A, B, C, D)

Com este passo a passo, o jogo **Treinando uma IA sem preconceitos** passa a ter:

- **duplas por turma**: a dupla escolhe a turma, escreve o apelido da dupla e cria uma **senha de 4 números**;
- **progresso salvo online**: na aula seguinte, em qualquer computador ou tablet, a dupla escolhe a turma, toca no
  próprio nome e digita a senha para continuar de onde parou;
- uma **planilha no seu Google Drive** com, para cada dupla: turma, senha, XP, nível, progresso (%), missões concluídas,
  missão atual, medalhas, erros corrigidos, dicas, tempo de jogo, conceito final e a **justificativa final** da Missão 6.

Sem esta instalação o jogo continua funcionando normalmente, salvando tudo **só no aparelho**.

## 1. Instalar o servidor (uma vez só, cerca de 10 minutos)

1. Entre na sua conta do Google e abra **https://script.google.com**.
2. Clique em **Novo projeto** e dê o nome **IA sem preconceitos** (clique em “Projeto sem título”, no alto).
3. Apague o conteúdo do editor e **cole todo o conteúdo do arquivo `Code.gs`** desta pasta. Clique em **Salvar**.
4. Na barra de cima, escolha a função **configurar** e clique em **Executar**.
   - O Google pede autorização: **Revisar permissões** → escolha sua conta.
   - Se aparecer “O Google não verificou este app”, clique em **Avançado** → **Acessar IA sem preconceitos (não seguro)**.
     O aviso aparece porque o script foi criado por você; ele só mexe na planilha das duplas.
   - Clique em **Permitir**. A planilha **“IA sem preconceitos - Duplas”** aparece no seu Drive.
5. Clique em **Implantar** → **Nova implantação** → engrenagem → **App da Web**.
   - **Executar como:** Eu. **Quem pode acessar:** Qualquer pessoa.
   - Clique em **Implantar** e copie o **URL do app da Web** (termina em `/exec`).

## 2. Ligar o jogo ao servidor

No GitHub, abra **`ia-sem-preconceitos/config.json`**, clique no lápis (**Edit**) e cole o endereço entre as aspas:

```json
{
  "servidorUrl": "https://script.google.com/macros/s/SEU-CODIGO-AQUI/exec",
  "turmas": ["8A", "8B", "8C", "9A", "9B", "9C", "9D"]
}
```

Clique em **Commit changes**. Se preferir, mande o endereço para o Claude fazer essa troca.

## 3. Na sala de aula

1. **Primeira aula:** *Iniciar missão* → turma → **Dupla nova** → abertura → avatar, apelido e senha de 4 números (2 vezes).
2. **Aulas seguintes:** *Iniciar missão* → turma → toquem no **nome da dupla** → senha.
3. **Computador compartilhado:** ao terminar, *Menu (☰) → Sair da dupla*, para a próxima dupla entrar.

O progresso é enviado sozinho a cada desafio. A barra do jogo mostra “Salvo online”, “Salvando online…” ou
“Sem internet: salva quando voltar”.

## Perguntas comuns

- **Esqueceram a senha.** Veja a coluna **Senha** da planilha. Para trocar, escreva outros 4 números nela.
- **Dupla criada por engano ou repetida.** Apague a linha na planilha. Na mesma turma não pode haver duas duplas com o mesmo nome.
- **A dupla jogou em dois aparelhos.** Vale o último aparelho em que entrou com a senha; no outro aparece
  “Entrem de novo para salvar online” (tocar nesse aviso pede a senha).
- **Muitas senhas erradas.** Depois de 8 tentativas erradas seguidas, a dupla fica bloqueada por 10 minutos.
- **Mudar as turmas.** Altere `var TURMAS = [...]` no `Code.gs` **e** a lista `turmas` do `config.json`.
- **Mudei o código do script.** Cole a versão nova e vá em **Implantar → Gerenciar implantações → editar (lápis) →
  Versão: Nova versão → Implantar**. O endereço continua o mesmo.
- **Conta institucional.** “Quem pode acessar” precisa ser **Qualquer pessoa**. Se a opção não aparecer, use uma conta Gmail pessoal.
- **Privacidade (LGPD).** Os estudantes são menores: usem só apelidos, não compartilhe a planilha e apague os dados no fim
  do ano letivo. Os nomes das duplas de uma turma aparecem para quem escolhe aquela turma. Não edite as colunas
  “Estado (não editar)” e “Hash da sessão”.
