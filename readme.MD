# Expense Tracker API

RESTful API for tracking personal expenses with custom user authentication (JWT access token + httpOnly refresh token cookie), built in Node.js with a layered MVC architecture.

## Features

- User signup and login with hashed passwords (bcrypt)
- Authentication via short-lived JWT access tokens + a refresh token delivered as an httpOnly cookie
- Refresh endpoint to renew the access token without re-authenticating
- `GET /auth/me` to fetch the current user from a valid access token (used to restore sessions on page reload)
- Full CRUD for expenses, protected by authentication and per-resource ownership validation
- Expense filtering by date range: past week, past month, last 3 months, or a custom range
- Paginated expense listing
- Input validation with Zod (body, query, and route params)
- Centralized error handling with a consistent response shape across the whole API
- CORS restricted to a whitelist of origins, with credentials support for cookies
- Security headers via Helmet

## Stack

- Runtime: Node.js + Express (ES Modules)
- Database: PostgreSQL (Supabase)
- Authentication: JWT (jsonwebtoken) + bcrypt
- Validation: Zod
- Security: Helmet, cors, cookie-parser

## Architecture

MVC architecture, separated into layers: routes → controllers → services → repositories. Repositories and services are implemented as classes with constructor-based dependency injection, favoring decoupling and testability. A single composition root (`container.js`) wires every dependency together, including cross-cutting values like cookie options.

```
expense-tracker-api/
├── src/
│   ├── config/
│   │   ├── env.js              # Fail-fast environment variable validation
│   │   ├── database.js          # Postgres connection pool (pg)
│   │   └── container.js         # Composition root — wires all dependencies
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.validation.js
│   │   ├── users/
│   │   │   └── users.repository.js
│   │   └── expenses/
│   │       ├── expenses.routes.js
│   │       ├── expenses.controller.js
│   │       ├── expenses.service.js
│   │       ├── expenses.repository.js
│   │       └── expenses.validation.js
│   ├── middlewares/
│   │   ├── auth.middleware.js   # JWT verification (Bearer token)
│   │   ├── validate.middleware.js # Body/query/params validation with Zod
│   │   ├── cors.middleware.js   # Origin whitelist + credentials
│   │   └── error.middleware.js  # Centralized error handling
│   ├── utils/
│   │   ├── jwt.util.js          # TokenService
│   │   ├── password.util.js     # PasswordHasher
│   │   ├── dateFilters.util.js  # Date range calculation for expense filters
│   │   └── ApiError.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .env                          # (gitignored)
├── package.json
└── package-lock.json
```

## Database Schema

Normalized design (3NF) with foreign keys and explicit indexes on columns used in frequent filters. Row Level Security was intentionally left off, since the API is the only client that talks to the database and authorization is enforced at the application layer.

```sql
-- users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- categories table (fixed catalog)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO categories (name) VALUES
    ('Groceries'), ('Leisure'), ('Electronics'),
    ('Utilities'), ('Clothing'), ('Health'), ('Others');

-- expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    description VARCHAR(255),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date DESC);
CREATE INDEX idx_expenses_user_category ON expenses(user_id, category_id);

-- Trigger to automatically update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

Design decisions:

- `users.id` and `expenses.id` are UUIDs to avoid exposing sequential identifiers.
- `amount` is `NUMERIC(12,2)`, never `FLOAT`, to avoid rounding errors with money.
- `expense_date` is separate from `created_at`: the user may log an expense from a previous day, while `created_at` records when the row was actually inserted (audit trail).
- `ON DELETE CASCADE` on `expenses.user_id`, so deleting a user cleans up their expenses automatically.
- `categories` is a separate table (not a string column on `expenses`) to keep the schema in 3NF and avoid typos in category names.
- The composite index `(user_id, expense_date DESC)` covers both "list all of a user's expenses" and every date-range filter, since they all reduce to the same `WHERE user_id = ? AND expense_date BETWEEN ? AND ?` shape.
- `category_id` existence is enforced only through the foreign key constraint (not duplicated in Zod), keeping "does this category exist" as a database responsibility.

## Authentication

- Access token: JWT signed with HS256, 15-minute TTL, payload `{ userId, email }`. Returned in the response body and expected on the `Authorization: Bearer <token>` header for protected routes.
- Refresh token: JWT signed with a separate secret, 7-day TTL, payload `{ userId }`. Delivered as an **httpOnly cookie** (`secure` in production, `sameSite: strict`) — never exposed to client-side JavaScript, and never included in any JSON response.
- `POST /auth/refresh` reads the refresh token from the cookie (not from the request body) and issues a new access token. No rotation is implemented — the same refresh token stays valid until its natural expiration.
- `GET /auth/me` returns the current user's data from a valid access token. Combined with `POST /auth/refresh`, this lets a frontend silently restore a session on page load: call `/auth/refresh` first (the cookie travels automatically), then `/auth/me` with the new access token.
- Login responses never distinguish "email not found" from "wrong password" (both return the same generic 401), to avoid leaking which emails are registered.
- CORS is restricted to an explicit origin whitelist with `credentials: true`, required for the browser to send/receive the httpOnly cookie across origins (e.g. a frontend on a different port during development).

## Installation

```bash
git clone <repo-url>
cd expense-tracker-api
npm install
cp .env.example .env
```

Fill in `.env` with your credentials:

```
PORT=3000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=
JWT_REFRESH_SECRET=
NODE_ENV=development
```

Generate strong secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run the SQL script from the section above in the Supabase SQL Editor to create the tables and seed the categories.

Update the allowed origins list in `src/middlewares/cors.middleware.js` if your frontend runs on a different port or domain.

## Usage

```bash
npm run dev
```

The server starts on http://localhost:3000 (or your configured port). Verify it's running with:

```
GET /health
```

## Endpoints

### Authentication

| Method | Route         | Description                                            | Auth required              |
| ------ | ------------- | ------------------------------------------------------ | -------------------------- |
| POST   | /auth/signup  | Registers a new user                                   | No                         |
| POST   | /auth/login   | Authenticates a user, sets the refresh token cookie    | No                         |
| POST   | /auth/refresh | Renews the access token using the refresh token cookie | No (requires valid cookie) |
| GET    | /auth/me      | Returns the current user                               | Yes                        |

POST /auth/signup

```json
{
  "name": "John Doe",
  "email": "john@doe.com",
  "password": "password123"
}
```

Response 201:

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@doe.com",
    "created_at": "..."
  }
}
```

