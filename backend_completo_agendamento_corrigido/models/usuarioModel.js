const db = require('../config/database');

const camposPublicos = 'id, nome, matricula, email, tipo_usuario, criado_em, atualizado_em';

async function listar() {
  const sql = 'SELECT ' + camposPublicos + ' FROM usuarios ORDER BY nome';
  const [rows] = await db.query(sql);
  return rows;
}

async function buscarPorId(id) {
  const sql = 'SELECT ' + camposPublicos + ' FROM usuarios WHERE id = ?';
  const [rows] = await db.query(sql, [id]);
  return rows[0];
}

async function buscarComSenhaPorId(id) {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  return rows[0];
}

async function buscarPorEmailOuMatricula(email, matricula, ignorarId = null) {
  const params = [email, matricula];
  let sql = 'SELECT id, email, matricula FROM usuarios WHERE (email = ? OR matricula = ?)';

  if (ignorarId) {
    sql += ' AND id <> ?';
    params.push(ignorarId);
  }

  const [rows] = await db.query(sql, params);
  return rows[0];
}

async function criar(dados) {
  const sql = 'INSERT INTO usuarios (nome, matricula, email, senha, tipo_usuario) VALUES (?, ?, ?, ?, ?)';
  const params = [dados.nome, dados.matricula, dados.email, dados.senha, dados.tipo_usuario];
  const [result] = await db.query(sql, params);
  return buscarPorId(result.insertId);
}

async function atualizar(id, dados) {
  const sql = 'UPDATE usuarios SET nome = ?, matricula = ?, email = ?, senha = ?, tipo_usuario = ? WHERE id = ?';
  const params = [dados.nome, dados.matricula, dados.email, dados.senha, dados.tipo_usuario, id];
  await db.query(sql, params);
  return buscarPorId(id);
}

async function excluir(id) {
  const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function possuiRelacionamentos(id) {
  const sql = 'SELECT ' +
    '(SELECT COUNT(*) FROM disponibilidades WHERE professor_id = ?) AS total_disponibilidades, ' +
    '(SELECT COUNT(*) FROM agendamentos WHERE aluno_id = ?) AS total_agendamentos';
  const [rows] = await db.query(sql, [id, id]);

  return Number(rows[0].total_disponibilidades) > 0 || Number(rows[0].total_agendamentos) > 0;
}

module.exports = {
  listar,
  buscarPorId,
  buscarComSenhaPorId,
  buscarPorEmailOuMatricula,
  criar,
  atualizar,
  excluir,
  possuiRelacionamentos
};
