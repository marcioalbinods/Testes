import { screen, waitFor, within, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp, seedClass } from './renderApp';
import { PHASES } from '../content/phases';
import { QUIZ_KEYS } from '../content/quizKeys';
import { createDemoBackend } from '../services/demoBackend';

describe('jornada do aluno', () => {
  it('valida o código, entra, vê as 20 fases e as futuras bloqueadas', async () => {
    const [ana] = await seedClass();
    const user = userEvent.setup();
    renderApp('/aluno/entrar');
    const input = await screen.findByLabelText(/seu código de acesso/i);
    await user.type(input, 'abc');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText(/8 letras e números/)).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'ZZZZZZZZ');
    expect(input).toHaveValue('ZZZZ-ZZZZ');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText(/Código não encontrado/)).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, ana.code.toLowerCase());
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('heading', { name: 'Minha trilha' })).toBeInTheDocument();
    for (let i = 1; i <= 20; i++) expect(screen.getAllByText(new RegExp(`^Fase ${i} ·`)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/🔒 Bloqueada/)).toHaveLength(19);
    expect(screen.getByText(/Conclua a fase 1 para liberar/)).toBeInTheDocument();
  });

  it('impede abrir uma fase bloqueada pelo endereço', async () => {
    const [ana] = await seedClass();
    await createDemoBackend().student.login(ana.code);
    renderApp('/fase/7');
    expect(await screen.findByText(/Fase bloqueada/)).toBeInTheDocument();
    expect(screen.queryByText('Checklist da missão')).not.toBeInTheDocument();
  });

  it('completa a missão 1 com checklist, dicas, teste, reflexão e revisão; o progresso persiste', async () => {
    const [ana] = await seedClass();
    await createDemoBackend().student.login(ana.code);
    const user = userEvent.setup();
    renderApp('/fase/1');
    const phase = PHASES[0];
    expect(await screen.findByRole('heading', { level: 1, name: /Fase 1: Conhecendo o Kodu/ })).toBeInTheDocument();
    for (const h of ['Passo a passo no Kodu', 'Checklist da missão', 'Se não funcionar, tente isto', 'Dicas', 'Teste de aprendizagem', 'Reflexão', 'Desafio extra (opcional)', 'Concluir missão']) {
      expect(screen.getByRole('heading', { name: h })).toBeInTheDocument();
    }
    const concluir = screen.getByRole('button', { name: 'Concluir missão' });
    expect(concluir).toBeDisabled();

    // Checklist com salvamento automático
    const checklist = screen.getByRole('heading', { name: 'Checklist da missão' }).closest('section')!;
    for (const item of phase.checklist.filter((c) => c.required)) {
      await user.click(within(checklist).getByLabelText(new RegExp(item.text.slice(0, 25).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
    }
    await waitFor(() => expect(within(checklist).getByText('✓ Salvo')).toBeInTheDocument());

    // Dicas em níveis
    await user.click(screen.getByRole('button', { name: /Ver dica 1/ }));
    expect(screen.getByText(phase.hints[0])).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver dica 2/ })).toBeInTheDocument();
    expect(screen.queryByText(phase.hints[2])).not.toBeInTheDocument();

    // Teste: envio incompleto, depois respostas certas
    const quiz = screen.getByRole('heading', { name: 'Teste de aprendizagem' }).closest('section')!;
    await user.click(within(quiz).getByRole('button', { name: 'Enviar respostas' }));
    expect(within(quiz).getByText(/Responda todas as perguntas/)).toBeInTheDocument();
    for (const q of phase.quiz) {
      const correct = q.options.find((o) => o.id === QUIZ_KEYS[1][q.id])!;
      const group = within(quiz).getByRole('group', { name: new RegExp(q.prompt.slice(0, 20)) });
      await user.click(within(group).getByLabelText(correct.text));
    }
    await user.click(within(quiz).getByRole('button', { name: 'Enviar respostas' }));
    expect(await within(quiz).findByText(/4 de 4 acertos — aprovado/)).toBeInTheDocument();

    // Reflexão (salva ao sair do campo)
    const refl = screen.getByLabelText(phase.reflection.prompt);
    await user.type(refl, 'Joguei um mundo de corrida e quero criar um jogo de coleta.');
    fireEvent.blur(refl);
    const reflSection = screen.getByRole('heading', { name: 'Reflexão' }).closest('section')!;
    await waitFor(() => expect(within(reflSection).getByText('✓ Salvo')).toBeInTheDocument());

    // Revisão e conclusão
    await user.click(screen.getByLabelText(/Revisei as instruções/));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Concluir missão' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Concluir missão' }));
    expect(await screen.findByText('Missão 1 concluída!')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir para a fase 2/ })).toBeInTheDocument();

    // "Recarregar a página": a sessão e o progresso continuam
    cleanup();
    renderApp('/trilha');
    expect(await screen.findByRole('link', { name: /Começar a fase 2/ })).toBeInTheDocument();
    expect(screen.getAllByText(/✓ Concluída/).length).toBe(1);
    expect(screen.getAllByText(/🔒 Bloqueada/)).toHaveLength(18);
  });

  it('sair encerra a sessão no computador compartilhado', async () => {
    const [ana] = await seedClass();
    await createDemoBackend().student.login(ana.code);
    const user = userEvent.setup();
    renderApp('/trilha');
    await user.click(await screen.findByRole('button', { name: /Sair \(Ana\)/ }));
    expect(await screen.findByRole('link', { name: 'Entrar como aluno' })).toBeInTheDocument();
    cleanup();
    renderApp('/trilha');
    expect(await screen.findByLabelText(/seu código de acesso/i)).toBeInTheDocument();
  });
});
