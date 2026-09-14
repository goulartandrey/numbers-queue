# Sistema de Senhas de Atendimento

Sistema de gerenciamento de fila de atendimento (emissão e chamada de senhas), com atualização em tempo real via WebSocket. Ideal para recepções, clínicas, bancos e afins, onde o cliente retira uma senha (normal ou prioritária), acompanha a chamada em um painel público e o operador controla a fila.

## Funcionalidades

- **Emissão de senha**: o cliente informa nome e CPF e escolhe o tipo de atendimento (normal ou prioritário), recebendo uma senha no formato `N001` / `P001`.
- **Painel de atendimento**: tela pública que exibe a senha atual chamada e o histórico das últimas chamadas, atualizada em tempo real.
- **Painel do operador**: lista as senhas pendentes e permite chamar a próxima senha da fila.
- **Reset de contador**: zera a numeração de um tipo de senha, expirando as pendentes/chamadas.
- **Autenticação**: login de operadores via usuário e senha, com token JWT protegendo as rotas administrativas.

## Arquitetura

O projeto é dividido em duas aplicações:

```
projeto-numbers/
├── back/     # API (NestJS + Prisma + PostgreSQL + Socket.IO)
└── front/    # Interface (React + Vite + TypeScript + Tailwind)
```

### Backend (`back/`)

- **Framework**: [NestJS](https://nestjs.com/)
- **Banco de dados**: PostgreSQL, via [Prisma ORM](https://www.prisma.io/)
- **Tempo real**: Socket.IO (namespace `/queue`)
- **Autenticação**: JWT (`@nestjs/jwt`) + hashing de senha com bcrypt
- **Validação**: `class-validator` / `class-transformer`

Principais módulos:

- `numbers/` — geração de senhas, chamada da próxima senha, reset de contador e o gateway de WebSocket
- `users/` — CRUD de operadores/usuários
- `auth/` — login e guarda de autenticação (`AuthTokenGuard`)
- `database/` — serviço do Prisma

Modelo de dados (`schema.prisma`):

- `User` — operadores do sistema
- `QueueNumber` — cada senha emitida (nome, CPF, tipo, status: `WAITING` / `CALLED` / `EXPIRED`)
- `QueueCounters` — contador incremental por tipo de senha (`normal` / `priority`)

### Frontend (`front/`)

- **Framework**: React + TypeScript, via [Vite](https://vitejs.dev/)
- **Estilo**: Tailwind CSS
- **Comunicação**: Axios (REST) + `socket.io-client` (tempo real)

Rotas:
| Rota | Página | Descrição |
|---|---|---|
| `/` | `GenerateNumber` | Formulário para o cliente retirar a senha |
| `/panel` | `Panel` | Painel público com a senha atual e últimas chamadas |
| `/operator` | `Operator` | Painel do operador para chamar a próxima senha |

## Endpoints da API

| Método   | Rota                     | Descrição                                   | Autenticação |
| -------- | ------------------------ | ------------------------------------------- | ------------ |
| `POST`   | `/numbers`               | Gera uma nova senha                         | JWT          |
| `POST`   | `/numbers/reset`         | Reseta o contador de um tipo de senha       | JWT          |
| `POST`   | `/numbers/call-next/:id` | Chama a próxima senha da fila               | JWT          |
| `POST`   | `/auth/login`            | Autentica um operador e retorna o token JWT | —            |
| `POST`   | `/users`                 | Cria um usuário/operador                    | —            |
| `GET`    | `/users`                 | Lista usuários                              | —            |
| `GET`    | `/users/:username`       | Busca usuário por username                  | —            |
| `PATCH`  | `/users/:id`             | Atualiza um usuário                         | —            |
| `DELETE` | `/users/:id`             | Remove um usuário                           | —            |

### Eventos WebSocket (`namespace /queue`)

| Evento                | Direção            | Descrição                          |
| --------------------- | ------------------ | ---------------------------------- |
| `queue:state`         | servidor → cliente | Senha atual + últimas chamadas     |
| `queue:pending-list`  | servidor → cliente | Lista de senhas aguardando chamada |
| `queue:new-pending`   | servidor → cliente | Nova senha emitida                 |
| `queue:number-called` | servidor → cliente | Uma senha foi chamada              |

## Pré-requisitos

- Node.js 18+
- PostgreSQL
- npm ou yarn

## Como rodar o projeto

### 1. Banco de dados (Docker)

O projeto inclui um `docker-compose.yml` para subir o PostgreSQL localmente.

Crie um arquivo `.env` na raiz do projeto (mesma pasta do `docker-compose.yml`) com:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=root
POSTGRES_DB=queue_db
SECRET_KEY='sua chave'
```

Suba o container:

```bash
docker compose up -d
```

O banco fica disponível em `localhost:5432`

### 2. Backend

```bash
cd back
npm install
```

Rode as migrations e o seed (cria os contadores iniciais de senha normal/prioritária):

```bash
npx prisma migrate dev
npx prisma db seed
```

Inicie a API:

```bash
npm run dev
```

A API sobe em `http://localhost:3333`.

### 3. Frontend

```bash
cd front
npm install
```

Opcionalmente, crie um `.env` na pasta `front/` para apontar o socket para outro host:

```env
VITE_SOCKET_URL=http://localhost:3333
```

Inicie a aplicação:

```bash
npm run dev
```

Acesse:

- `http://localhost:5173/` — retirar senha
- `http://localhost:5173/panel` — painel público
- `http://localhost:5173/operator` — painel do operador

## Estrutura de pastas

```
back/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
└── src/
    ├── auth/
    ├── users/
    ├── numbers/
    ├── database/
    └── main.ts

front/
└── src/
    ├── pages/
    │   ├── GenerateNumber/
    │   ├── Panel/
    │   └── Operator/
    ├── services/
    │   └── api.ts
    ├── types/
    └── routes.tsx
```

## Possíveis melhorias futuras

- Proteger as rotas de `users` com autenticação
- Tela de login no frontend para o painel do operador
- Testes automatizados (unitários e e2e)
- Deploy com Docker / docker-compose (API + PostgreSQL)
