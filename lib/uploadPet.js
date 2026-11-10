// ============================================================
// UPLOAD DE FOTOS DOS PETS
// Multer recebe imagens dos formulários e salva na pasta Public.
// ============================================================

const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

// Pasta em que ficam as imagens enviadas.
const pasta = path.join(__dirname, '..', 'Public', 'img', 'pets');
fs.mkdirSync(pasta, { recursive: true });

// Tipos de imagens que o formulário pode enviar.
const extensoes = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
};

// 1. DEFINIR O LOCAL E O NOME DO ARQUIVO
const armazenamento = multer.diskStorage({
    destination: (req, arquivo, callback) => {
        callback(null, pasta);
    },
    filename: (req, arquivo, callback) => {
        // UUID evita que dois uploads tenham o mesmo nome.
        const nome = crypto.randomUUID() + extensoes[arquivo.mimetype];
        callback(null, nome);
    }
});

// 2. VALIDAR O TIPO E O TAMANHO DA FOTO
const uploadPet = multer({
    storage: armazenamento,
    limits: {
        fileSize: 3 * 1024 * 1024, // 3 MB
        files: 1
    },
    fileFilter: (req, arquivo, callback) => {
        if (!extensoes[arquivo.mimetype]) {
            return callback(new Error('Imagem inválida: use JPG, PNG ou WebP'));
        }

        callback(null, true);
    }
});

module.exports = uploadPet;
