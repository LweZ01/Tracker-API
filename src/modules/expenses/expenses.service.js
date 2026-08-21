import ApiError from "../../utils/ApiError.js";

class ExpenseService {
  constructor(expenseRepository, getDateRangeForFilter) {
    this.expenseRepository = expenseRepository;
    this.getDateRangeForFilter = getDateRangeForFilter;
  }

  async createExpense({
    userId,
    categoryId,
    amount,
    description,
    expenseDate,
  }) {
    try {
      return await this.expenseRepository.createExpense({
        userId,
        categoryId,
        amount,
        description,
        expenseDate,
      });
    } catch (error) {
      if (error.message === "INVALID_CATEGORY") {
        throw new ApiError("Invalid category ID provided", 400);
      }
      throw error;
    }
  }

  async listExpenses(userId, { filter, startDate, endDate }) {
    const dateRange = this.getDateRangeForFilter(filter, {
      startDate,
      endDate,
    });

    return await this.expenseRepository.findExpensesByUserId(userId, dateRange);
  }

  async updateExpense(userId, expenseId, updates) {
    try {
      const updatedExpense = await this.expenseRepository.updateExpense(
        expenseId,
        userId,
        updates,
      );

      if (updatedExpense === null) {
        throw new ApiError("Expense not found", 404);
      }

      return updatedExpense;
    } catch (error) {
      if (error.message === "INVALID_CATEGORY") {
        throw new ApiError("Invalid category ID provided", 400);
      }
      throw error;
    }
  }

  async deleteExpense(userId, expenseId) {
    const deleted = await this.expenseRepository.deleteExpense(
      expenseId,
      userId,
    );

    if (deleted === null) {
      throw new ApiError("Expense not found", 404);
    }

    return { success: true };
  }
}

export default ExpenseService;
