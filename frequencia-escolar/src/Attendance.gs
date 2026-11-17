/**
 * Attendance.gs — Chamada: carregar, salvar (rascunho), finalizar, reabrir, corrigir e histórico.
 *
 * Garantias de confiabilidade:
 *  - Toda gravação ocorre sob LockService (comLock_).
 *  - Controle de versão (VERSAO): se outra pessoa alterou a chamada depois que ela foi
 *    aberta, a gravação é recusada (CONFLITO) em vez de sobrescrever silenciosamente.
 *  - Idempotência: cada envio tem um requestId; se o mesmo envio chegar duas vezes
 *    (ex.: nova tentativa após queda de conexão), não há duplicação.
 *  - Uma chamada por turma + data + período (chave única).
 *  - Finalização só com todos os estudantes registrados.
 */

var STATUS_CHAMADA = { RASCUNHO: 'RASCUNHO', FINALIZADA: 'FINALIZADA' };
var PERIODO_UNICO = 'DIARIO';

/** Lista de períodos configurados; sem configuração, uma chamada por dia. */
function periodosConfigurados_(cfg) {
  var lista = String(cfg.PERIODOS || '').split(';').map(function (s) { return texto_(s, 40); }).filter(String);
  return lista.length ? lista : [PERIODO_UNICO];
}

function validarPeriodo_(periodo, cfg, permitirExistente) {
  var p = texto_(periodo || PERIODO_UNICO, 40);
  if (periodosConfigurados_(cfg).indexOf(p) < 0 && !permitirExistente) {
    throw appError_('DADOS_INVALIDOS', 'Período/aula inválido: ' + p);
  }
  return p;
}

/**
 * Estudantes que devem constar na chamada de uma turma numa data:
 *  - matriculados na turma na data (entrada <= data e sem saída até a data), ou
 *  - transferidos DEPOIS da data (constam na turma de origem para datas anteriores).
 */
function estudantesElegiveis_(turmaId, data, estudantes) {
  var r = [];
  for (var i = 0; i < estudantes.length; i++) {
    var e = estudantes[i];
    var ativoNaData = (!e.DATA_SAIDA || e.DATA_SAIDA > data) && (e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO || e.DATA_SAIDA);
    if (e.TURMA_ID === turmaId && e.DATA_ENTRADA <= data && ativoNaData) {
      r.push({ id: e.ID, numero: e.NUMERO, nome: e.NOME });
    } else if (e.TURMA_ANTERIOR_ID === turmaId && e.DATA_TRANSFERENCIA > data) {
      r.push({ id: e.ID, numero: e.NUMERO_ANTERIOR, nome: e.NOME });
    }
  }
  return r;
}

function buscarChamada_(chamadas, turmaId, data, periodo) {
  for (var i = 0; i < chamadas.length; i++) {
    var c = chamadas[i];
    if (c.TURMA_ID === turmaId && c.DATA === data && c.PERIODO === periodo) return c;
  }
  return null;
}

function chamadaParaCliente_(c) {
  if (!c) return null;
  return {
    id: c.ID, turmaId: c.TURMA_ID, data: c.DATA, periodo: c.PERIODO, status: c.STATUS, versao: Number(c.VERSAO) || 0,
    professorEmail: c.PROFESSOR_EMAIL, professorNome: c.PROFESSOR_NOME,
    total: c.TOTAL, presentes: c.PRESENTES, ausentes: c.AUSENTES, atrasados: c.ATRASADOS,
    justificados: c.JUSTIFICADOS, naoRegistrados: c.NAO_REGISTRADOS,
    criadoEm: c.CRIADO_EM, atualizadoEm: c.ATUALIZADO_EM, atualizadoPor: c.ATUALIZADO_POR,
    finalizadoEm: c.FINALIZADO_EM, finalizadoPor: c.FINALIZADO_POR
  };
}

