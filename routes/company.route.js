import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  deleteCompany,
  getCompany,
  getCompanyById,
  registerCompany,
  updateCompany,
} from "../controllers/company.controller.js";
import isAuthorized from "../middlewares/isAuthorized.js";
import { upload } from "../middlewares/mutler.js";
// import { singleUpload } from "../middlewares/mutler.js";

const router = express.Router();

router
  .route("/register")
  .post(isAuthenticated, isAuthorized(["recruiter"]), registerCompany);
router
  .route("/get")
  .get(isAuthenticated, isAuthorized(["recruiter"]), getCompany);
router
  .route("/get/:id")
  .get(isAuthenticated, isAuthorized(["recruiter"]), getCompanyById);
router
  .route("/update/:id")
  .put(
    isAuthenticated,
    isAuthorized(["recruiter"]),
    upload.array(),
    updateCompany
  );
router
  .route("/:id/remove")
  .delete(isAuthenticated, isAuthorized(["recruiter"]), deleteCompany);

export default router;
