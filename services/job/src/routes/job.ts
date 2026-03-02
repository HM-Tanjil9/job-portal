import express from "express";
import { createCompany } from "../controllers/job.js";
import { isAuth } from "../middleware/user.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();
router.post("/company/new", isAuth, uploadFile, createCompany);

export default router;
