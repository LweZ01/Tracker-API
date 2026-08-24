import { Router } from "express";
import { container } from "../../config/container.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  signupSchema,
  loginSchema,
  refreshTokenSchema,
} from "./auth.validation.js";

const router = Router();
const { authController } = container;

router.post(`/signup`, validate(signupSchema), (req, res, next) =>
  authController.signup(req, res, next),
);
router.post(`/login`, validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next),
);
router.post(`/refresh`, validate(refreshTokenSchema), (req, res, next) =>
  authController.refresh(req, res, next),
);

export default router;
