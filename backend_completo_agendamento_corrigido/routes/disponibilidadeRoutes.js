const r = require('express').Router();
const c = require('../controllers/disponibilidadeController');

r.get('/', c.listar);
r.get('/:id', c.buscar);
r.post('/', c.criar);
r.put('/:id', c.atualizar);
r.delete('/:id', c.excluir);

module.exports = r;
