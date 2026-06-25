const db = require('../config/database');

const selectBase = 'SELECT ' +
  'a.id, a.aluno_id, aluno.nome AS aluno_nome, a.disponibilidade_id, ' +
  'd.professor_id, professor.nome AS professor_nome, d.data, d.hora_inicio, d.hora_fim, ' +
  'd.local, a.assunto, a.observacao, a.status, a.criado_em, a.atualizado_em ' +
  'FROM agendamentos a ' +
  'INNER JOIN usuarios aluno ON aluno.id = a.aluno_id ' +
  'INNER JOIN disponibilidades d ON d.id = a.disponibilidade_id ' +
  'INNER JOIN usuarios professor ON professor.id = d.professor_id';

async function listar() {
  const [rows] = await db.query(selectBase + ' ORDER BY d.data, d.hora_inicio');
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await db.query(selectBase + ' WHERE a.id = ?', [id]);
  return rows[0];
}

async function buscarAtivoPorDisponibilidade(disponibilidadeId, ignorarId = null) {
  const params = [disponibilidadeId];
  let sql = 'SELECT id FROM agendamentos WHERE disponibilidade_id = ? AND status = \'agendado\'';

  if (ignorarId) {
    sql += ' AND id <> ?';
    params.push(ignorarId);
  }

  sql += ' LIMIT 1';
  const [rows] = await db.query(sql, params);
  return rows[0];
}

async function existeConflitoAluno(alunoId, disponibilidade, ignorarId = null) {
  const params = [alunoId, disponibilidade.data, disponibilidade.hora_fim, disponibilidade.hora_inicio];
  let sql = 'SELECT a.id FROM agendamentos a ' +
    'INNER JOIN disponibilidades d ON d.id = a.disponibilidade_id ' +
    'WHERE a.aluno_id = ? AND a.status = \'agendado\' AND d.data = ? ' +
    'AND d.hora_inicio < ? AND d.hora_fim > ?';

  if (ignorarId) {
    sql += ' AND a.id <> ?';
    params.push(ignorarId);
  }

  const [rows] = await db.query(sql, params);
  return rows.length > 0;
}

async function criar(dados) {
  const sql = 'INSERT INTO agendamentos (aluno_id, disponibilidade_id, assunto, observacao, status) VALUES (?, ?, ?, ?, ?)';
  const params = [dados.aluno_id, dados.disponibilidade_id, dados.assunto, dados.observacao || null, dados.status || 'agendado'];
  const [result] = await db.query(sql, params);
  return buscarPorId(result.insertId);
}

async function atualizar(id, dados) {
  const sql = 'UPDATE agendamentos SET aluno_id = ?, disponibilidade_id = ?, assunto = ?, observacao = ?, status = ? WHERE id = ?';
  const params = [dados.aluno_id, dados.disponibilidade_id, dados.assunto, dados.observacao || null, dados.status, id];
  await db.query(sql, params);
  return buscarPorId(id);
}

async function cancelar(id) {
  const sql = 'UPDATE agendamentos SET status = \'cancelado\' WHERE id = ?';
  const [result] = await db.query(sql, [id]);
  return result.affectedRows > 0;
}

module.exports = {
  listar,
  buscarPorId,
  buscarAtivoPorDisponibilidade,
  existeConflitoAluno,
  criar,
  atualizar,
  cancelar
};