/** Monta a lista de estudantes da chamada (elegíveis + quem já tem registro), em ordem numérica. */
function montarListaChamada_(turmaId, data, registros) {
  var estudantes = lerTabela_('ESTUDANTES');
  var porId = indexarPor_(estudantes, 'ID');
  var elegiveis = estudantesElegiveis_(turmaId, data, estudantes);
  var regPorEst = indexarPor_(registros, 'ESTUDANTE_ID');
  var vistos = {};
  var lista = elegiveis.map(function (e) {
    vistos[e.id] = 1;
    var r = regPorEst[e.id];
    return { id: e.id, numero: e.numero, nome: e.nome, situacao: r ? r.SITUACAO : SITUACAO.NAO_REGISTRADO, observacao: r ? r.OBSERVACAO : '', inativo: false };
  });
  registros.forEach(function (r) {
    if (vistos[r.ESTUDANTE_ID]) return;
    var e = porId[r.ESTUDANTE_ID];
    lista.push({ id: r.ESTUDANTE_ID, numero: r.NUMERO, nome: e ? e.NOME : r.NOME_ESTUDANTE, situacao: r.SITUACAO, observacao: r.OBSERVACAO, inativo: true });
  });
  return lista.sort(ordenarPorNumero_);
}

function contarSituacoes_(lista, campo) {
  var c = { TOTAL: lista.length, PRESENTES: 0, AUSENTES: 0, ATRASADOS: 0, JUSTIFICADOS: 0, NAO_REGISTRADOS: 0 };
  lista.forEach(function (x) {
    var s = x[campo];
    if (s === SITUACAO.PRESENTE) c.PRESENTES++;
    else if (s === SITUACAO.AUSENTE) c.AUSENTES++;
    else if (s === SITUACAO.ATRASADO) c.ATRASADOS++;
    else if (s === SITUACAO.JUSTIFICADA) c.JUSTIFICADOS++;
    else c.NAO_REGISTRADOS++;
  });
  return c;
}

/** Estado completo de uma chamada (para a tela de chamada e para o histórico). */
function estadoChamada_(u, turma, data, periodo, cfg, chamada) {
  var registros = chamada ? lerLinhasPorValor_('FREQUENCIAS', 'CHAMADA_ID', chamada.ID) : [];
  var perm = permissoesChamada_(u, turma, data, cfg);
  return {
    turma: { id: turma.ID, nome: turma.NOME },
    data: data,
    periodo: periodo,
    chamada: chamadaParaCliente_(chamada),
    estudantes: montarListaChamada_(turma.ID, data, registros),
    permissoes: perm
  };
}

/** API: abre a chamada de uma turma numa data/período (existente ou nova). */
function apiCarregarChamada(p) {
  return executar_('apiCarregarChamada', function () {
    var u = exigirUsuario_();
    p = p || {};
    var cfg = config_();
    var turma = exigirTurma_(u, p.turmaId);
    var data = validarData_(p.data, 'Data');
    var chamadas = lerTabela_('CHAMADAS');
    var periodo = validarPeriodo_(p.periodo, cfg, !!buscarChamada_(chamadas, turma.ID, data, texto_(p.periodo || PERIODO_UNICO, 40)));
    return estadoChamada_(u, turma, data, periodo, cfg, buscarChamada_(chamadas, turma.ID, data, periodo));
  });
}

/** API: abre uma chamada pelo ID (histórico). */
function apiDetalheChamada(chamadaId) {
  return executar_('apiDetalheChamada', function () {
    var u = exigirUsuario_();
    var c = indexarPor_(lerTabela_('CHAMADAS'), 'ID')[chamadaId];
    if (!c) throw appError_('NAO_ENCONTRADO', 'Chamada não encontrada.');
    var turma = exigirTurma_(u, c.TURMA_ID);
    var estado = estadoChamada_(u, turma, c.DATA, c.PERIODO, config_(), c);
    estado.auditoria = lerLinhasPorValor_('AUDITORIA', 'REGISTRO_ID', c.ID).map(semLinha_).reverse();
    return estado;
  });
}

/**
 * API: salva a chamada (rascunho) e, opcionalmente, finaliza.
 * p = { turmaId, data, periodo, chamadaId, versao, requestId, finalizar,
 *       registros: [{ estudanteId, situacao, observacao }] }
 */
