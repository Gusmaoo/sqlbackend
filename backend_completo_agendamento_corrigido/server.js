require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    msg: 'API de agendamento online',
    rotas: ['/usuarios', '/disponibilidades', '/agendamentos']
  });
});

app.use('/usuarios', require('./routes/usuariosRoutes'));
app.use('/disponibilidades', require('./routes/disponibilidadeRoutes'));
app.use('/agendamentos', require('./routes/agendamentoRoutes'));

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota nao encontrada' });
});

app.listen(port, () => {
  console.log('Servidor rodando na porta ' + port);
});
