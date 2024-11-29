import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  alert,
  getAlert,
  deleteAlert,
} from "../controllers/alert.controler.js";
import isAuthorized from "../middlewares/isAuthorized.js";

const router = express.Router();

router
  .route("/create/alert")
  .post(isAuthenticated, isAuthorized(["studnet"]), alert);
router
  .route("/get/alert")
  .get(isAuthenticated, isAuthorized(["student"]), getAlert);
router
  .route("/delete/alert")
  .delete(isAuthenticated, isAuthorized(["student"]), deleteAlert);

export default router;
