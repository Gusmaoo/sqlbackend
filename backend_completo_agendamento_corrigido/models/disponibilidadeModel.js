const db = require('../config/database');

const selectBase = 'SELECT ' +
  'd.id, d.professor_id, p.nome AS professor_nome, d.data, d.hora_inicio, d.hora_fim, ' +
  'd.local, d.status, d.criado_em, d.atualizado_em ' +
  'FROM disponibilidades d INNER JOIN usuarios p ON p.id = d.professor_id';

async function listar() {
  const [rows] = await db.query(selectBase + ' ORDER BY d.data, d.hora_inicio');
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await db.query(selectBase + ' WHERE d.id = ?', [id]);
  return rows[0];
}

async function existeConflito(professorId, data, horaInicio, horaFim, ignorarId = null) {
  const params = [professorId, data, horaFim, horaInicio];
  let sql = 'SELECT id FROM disponibilidades ' +
    'WHERE professor_id = ? AND data = ? AND status = \'disponivel\' ' +
    'AND hora_inicio < ? AND hora_fim > ?';

  if (ignorarId) {
    sql += ' AND id <> ?';
    params.push(ignorarId);
  }

  const [rows] = await db.query(sql, params);
  return rows.length > 0;
}

async function criar(dados) {
  const sql = 'INSERT INTO disponibilidades (professor_id, data, hora_inicio, hora_fim, local, status) ' +
    'VALUES (?, ?, ?, ?, ?, ?)';
  const params = [dados.professor_id, dados.data, dados.hora_inicio, dados.hora_fim, dados.local || null, dados.status || 'disponivel'];
  const [result] = await db.query(sql, params);
  return buscarPorId(result.insertId);
}

async function atualizar(id, dados) {
  const sql = 'UPDATE disponibilidades SET professor_id = ?, data = ?, hora_inicio = ?, hora_fim = ?, local = ?, status = ? WHERE id = ?';
  const params = [dados.professor_id, dados.data, dados.hora_inicio, dados.hora_fim, dados.local || null, dados.status, id];
  await db.query(sql, params);
  return buscarPorId(id);
}

async function excluir(id) {
  const [result] = await db.query('DELETE FROM disponibilidades WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function possuiAgendamentoAtivo(id) {
  const sql = 'SELECT id FROM agendamentos WHERE disponibilidade_id = ? AND status = \'agendado\' LIMIT 1';
  const [rows] = await db.query(sql, [id]);
  return rows.length > 0;
}

module.exports = {
  listar,
  buscarPorId,
  existeConflito,
  criar,
  atualizar,
  excluir,
  possuiAgendamentoAtivo
};
