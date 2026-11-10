// ============================================================
// CLÍNICA VETERINÁRIA - APLICAÇÃO PRINCIPAL
// Projeto didático SENAI | Node.js + Express + EJS + PostgreSQL
// Organização baseada no projeto Conecta Eventos.
// ============================================================

// 1. IMPORTAÇÃO DAS BIBLIOTECAS E CONFIGURAÇÕES
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');

const BD = require('./db');
const uploadPet = require('./lib/uploadPet');
const app = express();

// Verifica a configuração de segurança necessária para as sessões.
if (!process.env.SESSION_SECRET) {
    throw new Error('Configure SESSION_SECRET no .env');
}

if (
    process.env.NODE_ENV === 'production' &&
    process.env.SESSION_SECRET.length < 32
) {
    throw new Error('Em produção, SESSION_SECRET deve ter 32+ caracteres');
}

// 2. CONFIGURAÇÃO DO EXPRESS E DO MOTOR DE VIEWS
// O EJS transforma arquivos .ejs em páginas HTML.
app.set('view engine', 'ejs');

// Disponibiliza CSS, imagens e outros arquivos da pasta Public.
app.use(express.static('Public'));

// Permite receber os campos dos formulários HTML.
app.use(express.urlencoded({
    extended: false
}));

// 3. CONFIGURAÇÃO DAS SESSÕES
// A sessão identifica o usuário autenticado entre as requisições.
app.use(session({
    name: 'clinica.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 60 * 1000
    }
}));

// 4. UPLOAD DE FOTOGRAFIAS DOS PETS
// Formulários com enctype multipart/form-data precisam do Multer.
// A verificação de CSRF ocorre no middleware seguinte.
app.use('/pets', (req, res, next) => {
    if (req.method !== 'POST') {
        return next();
    }

    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    uploadPet.single('imagem')(req, res, next);
});

// 5. DADOS COMPARTILHADOS COM AS VIEWS E PROTEÇÃO CSRF
// res.locals torna os valores disponíveis em todas as páginas EJS.
app.use((req, res, next) => {
    res.locals.paginaAtiva = req.path.split('/')[1] || 'dashboard';

    if (!req.session.csrf) {
        req.session.csrf = crypto.randomBytes(24).toString('hex');
    }

    res.locals.csrf = req.session.csrf;
    res.locals.usuario = req.session.usuario || null;

    // Requisições POST precisam enviar o token gerado na sessão.
    if (req.method === 'POST') {
        const tokenRecebido = String(req.body._csrf || '');
        const tokenSessao = req.session.csrf;

        const mesmoTamanho = tokenRecebido.length === tokenSessao.length;
        const tokenValido = mesmoTamanho && crypto.timingSafeEqual(
            Buffer.from(tokenRecebido),
            Buffer.from(tokenSessao)
        );

        if (!tokenValido) {
            return res.status(403).send('CSRF inválido');
        }
    }

    next();
});

// 6. MIDDLEWARE DE AUTENTICAÇÃO
// Utilizado nas rotas que exigem um usuário logado.
function exigirLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    next();
}

// 7. LANDING PAGE PÚBLICA
// Um usuário autenticado que acessa / é enviado ao dashboard.
app.get('/', (req, res) => {
    if (req.session.usuario) {
        return res.redirect('/dashboard');
    }

    res.render('landing/index');
});

// Permite consultar a landing page mesmo após fazer login.
app.get('/landing', (req, res) => {
    res.render('landing/index');
});

// 8. LOGIN
app.get('/login', (req, res) => {
    res.render('login', {
        erro: null
    });
});

app.post('/login', async (req, res, next) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const senha = String(req.body.senha || '');

        const resultado = await BD.query(`
            SELECT id, nome, email, senha_hash
            FROM usuarios
            WHERE email = $1
              AND situacao = 1
        `, [email]);

        const usuario = resultado.rows[0];

        // A senha digitada é comparada com seu hash armazenado.
        if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
            return res.status(401).render('login', {
                erro: 'E-mail ou senha inválidos'
            });
        }

        // Regenera a sessão após o login para evitar fixation.
        req.session.regenerate((erro) => {
            if (erro) {
                return next(erro);
            }

            req.session.usuario = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            };

            req.session.csrf = crypto.randomBytes(24).toString('hex');

            res.redirect('/dashboard');
        });

    } catch (erro) {
        next(erro);
    }
});

// 9. LOGOUT
// Encerra a sessão sem permitir sair por um simples link GET.
app.post('/logout', exigirLogin, (req, res, next) => {
    req.session.destroy((erro) => {
        if (erro) {
            return next(erro);
        }

        res.redirect('/login');
    });
});

// 10. DASHBOARD - INDICADORES E GRÁFICOS
app.get('/dashboard', exigirLogin, async (req, res, next) => {
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

// 11. ROTAS DOS MÓDULOS (CRUD)
// Cada módulo tem seu próprio arquivo na pasta Routes.
// Todas as rotas abaixo exigem login, como no projeto Eventos.

// Rotas de Tutores.
const tutoresRoutes = require('./Routes/tutoresRoutes');
app.use('/tutores', exigirLogin, tutoresRoutes);

// Rotas de Pets.
const petsRoutes = require('./Routes/petsRoutes');
app.use('/pets', exigirLogin, petsRoutes);

// Rotas de Agendamentos.
const agendamentosRoutes = require('./Routes/agendamentosRoutes');
app.use('/agendamentos', exigirLogin, agendamentosRoutes);

// Rotas de Usuários.
const usuariosRoutes = require('./Routes/usuariosRoutes');
app.use('/usuarios', exigirLogin, usuariosRoutes);

// 12. TRATAMENTO CENTRALIZADO DE ERROS
// Registra o erro no terminal e devolve uma mensagem genérica.
app.use((erro, req, res, next) => {
    console.error(erro);
    res.status(500).send('Erro interno no servidor');
});

// 13. EXECUÇÃO DO SERVIDOR
const porta = Number(process.env.PORT || 3001);

app.listen(porta, () => {
    console.log(`Clínica: http://localhost:${porta}`);
});
