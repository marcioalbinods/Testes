/**
 * Testes do backend (arquivos .gs reais executados no simulador gas-mock.js).
 * Executar:  node tests/backend.test.js
 */
'use strict';
const assert = require('assert');
const { criarAmbiente } = require('./gas-mock');

const DONO = 'coordenacao@escola.edu.br';
const PROF = 'professora@escola.edu.br';
const GESTOR = 'gestora@escola.edu.br';
const ESTRANHO = 'intruso@gmail.com';

const NOMES = ['ALICE BRITO DOS SANTOS', 'AMAEL HECTOR DOS SANTOS SILVA', 'ANA HELENA DE OLIVEIRA', 'ANA ISADORA MOTA BIZARRIA',
  'ANA LUIZA COSTA VASCONCELOS', 'ANNA CECILIA SILVEIRA DUARTE', 'ANNA CLARA PAIXAO SILVA', 'BRYAN LORENZO SOUZA DE JESUS',
  'DANDARA APRIL SANTOS DE OLIVEIRA', 'DANIEL DE ALMEIDA BERNARDO', 'DAVI XAVIER COLETA', 'DAVID PEDROSA DA SILVA',
  'ENZO GABRIEL MATOS LEITE', 'GIOVANNA VITORIA ORNELAS SELES', 'ISABELLA DA SILVA DOURADO', 'ISADORA DE OLIVEIRA TOMAZ',
  'ISAQUE DOS SANTOS FEITOSA', 'JASMIM DA SILVA SANTOS', 'LAURA ALMEIDA DE LIMA', 'LAURA DE JESUS ROCHA', 'LEVIH CONCEICAO DA SILVA',
  'LORENA SILVA DE MATOS', 'MANUELLY OLIVEIRA NASCIMENTO', 'MARIA LUIZA GOMES DA SILVA DE JESUS', 'MURILLO OLIVEIRA SOUSA',
  'MURILO SILVA DE JESUS', 'PERICLES RAFAEL SILVA DE SOUZA', 'RICHARD ARAUJO DOS SANTOS', 'SOPHIA DA CRUZ PEREIRA',
  'VINNYCIUS AUGUSTO DE OLIVEIRA VENTURA', 'WENDEL ARTHUR DE JESUS SALES', 'MANUELLA BERILO CONCEICAO AQUINO'];

let total = 0, falhas = 0;
function teste(nome, fn) {
  total++;
  try { fn(); console.log('  ✔ ' + nome); }
  catch (e) { falhas++; console.log('  ✖ ' + nome + '\n      ' + (e && e.stack || e).split('\n').slice(0, 4).join('\n      ')); }
}
function ok(r) { assert.ok(r && r.ok, 'esperava ok:true, veio ' + JSON.stringify(r).slice(0, 400)); return r.data; }
function erro(r, codigo) { assert.ok(r && r.ok === false, 'esperava erro ' + codigo + ', veio ' + JSON.stringify(r).slice(0, 300)); assert.strictEqual(r.codigo, codigo, r.erro); return r; }

const amb = criarAmbiente({ agora: '2026-11-20T10:00:00-03:00', dono: DONO });
const { api, estado, ctx } = amb;
function aba(nome) { return estado.planilhas[estado.propriedades.SPREADSHEET_ID].getSheetByName(nome); }
function linhas(nome) { return Math.max(0, aba(nome).getLastRow() - 1); }

console.log('\n1. Inicialização');
let turmaId;
teste('setupSistema cria planilha, 7 abas, configurações, admin e turma-piloto', () => {
  amb.novaExecucao(DONO);
  const log = ctx.setupSistema();
  assert.ok(estado.propriedades.SPREADSHEET_ID, 'ID salvo em Script Properties');
  const ss = estado.planilhas[estado.propriedades.SPREADSHEET_ID];
  assert.deepStrictEqual(ss.getSheets().map(s => s.getName()), ['CONFIGURACOES', 'PROFESSORES', 'TURMAS', 'ESTUDANTES', 'CHAMADAS', 'FREQUENCIAS', 'AUDITORIA']);
  assert.ok(/INSTALAÇÃO CONCLUÍDA COM SUCESSO/.test(estado.logs.join('\n')), 'mensagem de conclusão');
  assert.strictEqual(linhas('TURMAS'), 1);
  assert.strictEqual(linhas('PROFESSORES'), 1);
  assert.ok(log.length > 0);
  ss.getSheets().forEach(s => assert.ok(s.getProtections().length === 1 && s.getProtections()[0]._aviso, 'proteção com aviso em ' + s.getName()));
});
teste('cadastro dos 32 estudantes com nomes íntegros e numeração 1 a 32', () => {
  assert.strictEqual(linhas('ESTUDANTES'), 32);
  const v = aba('ESTUDANTES').getRange(2, 1, 32, 15).getValues();
  const cab = aba('ESTUDANTES').getRange(1, 1, 1, 15).getValues()[0];
  const iNome = cab.indexOf('NOME'), iNum = cab.indexOf('NUMERO'), iId = cab.indexOf('ID'), iEnt = cab.indexOf('DATA_ENTRADA');
  v.forEach((l, i) => {
    assert.strictEqual(l[iNome], NOMES[i], 'nome ' + (i + 1));
    assert.strictEqual(l[iNum], i + 1, 'número ' + (i + 1));
    assert.strictEqual(l[iEnt], '2026-11-17', 'data como texto (sem conversão automática)');
  });
  assert.strictEqual(new Set(v.map(l => l[iId])).size, 32, 'IDs únicos');
});
teste('setupSistema é idempotente (2ª e 3ª execução não duplicam nada)', () => {
  const antes = ['CONFIGURACOES', 'PROFESSORES', 'TURMAS', 'ESTUDANTES'].map(linhas);
  amb.novaExecucao(DONO); ctx.setupSistema();
  amb.novaExecucao(DONO); ctx.setupSistema();
  assert.deepStrictEqual(['CONFIGURACOES', 'PROFESSORES', 'TURMAS', 'ESTUDANTES'].map(linhas), antes);
  assert.strictEqual(Object.keys(estado.planilhas).length, 1, 'uma única planilha');
});
teste('verificarSistema aprova a estrutura', () => {
  amb.novaExecucao(DONO);
  const d = ctx.verificarSistema();
  assert.ok(d.ok, JSON.stringify(d.mensagens.filter(m => !m.ok)));
  assert.ok(d.mensagens.some(m => /32 nomes/.test(m.texto)));
});

