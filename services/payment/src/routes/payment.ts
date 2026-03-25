// import express from "express";
// import { isAuth } from "../middleware/user.js";
// import { checkOut, paymentVerification } from "../controllers/payment.js";
// const router = express.Router();

// router.post("/checkout", isAuth, checkOut);
// router.post("/verify", isAuth, paymentVerification);

// export default router;

import express from "express";
import { isAuth } from "../middleware/user.js";
import {
  checkOut,
  getPaymentByTransaction,
  handleIPN,
  paymentVerification,
} from "../controllers/payment.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/checkout", isAuth, checkOut);
router.post("/verify", isAuth, paymentVerification); // For manual testing
// router.get("/transaction/:tran_id", isAuth, getPaymentByTransaction);

// Public routes (SSLCommerz callbacks - NO AUTH!)
router.post("/success", paymentVerification); // SSLCommerz calls this
router.post("/fail", paymentVerification); // For failed payments
router.post("/cancel", paymentVerification); // For cancelled payments
router.post("/ipn", handleIPN);

export default router;
