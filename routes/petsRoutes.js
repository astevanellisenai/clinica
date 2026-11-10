// ============================================================
// CRUD DE PETS - Clínica Veterinária
// Listagem, filtros, cadastro, fotos, edição e exclusão.
// ============================================================

const express = require('express');
const router = express.Router();
const BD = require('../db');
const fs = require('node:fs/promises');
const path = require('node:path');
const { parametros, consultar } = require('../lib/listagem');

// Apaga uma fotografia do diretório local quando necessário.
// O path.basename impede que um nome recebido contenha diretórios.
async function apagarImagem(nome) {
    if (!nome) return;

    const arquivo = path.join(
        __dirname, '..', 'public', 'img', 'pets', path.basename(nome)
    );

    try {
        await fs.unlink(arquivo);
    } catch (erro) {
        if (erro.code !== 'ENOENT') {
            console.warn('Falha ao apagar imagem antiga:', erro);
        }
    }
}

// 1. LISTAR PETS
router.get('/', async (req, res, next) => {
    try {
        const ordens = {
            nome: 'p.nome ASC, p.id ASC',
            nome_desc: 'p.nome DESC, p.id DESC',
            especie: 'p.especie ASC, p.nome ASC',
            tutor: 't.nome ASC, p.nome ASC',
            id_desc: 'p.id DESC'
        };

        const filtros = parametros(req.query, ordens, 'nome');
        const filtro = ['Cachorro', 'Gato', 'Outros'].includes(filtros.filtro)
            ? filtros.filtro : '';

        const values = ['%' + filtros.busca + '%'];
        let where = `(
            p.nome ILIKE $1 OR
            p.especie ILIKE $1 OR
            COALESCE(p.raca, '') ILIKE $1 OR
            t.nome ILIKE $1
        )`;

        if (filtro === 'Outros') {
            where += " AND p.especie NOT IN ('Cachorro', 'Gato')";
        } else if (filtro) {
            values.push(filtro);
            where += ' AND p.especie = $2';
        }

        const resultado = await consultar(BD, {
            from: 'pets p INNER JOIN tutores t ON p.tutor_id = t.id',
            where,
            values,
            select: 'p.*, t.nome AS tutor_nome',
            order: ordens[filtros.ordem],
            pagina: filtros.pagina
        });

        res.render('pets/index', {
            ...resultado,
            ...filtros,
            filtro,
            pagina: resultado.pagina
        });
    } catch (erro) {
        next(erro);
    }
});

// 2. ABRIR FORMULÁRIO DE CADASTRO
router.get('/novo', async (req, res, next) => {
    try {
        const resultado = await BD.query('SELECT id, nome FROM tutores ORDER BY nome');
        res.render('pets/novo', { tutores: resultado.rows });
    } catch (erro) {
        next(erro);
    }
});

// 3. CADASTRAR PET
// O Multer é executado no app.js antes desta rota.
router.post('/novo', async (req, res, next) => {
    try {
        const { nome, especie, raca, tutor_id } = req.body;

        await BD.query(`
            INSERT INTO pets (nome, especie, raca, tutor_id, imagem_url)
            VALUES ($1, $2, $3, $4, $5)
        `, [nome, especie, raca, tutor_id, req.file?.filename || null]);

        res.redirect('/pets');
    } catch (erro) {
        if (req.file) await apagarImagem(req.file.filename);
        next(erro);
    }
});

// 4. ABRIR FORMULÁRIO DE EDIÇÃO
router.get('/editar/:id', async (req, res, next) => {
    try {
        const resultado = await BD.query(`
            SELECT *
            FROM pets
            WHERE id = $1
        `, [req.params.id]);

        if (!resultado.rows.length) {
            return res.sendStatus(404);
        }

        const tutores = await BD.query('SELECT id, nome FROM tutores ORDER BY nome');
        res.render('pets/editar', {
            pet: resultado.rows[0],
            tutores: tutores.rows
        });
    } catch (erro) {
        next(erro);
    }
});

// 5. SALVAR ALTERAÇÕES DO PET
router.post('/editar/:id', async (req, res, next) => {
    try {
        const { nome, especie, raca, tutor_id } = req.body;

        const atual = await BD.query(
            'SELECT imagem_url FROM pets WHERE id = $1',
            [req.params.id]
        );

        if (!atual.rows.length) {
            if (req.file) await apagarImagem(req.file.filename);
            return res.sendStatus(404);
        }

        const anterior = atual.rows[0].imagem_url;
        const nova = req.file?.filename || anterior;

        await BD.query(`
            UPDATE pets
            SET nome = $1,
                especie = $2,
                raca = $3,
                tutor_id = $4,
                imagem_url = $5
            WHERE id = $6
        `, [nome, especie, raca, tutor_id, nova, req.params.id]);

        if (req.file && anterior) {
            await apagarImagem(anterior);
        }

        res.redirect('/pets');
    } catch (erro) {
        if (req.file) await apagarImagem(req.file.filename);
        next(erro);
    }
});

// 6. EXCLUIR PET
router.post('/excluir/:id', async (req, res, next) => {
    try {
        const consulta = await BD.query(
            'SELECT imagem_url FROM pets WHERE id = $1',
            [req.params.id]
        );
        const resultado = await BD.query(
            'DELETE FROM pets WHERE id = $1',
            [req.params.id]
        );

        if (!resultado.rowCount) return res.sendStatus(404);

        if (consulta.rows[0]?.imagem_url) {
            await apagarImagem(consulta.rows[0].imagem_url);
        }

        res.redirect('/pets');
    } catch (erro) {
        if (erro.code === '23503') {
            return res.status(409).send(
                'Não é possível excluir este pet: existem agendamentos vinculados.'
            );
        }
        next(erro);
    }
});

module.exports = router;
