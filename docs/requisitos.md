# Documentação — Clínica Veterinária

## Objetivo
Informatizar o gerenciamento de tutores, pets e agendamentos, protegendo dados de CPF e acesso aos cadastros.

## Requisitos funcionais
- RF01: login de usuário ativo e mensagem para autenticação inválida.
- RF02: sessão autenticada com expiração (30 minutos sem atividade).
- RF03: funcionalidade principal com nome do usuário, menus e logout.
- RF04: cadastrar, consultar, buscar (nome/e-mail) e editar tutores.
- RF05: CPF de tutores armazenado de forma criptografada.
- RF06: cadastrar, listar e editar pets com associação obrigatória a tutor.
- RF07: cadastrar e listar agendamentos por mês, com dados do pet e tutor.
- RF08: alterar a data de um agendamento e salvar no banco.
- RF09: ao menos três registros iniciais em cada tabela.

## Regras e segurança
- Banco PostgreSQL: PK, FK, UNIQUE e CHECK.
- CPF criptografado AES-256-GCM com chave em variável de ambiente, fora do Git.
- Senhas com hash bcrypt; SQL parametrizado; proteção CSRF e cookie HttpOnly.
- O arquivo clinica.sql prepara estrutura e inclui 3 usuários, 3 tutores, 3 pets e 3 agendamentos; os CPFs fictícios são pré-criptografados e usam a chave didática de .env.example.

## Limitações e melhorias para produção
Armazenamento persistente de sessões, rate limiting no login, HTTPS, controle por perfis, auditoria e política de retenção LGPD.
