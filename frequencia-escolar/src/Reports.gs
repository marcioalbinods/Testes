/**
 * Reports.gs — Cálculos de frequência, painel (dashboard), relatórios e ficha individual.
 *
 * Regras de cálculo (configuráveis em CONFIGURACOES):
 *  - PRESENTE: comparecimento.
 *  - ATRASADO: comparecimento se ATRASO_CONTA_COMPARECIMENTO = SIM (padrão); senão, falta.
 *  - AUSENTE: falta.
 *  - JUSTIFICADA: identificada separadamente; NÃO conta como comparecimento
 *    (JUSTIFICADA_CONTA_COMPARECIMENTO = NAO, padrão). Se JUSTIFICADA_EXCLUIR_DO_CALCULO = SIM,
 *    não entra na base do percentual.
 *  - NÃO REGISTRADO e dias sem chamada: NUNCA contam (nem como presença nem como falta).
 *  - Por padrão só chamadas FINALIZADAS entram nas estatísticas (CONTAR_RASCUNHOS = NAO).
 *
 *  Frequência (%) = comparecimentos / registros considerados × 100.
 */

var TIPOS_RELATORIO = {
  DIARIA: 'Frequência diária',
  SEMANAL: 'Frequência semanal',
  MENSAL: 'Frequência mensal',
  INDIVIDUAL: 'Frequência individual',
  GERAL: 'Frequência geral da turma',
  MAIS_FALTAS: 'Estudantes com maior número de faltas',
  ABAIXO_LIMITE: 'Estudantes abaixo do limite de frequência'
};

function regrasCalculo_(cfg) {
  return {
    atrasoConta: ehSim_(cfg.ATRASO_CONTA_COMPARECIMENTO === undefined ? 'SIM' : cfg.ATRASO_CONTA_COMPARECIMENTO),
    justificadaConta: ehSim_(cfg.JUSTIFICADA_CONTA_COMPARECIMENTO),
    justificadaExcluir: ehSim_(cfg.JUSTIFICADA_EXCLUIR_DO_CALCULO),
    contarRascunhos: ehSim_(cfg.CONTAR_RASCUNHOS),
    limite: configNum_(cfg, 'LIMITE_FREQUENCIA', 90)
  };
}

function descricaoRegras_(r) {
  return 'Presença conta como comparecimento; atraso ' + (r.atrasoConta ? 'conta' : 'NÃO conta') + ' como comparecimento; ' +
    'ausência conta como falta; falta justificada ' + (r.justificadaConta ? 'conta' : 'não conta') + ' como comparecimento' +
    (r.justificadaExcluir ? ' e é excluída da base de cálculo' : ' e permanece identificada separadamente') + '. ' +
    'Dias sem chamada não são contabilizados. ' + (r.contarRascunhos ? 'Inclui chamadas em rascunho.' : 'Somente chamadas finalizadas.');
}

/** c = {P, A, T, J} -> índices calculados conforme as regras. frequencia = null quando não há base. */
function calcularIndice_(c, regras) {
  var P = Number(c.P) || 0, A = Number(c.A) || 0, T = Number(c.T) || 0, J = Number(c.J) || 0;
  var comparecimentos = P + (regras.atrasoConta ? T : 0) + (regras.justificadaConta ? J : 0);
  var base = P + A + T + (regras.justificadaExcluir ? 0 : J);
  return {
    P: P, A: A, T: T, J: J, registros: P + A + T + J,
    comparecimentos: comparecimentos, base: base,
    faltas: A + (regras.atrasoConta ? 0 : T),
    frequencia: base > 0 ? Math.round(comparecimentos / base * 1000) / 10 : null
  };
}

function somarSituacao_(acc, s) {
  if (s === SITUACAO.PRESENTE) acc.P++;
  else if (s === SITUACAO.AUSENTE) acc.A++;
  else if (s === SITUACAO.ATRASADO) acc.T++;
  else if (s === SITUACAO.JUSTIFICADA) acc.J++;
  return acc;
}

