import jwt from "jsonwebtoken";

class TokenService {
  constructor(config) {
    this.jwtSecret = config.JWT_SECRET;
    this.jwtRefreshSecret = config.JWT_REFRESH_SECRET;
    this.refreshTokenTTL = config.REFRESH_TOKEN_TTL;
    this.accessTokenTTL = config.ACCESS_TOKEN_TTL;
  }

  generateAccessToken(payload) {
    const minimalPayload = {
      id: payload.id,
      ...(payload.email && { email: payload.email }),
    };

    return jwt.sign(minimalPayload, this.jwtSecret, {
      expiresIn: this.accessTokenTTL,
    });
  }

  generateRefreshToken(payload) {
    const minimalPayload = {
      id: payload.id,
    };

    return jwt.sign(minimalPayload, this.jwtRefreshSecret, {
      expiresIn: this.refreshTokenTTL,
    });
  }

  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return {
        valid: true,
        payload: decoded,
        error: null,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          valid: false,
          payload: null,
          error: "expired",
        };
      }

      return {
        valid: false,
        payload: null,
        error: "invalid",
      };
    }
  }

  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtRefreshSecret);
      return {
        valid: true,
        payload: decoded,
        error: null,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          valid: false,
          payload: null,
          error: "expired",
        };
      }

      return {
        valid: false,
        payload: null,
        error: "invalid",
      };
    }
  }

  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch {
      return null;
    }
  }
}

export default TokenService;
