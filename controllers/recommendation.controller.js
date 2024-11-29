// IMPORTING MODEL
import { Student } from "../models/student.model.js";

export const recommendedJobs = async (req, res) => {
  try {
    const userId = req.user.userId; // CURRENT LOGGED-IN USER
    const user = await Student.findById(userId);

    // IF USER NOT FOUND, RETURN 404 ERROR
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found.", success: false });
    }

    // GET THE USER'S SKILLS
    const userSkills = user.profile.skills;

    // IF USER HAS NO SKILLS IN THEIR PROFILE, RETURN NO RECOMMENDATIONS
    if (userSkills.length === 0) {
      return res.status(200).json({
        message:
          "User has no skills listed, cannot recommend other users or jobs.",
        success: false,
      });
    }

    // FIND USERS WHO SHARE AT LEAST ONE SKILL WITH THE CURRENT USER
    const usersWithCommonSkills = await Student.find({
      skills: { $in: userSkills }, // MATCH USERS WITH COMMON SKILLS
      _id: { $ne: userId }, // EXCLUDE THE CURRENT USER FROM THE RESULTS
    });

    // IF NO USERS WITH COMMON SKILLS ARE FOUND, RETURN A MESSAGE
    if (usersWithCommonSkills.length === 0) {
      return res.status(200).json({
        message: "No users found with common skills.",
        success: false,
      });
    }

    // GATHER THE JOBS THAT THESE USERS HAVE SAVED AND VIEWED
    const allJobs = [];

    // ITERATE THROUGH EACH USER WITH COMMON SKILLS
    for (const u of usersWithCommonSkills) {
      // FIND JOBS THAT THESE USERS HAVE SAVED OR VIEWED
      const jobs = await Job.find({
        $or: [{ _id: { $in: u.savedJobs } }, { _id: { $in: u.viewedJobs } }],
      });

      // IF JOBS ARE FOUND, ADD THEM TO THE ALLJobs ARRAY
      if (jobs.length > 0) {
        allJobs.push(...jobs);
      }
    }

    // REMOVE DUPLICATES FROM THE LIST OF JOBS (IN CASE A USER HAS INTERACTED WITH THE SAME JOB MULTIPLE TIMES)
    const uniqueJobs = [...new Set(allJobs.map((job) => job._id))].map((id) =>
      allJobs.find((job) => job._id.toString() === id.toString())
    );

    // RETURN THE RECOMMENDED JOBS
    return res.status(200).json({
      success: true,
      recommendedJobs: uniqueJobs,
    });
  } catch (error) {
    // LOG ERROR AND RETURN INTERNAL SERVER ERROR IF AN EXCEPTION OCCURS
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};
