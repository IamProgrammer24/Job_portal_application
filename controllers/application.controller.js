//IMPORTING MODELS
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

// APPLY IN JOB
export const applyJob = async (req, res) => {
  try {
    const userId = req.user.userId; // GET THE USER ID FROM THE REQUEST
    const jobId = req.params.id; // GET THE JOB ID FROM THE URL PARAMS

    // CHECK IF THE JOB ID IS PROVIDED IN THE REQUEST
    if (!jobId) {
      return res.status(400).json({
        message: "Job id is required.",
        success: false,
      });
    }

    // CHECK IF THE USER HAS ALREADY APPLIED FOR THE JOB
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job.",
        success: false,
      });
    }

    // CHECK IF THE JOB EXISTS IN THE DATABASE
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }

    // CREATE A NEW APPLICATION DOCUMENT IN THE DATABASE
    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });

    // ASSOCIATE THE APPLICATION WITH THE JOB
    job.applications.push(newApplication._id);
    await job.save();

    // SUCCESSFUL APPLICATION RESPONSE
    return res.status(201).json({
      message: "Job applied successfully.",
      success: true,
    });
  } catch (error) {
    console.error(error); // LOG ERROR FOR DEBUGGING
    return res.status(500).json({
      message: "An error occurred while applying for the job.",
      success: false,
    });
  }
};

export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user.userId; // GET THE USER ID FROM THE REQUEST

    // FIND ALL JOB APPLICATIONS BY THE CURRENT USER, SORTED BY CREATION DATE
    const applications = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "job", // POPULATE THE JOB DETAILS
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "company", // POPULATE THE COMPANY DETAILS WITHIN THE JOB
          options: { sort: { createdAt: -1 } },
        },
      });

    // CHECK IF THE USER HAS APPLIED FOR ANY JOBS
    if (!applications || applications.length === 0) {
      return res.status(404).json({
        message: "No applications found.",
        success: false,
      });
    }

    // RETURN THE APPLICATIONS ALONG WITH JOB AND COMPANY DETAILS
    return res.status(200).json({
      applications,
      success: true,
    });
  } catch (error) {
    console.error(error); // LOG ERROR FOR DEBUGGING
    return res.status(500).json({
      message: "An error occurred while fetching applied jobs.",
      success: false,
    });
  }
};

// RECRUITER: GET ALL APPLICANTS FOR A SPECIFIC JOB
export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id; // GET THE JOB ID FROM THE URL PARAMS

    // FIND THE JOB BASED ON THE GIVEN JOB ID AND POPULATE APPLICATIONS AND APPLICANT DETAILS
    const job = await Job.findById(jobId).populate({
      path: "applications",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "applicant",
        select: "fullname email phoneNumber profile", // ONLY SELECT IMPORTANT FIELDS FROM THE APPLICANT
      },
    });

    // CHECK IF THE JOB EXISTS
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }

    // EXTRACT APPLICANT DETAILS AND THEIR APPLICATION STATUS
    const applicants = job.applications.map((application) => ({
      applicant: application.applicant, // ONLY INCLUDE APPLICANT DETAILS
      status: application.status, // INCLUDE THE STATUS OF THE APPLICATION
    }));

    // RETURN THE JOB AND THE APPLICANTS WITH THEIR STATUS
    return res.status(200).json({
      job: {
        _id: job._id,
        title: job.title,
        applicants, // RETURN THE APPLICANTS WITH THE SELECTED FIELDS
      },
      success: true,
    });
  } catch (error) {
    console.error(error); // LOG ERROR FOR DEBUGGING
    return res.status(500).json({
      message: "Error fetching applicants.",
      success: false,
    });
  }
};
// UPDATE STATUS BY RECRUITER
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body; // GET THE STATUS FROM THE REQUEST BODY
    const applicationId = req.params.id; // GET THE APPLICATION ID FROM THE URL PARAMS

    // CHECK IF THE STATUS IS PROVIDED IN THE REQUEST BODY
    if (!status) {
      return res.status(400).json({
        message: "Status is required.",
        success: false,
      });
    }

    // FIND THE APPLICATION BY THE APPLICATION ID
    const application = await Application.findOne({ _id: applicationId });
    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
        success: false,
      });
    }

    // UPDATE THE STATUS OF THE APPLICATION
    application.status = status.toLowerCase();
    await application.save();

    // SUCCESSFUL STATUS UPDATE RESPONSE
    return res.status(200).json({
      message: "Status updated successfully.",
      success: true,
    });
  } catch (error) {
    console.error(error); // LOG ERROR FOR DEBUGGING
    return res.status(500).json({
      message: "An error occurred while updating the status.",
      success: false,
    });
  }
};
