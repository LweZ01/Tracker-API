import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import expensesRoutes from "./modules/expenses/expenses.routes.js";

const app = express();

// Middlewares globales
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);

app.use("/expenses", expensesRoutes);

app.use(errorMiddleware);

export default app;
