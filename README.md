# 🐾 Clínica Veterinária

Sistema web para gerenciamento de **tutores, pets e agendamentos veterinários**, desenvolvido com **Node.js, Express, EJS e PostgreSQL**.

Este projeto foi criado para atividades práticas do curso **Técnico em Desenvolvimento de Sistemas — SENAI**. A estrutura e a organização das rotas e interfaces seguem o padrão do projeto [🎫 Conecta Eventos](https://github.com/astevanellisenai/eventos), adaptado ao cenário de uma clínica veterinária.

O sistema possui uma **área administrativa protegida por login**, na qual usuários autorizados podem consultar, cadastrar e atualizar dados de tutores, seus animais e respectivos agendamentos.

---

## 📌 Funcionalidades

### 🔐 Autenticação e controle de acesso
- Login por e-mail e senha.
- Validação de credenciais e exibição de mensagem quando a autenticação falhar.
- Somente usuários com `situacao = 1` podem entrar.
- Controle de sessão com `express-session`.
- Cookie de sessão configurado com `HttpOnly` e `SameSite=Lax`.
- Expiração do cookie após **30 minutos de inatividade**.
- Proteção das rotas administrativas e logout.
- Regeneração da sessão no login.
- Formulários POST com token de proteção CSRF.

### 🏠 Painel principal
- Identificação do usuário logado pelo nome.
- Menu para navegação entre os módulos.
- Quantidade total de tutores, pets e agendamentos.
- Botão para sair do sistema.

### 👥 Gerenciamento de tutores
- Cadastro de tutor com nome, e-mail, telefone e CPF.
- Listagem dos tutores cadastrados.
- Pesquisa por nome ou e-mail.
- Edição dos dados de um tutor existente.
- **CPF criptografado antes de ser salvo no PostgreSQL**, usando AES-256-GCM.

### 🐶 Gerenciamento de pets
- Cadastro de pets com nome, espécie e raça.
- Associação obrigatória do pet a um tutor.
- Listagem mostrando o nome do tutor responsável.
- Edição do pet e de seu vínculo com o tutor.

### 📅 Gerenciamento de agendamentos
- Cadastro de consultas/agendamentos de pets.
- Associação de cada agendamento a um pet.
- Exibição do nome e das informações do tutor, obtidas pelo vínculo com o pet.
- Listagem ordenada por mês e data do atendimento.
- Edição da data e horário, descrição, pet e situação.
- Situações aceitas: `agendado`, `concluido` e `cancelado`.

### 🗄️ Banco de dados
- Quatro tabelas relacionadas: `usuarios`, `tutores`, `pets` e `agendamentos`.
- Chaves primárias, chaves estrangeiras, campos obrigatórios e restrições.
- Três usuários de exemplo criados pelo SQL.
- Três tutores, três pets e três agendamentos inseridos diretamente pelo `clinica.sql` (sem `seed.js`).
- Senhas de usuários armazenadas com hash bcrypt.

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| **Node.js** | Execução do backend JavaScript |
| **Express 5** | Servidor HTTP e rotas |
| **EJS** | Renderização das páginas HTML |
| **PostgreSQL** | Banco de dados relacional |
| **pg** | Comunicação entre Node.js e PostgreSQL |
| **express-session** | Sessões autenticadas |
| **bcryptjs** | Verificação de senhas com hash |
| **crypto (Node.js)** | Criptografia autenticada dos CPFs |
| **dotenv** | Configurações locais via variáveis de ambiente |
| **Nodemon** | Reinício automático em desenvolvimento |
| **HTML e CSS** | Interfaces dos formulários e listagens |

---

## 📁 Estrutura do projeto

```text
clinica/
│
├── Public/
│   └── css/
│       └── estilos.css
│
├── Routes/
│   ├── tutoresRoutes.js
│   ├── petsRoutes.js
│   └── agendamentosRoutes.js
│
├── lib/
│   └── cpf.js                    # Criptografia/descriptografia de CPF
│
├── views/
│   ├── includes/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── tutores/
│   │   ├── index.ejs
│   │   └── form.ejs
│   ├── pets/
│   │   ├── index.ejs
│   │   └── form.ejs
│   ├── agendamentos/
│   │   ├── index.ejs
│   │   └── form.ejs
│   ├── login.ejs
│   └── dashboard.ejs
│
├── docs/
│   ├── requisitos.md
│   ├── der.md
│   └── prova_clinica.pdf
│
├── app.js                        # Aplicação e autenticação
├── db.js                         # Conexão PostgreSQL
├── clinica.sql                   # Estrutura + dados de todas as tabelas
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Pré-requisitos

Antes de iniciar, instale:
- [Node.js](https://nodejs.org/) com npm.
- [PostgreSQL](https://www.postgresql.org/).
- Git (para clonar o projeto).
- Um editor de código, como VS Code (opcional).

Verifique o ambiente:

```bash
node -v
npm -v
psql --version
```

O comando `psql` pode exigir que a pasta `bin` do PostgreSQL esteja configurada no `PATH` do Windows. Também é possível executar o SQL pelo pgAdmin.

---

## 🚀 Instalação e configuração

### 1. Clonar o repositório

```bash
git clone https://github.com/astevanellisenai/clinica.git
cd clinica
```

### 2. Instalar as dependências

```bash
npm install
```

Para desenvolvimento com reinício automático, o projeto utiliza Nodemon:

```bash
npm run dev
```

### 3. Criar o banco PostgreSQL

Crie um banco chamado:

```text
clinica
```

No terminal PostgreSQL, por exemplo:

```sql
CREATE DATABASE clinica;
```

### 4. Executar o script de criação das tabelas

Depois de criar o banco, execute:

```bash
psql -U postgres -d clinica -f clinica.sql
```

**Atenção:** o arquivo `clinica.sql` utiliza `DROP TABLE` e **apaga tabelas existentes** antes de recriá-las. Execute apenas em um banco de testes, sem informações que precisem ser preservadas.

A extensão `pgcrypto` é utilizada para gerar o hash das senhas iniciais de demonstração.

### 5. Configurar as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`.

No PowerShell do Windows:

```powershell
Copy-Item .env.example .env
```

Edite o novo arquivo para preencher os valores do seu ambiente:

```dotenv
PORT=3001
DATABASE_URL=postgres://postgres:SUA_SENHA@localhost:5432/clinica
SESSION_SECRET=SUBSTITUA_POR_UM_SEGREDO_COM_PELO_MENOS_32_CARACTERES
CPF_ENCRYPTION_KEY=9749886e57235857555b0653771e9a78d461e3904bf8fd08d67b2d22f465d95d
NODE_ENV=development
```

**Chave de CPF dos dados fictícios:** o arquivo `.env.example` já contém uma chave didática, utilizada para cifrar os CPFs de teste incluídos no `clinica.sql`. Copie-a sem modificar se quiser abrir os registros de exemplo.

**Atenção:** essa chave é pública e serve **somente para testes com dados fictícios**. Para cadastrar dados pessoais reais, gere outra chave segura, remova os dados fictícios e recrie o banco ou realize uma migração controlada de criptografia. Nunca publique uma chave de produção no GitHub.

Para gerar sua própria chave:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Importante:** não altere ou perca a chave de CPF depois de cadastrar dados: sem a chave correta, os CPFs existentes não poderão ser descriptografados.

Se a senha PostgreSQL tiver caracteres especiais, codifique-os corretamente na URL de conexão.

### 6. Dados de exemplo já incluídos no SQL

Não é necessário executar `npm run seed` nem nenhum script JavaScript para popular o banco.

O arquivo **`clinica.sql` cria e popula todas as quatro tabelas**:

| Tabela | Quantidade inicial |
|---|---:|
| `usuarios` | 3 |
| `tutores` | 3 |
| `pets` | 3 |
| `agendamentos` | 3 |

Os CPFs fictícios dos tutores foram previamente criptografados em AES-256-GCM e estão inseridos no SQL em formato cifrado, compatível com a chave didática do `.env.example`.

### 7. Iniciar a aplicação

```bash
npm start
```

Acesse:

**http://localhost:3001/login**

O comando `npm start` executa `node app.js`. Durante o desenvolvimento, utilize `npm run dev` para iniciar com Nodemon.

---

## 🔑 Usuários iniciais de teste

O script `clinica.sql` cria estes usuários:

| Nome | E-mail | Senha inicial | Situação |
|---|---|---|---|
| Administrador | `admin@clinica` | `Clinica@123` | Ativo |
| Veterinária Ana | `ana@clinica` | `Clinica@123` | Ativo |
| Recepção Carlos | `carlos@clinica` | `Clinica@123` | Ativo |

Essas credenciais são **exclusivamente didáticas**. Não devem ser mantidas em ambientes publicados.

---

## 🧭 Principais rotas

| Método | Rota | Descrição | Exige login |
|---|---|---|---|
| GET | `/` | Redireciona para login ou painel | Não |
| GET | `/login` | Exibe a página de login | Não |
| POST | `/login` | Valida e autentica o usuário | Não |
| POST | `/logout` | Encerra a sessão | Sim |
| GET | `/dashboard` | Painel principal | Sim |
| GET | `/tutores` | Listagem e pesquisa de tutores | Sim |
| GET | `/tutores/novo` | Formulário para cadastrar tutor | Sim |
| POST | `/tutores/novo` | Salva o tutor | Sim |
| GET | `/tutores/editar/:id` | Formulário de edição de tutor | Sim |
| POST | `/tutores/editar/:id` | Atualiza o tutor | Sim |
| GET | `/pets` | Listagem dos pets | Sim |
| GET/POST | `/pets/novo` | Formulário e cadastro de pet | Sim |
| GET/POST | `/pets/editar/:id` | Edição de pet | Sim |
| GET | `/agendamentos` | Listagem por mês | Sim |
| GET/POST | `/agendamentos/novo` | Formulário e cadastro | Sim |
| GET/POST | `/agendamentos/editar/:id` | Atualização de agendamento | Sim |

O parâmetro de pesquisa dos tutores é `busca`:

```text
http://localhost:3001/tutores?busca=Maria
```

---

## 🗄️ Estrutura do banco de dados

### Tabela `usuarios`
Armazena os responsáveis pelo acesso ao sistema.

| Campo | Tipo | Finalidade |
|---|---|---|
| `id` | SERIAL | Chave primária |
| `nome` | VARCHAR(120) | Nome do usuário |
| `email` | VARCHAR(150) | E-mail único |
| `senha_hash` | TEXT | Hash da senha |
| `situacao` | SMALLINT | 1 = ativo; 0 = inativo |

### Tabela `tutores`
Armazena os responsáveis pelos animais.

| Campo | Tipo | Finalidade |
|---|---|---|
| `id` | SERIAL | Chave primária |
| `nome` | VARCHAR(120) | Nome do tutor |
| `email` | VARCHAR(150) | E-mail único |
| `telefone` | VARCHAR(20) | Contato |
| `cpf_criptografado` | TEXT | CPF cifrado com AES-256-GCM |

### Tabela `pets`
Armazena os animais e seu tutor.

| Campo | Tipo | Finalidade |
|---|---|---|
| `id` | SERIAL | Chave primária |
| `nome` | VARCHAR(100) | Nome do animal |
| `especie` | VARCHAR(70) | Espécie |
| `raca` | VARCHAR(100) | Raça |
| `tutor_id` | INTEGER | Chave estrangeira para `tutores.id` |

### Tabela `agendamentos`
Armazena os horários previstos para atendimento.

| Campo | Tipo | Finalidade |
|---|---|---|
| `id` | SERIAL | Chave primária |
| `pet_id` | INTEGER | Chave estrangeira para `pets.id` |
| `data_agendamento` | TIMESTAMP | Data e horário |
| `descricao` | TEXT | Motivo do atendimento |
| `status` | VARCHAR(20) | agendado, concluido ou cancelado |

### Relacionamentos

```text
TUTORES (1)
    │
    └──── (N) PETS
                 │
                 └──── (N) AGENDAMENTOS

USUARIOS → Autenticação e acesso ao sistema
```

- Um tutor pode possuir vários pets.
- Cada pet pertence a um tutor.
- Um pet pode possuir vários agendamentos.
- Cada agendamento está associado a um único pet.
- Os usuários do sistema são independentes dos tutores cadastrados.

O diagrama completo também está disponível em [docs/der.md](docs/der.md), usando Mermaid para visualização diretamente no GitHub.

---

## 🔒 Autenticação e segurança dos dados

### Como funciona o login

1. O usuário informa e-mail e senha em `/login`.
2. O servidor consulta a tabela `usuarios`, verificando se a conta está ativa.
3. O `bcryptjs` compara a senha fornecida com o hash armazenado.
4. Quando a autenticação é válida, uma nova sessão é criada.
5. A sessão contém identificador, nome e e-mail do usuário.
6. As rotas administrativas verificam a existência dessa sessão.
7. O logout encerra a sessão.

**Não é utilizado JWT** neste projeto. A autenticação é baseada em cookie e sessão de servidor.

### Proteção dos CPFs

O arquivo `lib/cpf.js` utiliza criptografia autenticada **AES-256-GCM**, com chave definida em `CPF_ENCRYPTION_KEY`.

- A aplicação criptografa os 11 dígitos antes de novos cadastros; os exemplos do SQL já estão criptografados.
- O banco recebe os dados cifrados, não o CPF em texto puro.
- A listagem administrativa descriptografa os CPFs para exibição aos usuários autenticados.
- Em produção, a chave deve ser armazenada de forma protegida e não pode ser enviada ao repositório. A chave didática do `.env.example` é pública e deve ser usada apenas para dados fictícios.

**Observação sobre LGPD:** criptografar o CPF é um controle importante, mas não basta, por si só, para garantir conformidade com toda a LGPD.

### Cuidados antes de usar em produção

O projeto é uma base **didática**. Antes de disponibilizá-lo para uma clínica real, recomenda-se:
- Configurar HTTPS e infraestrutura de proxy corretamente.
- Utilizar um armazenamento persistente de sessões em vez do `MemoryStore` padrão.
- Implementar limitação de tentativas de login e política de bloqueio.
- Separar permissões de administrador, recepcionista e veterinário.
- Implantar auditoria, backups, gestão de chaves e políticas de retenção.
- Restringir a exibição do CPF conforme a necessidade de cada perfil.
- Validar regras de negócio, entradas e mensagens de erro para uso real.
- Realizar testes automatizados e revisão de segurança.

---

## 📚 Documentação da atividade prática

| Arquivo | Conteúdo |
|---|---|
| [docs/requisitos.md](docs/requisitos.md) | Objetivo, requisitos e regras de negócio |
| [docs/der.md](docs/der.md) | Diagrama entidade-relacionamento |
| [clinica.sql](clinica.sql) | Estrutura PostgreSQL e dados de teste para todas as tabelas |
| [docs/prova_clinica.pdf](docs/prova_clinica.pdf) | Versão textual de referência ao enunciado da prova |

**Nota:** `docs/prova_clinica.pdf` é uma versão textual de referência criada para o projeto; não é uma reprodução visual integral do PDF original fornecido na atividade.

---

## 🧪 Roteiro de testes manuais

Após executar a instalação, confira o seguinte fluxo:

1. Acesse `/dashboard` sem estar autenticado e confirme o redirecionamento para `/login`.
2. Tente fazer login com senha incorreta; o sistema deve apresentar uma mensagem de erro.
3. Entre com `admin@clinica` e a senha didática.
4. Confira o nome do usuário e as contagens no painel.
5. Acesse `/tutores`, pesquise um nome e edite o registro.
6. Cadastre um pet vinculando-o a um tutor.
7. Cadastre um agendamento, confira os dados de pet/tutor e depois altere sua data.
8. Clique em **Sair** e confirme que o painel exige uma nova autenticação.

Este roteiro permite conferir as funcionalidades principais, mas **não substitui testes automatizados nem uma validação completa do sistema**.

---

## 📦 Comandos úteis

```bash
npm install        # Instala dependências
npm start          # Executa o servidor
npm run dev        # Executa com Nodemon
```

---

## 👨‍💻 Finalidade educacional

O projeto permite praticar os conceitos de **Backend, Node.js, Express, EJS, CRUD, autenticação, gerenciamento de sessões, criptografia, SQL, PostgreSQL, chaves primárias e estrangeiras, relacionamentos e documentação técnica**.

Desenvolvido como referência de atividade prática para o curso **Técnico em Desenvolvimento de Sistemas — SENAI**, inspirado na arquitetura do projeto [Conecta Eventos](https://github.com/astevanellisenai/eventos).
