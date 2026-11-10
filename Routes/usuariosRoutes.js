// ============================================================
// USUÁRIOS - CRUD COMPLETO
// Rotas para listar, cadastrar, editar e excluir contas.
// ============================================================

const express = require('express');
const router = express.Router();
const BD = require('../db');
const bcrypt = require('bcryptjs');
const { parametros, consultar } = require('../lib/listagem');

// Organiza as informações recebidas pelo formulário.
function lerFormulario(req) {
    return {
        nome: String(req.body.nome || '').trim(),
        email: String(req.body.email || '').trim().toLowerCase(),
        senha: String(req.body.senha || ''),
        situacao: Number(req.body.situacao)
    };
}

// 1. LISTAR USUÁRIOS
router.get('/', async (req, res, next) => {
    try {
        const ordens = {
            nome: 'nome ASC, id ASC',
            nome_desc: 'nome DESC, id DESC',
            email: 'email ASC, id ASC',
            id_desc: 'id DESC'
        };

        const filtros = parametros(req.query, ordens, 'nome');
        const filtro = ['0', '1'].includes(filtros.filtro)
            ? filtros.filtro : '';

        const valores = ['%' + filtros.busca + '%'];
        let condicao = '(nome ILIKE $1 OR email ILIKE $1)';

        // Situação: 1 = ativo; 0 = inativo.
        if (filtro) {
            valores.push(Number(filtro));
            condicao += ' AND situacao = $' + valores.length;
        }

        // Não selecionamos a senha nesta consulta.
        const resultado = await consultar(BD, {
            from: 'usuarios',
            where: condicao,
            values: valores,
            select: 'id, nome, email, situacao',
            order: ordens[filtros.ordem],
            pagina: filtros.pagina
        });

        res.render('usuarios/index', {
            ...resultado,
            ...filtros,
            filtro,
            pagina: resultado.pagina,
            aviso: req.query.aviso || null
        });
    } catch (erro) {
        next(erro);
    }
});

// 2. MOSTRAR FORMULÁRIO DE NOVO USUÁRIO
router.get('/novo', (req, res) => {
    res.render('usuarios/form', {
        registro: { situacao: 1 },
        titulo: 'Novo usuário',
        acao: '/usuarios/novo',
        erro: null
    });
});

// 3. CADASTRAR USUÁRIO
router.post('/novo', async (req, res, next) => {
    const usuario = lerFormulario(req);

    // Validação simples dos campos obrigatórios.
    if (!usuario.nome || !usuario.email || !usuario.senha ||
        ![0, 1].includes(usuario.situacao)) {
        return res.status(400).render('usuarios/form', {
            registro: usuario,
            titulo: 'Novo usuário',
            acao: '/usuarios/novo',
            erro: 'Preencha os campos obrigatórios.'
        });
    }

    try {
        // A senha é transformada em hash antes do INSERT.
        const senhaHash = await bcrypt.hash(usuario.senha, 10);

        await BD.query(`
            INSERT INTO usuarios (nome, email, senha_hash, situacao)
            VALUES ($1, $2, $3, $4)
        `, [
            usuario.nome,
            usuario.email,
            senhaHash,
            usuario.situacao
        ]);

        res.redirect('/usuarios');
    } catch (erro) {
        // Erro 23505: e-mail já cadastrado (UNIQUE).
        if (erro.code === '23505') {
            return res.status(400).render('usuarios/form', {
                registro: usuario,
                titulo: 'Novo usuário',
                acao: '/usuarios/novo',
                erro: 'Usuário já cadastrado.'
            });
        }

        next(erro);
    }
});

// 4. MOSTRAR FORMULÁRIO DE EDIÇÃO
router.get('/editar/:id', async (req, res, next) => {
    try {
        const resultado = await BD.query(`
            SELECT id, nome, email, situacao
            FROM usuarios
            WHERE id = $1
        `, [req.params.id]);

        if (resultado.rows.length === 0) {
            return res.sendStatus(404);
        }

        res.render('usuarios/form', {
            registro: resultado.rows[0],
            titulo: 'Editar usuário',
            acao: '/usuarios/editar/' + req.params.id,
            erro: null
        });
    } catch (erro) {
        next(erro);
    }
});

// 5. SALVAR ALTERAÇÕES
router.post('/editar/:id', async (req, res, next) => {
    const usuario = lerFormulario(req);
    const id = Number(req.params.id);
    const propriaConta = id === req.session.usuario.id;

    // O usuário não pode desativar a própria conta.
    if (!usuario.nome || !usuario.email ||
        ![0, 1].includes(usuario.situacao) ||
        (propriaConta && usuario.situacao === 0)) {
        return res.status(400).render('usuarios/form', {
            registro: { ...usuario, id },
            titulo: 'Editar usuário',
            acao: '/usuarios/editar/' + id,
            erro: 'Verifique os campos; não desative sua própria conta.'
        });
    }

    try {
        if (usuario.senha) {
            // Se digitou uma senha, também atualizamos seu hash.
            const senhaHash = await bcrypt.hash(usuario.senha, 10);

            await BD.query(`
                UPDATE usuarios
                SET nome = $1,
                    email = $2,
                    situacao = $3,
                    senha_hash = $4
                WHERE id = $5
            `, [
                usuario.nome,
                usuario.email,
                usuario.situacao,
                senhaHash,
                id
            ]);
        } else {
            // Sem senha nova, mantemos a senha já cadastrada.
            await BD.query(`
                UPDATE usuarios
                SET nome = $1,
                    email = $2,
                    situacao = $3
                WHERE id = $4
            `, [
                usuario.nome,
                usuario.email,
                usuario.situacao,
                id
            ]);
        }

        // Atualiza também o nome exibido no cabeçalho da sessão.
        if (propriaConta) {
            req.session.usuario.nome = usuario.nome;
            req.session.usuario.email = usuario.email;
        }

        res.redirect('/usuarios');
    } catch (erro) {
        if (erro.code === '23505') {
            return res.status(400).render('usuarios/form', {
                registro: { ...usuario, id },
                titulo: 'Editar usuário',
                acao: '/usuarios/editar/' + id,
                erro: 'E-mail já cadastrado.'
            });
        }

        next(erro);
    }
});

// 6. EXCLUIR USUÁRIO
router.post('/excluir/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (id === req.session.usuario.id) {
            const aviso = 'Não é possível excluir sua própria conta.';
            return res.redirect('/usuarios?aviso=' + encodeURIComponent(aviso));
        }

        await BD.query('DELETE FROM usuarios WHERE id = $1', [id]);

        res.redirect('/usuarios');
    } catch (erro) {
        if (erro.code === '23503') {
            const aviso = 'Usuário possui registros relacionados.';
            return res.redirect('/usuarios?aviso=' + encodeURIComponent(aviso));
        }

        next(erro);
    }
});

module.exports = router;
