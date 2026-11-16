/**
 * Students.gs — Cadastros: turmas, estudantes e professores.
 *
 * Regras:
 *  - Nada é excluído: estudantes e turmas são INATIVADOS; o histórico é preservado.
 *  - Cada estudante tem ID único (independente do número de chamada).
 *  - O número de chamada é único entre os estudantes ATIVOS da mesma turma.
 *  - Toda alteração gera registro na AUDITORIA.
 */

var SITUACAO_ESTUDANTE = { ATIVO: 'ATIVO', INATIVO: 'INATIVO' };

// ------------------------------------------------------------------ Conversões para o navegador

function turmaParaCliente_(t, estudantes) {
  var ativos = (estudantes || []).filter(function (e) { return e.TURMA_ID === t.ID && e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO; }).length;
  return {
    id: t.ID, nome: t.NOME, anoSerie: t.ANO_SERIE, turno: t.TURNO, anoLetivo: t.ANO_LETIVO,
    dataInicio: t.DATA_INICIO, ativa: ehSim_(t.ATIVA), estudantesAtivos: ativos
  };
}

function estudanteParaCliente_(e, turmasPorId) {
  return {
    id: e.ID, turmaId: e.TURMA_ID, turmaNome: turmasPorId && turmasPorId[e.TURMA_ID] ? turmasPorId[e.TURMA_ID].NOME : '',
    numero: e.NUMERO, nome: e.NOME, situacao: e.SITUACAO, dataEntrada: e.DATA_ENTRADA, dataSaida: e.DATA_SAIDA,
    turmaAnteriorId: e.TURMA_ANTERIOR_ID, dataTransferencia: e.DATA_TRANSFERENCIA, observacao: e.OBSERVACAO
  };
}

// ------------------------------------------------------------------ Turmas

function apiListarTurmas(incluirInativas) {
  return executar_('apiListarTurmas', function () {
    var u = exigirUsuario_();
    var estudantes = lerTabela_('ESTUDANTES');
    return turmasDoUsuario_(u, !!incluirInativas && ehGestao_(u)).map(function (t) { return turmaParaCliente_(t, estudantes); });
  });
}

/** Cria (sem id) ou edita (com id) uma turma. Somente ADMIN. */
function apiSalvarTurma(dados) {
  return executar_('apiSalvarTurma', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    dados = dados || {};
    var nome = texto_(dados.nome, 80);
    if (nome.length < 2) throw appError_('DADOS_INVALIDOS', 'Informe o nome da turma.');
    var dataInicio = validarData_(dados.dataInicio, 'Data de início');
    var anoSerie = texto_(dados.anoSerie, 40);
    var turno = texto_(dados.turno, 30);
    var anoLetivo = texto_(dados.anoLetivo || dataInicio.slice(0, 4), 10);
    return comLock_(function () {
      var turmas = lerTabela_('TURMAS', { fresco: true });
      var duplicada = turmas.filter(function (t) {
        return normalizarNome_(t.NOME) === normalizarNome_(nome) && String(t.ANO_LETIVO) === anoLetivo && t.ID !== dados.id;
      });
      if (duplicada.length) throw appError_('DUPLICADO', 'Já existe uma turma com este nome no ano letivo ' + anoLetivo + '.');
      if (dados.id) {
        var t = indexarPor_(turmas, 'ID')[dados.id];
        if (!t) throw appError_('NAO_ENCONTRADO', 'Turma não encontrada.');
        var antes = JSON.stringify({ nome: t.NOME, anoSerie: t.ANO_SERIE, turno: t.TURNO, anoLetivo: t.ANO_LETIVO, dataInicio: t.DATA_INICIO });
        t.NOME = nome; t.ANO_SERIE = anoSerie; t.TURNO = turno; t.ANO_LETIVO = anoLetivo; t.DATA_INICIO = dataInicio;
        t.ATUALIZADO_EM = agora_(); t.ATUALIZADO_POR = u.email;
        atualizarRegistros_('TURMAS', [t]);
        auditar_(u.email, { acao: 'EDICAO_TURMA', entidade: 'TURMAS', registroId: t.ID, turma: t.ID, anterior: antes,
          novo: JSON.stringify({ nome: nome, anoSerie: anoSerie, turno: turno, anoLetivo: anoLetivo, dataInicio: dataInicio }) });
        return turmaParaCliente_(t, lerTabela_('ESTUDANTES'));
      }
      var nova = {
        ID: gerarId_('TUR'), NOME: nome, ANO_SERIE: anoSerie, TURNO: turno, ANO_LETIVO: anoLetivo, DATA_INICIO: dataInicio,
        ATIVA: 'SIM', CRIADO_EM: agora_(), CRIADO_POR: u.email, ATUALIZADO_EM: agora_(), ATUALIZADO_POR: u.email
      };
      inserirRegistros_('TURMAS', [nova]);
      auditar_(u.email, { acao: 'CRIACAO_TURMA', entidade: 'TURMAS', registroId: nova.ID, turma: nova.ID, novo: nome });
      return turmaParaCliente_(nova, []);
    });
  });
}

