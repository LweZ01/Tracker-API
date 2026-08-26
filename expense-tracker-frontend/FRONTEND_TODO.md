# Frontend To-Do — Expense Tracker

React + Vite. Consume la Expense Tracker API (ver `README.md` del backend). Alcance completo: login, signup, CRUD de expenses, filtros de fecha, paginación.

Decisiones de arquitectura ya tomadas (no reabrir sin razón):
- Access token en memoria (variable de módulo en `services/api.js`), nunca en `localStorage`.
- Refresh token: httpOnly cookie manejada enteramente por el backend — el frontend nunca la lee ni la toca directamente.
- Sesión restaurada al montar la app vía `POST /auth/refresh` (usa la cookie) + `GET /auth/me` (usa el access token nuevo).
- `apiFetch` reintenta automáticamente una vez ante `401`, usando el refresh, antes de rendirse.
- `signup` en el frontend hace login automático después de crear la cuenta, porque `POST /auth/signup` no devuelve un access token.

---

## ✅ Completado

### `src/services/api.js`
Cliente HTTP centralizado. Todo el resto del frontend pasa por acá — ningún otro archivo debería llamar `fetch` directo salvo este.
- `getAccessToken()` / `setAccessToken(token)` — estado en memoria, variable de módulo.
- `apiFetch(endpoint, options, isRetry)` — arma la URL completa, agrega `credentials: 'include'` siempre, agrega `Authorization: Bearer <token>` si hay token, agrega `Content-Type: application/json` si hay body. En `401` (y `!isRetry`) intenta `refreshAccessToken()` y reintenta la request original una sola vez.
- `refreshAccessToken()` (interna, no exportada) — llama `POST /auth/refresh`, guarda el token nuevo si funciona, limpia el token si falla.
- Sin `try/catch` innecesarios (limpio para `no-useless-catch` de ESLint).

### `src/services/authService.js`
- `signup({ name, email, password })` → `POST /auth/signup`
- `login({ email, password })` → `POST /auth/login`, llama `setAccessToken(...)` internamente tras éxito
- `logout()` → solo limpia el access token en memoria (**no** hay endpoint `/auth/logout` en el backend que invalide la cookie — decisión pendiente, ver sección Backend abajo)
- `getCurrentUser()` → `GET /auth/me`

### `src/services/expenseService.js`
- `createExpense({ categoryId, amount, description, expenseDate })` → `POST /expenses`
- `listExpenses({ filter, startDate, endDate, page, limit })` → `GET /expenses?...`, arma el query string con `URLSearchParams`, incluyendo solo las claves con valor presente
- `updateExpense(id, updates)` → `PUT /expenses/:id`
- `deleteExpense(id)` → `DELETE /expenses/:id`, chequea `response.status === 204` antes de intentar `response.json()` (evita el error de parsear un body vacío)

### `src/context/AuthContextInstance.js`
Solo exporta `export const AuthContext = createContext(null)`. Separado en su propio archivo porque el lint `react-refresh/only-export-components` exige que archivos `.jsx` con componentes no exporten nada más.

### `src/context/AuthContext.jsx`
Componente `AuthProvider`. Solo exporta el componente (por el mismo motivo de arriba).
- Estado: `user`, `isLoading`.
- `useEffect` al montar: intenta `refreshAccessToken()` + `getCurrentUser()`; si falla cualquiera de los dos, `user` queda en `null`; siempre termina con `setIsLoading(false)`.
- `login(email, password)`, `signup({ name, email, password })`, `logout()` — cada uno devuelve `{ success, error? }`, nunca lanza; actualizan `user` en consecuencia.
- `updateUser(partial)` — merge manual sobre el `user` actual (para cuando el usuario edite su perfil, si se agrega esa feature).
- Value expuesto: `{ user, isLoading, login, signup, logout, updateUser, isAuthenticated: !!user }`.

### `src/context/useAuth.js`
Hook `useAuth()` — hace `useContext(AuthContext)`, lanza si se usa fuera del `AuthProvider`. Importa `AuthContext` desde `AuthContextInstance.js`, no desde `AuthContext.jsx`.

