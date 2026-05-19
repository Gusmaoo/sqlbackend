
CREATE TABLE usuarios (
    id_usuarios NUMBER PRIMARY KEY,
    nome VARCHAR2(100) NOT NULL,
    matricula VARCHAR2(20) NOT NULL,
    email VARCHAR2(100) NOT NULL,
    senha VARCHAR2(255) NOT NULL,
    tipo_usuario VARCHAR2(20) NOT NULL,
    telefone VARCHAR2(20)
);

CREATE TABLE disponibilidade (
    id_disponibilidade NUMBER PRIMARY KEY,
    id_professor NUMBER NOT NULL,
    data_disponivel DATE NOT NULL,
    hora_inicio VARCHAR2(10) NOT NULL,
    hora_fim VARCHAR2(10) NOT NULL,
    status VARCHAR2(20) DEFAULT 'DISPONIVEL',
    CONSTRAINT fk_professor FOREIGN KEY (id_professor) REFERENCES usuarios(id_usuario)
);

CREATE TABLE agendamentos (
    id_agendamento NUMBER PRIMARY KEY,
    id_aluno NUMBER NOT NULL,
    id_professor NUMBER NOT NULL,
    id_disponibilidade NUMBER NOT NULL,
    data_agendamento DATE NOT NULL,
    hora_inicio VARCHAR2(10) NOT NULL,
    hora_fim VARCHAR2(10) NOT NULL,
    status VARCHAR2(20) DEFAULT 'PENDENTE',
    observacoes VARCHAR2(4000),
    data_criacao DATE DEFAULT SYSDATE,
    CONSTRAINT fk_aluno FOREIGN KEY (id_aluno) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_professor_ag FOREIGN KEY (id_professor) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_disponibilidade FOREIGN KEY (id_disponibilidade) REFERENCES disponibilidade(id_disponibilidade)
);

CREATE TABLE historico_atendimentos (
    id_historico NUMBER PRIMARY KEY,
    id_agendamento NUMBER NOT NULL,
    descricao VARCHAR2(4000),
    status VARCHAR2(50),
    data_registro DATE DEFAULT SYSDATE,
    CONSTRAINT fk_historico FOREIGN KEY (id_agendamento) REFERENCES agendamentos(id_agendamento)
);


INSERT INTO usuarios (id_usuario, nome, matricula, email, senha, tipo_usuario) VALUES (1, 'Arthur Gusmao', '2025001', 'arthur@email.com', '123456', 'ALUNO');
INSERT INTO usuarios (id_usuario, nome, matricula, email, senha, tipo_usuario) VALUES (2, 'Prof Maria Silva', 'PROF001', 'maria@email.com', '123456', 'PROFESSOR');
INSERT INTO disponibilidade (id_disponibilidade, id_professor, data_disponivel, hora_inicio, hora_fim, status) VALUES (1, 2, DATE '2025-06-01', '14:00', '16:00', 'DISPONIVEL');
INSERT INTO agendamentos (id_agendamento, id_aluno, id_professor, id_disponibilidade, data_agendamento, hora_inicio, hora_fim, status, observacoes) VALUES (1, 1, 2, 1, DATE '2025-06-01', '14:00', '15:00', 'CONFIRMADO', 'Duvidas sobre projeto');
INSERT INTO historico_atendimentos (id_historico, id_agendamento, descricao, status) VALUES (1, 1, 'Atendimento realizado', 'CONCLUIDO');



SELECT * FROM usuarios;
SELECT * FROM disponibilidade;
SELECT * FROM agendamentos;
SELECT * FROM historico_atendimentos;