console.log('\n2. Segurança e controle de acesso');
teste('usuário sem identidade (e-mail vazio) é bloqueado', () => {
  erro(api('', 'apiContexto'), 'SEM_IDENTIDADE');
  amb.novaExecucao('');
  const pg = ctx.doGet({});
  assert.ok(/identidade/i.test(pg.getContent()) && !/CONTEXTO/.test(pg.getContent()));
});
teste('usuário não cadastrado é bloqueado (API e doGet)', () => {
  erro(api(ESTRANHO, 'apiPainel', 'x'), 'NAO_AUTORIZADO');
  amb.novaExecucao(ESTRANHO);
  const pg = ctx.doGet({});
  assert.ok(/não autorizado/i.test(pg.getContent()) && !/ALICE/.test(pg.getContent()));
});
teste('setupSistema/verificarSistema/backup não podem ser chamados por terceiros', () => {
  amb.novaExecucao(ESTRANHO);
  assert.throws(() => ctx.setupSistema(), /não autorizada/);
  assert.throws(() => ctx.verificarSistema(), /não autorizada/);
  assert.throws(() => ctx.fazerBackupAgora(), /não autorizada/);
  assert.throws(() => ctx.backupAgendado({ triggerUid: 'falso' }), /não autorizada/);
  amb.novaExecucao('');
  assert.throws(() => ctx.setupSistema(), /identidade/);
});
teste('admin acessa o doGet e recebe o contexto sem credenciais', () => {
  amb.novaExecucao(DONO);
  const pg = ctx.doGet({});
  const html = pg.getContent();
  assert.ok(/var CONTEXTO = \{/.test(html));
  assert.ok(!/SPREADSHEET_ID|token/i.test(html.match(/var CONTEXTO = (.*);/)[1]));
  const c = JSON.parse(html.match(/var CONTEXTO = (.*);/)[1]);
  assert.strictEqual(c.usuario.perfil, 'ADMIN');
  assert.strictEqual(c.turmas.length, 1);
  turmaId = c.turmas[0].id;
  assert.strictEqual(c.turmas[0].nome, 'TURMA PILOTO');
  assert.strictEqual(c.turmas[0].estudantesAtivos, 32);
  assert.strictEqual(c.turmas[0].dataInicio, '2026-11-17');
});
teste('admin cadastra professor (turma-piloto) e gestor', () => {
  ok(api(DONO, 'apiSalvarProfessor', { nome: 'Maria Professora', email: PROF, perfil: 'PROFESSOR', turmas: [turmaId] }));
  ok(api(DONO, 'apiSalvarProfessor', { nome: 'Joana Gestora', email: GESTOR, perfil: 'GESTOR', turmas: ['*'] }));
  erro(api(DONO, 'apiSalvarProfessor', { nome: 'Outra', email: PROF, perfil: 'PROFESSOR', turmas: [turmaId] }), 'DUPLICADO');
});
teste('professor não executa operações administrativas', () => {
  erro(api(PROF, 'apiSalvarTurma', { nome: 'X', dataInicio: '2026-11-17' }), 'SEM_PERMISSAO');
  erro(api(PROF, 'apiSalvarProfessor', { nome: 'Hacker', email: 'h@x.com', perfil: 'ADMIN' }), 'SEM_PERMISSAO');
  erro(api(PROF, 'apiSalvarConfiguracoes', { LIMITE_FREQUENCIA: '50' }), 'SEM_PERMISSAO');
  erro(api(PROF, 'apiExecutarBackup'), 'SEM_PERMISSAO');
  erro(api(PROF, 'apiExportarDados'), 'SEM_PERMISSAO');
  erro(api(PROF, 'apiSalvarEstudante', { turmaId, nome: 'NOVO ALUNO' }), 'SEM_PERMISSAO');
});

console.log('\n3. Chamada');
let est; // lista de estudantes
let ch1;
teste('abrir chamada nova: 32 estudantes em ordem, todos NÃO REGISTRADO (nenhum presente automático)', () => {
  const d = ok(api(PROF, 'apiCarregarChamada', { turmaId, data: '2026-11-17' }));
  assert.strictEqual(d.chamada, null);
  assert.strictEqual(d.estudantes.length, 32);
  assert.deepStrictEqual(d.estudantes.map(e => e.numero), Array.from({ length: 32 }, (_, i) => i + 1));
  assert.ok(d.estudantes.every(e => e.situacao === 'NAO_REGISTRADO'));
  assert.ok(d.permissoes.editar);
  est = d.estudantes;
});
teste('data futura e anterior ao início são bloqueadas', () => {
  const f = ok(api(PROF, 'apiCarregarChamada', { turmaId, data: '2026-11-21' }));
  assert.strictEqual(f.permissoes.editar, false);
  erro(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-11-21', versao: 0, registros: [] }), 'SEM_PERMISSAO');
  erro(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-11-16', versao: 0, registros: [] }), 'SEM_PERMISSAO');
  erro(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-02-30', versao: 0, registros: [] }), 'DADOS_INVALIDOS');
});
teste('salvar rascunho com marcações parciais (presença, ausência, atraso, justificada)', () => {
  const regs = est.map((e, i) => ({ estudanteId: e.id, situacao: i < 10 ? 'PRESENTE' : i < 12 ? 'AUSENTE' : i < 13 ? 'ATRASADO' : i < 14 ? 'JUSTIFICADA' : 'NAO_REGISTRADO', observacao: i === 13 ? 'Atestado médico' : '' }));
  const d = ok(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-11-17', versao: 0, requestId: 'REQ1', registros: regs }));
  ch1 = d.chamada;
  assert.strictEqual(ch1.status, 'RASCUNHO');
  assert.strictEqual(ch1.versao, 1);
  assert.deepStrictEqual([ch1.presentes, ch1.ausentes, ch1.atrasados, ch1.justificados, ch1.naoRegistrados], [10, 2, 1, 1, 18]);
  assert.strictEqual(linhas('CHAMADAS'), 1);
  assert.strictEqual(linhas('FREQUENCIAS'), 32);
  assert.strictEqual(d.estudantes[13].observacao, 'Atestado médico');
});
teste('gravação em lote: poucas chamadas setValues por salvamento', () => {
  const antes = estado.chamadasApi.setValues;
  const regs = est.map((e, i) => ({ estudanteId: e.id, situacao: i < 10 ? 'PRESENTE' : i < 12 ? 'AUSENTE' : i < 13 ? 'ATRASADO' : i < 14 ? 'JUSTIFICADA' : i < 20 ? 'PRESENTE' : 'NAO_REGISTRADO', observacao: i === 13 ? 'Atestado médico' : '' }));
  const d = ok(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-11-17', chamadaId: ch1.id, versao: 1, requestId: 'REQ2', registros: regs }));
  const usadas = estado.chamadasApi.setValues - antes;
  assert.ok(usadas <= 4, 'setValues usados: ' + usadas);
  ch1 = d.chamada;
  assert.strictEqual(ch1.presentes, 16);
});
teste('reenvio da mesma requisição (nova tentativa após queda) não duplica nem altera versão', () => {
  const regs = est.map(e => ({ estudanteId: e.id, situacao: 'PRESENTE' }));
  const d = ok(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-11-17', chamadaId: ch1.id, versao: 1, requestId: 'REQ2', registros: regs }));
  assert.strictEqual(d.repetido, true);
  assert.strictEqual(d.chamada.versao, 2);
  assert.strictEqual(linhas('FREQUENCIAS'), 32);
});
teste('finalizar com estudantes não registrados é recusado (nada é gravado)', () => {
  const antesAud = linhas('AUDITORIA');
  const regs = est.map((e, i) => ({ estudanteId: e.id, situacao: i < 31 ? 'PRESENTE' : 'NAO_REGISTRADO' }));
  erro(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-11-17', chamadaId: ch1.id, versao: 2, requestId: 'REQ3', finalizar: true, registros: regs }), 'PENDENTES');
  assert.strictEqual(linhas('AUDITORIA'), antesAud);
  const d = ok(api(PROF, 'apiCarregarChamada', { turmaId, data: '2026-11-17' }));
  assert.strictEqual(d.chamada.versao, 2);
});
teste('gravações simultâneas: versão desatualizada gera CONFLITO (sem sobrescrever)', () => {
  // Gestora salva primeiro (versão 2 -> 3); professora ainda está com a versão 2.
  const regsG = est.map((e, i) => ({ estudanteId: e.id, situacao: i === 31 ? 'AUSENTE' : 'NAO_REGISTRADO' }));
  const g = ok(api(GESTOR, 'apiSalvarChamada', { turmaId, data: '2026-11-17', chamadaId: ch1.id, versao: 2, requestId: 'G1', registros: [regsG[31]] }));
  assert.strictEqual(g.chamada.versao, 3);
  const r = erro(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-11-17', chamadaId: ch1.id, versao: 2, requestId: 'P9', registros: [{ estudanteId: est[31].id, situacao: 'PRESENTE' }] }), 'CONFLITO');
  assert.ok(r.dados && r.dados.chamada.versao === 3, 'conflito devolve estado atual');
  assert.strictEqual(r.dados.estudantes[31].situacao, 'AUSENTE');
  // Criação simultânea de chamada nova para a mesma turma/data
  ok(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-11-18', versao: 0, requestId: 'N1', registros: [{ estudanteId: est[0].id, situacao: 'PRESENTE' }] }));
  erro(api(GESTOR, 'apiSalvarChamada', { turmaId, data: '2026-11-18', versao: 0, requestId: 'N2', registros: [{ estudanteId: est[0].id, situacao: 'AUSENTE' }] }), 'CONFLITO');
  assert.strictEqual(linhas('CHAMADAS'), 2, 'sem chamada duplicada');
});
teste('situação inválida e estudante de outra turma são rejeitados', () => {
  erro(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-11-17', chamadaId: ch1.id, versao: 3, registros: [{ estudanteId: est[0].id, situacao: 'TALVEZ' }] }), 'DADOS_INVALIDOS');
  erro(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-11-17', chamadaId: ch1.id, versao: 3, registros: [{ estudanteId: 'EST-INEXISTENTE', situacao: 'PRESENTE' }] }), 'DADOS_INVALIDOS');
});
teste('finalizar chamada completa', () => {
  const regs = est.map((e, i) => ({ estudanteId: e.id, situacao: i < 27 ? 'PRESENTE' : i < 29 ? 'AUSENTE' : i < 31 ? 'ATRASADO' : 'JUSTIFICADA' }));
  const d = ok(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-11-17', chamadaId: ch1.id, versao: 3, requestId: 'F1', finalizar: true, registros: regs }));
  assert.strictEqual(d.chamada.status, 'FINALIZADA');
  assert.deepStrictEqual([d.chamada.presentes, d.chamada.ausentes, d.chamada.atrasados, d.chamada.justificados, d.chamada.naoRegistrados], [27, 2, 2, 1, 0]);
  ch1 = d.chamada;
});
teste('recuperação após fechar e reabrir: dados vêm do servidor', () => {
  amb.estado.cache = {}; // simula expiração de cache
  const d = ok(api(PROF, 'apiCarregarChamada', { turmaId, data: '2026-11-17' }));
  assert.strictEqual(d.chamada.status, 'FINALIZADA');
  assert.strictEqual(d.estudantes.filter(e => e.situacao === 'PRESENTE').length, 27);
  assert.strictEqual(d.estudantes[13].situacao, 'PRESENTE');
  assert.strictEqual(d.estudantes[31].situacao, 'JUSTIFICADA');
});
teste('chamada finalizada não pode ser sobrescrita sem reabrir', () => {
  erro(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-11-17', chamadaId: ch1.id, versao: ch1.versao, registros: [{ estudanteId: est[0].id, situacao: 'AUSENTE' }] }), 'FINALIZADA');
});

console.log('\n4. Correções, reabertura e auditoria');
teste('correção de registro em chamada finalizada exige motivo e gera auditoria completa', () => {
  erro(api(PROF, 'apiCorrigirRegistro', { chamadaId: ch1.id, versao: ch1.versao, estudanteId: est[0].id, situacao: 'AUSENTE', motivo: '' }), 'DADOS_INVALIDOS');
  const d = ok(api(PROF, 'apiCorrigirRegistro', { chamadaId: ch1.id, versao: ch1.versao, estudanteId: est[0].id, situacao: 'AUSENTE', motivo: 'Registro marcado por engano' }));
  assert.strictEqual(d.chamada.status, 'FINALIZADA');
  assert.strictEqual(d.chamada.ausentes, 3);
  const aud = ok(api(DONO, 'apiListarAuditoria', { acao: 'CORRECAO_REGISTRO' }));
  const a = aud.itens[0];
  assert.strictEqual(a.VALOR_ANTERIOR, 'PRESENTE');
  assert.strictEqual(a.VALOR_NOVO, 'AUSENTE');
  assert.strictEqual(a.USUARIO, PROF);
  assert.strictEqual(a.ESTUDANTE, NOMES[0]);
  assert.strictEqual(a.TURMA, turmaId);
  assert.strictEqual(a.MOTIVO, 'Registro marcado por engano');
  assert.ok(a.REGISTRO_ID.startsWith('FRE-'));
  assert.ok(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(a.DATA_HORA));
  ch1 = d.chamada;
});
teste('reabrir exige motivo; reabertura e alteração de situação são auditadas', () => {
  erro(api(PROF, 'apiReabrirChamada', { chamadaId: ch1.id, versao: ch1.versao, motivo: '' }), 'DADOS_INVALIDOS');
  const d = ok(api(PROF, 'apiReabrirChamada', { chamadaId: ch1.id, versao: ch1.versao, motivo: 'Correção solicitada pela família' }));
  assert.strictEqual(d.chamada.status, 'RASCUNHO');
  const regs = d.estudantes.map(e => ({ estudanteId: e.id, situacao: e.situacao }));
  regs[1].situacao = 'ATRASADO';
  const f = ok(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-11-17', chamadaId: ch1.id, versao: d.chamada.versao, requestId: 'F2', finalizar: true, registros: regs }));
  assert.strictEqual(f.chamada.status, 'FINALIZADA');
  const aud = ok(api(DONO, 'apiListarAuditoria', {}));
  const acoes = aud.itens.map(x => x.ACAO);
  ['REABERTURA_CHAMADA', 'ALTERACAO_SITUACAO', 'FINALIZACAO_CHAMADA', 'CRIACAO_CHAMADA', 'INSTALACAO'].forEach(x => assert.ok(acoes.includes(x), 'auditoria contém ' + x));
  const alt = aud.itens.find(x => x.ACAO === 'ALTERACAO_SITUACAO' && x.ESTUDANTE === NOMES[1]);
  assert.strictEqual(alt.VALOR_ANTERIOR, 'PRESENTE'); assert.strictEqual(alt.VALOR_NOVO, 'ATRASADO');
  ch1 = f.chamada;
});
teste('professor fora do prazo (7 dias) não edita; gestor edita', () => {
  estado.agora = new amb.RealDate('2026-12-01T10:00:00-03:00');
  const p = ok(api(PROF, 'apiCarregarChamada', { turmaId, data: '2026-11-17' }));
  assert.strictEqual(p.permissoes.editar, false);
  erro(api(PROF, 'apiReabrirChamada', { chamadaId: ch1.id, versao: ch1.versao, motivo: 'tentativa fora do prazo' }), 'SEM_PERMISSAO');
  const g = ok(api(GESTOR, 'apiCarregarChamada', { turmaId, data: '2026-11-17' }));
  assert.strictEqual(g.permissoes.editar, true);
  estado.agora = new amb.RealDate('2026-11-20T10:00:00-03:00');
});
teste('histórico por data, estudante e situação; detalhe com auditoria', () => {
  const h = ok(api(PROF, 'apiListarHistorico', { turmaId, inicio: '2026-11-17', fim: '2026-11-20' }));
  assert.strictEqual(h.modo, 'CHAMADAS');
  assert.strictEqual(h.total, 2);
  const porEst = ok(api(PROF, 'apiListarHistorico', { turmaId, estudanteId: est[0].id }));
  assert.strictEqual(porEst.modo, 'REGISTROS');
  assert.ok(porEst.itens.every(x => x.estudanteId === est[0].id));
  const porSit = ok(api(PROF, 'apiListarHistorico', { turmaId, situacao: 'JUSTIFICADA' }));
  assert.ok(porSit.itens.length >= 1 && porSit.itens.every(x => x.situacao === 'JUSTIFICADA'));
  const det = ok(api(PROF, 'apiDetalheChamada', ch1.id));
  assert.strictEqual(det.estudantes.length, 32);
  assert.ok(det.auditoria.length >= 3);
});

console.log('\n5. Relatórios e estatísticas');
let ch2;
teste('dias sem chamada não contam como falta; somente finalizadas entram', () => {
  // 18/11 está em rascunho (1 presença): não pode entrar nas estatísticas.
  const p = ok(api(PROF, 'apiPainel', turmaId));
  assert.strictEqual(p.chamadasRealizadas, 1);
  assert.strictEqual(p.totais.registros, 32);
  assert.strictEqual(p.rascunhos.length, 1);
});
teste('cálculo de frequência distingue presença, atraso, ausência e justificada', () => {
  // 2ª chamada (19/11): todos presentes exceto nº 1 (AUSENTE) e nº 32 (JUSTIFICADA)
  const d = ok(api(PROF, 'apiCarregarChamada', { turmaId, data: '2026-11-19' }));
  const regs = d.estudantes.map((e, i) => ({ estudanteId: e.id, situacao: i === 0 ? 'AUSENTE' : i === 31 ? 'JUSTIFICADA' : 'PRESENTE' }));
  ch2 = ok(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-11-19', versao: 0, requestId: 'C2', finalizar: true, registros: regs })).chamada;
  const p = ok(api(PROF, 'apiPainel', turmaId));
  // 17/11 (após correção e reabertura): P=25 A=3 T=3 J=1 ; 19/11: P=30 A=1 J=1
  assert.deepStrictEqual([p.totais.P, p.totais.A, p.totais.T, p.totais.J], [55, 4, 3, 2]);
  // frequência = (P + T) / (P + A + T + J) = 58/64
  assert.strictEqual(p.totais.frequencia, Math.round(58 / 64 * 1000) / 10);
  const alice = p.alertas.find(a => a.numero === 1);
  assert.ok(alice && alice.frequencia === 0, 'Alice com 0% em alerta');
  const manuella = p.alertas.find(a => a.numero === 32);
  assert.ok(manuella && manuella.frequencia === 0 && manuella.justificadas === 2, 'justificada não conta como comparecimento (padrão)');
  assert.ok(p.alertas.every(a => a.frequencia < 90));
  assert.strictEqual(p.serie.length, 2);
});
teste('regras configuráveis alteram o cálculo (justificada excluída da base)', () => {
  ok(api(DONO, 'apiSalvarConfiguracoes', { JUSTIFICADA_EXCLUIR_DO_CALCULO: 'SIM' }));
  const p = ok(api(PROF, 'apiPainel', turmaId));
  assert.strictEqual(p.totais.frequencia, Math.round(58 / 62 * 1000) / 10);
  assert.ok(!p.alertas.find(a => a.numero === 32), 'sem base, Manuella não entra no alerta');
  ok(api(DONO, 'apiSalvarConfiguracoes', { JUSTIFICADA_EXCLUIR_DO_CALCULO: 'NAO' }));
  erro(api(DONO, 'apiSalvarConfiguracoes', { LIMITE_FREQUENCIA: '150' }), 'DADOS_INVALIDOS');
  erro(api(DONO, 'apiSalvarConfiguracoes', { SPREADSHEET_ID: 'x' }), 'DADOS_INVALIDOS');
});
teste('7 relatórios obrigatórios com cabeçalho completo', () => {
  ['DIARIA', 'SEMANAL', 'MENSAL', 'GERAL', 'MAIS_FALTAS', 'ABAIXO_LIMITE'].forEach(tipo => {
    const r = ok(api(PROF, 'apiRelatorio', { tipo, turmaId, inicio: '2026-11-17', fim: '2026-11-20' }));
    ['escola', 'turma', 'periodo', 'professor', 'emissao'].forEach(k => assert.ok(r.meta[k], tipo + ' sem ' + k));
    assert.ok(r.colunas.length && Array.isArray(r.linhas), tipo);
  });
  const d = ok(api(PROF, 'apiRelatorio', { tipo: 'DIARIA', turmaId, inicio: '2026-11-17', fim: '2026-11-20' }));
  assert.strictEqual(d.linhas.length, 2);
  const s = ok(api(PROF, 'apiRelatorio', { tipo: 'SEMANAL', turmaId, inicio: '2026-11-17', fim: '2026-11-20' }));
  assert.strictEqual(s.linhas.length, 1);
  assert.ok(/16\/11\/2026 a 22\/11\/2026/.test(s.linhas[0].periodo));
  const m = ok(api(PROF, 'apiRelatorio', { tipo: 'MENSAL', turmaId }));
  assert.strictEqual(m.linhas[0].periodo, 'novembro/2026');
  const g = ok(api(PROF, 'apiRelatorio', { tipo: 'GERAL', turmaId }));
  assert.strictEqual(g.linhas.length, 32);
  const mf = ok(api(PROF, 'apiRelatorio', { tipo: 'MAIS_FALTAS', turmaId, limiteLinhas: 3 }));
  assert.strictEqual(mf.linhas[0].nome, NOMES[0]);
  assert.ok(mf.linhas.length <= 3);
  const ab = ok(api(PROF, 'apiRelatorio', { tipo: 'ABAIXO_LIMITE', turmaId }));
  assert.ok(ab.linhas.every(l => l.frequencia < 90));
  const ind = ok(api(PROF, 'apiRelatorio', { tipo: 'INDIVIDUAL', turmaId, estudanteId: est[0].id }));
  assert.strictEqual(ind.linhas.length, 2);
  assert.ok(ind.meta.estudante.includes(NOMES[0]));
  const vazio = ok(api(PROF, 'apiRelatorio', { tipo: 'GERAL', turmaId, inicio: '2026-11-20', fim: '2026-11-20' }));
  assert.ok(vazio.aviso);
  erro(api(PROF, 'apiRelatorio', { tipo: 'GERAL', turmaId, inicio: '2026-11-20', fim: '2026-11-17' }), 'DADOS_INVALIDOS');
});
teste('ficha individual: totais, percentual e histórico cronológico', () => {
  const f = ok(api(PROF, 'apiFichaEstudante', { estudanteId: est[1].id }));
  assert.strictEqual(f.estudante.nome, NOMES[1]);
  assert.strictEqual(f.estudante.numero, 2);
  assert.strictEqual(f.estudante.turmaNome, 'TURMA PILOTO');
  assert.deepStrictEqual([f.resumo.registros, f.resumo.presencas, f.resumo.atrasos], [2, 1, 1]);
  assert.strictEqual(f.resumo.frequencia, 100);
  assert.deepStrictEqual(f.historico.map(x => x.data), ['2026-11-17', '2026-11-19']);
  const periodo = ok(api(PROF, 'apiFichaEstudante', { estudanteId: est[1].id, inicio: '2026-11-18', fim: '2026-11-20' }));
  assert.strictEqual(periodo.resumo.registros, 1);
});
teste('exportação CSV (UTF-8 com BOM, separador ;) com cabeçalho do relatório', () => {
  const a = ok(api(PROF, 'apiExportarRelatorio', { tipo: 'GERAL', turmaId, formato: 'CSV' }));
  const txt = Buffer.from(a.base64, 'base64').toString('utf8');
  assert.ok(txt.charCodeAt(0) === 0xFEFF);
  assert.ok(txt.includes('"Turma";"TURMA PILOTO"'));
  assert.ok(txt.includes('"ALICE BRITO DOS SANTOS"'));
  assert.ok(txt.includes('"Período analisado"'));
  assert.ok(/\.csv$/.test(a.nome));
});
teste('exportação PDF (A4) e Excel executam sem erro e removem arquivos temporários', () => {
  const pdf = ok(api(PROF, 'apiExportarRelatorio', { tipo: 'GERAL', turmaId, formato: 'PDF' }));
  assert.strictEqual(pdf.mime, 'application/pdf');
  const xlsx = ok(api(PROF, 'apiExportarRelatorio', { tipo: 'DIARIA', turmaId, formato: 'XLSX' }));
  assert.ok(/\.xlsx$/.test(xlsx.nome));
  const ind = ok(api(PROF, 'apiExportarRelatorio', { tipo: 'INDIVIDUAL', turmaId, estudanteId: est[0].id, formato: 'PDF' }));
  assert.ok(ind.base64.length > 0);
  const vazio = ok(api(PROF, 'apiExportarRelatorio', { tipo: 'ABAIXO_LIMITE', turmaId, inicio: '2026-11-20', fim: '2026-11-20', formato: 'PDF' }));
  assert.ok(vazio.base64);
  const temporarios = Object.values(estado.arquivos).filter(f => /^TEMP/.test(f._nome));
  assert.ok(temporarios.length >= 3 && temporarios.every(f => f._lixeira), 'temporários na lixeira');
  const exp = ok(api(DONO, 'apiExportarDados'));
  assert.ok(/dados_completos/.test(exp.nome));
});

console.log('\n6. Cadastros (estudantes, turmas) e preservação do histórico');
let novoEst, turma2;
teste('adicionar estudante (número automático 33), validar nome e homônimo', () => {
  novoEst = ok(api(GESTOR, 'apiSalvarEstudante', { turmaId, nome: 'JOÃO PEDRO DA SILVA', dataEntrada: '2026-11-20' }));
  assert.strictEqual(novoEst.numero, 33);
  assert.ok(novoEst.id.startsWith('EST-'));
  erro(api(GESTOR, 'apiSalvarEstudante', { turmaId, nome: 'ALICE BRITO DOS SANTOS' }), 'HOMONIMO');
  erro(api(GESTOR, 'apiSalvarEstudante', { turmaId, nome: '=HYPERLINK("x")' }), 'DADOS_INVALIDOS');
  erro(api(GESTOR, 'apiSalvarEstudante', { turmaId, nome: 'AB' }), 'DADOS_INVALIDOS');
});
teste('editar nome e número (sem duplicar número de chamada)', () => {
  erro(api(GESTOR, 'apiSalvarEstudante', { id: novoEst.id, nome: novoEst.nome, numero: 5 }), 'DUPLICADO');
  const e = ok(api(GESTOR, 'apiSalvarEstudante', { id: novoEst.id, nome: 'JOÃO PEDRO DA SILVA SOUZA', numero: 40 }));
  assert.strictEqual(e.numero, 40);
  assert.strictEqual(e.nome, 'JOÃO PEDRO DA SILVA SOUZA');
});
teste('novo estudante só aparece em chamadas a partir da data de entrada', () => {
  const antes = ok(api(PROF, 'apiCarregarChamada', { turmaId, data: '2026-11-19' }));
  assert.ok(!antes.estudantes.some(e => e.id === novoEst.id));
  const depois = ok(api(PROF, 'apiCarregarChamada', { turmaId, data: '2026-11-20' }));
  assert.strictEqual(depois.estudantes.length, 33);
  assert.strictEqual(depois.estudantes[32].id, novoEst.id);
});
teste('inativar estudante preserva histórico e remove das próximas chamadas', () => {
  erro(api(GESTOR, 'apiAlterarStatusEstudante', est[2].id, false, ''), 'DADOS_INVALIDOS');
  ok(api(GESTOR, 'apiAlterarStatusEstudante', est[2].id, false, 'Mudança de cidade', '2026-11-20'));
  const futura = ok(api(PROF, 'apiCarregarChamada', { turmaId, data: '2026-11-20' }));
  assert.ok(!futura.estudantes.some(e => e.id === est[2].id));
  const antiga = ok(api(PROF, 'apiCarregarChamada', { turmaId, data: '2026-11-17' }));
  assert.ok(antiga.estudantes.some(e => e.id === est[2].id), 'continua na chamada antiga');
  const ficha = ok(api(PROF, 'apiFichaEstudante', { estudanteId: est[2].id }));
  assert.strictEqual(ficha.resumo.registros, 2, 'histórico preservado');
  assert.strictEqual(linhas('ESTUDANTES'), 33, 'nenhum registro apagado');
  const lista = ok(api(PROF, 'apiListarEstudantes', turmaId, false));
  assert.strictEqual(lista.length, 32);
  ok(api(GESTOR, 'apiAlterarStatusEstudante', est[2].id, true, '', ''));
  ok(api(GESTOR, 'apiAlterarStatusEstudante', est[2].id, false, 'Mudança de cidade', '2026-11-20'));
});
teste('criar e editar turma; professor só acessa turmas atribuídas', () => {
  turma2 = ok(api(DONO, 'apiSalvarTurma', { nome: '5º ANO B', anoSerie: '5º ano', turno: 'Vespertino', dataInicio: '2026-11-17' }));
  erro(api(DONO, 'apiSalvarTurma', { nome: '5º ano b', dataInicio: '2026-11-17' }), 'DUPLICADO');
  const ed = ok(api(DONO, 'apiSalvarTurma', { id: turma2.id, nome: '5º ANO B', anoSerie: '5º ano', turno: 'Matutino', dataInicio: '2026-11-17' }));
  assert.strictEqual(ed.turno, 'Matutino');
  erro(api(PROF, 'apiCarregarChamada', { turmaId: turma2.id, data: '2026-11-20' }), 'SEM_PERMISSAO');
  erro(api(PROF, 'apiPainel', turma2.id), 'SEM_PERMISSAO');
  const ctxProf = ok(api(PROF, 'apiContexto'));
  assert.deepStrictEqual(ctxProf.turmas.map(t => t.id), [turmaId]);
  ok(api(DONO, 'apiSalvarTurma', { id: turmaId, nome: 'TURMA PILOTO — 5º ANO A', dataInicio: '2026-11-17' }));
  assert.strictEqual(ok(api(PROF, 'apiContexto')).turmas[0].nome, 'TURMA PILOTO — 5º ANO A');
});
teste('transferir estudante: registros antigos permanecem na turma de origem', () => {
  const t = ok(api(GESTOR, 'apiTransferirEstudante', est[3].id, turma2.id, '2026-11-20', 'Remanejamento'));
  assert.strictEqual(t.turmaId, turma2.id);
  assert.strictEqual(t.numero, 1);
  const antiga = ok(api(PROF, 'apiCarregarChamada', { turmaId, data: '2026-11-19' }));
  const naAntiga = antiga.estudantes.find(e => e.id === est[3].id);
  assert.ok(naAntiga && naAntiga.numero === 4, 'aparece na turma de origem nas datas anteriores');
  const hoje = ok(api(PROF, 'apiCarregarChamada', { turmaId, data: '2026-11-20' }));
  assert.ok(!hoje.estudantes.some(e => e.id === est[3].id));
  const nova = ok(api(GESTOR, 'apiCarregarChamada', { turmaId: turma2.id, data: '2026-11-20' }));
  assert.strictEqual(nova.estudantes.length, 1);
  const rel = ok(api(PROF, 'apiRelatorio', { tipo: 'GERAL', turmaId, inicio: '2026-11-17', fim: '2026-11-19' }));
  assert.ok(rel.linhas.some(l => l.id === est[3].id && l.registros === 2));
});
teste('inativar turma: somente consulta', () => {
  ok(api(DONO, 'apiAlterarStatusTurma', turma2.id, false, 'Teste'));
  const c = ok(api(GESTOR, 'apiCarregarChamada', { turmaId: turma2.id, data: '2026-11-20' }));
  assert.strictEqual(c.permissoes.editar, false);
  ok(api(DONO, 'apiAlterarStatusTurma', turma2.id, true, ''));
});
teste('admin não pode remover o próprio acesso; desativado perde acesso', () => {
  const lista = ok(api(DONO, 'apiListarProfessores'));
  const eu = lista.find(p => p.email === DONO);
  erro(api(DONO, 'apiAlterarStatusProfessor', eu.id, false), 'SEM_PERMISSAO');
  const prof = lista.find(p => p.email === PROF);
  ok(api(DONO, 'apiAlterarStatusProfessor', prof.id, false));
  erro(api(PROF, 'apiContexto'), 'NAO_AUTORIZADO');
  ok(api(DONO, 'apiAlterarStatusProfessor', prof.id, true));
  ok(api(PROF, 'apiContexto'));
});

console.log('\n7. Backup, robustez e integridade');
teste('backup cria cópia datada em pasta privada e registra resultado', () => {
  const b = ok(api(DONO, 'apiExecutarBackup'));
  assert.ok(/^BACKUP Frequência Escolar 2026-11-20_10-00$/.test(b.nome));
  const l = ok(api(DONO, 'apiListarBackups'));
  assert.strictEqual(l.backups.length, 1);
  assert.strictEqual(l.backupDiarioAtivo, false);
  amb.novaExecucao(DONO);
  assert.ok(/instalado/.test(ctx.instalarBackupDiario()));
  amb.novaExecucao(DONO);
  assert.ok(/já está instalado/.test(ctx.instalarBackupDiario()));
  amb.novaExecucao(DONO);
  ctx.backupAgendado({ triggerUid: 'TRG1' });
  assert.strictEqual(ok(api(DONO, 'apiListarBackups')).backups.length, 2);
  const aud = ok(api(DONO, 'apiListarAuditoria', { acao: 'BACKUP' }));
  assert.ok(aud.itens.length === 2 && aud.itens.every(a => a.VALOR_NOVO === 'SUCESSO'));
});
teste('sistema ocupado (lock) devolve OCUPADO sem gravar', () => {
  estado.forcarLockOcupado = true;
  const antes = linhas('FREQUENCIAS');
  erro(api(PROF, 'apiSalvarChamada', { turmaId, data: '2026-11-20', versao: 0, registros: [{ estudanteId: est[0].id, situacao: 'PRESENTE' }] }), 'OCUPADO');
  estado.forcarLockOcupado = false;
  assert.strictEqual(linhas('FREQUENCIAS'), antes);
});
teste('crescimento: planilha expande linhas automaticamente (60 chamadas)', () => {
  estado.agora = new amb.RealDate('2027-03-30T10:00:00-03:00');
  let dia = '2026-11-23', feitas = 0;
  const lista = ok(api(GESTOR, 'apiCarregarChamada', { turmaId, data: dia })).estudantes;
  while (feitas < 60) {
    const regs = lista.map((e, i) => ({ estudanteId: e.id, situacao: (i + feitas) % 9 === 0 ? 'AUSENTE' : 'PRESENTE' }));
    ok(api(GESTOR, 'apiSalvarChamada', { turmaId, data: dia, versao: 0, requestId: 'G' + feitas, finalizar: true, registros: regs }));
    feitas++;
    dia = ctx.adicionarDias_(dia, 1);
  }
  assert.ok(aba('FREQUENCIAS').getMaxRows() > 1000, 'linhas inseridas');
  assert.ok(linhas('FREQUENCIAS') > 1900);
  const p = ok(api(GESTOR, 'apiPainel', turmaId));
  assert.ok(p.chamadasRealizadas >= 62);
  const fmt = aba('FREQUENCIAS').getRange(aba('FREQUENCIAS').getLastRow(), 4, 1, 1).getValues()[0][0];
  assert.strictEqual(typeof fmt, 'string', 'datas continuam texto nas linhas novas');
  estado.agora = new amb.RealDate('2026-11-20T10:00:00-03:00');
});
teste('verificarSistema final sem inconsistências e sem duplicidades', () => {
  amb.novaExecucao(DONO);
  const d = ctx.verificarSistema();
  assert.ok(d.ok, JSON.stringify(d.mensagens.filter(m => !m.ok)));
  const d2 = ok(api(DONO, 'apiVerificarSistema'));
  assert.ok(d2.ok);
});
teste('nenhum erro interno registrado no log durante os testes', () => {
  const erros = estado.logs.filter(l => l.startsWith('ERRO'));
  assert.strictEqual(erros.length, 0, erros.join('\n'));
});

console.log('\n' + (total - falhas) + '/' + total + ' testes passaram.');
process.exit(falhas ? 1 : 0);