---

## 🔲 Pendiente

### 1. `src/main.jsx` — envolver la app

- [ ] Importar `AuthProvider` desde `context/AuthContext.jsx`.
- [ ] Importar `BrowserRouter` de `react-router-dom`.
- [ ] Envolver `<App />` con `<BrowserRouter><AuthProvider>...</AuthProvider></BrowserRouter>` — **pregunta:** ¿en qué orden anidás los dos? ¿Importa cuál va afuera? Pensá si `AuthProvider` necesita algo de React Router (hooks de navegación) para decidir esto — si no lo necesita, el orden no cambia el comportamiento, pero sé consistente.

### 2. `src/components/ProtectedRoute.jsx`

Componente que envuelve rutas que requieren sesión activa.
- [ ] Usa `useAuth()` para leer `isAuthenticated` e `isLoading`.
- [ ] Mientras `isLoading` es `true`: no redirijas todavía — mostrá un loader o `null`. **Pregunta:** ¿por qué es un bug esperar a que `isLoading` sea `false` antes de decidir si redirigir? Pensá qué pasaría si redirigieras a `/login` apenas se monta el componente, sin esperar el resultado de `restoreSession()` — ¿qué le pasaría a un usuario que sí tiene una sesión válida (cookie viva) pero todavía no terminó de restaurarse?
- [ ] Si `!isLoading && !isAuthenticated`: `<Navigate to="/login" replace />` (de `react-router-dom`).
- [ ] Si `!isLoading && isAuthenticated`: renderiza `children` (o usa `<Outlet />` si preferís el patrón de rutas anidadas de React Router v6).

### 3. `src/pages/Login.jsx`

- [ ] Formulario controlado: `email`, `password` en estado local (`useState`).
- [ ] Al submit: `const { success, error } = await login(email, password)` (de `useAuth()`).
- [ ] Si `success`: navegar a `/dashboard` con `useNavigate()`.
- [ ] Si `!success`: mostrar `error` en la UI.
- [ ] Estado de loading local del botón mientras la request está en curso (evitar doble submit) — **pregunta:** ¿usás el `isLoading` global del `AuthContext` para esto, o uno local al componente? Pensá: el `isLoading` global también se activa durante `restoreSession()` al montar la app — ¿ese es el mismo tipo de "loading" que querés reflejar en el botón de submit del login, o son conceptualmente distintos?
- [ ] Link a `/signup` para quien no tiene cuenta.

### 4. `src/pages/Signup.jsx`

- [ ] Formulario controlado: `name`, `email`, `password` (y quizás confirmación de password — decisión tuya, el backend no la exige).
- [ ] Al submit: `const { success, error } = await signup({ name, email, password })`.
- [ ] Mismo patrón de manejo de éxito/error que `Login.jsx`.
- [ ] Considerá validación básica en el cliente antes de enviar (longitud mínima de password, formato de email) — **pregunta:** ¿tiene sentido duplicar acá las mismas reglas que ya tiene `signupSchema` en el backend (zod)? Pensá en el mismo criterio que usaste en el backend con `amount`: rechazar temprano mejora la UX, pero el backend sigue siendo la fuente de verdad — no te bases solo en la validación del cliente.
- [ ] Link a `/login` para quien ya tiene cuenta.

### 5. `src/pages/Dashboard.jsx`

La pantalla principal, protegida. Composición de varios componentes más chicos (ver abajo).
- [ ] Estado: lista de expenses, filtro activo, página actual, datos de paginación (`total`, `totalPages`).
- [ ] `useEffect` que llama `expenseService.listExpenses(...)` cada vez que cambian el filtro o la página.
- [ ] Renderiza `FilterBar`, `ExpenseList`, controles de paginación, y un botón/modal para crear un expense nuevo.
- [ ] **Pregunta de diseño:** cuando el usuario crea, edita, o borra un expense desde el formulario/modal, ¿cómo actualizás la lista en pantalla — volvés a llamar `listExpenses(...)` desde cero (más simple, siempre consistente con el backend), o actualizás el estado local a mano agregando/quitando/modificando el item (evita una request extra, pero podés desincronizarte del total/paginación real si no tenés cuidado)? Para este proyecto, ¿cuál preferís?

