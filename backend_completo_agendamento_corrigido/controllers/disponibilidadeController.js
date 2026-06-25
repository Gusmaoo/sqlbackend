const Disponibilidade = require('../models/disponibilidadeModel');
const Usuario = require('../models/usuarioModel');

const statusValidos = ['disponivel', 'indisponivel'];

function camposFaltando(dados) {
  return ['professor_id', 'data', 'hora_inicio', 'hora_fim'].filter((campo) => !dados[campo]);
}

function horaParaMinutos(hora) {
  const partes = String(hora).split(':').map(Number);

  if (partes.length < 2 || Number.isNaN(partes[0]) || Number.isNaN(partes[1])) {
    return null;
  }

  return partes[0] * 60 + partes[1];
}

function horarioInvalido(horaInicio, horaFim) {
  const inicio = horaParaMinutos(horaInicio);
  const fim = horaParaMinutos(horaFim);
  return inicio === null || fim === null || inicio >= fim;
}

async function validarDisponibilidade(dados, ignorarId = null) {
  const faltando = camposFaltando(dados);

  if (faltando.length > 0) {
    return { status: 400, erro: 'Campos obrigatorios nao informados', campos: faltando };
  }

  if (horarioInvalido(dados.hora_inicio, dados.hora_fim)) {
    return { status: 400, erro: 'Hora final deve ser maior que hora inicial' };
  }

  if (!statusValidos.includes(dados.status)) {
    return { status: 400, erro: 'Status de disponibilidade invalido' };
  }

  const professor = await Usuario.buscarPorId(dados.professor_id);

  if (!professor) {
    return { status: 404, erro: 'Professor nao encontrado' };
  }

  if (professor.tipo_usuario !== 'professor') {
    return { status: 400, erro: 'Disponibilidade deve pertencer a um usuario professor' };
  }

  const conflito = await Disponibilidade.existeConflito(dados.professor_id, dados.data, dados.hora_inicio, dados.hora_fim, ignorarId);

  if (conflito && dados.status === 'disponivel') {
    return { status: 409, erro: 'Professor ja possui disponibilidade neste horario' };
  }

  return null;
}

exports.listar = async (req, res) => {
  try {
    const disponibilidades = await Disponibilidade.listar();
    res.json(disponibilidades);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar disponibilidades' });
  }
};

exports.buscar = async (req, res) => {
  try {
    const disponibilidade = await Disponibilidade.buscarPorId(req.params.id);

    if (!disponibilidade) {
      return res.status(404).json({ erro: 'Disponibilidade nao encontrada' });
    }

    res.json(disponibilidade);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar disponibilidade' });
  }
};

exports.criar = async (req, res) => {
  try {
    const dados = {
      professor_id: req.body.professor_id,
      data: req.body.data,
      hora_inicio: req.body.hora_inicio,
      hora_fim: req.body.hora_fim,
      local: req.body.local || null,
      status: req.body.status || 'disponivel'
    };

    const erro = await validarDisponibilidade(dados);

    if (erro) {
      return res.status(erro.status).json(erro);
    }

    const disponibilidade = await Disponibilidade.criar(dados);
    res.status(201).json(disponibilidade);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar disponibilidade' });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const atual = await Disponibilidade.buscarPorId(req.params.id);

    if (!atual) {
      return res.status(404).json({ erro: 'Disponibilidade nao encontrada' });
    }

    const possuiAgendamentoAtivo = await Disponibilidade.possuiAgendamentoAtivo(req.params.id);

    if (possuiAgendamentoAtivo) {
      return res.status(409).json({ erro: 'Disponibilidade com agendamento ativo nao pode ser alterada' });
    }

    const dados = {
      professor_id: req.body.professor_id ?? atual.professor_id,
      data: req.body.data ?? atual.data,
      hora_inicio: req.body.hora_inicio ?? atual.hora_inicio,
      hora_fim: req.body.hora_fim ?? atual.hora_fim,
      local: req.body.local ?? atual.local,
      status: req.body.status ?? atual.status
    };

    const erro = await validarDisponibilidade(dados, req.params.id);

    if (erro) {
      return res.status(erro.status).json(erro);
    }

    const disponibilidade = await Disponibilidade.atualizar(req.params.id, dados);
    res.json(disponibilidade);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar disponibilidade' });
  }
};

exports.excluir = async (req, res) => {
  try {
    const disponibilidade = await Disponibilidade.buscarPorId(req.params.id);

    if (!disponibilidade) {
      return res.status(404).json({ erro: 'Disponibilidade nao encontrada' });
    }

    const possuiAgendamentoAtivo = await Disponibilidade.possuiAgendamentoAtivo(req.params.id);

    if (possuiAgendamentoAtivo) {
      return res.status(409).json({ erro: 'Disponibilidade com agendamento ativo nao pode ser removida' });
    }

    await Disponibilidade.excluir(req.params.id);
    res.json({ msg: 'Disponibilidade removida' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir disponibilidade' });
  }
};
