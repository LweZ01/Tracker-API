## To-Do general — Expense Tracker API

✅ Completado

## Base de datos

## Esquema completo (users, categories, expenses) en 3FN, con constraints, índices compuestos, sin RLS

## SQL corrido en Supabase — funcionando

## Infraestructura base

## Estructura de carpetas (MVC + capas) creada

## app.js + server.js — servidor funcionando, script dev con node --watch

## env.js — validación de variables, fail-fast uniforme

## database.js — pool de pg, expone solo query

## Módulo de Auth — 100% completo y probado

## UserRepository (createUser, findUserByEmail, findUserById)

## PasswordHasher (hash/compare con bcrypt)

## TokenService (jsonwebtoken — access 15m, refresh 7d)

## ApiError (clase base de errores operacionales)

## AuthService (signup, login — con protección anti-enumeración)

## AuthController + auth.routes.js

## auth.validation.js (zod) + validate.middleware.js

## error.middleware.js (formato de error unificado en toda la API)

## auth.middleware.js (protección JWT de rutas, usa ApiError)

## container.js (composition root) — incluye authMiddleware listo para usar

## Probado end-to-end: signup, email duplicado, validación, login exitoso, credenciales inválidas — todo funcionando

🔲 Pendiente

## Módulo de Expenses

expenses.repository.js (clase, mismo patrón que UserRepository)
CRUD: create, findById, findByUserId (con filtros de fecha), update, delete
Scoped siempre a user_id del JWT — nunca confiar en id del body/params
expenses.validation.js (zod: amount > 0, categoría válida, fechas, etc.)
expenses.service.js
Lógica de filtros: past week / past month / last 3 months / custom range
Verificar que el expense pertenece al usuario antes de update/delete
expenses.controller.js
POST /expenses
GET /expenses (con query params de filtro)
PUT /expenses/:id
DELETE /expenses/:id
expenses.routes.js — todas las rutas protegidas con authMiddleware
dateFilters.util.js — lógica reusable para calcular rangos de fecha (week/month/3months)
Actualizar container.js con las nuevas dependencias de expenses
Montar /expenses en app.js

Buenas prácticas finales

Paginación en GET /expenses
Testing manual completo de expenses (CRUD + cada filtro)
