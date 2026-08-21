import { z } from "zod";

const CATEGORY_IDS = [1, 2, 3, 4, 5, 6, 7]; // Groceries, Leisure, Electronics, Utilities, Clothing, Health, Others

export const createExpenseSchema = z.object({
  categoryId: z.number().int().positive(),
  amount: z.number().positive(),
  description: z.string().max(255).optional(),
  expenseDate: z.string().date().optional(), // YYYY-MM-DD; si no viene, la DB usa CURRENT_DATE
});

export const updateExpenseSchema = z
  .object({
    categoryId: z.number().int().positive().optional(),
    amount: z.number().positive().optional(),
    description: z.string().max(255).optional(),
    expenseDate: z.string().date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export const expenseFilterSchema = z
  .object({
    filter: z.enum(["week", "month", "3months", "custom"]),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
  })
  .refine(
    (data) => {
      if (data.filter === "custom") {
        return !!data.startDate && !!data.endDate;
      }
      return true;
    },
    {
      message: "Custom filter requires both startDate and endDate",
      path: ["startDate"],
    },
  );
