import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import expensesRoutes from "./modules/expenses/expenses.routes.js";
import { corsMiddleware } from "./middlewares/cors.middleware.js";
import helmet from "helmet";
import cookieParser from "cookie-parser";

const app = express();

// Middlewares globales
app.use(corsMiddleware());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);

app.use("/expenses", expensesRoutes);

app.use(errorMiddleware);

export default app;
