import express from "express";

const app = express();

// Middlewares globales
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// TODO: montar rutas de módulos aquí (auth, expenses)
// app.use('/auth', authRoutes);
// app.use('/expenses', expensesRoutes);

// TODO: middleware de manejo de errores (debe ir al final)
// app.use(errorMiddleware);

export default app;
