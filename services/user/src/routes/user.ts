import express from "express";
import { isAuth } from "../middleware/user.js";
import {
  addUserSkills,
  deleteSkillFromUser,
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

export default router;
