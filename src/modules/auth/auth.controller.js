import ApiError from "../../utils/ApiError.js";

class AuthController {
  constructor(authService, cookieOptions) {
    this.authService = authService;
    this.cookieOptions = cookieOptions;
  }

  async signup(req, res, next) {
    const { name, email, password } = req.body;
    try {
      const user = await this.authService.signup({ name, email, password });
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    try {
      const result = await this.authService.login({ email, password });

      res.cookie("refreshToken", result.refreshToken, this.cookieOptions);

      res.status(200).json({
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return next(new ApiError("Refresh token required", 401));
      }

      const result = await this.authService.refreshAccessToken(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const userId = req.user.userId;
      const user = await this.authService.getCurrentUser(userId);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