/** Ativa ou inativa uma turma (nunca exclui). Somente ADMIN. */
function apiAlterarStatusTurma(turmaId, ativa, motivo) {
  return executar_('apiAlterarStatusTurma', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    return comLock_(function () {
      var t = indexarPor_(lerTabela_('TURMAS', { fresco: true }), 'ID')[turmaId];
      if (!t) throw appError_('NAO_ENCONTRADO', 'Turma não encontrada.');
      var novo = ativa ? 'SIM' : 'NAO';
      if (t.ATIVA === novo) return turmaParaCliente_(t, lerTabela_('ESTUDANTES'));
      var anterior = t.ATIVA;
      t.ATIVA = novo; t.ATUALIZADO_EM = agora_(); t.ATUALIZADO_POR = u.email;
      atualizarRegistros_('TURMAS', [t]);
      auditar_(u.email, { acao: ativa ? 'REATIVACAO_TURMA' : 'INATIVACAO_TURMA', entidade: 'TURMAS', registroId: t.ID, turma: t.ID,
        anterior: anterior, novo: novo, motivo: motivo });
      return turmaParaCliente_(t, lerTabela_('ESTUDANTES'));
    });
  });
}

// ------------------------------------------------------------------ Estudantes

function apiListarEstudantes(turmaId, incluirInativos) {
  return executar_('apiListarEstudantes', function () {
    var u = exigirUsuario_();
    exigirTurma_(u, turmaId);
    var turmasPorId = indexarPor_(lerTabela_('TURMAS'), 'ID');
    return lerTabela_('ESTUDANTES')
      .filter(function (e) { return e.TURMA_ID === turmaId && (incluirInativos || e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO); })
      .map(function (e) { return estudanteParaCliente_(e, turmasPorId); })
      .sort(ordenarPorNumero_);
  });
}

/** Verifica se o número de chamada já pertence a outro estudante ATIVO da turma. */
function numeroOcupado_(estudantes, turmaId, numero, exceto) {
  for (var i = 0; i < estudantes.length; i++) {
    var e = estudantes[i];
    if (e.TURMA_ID === turmaId && e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO && Number(e.NUMERO) === Number(numero) && e.ID !== exceto) return e;
  }
  return null;
}

function proximoNumero_(estudantes, turmaId) {
  var max = 0;
  estudantes.forEach(function (e) {
    if (e.TURMA_ID === turmaId && e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO) max = Math.max(max, Number(e.NUMERO) || 0);
  });
  return max + 1;
}

