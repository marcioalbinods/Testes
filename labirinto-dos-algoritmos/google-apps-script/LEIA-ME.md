# Salvamento online das turmas (5º A, 5º B e 5º C)

Com este passo a passo, o Labirinto dos Algoritmos passa a ter:

- **grupos por turma**: os estudantes escolhem a turma, escrevem o primeiro nome de cada integrante e criam uma
  **senha de 3 figuras** (sem teclado, sem e-mail);
- **progresso salvo online**: em outra aula, em qualquer tablet ou computador, o grupo escolhe a turma, toca no
  próprio grupo e digita a senha de figuras para continuar de onde parou (fases, estrelas, moedas, avatar e compras);
- **ranking da turma** juntando os grupos de todos os aparelhos;
- uma **planilha no seu Google Drive** para acompanhar cada grupo: pontos, estrelas, fases concluídas, fase atual,
  moedas, conquistas e a senha de figuras (para ajudar quem esquecer).

Sem esta instalação o jogo continua funcionando normalmente, salvando tudo **só no aparelho**.

## 1. Instalar o servidor (uma vez só, cerca de 10 minutos)

1. Entre na sua conta do Google e abra **https://script.google.com**.
2. Clique em **Novo projeto** e dê o nome **Labirinto dos Algoritmos** (clique em “Projeto sem título”, no alto).
3. Apague o conteúdo do editor e **cole todo o conteúdo do arquivo `Code.gs`** desta pasta. Clique em **Salvar** (disquete).
   - Para ter outras turmas, mude a linha `var TURMAS = ['5A', '5B', '5C'];` (e o arquivo `config.json`, passo 2).
4. Na barra de cima, escolha a função **configurar** e clique em **Executar**.
   - O Google pede autorização: **Revisar permissões** → escolha sua conta.
   - Se aparecer “O Google não verificou este app”, clique em **Avançado** → **Acessar Labirinto dos Algoritmos (não seguro)**.
     O aviso aparece porque o script foi criado por você; ele só mexe na planilha das turmas.
   - Clique em **Permitir**. A planilha **“Labirinto dos Algoritmos - Turmas”** aparece no seu Drive.
5. Clique em **Implantar** → **Nova implantação**.
   - Em “Selecionar tipo” (engrenagem), escolha **App da Web**.
   - **Executar como:** Eu (seu e-mail).
   - **Quem pode acessar:** Qualquer pessoa.
   - Clique em **Implantar** e copie o **URL do app da Web** (termina em `/exec`).

## 2. Ligar o jogo ao servidor

No GitHub, abra o arquivo **`labirinto-dos-algoritmos/config.json`**, clique no lápis (**Edit**) e cole o endereço entre as aspas:

```json
{
  "servidorUrl": "https://script.google.com/macros/s/SEU-CODIGO-AQUI/exec",
  "turmas": ["5A", "5B", "5C"]
}
```

Clique em **Commit changes**. Em alguns minutos a tela inicial do jogo mostra “☁️ Os grupos ficam salvos online”.
Se preferir, mande o endereço para o Claude fazer essa troca.

## 3. Na sala de aula

1. Cada grupo toca em **JOGAR** → escolhe a **turma** → **Grupo novo**.
2. Escrevem o **primeiro nome** de cada integrante (até 6), escolhem o personagem (pessoa ou bicho) e as **3 figuras** da senha.
3. Na próxima aula: **JOGAR** → turma → toquem no grupo → senha de figuras. O progresso aparece em qualquer aparelho.

## Perguntas comuns

- **Um grupo esqueceu a senha.** Abra a planilha: a coluna **“Senha (figuras)”** mostra as figuras
  (por exemplo `cachorro foguete estrela` = 🐶 🚀 ⭐). Para trocar a senha, escreva outras 3 figuras nessa coluna,
  separadas por espaço, usando estes nomes: `cachorro gato leao sapo macaco unicornio maca pizza bola foguete estrela arco-iris`.
- **Um grupo foi criado duas vezes ou por engano.** Apague a linha do grupo na planilha.
- **Mudou alguém de grupo.** O próprio grupo corrige os nomes em **Configurações → Integrantes do grupo**.
- **Sem internet.** O jogo continua funcionando. O progresso fica guardado no aparelho e é enviado sozinho quando a
  internet voltar (a tela inicial mostra “⏳ … será salvo online quando voltar”).
- **O grupo jogou em dois aparelhos.** Ao entrar com a senha, o jogo junta o progresso: vale sempre a melhor
  pontuação de cada fase. O último aparelho em que o grupo entrou é o que salva online; no outro aparece
  “🔑 Entrem de novo para salvar online”.
- **Muitas senhas erradas.** Depois de 8 tentativas erradas seguidas, o grupo fica bloqueado por 10 minutos.
- **Mudei o código do script.** Cole a versão nova e vá em **Implantar → Gerenciar implantações → editar (lápis) →
  Versão: Nova versão → Implantar**. O endereço continua o mesmo.
- **Conta institucional.** “Quem pode acessar” precisa ser **Qualquer pessoa** (não “Qualquer pessoa da organização”),
  porque os estudantes entram sem conta do Google. Se essa opção não aparecer, a administração da conta bloqueou; nesse
  caso, instale numa conta Gmail pessoal.
- **Na página do claude.ai não funciona.** Essa página bloqueia conexões com outros sites. Use o endereço do GitHub Pages.
- **Privacidade (LGPD).** Os estudantes são menores de idade: peça só o **primeiro nome** (ou apelido), não compartilhe a
  planilha e apague os dados (as linhas ou a planilha) quando o ano letivo terminar. Os nomes dos grupos de uma turma
  aparecem para quem escolhe aquela turma no jogo. Não edite as colunas “Progresso”, “Programas” e “Hash da sessão”.
