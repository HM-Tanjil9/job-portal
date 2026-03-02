import express from "express";
import { createCompany, createJob, deleteCompany } from "../controllers/job.js";
import { isAuth } from "../middleware/user.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();
router.post("/company/new", isAuth, uploadFile, createCompany);
router.delete("/company/:companyId", isAuth, deleteCompany);
router.post("/new", isAuth, createJob);

export default router;
