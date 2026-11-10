-- Quatro pets adicionais para o projeto Clínica Veterinária.
-- Execute no banco local já existente, pelo pgAdmin.
-- As imagens devem estar em public/img/pets/.

BEGIN;

INSERT INTO pets (nome, especie, raca, imagem_url, tutor_id)
SELECT 'Pipoca', 'Ave', 'Calopsita', 'pipoca.jpg', t.id
FROM tutores t WHERE t.email = 'maria@example.test'
AND NOT EXISTS (SELECT 1 FROM pets p WHERE p.nome='Pipoca' AND p.especie='Ave');

INSERT INTO pets (nome, especie, raca, imagem_url, tutor_id)
SELECT 'Nino', 'Coelho', 'Mini Lop', 'nino.jpg', t.id
FROM tutores t WHERE t.email = 'joao@example.test'
AND NOT EXISTS (SELECT 1 FROM pets p WHERE p.nome='Nino' AND p.especie='Coelho');

INSERT INTO pets (nome, especie, raca, imagem_url, tutor_id)
SELECT 'Nemo', 'Peixe', 'Kinguiô', 'nemo.jpg', t.id
FROM tutores t WHERE t.email = 'fernanda@example.test'
AND NOT EXISTS (SELECT 1 FROM pets p WHERE p.nome='Nemo' AND p.especie='Peixe');

INSERT INTO pets (nome, especie, raca, imagem_url, tutor_id)
SELECT 'Kiwi', 'Ave', 'Periquito-australiano', 'kiwi.jpg', t.id
FROM tutores t WHERE t.email = 'maria@example.test'
AND NOT EXISTS (SELECT 1 FROM pets p WHERE p.nome='Kiwi' AND p.especie='Ave');

UPDATE pets SET imagem_url='pipoca.jpg' WHERE nome='Pipoca' AND especie='Ave';
UPDATE pets SET imagem_url='nino.jpg' WHERE nome='Nino' AND especie='Coelho';
UPDATE pets SET imagem_url='nemo.jpg' WHERE nome='Nemo' AND especie='Peixe';
UPDATE pets SET imagem_url='kiwi.jpg' WHERE nome='Kiwi' AND especie='Ave';

COMMIT;
