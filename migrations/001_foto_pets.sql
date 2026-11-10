-- Executar SOMENTE em banco clinica existente.
-- Preserva os tutores, pets e agendamentos já cadastrados.
ALTER TABLE pets ADD COLUMN IF NOT EXISTS imagem_url VARCHAR(255);