function apiSalvarChamada(p) {
  return executar_('apiSalvarChamada', function () {
    var u = exigirUsuario_();
    p = p || {};
    var data = validarData_(p.data, 'Data');
    var requestId = texto_(p.requestId, 60);
    if (!Array.isArray(p.registros)) throw appError_('DADOS_INVALIDOS', 'Nenhum registro enviado.');
    if (p.registros.length > 500) throw appError_('DADOS_INVALIDOS', 'Quantidade de registros acima do limite.');

    // Validação dos dados recebidos ANTES de bloquear a planilha.
    var recebidos = {};
    p.registros.forEach(function (r) {
      var id = String(r && r.estudanteId || '');
      var s = String(r && r.situacao || '');
      if (!id) throw appError_('DADOS_INVALIDOS', 'Registro sem identificação do estudante.');
      if (SITUACOES_VALIDAS.indexOf(s) < 0) throw appError_('DADOS_INVALIDOS', 'Situação inválida: ' + s);
      recebidos[id] = { situacao: s, observacao: s === SITUACAO.JUSTIFICADA || s === SITUACAO.ATRASADO ? texto_(r.observacao, 200) : '' };
    });

    return comLock_(function () {
      var cfg = config_();
      var turma = exigirTurma_(u, p.turmaId);
      var chamadas = lerTabela_('CHAMADAS', { fresco: true });
      var periodoTxt = texto_(p.periodo || PERIODO_UNICO, 40);
      var existente = buscarChamada_(chamadas, turma.ID, data, periodoTxt);
      var periodo = validarPeriodo_(periodoTxt, cfg, !!existente);
      var perm = permissoesChamada_(u, turma, data, cfg);
      if (!perm.editar) throw appError_('SEM_PERMISSAO', perm.motivo);

      // Envio repetido (nova tentativa automática): devolve o estado atual sem regravar.
      if (existente && requestId && existente.ULTIMA_OPERACAO === requestId) {
        var est = estadoChamada_(u, turma, data, periodo, cfg, existente);
        est.repetido = true;
        return est;
      }
      var versaoCliente = Number(p.versao) || 0;
      if (existente) {
        if ((p.chamadaId && p.chamadaId !== existente.ID) || versaoCliente !== Number(existente.VERSAO)) {
          throw appError_('CONFLITO', 'Esta chamada foi alterada por ' + (existente.ATUALIZADO_POR || 'outro usuário') +
            ' às ' + dataHoraBr_(existente.ATUALIZADO_EM) + ' enquanto você a editava. Recarregue para ver a versão atual.',
            estadoChamada_(u, turma, data, periodo, cfg, existente));
        }
        if (existente.STATUS === STATUS_CHAMADA.FINALIZADA) {
          throw appError_('FINALIZADA', 'Esta chamada já está finalizada. Para alterar, utilize "Reabrir para correção".');
        }
      } else if (p.chamadaId || versaoCliente > 0) {
        throw appError_('CONFLITO', 'A chamada que você editava não foi encontrada no servidor. Recarregue a página.');
      }

      var registrosAtuais = existente ? lerLinhasPorValor_('FREQUENCIAS', 'CHAMADA_ID', existente.ID) : [];
      var lista = montarListaChamada_(turma.ID, data, registrosAtuais);
      var naLista = indexarPor_(lista, 'id');
      Object.keys(recebidos).forEach(function (id) {
        if (!naLista[id]) throw appError_('DADOS_INVALIDOS', 'Um dos estudantes enviados não pertence a esta turma nesta data. Recarregue a chamada.');
      });

      // Situação final de cada estudante (enviado pelo professor ou mantido).
      lista.forEach(function (e) {
        e.anterior = e.situacao;
        e.observacaoAnterior = e.observacao;
        if (recebidos[e.id]) { e.situacao = recebidos[e.id].situacao; e.observacao = recebidos[e.id].observacao; }
      });
      var cont = contarSituacoes_(lista, 'situacao');
      if (p.finalizar && cont.NAO_REGISTRADOS > 0) {
        throw appError_('PENDENTES', 'Não é possível finalizar: ' + cont.NAO_REGISTRADOS + ' estudante(s) sem situação registrada. A chamada pode ser salva como rascunho.');
      }

      var momento = agora_();
      var chamada = existente;
      var auditoria = [];
      if (!chamada) {
        chamada = {
          ID: gerarId_('CHA'), TURMA_ID: turma.ID, DATA: data, PERIODO: periodo, STATUS: STATUS_CHAMADA.RASCUNHO, VERSAO: 0,
          PROFESSOR_EMAIL: u.email, PROFESSOR_NOME: u.nome, CRIADO_EM: momento, CRIADO_POR: u.email,
          FINALIZADO_EM: '', FINALIZADO_POR: ''
        };
        auditoria.push(novaAuditoria_(u.email, { acao: 'CRIACAO_CHAMADA', entidade: 'CHAMADAS', registroId: chamada.ID, turma: turma.ID,
          novo: STATUS_CHAMADA.RASCUNHO, detalhes: 'Data ' + dataBr_(data) + ' — ' + periodo }));
      }

      // Registros de frequência: atualiza os existentes alterados e insere os novos.
      var regPorEst = indexarPor_(registrosAtuais, 'ESTUDANTE_ID');
      var atualizar = [], inserir = [];
      lista.forEach(function (e) {
        var r = regPorEst[e.id];
        if (r) {
          if (r.SITUACAO !== e.situacao || String(r.OBSERVACAO) !== String(e.observacao)) {
            if (r.SITUACAO !== e.situacao && r.SITUACAO !== SITUACAO.NAO_REGISTRADO) {
              auditoria.push(novaAuditoria_(u.email, { acao: 'ALTERACAO_SITUACAO', entidade: 'FREQUENCIAS', registroId: r.ID,
                estudante: e.nome, turma: turma.ID, anterior: r.SITUACAO, novo: e.situacao,
                detalhes: 'Chamada ' + chamada.ID + ' — ' + dataBr_(data) + ' — ' + periodo }));
            }
            r.SITUACAO = e.situacao; r.OBSERVACAO = e.observacao; r.NUMERO = e.numero; r.NOME_ESTUDANTE = e.nome;
            r.ATUALIZADO_EM = momento; r.ATUALIZADO_POR = u.email;
            atualizar.push(r);
          }
        } else {
          inserir.push({
            ID: gerarId_('FRE'), CHAMADA_ID: chamada.ID, TURMA_ID: turma.ID, DATA: data, PERIODO: periodo,
            ESTUDANTE_ID: e.id, NUMERO: e.numero, NOME_ESTUDANTE: e.nome, SITUACAO: e.situacao, OBSERVACAO: e.observacao,
            ATUALIZADO_EM: momento, ATUALIZADO_POR: u.email
          });
        }
      });

      chamada.TOTAL = cont.TOTAL; chamada.PRESENTES = cont.PRESENTES; chamada.AUSENTES = cont.AUSENTES;
      chamada.ATRASADOS = cont.ATRASADOS; chamada.JUSTIFICADOS = cont.JUSTIFICADOS; chamada.NAO_REGISTRADOS = cont.NAO_REGISTRADOS;
      chamada.VERSAO = (Number(chamada.VERSAO) || 0) + 1;
      chamada.ATUALIZADO_EM = momento; chamada.ATUALIZADO_POR = u.email;
      chamada.ULTIMA_OPERACAO = requestId;
      if (p.finalizar) {
        chamada.STATUS = STATUS_CHAMADA.FINALIZADA;
        chamada.FINALIZADO_EM = momento; chamada.FINALIZADO_POR = u.email;
        auditoria.push(novaAuditoria_(u.email, { acao: 'FINALIZACAO_CHAMADA', entidade: 'CHAMADAS', registroId: chamada.ID, turma: turma.ID,
          anterior: STATUS_CHAMADA.RASCUNHO, novo: STATUS_CHAMADA.FINALIZADA,
          detalhes: 'P ' + cont.PRESENTES + ' | A ' + cont.AUSENTES + ' | AT ' + cont.ATRASADOS + ' | J ' + cont.JUSTIFICADOS }));
      }

      // Gravação em lote (ordem: frequências, chamada, auditoria).
      atualizarRegistros_('FREQUENCIAS', atualizar);
      inserirRegistros_('FREQUENCIAS', inserir);
      if (existente) atualizarRegistros_('CHAMADAS', [chamada]);
      else inserirRegistros_('CHAMADAS', [chamada]);
      registrarAuditoria_(auditoria);

      var registrosFinais = registrosAtuais.concat(inserir);
      return {
        turma: { id: turma.ID, nome: turma.NOME }, data: data, periodo: periodo,
        chamada: chamadaParaCliente_(chamada),
        estudantes: montarListaChamada_(turma.ID, data, registrosFinais),
        permissoes: perm
      };
    });
  });
}

