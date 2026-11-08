# Receber os trabalhos do TCA no seu Google Drive

Com este passo a passo, cada grupo que tocar em **“Enviar ao professor”** no final do site manda o trabalho
para o **seu** Google Drive:

- uma pasta **TCA - Trabalhos dos alunos**, com uma subpasta por turma (8º A, 8º B, 8º C);
- dentro da turma, uma pasta para cada envio do grupo, com o **PowerPoint**, o **guia em PDF** e a
  **cópia do trabalho (.json)**;
- uma planilha **TCA - Respostas dos grupos**, com uma linha por envio e todas as respostas das etapas.

Os alunos não precisam de conta do Google. Só você tem acesso à pasta e à planilha.

## 1. Criar o receptor (uma vez só, cerca de 5 minutos)

1. Entre na sua conta do Google e abra **https://script.google.com**.
2. Clique em **Novo projeto**. Dê o nome **TCA Receptor** (clique em “Projeto sem título”, no alto).
3. Apague o conteúdo que aparece no editor e **cole todo o conteúdo do arquivo `Code.gs`** desta pasta.
   Clique no ícone de disquete (**Salvar**).
4. Na barra de cima, escolha a função **configurar** e clique em **Executar**.
   - O Google vai pedir autorização: **Revisar permissões** → escolha sua conta.
   - Se aparecer “O Google não verificou este app”, clique em **Avançado** → **Acessar TCA Receptor (não seguro)**.
     Isso aparece porque o script foi criado por você e não passou pela verificação do Google;
     ele só mexe na pasta e na planilha do TCA.
   - Clique em **Permitir**. A pasta e a planilha aparecem no seu Drive.
5. Clique em **Implantar** → **Nova implantação**.
   - Em “Selecionar tipo” (engrenagem), escolha **App da Web**.
   - **Executar como:** Eu (seu e-mail).
   - **Quem pode acessar:** Qualquer pessoa.
   - Clique em **Implantar** e copie o **URL do app da Web** (termina em `/exec`).

## 2. Ligar o envio no site

No GitHub, abra o arquivo **`tca/config.json`** do repositório, clique no lápis (**Edit**) e cole o
endereço entre as aspas:

```json
{
  "envioUrl": "https://script.google.com/macros/s/SEU-CODIGO-AQUI/exec"
}
```

Clique em **Commit changes**. Em alguns minutos o botão “Enviar ao professor” passa a funcionar no site
(`https://<seu-usuario>.github.io/<repositorio>/tca/`). Se preferir, mande o endereço para o Claude fazer
essa troca.

## Perguntas comuns

- **O grupo enviou duas vezes.** Cada envio cria uma pasta nova (com data e hora) e uma linha nova na
  planilha. Considere o envio mais recente.
- **Quero abrir o trabalho de um grupo no site.** Baixe o arquivo `.json` da pasta do grupo, abra o site,
  clique em **Cópia do trabalho → Abrir uma cópia** e escolha o arquivo.
- **Mudei o código do script.** Depois de colar a versão nova, vá em **Implantar → Gerenciar implantações →
  editar (lápis) → Versão: Nova versão → Implantar**. O endereço continua o mesmo.
- **Conta institucional (ex.: @edu.sme.prefeitura.sp.gov.br).** Na implantação, “Quem pode acessar” precisa
  ser **Qualquer pessoa** (não “Qualquer pessoa da organização”), porque o site envia sem login. Se essa opção
  não aparecer, a administração da conta bloqueou; nesse caso, instale o receptor numa conta Gmail pessoal.
- **O envio não funciona na página do claude.ai.** Essa página bloqueia conexões com outros sites.
  Use o endereço do GitHub Pages.
- **Privacidade.** Os dados incluem nomes de estudantes menores de idade. Mantenha a pasta sem
  compartilhamento público e apague os trabalhos quando não forem mais necessários.
