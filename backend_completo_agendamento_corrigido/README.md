# Backend completo de agendamento

Projeto Node.js + Express + MySQL com as 4 entregas implementadas.

ENTREGA01: scripts SQL e configuracao do ambiente.
ENTREGA02: models e controllers com consultas ao banco.
ENTREGA03: rotas completas da API com GET, POST, PUT e DELETE.
ENTREGA04: regras de negocio e validacoes.

## Como rodar

1. Instale as dependencias:

    npm install

2. Crie o banco executando:

    mysql -u root -p < scripts/schema.sql
    mysql -u root -p agendamento_db < scripts/seed.sql

3. Copie .env.example para .env e ajuste usuario/senha do MySQL.

4. Inicie a API:

    npm start

## Rotas

Usuarios:
GET /usuarios
GET /usuarios/:id
POST /usuarios
PUT /usuarios/:id
DELETE /usuarios/:id

Disponibilidades:
GET /disponibilidades
GET /disponibilidades/:id
POST /disponibilidades
PUT /disponibilidades/:id
DELETE /disponibilidades/:id

Agendamentos:
GET /agendamentos
GET /agendamentos/:id
POST /agendamentos
PUT /agendamentos/:id
DELETE /agendamentos/:id

## Exemplos de JSON

Criar usuario:

{
  "nome": "Maria Silva",
  "matricula": "20260001",
  "email": "maria@email.com",
  "senha": "123456",
  "tipo_usuario": "aluno"
}

Criar disponibilidade:

{
  "professor_id": 2,
  "data": "2026-06-30",
  "hora_inicio": "09:00",
  "hora_fim": "10:00",
  "local": "Sala 101"
}

Criar agendamento:

{
  "aluno_id": 1,
  "disponibilidade_id": 1,
  "assunto": "Orientacao do projeto",
  "observacao": "Levar rascunho da entrega"
}

## Regras implementadas

- Campos obrigatorios sao validados.
- Email e matricula nao podem duplicar.
- Tipo de usuario deve ser aluno, professor ou admin.
- Disponibilidade so pode ser criada para usuario professor.
- Horario final deve ser maior que horario inicial.
- Professor nao pode ter disponibilidades sobrepostas.
- Agendamento exige aluno existente e disponibilidade existente.
- Uma disponibilidade ativa nao pode ter dois agendamentos.
- Um aluno nao pode ter agendamentos com conflito de horario.
- Usuarios com relacionamentos nao sao excluidos diretamente.
- Disponibilidades com agendamento ativo nao sao excluidas.
- DELETE /agendamentos/:id cancela o agendamento.
