import express from "express";
import {
  createCompany,
  createJob,
  deleteCompany,
  getAllActiveJobs,
  getAllCompany,
  getApplicationForJob,
  getCompanyDetails,
  getSingleJob,
  updateApplication,
  updateJob,
} from "../controllers/job.js";
import { isAuth } from "../middleware/user.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();
router.post("/company/new", isAuth, uploadFile, createCompany);
router.delete("/company/:companyId", isAuth, deleteCompany);
router.post("/new", isAuth, createJob);
router.put("/:jobId", isAuth, updateJob);
router.get("/company/all", isAuth, getAllCompany);
router.get("/company/:id", isAuth, getCompanyDetails);
router.get("/all", getAllActiveJobs);
router.get("/:jobId", getSingleJob);
router.get("/application/:jobId", isAuth, getApplicationForJob);
router.put("/application/update/:id", isAuth, updateApplication);

export default router;
