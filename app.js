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

const BD = require('./db');
const uploadPet = require('./lib/uploadPet');
const app = express();

// Verifica a configuração de segurança necessária para as sessões.
if (!process.env.SESSION_SECRET) {
    throw new Error('Configure SESSION_SECRET no .env');
}

// 2. CONFIGURAÇÃO DO EXPRESS E DO MOTOR DE VIEWS
// O EJS transforma arquivos .ejs em páginas HTML.
app.set('view engine', 'ejs');

// Disponibiliza CSS, imagens e outros arquivos da pasta Public.
app.use(express.static('public'));

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
        secure: false, // Aulas locais com HTTP (localhost).
        maxAge: 30 * 60 * 1000
    }
}));

// 4. UPLOAD DE FOTOGRAFIAS DOS PETS
// Formulários com enctype multipart/form-data precisam do Multer.
app.use('/pets', (req, res, next) => {
    if (req.method !== 'POST') {
        return next();
    }

    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    uploadPet.single('imagem')(req, res, next);
});

// 5. DADOS COMPARTILHADOS COM AS VIEWS
// O cabeçalho EJS precisa do usuário logado e da página atual.
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    res.locals.paginaAtiva = req.path.split('/')[1] || 'dashboard';
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

// 10. ROTAS DO DASHBOARD
// Os indicadores foram separados em routes/dashboardRoutes.js.
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/dashboard', exigirLogin, dashboardRoutes);

// 11. ROTAS DOS MÓDULOS (CRUD)
// Cada módulo tem seu próprio arquivo na pasta Routes.
// Todas as rotas abaixo exigem login, como no projeto Eventos.

// Rotas de Tutores.
const tutoresRoutes = require('./routes/tutoresRoutes');
app.use('/tutores', exigirLogin, tutoresRoutes);

// Rotas de Pets.
const petsRoutes = require('./routes/petsRoutes');
app.use('/pets', exigirLogin, petsRoutes);

// Rotas de Agendamentos.
const agendamentosRoutes = require('./routes/agendamentosRoutes');
app.use('/agendamentos', exigirLogin, agendamentosRoutes);

// Rotas de Usuários.
const usuariosRoutes = require('./routes/usuariosRoutes');
app.use('/usuarios', exigirLogin, usuariosRoutes);

// 12. TRATAMENTO DE ERROS
// Em nosso projeto local, o aluno vê o erro real na página e no terminal.
// Nunca use esta exibição detalhada em um site público.
app.use((erro, req, res, next) => {
    const status = erro.status || erro.statusCode || 500;

    // Mostra o erro completo no terminal do VS Code/PowerShell.
    console.error('Erro na rota ' + req.originalUrl, erro);

    if (res.headersSent) {
        return next(erro);
    }

    // Exibe a mensagem e a localização do erro no navegador.
    res.status(status).render('erro', {
        status: status,
        mensagem: erro.message,
        detalhes: erro.stack
    });
});

// 13. TESTAR O BANCO E INICIAR O SERVIDOR
// Antes de abrir o site, verificamos se o PostgreSQL responde.
const porta = Number(process.env.PORT || 3001);

async function iniciarServidor() {
    try {
        // Essa consulta simples confirma que a conexão está funcionando.
        const resultado = await BD.query('SELECT current_database() AS nome');

        console.log('✅ PostgreSQL conectado com sucesso!');
        console.log('📁 Banco de dados: ' + resultado.rows[0].nome);

        // Só iniciamos o site depois de confirmar o banco.
        app.listen(porta, () => {
            console.log('✅ Servidor iniciado: http://localhost:' + porta);
        });
    } catch (erro) {
        console.error('❌ Não foi possível conectar ao PostgreSQL.');
        console.error('Motivo: ' + erro.message);
        console.error('Verifique o PostgreSQL e a configuração DATABASE_URL no .env.');

        // Encerra as conexões e informa falha ao terminal.
        await BD.end();
        process.exitCode = 1;
    }
}

iniciarServidor();
