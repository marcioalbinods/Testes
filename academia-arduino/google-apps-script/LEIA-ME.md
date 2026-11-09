# Turma Robótica: número, senha e acompanhamento dos estudantes

Com este passo a passo, a Academia de Arduino passa a ter:

- **cadastro dos estudantes** da turma Robótica pelo próprio site (Espaço do professor → Turma Robótica);
- um **número de acesso e uma senha** para cada estudante, que podem ser impressos em cartões;
- **progresso salvo** na sua planilha: o estudante continua de onde parou em qualquer computador ou tablet;
- um **painel do professor** com as missões, atividades, perguntas, desafios, XP, conquistas e jogos de cada estudante.

Tudo fica numa planilha **do seu Google Drive** (“Academia de Arduino - Turma Robótica”). Os estudantes não precisam de
conta do Google. As senhas dos estudantes **não** são gravadas: a planilha guarda só um código (hash) que não pode ser
revertido. Se alguém esquecer a senha, gere uma nova no painel.

## 1. Instalar o servidor da turma (uma vez só, cerca de 10 minutos)

1. Entre na sua conta do Google e abra **https://script.google.com**.
2. Clique em **Novo projeto** e dê o nome **Academia de Arduino** (clique em “Projeto sem título”, no alto).
3. Apague o conteúdo do editor e **cole todo o conteúdo do arquivo `Code.gs`** desta pasta.
4. Na linha `var SENHA_DO_PROFESSOR = 'troque-esta-senha';`, troque o texto entre aspas pela **sua senha de professor**
   (pelo menos 8 caracteres). Não conte essa senha aos estudantes. Clique em **Salvar** (disquete).
5. Na barra de cima, escolha a função **configurar** e clique em **Executar**.
   - O Google pede autorização: **Revisar permissões** → escolha sua conta.
   - Se aparecer “O Google não verificou este app”, clique em **Avançado** → **Acessar Academia de Arduino (não seguro)**.
     O aviso aparece porque o script foi criado por você; ele só mexe na planilha da turma.
   - Clique em **Permitir**. A planilha aparece no seu Drive.
6. Clique em **Implantar** → **Nova implantação**.
   - Em “Selecionar tipo” (engrenagem), escolha **App da Web**.
   - **Executar como:** Eu (seu e-mail).
   - **Quem pode acessar:** Qualquer pessoa.
   - Clique em **Implantar** e copie o **URL do app da Web** (termina em `/exec`).

## 2. Ligar a turma no site

No GitHub, abra o arquivo **`arduino/config.json`**, clique no lápis (**Edit**) e cole o endereço entre as aspas:

```json
{
  "servidorUrl": "https://script.google.com/macros/s/SEU-CODIGO-AQUI/exec"
}
```

Clique em **Commit changes**. Em alguns minutos aparecem no site o botão **Entrar** e a aba
**Espaço do professor → Turma Robótica**. Se preferir, mande o endereço para o Claude fazer essa troca.

## 3. Cadastrar os estudantes

1. No site, abra **Espaço do professor → Turma Robótica** e entre com a sua senha de professor.
2. Clique em **Cadastrar estudantes** e escreva **um primeiro nome por linha**.
3. Aparecem o número e a senha de cada um. **Imprima os cartões** ou anote: as senhas não ficam guardadas.
4. Cada estudante entra no site, clica em **Entrar** e digita o número e a senha.

## Perguntas comuns

- **Um estudante esqueceu a senha.** No painel, clique na chave ao lado do nome: uma senha nova é gerada (a antiga deixa
  de valer). O progresso não se perde.
- **O estudante usa dois aparelhos.** O progresso mais recente vale. Ao entrar num aparelho, a sessão do outro termina:
  lá aparece “Entre de novo” — basta entrar outra vez.
- **Sem internet.** O progresso fica guardado no computador e é enviado quando a internet voltar.
- **Computadores da escola.** Não marque “Continuar conectado”: a conta sai ao fechar o navegador. Lembre os estudantes
  de clicar no nome → **Sair da conta** ao terminar.
- **Muitas senhas erradas.** Depois de 8 tentativas erradas seguidas, a conta fica bloqueada por 10 minutos.
- **Mudei o código do script.** Cole a versão nova e vá em **Implantar → Gerenciar implantações → editar (lápis) →
  Versão: Nova versão → Implantar**. O endereço continua o mesmo.
- **Conta institucional.** “Quem pode acessar” precisa ser **Qualquer pessoa** (não “Qualquer pessoa da organização”),
  porque os estudantes entram sem conta do Google. Se essa opção não aparecer, a administração da conta bloqueou; nesse
  caso, instale numa conta Gmail pessoal.
- **Na página do claude.ai não funciona.** Essa página bloqueia conexões com outros sites. Use o endereço do GitHub Pages.
- **Privacidade (LGPD).** Os estudantes são menores de idade: cadastre só o primeiro nome, não compartilhe a planilha e
  apague os dados (remova os estudantes ou a planilha) quando o curso terminar. Não edite as colunas
  “Progresso”, “Trabalhos”, “Hash” e “Sal” na planilha.
