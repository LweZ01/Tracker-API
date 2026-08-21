import bcrypt from "bcrypt";

const DEFAULT_SALT_ROUNDS = 10;

class PasswordHasher {
  constructor(saltRounds = DEFAULT_SALT_ROUNDS) {
    this.saltRounds = saltRounds;
  }

  async hashPassword(plainPassword) {
    if (!plainPassword || typeof plainPassword !== "string") {
      throw new Error("PASSWORD_REQUIRED");
    }

    const trimmed = plainPassword.trim();
    if (trimmed.length === 0) {
      throw new Error("PASSWORD_EMPTY");
    }

    return await bcrypt.hash(trimmed, this.saltRounds);
  }

  async comparePassword(plainPassword, hash) {
    if (!plainPassword || typeof plainPassword !== "string") {
      throw new Error("PASSWORD_REQUIRED");
    }

    if (!hash || typeof hash !== "string") {
      throw new Error("HASH_REQUIRED");
    }

    const trimmedPassword = plainPassword.trim();
    if (trimmedPassword.length === 0) {
      throw new Error("PASSWORD_EMPTY");
    }

    return await bcrypt.compare(trimmedPassword, hash);
  }
}

export default PasswordHasher;
