import { Router } from "express";
import { catchError } from "../common/middleware/cath-error.middleware";
import * as paymentController from "./payment.controller";
import { roleAuth } from "../common/middleware/role-auth.middleware";

const router = Router();

router.post(
  "/",
  roleAuth("USER"),
  catchError,
  paymentController.createPaymentSession
);

export default router;
