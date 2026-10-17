import express from "express";
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "../controllers/auth.js";
import uploadFile from "../middleware/multer.js";
import {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
} from "../middleware/rateLimit.js";

const router = express.Router();
router.post("/register", registerLimiter, uploadFile, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/forgot", forgotPasswordLimiter, forgotPassword);
router.post("/reset/:token", resetPasswordLimiter, resetPassword);

export default router;