POST /auth/login

```json
{
  "email": "john@doe.com",
  "password": "password123"
}
```

Response 200 (also sets an httpOnly `refreshToken` cookie):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15m",
  "user": { "id": "uuid", "name": "John Doe", "email": "john@doe.com" }
}
```

POST /auth/refresh

No request body — the refresh token is read from the `refreshToken` cookie.

Response 200:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15m"
}
```

GET /auth/me

Requires `Authorization: Bearer <accessToken>`.

Response 200:

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@doe.com",
    "created_at": "..."
  }
}
```

### Expenses

All routes require the `Authorization: Bearer <accessToken>` header.

| Method | Route         | Description                                                |
| ------ | ------------- | ---------------------------------------------------------- |
| POST   | /expenses     | Creates an expense                                         |
| GET    | /expenses     | Lists the user's expenses, filtered and paginated          |
| PUT    | /expenses/:id | Updates an expense (owner only), partial updates supported |
| DELETE | /expenses/:id | Deletes an expense (owner only)                            |

POST /expenses

```json
{
  "categoryId": 1,
  "amount": 25.5,
  "description": "Groceries run",
  "expenseDate": "2026-08-15"
}
```

`expenseDate` is optional — defaults to the current date if omitted.

Response 201:

```json
{
  "expense": {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": 1,
    "amount": "25.50",
    "description": "Groceries run",
    "expense_date": "2026-08-15T00:00:00.000Z",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

GET /expenses?filter=week

GET /expenses?filter=month

GET /expenses?filter=3months

GET /expenses?filter=custom&startDate=2026-08-01&endDate=2026-08-20

All filters accept `page` (default 1) and `limit` (default 20, max 100).

Response 200:

```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "category_id": 1,
      "amount": "25.50",
      "description": "Groceries run",
      "expense_date": "2026-08-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

PUT /expenses/:id

Partial updates are supported — only send the fields you want to change:

```json
{
  "amount": 30
}
```

DELETE /expenses/:id

Response 204, no body.

Common error codes:

| Code | Meaning                                                       |
| ---- | ------------------------------------------------------------- |
| 400  | Input validation error, or invalid category ID                |
| 401  | Not authenticated (token/cookie missing, invalid, or expired) |
| 404  | Resource not found, or belongs to a different user            |
| 409  | Conflict (e.g. email already registered)                      |

Note: 404 is returned both when an expense doesn't exist and when it belongs to a different user, without distinguishing between the two — the same anti-enumeration principle applied to login failures.

## Security

- Passwords hashed with bcrypt (10 salt rounds)
- Access and refresh tokens signed with separate secrets
- Refresh token delivered as an httpOnly cookie (`secure` in production, `sameSite: strict`) — inaccessible to client-side JavaScript, mitigating XSS-based token theft
- CORS restricted to an explicit origin whitelist; `credentials: true` required for cookies to work cross-origin, which also means `Access-Control-Allow-Origin: *` is never used
- Security headers via Helmet
- Sensitive data (`password_hash`) never included in API responses
- Every write to `expenses` is scoped to the authenticated user's ID at the query level (`WHERE id = ? AND user_id = ?`), not only in application logic — defense in depth against authorization bugs
- Category existence is enforced by a foreign key constraint at the database level
- Route params (expense IDs) are validated as well-formed UUIDs before hitting the database

## Frontend

A companion React (Vite) frontend consumes this API. It keeps the access token in memory only (never in `localStorage`), relies on the httpOnly cookie for silent session restoration on page load (`POST /auth/refresh` + `GET /auth/me`), and automatically retries a request once after a transparent token refresh if a call comes back `401`.
