import { Router } from "express";
import { container } from "../../config/container.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { signupSchema, loginSchema } from "./auth.validation.js";

const router = Router();
const { authController } = container;

router.post(`/signup`, validate(signupSchema), (req, res, next) =>
  authController.signup(req, res, next),
);
router.post(`/login`, validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next),
);

export default router;
