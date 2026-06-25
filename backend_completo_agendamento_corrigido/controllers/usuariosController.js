const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarioModel');

const tiposValidos = ['aluno', 'professor', 'admin'];

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCamposObrigatorios(dados) {
  const obrigatorios = ['nome', 'matricula', 'email', 'senha', 'tipo_usuario'];
  return obrigatorios.filter((campo) => !dados[campo]);
}

exports.listar = async (req, res) => {
  try {
    const usuarios = await Usuario.listar();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar usuarios' });
  }
};

exports.buscar = async (req, res) => {
  try {
    const usuario = await Usuario.buscarPorId(req.params.id);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuario nao encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar usuario' });
  }
};

exports.criar = async (req, res) => {
  try {
    const camposFaltando = validarCamposObrigatorios(req.body);

    if (camposFaltando.length > 0) {
      return res.status(400).json({ erro: 'Campos obrigatorios nao informados', campos: camposFaltando });
    }

    if (!emailValido(req.body.email)) {
      return res.status(400).json({ erro: 'Email invalido' });
    }

    if (!tiposValidos.includes(req.body.tipo_usuario)) {
      return res.status(400).json({ erro: 'Tipo de usuario invalido' });
    }

    const duplicado = await Usuario.buscarPorEmailOuMatricula(req.body.email, req.body.matricula);

    if (duplicado) {
      return res.status(409).json({ erro: 'Email ou matricula ja cadastrados' });
    }

    const senhaHash = await bcrypt.hash(req.body.senha, 10);
    const usuario = await Usuario.criar({ ...req.body, senha: senhaHash });

    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar usuario' });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const atual = await Usuario.buscarComSenhaPorId(req.params.id);

    if (!atual) {
      return res.status(404).json({ erro: 'Usuario nao encontrado' });
    }

    const dados = {
      nome: req.body.nome ?? atual.nome,
      matricula: req.body.matricula ?? atual.matricula,
      email: req.body.email ?? atual.email,
      senha: req.body.senha ? await bcrypt.hash(req.body.senha, 10) : atual.senha,
      tipo_usuario: req.body.tipo_usuario ?? atual.tipo_usuario
    };

    if (!emailValido(dados.email)) {
      return res.status(400).json({ erro: 'Email invalido' });
    }

    if (!tiposValidos.includes(dados.tipo_usuario)) {
      return res.status(400).json({ erro: 'Tipo de usuario invalido' });
    }

    const duplicado = await Usuario.buscarPorEmailOuMatricula(dados.email, dados.matricula, req.params.id);

    if (duplicado) {
      return res.status(409).json({ erro: 'Email ou matricula ja cadastrados' });
    }

    const usuario = await Usuario.atualizar(req.params.id, dados);
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar usuario' });
  }
};

exports.excluir = async (req, res) => {
  try {
    const usuario = await Usuario.buscarPorId(req.params.id);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuario nao encontrado' });
    }

    const possuiRelacionamentos = await Usuario.possuiRelacionamentos(req.params.id);

    if (possuiRelacionamentos) {
      return res.status(409).json({ erro: 'Usuario possui relacionamentos e nao pode ser removido' });
    }

    await Usuario.excluir(req.params.id);
    res.json({ msg: 'Usuario removido' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir usuario' });
  }
};
