// ============================================================
// CONEXÃO COM O BANCO DE DADOS POSTGRESQL
// Todos os arquivos de Routes utilizam este mesmo Pool.
// ============================================================

require('dotenv').config();

const { Pool } = require('pg');

// A conexão está configurada no arquivo .env.
if (!process.env.DATABASE_URL) {
    throw new Error('Configure DATABASE_URL no arquivo .env');
}

// Pool reaproveita conexões para executar as consultas SQL.
const BD = new Pool({
    connectionString: process.env.DATABASE_URL
});

module.exports = BD;
