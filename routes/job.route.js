import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  deleteJob,
  getAdminJobs,
  getAllJobs,
  getJobById,
  postJob,
  removedjob,
  savedJob,
  viewSavedJobs,
} from "../controllers/job.controller.js";
import isAuthorized from "../middlewares/isAuthorized.js";

const router = express.Router();

router
  .route("/post")
  .post(isAuthenticated, isAuthorized(["recruiter"]), postJob);
router
  .route("/getjobs")
  .get(isAuthenticated, isAuthorized(["student"]), getAllJobs);
router
  .route("/alljobs")
  .get(isAuthenticated, isAuthorized(["recruiter"]), getAdminJobs);
router
  .route("/job/:id")
  .get(isAuthenticated, isAuthorized(["student", "recruiter"]), getJobById);
router
  .route("/savejob/:id")
  .post(isAuthenticated, isAuthorized(["student"]), savedJob);
router
  .route("/removesavedjob/:id")
  .post(isAuthenticated, isAuthorized(["student"]), removedjob);
router
  .route("/savejobs")
  .get(isAuthenticated, isAuthorized(["student"]), viewSavedJobs);
router
  .route("/:id/removejob")
  .delete(isAuthenticated, isAuthorized(["recruiter"]), deleteJob);

export default router;
