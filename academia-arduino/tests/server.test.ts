import { describe, expect, it } from 'vitest';
import { loadAppsScript } from './appsScriptMock';

const PROF = 'professor123';

describe('servidor da turma (Code.gs)', () => {
  it('recusa a senha padrão do professor', () => {
    const { post } = loadAppsScript('troque-esta-senha');
    const r = post({ acao: 'prof-entrar', senhaProfessor: 'troque-esta-senha' });
    expect(r.ok).toBe(false);
    expect(r.erro).toContain('Troque a SENHA_DO_PROFESSOR');
  });

  it('cadastra estudantes, entra, salva e lista o progresso', () => {
    const { post, sheet } = loadAppsScript(PROF);
    expect(post({ acao: 'prof-entrar', senhaProfessor: 'errada' }).ok).toBe(false);
    const cad = post({ acao: 'prof-cadastrar', senhaProfessor: PROF, nomes: ['Ana', '  João  ', '', '=Maria'] });
    expect(cad.ok).toBe(true);
    expect(cad.criados.map((c: { numero: string }) => c.numero)).toEqual(['1001', '1002', '1003']);
    expect(cad.criados[2].nome).toBe('Maria');
    const ana = cad.criados[0];
    expect(ana.senha).toMatch(/^[a-z]+\d{3}$/);
    // a senha não fica escrita na planilha
    expect(JSON.stringify(sheet.rows)).not.toContain(ana.senha);

    expect(post({ acao: 'entrar', numero: '1001', senha: 'errada' }).ok).toBe(false);
    const login = post({ acao: 'entrar', numero: '1001', senha: ` ${ana.senha.toUpperCase()} ` });
    expect(login.ok).toBe(true);
    expect(login.nome).toBe('Ana');
    expect(login.progresso).toBeNull();

    const progresso = { version: 1, xp: 340, missions: { m1: { done: true }, m2: { done: true }, m3: { quiz: true } }, badges: ['explorador-placa'] };
    const s = post({ acao: 'salvar', numero: '1001', token: login.token, progresso, trabalhos: { 'u1001:montagem:m4': '{"parts":[]}' }, atualizadoEm: 123 });
    expect(s.ok).toBe(true);
    expect(post({ acao: 'salvar', numero: '1001', token: 'outro', progresso }).erro).toBe('SESSAO_EXPIRADA');

    const lista = post({ acao: 'prof-listar', senhaProfessor: PROF });
    const a = lista.estudantes.find((e: { numero: string }) => e.numero === '1001');
    expect(a).toMatchObject({ nome: 'Ana', turma: 'Robótica', xp: 340, concluidas: 2, atual: 'Missão 03', conquistas: 1 });
    expect(a.progresso.missions.m3.quiz).toBe(true);
    expect(JSON.stringify(lista)).not.toContain('Hash');

    const car = post({ acao: 'carregar', numero: '1001', token: login.token });
    expect(car.progresso.xp).toBe(340);
    expect(car.atualizadoEm).toBe(123);
    // entrar de novo devolve o progresso salvo
    const again = post({ acao: 'entrar', numero: '1001', senha: ana.senha });
    expect(again.progresso.xp).toBe(340);
    expect(again.trabalhos['u1001:montagem:m4']).toBe('{"parts":[]}');
    expect(again.atualizadoEm).toBe(123);
    // a sessão antiga deixa de valer
    expect(post({ acao: 'salvar', numero: '1001', token: login.token, progresso }).erro).toBe('SESSAO_EXPIRADA');
  });

  it('nova senha, renomear e remover', () => {
    const { post } = loadAppsScript(PROF);
    const cad = post({ acao: 'prof-cadastrar', senhaProfessor: PROF, nomes: ['Bia', 'Caio'] });
    const ns = post({ acao: 'prof-nova-senha', senhaProfessor: PROF, numero: '1001' });
    expect(post({ acao: 'entrar', numero: '1001', senha: cad.criados[0].senha }).ok).toBe(false);
    expect(post({ acao: 'entrar', numero: '1001', senha: ns.senha }).ok).toBe(true);
    expect(post({ acao: 'prof-renomear', senhaProfessor: PROF, numero: '1002', nome: 'Caio B.' }).ok).toBe(true);
    expect(post({ acao: 'prof-remover', senhaProfessor: PROF, numero: '1001' }).ok).toBe(true);
    const lista = post({ acao: 'prof-listar', senhaProfessor: PROF });
    expect(lista.estudantes.map((e: { nome: string }) => e.nome)).toEqual(['Caio B.']);
    // o número seguinte continua crescendo
    const mais = post({ acao: 'prof-cadastrar', senhaProfessor: PROF, nomes: ['Duda'] });
    expect(mais.criados[0].numero).toBe('1003');
  });

  it('bloqueia depois de muitas tentativas erradas', () => {
    const { post } = loadAppsScript(PROF);
    const cad = post({ acao: 'prof-cadastrar', senhaProfessor: PROF, nomes: ['Eva'] });
    for (let i = 0; i < 8; i++) post({ acao: 'entrar', numero: '1001', senha: 'x' });
    const r = post({ acao: 'entrar', numero: '1001', senha: cad.criados[0].senha });
    expect(r.ok).toBe(false);
    expect(r.erro).toContain('Muitas tentativas');
  });

  it('recusa pedidos de outro app ou ação desconhecida', () => {
    const { post, ctx } = loadAppsScript(PROF);
    expect(post({ acao: 'qualquer' }).ok).toBe(false);
    const out = (ctx.doPost as (e: unknown) => { text: string })({ postData: { contents: '{"app":"outro"}' } });
    expect(JSON.parse(out.text).ok).toBe(false);
  });
});