/** API: reabre uma chamada finalizada para correção (motivo obrigatório). */
function apiReabrirChamada(p) {
  return executar_('apiReabrirChamada', function () {
    var u = exigirUsuario_();
    p = p || {};
    var motivo = texto_(p.motivo, 500);
    if (motivo.length < 5) throw appError_('DADOS_INVALIDOS', 'Informe o motivo da reabertura (mínimo de 5 caracteres).');
    return comLock_(function () {
      var cfg = config_();
      var chamadas = lerTabela_('CHAMADAS', { fresco: true });
      var c = indexarPor_(chamadas, 'ID')[p.chamadaId];
      if (!c) throw appError_('NAO_ENCONTRADO', 'Chamada não encontrada.');
      var turma = exigirTurma_(u, c.TURMA_ID);
      var perm = permissoesChamada_(u, turma, c.DATA, cfg);
      if (!perm.editar || !perm.reabrir) throw appError_('SEM_PERMISSAO', perm.motivo || 'Você não tem permissão para reabrir chamadas. Solicite à equipe gestora.');
      if (Number(p.versao) !== Number(c.VERSAO)) throw appError_('CONFLITO', 'A chamada foi alterada por outro usuário. Recarregue a página.');
      if (c.STATUS !== STATUS_CHAMADA.FINALIZADA) throw appError_('DADOS_INVALIDOS', 'A chamada já está aberta para edição.');
      c.STATUS = STATUS_CHAMADA.RASCUNHO;
      c.VERSAO = Number(c.VERSAO) + 1;
      c.ATUALIZADO_EM = agora_(); c.ATUALIZADO_POR = u.email;
      c.ULTIMA_OPERACAO = texto_(p.requestId, 60);
      atualizarRegistros_('CHAMADAS', [c]);
      auditar_(u.email, { acao: 'REABERTURA_CHAMADA', entidade: 'CHAMADAS', registroId: c.ID, turma: turma.ID,
        anterior: STATUS_CHAMADA.FINALIZADA, novo: STATUS_CHAMADA.RASCUNHO, motivo: motivo, detalhes: 'Data ' + dataBr_(c.DATA) + ' — ' + c.PERIODO });
      return estadoChamada_(u, turma, c.DATA, c.PERIODO, cfg, c);
    });
  });
}