/** Cria (sem id) ou edita (com id) estudante. ADMIN e GESTOR. */
function apiSalvarEstudante(dados) {
  return executar_('apiSalvarEstudante', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN, PERFIL.GESTOR]);
    dados = dados || {};
    var nome = validarNomePessoa_(dados.nome, 'nome do estudante');
    var observacao = texto_(dados.observacao, 300);
    return comLock_(function () {
      var estudantes = lerTabela_('ESTUDANTES', { fresco: true });
      var turmasPorId = indexarPor_(lerTabela_('TURMAS', { fresco: true }), 'ID');
      if (dados.id) {
        var e = indexarPor_(estudantes, 'ID')[dados.id];
        if (!e) throw appError_('NAO_ENCONTRADO', 'Estudante não encontrado.');
        exigirTurma_(u, e.TURMA_ID);
        var numero = inteiro_(dados.numero, 1, 999, 'Número de chamada');
        if (e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO) {
          var ocupado = numeroOcupado_(estudantes, e.TURMA_ID, numero, e.ID);
          if (ocupado) throw appError_('DUPLICADO', 'O número ' + numero + ' já pertence a ' + ocupado.NOME + '. Altere primeiro o número desse estudante.');
        }
        var aud = [];
        if (e.NOME !== nome) aud.push(novaAuditoria_(u.email, { acao: 'EDICAO_NOME_ESTUDANTE', entidade: 'ESTUDANTES', registroId: e.ID, estudante: nome, turma: e.TURMA_ID, anterior: e.NOME, novo: nome }));
        if (Number(e.NUMERO) !== numero) aud.push(novaAuditoria_(u.email, { acao: 'EDICAO_NUMERO_ESTUDANTE', entidade: 'ESTUDANTES', registroId: e.ID, estudante: nome, turma: e.TURMA_ID, anterior: e.NUMERO, novo: numero }));
        if (String(e.OBSERVACAO) !== observacao) aud.push(novaAuditoria_(u.email, { acao: 'EDICAO_OBSERVACAO_ESTUDANTE', entidade: 'ESTUDANTES', registroId: e.ID, estudante: nome, turma: e.TURMA_ID, anterior: e.OBSERVACAO, novo: observacao }));
        if (!aud.length) return estudanteParaCliente_(e, turmasPorId);
        e.NOME = nome; e.NUMERO = numero; e.OBSERVACAO = observacao; e.ATUALIZADO_EM = agora_(); e.ATUALIZADO_POR = u.email;
        atualizarRegistros_('ESTUDANTES', [e]);
        registrarAuditoria_(aud);
        return estudanteParaCliente_(e, turmasPorId);
      }
      var turma = exigirTurma_(u, dados.turmaId);
      var dataEntrada = dados.dataEntrada ? validarData_(dados.dataEntrada, 'Data de entrada') : hoje_();
      if (turma.DATA_INICIO && dataEntrada < turma.DATA_INICIO) dataEntrada = turma.DATA_INICIO;
      var duplicado = estudantes.filter(function (x) {
        return x.TURMA_ID === turma.ID && x.SITUACAO === SITUACAO_ESTUDANTE.ATIVO && normalizarNome_(x.NOME) === normalizarNome_(nome);
      });
      if (duplicado.length && !dados.confirmarHomonimo) {
        throw appError_('HOMONIMO', 'Já existe um estudante ativo com este nome nesta turma (nº ' + duplicado[0].NUMERO + '). Confirme se não é um cadastro duplicado.');
      }
      var num = dados.numero ? inteiro_(dados.numero, 1, 999, 'Número de chamada') : proximoNumero_(estudantes, turma.ID);
      var ocup = numeroOcupado_(estudantes, turma.ID, num, null);
      if (ocup) throw appError_('DUPLICADO', 'O número ' + num + ' já pertence a ' + ocup.NOME + '.');
      var novo = {
        ID: gerarId_('EST'), TURMA_ID: turma.ID, NUMERO: num, NOME: nome, SITUACAO: SITUACAO_ESTUDANTE.ATIVO,
        DATA_ENTRADA: dataEntrada, DATA_SAIDA: '', TURMA_ANTERIOR_ID: '', NUMERO_ANTERIOR: '', DATA_TRANSFERENCIA: '',
        OBSERVACAO: observacao, CRIADO_EM: agora_(), CRIADO_POR: u.email, ATUALIZADO_EM: agora_(), ATUALIZADO_POR: u.email
      };
      inserirRegistros_('ESTUDANTES', [novo]);
      auditar_(u.email, { acao: 'CADASTRO_ESTUDANTE', entidade: 'ESTUDANTES', registroId: novo.ID, estudante: nome, turma: turma.ID, novo: 'Nº ' + num + ' — ' + nome });
      return estudanteParaCliente_(novo, turmasPorId);
    });
  });
}

