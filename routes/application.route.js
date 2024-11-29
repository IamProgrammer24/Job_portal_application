import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  applyJob,
  getApplicants,
  getAppliedJobs,
  updateStatus,
} from "../controllers/application.controller.js";
import isAuthorized from "../middlewares/isAuthorized.js";

const router = express.Router();

router
  .route("/apply/:id")
  .get(isAuthenticated, isAuthorized(["student"]), applyJob);
router
  .route("/get")
  .get(isAuthenticated, isAuthorized(["student"]), getAppliedJobs);
router
  .route("/:id/applicants")
  .get(isAuthenticated, isAuthorized(["recruiter"]), getApplicants);
router
  .route("/status/:id/update")
  .post(isAuthenticated, isAuthorized(["recruiter"]), updateStatus);

export default router;
