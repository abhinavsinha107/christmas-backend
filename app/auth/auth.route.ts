import { Router } from "express";
import { catchError } from "../common/middleware/cath-error.middleware";
import * as authValidator from "./auth.validation";
import * as authController from "./auth.controller";
import passport from "passport";

const router = Router();

router.post(
  "/",
  passport.authenticate("login", { session: false }),
  authValidator.loginUser,
  catchError,
  authController.loginUser
);

export default router;
