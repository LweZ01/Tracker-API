class ExpenseController {
  constructor(expenseService) {
    this.expenseService = expenseService;
  }

  async createExpense(req, res, next) {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
      const { filter, startDate, endDate } = req.query;

      const expenses = await this.expenseService.listExpenses(userId, {
        filter,
        startDate,
        endDate,
      });

      res.status(200).json({ expenses });
    } catch (error) {
      next(error);
    }
  }

  async updateExpense(req, res, next) {
    try {
      const userId = req.user.id;
      const expenseId = req.params.id;
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
      const userId = req.user.id;
      const expenseId = req.params.id;

      await this.expenseService.deleteExpense(userId, expenseId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default ExpenseController;
