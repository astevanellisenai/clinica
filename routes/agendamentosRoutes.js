// ============================================================
// AGENDAMENTOS - CRUD COMPLETO
// Rotas para listar, cadastrar, editar e excluir consultas.
// ============================================================

const express = require('express');
const router = express.Router();
const BD = require('../db');
const { parametros, consultar } = require('../lib/listagem');

// 1. LISTAR COM PESQUISA, FILTROS E PAGINAÇÃO
router.get('/', async (req, res, next) => {
    try {
        // O usuário escolhe apenas uma das ordenações permitidas.
        const ordens = {
            data: 'a.data_agendamento ASC, a.id ASC',
            data_desc: 'a.data_agendamento DESC, a.id DESC',
            pet: 'p.nome ASC, a.data_agendamento ASC',
            tutor: 't.nome ASC, a.data_agendamento ASC',
            status: 'a.status ASC, a.data_agendamento ASC'
        };

        const filtros = parametros(req.query, ordens, 'data');
        const situacoes = ['agendado', 'concluido', 'cancelado'];
        const filtro = situacoes.includes(filtros.filtro)
            ? filtros.filtro : '';

        // A pesquisa começa pelo parâmetro $1.
        const valores = ['%' + filtros.busca + '%'];
        let condicao = `(
            p.nome ILIKE $1 OR
            t.nome ILIKE $1 OR
            a.descricao ILIKE $1
        )`;

        // Filtro por situação do atendimento.
        if (filtro) {
            valores.push(filtro);
            condicao += ' AND a.status = $' + valores.length;
        }

        // Filtro por mês (exemplo: 2026-12).
        if (filtros.mes) {
            valores.push(filtros.mes + '-01');
            const posicao = valores.length;

            condicao += `
                AND a.data_agendamento >= $${posicao}::date
                AND a.data_agendamento < (
                    $${posicao}::date + INTERVAL '1 month'
                )
            `;
        }

        // O JOIN permite mostrar nome, tutor e foto do pet.
        const resultado = await consultar(BD, {
            from: `
                agendamentos a
                INNER JOIN pets p ON a.pet_id = p.id
                INNER JOIN tutores t ON p.tutor_id = t.id
            `,
            where: condicao,
            values: valores,
            select: `
                a.*,
                p.nome AS pet_nome,
                p.especie,
                p.raca,
                p.imagem_url,
                t.nome AS tutor_nome,
                t.email,
                t.telefone
            `,
            order: ordens[filtros.ordem],
            pagina: filtros.pagina,
            limite: 4 // Duas linhas com dois cards em cada página.
        });

        res.render('agendamentos/index', {
            ...resultado,
            ...filtros,
            filtro,
            pagina: resultado.pagina
        });
    } catch (erro) {
        next(erro);
    }
});

// 2. MOSTRAR FORMULÁRIO PARA UM NOVO AGENDAMENTO
router.get('/novo', async (req, res, next) => {
    try {
        const resultado = await BD.query(`
            SELECT p.id, p.nome, t.nome AS tutor_nome
            FROM pets p
            INNER JOIN tutores t ON p.tutor_id = t.id
            ORDER BY t.nome, p.nome
        `);
        res.render('agendamentos/novo', { pets: resultado.rows });
    } catch (erro) {
        next(erro);
    }
});

// 3. SALVAR O NOVO AGENDAMENTO
router.post('/novo', async (req, res, next) => {
    try {
        const { pet_id, data_agendamento, descricao, status } = req.body;

        await BD.query(`
            INSERT INTO agendamentos (
                pet_id, data_agendamento, descricao, status
            )
            VALUES ($1, $2, $3, $4)
        `, [pet_id, data_agendamento, descricao, status]);

        res.redirect('/agendamentos');
    } catch (erro) {
        next(erro);
    }
});

// 4. MOSTRAR FORMULÁRIO PARA EDITAR
router.get('/editar/:id', async (req, res, next) => {
    try {
        // datetime-local recebe uma data no formato YYYY-MM-DDTHH:MM.
        const resultado = await BD.query(`
            SELECT *,
                TO_CHAR(
                    data_agendamento,
                    'YYYY-MM-DD"T"HH24:MI'
                ) AS data_formatada
            FROM agendamentos
            WHERE id = $1
        `, [req.params.id]);

        if (resultado.rows.length === 0) {
            return res.sendStatus(404);
        }

        const pets = await BD.query(`
            SELECT p.id, p.nome, t.nome AS tutor_nome
            FROM pets p
            INNER JOIN tutores t ON p.tutor_id = t.id
            ORDER BY t.nome, p.nome
        `);
        res.render('agendamentos/editar', {
            agendamento: resultado.rows[0],
            pets: pets.rows
        });
    } catch (erro) {
        next(erro);
    }
});

// 5. SALVAR ALTERAÇÕES
router.post('/editar/:id', async (req, res, next) => {
    try {
        const { pet_id, data_agendamento, descricao, status } = req.body;

        await BD.query(`
            UPDATE agendamentos
            SET pet_id = $1,
                data_agendamento = $2,
                descricao = $3,
                status = $4
            WHERE id = $5
        `, [
            pet_id,
            data_agendamento,
            descricao,
            status,
            req.params.id
        ]);

        res.redirect('/agendamentos');
    } catch (erro) {
        next(erro);
    }
});

// 6. EXCLUIR AGENDAMENTO
router.post('/excluir/:id', async (req, res, next) => {
    try {
        const resultado = await BD.query(`
            DELETE FROM agendamentos
            WHERE id = $1
        `, [req.params.id]);

        if (resultado.rowCount === 0) {
            return res.sendStatus(404);
        }

        res.redirect('/agendamentos');
    } catch (erro) {
        next(erro);
    }
});

module.exports = router;
