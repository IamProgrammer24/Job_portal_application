// LIBRARYS //
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// UTILS //
import dotenv from "dotenv";
import connectDB from "./utils/db.js";

// ROUTES //
import studentRoute from "./routes/student.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import recommenddtionRoute from "./routes/recommendation.route.js";
import alertRoute from "./routes/alert.route.js";
import recruiterRoute from "./routes/recruiter.route.js";

dotenv.config({});

const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

// API'S
app.use("/api/v1/jobseeker", studentRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("api/v1/", recommenddtionRoute);
app.use("api/vi/user", alertRoute);
app.use("/api/v1/recruiter", recruiterRoute);

app.listen(PORT, () => {
  // CONNECT TO THE DATABASE WHEN SERVER START
  connectDB();
  console.log(`Server running at port ${PORT}`);
});
