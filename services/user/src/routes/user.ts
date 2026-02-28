import express from "express";
import { isAuth } from "../middleware/user.js";
import { myProfile } from "../controllers/user.js";

const router = express.Router();

router.get("/me", isAuth, myProfile);

export default router;
