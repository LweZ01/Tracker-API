import { Router } from "express";
import { container } from "../../config/container.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseFilterSchema,
} from "./expenses.validation.js";

const router = Router();
const { expenseController, authMiddleware } = container;

router.post(
  "/",
  authMiddleware,
  validate(createExpenseSchema),
  (req, res, next) => expenseController.createExpense(req, res, next),
);

router.get(
  "/",
  authMiddleware,
  validate(expenseFilterSchema, "query"),
  (req, res, next) => expenseController.listExpenses(req, res, next),
);

router.put(
  "/:id",
  authMiddleware,
  validate(updateExpenseSchema),
  (req, res, next) => expenseController.updateExpense(req, res, next),
);

router.delete("/:id", authMiddleware, (req, res, next) =>
  expenseController.deleteExpense(req, res, next),
);

export default router;