/**
 * API: corrige a situação de UM estudante numa chamada (inclusive finalizada),
 * registrando situação anterior, nova, usuário e motivo na auditoria.
 */
function apiCorrigirRegistro(p) {
  return executar_('apiCorrigirRegistro', function () {
    var u = exigirUsuario_();
    p = p || {};
    var situacao = String(p.situacao || '');
    if (SITUACOES_VALIDAS.indexOf(situacao) < 0 || situacao === SITUACAO.NAO_REGISTRADO) throw appError_('DADOS_INVALIDOS', 'Situação inválida.');
    var motivo = texto_(p.motivo, 500);
    var observacao = situacao === SITUACAO.JUSTIFICADA || situacao === SITUACAO.ATRASADO ? texto_(p.observacao, 200) : '';
    return comLock_(function () {
      var cfg = config_();
      var c = indexarPor_(lerTabela_('CHAMADAS', { fresco: true }), 'ID')[p.chamadaId];
      if (!c) throw appError_('NAO_ENCONTRADO', 'Chamada não encontrada.');
      var turma = exigirTurma_(u, c.TURMA_ID);
      var perm = permissoesChamada_(u, turma, c.DATA, cfg);
      var finalizada = c.STATUS === STATUS_CHAMADA.FINALIZADA;
      if (!perm.editar || (finalizada && !perm.reabrir)) throw appError_('SEM_PERMISSAO', perm.motivo || 'Você não tem permissão para corrigir chamadas finalizadas.');
      if (Number(p.versao) !== Number(c.VERSAO)) throw appError_('CONFLITO', 'A chamada foi alterada por outro usuário. Recarregue para ver a versão atual.');
      if (finalizada && motivo.length < 5) throw appError_('DADOS_INVALIDOS', 'Informe o motivo da correção (mínimo de 5 caracteres).');

      var registros = lerLinhasPorValor_('FREQUENCIAS', 'CHAMADA_ID', c.ID);
      var r = indexarPor_(registros, 'ESTUDANTE_ID')[p.estudanteId];
      var momento = agora_();
      var anterior = r ? r.SITUACAO : SITUACAO.NAO_REGISTRADO;
      if (r && r.SITUACAO === situacao && String(r.OBSERVACAO) === observacao) return estadoChamada_(u, turma, c.DATA, c.PERIODO, cfg, c);
      var novoRegistro = !r;
      if (novoRegistro) {
        var elegivel = indexarPor_(estudantesElegiveis_(turma.ID, c.DATA, lerTabela_('ESTUDANTES')), 'id')[p.estudanteId];
        if (!elegivel) throw appError_('DADOS_INVALIDOS', 'Estudante não pertence a esta chamada.');
        r = { ID: gerarId_('FRE'), CHAMADA_ID: c.ID, TURMA_ID: turma.ID, DATA: c.DATA, PERIODO: c.PERIODO, ESTUDANTE_ID: elegivel.id,
          NUMERO: elegivel.numero, NOME_ESTUDANTE: elegivel.nome };
        registros.push(r);
      }
      r.SITUACAO = situacao; r.OBSERVACAO = observacao; r.ATUALIZADO_EM = momento; r.ATUALIZADO_POR = u.email;
      // Contagem calculada ANTES de gravar: nada é gravado se a validação falhar.
      var cont = contarSituacoes_(montarListaChamada_(turma.ID, c.DATA, registros), 'situacao');
      if (finalizada && cont.NAO_REGISTRADOS > 0) {
        throw appError_('PENDENTES', 'Há estudantes sem registro nesta chamada finalizada (ex.: estudante cadastrado depois). Use "Reabrir para correção" e registre todos.');
      }
      if (novoRegistro) inserirRegistros_('FREQUENCIAS', [r]);
      else atualizarRegistros_('FREQUENCIAS', [r]);
      var est = r;
      c.TOTAL = cont.TOTAL; c.PRESENTES = cont.PRESENTES; c.AUSENTES = cont.AUSENTES; c.ATRASADOS = cont.ATRASADOS;
      c.JUSTIFICADOS = cont.JUSTIFICADOS; c.NAO_REGISTRADOS = cont.NAO_REGISTRADOS;
      c.VERSAO = Number(c.VERSAO) + 1; c.ATUALIZADO_EM = momento; c.ATUALIZADO_POR = u.email;
      c.ULTIMA_OPERACAO = texto_(p.requestId, 60);
      atualizarRegistros_('CHAMADAS', [c]);
      auditar_(u.email, { acao: 'CORRECAO_REGISTRO', entidade: 'FREQUENCIAS', registroId: est.ID, estudante: est.NOME_ESTUDANTE, turma: turma.ID,
        anterior: anterior, novo: situacao, motivo: motivo, detalhes: 'Chamada ' + c.ID + ' — ' + dataBr_(c.DATA) + ' — ' + c.PERIODO + (finalizada ? ' (finalizada)' : '') });
      return estadoChamada_(u, turma, c.DATA, c.PERIODO, cfg, c);
    });
  });
}

