const r = require('express').Router();
const c = require('../controllers/usuariosController');

r.get('/', c.listar);
r.get('/:id', c.buscar);
r.post('/', c.criar);
r.put('/:id', c.atualizar);
r.delete('/:id', c.excluir);

module.exports = r;
