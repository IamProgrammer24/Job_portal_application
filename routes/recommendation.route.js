import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { recommendedJobs } from "../controllers/recommendation.controller.js";

const router = express.Router();

router.route("/").get(isAuthenticated, recommendedJobs);

export default router;