/**
 * Registros válidos para estatística de uma turma no período:
 * somente chamadas consideradas (finalizadas, ou também rascunhos se configurado)
 * e somente situações registradas.
 */
function dadosEstatisticos_(turmaId, inicio, fim, regras) {
  var chamadas = lerTabela_('CHAMADAS').filter(function (c) {
    return c.TURMA_ID === turmaId && (!inicio || c.DATA >= inicio) && (!fim || c.DATA <= fim) &&
      (c.STATUS === STATUS_CHAMADA.FINALIZADA || regras.contarRascunhos);
  });
  var ids = {};
  chamadas.forEach(function (c) { ids[c.ID] = 1; });
  var registros = chamadas.length ? lerTabela_('FREQUENCIAS').filter(function (r) {
    return ids[r.CHAMADA_ID] && r.SITUACAO !== SITUACAO.NAO_REGISTRADO;
  }) : [];
  return { chamadas: chamadas, registros: registros };
}

/** Estatística por estudante (inclui inativos que tenham registros no período). */
function estatisticaPorEstudante_(turmaId, registros, regras, dataRef) {
  var estudantes = lerTabela_('ESTUDANTES');
  var porId = indexarPor_(estudantes, 'ID');
  var acc = {};
  estudantesElegiveis_(turmaId, dataRef || hoje_(), estudantes).forEach(function (e) {
    acc[e.id] = { id: e.id, numero: e.numero, nome: e.nome, ativo: true, c: { P: 0, A: 0, T: 0, J: 0 } };
  });
  registros.forEach(function (r) {
    if (!acc[r.ESTUDANTE_ID]) {
      var e = porId[r.ESTUDANTE_ID];
      acc[r.ESTUDANTE_ID] = { id: r.ESTUDANTE_ID, numero: r.NUMERO, nome: e ? e.NOME : r.NOME_ESTUDANTE, ativo: false, c: { P: 0, A: 0, T: 0, J: 0 } };
    }
    somarSituacao_(acc[r.ESTUDANTE_ID].c, r.SITUACAO);
  });
  return Object.keys(acc).map(function (id) {
    var x = acc[id];
    var i = calcularIndice_(x.c, regras);
    return { id: x.id, numero: x.numero, nome: x.nome, ativo: x.ativo, registros: i.registros, presencas: i.P, ausencias: i.A,
      atrasos: i.T, justificadas: i.J, faltas: i.faltas, frequencia: i.frequencia };
  }).sort(ordenarPorNumero_);
}

function validarPeriodoRelatorio_(inicio, fim, turma) {
  var ini = inicio ? validarData_(inicio, 'Data inicial') : (turma.DATA_INICIO || '2000-01-01');
  var f = fim ? validarData_(fim, 'Data final') : hoje_();
  if (ini > f) throw appError_('DADOS_INVALIDOS', 'A data inicial é posterior à data final.');
  return { inicio: ini, fim: f };
}

// ------------------------------------------------------------------ Painel

