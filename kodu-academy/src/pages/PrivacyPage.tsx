export function PrivacyPage() {
  return (
    <div className="narrow" style={{ margin: '0 auto' }}>
      <h1>Privacidade e proteção de dados</h1>
      <div className="card stack">
        <p>
          A Kodu Academy foi projetada para uso escolar por crianças e adolescentes, seguindo os princípios da LGPD (Lei 13.709/2018), em
          especial o art. 14, que exige que o tratamento de dados de crianças e adolescentes seja feito no seu melhor interesse.
        </p>
        <h2>Quais dados guardamos</h2>
        <ul>
          <li><strong>Aluno:</strong> nome de exibição definido pelo professor (recomendamos primeiro nome + inicial), turma, data de início, progresso nas fases, itens de checklist marcados, respostas aos testes, nível de dica consultado, reflexões e data/hora das atividades.</li>
          <li><strong>Código de acesso:</strong> guardado apenas de forma cifrada (hash). Nem o professor consegue lê-lo depois de gerado.</li>
          <li><strong>Professor:</strong> e-mail e senha (gerenciados pelo serviço de autenticação; a senha nunca fica em texto puro) e nome de exibição.</li>
        </ul>
        <h2>O que NÃO coletamos</h2>
        <p>E-mail de alunos, CPF, endereço, telefone, fotografia, localização, dados de navegação para publicidade. Não há anúncios, rastreadores, cookies de terceiros nem fontes externas.</p>
        <h2>Quem vê os dados</h2>
        <ul>
          <li>Cada aluno vê apenas os próprios registros.</li>
          <li>Cada professor vê apenas os alunos das turmas que ele criou.</li>
          <li>Nenhum desempenho é exibido publicamente nem comparado entre alunos.</li>
        </ul>
        <h2>Finalidade, base e transparência</h2>
        <p>
          Os dados servem exclusivamente para acompanhar a aprendizagem na disciplina. A escola é a controladora dos dados e deve informar
          as famílias sobre o uso da plataforma (por exemplo, no termo de uso de recursos digitais da escola) e obter autorização quando a
          política da escola ou a legislação exigir.
        </p>
        <h2>Retenção e exclusão</h2>
        <ul>
          <li>Recomendação: manter os dados apenas durante o ano letivo e excluir a turma ao final, depois de exportar o que for necessário para o registro escolar.</li>
          <li>O professor pode excluir um aluno a qualquer momento (o progresso é apagado junto). O histórico administrativo guarda apenas o registro da exclusão, sem nome.</li>
          <li>Pedidos de acesso, correção ou exclusão feitos por responsáveis devem ser encaminhados ao professor ou à escola.</li>
        </ul>
        <h2>Segurança</h2>
        <p>
          Conexão criptografada (HTTPS), regras de acesso no banco de dados (Row Level Security), limite de tentativas de login e nenhuma chave
          secreta no site. No modo demonstração, os dados ficam somente no navegador em uso.
        </p>
      </div>
    </div>
  );
}
