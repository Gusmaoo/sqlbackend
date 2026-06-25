CREATE DATABASE IF NOT EXISTS agendamento_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE agendamento_db;

DROP TABLE IF EXISTS agendamentos;
DROP TABLE IF EXISTS disponibilidades;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  matricula VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  tipo_usuario ENUM('aluno', 'professor', 'admin') NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE disponibilidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  professor_id INT NOT NULL,
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  local VARCHAR(120),
  status ENUM('disponivel', 'indisponivel') NOT NULL DEFAULT 'disponivel',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_disponibilidades_professor
    FOREIGN KEY (professor_id) REFERENCES usuarios(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT ck_disponibilidades_horario
    CHECK (hora_inicio < hora_fim),
  UNIQUE KEY uk_professor_periodo (professor_id, data, hora_inicio, hora_fim)
);

CREATE TABLE agendamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aluno_id INT NOT NULL,
  disponibilidade_id INT NOT NULL,
  assunto VARCHAR(200) NOT NULL,
  observacao TEXT,
  status ENUM('agendado', 'cancelado', 'realizado') NOT NULL DEFAULT 'agendado',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_agendamentos_aluno
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_agendamentos_disponibilidade
    FOREIGN KEY (disponibilidade_id) REFERENCES disponibilidades(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_agendamentos_status (status),
  INDEX idx_agendamentos_aluno (aluno_id),
  INDEX idx_agendamentos_disponibilidade (disponibilidade_id)
);
