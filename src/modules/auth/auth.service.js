import ApiError from "../../utils/ApiError.js";

class AuthService {
  constructor(userRepository, passwordHasher, tokenService) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async signup({ name, email, password }) {
    try {
      const passwordHash = await this.passwordHasher.hashPassword(password);
      const user = await this.userRepository.createUser({
        name,
        email,
        passwordHash,
      });
      return user;
    } catch (error) {
      if (error.message === "EMAIL_ALREADY_EXISTS") {
        throw new ApiError("Email already exists", 409);
      }
      throw error;
    }
  }

  async login({ email, password }) {
    const user = await this.userRepository.findUserByEmail(email);
    let userExists = false;
    let passwordMatch = false;

    if (user) {
      userExists = true;
      passwordMatch = await this.passwordHasher.comparePassword(
        password,
        user.password_hash,
      );
    } else {
      await this.passwordHasher.comparePassword(
        password,
        "fake_hash_that_does_not_exist",
      );
    }

    if (!userExists || !passwordMatch) {
      throw new ApiError("Invalid email or password", 401);
    }

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      userId: user.id,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.tokenService.accessTokenTTL,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}

export default AuthService;
