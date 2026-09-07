# AURELIA

**Tecnologia que transforma complexidade em vantagem.**

Plataforma web institucional premium com portfólio dinâmico, planos, formulário de leads e painel administrativo.

Plataforma completa: frontend HTML/CSS/JS, backend Node.js + Express, PostgreSQL, autenticação, SEO e segurança.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | HTML5, CSS3, JavaScript ES6+ |
| Backend | Node.js, Express.js |
| Banco | PostgreSQL (Supabase compatível) |
| Auth | Sessões com cookie HttpOnly + hash bcrypt |

## Estrutura

```
aurelia/
├── frontend/          # Site público + admin
├── backend/src/       # API Express
├── database/          # Migrations e seeds
├── docs/              # Documentação API
├── tests/
├── .env.example
└── README.md
```

## Requisitos

- Node.js 18+
- PostgreSQL 14+ (ou Supabase)

## Instalação

```bash
cp .env.example .env
# Edite .env com DATABASE_URL e SESSION_SECRET

npm install

# Migrations
npm run migrate

# Seed (admin, projetos, planos, FAQ)
npm run seed

# Desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

### Admin

- URL: http://localhost:3000/admin/login.html
- Credenciais: definidas em `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- Padrão no seed: `admin@aurelia.com.br` / `ChangeMe123!`

## API pública

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Health check |
| GET | `/api/projects` | Lista projetos (`?category=&featured=`) |
| GET | `/api/projects/:slug` | Detalhe do projeto |
| GET | `/api/plans` | Planos ativos |
| GET | `/api/faqs` | FAQ público |
| POST | `/api/contact` | Envio de lead |

## API admin

Requer autenticação (cookie de sessão).

| Método | Endpoint |
|--------|----------|
| POST | `/api/admin/auth/login` |
| POST | `/api/admin/auth/logout` |
| GET | `/api/admin/auth/me` |
| GET | `/api/admin/dashboard` |
| GET/PATCH | `/api/admin/contacts` |
| CRUD | `/api/admin/projects` |
| CRUD | `/api/admin/plans` |
| CRUD | `/api/admin/faqs` |
| GET/PUT | `/api/admin/settings` |

Documentação detalhada: [docs/api.md](docs/api.md)

## Segurança

- Helmet, CORS configurável, rate limiting
- Senhas com bcrypt (cost 12)
- Sessões com token hasheado, cookie HttpOnly / Secure / SameSite
- Validação e sanitização de inputs
- Honeypot no formulário de contato
- Audit log de ações administrativas
- Roles: `admin`, `editor`

## SEO

- Meta tags, Open Graph, Twitter Card
- JSON-LD Organization / WebSite
- `robots.txt`, `sitemap.xml`, `llms.txt`
- `security.txt` em `/.well-known/`
- HTML semântico, canonical por página

## Deploy

**Frontend + Backend (recomendado juntos):** Railway, Render, Fly.io ou VPS.

**Banco:** Supabase ou PostgreSQL gerenciado.

1. Configure `NODE_ENV=production`
2. Defina `DATABASE_URL`, `SESSION_SECRET`, `CORS_ORIGIN`, `SITE_URL`
3. Rode `npm run migrate` e `npm run seed`
4. `npm start`

O Express serve o frontend estático e a API no mesmo processo.

## Testes

```bash
npm test
```

## Licença

AURELIA — plataforma institucional e operacional.
