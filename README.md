# 🐾 Clínica Veterinária

Sistema web para gerenciamento de **tutores, pets e agendamentos veterinários**, desenvolvido com **Node.js, Express, EJS e PostgreSQL**.

Este projeto foi criado para atividades práticas do curso **Técnico em Desenvolvimento de Sistemas — SENAI**. A estrutura e a organização das rotas e interfaces seguem o padrão do projeto [🎫 Conecta Eventos](https://github.com/astevanellisenai/eventos), adaptado ao cenário de uma clínica veterinária.

O sistema conta com uma **landing page pública**, identidade visual com logo próprio e uma **área administrativa protegida por login**, na qual usuários autorizados podem consultar, cadastrar e atualizar dados de tutores, seus animais e respectivos agendamentos.

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
- Quantidade total de tutores, pets e agendamentos, próximos atendimentos e resumo por situação.
- Botão para sair do sistema.

### 👥 Gerenciamento de tutores
- Cadastro de tutor com nome, e-mail, telefone e CPF.
- Listagem dos tutores cadastrados.
- Pesquisa por nome ou e-mail.
- Edição dos dados de um tutor existente.
- **CPF criptografado antes de ser salvo no PostgreSQL**, usando AES-256-GCM.

### 🐶 Gerenciamento de pets
- Cadastro de pets com nome, espécie, raça e fotografia (JPG, PNG ou WebP, até 3 MB).
- Associação obrigatória do pet a um tutor.
- Listagem com foto do animal e nome do tutor responsável.
- Edição do pet, sua fotografia e seu vínculo com o tutor.

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
- Três tutores, três pets e três agendamentos inseridos diretamente pelo `clinica.sql`.
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
| **multer** | Upload das fotos dos pets |
| **HTML e CSS** | Interfaces dos formulários e listagens |

---

## 📁 Estrutura do projeto

```text
clinica/
│
├── Public/
│   ├── css/
│   │   └── estilos.css
│   └── img/
│       ├── landing/             # Logo e ilustração da página pública
│       └── pets/                # Fotos enviadas pelos usuários
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
│   ├── landing/
│   │   └── index.ejs
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
├── .env                         # Configuração didática pronta
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

### Extensão pgcrypto

O PostgreSQL utiliza a extensão `pgcrypto` para disponibilizar as funções `crypt()` e `gen_salt()`, necessárias para gerar os hashes das senhas iniciais.

Antes de executar os comandos `INSERT INTO usuarios` separadamente no pgAdmin, execute no banco `clinica`:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

Para verificar a instalação:

```sql
SELECT crypt('1234', gen_salt('bf'));
```

**Observação:** o comando `CREATE EXTENSION IF NOT EXISTS pgcrypto;` já está no início do arquivo `clinica.sql`. Portanto, ao executar o arquivo completo, não é necessário instalá-la separadamente. Se estiver executando apenas os inserts manualmente no pgAdmin, crie a extensão primeiro.

### 5. Configuração do ambiente (.env)

Por ser um projeto **acadêmico**, o repositório já contém um arquivo `.env` de demonstração. Não é necessário criá-lo manualmente para o ambiente padrão da atividade.

```dotenv
PORT=3001
DATABASE_URL=postgres://postgres:admin@localhost:5432/clinica
SESSION_SECRET=SESISENAI
CPF_ENCRYPTION_KEY=9749886e57235857555b0653771e9a78d461e3904bf8fd08d67b2d22f465d95d

```

- **PORT:** porta HTTP do sistema.
- **DATABASE_URL:** conexão PostgreSQL local, usuário `postgres`, senha acadêmica `admin`, banco `clinica`.
- **SESSION_SECRET:** assinatura das sessões; para a atividade, utiliza `SESISENAI`. É um segredo curto, aceito somente no modo `development`.
- **CPF_ENCRYPTION_KEY:** chave exclusivamente didática correspondente aos CPFs fictícios já criptografados em `clinica.sql`.

Se a senha do seu PostgreSQL local for diferente de `admin`, altere a URL de conexão no `.env` local. Se houver caracteres especiais na senha, codifique-os corretamente na URL.

**Importante:** o arquivo `.env` foi publicado **intencionalmente apenas para uso acadêmico com dados fictícios**. Não utilize esse segredo, a senha do banco ou a chave de CPF em produção. Em aplicações reais, utilize segredos privados com alta entropia, não versionados no Git, e configure um armazenamento persistente de sessões. Este projeto foi preparado somente para execução local, em ambiente didático.

### 6. Dados de exemplo já incluídos no SQL

O arquivo **`clinica.sql` cria e popula todas as quatro tabelas**:

| Tabela | Quantidade inicial |
|---|---:|
| `usuarios` | 3 |
| `tutores` | 3 |
| `pets` | 3 |
| `agendamentos` | 3 |

Os CPFs fictícios dos tutores foram previamente criptografados em AES-256-GCM e estão inseridos no SQL em formato cifrado, compatível com a chave didática do `.env`.

### 7. Iniciar a aplicação

```bash
npm start
```

Acesse:

**http://localhost:3001/** — landing page pública. Após login, o sistema abre **http://localhost:3001/dashboard**.

O comando `npm start` executa `node app.js`. Durante o desenvolvimento, utilize `npm run dev` para iniciar com Nodemon.

---

## 🔑 Usuários iniciais de teste

O script `clinica.sql` cria estes usuários:

| Nome | E-mail | Senha inicial | Situação |
|---|---|---|---|
| Administrador | `admin@clinica` | `1234` | Ativo |
| Veterinária Ana | `ana@clinica` | `1234` | Ativo |
| Recepção Carlos | `carlos@clinica` | `1234` | Ativo |

Essas credenciais são **exclusivamente didáticas**. Não devem ser mantidas em ambientes publicados.

---

## 🧭 Principais rotas

| Método | Rota | Descrição | Exige login |
|---|---|---|---|
| GET | `/` | Landing page pública; se autenticado, abre o dashboard | Não |
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
| `imagem_url` | VARCHAR(255) | Nome da foto armazenada em `Public/img/pets` |
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
- Em produção, a chave deve ser armazenada de forma protegida e não pode ser enviada ao repositório. A chave didática do `.env` é pública e deve ser usada apenas para dados fictícios.

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


## 🎨 Identidade visual e estrutura de navegação

A apresentação visual usa como referência o projeto Eventos:
- Página pública em `/`, com logo, banner, apresentação, serviços e acesso administrativo.
- Usuários já autenticados que abrem `/` são redirecionados para `/dashboard`.
- Após o login, o usuário sempre é levado ao `/dashboard`.
- Cabeçalho administrativo em **duas linhas**: logo + saudação + Sair acima; Dashboard, Tutores, Pets e Agendamentos abaixo.
- Logo em `Public/img/landing/logo.svg`; ilustração em `Public/img/landing/hero.svg`.
- O formulário de pets aceita fotografia opcional de até 3 MB (JPG, PNG, WebP), com prévia antes de salvar.

**Atenção:** atualizar o código pelo Git não modifica o PostgreSQL. Para um banco novo, execute apenas `clinica.sql`, que contém todas as tabelas e os registros de exemplo. Não execute esse script em um banco que contenha dados que precisam ser preservados.


## CRUD de usuários e interface administrativa

O painel agora utiliza barra lateral roxa, cartões de indicadores, saudação no topo e menu lateral com **Dashboard, Tutores, Pets, Agendamentos e Usuários**. As listagens possuem botões **Editar** e **Excluir**; exclusões utilizam POST com token CSRF e confirmação. A exclusão de tutores ou pets com registros relacionados é bloqueada pelas chaves estrangeiras do banco. O módulo de usuários permite cadastro, edição de dados e senha com bcrypt, ativação/desativação e exclusão (exceto da própria conta). Todas as rotas `/usuarios` também exigem sessão autenticada. Observação: ainda não há papéis/perfis administrativos diferenciados.


## Listagens e indicadores

Os quatro CRUDs utilizam pesquisa, ordenação por lista permitida e paginação no PostgreSQL com **5 registros por página**, como no projeto Eventos. Pet: filtro de espécie. Agendamento: situação e mês. Usuários: ativo/inativo. Os filtros são preservados entre as páginas. A agenda usa cards com fotografia; o dashboard exibe gráfico de status, espécies e evolução dos últimos seis meses, sem dependência externa de gráficos.
