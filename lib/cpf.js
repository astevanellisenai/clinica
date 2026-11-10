// ============================================================
// PROTEÇÃO DO CPF DOS TUTORES
// Os números de CPF são criptografados antes de chegar ao banco.
// Para descriptografar, usamos a mesma chave do arquivo .env.
// ============================================================

const crypto = require('node:crypto');

// 1. LER A CHAVE DE CRIPTOGRAFIA
function obterChave() {
    const chaveHex = process.env.CPF_ENCRYPTION_KEY || '';

    if (!/^[0-9a-fA-F]{64}$/.test(chaveHex)) {
        throw new Error('CPF_ENCRYPTION_KEY deve ter 64 caracteres hexadecimais');
    }

    return Buffer.from(chaveHex, 'hex');
}

// 2. RETIRAR PONTOS E TRAÇOS DO CPF
function limparCPF(cpf) {
    const numero = String(cpf || '').replace(/\D/g, '');

    if (!/^\d{11}$/.test(numero)) {
        throw new Error('CPF deve conter 11 dígitos');
    }

    return numero;
}

// 3. CRIPTOGRAFAR ANTES DO INSERT OU UPDATE
function cifrar(cpf) {
    const iv = crypto.randomBytes(12);
    const cifra = crypto.createCipheriv('aes-256-gcm', obterChave(), iv);

    const parteCriptografada = Buffer.concat([
        cifra.update(limparCPF(cpf), 'utf8'),
        cifra.final()
    ]);

    // Guardamos IV, tag de autenticação e CPF criptografado juntos.
    const dados = Buffer.concat([
        iv,
        cifra.getAuthTag(),
        parteCriptografada
    ]);

    return dados.toString('base64');
}

// 4. DESCRIPTOGRAFAR PARA EXIBIR NO SISTEMA
function decifrar(cpfCriptografado) {
    const dados = Buffer.from(cpfCriptografado, 'base64');

    const iv = dados.subarray(0, 12);
    const tag = dados.subarray(12, 28);
    const conteudo = dados.subarray(28);

    const decifra = crypto.createDecipheriv('aes-256-gcm', obterChave(), iv);
    decifra.setAuthTag(tag);

    return decifra.update(conteudo, undefined, 'utf8') + decifra.final('utf8');
}

module.exports = { cifrar, decifrar };