/** API: dados do painel principal de uma turma (desde o início da turma até hoje). */
function apiPainel(turmaId) {
  return executar_('apiPainel', function () {
    var u = exigirUsuario_();
    var turma = exigirTurma_(u, turmaId);
    var cfg = config_();
    var regras = regrasCalculo_(cfg);
    var hoje = hoje_();
    var dados = dadosEstatisticos_(turma.ID, '', hoje, regras);
    var total = { P: 0, A: 0, T: 0, J: 0 };
    dados.registros.forEach(function (r) { somarSituacao_(total, r.SITUACAO); });
    var geral = calcularIndice_(total, regras);

    // Série diária (últimos 20 dias com chamada considerada).
    var porDia = {};
    dados.registros.forEach(function (r) {
      porDia[r.DATA] = porDia[r.DATA] || { P: 0, A: 0, T: 0, J: 0 };
      somarSituacao_(porDia[r.DATA], r.SITUACAO);
    });
    var serie = Object.keys(porDia).sort().slice(-20).map(function (d) {
      var i = calcularIndice_(porDia[d], regras);
      return { data: d, frequencia: i.frequencia, presentes: i.P, ausentes: i.A, atrasados: i.T, justificados: i.J };
    });

    var porEstudante = estatisticaPorEstudante_(turma.ID, dados.registros, regras, hoje);
    var alertas = porEstudante.filter(function (e) { return e.frequencia !== null && e.frequencia < regras.limite; })
      .sort(function (a, b) { return a.frequencia - b.frequencia || b.faltas - a.faltas; });

    var todasChamadas = lerTabela_('CHAMADAS').filter(function (c) { return c.TURMA_ID === turma.ID; });
    var rascunhos = todasChamadas.filter(function (c) { return c.STATUS === STATUS_CHAMADA.RASCUNHO; })
      .map(chamadaParaCliente_).sort(function (a, b) { return b.data.localeCompare(a.data); });
    var chamadaHoje = todasChamadas.filter(function (c) { return c.DATA === hoje; }).map(chamadaParaCliente_);
    var ativos = lerTabela_('ESTUDANTES').filter(function (e) { return e.TURMA_ID === turma.ID && e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO; }).length;

    return {
      turma: turmaParaCliente_(turma, lerTabela_('ESTUDANTES')),
      hoje: hoje,
      estudantesAtivos: ativos,
      chamadasRealizadas: todasChamadas.filter(function (c) { return c.STATUS === STATUS_CHAMADA.FINALIZADA; }).length,
      chamadasConsideradas: dados.chamadas.length,
      rascunhos: rascunhos,
      chamadaHoje: chamadaHoje,
      totais: geral,
      serie: serie,
      alertas: alertas,
      limite: regras.limite,
      regras: descricaoRegras_(regras)
    };
  });
}

// ------------------------------------------------------------------ Relatórios

/** Professores vinculados à turma (para o cabeçalho dos relatórios). */
function professoresDaTurma_(turmaId) {
  return lerTabela_('PROFESSORES').filter(function (p) {
    if (!ehSim_(p.ATIVO) || p.PERFIL !== PERFIL.PROFESSOR) return false;
    return String(p.TURMAS).split(/[;,]/).map(function (s) { return s.trim(); }).indexOf(turmaId) >= 0;
  }).map(function (p) { return p.NOME; });
}

function linhaAgregada_(rotulo, acc, regras, extra) {
  var i = calcularIndice_(acc, regras);
  var o = { periodo: rotulo, presentes: i.P, ausentes: i.A, atrasados: i.T, justificados: i.J, registros: i.registros, frequencia: i.frequencia };
  if (extra) for (var k in extra) o[k] = extra[k];
  return o;
}

var COLUNAS_AGREGADAS_ = [
  { chave: 'periodo', rotulo: 'Período' }, { chave: 'chamadas', rotulo: 'Chamadas', tipo: 'num' },
  { chave: 'presentes', rotulo: 'Presenças', tipo: 'num' }, { chave: 'atrasados', rotulo: 'Atrasos', tipo: 'num' },
  { chave: 'ausentes', rotulo: 'Ausências', tipo: 'num' }, { chave: 'justificados', rotulo: 'Justificadas', tipo: 'num' },
  { chave: 'frequencia', rotulo: 'Frequência', tipo: 'pct' }
];
var COLUNAS_ESTUDANTE_ = [
  { chave: 'numero', rotulo: 'Nº', tipo: 'num' }, { chave: 'nome', rotulo: 'Estudante' },
  { chave: 'registros', rotulo: 'Registros', tipo: 'num' }, { chave: 'presencas', rotulo: 'Presenças', tipo: 'num' },
  { chave: 'atrasos', rotulo: 'Atrasos', tipo: 'num' }, { chave: 'ausencias', rotulo: 'Ausências', tipo: 'num' },
  { chave: 'justificadas', rotulo: 'Justificadas', tipo: 'num' }, { chave: 'frequencia', rotulo: 'Frequência', tipo: 'pct' }
];