/** Inativa (ativo=false, exige motivo) ou reativa um estudante. Histórico preservado. */
function apiAlterarStatusEstudante(estudanteId, ativo, motivo, dataSaida) {
  return executar_('apiAlterarStatusEstudante', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN, PERFIL.GESTOR]);
    motivo = texto_(motivo, 300);
    if (!ativo && motivo.length < 3) throw appError_('DADOS_INVALIDOS', 'Informe o motivo da inativação.');
    return comLock_(function () {
      var estudantes = lerTabela_('ESTUDANTES', { fresco: true });
      var e = indexarPor_(estudantes, 'ID')[estudanteId];
      if (!e) throw appError_('NAO_ENCONTRADO', 'Estudante não encontrado.');
      exigirTurma_(u, e.TURMA_ID);
      var anterior = e.SITUACAO;
      if (ativo) {
        if (e.SITUACAO === SITUACAO_ESTUDANTE.ATIVO) return estudanteParaCliente_(e, null);
        var ocupado = numeroOcupado_(estudantes, e.TURMA_ID, e.NUMERO, e.ID);
        if (ocupado) e.NUMERO = proximoNumero_(estudantes, e.TURMA_ID);
        e.SITUACAO = SITUACAO_ESTUDANTE.ATIVO;
        e.DATA_SAIDA = '';
      } else {
        if (e.SITUACAO !== SITUACAO_ESTUDANTE.ATIVO) return estudanteParaCliente_(e, null);
        var saida = dataSaida ? validarData_(dataSaida, 'Data de saída') : hoje_();
        if (saida < e.DATA_ENTRADA) throw appError_('DADOS_INVALIDOS', 'A data de saída não pode ser anterior à data de entrada.');
        e.SITUACAO = SITUACAO_ESTUDANTE.INATIVO;
        e.DATA_SAIDA = saida;
      }
      e.ATUALIZADO_EM = agora_(); e.ATUALIZADO_POR = u.email;
      atualizarRegistros_('ESTUDANTES', [e]);
      auditar_(u.email, { acao: ativo ? 'REATIVACAO_ESTUDANTE' : 'INATIVACAO_ESTUDANTE', entidade: 'ESTUDANTES', registroId: e.ID,
        estudante: e.NOME, turma: e.TURMA_ID, anterior: anterior, novo: e.SITUACAO, motivo: motivo,
        detalhes: ativo ? 'Número de chamada: ' + e.NUMERO : 'Data de saída: ' + e.DATA_SAIDA });
      return estudanteParaCliente_(e, null);
    });
  });
}

/**
 * Transfere estudante para outra turma. Os registros de frequência antigos permanecem
 * vinculados à turma de origem (nada é apagado).
 */
