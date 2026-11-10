-- ATENÇÃO: para laboratório; apaga as tabelas existentes!
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DROP TABLE IF EXISTS agendamentos,pets,tutores,usuarios CASCADE;
CREATE TABLE usuarios(id SERIAL PRIMARY KEY,nome VARCHAR(120) NOT NULL,email VARCHAR(150) NOT NULL UNIQUE,senha_hash TEXT NOT NULL,situacao SMALLINT NOT NULL DEFAULT 1 CHECK(situacao IN(0,1)));
CREATE TABLE tutores(id SERIAL PRIMARY KEY,nome VARCHAR(120) NOT NULL,email VARCHAR(150) NOT NULL UNIQUE,telefone VARCHAR(20),cpf_criptografado TEXT NOT NULL);
CREATE TABLE pets(id SERIAL PRIMARY KEY,nome VARCHAR(100) NOT NULL,especie VARCHAR(70) NOT NULL,raca VARCHAR(100),tutor_id INT NOT NULL REFERENCES tutores(id));
CREATE TABLE agendamentos(id SERIAL PRIMARY KEY,pet_id INT NOT NULL REFERENCES pets(id),data_agendamento TIMESTAMP NOT NULL,descricao TEXT NOT NULL,status VARCHAR(20) NOT NULL DEFAULT 'agendado' CHECK(status IN('agendado','concluido','cancelado')));
INSERT INTO usuarios(nome,email,senha_hash,situacao) VALUES
('Administrador','admin@clinica.local',crypt('Clinica@123',gen_salt('bf')),1),
('Veterinária Ana','ana@clinica.local',crypt('Clinica@123',gen_salt('bf')),1),
('Recepção Carlos','carlos@clinica.local',crypt('Clinica@123',gen_salt('bf')),1);
-- Os 3 tutores + 3 pets + 3 agendamentos são inseridos por npm run seed.
-- Motivo: CPF obrigatoriamente criptografado AES-256-GCM antes de entrar no banco.