/** Agrupa registros por chave (dia, semana ou mês) e devolve linhas do relatório. */
function agregarPor_(dados, regras, chaveFn, rotuloFn) {
  var grupos = {}, chamadasPorGrupo = {};
  dados.chamadas.forEach(function (c) {
    var k = chaveFn(c.DATA);
    chamadasPorGrupo[k] = (chamadasPorGrupo[k] || 0) + 1;
    grupos[k] = grupos[k] || { P: 0, A: 0, T: 0, J: 0 };
  });
  dados.registros.forEach(function (r) { somarSituacao_(grupos[chaveFn(r.DATA)], r.SITUACAO); });
  return Object.keys(grupos).sort().map(function (k) {
    return linhaAgregada_(rotuloFn(k), grupos[k], regras, { chamadas: chamadasPorGrupo[k] || 0 });
  });
}

/**
 * Monta um relatório estruturado (usado na tela e nas exportações PDF/Excel/CSV).
 * p = { tipo, turmaId, inicio, fim, estudanteId, limiteLinhas }
 */
function montarRelatorio_(u, p) {
  p = p || {};
  var tipo = String(p.tipo || '');
  if (!TIPOS_RELATORIO[tipo]) throw appError_('DADOS_INVALIDOS', 'Tipo de relatório inválido.');
  var turma = exigirTurma_(u, p.turmaId);
  var cfg = config_();
  var regras = regrasCalculo_(cfg);
  var per = validarPeriodoRelatorio_(p.inicio, p.fim, turma);
  var dados = dadosEstatisticos_(turma.ID, per.inicio, per.fim, regras);
  var total = { P: 0, A: 0, T: 0, J: 0 };
  dados.registros.forEach(function (r) { somarSituacao_(total, r.SITUACAO); });
  var geral = calcularIndice_(total, regras);
  var profs = professoresDaTurma_(turma.ID);

  var rel = {
    tipo: tipo,
    titulo: TIPOS_RELATORIO[tipo],
    meta: {
      escola: cfg.NOME_ESCOLA || '',
      turma: turma.NOME,
      periodo: dataBr_(per.inicio) + ' a ' + dataBr_(per.fim),
      inicio: per.inicio, fim: per.fim,
      professor: profs.length ? profs.join(', ') : u.nome,
      emitidoPor: u.nome + ' (' + u.email + ')',
      emissao: dataHoraBr_(agora_()),
      regras: descricaoRegras_(regras)
    },
    colunas: [], linhas: [], resumo: []
  };
  var resumoGeral = [
    { rotulo: 'Chamadas consideradas', valor: dados.chamadas.length },
    { rotulo: 'Presenças', valor: geral.P }, { rotulo: 'Atrasos', valor: geral.T },
    { rotulo: 'Ausências', valor: geral.A }, { rotulo: 'Faltas justificadas', valor: geral.J },
    { rotulo: 'Frequência geral', valor: geral.frequencia === null ? '—' : geral.frequencia.toFixed(1).replace('.', ',') + '%' }
  ];

  if (tipo === 'DIARIA' || tipo === 'SEMANAL' || tipo === 'MENSAL') {
    rel.colunas = COLUNAS_AGREGADAS_;
    if (tipo === 'DIARIA') {
      rel.linhas = agregarPor_(dados, regras, function (d) { return d; }, function (k) { return dataBr_(k); });
      rel.colunas = [{ chave: 'periodo', rotulo: 'Data' }].concat(COLUNAS_AGREGADAS_.slice(1));
    } else if (tipo === 'SEMANAL') {
      rel.linhas = agregarPor_(dados, regras, inicioSemana_, function (k) { return 'Semana de ' + dataBr_(k) + ' a ' + dataBr_(adicionarDias_(k, 6)); });
      rel.colunas = [{ chave: 'periodo', rotulo: 'Semana' }].concat(COLUNAS_AGREGADAS_.slice(1));
    } else {
      rel.linhas = agregarPor_(dados, regras, function (d) { return d.slice(0, 7); }, nomeMes_);
      rel.colunas = [{ chave: 'periodo', rotulo: 'Mês' }].concat(COLUNAS_AGREGADAS_.slice(1));
    }
    rel.resumo = resumoGeral;
  } else if (tipo === 'INDIVIDUAL') {
    var ficha = fichaEstudante_(u, p.estudanteId, per.inicio, per.fim, turma.ID);
    rel.titulo += ' — ' + ficha.estudante.nome;
    rel.meta.estudante = ficha.estudante.nome + ' (nº ' + ficha.estudante.numero + ')';
    rel.colunas = [{ chave: 'dataBr', rotulo: 'Data' }, { chave: 'periodo', rotulo: 'Período/aula' },
      { chave: 'situacaoRotulo', rotulo: 'Situação' }, { chave: 'observacao', rotulo: 'Observação' }];
    rel.linhas = ficha.historico.slice().reverse();
    rel.resumo = [
      { rotulo: 'Registros', valor: ficha.resumo.registros }, { rotulo: 'Presenças', valor: ficha.resumo.presencas },
      { rotulo: 'Atrasos', valor: ficha.resumo.atrasos }, { rotulo: 'Ausências', valor: ficha.resumo.ausencias },
      { rotulo: 'Faltas justificadas', valor: ficha.resumo.justificadas },
      { rotulo: 'Frequência', valor: ficha.resumo.frequencia === null ? '—' : ficha.resumo.frequencia.toFixed(1).replace('.', ',') + '%' }
    ];
  } else {
    var lista = estatisticaPorEstudante_(turma.ID, dados.registros, regras, per.fim);
    rel.colunas = COLUNAS_ESTUDANTE_;
    if (tipo === 'GERAL') {
      rel.linhas = lista;
      rel.resumo = resumoGeral.concat([{ rotulo: 'Estudantes', valor: lista.length }]);
    } else if (tipo === 'MAIS_FALTAS') {
      var n = Math.min(Math.max(Number(p.limiteLinhas) || 10, 1), 200);
      rel.linhas = lista.filter(function (e) { return e.faltas > 0 || e.justificadas > 0; })
        .sort(function (a, b) { return b.faltas - a.faltas || b.justificadas - a.justificadas || ordenarPorNumero_(a, b); }).slice(0, n);
      rel.colunas = COLUNAS_ESTUDANTE_.slice(0, 2).concat([{ chave: 'faltas', rotulo: 'Faltas (contadas)', tipo: 'num' }], COLUNAS_ESTUDANTE_.slice(2));
      rel.resumo = [{ rotulo: 'Estudantes listados', valor: rel.linhas.length }];
    } else {
      rel.titulo = 'Estudantes abaixo de ' + String(regras.limite).replace('.', ',') + '% de frequência';
      rel.linhas = lista.filter(function (e) { return e.frequencia !== null && e.frequencia < regras.limite; })
        .sort(function (a, b) { return a.frequencia - b.frequencia; });
      rel.resumo = [{ rotulo: 'Estudantes abaixo do limite', valor: rel.linhas.length }, { rotulo: 'Limite', valor: regras.limite + '%' }];
    }
  }
  if (!dados.chamadas.length) rel.aviso = 'Não há chamadas ' + (regras.contarRascunhos ? '' : 'finalizadas ') + 'no período selecionado.';
  return rel;
}

