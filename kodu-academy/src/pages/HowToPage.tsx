import { Link } from 'react-router-dom';
import { Anchor, useScrollToRouteHash } from '../components/Anchor';

export function HowToPage() {
  useScrollToRouteHash();
  return (
    <div className="narrow" style={{ margin: '0 auto' }}>
      <h1>Como usar esta plataforma</h1>
      <nav className="card" aria-label="Nesta página">
        <Anchor to="aluno">Guia do aluno</Anchor> · <Anchor to="professor">Guia do professor</Anchor> · <Anchor to="kodu">Sobre o Kodu</Anchor>
      </nav>

      <section id="aluno" className="card" style={{ scrollMarginTop: 90 }}>
        <h2>Guia rápido do aluno</h2>
        <ol>
          <li><strong>Entrar:</strong> clique em “Entrar como aluno” e digite o código que o professor entregou (ex.: <code>K7MP-4XQA</code>). Letras maiúsculas ou minúsculas, com ou sem traço — tanto faz.</li>
          <li><strong>Escolher a missão:</strong> na “Minha trilha” você vê as 20 fases. Cadeado = bloqueada; azul = disponível; amarelo = em andamento; verde = concluída.</li>
          <li><strong>Fazer a missão:</strong> deixe o Kodu aberto em uma janela e a plataforma em outra (ou em um celular/tablet ao lado). Siga o passo a passo na ordem.</li>
          <li><strong>Marcar o checklist:</strong> marque cada ação só depois de realmente fazer. Salva sozinho.</li>
          <li><strong>Travou?</strong> Primeiro tente a seção “Se não funcionar”. Depois use as dicas: a Dica 1 dá a direção, a Dica 2 aponta a ferramenta e a Dica 3 mostra o caminho. Use uma de cada vez.</li>
          <li><strong>Teste de aprendizagem:</strong> responda às perguntas. Se não passar, leia as explicações, revise a fase e tente de novo.</li>
          <li><strong>Reflexão e revisão:</strong> escreva o que aprendeu e confirme que revisou as instruções. Então clique em “Concluir missão”.</li>
          <li><strong>Continuar depois:</strong> entre com o mesmo código em qualquer computador e clique em “Continuar”.</li>
          <li><strong>Computador compartilhado?</strong> Clique em <strong>Sair</strong> ao terminar. Nunca mostre seu código para colegas.</li>
        </ol>
        <p className="muted">Esqueceu o código? Peça ao professor: ele gera um novo e o seu progresso continua salvo.</p>
      </section>

      <section id="professor" className="card" style={{ scrollMarginTop: 90 }}>
        <h2>Guia rápido do professor</h2>
        <ol>
          <li><strong>Entrar:</strong> “Área do professor” com e-mail e senha cadastrados pelo administrador do Supabase (veja o README do projeto).</li>
          <li><strong>Criar turmas:</strong> Painel → “Turmas e alunos” → “Nova turma”.</li>
          <li><strong>Cadastrar alunos:</strong> cole uma lista de nomes (um por linha). Use só o primeiro nome e a inicial do sobrenome, ou um número de chamada — evite nomes completos.</li>
          <li><strong>Entregar os códigos:</strong> os códigos aparecem <em>uma única vez</em>. Imprima ou baixe a lista e entregue a cada aluno em particular. Se perder, use “Novo código”.</li>
          <li><strong>Acompanhar:</strong> “Visão geral” mostra quantos alunos estão em cada fase, quem está sem atividade e quais fases e perguntas têm mais erros. “Acompanhamento da turma” filtra por turma, fase e situação.</li>
          <li><strong>Ver um aluno:</strong> clique no nome para ver checklists, respostas aos testes, tentativas, dicas, reflexões e histórico.</li>
          <li><strong>Liberar fase manualmente:</strong> no relatório do aluno, use “Liberar” (exige motivo; fica registrado no histórico). Use também “Marcar concluída”, “Reabrir” ou “Zerar” quando necessário.</li>
          <li><strong>Relatórios:</strong> exporte CSV da turma, do aluno ou das fases. Os arquivos abrem no Excel/LibreOffice (separador “;”).</li>
          <li><strong>Fim do ano letivo:</strong> exporte o que precisar e exclua a turma (isso apaga os dados dos alunos). Veja <Link to="/privacidade">Privacidade</Link>.</li>
        </ol>
        <h3>Critérios de conclusão de cada fase</h3>
        <p>
          O aluno só conclui uma fase quando: (1) marca todos os itens obrigatórios do checklist; (2) é aprovado no teste (o mínimo de acertos
          aparece em cada fase; a correção é feita no servidor); (3) escreve uma reflexão de pelo menos 20 caracteres; e (4) confirma a revisão
          das instruções. O checklist é autodeclarado — recomendamos conferir por amostragem o mundo salvo no Kodu, especialmente nas fases 12,
          16 e 20.
        </p>
      </section>

      <section id="kodu" className="card" style={{ scrollMarginTop: 90 }}>
        <h2>Sobre o Kodu Game Lab</h2>
        <ul>
          <li>Programa gratuito para Windows. Baixe pelo site oficial do Kodu Game Lab ou pela loja da Microsoft, conforme a política da escola.</li>
          <li>As instruções usam <strong>teclado e mouse</strong>. Com controle de Xbox a interface é diferente.</li>
          <li>Os nomes dos blocos (WHEN, DO, see, bumped, move...) aparecem em inglês na maioria das instalações, mesmo com o idioma em português. Por isso mostramos o nome original e a tradução.</li>
          <li>Os nomes de ferramentas, controles e blocos foram conferidos no código-fonte oficial do Kodu (versão 1.4/1.5). Diferenças entre versões estão indicadas em cada fase.</li>
          <li>As figuras de regras desta plataforma são <strong>representações ilustrativas</strong>, não capturas de tela.</li>
        </ul>
      </section>
    </div>
  );
}
