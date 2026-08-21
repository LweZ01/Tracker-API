class ExpenseRepository {
  constructor(query) {
    this.query = query;
  }

  async createExpense({
    userId,
    categoryId,
    amount,
    description,
    expenseDate,
  }) {
    try {
      const result = await this.query(
        `
        INSERT INTO expenses (user_id, category_id, amount, description, expense_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [userId, categoryId, amount, description, expenseDate],
      );
      return result.rows[0] || null;
    } catch (error) {
      if (error.code === "23503") {
        throw new Error("INVALID_CATEGORY");
      }
      throw error;
    }
  }

  async findExpenseById(id) {
    const result = await this.query(
      `
        SELECT * FROM expenses WHERE id = $1
        `,
      [id],
    );
    return result.rows[0] || null;
  }

  async findExpensesByUserId(userId, { startDate, endDate }) {
    const result = await this.query(
      `
        SELECT * FROM expenses 
        WHERE user_id = $1 
        AND expense_date 
        BETWEEN $2 AND $3 
        ORDER BY expense_date DESC
        `,
      [userId, startDate, endDate],
    );
    return result.rows || [];
  }

  async updateExpense(id, userId, updates) {
    // Mapea nombres de campo (camelCase, como llegan del service/zod)
    // a nombres de columna reales (snake_case, como están en la DB)
    const fieldMap = {
      categoryId: "category_id",
      amount: "amount",
      description: "description",
      expenseDate: "expense_date",
    };

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, column] of Object.entries(fieldMap)) {
      if (updates[key] !== undefined) {
        setClauses.push(`${column} = $${paramIndex}`);
        values.push(updates[key]);
        paramIndex++;
      }
    }

    // Caso borde: si por algún motivo llega un objeto sin ningún campo
    // reconocido (no debería pasar porque zod lo bloquea antes),
    // evitamos generar un UPDATE inválido con SET vacío.
    if (setClauses.length === 0) {
      throw new Error("NO_FIELDS_TO_UPDATE");
    }

    setClauses.push("updated_at = NOW()");

    // Los últimos dos placeholders son siempre id y userId,
    // calculados dinámicamente según cuántos campos se agregaron antes.
    const idPlaceholder = paramIndex;
    const userIdPlaceholder = paramIndex + 1;
    values.push(id, userId);

    const queryText = `
      UPDATE expenses
      SET ${setClauses.join(", ")}
      WHERE id = $${idPlaceholder} AND user_id = $${userIdPlaceholder}
      RETURNING *
    `;

    try {
      const result = await this.query(queryText, values);
      return result.rows[0] || null;
    } catch (error) {
      if (error.code === "23503") {
        throw new Error("INVALID_CATEGORY");
      }
      throw error;
    }
  }

  async deleteExpense(id, userId) {
    const result = await this.query(
      `DELETE FROM expenses 
     WHERE id = $1 AND user_id = $2 
     RETURNING id`,
      [id, userId],
    );

    return result.rows[0]?.id || null;
  }
}

export default ExpenseRepository;
