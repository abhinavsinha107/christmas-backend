import express from "express";
import userRoutes from "./user/user.route";
import authRoutes from "./auth/auth.route";
import paymentRoutes from "./payment/payment.route";

// routes
const router = express.Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/payments", paymentRoutes);

export default router;
