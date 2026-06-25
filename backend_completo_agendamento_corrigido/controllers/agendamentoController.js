const Agendamento = require('../models/agendamentoModel');
const Disponibilidade = require('../models/disponibilidadeModel');
const Usuario = require('../models/usuarioModel');

const statusValidos = ['agendado', 'cancelado', 'realizado'];

function camposFaltando(dados) {
  return ['aluno_id', 'disponibilidade_id', 'assunto'].filter((campo) => !dados[campo]);
}

async function validarAgendamento(dados, ignorarId = null) {
  const faltando = camposFaltando(dados);

  if (faltando.length > 0) {
    return { status: 400, erro: 'Campos obrigatorios nao informados', campos: faltando };
  }

  if (!statusValidos.includes(dados.status)) {
    return { status: 400, erro: 'Status de agendamento invalido' };
  }

  const aluno = await Usuario.buscarPorId(dados.aluno_id);

  if (!aluno) {
    return { status: 404, erro: 'Aluno nao encontrado' };
  }

  if (aluno.tipo_usuario !== 'aluno') {
    return { status: 400, erro: 'Agendamento deve pertencer a um usuario aluno' };
  }

  const disponibilidade = await Disponibilidade.buscarPorId(dados.disponibilidade_id);

  if (!disponibilidade) {
    return { status: 404, erro: 'Disponibilidade nao encontrada' };
  }

  if (disponibilidade.status !== 'disponivel' && dados.status === 'agendado') {
    return { status: 409, erro: 'Disponibilidade nao esta disponivel' };
  }

  const jaAgendado = await Agendamento.buscarAtivoPorDisponibilidade(dados.disponibilidade_id, ignorarId);

  if (jaAgendado && dados.status === 'agendado') {
    return { status: 409, erro: 'Disponibilidade ja possui agendamento ativo' };
  }

  const conflitoAluno = await Agendamento.existeConflitoAluno(dados.aluno_id, disponibilidade, ignorarId);

  if (conflitoAluno && dados.status === 'agendado') {
    return { status: 409, erro: 'Aluno ja possui agendamento neste horario' };
  }

  return null;
}

exports.listar = async (req, res) => {
  try {
    const agendamentos = await Agendamento.listar();
    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar agendamentos' });
  }
};

exports.buscar = async (req, res) => {
  try {
    const agendamento = await Agendamento.buscarPorId(req.params.id);

    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento nao encontrado' });
    }

    res.json(agendamento);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar agendamento' });
  }
};

exports.criar = async (req, res) => {
  try {
    const dados = {
      aluno_id: req.body.aluno_id,
      disponibilidade_id: req.body.disponibilidade_id,
      assunto: req.body.assunto,
      observacao: req.body.observacao || null,
      status: req.body.status || 'agendado'
    };

    const erro = await validarAgendamento(dados);

    if (erro) {
      return res.status(erro.status).json(erro);
    }

    const agendamento = await Agendamento.criar(dados);
    res.status(201).json(agendamento);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar agendamento' });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const atual = await Agendamento.buscarPorId(req.params.id);

    if (!atual) {
      return res.status(404).json({ erro: 'Agendamento nao encontrado' });
    }

    const dados = {
      aluno_id: req.body.aluno_id ?? atual.aluno_id,
      disponibilidade_id: req.body.disponibilidade_id ?? atual.disponibilidade_id,
      assunto: req.body.assunto ?? atual.assunto,
      observacao: req.body.observacao ?? atual.observacao,
      status: req.body.status ?? atual.status
    };

    const erro = await validarAgendamento(dados, req.params.id);

    if (erro) {
      return res.status(erro.status).json(erro);
    }

    const agendamento = await Agendamento.atualizar(req.params.id, dados);
    res.json(agendamento);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar agendamento' });
  }
};

exports.cancelar = async (req, res) => {
  try {
    const agendamento = await Agendamento.buscarPorId(req.params.id);

    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento nao encontrado' });
    }

    if (agendamento.status === 'cancelado') {
      return res.status(409).json({ erro: 'Agendamento ja esta cancelado' });
    }

    await Agendamento.cancelar(req.params.id);
    res.json({ msg: 'Agendamento cancelado' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cancelar agendamento' });
  }
};
