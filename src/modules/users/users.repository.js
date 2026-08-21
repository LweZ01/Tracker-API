class UserRepository {
  constructor(query) {
    this.query = query;
  }

  async createUser({ name, email, passwordHash }) {
    const queryText = `
            INSERT INTO users (name, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, created_at
            `;
    try {
      const values = [name, email, passwordHash];
      const result = await this.query(queryText, values);

      return result.rows[0];
    } catch (error) {
      if (error.code === "23505") {
        throw new Error("EMAIL_ALREADY_EXISTS");
      }
      throw error;
    }
  }

  async findUserByEmail(email) {
    const queryText = `
        SELECT id, name, email, password_hash, created_at
        FROM users
        WHERE email = $1
    `;

    const result = await this.query(queryText, [email]);
    return result.rows[0] || null;
  }

  async findUserById(id) {
    const queryText = `
        SELECT id, name, email, created_at
        FROM users
        WHERE id = $1
        `;
    const result = await this.query(queryText, [id]);
    return result.rows[0] || null;
  }
}

export default UserRepository;
