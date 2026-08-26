import { query } from "../config/database.js";
import { config } from "../config/env.js";
import UserRepository from "../modules/users/users.repository.js";
import PasswordHasher from "../utils/password.util.js";
import TokenService from "../utils/jwt.util.js";
import AuthService from "../modules/auth/auth.service.js";
import AuthController from "../modules/auth/auth.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import ExpenseRepository from "../modules/expenses/expenses.repository.js";
import ExpenseService from "../modules/expenses/expenses.service.js";
import ExpenseController from "../modules/expenses/expenses.controller.js";
import { getDateRangeForFilter } from "../utils/dateFilters.util.js";

// Auth
const userRepository = new UserRepository(query);
const passwordHasher = new PasswordHasher();
const tokenService = new TokenService(config);
const authService = new AuthService(
  userRepository,
  passwordHasher,
  tokenService,
);

const cookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const authController = new AuthController(authService, cookieOptions);

const authMiddleware = authenticate(tokenService);

// Expenses
const expenseRepository = new ExpenseRepository(query);
const expenseService = new ExpenseService(
  expenseRepository,
  getDateRangeForFilter,
);
const expenseController = new ExpenseController(expenseService);

export const container = {
  userRepository,
  passwordHasher,
  tokenService,
  authService,
  authController,
  authMiddleware,
  expenseRepository,
  expenseService,
  expenseController,
};
