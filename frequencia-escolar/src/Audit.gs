/**
 * Audit.gs — Registro de auditoria (aba AUDITORIA).
 *
 * A auditoria é somente de inclusão: o sistema não oferece nenhuma função que
 * altere ou apague registros desta aba.
 */

/**
 * Monta um registro de auditoria. Os registros são gravados em lote por registrarAuditoria_.
 * campos: { acao, entidade, registroId, estudante, turma, anterior, novo, motivo, detalhes }
 */
function novaAuditoria_(usuarioEmail, campos) {
  return {
    ID: gerarId_('AUD'),
    DATA_HORA: agora_(),
    USUARIO: usuarioEmail || '(desconhecido)',
    ACAO: campos.acao || '',
    ENTIDADE: campos.entidade || '',
    REGISTRO_ID: campos.registroId || '',
    ESTUDANTE: campos.estudante || '',
    TURMA: campos.turma || '',
    VALOR_ANTERIOR: campos.anterior === undefined ? '' : String(campos.anterior),
    VALOR_NOVO: campos.novo === undefined ? '' : String(campos.novo),
    MOTIVO: texto_(campos.motivo || '', 500),
    DETALHES: texto_(campos.detalhes || '', 1000)
  };
}

/** Grava vários registros de auditoria com um único setValues. Deve rodar dentro de comLock_. */
function registrarAuditoria_(registros) {
  if (registros && registros.length) inserirRegistros_('AUDITORIA', registros);
}

/** Atalho para um único evento (já dentro de comLock_). */
function auditar_(usuarioEmail, campos) {
  registrarAuditoria_([novaAuditoria_(usuarioEmail, campos)]);
}

/**
 * API: consulta a auditoria com filtros e paginação.
 * filtros: { registroId, turmaId, acao, inicio, fim, pagina, porPagina }
 * Professores só veem eventos das próprias turmas.
 */
function apiListarAuditoria(filtros) {
  return executar_('apiListarAuditoria', function () {
    var u = exigirUsuario_();
    filtros = filtros || {};
    var lista = lerTabela_('AUDITORIA');
    var turmasPermitidas = {};
    turmasDoUsuario_(u, true).forEach(function (t) { turmasPermitidas[t.ID] = 1; });
    var ini = filtros.inicio ? validarData_(filtros.inicio, 'Data inicial') : '';
    var fim = filtros.fim ? validarData_(filtros.fim, 'Data final') : '';
    var filtrados = lista.filter(function (a) {
      if (filtros.registroId && a.REGISTRO_ID !== filtros.registroId && String(a.DETALHES).indexOf(filtros.registroId) < 0) return false;
      if (filtros.turmaId && a.TURMA !== filtros.turmaId) return false;
      if (filtros.acao && a.ACAO !== filtros.acao) return false;
      var dia = String(a.DATA_HORA).slice(0, 10);
      if (ini && dia < ini) return false;
      if (fim && dia > fim) return false;
      if (!ehGestao_(u) && !turmasPermitidas[a.TURMA]) return false;
      return true;
    });
    filtrados.reverse(); // mais recentes primeiro
    var porPagina = Math.min(Math.max(Number(filtros.porPagina) || 50, 10), 200);
    var pagina = Math.max(Number(filtros.pagina) || 1, 1);
    var nomesTurma = {};
    lerTabela_('TURMAS').forEach(function (t) { nomesTurma[t.ID] = t.NOME; });
    var itens = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina).map(function (a) {
      var o = semLinha_(a);
      o.TURMA_NOME = nomesTurma[a.TURMA] || '';
      return o;
    });
    return { itens: itens, total: filtrados.length, pagina: pagina, paginas: Math.max(1, Math.ceil(filtrados.length / porPagina)) };
  });
}
