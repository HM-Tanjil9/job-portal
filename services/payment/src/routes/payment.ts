import express from "express";
import { isAuth } from "../middleware/user.js";
import {
  checkOut,
  handleIPN,
  paymentVerification,
} from "../controllers/payment.js";

const router = express.Router();

// Protected route - initiate payment
router.post("/checkout", isAuth, checkOut);

// Public routes - SSLCommerz callbacks (NO AUTH - SSLCommerz POSTs here)
router.post("/success", paymentVerification);
router.post("/fail", paymentVerification);
router.post("/cancel", paymentVerification);
router.post("/ipn", handleIPN);

export default router;
