// ============================================================
// CRUD DE TUTORES - Clínica Veterinária
// Listagem, pesquisa, ordenação, paginação e manutenção.
// ============================================================

const express = require('express');
const router = express.Router();
const BD = require('../db');
const { cifrar, decifrar } = require('../lib/cpf');
const { parametros, consultar } = require('../lib/listagem');

// 1. LISTAR TUTORES
router.get('/', async (req, res, next) => {
    try {
        // As opções fixas impedem que o usuário injete SQL em ORDER BY.
        const ordens = {
            nome: 'nome ASC, id ASC',
            nome_desc: 'nome DESC, id DESC',
            id: 'id ASC',
            id_desc: 'id DESC',
            email: 'email ASC, id ASC'
        };

        const filtros = parametros(req.query, ordens, 'nome');

        const resultado = await consultar(BD, {
            from: 'tutores',
            where: "(nome ILIKE $1 OR email ILIKE $1 OR COALESCE(telefone, '') ILIKE $1)",
            values: ['%' + filtros.busca + '%'],
            order: ordens[filtros.ordem],
            pagina: filtros.pagina
        });

        // CPF é descriptografado apenas para exibição autorizada.
        const registros = resultado.registros.map(tutor => ({
            ...tutor,
            cpf: decifrar(tutor.cpf_criptografado)
        }));

        res.render('tutores/index', {
            ...resultado,
            ...filtros,
            registros,
            pagina: resultado.pagina
        });
    } catch (erro) {
        next(erro);
    }
});

// 2. ABRIR FORMULÁRIO DE CADASTRO
router.get('/novo', (req, res) => {
    res.render('tutores/form', {
        registro: {},
        titulo: 'Novo tutor',
        acao: '/tutores/novo'
    });
});

// 3. CADASTRAR TUTOR
router.post('/novo', async (req, res, next) => {
    try {
        const { nome, email, telefone, cpf } = req.body;

        await BD.query(`
            INSERT INTO tutores (nome, email, telefone, cpf_criptografado)
            VALUES ($1, $2, $3, $4)
        `, [nome, email, telefone, cifrar(cpf)]);

        res.redirect('/tutores');
    } catch (erro) {
        next(erro);
    }
});

// 4. ABRIR FORMULÁRIO DE EDIÇÃO
router.get('/editar/:id', async (req, res, next) => {
    try {
        const resultado = await BD.query(`
            SELECT *
            FROM tutores
            WHERE id = $1
        `, [req.params.id]);

        if (!resultado.rows.length) {
            return res.sendStatus(404);
        }

        res.render('tutores/form', {
            registro: {
                ...resultado.rows[0],
                cpf: decifrar(resultado.rows[0].cpf_criptografado)
            },
            titulo: 'Editar tutor',
            acao: '/tutores/editar/' + req.params.id
        });
    } catch (erro) {
        next(erro);
    }
});

// 5. SALVAR ALTERAÇÕES
router.post('/editar/:id', async (req, res, next) => {
    try {
        const { nome, email, telefone, cpf } = req.body;

        await BD.query(`
            UPDATE tutores
            SET nome = $1,
                email = $2,
                telefone = $3,
                cpf_criptografado = $4
            WHERE id = $5
        `, [nome, email, telefone, cifrar(cpf), req.params.id]);

        res.redirect('/tutores');
    } catch (erro) {
        next(erro);
    }
});

// 6. EXCLUIR TUTOR
router.post('/excluir/:id', async (req, res, next) => {
    try {
        const resultado = await BD.query(
            'DELETE FROM tutores WHERE id = $1',
            [req.params.id]
        );

        if (!resultado.rowCount) {
            return res.sendStatus(404);
        }

        res.redirect('/tutores');
    } catch (erro) {
        // Chave estrangeira: tutor com pets não pode ser excluído.
        if (erro.code === '23503') {
            return res.status(409).send(
                'Não é possível excluir este tutor: existem pets vinculados.'
            );
        }
        next(erro);
    }
});

module.exports = router;
