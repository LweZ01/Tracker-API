class AuthController {
  constructor(authService) {
    this.authService = authService;
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
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    const { refreshToken } = req.body;
    try {
      const result = await this.authService.refreshAccessToken(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
