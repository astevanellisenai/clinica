-- ATENÇÃO: para laboratório; apaga as tabelas existentes!
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DROP TABLE IF EXISTS agendamentos,pets,tutores,usuarios CASCADE;
CREATE TABLE usuarios(id SERIAL PRIMARY KEY,nome VARCHAR(120) NOT NULL,email VARCHAR(150) NOT NULL UNIQUE,senha_hash TEXT NOT NULL,situacao SMALLINT NOT NULL DEFAULT 1 CHECK(situacao IN(0,1)));
CREATE TABLE tutores(id SERIAL PRIMARY KEY,nome VARCHAR(120) NOT NULL,email VARCHAR(150) NOT NULL UNIQUE,telefone VARCHAR(20),cpf_criptografado TEXT NOT NULL);
CREATE TABLE pets(id SERIAL PRIMARY KEY,nome VARCHAR(100) NOT NULL,especie VARCHAR(70) NOT NULL,raca VARCHAR(100),imagem_url VARCHAR(255),tutor_id INT NOT NULL REFERENCES tutores(id));
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

-- PETS — sete registros, todos vinculados aos tutores
-- As fotos devem existir em public/img/pets/ no computador local.
INSERT INTO pets (nome, especie, raca, imagem_url, tutor_id) VALUES
('Mel', 'Cachorro', 'Vira-lata', 'mel.jpg', (SELECT id FROM tutores WHERE email = 'maria@example.test')),
('Luna', 'Gato', 'Siamês', 'luna.jpg', (SELECT id FROM tutores WHERE email = 'joao@example.test')),
('Thor', 'Cachorro', 'Labrador', 'thor.jpg', (SELECT id FROM tutores WHERE email = 'fernanda@example.test')),
('Pipoca', 'Ave', 'Calopsita', 'pipoca.jpg', (SELECT id FROM tutores WHERE email = 'maria@example.test')),
('Nino', 'Coelho', 'Mini Lop', 'nino.jpg', (SELECT id FROM tutores WHERE email = 'joao@example.test')),
('Nemo', 'Peixe', 'Kinguiô', 'nemo.jpg', (SELECT id FROM tutores WHERE email = 'fernanda@example.test')),
('Kiwi', 'Ave', 'Periquito-australiano', 'kiwi.jpg', (SELECT id FROM tutores WHERE email = 'maria@example.test'));

-- AGENDAMENTOS — três originais e dez novos exemplos
-- Situações possíveis: agendado, concluido e cancelado.
INSERT INTO agendamentos (pet_id, data_agendamento, descricao, status) VALUES
((SELECT id FROM pets WHERE nome = 'Mel'), '2026-12-02 09:00', 'Vacinação anual', 'agendado'),
((SELECT id FROM pets WHERE nome = 'Luna'), '2026-12-11 14:30', 'Consulta', 'agendado'),
((SELECT id FROM pets WHERE nome = 'Thor'), '2027-01-08 10:00', 'Exames', 'agendado'),
((SELECT id FROM pets WHERE nome = 'Mel'), '2026-10-05 09:00', 'Vacinação anual realizada', 'concluido'),
((SELECT id FROM pets WHERE nome = 'Luna'), '2026-10-12 14:30', 'Consulta de rotina realizada', 'concluido'),
((SELECT id FROM pets WHERE nome = 'Pipoca'), '2026-10-20 10:00', 'Avaliação clínica da calopsita', 'concluido'),
((SELECT id FROM pets WHERE nome = 'Nino'), '2026-11-04 15:00', 'Avaliação odontológica do coelho', 'concluido'),
((SELECT id FROM pets WHERE nome = 'Thor'), '2026-10-15 08:30', 'Exame de sangue cancelado pelo tutor', 'cancelado'),
((SELECT id FROM pets WHERE nome = 'Kiwi'), '2026-10-28 11:00', 'Consulta de acompanhamento cancelada', 'cancelado'),
((SELECT id FROM pets WHERE nome = 'Nemo'), '2026-11-06 16:00', 'Avaliação de saúde do peixe cancelada', 'cancelado'),
((SELECT id FROM pets WHERE nome = 'Mel'), '2026-11-18 09:30', 'Retorno para avaliação veterinária', 'agendado'),
((SELECT id FROM pets WHERE nome = 'Nino'), '2026-11-24 14:00', 'Consulta preventiva', 'agendado'),
((SELECT id FROM pets WHERE nome = 'Kiwi'), '2026-12-03 10:30', 'Avaliação de saúde e alimentação', 'agendado');