### 6. `src/components/FilterBar.jsx`

- [ ] Selector (botones o `<select>`) para `week` / `month` / `3months` / `custom`.
- [ ] Si `custom`: dos inputs de fecha (`startDate`, `endDate`).
- [ ] Al cambiar el filtro, notifica al padre (`Dashboard`) vía prop callback (`onFilterChange`).
- [ ] **Pregunta:** ¿qué validación hacés en el cliente si el usuario selecciona `custom` pero deja `startDate`/`endDate` vacíos, o pone `startDate` después de `endDate`? Repasá `expenseFilterSchema` en el backend — ya tiene esa regla con `.refine()` y te va a devolver un 400 con mensaje claro si se lo mandás mal armado. ¿Confiás en que el backend te va a rechazar el request y mostrás ese error, o preferís bloquear el submit desde el cliente antes de llegar a hacer la request?

### 7. `src/components/ExpenseList.jsx` + `src/components/ExpenseCard.jsx`

- [ ] `ExpenseList` recibe el array de expenses como prop, mapea y renderiza un `ExpenseCard` por cada uno.
- [ ] `ExpenseCard` muestra `amount`, `description`, `category` (ver punto 9 sobre mapeo de categoría), `expense_date`, y botones de editar/borrar.
- [ ] Al borrar: confirmación antes de ejecutar (`window.confirm` o un modal propio) — **pregunta:** ¿por qué es buena práctica pedir confirmación antes de un DELETE, incluso cuando la API ya protege contra borrar el expense de otro usuario? Pensá en qué tipo de error previene la confirmación (uno muy distinto al que previene la seguridad del backend).

### 8. `src/components/ExpenseForm.jsx`

Un solo componente reusado para crear y editar (recibe un `expense` opcional como prop; si viene, es modo edición).
- [ ] Campos: `categoryId` (select), `amount`, `description`, `expenseDate`.
- [ ] Al submit: si hay `expense.id`, llama `updateExpense(id, updates)`; si no, llama `createExpense(...)`.
- [ ] **Pregunta:** para el modo edición, ¿mandás **todos** los campos siempre, o solo los que el usuario efectivamente cambió? Repasá cómo armaste `updateExpenseSchema` en el backend — soporta actualización parcial. ¿Tiene sentido que el frontend aproveche eso, o es más simple para vos siempre mandar el objeto completo (aunque el backend lo permita parcial)?

### 9. Categorías

El backend expone categorías como IDs fijos (1–7: Groceries, Leisure, Electronics, Utilities, Clothing, Health, Others), sin un endpoint `GET /categories`.
- [ ] **Pregunta de diseño:** ¿hardcodeás esa misma lista de `{ id, name }` en el frontend (un archivo `constants/categories.js`), o le pedís al backend que agregue un endpoint `GET /categories`? Pensá el trade-off: hardcodear es más rápido ahora, pero si el backend agrega una categoría nueva en el futuro, tendrías que recordar actualizar el frontend también — dos fuentes de verdad para el mismo dato.

### 10. `src/App.jsx` — rutas

- [ ] `<Route path="/login" element={<Login />} />`
- [ ] `<Route path="/signup" element={<Signup />} />`
- [ ] `<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />`
- [ ] Ruta raíz (`/`) — **pregunta:** ¿redirige a `/dashboard` o a `/login`? Pensá en cómo decidís eso sin esperar a que `isLoading` resuelva (mismo cuidado que en `ProtectedRoute`).

---

## Backend — pendiente opcional

- [ ] `POST /auth/logout` — invalidaría la cookie del lado del servidor con `res.clearCookie('refreshToken', cookieOptions)`. Sin esto, "cerrar sesión" en el frontend solo limpia el estado del cliente; la cookie sigue viva hasta que expire (7 días) o el navegador la borre. Evaluar si vale la pena para el alcance del proyecto.
- [ ] Testing automatizado (backend y/o frontend) — no iniciado.