function apiTransferirEstudante(estudanteId, novaTurmaId, dataTransferencia, motivo) {
  return executar_('apiTransferirEstudante', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN, PERFIL.GESTOR]);
    var data = validarData_(dataTransferencia || hoje_(), 'Data da transferência');
    motivo = texto_(motivo, 300);
    return comLock_(function () {
      var estudantes = lerTabela_('ESTUDANTES', { fresco: true });
      var e = indexarPor_(estudantes, 'ID')[estudanteId];
      if (!e) throw appError_('NAO_ENCONTRADO', 'Estudante não encontrado.');
      if (e.SITUACAO !== SITUACAO_ESTUDANTE.ATIVO) throw appError_('DADOS_INVALIDOS', 'Somente estudantes ativos podem ser transferidos.');
      var origem = exigirTurma_(u, e.TURMA_ID);
      var destino = exigirTurma_(u, novaTurmaId);
      if (origem.ID === destino.ID) throw appError_('DADOS_INVALIDOS', 'Escolha uma turma diferente da atual.');
      if (!ehSim_(destino.ATIVA)) throw appError_('DADOS_INVALIDOS', 'A turma de destino está inativa.');
      if (data < e.DATA_ENTRADA) throw appError_('DADOS_INVALIDOS', 'A data da transferência não pode ser anterior à entrada do estudante.');
      var novoNumero = proximoNumero_(estudantes, destino.ID);
      var anteriorTxt = origem.NOME + ' (nº ' + e.NUMERO + ')';
      e.TURMA_ANTERIOR_ID = origem.ID;
      e.NUMERO_ANTERIOR = e.NUMERO;
      e.DATA_TRANSFERENCIA = data;
      e.TURMA_ID = destino.ID;
      e.NUMERO = novoNumero;
      e.DATA_ENTRADA = data;
      e.ATUALIZADO_EM = agora_(); e.ATUALIZADO_POR = u.email;
      atualizarRegistros_('ESTUDANTES', [e]);
      registrarAuditoria_([
        novaAuditoria_(u.email, { acao: 'TRANSFERENCIA_ESTUDANTE', entidade: 'ESTUDANTES', registroId: e.ID, estudante: e.NOME, turma: origem.ID,
          anterior: anteriorTxt, novo: destino.NOME + ' (nº ' + novoNumero + ')', motivo: motivo, detalhes: 'Data: ' + data }),
        novaAuditoria_(u.email, { acao: 'TRANSFERENCIA_ESTUDANTE', entidade: 'ESTUDANTES', registroId: e.ID, estudante: e.NOME, turma: destino.ID,
          anterior: anteriorTxt, novo: destino.NOME + ' (nº ' + novoNumero + ')', motivo: motivo, detalhes: 'Data: ' + data })
      ]);
      return estudanteParaCliente_(e, indexarPor_(lerTabela_('TURMAS'), 'ID'));
    });
  });
}

// ------------------------------------------------------------------ Professores / usuários

function professorParaCliente_(p) {
  return { id: p.ID, nome: p.NOME, email: p.EMAIL, perfil: p.PERFIL, turmas: String(p.TURMAS || ''), ativo: ehSim_(p.ATIVO) };
}

function apiListarProfessores() {
  return executar_('apiListarProfessores', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN, PERFIL.GESTOR]);
    return lerTabela_('PROFESSORES').map(professorParaCliente_)
      .sort(function (a, b) { return String(a.nome).localeCompare(String(b.nome)); });
  });
}

