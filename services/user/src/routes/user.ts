import express from "express";
import { isAuth } from "../middleware/user.js";
import {
  addUserSkills,
  applyForJob,
  deleteSkillFromUser,
  getAllApplications,
  getUserProfile,
  myProfile,
  userUpdateProfile,
  userUpdateProfilePic,
  userUpdateResume,
} from "../controllers/user.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();

router.get("/me", isAuth, myProfile);
router.get("/:userId", isAuth, getUserProfile);
router.put("/update/profile", isAuth, userUpdateProfile);
router.put("/update/pic", isAuth, uploadFile, userUpdateProfilePic);
router.put("/update/resume", isAuth, uploadFile, userUpdateResume);
router.post("/skill/add", isAuth, addUserSkills);
router.delete("/skill/delete", isAuth, deleteSkillFromUser);
router.post("/apply/job", isAuth, applyForJob);
router.get("/application/all", isAuth, getAllApplications);

export default router;
