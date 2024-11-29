import express from "express";
import {
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/student.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isAuthorized from "../middlewares/isAuthorized.js";
import { upload } from "../middlewares/mutler.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router
  .route("/profile/update")
  .put(
    isAuthenticated,
    isAuthorized(["student"]),
    upload.array(),
    updateProfile
  );

export default router;
