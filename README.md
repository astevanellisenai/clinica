# 🐾 Clínica Veterinária

Projeto de avaliação prática **SENAI** desenvolvido com **Node.js, Express, EJS e PostgreSQL**, seguindo o padrão de organização do [Conecta Eventos](https://github.com/astevanellisenai/eventos).

## Funcionalidades
- Login de usuários ativos com sessão expirada após 30 minutos de inatividade, mensagens de erro e logout.
- Painel inicial com nome do usuário logado e menus para navegar.
- Tutores: cadastro, listagem com filtro por nome/e-mail e edição; CPF criptografado no banco.
- Pets: cadastro, edição e associação obrigatória com tutor.
- Agendamentos: cadastro, edição da data, listagem por mês com dados de pet e tutor.
- PostgreSQL com chaves e relacionamentos; três registros iniciais para todas as tabelas (SQL + seed).

## Estrutura do projeto
```
clinica/
  Public/css/estilos.css
  Routes/{tutores,pets,agendamentos}Routes.js
  views/{login,dashboard}.ejs
  views/{tutores,pets,agendamentos}/*.ejs
  views/includes/*.ejs
  lib/cpf.js
  docs/{requisitos,der}.md
  db.js
  app.js
  clinica.sql
  seed.js
  .env.example
  .gitignore
  package.json
```

## Instalação
1. Instale Node.js e PostgreSQL.
2. Clone: `git clone https://github.com/astevanellisenai/clinica.git`
3. Execute `cd clinica && npm install`.
4. Crie no PostgreSQL o banco `clinica`.
5. Execute `psql -U postgres -d clinica -f clinica.sql` (cuidado: o script **apaga e recria tabelas**, use apenas em banco de teste).
6. Copie `.env.example` para `.env`; configure `DATABASE_URL`, uma `SESSION_SECRET` com 32+ caracteres e `CPF_ENCRYPTION_KEY` com exatamente 64 caracteres hexadecimais. Gere a chave com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
7. Execute `npm run seed` para cadastrar **3 tutores, 3 pets e 3 agendamentos** com CPF cifrado; `clinica.sql` já insere **3 usuários**.
8. Execute `npm start`; abra `http://localhost:3001/login`.

## Usuários para teste
`admin@clinica.local`, `ana@clinica.local` e `carlos@clinica.local`; senha inicial de todos: `Clinica@123`. Use apenas em ambiente didático.

## Arquivos de documentação
- [Requisitos funcionais](docs/requisitos.md)
- [DER](docs/der.md)
- [Script PostgreSQL](clinica.sql)
- [Dados iniciais adicionais](seed.js)

## Segurança
Senhas com hash bcrypt, CPF cifrado com AES-256-GCM, cookies HttpOnly e SameSite, proteção CSRF, SQL parametrizado e segredos fora do Git via .env. **Antes de produção**, configure armazenamento persistente de sessões, controle de acesso por funções, rate limiting, HTTPS, monitoramento e conformidade LGPD.

Projeto didático, inspirado no repositório Eventos.