/** API: gera relatório para exibição na tela. */
function apiRelatorio(p) {
  return executar_('apiRelatorio', function () {
    return montarRelatorio_(exigirUsuario_(), p);
  });
}

// ------------------------------------------------------------------ Ficha individual

function fichaEstudante_(u, estudanteId, inicio, fim, turmaIdRelatorio) {
  var e = indexarPor_(lerTabela_('ESTUDANTES'), 'ID')[estudanteId];
  if (!e) throw appError_('NAO_ENCONTRADO', 'Estudante não encontrado.');
  var acessoAtual = podeAcessarTurma_(u, e.TURMA_ID);
  var acessoAnterior = e.TURMA_ANTERIOR_ID && podeAcessarTurma_(u, e.TURMA_ANTERIOR_ID);
  if (!acessoAtual && !acessoAnterior) throw appError_('SEM_PERMISSAO', 'Você não tem acesso a este estudante.');
  var cfg = config_();
  var regras = regrasCalculo_(cfg);
  var turmasPorId = indexarPor_(lerTabela_('TURMAS'), 'ID');
  var ini = inicio ? validarData_(inicio, 'Data inicial') : '';
  var f = fim ? validarData_(fim, 'Data final') : hoje_();
  var chamadasValidas = {};
  lerTabela_('CHAMADAS').forEach(function (c) {
    if ((c.STATUS === STATUS_CHAMADA.FINALIZADA || regras.contarRascunhos) && podeAcessarTurma_(u, c.TURMA_ID) &&
      (!turmaIdRelatorio || c.TURMA_ID === turmaIdRelatorio)) chamadasValidas[c.ID] = c;
  });
  var acc = { P: 0, A: 0, T: 0, J: 0 };
  var historico = lerLinhasPorValor_('FREQUENCIAS', 'ESTUDANTE_ID', e.ID).filter(function (r) {
    return chamadasValidas[r.CHAMADA_ID] && r.SITUACAO !== SITUACAO.NAO_REGISTRADO && (!ini || r.DATA >= ini) && r.DATA <= f;
  }).map(function (r) {
    somarSituacao_(acc, r.SITUACAO);
    return { data: r.DATA, dataBr: dataBr_(r.DATA), periodo: r.PERIODO === PERIODO_UNICO ? 'Diária' : r.PERIODO, situacao: r.SITUACAO,
      situacaoRotulo: ROTULO_SITUACAO[r.SITUACAO], observacao: r.OBSERVACAO, turma: turmasPorId[r.TURMA_ID] ? turmasPorId[r.TURMA_ID].NOME : '', chamadaId: r.CHAMADA_ID };
  }).sort(function (a, b) { return a.data.localeCompare(b.data) || String(a.periodo).localeCompare(String(b.periodo)); });
  var ind = calcularIndice_(acc, regras);
  var porMes = {};
  historico.forEach(function (h) {
    var k = h.data.slice(0, 7);
    porMes[k] = porMes[k] || { P: 0, A: 0, T: 0, J: 0 };
    somarSituacao_(porMes[k], h.situacao);
  });
  return {
    estudante: estudanteParaCliente_(e, turmasPorId),
    periodo: { inicio: ini, fim: f },
    resumo: { registros: ind.registros, presencas: ind.P, ausencias: ind.A, atrasos: ind.T, justificadas: ind.J, faltas: ind.faltas, frequencia: ind.frequencia },
    porMes: Object.keys(porMes).sort().map(function (k) { var i = calcularIndice_(porMes[k], regras); return { mes: nomeMes_(k), frequencia: i.frequencia, P: i.P, A: i.A, T: i.T, J: i.J }; }),
    historico: historico,
    limite: regras.limite
  };
}

/** API: ficha individual do estudante. p = { estudanteId, inicio, fim } */
function apiFichaEstudante(p) {
  return executar_('apiFichaEstudante', function () {
    p = p || {};
    return fichaEstudante_(exigirUsuario_(), p.estudanteId, p.inicio, p.fim, null);
  });
}
