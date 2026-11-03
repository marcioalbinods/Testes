import { Link } from 'react-router-dom';
import { MODULES } from '../content/modules';
import { PHASES } from '../content/phases';
import { useApp } from '../state/AppContext';
import { resumePhaseId, trailPercent } from '../lib/progression';
import { ProgressBar } from '../components/ProgressBar';
import { Logo } from '../components/Logo';

export function HomePage() {
  const { student, progress, teacher } = useApp();
  const resume = student ? resumePhaseId(progress) : null;
  return (
    <>
      <section className="hero" aria-labelledby="titulo-inicio">
        <div>
          <h1 id="titulo-inicio">Aprenda a criar jogos no Kodu Game Lab, no seu ritmo.</h1>
          <p>
            Uma trilha com <strong>20 missões</strong> em 5 módulos: do primeiro mundo até um jogo completo criado por você, com
            regras, pontuação, inimigos, vitória e derrota.
          </p>
          <div className="row">
            {student ? (
              <Link className="btn btn-secondary" to={resume ? `/fase/${resume}` : '/trilha'}>
                {resume ? `${progress[resume] ? 'Continuar' : 'Começar'} a fase ${resume}` : 'Ver minha trilha'}
              </Link>
            ) : (
              <Link className="btn btn-secondary" to="/aluno/entrar">
                Entrar como aluno
              </Link>
            )}
            {teacher ? (
              <Link className="btn btn-ghost" to="/professor">Abrir painel do professor</Link>
            ) : (
              <Link className="btn btn-ghost" to="/professor/entrar">Área do professor</Link>
            )}
          </div>
        </div>
        <div className="hero-art center" aria-hidden="true">
          <Logo size={180} />
        </div>
      </section>

      {student && (
        <section className="card" style={{ marginTop: 24 }} aria-labelledby="meu-progresso">
          <h2 id="meu-progresso">Olá, {student.displayName}!</h2>
          <ProgressBar value={trailPercent(progress)} label="Progresso na trilha" />
          <p className="muted small" style={{ marginTop: 8 }}>Turma: {student.className}</p>
        </section>
      )}

      <section aria-labelledby="como-comecar">
        <h2 id="como-comecar">Como começar</h2>
        <ol className="steps-inline">
          <li>
            <strong>Entre com o seu código.</strong> O professor entrega a cada aluno um código como <code>K7MP-4XQA</code>. Não precisa de
            e-mail.
          </li>
          <li>
            <strong>Abra a fase liberada.</strong> Leia o conceito e siga o passo a passo com o Kodu aberto ao lado.
          </li>
          <li>
            <strong>Prove o que aprendeu.</strong> Marque o checklist, faça o teste e escreva a reflexão para liberar a próxima fase.
          </li>
          <li>
            <strong>Volte quando quiser.</strong> Seu progresso fica salvo. Em qualquer computador, entre com o mesmo código e clique em
            “Continuar”.
          </li>
        </ol>
      </section>

      <section aria-labelledby="modulos">
        <h2 id="modulos">A trilha</h2>
        <div className="grid grid-3">
          {MODULES.map((m) => (
            <div key={m.id} className="card" style={{ borderTop: `6px solid ${m.color}` }}>
              <h3>Módulo {m.id} · {m.title}</h3>
              <p className="muted">{m.description}</p>
              <ul className="small">
                {PHASES.filter((p) => p.module === m.id).map((p) => (
                  <li key={p.id}>
                    {p.id}. {p.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <h2>Como funcionam as missões</h2>
          <p>
            Cada fase tem objetivo, conceito, passo a passo detalhado, checklist, três níveis de dica, soluções para erros comuns, teste de
            aprendizagem, reflexão e um desafio extra. A próxima fase só abre quando você cumpre os critérios — marcar “concluído” não basta.
          </p>
          <Link to="/como-usar">Ver o guia completo →</Link>
        </div>
        <div className="card">
          <h2>Para professores</h2>
          <p>
            Acompanhe cada aluno sem precisar ir ao computador dele: fase atual, checklists, respostas aos testes, dicas usadas, quem está
            sem atividade e quais conteúdos precisam ser retomados. Exporte relatórios em CSV.
          </p>
          <Link to="/como-usar#professor">Guia do professor →</Link>
        </div>
      </section>
    </>
  );
}
