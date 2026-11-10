// ============================================================
// ROTAS DO DASHBOARD
// Responsável pelos indicadores e gráficos do sistema.
// A proteção por sessão é aplicada no app.js.
// ============================================================

const express = require('express');
const router = express.Router();
const BD = require('../db');

router.get('/', async (req, res, next) => {
    try {
        // As consultas são independentes e podem executar em paralelo.
        const [
            tutores,
            pets,
            agendamentos,
            proximos,
            status,
            usuarios,
            especies,
            mensal
        ] = await Promise.all([

            // Total de tutores.
            BD.query(`
                SELECT COUNT(*)::int AS total
                FROM tutores
            `),

            // Total de pets.
            BD.query(`
                SELECT COUNT(*)::int AS total
                FROM pets
            `),

            // Total de agendamentos.
            BD.query(`
                SELECT COUNT(*)::int AS total
                FROM agendamentos
            `),

            // Próximas cinco consultas ainda agendadas.
            BD.query(`
                SELECT
                    a.id,
                    a.data_agendamento,
                    a.descricao,
                    a.status,
                    p.nome AS pet_nome,
                    p.imagem_url,
                    t.nome AS tutor_nome
                FROM agendamentos a
                INNER JOIN pets p ON a.pet_id = p.id
                INNER JOIN tutores t ON p.tutor_id = t.id
                WHERE a.data_agendamento >= CURRENT_TIMESTAMP
                  AND a.status = 'agendado'
                ORDER BY a.data_agendamento
                LIMIT 5
            `),

            // Quantidade de consultas agrupadas por situação.
            BD.query(`
                SELECT status, COUNT(*)::int AS total
                FROM agendamentos
                GROUP BY status
            `),

            // Total de usuários cadastrados.
            BD.query(`
                SELECT COUNT(*)::int AS total
                FROM usuarios
            `),

            // Quantidade de pets por espécie.
            BD.query(`
                SELECT especie, COUNT(*)::int AS total
                FROM pets
                GROUP BY especie
                ORDER BY total DESC, especie
            `),

            // Evolução mensal dos últimos seis meses.
            // generate_series inclui os meses sem agendamentos (total zero).
            BD.query(`
                SELECT
                    TO_CHAR(mes, 'YYYY-MM') AS mes,
                    COUNT(a.id)::int AS total
                FROM generate_series(
                    DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months',
                    DATE_TRUNC('month', CURRENT_DATE),
                    INTERVAL '1 month'
                ) AS mes
                LEFT JOIN agendamentos a
                    ON a.data_agendamento >= mes
                   AND a.data_agendamento < mes + INTERVAL '1 month'
                GROUP BY mes
                ORDER BY mes
            `)
        ]);

        // Dados enviados ao EJS do dashboard.
        res.render('dashboard', {
            quantidades: [
                tutores.rows[0].total,
                pets.rows[0].total,
                agendamentos.rows[0].total
            ],
            proximos: proximos.rows,
            status: status.rows,
            totalUsuarios: usuarios.rows[0].total,
            especies: especies.rows,
            mensal: mensal.rows
        });

    } catch (erro) {
        next(erro);
    }
});


module.exports = router;
