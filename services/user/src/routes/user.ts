import express from "express";
import { isAuth } from "../middleware/user.js";
import { getUserProfile, myProfile } from "../controllers/user.js";

const router = express.Router();

router.get("/me", isAuth, myProfile);
router.get("/:userId", isAuth, getUserProfile);

export default router;
