-- ATENÇÃO: para laboratório; apaga as tabelas existentes!
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DROP TABLE IF EXISTS agendamentos,pets,tutores,usuarios CASCADE;
CREATE TABLE usuarios(id SERIAL PRIMARY KEY,nome VARCHAR(120) NOT NULL,email VARCHAR(150) NOT NULL UNIQUE,senha_hash TEXT NOT NULL,situacao SMALLINT NOT NULL DEFAULT 1 CHECK(situacao IN(0,1)));
CREATE TABLE tutores(id SERIAL PRIMARY KEY,nome VARCHAR(120) NOT NULL,email VARCHAR(150) NOT NULL UNIQUE,telefone VARCHAR(20),cpf_criptografado TEXT NOT NULL);
CREATE TABLE pets(id SERIAL PRIMARY KEY,nome VARCHAR(100) NOT NULL,especie VARCHAR(70) NOT NULL,raca VARCHAR(100),tutor_id INT NOT NULL REFERENCES tutores(id));
CREATE TABLE agendamentos(id SERIAL PRIMARY KEY,pet_id INT NOT NULL REFERENCES pets(id),data_agendamento TIMESTAMP NOT NULL,descricao TEXT NOT NULL,status VARCHAR(20) NOT NULL DEFAULT 'agendado' CHECK(status IN('agendado','concluido','cancelado')));
INSERT INTO usuarios(nome,email,senha_hash,situacao) VALUES
('Administrador','admin@clinica',crypt('1234',gen_salt('bf')),1),
('Veterinária Ana','ana@clinica',crypt('1234',gen_salt('bf')),1),
('Recepção Carlos','carlos@clinica',crypt('1234',gen_salt('bf')),1);

-- =====================================================
-- TUTORES — três registros com CPF cifrado (AES-256-GCM)
-- ATENÇÃO: dados FICTÍCIOS de demonstração. Os valores
-- abaixo usam a chave DIDÁTICA de .env.example.
-- Nunca reutilize essa chave pública com CPFs reais.
-- Para alterar a chave, recadastre/recriptografe os CPFs.
-- =====================================================
INSERT INTO tutores(nome,email,telefone,cpf_criptografado) VALUES
('Maria Oliveira','maria@example.test','18999990001','NkHC0JiLepR+SPitU6RUdY/beTg7fu2lQgrl9DCJ1TvqAAZGvmAV'),
('João Pereira','joao@example.test','18999990002','BX9cu2tvIwKWiPRFzFYF0ucMZ8SWu/jFA0rt06NXfkBb4Atrp2Xo'),
('Fernanda Lima','fernanda@example.test','18999990003','CSzUEaPbBIZbrF6+aQ9eitEVIwW3dOFFNqGrWAS+ki42cgl84p7N');

-- PETS — vinculados aos três tutores
INSERT INTO pets(nome,especie,raca,tutor_id) VALUES
('Mel','Cachorro','Vira-lata',(SELECT id FROM tutores WHERE email='maria@example.test')),
('Luna','Gato','Siamês',(SELECT id FROM tutores WHERE email='joao@example.test')),
('Thor','Cachorro','Labrador',(SELECT id FROM tutores WHERE email='fernanda@example.test'));

-- AGENDAMENTOS — vinculados aos pets
INSERT INTO agendamentos(pet_id,data_agendamento,descricao,status) VALUES
((SELECT id FROM pets WHERE nome='Mel'),'2026-12-02 09:00','Vacinação anual','agendado'),
((SELECT id FROM pets WHERE nome='Luna'),'2026-12-11 14:30','Consulta','agendado'),
((SELECT id FROM pets WHERE nome='Thor'),'2027-01-08 10:00','Exames','agendado');
