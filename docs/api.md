# AURELIA API

Base: `/api`

## Autenticação admin

Login:

```http
POST /api/admin/auth/login
Content-Type: application/json

{ "email": "admin@aurelia.example", "password": "..." }
```

Resposta define cookie `aurelia_session` (HttpOnly).

Endpoints admin exigem cookie válido.

## Públicos

### GET /health

```json
{ "status": "ok", "uptime": 123, "version": "1.0.0", "database": "ok" }
```

### GET /projects

Query: `category`, `featured`

```json
{ "data": [{ "id", "slug", "title", "category", "summary", "is_featured", "technologies" }] }
```

### GET /projects/:slug

```json
{ "data": { /* projeto completo + images */ } }
```

### GET /plans

```json
{ "data": [{ "slug", "name", "features": [...] }] }
```

### GET /faqs

```json
{ "data": [{ "question", "answer" }] }
```

### POST /contact

```json
{
  "name": "string",
  "email": "string",
  "message": "string",
  "company": "string?",
  "phone": "string?",
  "project_type": "string?",
  "budget": "string?",
  "website": "" 
}
```

Campo `website` é honeypot (deve ficar vazio).

Rate limit: 5 / 15 min por IP.

## Erros

```json
{
  "error": {
    "code": "UNAUTHORIZED | NOT_FOUND | VALIDATION_ERROR | RATE_LIMIT | ...",
    "message": "texto legível"
  }
}
```

Códigos HTTP: 400, 401, 403, 404, 409, 429, 500.
