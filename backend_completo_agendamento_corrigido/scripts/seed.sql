USE agendamento_db;

INSERT INTO usuarios (nome, matricula, email, senha, tipo_usuario) VALUES
('Ana Aluna', 'A2026001', 'ana.aluna@email.com', 'senha123', 'aluno'),
('Paulo Professor', 'P2026001', 'paulo.professor@email.com', 'senha123', 'professor'),
('Admin Sistema', 'ADM001', 'admin@email.com', 'senha123', 'admin');

INSERT INTO disponibilidades (professor_id, data, hora_inicio, hora_fim, local) VALUES
(2, '2026-06-30', '09:00:00', '10:00:00', 'Sala 101'),
(2, '2026-06-30', '10:00:00', '11:00:00', 'Sala 101');

INSERT INTO agendamentos (aluno_id, disponibilidade_id, assunto, observacao) VALUES
(1, 1, 'Orientacao do projeto', 'Revisar entrega do backend');