/**
 * API: histórico. Sem estudante/situação: lista de chamadas. Com estudante e/ou situação:
 * lista de registros individuais. Paginado.
 * f = { turmaId, inicio, fim, status, estudanteId, situacao, pagina, porPagina }
 */
function apiListarHistorico(f) {
  return executar_('apiListarHistorico', function () {
    var u = exigirUsuario_();
    f = f || {};
    var turma = exigirTurma_(u, f.turmaId);
    var ini = f.inicio ? validarData_(f.inicio, 'Data inicial') : '';
    var fim = f.fim ? validarData_(f.fim, 'Data final') : '';
    if (ini && fim && ini > fim) throw appError_('DADOS_INVALIDOS', 'A data inicial é posterior à data final.');
    var porPagina = Math.min(Math.max(Number(f.porPagina) || 30, 10), 200);
    var pagina = Math.max(Number(f.pagina) || 1, 1);
    var cfg = config_();
    var regras = regrasCalculo_(cfg);
    var chamadas = lerTabela_('CHAMADAS').filter(function (c) {
      return c.TURMA_ID === turma.ID && (!ini || c.DATA >= ini) && (!fim || c.DATA <= fim) && (!f.status || c.STATUS === f.status);
    });
    var modoRegistros = !!(f.estudanteId || f.situacao);
    var itens;
    if (modoRegistros) {
      var idsChamadas = {};
      chamadas.forEach(function (c) { idsChamadas[c.ID] = c; });
      itens = lerTabela_('FREQUENCIAS').filter(function (r) {
        return idsChamadas[r.CHAMADA_ID] && (!f.estudanteId || r.ESTUDANTE_ID === f.estudanteId) && (!f.situacao || r.SITUACAO === f.situacao);
      }).map(function (r) {
        var c = idsChamadas[r.CHAMADA_ID];
        return { registroId: r.ID, chamadaId: r.CHAMADA_ID, data: r.DATA, periodo: r.PERIODO, estudanteId: r.ESTUDANTE_ID, numero: r.NUMERO,
          nome: r.NOME_ESTUDANTE, situacao: r.SITUACAO, observacao: r.OBSERVACAO, statusChamada: c.STATUS, atualizadoEm: r.ATUALIZADO_EM, atualizadoPor: r.ATUALIZADO_POR };
      });
      itens.sort(function (a, b) { return b.data.localeCompare(a.data) || String(a.periodo).localeCompare(String(b.periodo)) || a.numero - b.numero; });
    } else {
      itens = chamadas.map(function (c) {
        var o = chamadaParaCliente_(c);
        var calc = calcularIndice_({ P: c.PRESENTES, A: c.AUSENTES, T: c.ATRASADOS, J: c.JUSTIFICADOS }, regras);
        o.frequencia = calc.frequencia;
        return o;
      });
      itens.sort(function (a, b) { return b.data.localeCompare(a.data) || String(a.periodo).localeCompare(String(b.periodo)); });
    }
    return {
      modo: modoRegistros ? 'REGISTROS' : 'CHAMADAS',
      itens: itens.slice((pagina - 1) * porPagina, pagina * porPagina),
      total: itens.length, pagina: pagina, paginas: Math.max(1, Math.ceil(itens.length / porPagina))
    };
  });
}