/** Cria ou edita usuário (professor, gestor ou administrador). Somente ADMIN. */
function apiSalvarProfessor(dados) {
  return executar_('apiSalvarProfessor', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    dados = dados || {};
    var nome = validarNomePessoa_(dados.nome, 'nome');
    var email = validarEmail_(dados.email);
    var perfil = String(dados.perfil || '').toUpperCase();
    if (PERFIS_VALIDOS.indexOf(perfil) < 0) throw appError_('DADOS_INVALIDOS', 'Perfil inválido.');
    var turmasIds = (Array.isArray(dados.turmas) ? dados.turmas : String(dados.turmas || '').split(/[;,]/))
      .map(function (s) { return String(s).trim(); }).filter(String);
    return comLock_(function () {
      var turmasPorId = indexarPor_(lerTabela_('TURMAS', { fresco: true }), 'ID');
      turmasIds.forEach(function (id) {
        if (id !== '*' && !turmasPorId[id]) throw appError_('DADOS_INVALIDOS', 'Turma inexistente: ' + id);
      });
      if (perfil === PERFIL.PROFESSOR && !turmasIds.length) throw appError_('DADOS_INVALIDOS', 'Selecione pelo menos uma turma para o professor.');
      var profs = lerTabela_('PROFESSORES', { fresco: true });
      var mesmoEmail = profs.filter(function (p) { return String(p.EMAIL).toLowerCase() === email && p.ID !== dados.id; });
      if (mesmoEmail.length) throw appError_('DUPLICADO', 'Este e-mail já está cadastrado.');
      var turmasTxt = turmasIds.join(';');
      if (dados.id) {
        var p = indexarPor_(profs, 'ID')[dados.id];
        if (!p) throw appError_('NAO_ENCONTRADO', 'Usuário não encontrado.');
        if (p.EMAIL === u.email && perfil !== PERFIL.ADMIN) throw appError_('SEM_PERMISSAO', 'Você não pode remover o seu próprio perfil de administrador.');
        var antes = JSON.stringify({ nome: p.NOME, email: p.EMAIL, perfil: p.PERFIL, turmas: p.TURMAS });
        p.NOME = nome; p.EMAIL = email; p.PERFIL = perfil; p.TURMAS = turmasTxt; p.ATUALIZADO_EM = agora_(); p.ATUALIZADO_POR = u.email;
        atualizarRegistros_('PROFESSORES', [p]);
        auditar_(u.email, { acao: 'EDICAO_USUARIO', entidade: 'PROFESSORES', registroId: p.ID, anterior: antes,
          novo: JSON.stringify({ nome: nome, email: email, perfil: perfil, turmas: turmasTxt }) });
        return professorParaCliente_(p);
      }
      var novo = { ID: gerarId_('PRO'), NOME: nome, EMAIL: email, PERFIL: perfil, TURMAS: turmasTxt, ATIVO: 'SIM',
        CRIADO_EM: agora_(), CRIADO_POR: u.email, ATUALIZADO_EM: agora_(), ATUALIZADO_POR: u.email };
      inserirRegistros_('PROFESSORES', [novo]);
      auditar_(u.email, { acao: 'CADASTRO_USUARIO', entidade: 'PROFESSORES', registroId: novo.ID, novo: nome + ' <' + email + '> ' + perfil });
      return professorParaCliente_(novo);
    });
  });
}

function apiAlterarStatusProfessor(professorId, ativo) {
  return executar_('apiAlterarStatusProfessor', function () {
    var u = exigirUsuario_();
    exigirPerfil_(u, [PERFIL.ADMIN]);
    return comLock_(function () {
      var profs = lerTabela_('PROFESSORES', { fresco: true });
      var p = indexarPor_(profs, 'ID')[professorId];
      if (!p) throw appError_('NAO_ENCONTRADO', 'Usuário não encontrado.');
      if (String(p.EMAIL).toLowerCase() === u.email && !ativo) throw appError_('SEM_PERMISSAO', 'Você não pode desativar o seu próprio acesso.');
      var novo = ativo ? 'SIM' : 'NAO';
      if (p.ATIVO !== novo) {
        var anterior = p.ATIVO;
        p.ATIVO = novo; p.ATUALIZADO_EM = agora_(); p.ATUALIZADO_POR = u.email;
        atualizarRegistros_('PROFESSORES', [p]);
        auditar_(u.email, { acao: ativo ? 'REATIVACAO_USUARIO' : 'DESATIVACAO_USUARIO', entidade: 'PROFESSORES', registroId: p.ID, anterior: anterior, novo: novo, detalhes: p.EMAIL });
      }
      return professorParaCliente_(p);
    });
  });
}
