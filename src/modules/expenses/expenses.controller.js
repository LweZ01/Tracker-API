class ExpenseController {
  constructor(expenseService) {
    this.expenseService = expenseService;
  }

  async createExpense(req, res, next) {
    try {
      const userId = req.user.userId;
      const { categoryId, amount, description, expenseDate } = req.body;

      const expense = await this.expenseService.createExpense({
        userId,
        categoryId,
        amount,
        description,
        expenseDate,
      });

      res.status(201).json({ expense });
    } catch (error) {
      next(error);
    }
  }

  async listExpenses(req, res, next) {
    try {
      const userId = req.user.userId;
      const { filter, startDate, endDate, page, limit } = req.validatedQuery;

      const result = await this.expenseService.listExpenses(userId, {
        filter,
        startDate,
        endDate,
        page,
        limit,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateExpense(req, res, next) {
    try {
      const userId = req.user.userId;
      const expenseId = req.validatedParams.id;
      const updates = req.body;

      const expense = await this.expenseService.updateExpense(
        userId,
        expenseId,
        updates,
      );

      res.status(200).json({ expense });
    } catch (error) {
      next(error);
    }
  }

  async deleteExpense(req, res, next) {
    try {
      const userId = req.user.userId;
      const expenseId = req.validatedParams.id;

      await this.expenseService.deleteExpense(userId, expenseId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default ExpenseController;
