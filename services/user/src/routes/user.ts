import express from "express";
import { isAuth } from "../middleware/user.js";
import {
  getUserProfile,
  myProfile,
  userUpdateProfile,
} from "../controllers/user.js";

const router = express.Router();

router.get("/me", isAuth, myProfile);
router.get("/:userId", isAuth, getUserProfile);
router.put("/update/profile", isAuth, userUpdateProfile);

export default router;
