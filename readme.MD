expense-tracker-api/
├── src/
│ ├── config/
│ │ ├── database.js # conexión a Supabase/Postgres
│ │ └── env.js # carga y valida variables de entorno
│ │
│ ├── modules/
│ │ ├── auth/
│ │ │ ├── auth.routes.js
│ │ │ ├── auth.controller.js
│ │ │ ├── auth.service.js
│ │ │ └── auth.validation.js
│ │ │
│ │ ├── users/
│ │ │ ├── users.repository.js
│ │ │ └── users.model.js # si usas un query builder/ORM
│ │ │
│ │ └── expenses/
│ │ ├── expenses.routes.js
│ │ ├── expenses.controller.js
│ │ ├── expenses.service.js
│ │ ├── expenses.repository.js
│ │ └── expenses.validation.js
│ │
│ ├── middlewares/
│ │ ├── auth.middleware.js # verifica JWT
│ │ ├── error.middleware.js # manejo centralizado de errores
│ │ └── validate.middleware.js # ejecuta validaciones
│ │
│ ├── utils/
│ │ ├── jwt.util.js
│ │ ├── password.util.js # bcrypt hash/compare
│ │ ├── ApiError.js # clase de error custom
│ │ └── dateFilters.util.js # lógica de week/month/3months/custom
│ │
│ ├── app.js # configuración de Express (middlewares globales, rutas)
│ └── server.js # arranque del servidor (listen)
│
├── .env
├── .env.example
├── package.json
└── README.md

To-Do general — Expense Tracker API
✅ Completado
Diseño de base de datos
Esquema completo: users, categories, expenses en 3FN
Constraints (FK, UNIQUE, CHECK), índices compuestos (user_id + expense_date)
Decisión: sin RLS (autorización a nivel de aplicación)
SQL corrido en Supabase — funcionando
Estructura de carpetas (MVC + capas) creada
Servidor mínimo (app.js + server.js) — levantado y probado con /health
Config y conexión a DB
env.js — validación de variables requeridas, fail-fast uniforme con process.exit(1)
database.js — pool de pg, decisión de exponer solo query (sin pool como default export, ya que no hay necesidad de transacciones con el esquema actual)

🔲 Pendiente
Auth
users.repository.js (siguiente paso)
jwt.util.js — generación/verificación de JWT propio
password.util.js — hash/compare con bcrypt
auth.service.js — lógica de signup/login
auth.validation.js — validar email, password
auth.controller.js + auth.routes.js — POST /auth/signup, POST /auth/login
auth.middleware.js — verificar JWT en rutas protegidas
Expenses CRUD
expenses.repository.js, expenses.service.js, expenses.validation.js
expenses.controller.js + expenses.routes.js:
POST /expenses
GET /expenses (con filtros: week/month/3months/custom)
PUT /expenses/:id
DELETE /expenses/:id
dateFilters.util.js — lógica de los filtros de fecha
Manejo de errores centralizado
ApiError.js + error.middleware.js
Buenas prácticas API
Paginación en GET /expenses
Formato de respuesta consistente
Rate limiting (opcional)
Testing manual de todos los endpoints (Postman/Thunder Client)
