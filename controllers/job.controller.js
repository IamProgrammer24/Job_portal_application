import { Job } from "../models/job.model.js";
import { Student } from "../models/student.model.js";
import { Company } from "../models/company.model.js";
import { matchJobWithAlerts } from "./alert.controler.js";

// ADMIN POST JOB
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
    } = req.body;
    const userId = req.user.userId;

    // GET COMPANY ID FROM RECRUITER'S DATA
    const company = await Company.findOne({ userId: userId });
    const companyId = company._id;

    // VALIDATE IF ALL REQUIRED FIELDS ARE PRESENT
    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experience ||
      !position ||
      !companyId
    ) {
      return res.status(400).json({
        message: "Something is missing.",
        success: false,
      });
    }

    // CREATE NEW JOB ENTRY IN THE DATABASE
    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","), // CONVERT REQUIREMENTS TO AN ARRAY
      salary: Number(salary),
      location,
      jobType,
      experienceLevel: experience, // EXPERIENCE LEVEL FIELD
      position,
      company: companyId,
      created_by: userId,
    });

    // MATCH JOB WITH ALERTS
    await matchJobWithAlerts(job);

    // SUCCESSFUL JOB CREATION RESPONSE
    return res.status(201).json({
      message: "New job created successfully.",
      job,
      success: true,
    });
  } catch (error) {
    // HANDLE SERVER ERROR
    console.log(error);
    return res.status(500).json({
      message: "Error posting the job.",
      success: false,
    });
  }
};

// GET ALL JOBS FOR STUDENT
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const {
      jobType,
      location,
      minSalary,
      maxSalary,
      experienceLevel,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };

    // APPLY FILTERS TO JOB QUERY BASED ON STUDENT'S SEARCH CRITERIA
    if (jobType) query.jobType = jobType;
    if (location) query.location = { $regex: location, $options: "i" };
    if (minSalary || maxSalary) {
      query.salary = {};
      if (minSalary) query.salary.$gte = minSalary;
      if (maxSalary) query.salary.$lte = maxSalary;
    }

    if (experienceLevel) query.experienceLevel = experienceLevel;

    // GET THE TOTAL NUMBER OF JOBS BASED ON THE FILTER QUERY
    const totalJobs = await Job.countDocuments(query);

    // GET JOBS BASED ON FILTERS, PAGINATION, AND SORT ORDER
    const jobs = await Job.find(query)
      .populate({
        path: "company", // POPULATE COMPANY DETAILS
      })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); // SORT JOBS BY MOST RECENT

    // RETURN THE JOBS AND PAGINATION DATA
    return res.status(200).json({
      jobs,
      totalJobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
    });
  } catch (err) {
    // HANDLE SERVER ERROR
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error fetching jobs", success: false });
  }
};

// GET JOB DETAILS BY ID FOR STUDENT
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role; // EXTRACT USER ROLE ONCE TO SIMPLIFY FURTHER CHECKS

    // LOGIC FOR STUDENTS (UPDATING 'VIEWEDBY' ARRAY)
    if (userRole === "student") {
      const student = await Student.findById(userId);
      if (!student) {
        return res.status(404).json({
          message: "Student not found.",
          success: false,
        });
      }

      // ADD JOB TO 'VIEWEDBY' ARRAY IF NOT ALREADY PRESENT
      if (!student.viewedBy.includes(jobId)) {
        student.viewedBy.push(jobId);
        await student.save(); // SAVE THE UPDATED STUDENT DOCUMENT
      }
    }

    // FETCH JOB DETAILS BY JOB ID
    const job = await Job.findById(jobId).populate("applications");
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }

    // PREPARE A FILTERED JOB OBJECT FOR THE RESPONSE
    const jobDetails = {
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      salary: job.salary,
      experienceLevel: job.experienceLevel,
      location: job.location,
      jobType: job.jobType,
      position: job.position,
      company: job.company,
      created_by: job.created_by,
    };

    // RETURN SIMPLIFIED JOB OBJECT FOR STUDENTS (EXCLUDING APPLICATIONS)
    if (userRole === "student") {
      return res.status(200).json({
        job: jobDetails, // PROVIDE ONLY NECESSARY DETAILS FOR STUDENTS
        success: true,
      });
    }

    // RETURN FULL JOB OBJECT WITH APPLICATIONS FOR RECRUITERS
    return res.status(200).json({
      job, // FULL JOB OBJECT WITH APPLICATIONS
      success: true,
    });
  } catch (error) {
    // HANDLE INTERNAL SERVER ERROR
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};

// GET JOBS CREATED BY THE ADMIN
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const jobs = await Job.find({ created_by: adminId })
      .populate({
        path: "company", // POPULATE COMPANY DETAILS
      })
      .sort({ createdAt: -1 }); // SORT JOBS BY MOST RECENT

    // IF NO JOBS FOUND, RETURN ERROR MESSAGE
    if (!jobs.length) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }

    // RETURN JOBS CREATED BY ADMIN
    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    // HANDLE SERVER ERROR
    console.log(error);
    return res.status(500).json({
      message: "Error fetching jobs.",
      success: false,
    });
  }
};

// SAVE JOB FOR STUDENT
export const savedJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }

    const user = await Student.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    // ADD JOB TO 'SAVEDJOBS' ARRAY IF NOT ALREADY PRESENT
    if (!user.savedJobs.includes(jobId)) {
      user.savedJobs.push(jobId);
      await user.save();
    }

    // RETURN SUCCESS MESSAGE
    return res.status(200).json({
      message: "Job saved successfully.",
      success: true,
    });
  } catch (error) {
    // HANDLE SERVER ERROR
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};
// VIEW SAVED JOBS FOR STUDENT
export const viewSavedJobs = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await Student.findById(userId).populate("savedJobs");
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    return res.status(200).json({
      savedJobs: user.savedJobs,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};

// REMOVE SAVED JOB FOR STUDENT
export const removedjob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }

    const user = await Student.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    // REMOVE JOB FROM 'SAVEDJOBS' ARRAY
    user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    await user.save();

    // RETURN SUCCESS MESSAGE
    return res.status(200).json({
      message: "Job removed from saved jobs.",
      success: true,
    });
  } catch (error) {
    // HANDLE SERVER ERROR
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};
// DELETE JOB BY RECRUITER ONLY
export const deleteJob = async (req, res) => {
  try {
    // Attempt to find and delete the job by its ID
    const response = await Job.findByIdAndDelete(req.params.id);

    // If the job was not found or deleted
    if (!response) {
      return res.status(404).json({
        message: "Job not found or already deleted.",
      });
    }

    // If the job is found and deleted
    return res.status(200).json({
      message: "Job deleted successfully.",
    });
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({
      message: "An error occurred while trying to delete the company.",
      error: error.message,
    });
  }
};