/**
 * API: situação das chamadas de um dia em TODAS as turmas ativas do usuário
 * (painel "Chamadas de hoje" e botão "Próxima turma").
 * Lê só a aba CHAMADAS (pequena) e o cadastro de estudantes (em cache).
 */
function apiResumoDia(data) {
  return executar_('apiResumoDia', function () {
    var u = exigirUsuario_();
    var dia = data ? validarData_(data, 'Data') : hoje_();
    var cfg = config_();
    var periodos = periodosConfigurados_(cfg);
    var estudantes = lerTabela_('ESTUDANTES');
    var doDia = lerTabela_('CHAMADAS').filter(function (c) { return c.DATA === dia; });
    var turmas = turmasDoUsuario_(u, false).map(function (t) {
      var chamadas = doDia.filter(function (c) { return c.TURMA_ID === t.ID; });
      var finalizadas = chamadas.filter(function (c) { return c.STATUS === STATUS_CHAMADA.FINALIZADA; });
      var status = !chamadas.length ? 'PENDENTE' : finalizadas.length >= periodos.length ? 'FINALIZADA' : 'EM_ANDAMENTO';
      var soma = { PRESENTES: 0, AUSENTES: 0, ATRASADOS: 0, JUSTIFICADOS: 0, NAO_REGISTRADOS: 0 };
      chamadas.forEach(function (c) { Object.keys(soma).forEach(function (k) { soma[k] += Number(c[k]) || 0; }); });
      var perm = permissoesChamada_(u, t, dia, cfg);
      return {
        id: t.ID, nome: t.NOME, status: status, estudantes: estudantesElegiveis_(t.ID, dia, estudantes).length,
        presentes: soma.PRESENTES, ausentes: soma.AUSENTES, atrasados: soma.ATRASADOS, justificados: soma.JUSTIFICADOS,
        naoRegistrados: soma.NAO_REGISTRADOS, podeRegistrar: perm.editar, motivo: perm.motivo
      };
    });
    return {
      data: dia, turmas: turmas,
      finalizadas: turmas.filter(function (t) { return t.status === 'FINALIZADA'; }).length,
      total: turmas.length
    };
  });
}
