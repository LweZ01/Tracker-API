import ApiError from "../utils/ApiError.js";

const authenticate = (tokenService) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(new ApiError("Authorization header required", 401));
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return next(
        new ApiError(
          "Invalid authorization header format. Use: Bearer <token>",
          401,
        ),
      );
    }

    const token = parts[1];

    const { valid, payload, error } = tokenService.verifyAccessToken(token);

    if (!valid) {
      if (error === "expired") {
        return next(
          new ApiError(
            "Access token has expired. Please refresh your token.",
            401,
          ),
        );
      }

      return next(
        new ApiError("Invalid access token. Please login again.", 401),
      );
    }

    req.user = payload;
    next();
  };
};

export default authenticate;
