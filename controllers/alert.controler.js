// IMPORTING MIDDLEWARE
import { sendEmail } from "../middlewares/nodemailer.js";

// IMPORTING MODEL
import { Alert } from "../models/alert.model.js";

// CREATING ALERT //
export const alert = async (req, res) => {
  try {
    // EXTRACTING DATA FROM REQUEST BODY
    const { role, requirments, minSalary, maxSalary, location } = req.body;
    const userId = req.user.userId; // RETRIEVE THE userId FROM THE AUTHENTICATED USER

    // CREATE A NEW ALERT DOCUMENT IN DATABASE
    const newAlert = await Alert.create({
      userId,
      role,
      requirments,
      minSalary,
      maxSalary,
      location,
    });

    // RETURN A SUCCESS RESPONSE WITH THE CREATED ALERT
    return res.status(201).json({
      message: "Alert created successfully",
      success: true,
      alert: newAlert,
    });
  } catch (err) {
    // LOG ERROR IF CREATION FAILS
    console.error(err); // LOG THE ERROR FOR DEBUGGING
    return res.status(400).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

// SHOWING ALERT //
export const getAlert = async (req, res) => {
  try {
    const userId = req.user.userId; // RETRIEVE THE userId FROM THE AUTHENTICATED USER

    // SEARCH FOR AN ALERT ASSOCIATED WITH THE USER
    const alert = await Alert.findOne({ userId });

    // CHECK IF ALERT EXISTS
    if (alert) {
      // RETURN A SUCCESS RESPONSE IF ALERT IS FOUND
      return res.status(200).json({
        response: alert,
        message: "Alert found",
        success: true,
      });
    } else {
      // RETURN A FAILURE RESPONSE IF NO ALERT IS FOUND
      return res.status(404).json({
        message: "No alert found. Please create an alert first.",
        success: false,
      });
    }
  } catch (err) {
    // LOG ERROR IF SEARCHING ALERT FAILS
    console.error(err); // LOG THE ERROR FOR DEBUGGING
    return res.status(400).json({
      message: "Something went wrong",
      error: err.message,
      success: false,
    });
  }
};

// DELETE ALERT //
export const deleteAlert = async (req, res) => {
  try {
    const userId = req.user.userId; // RETRIEVE THE userId FROM THE AUTHENTICATED USER

    // DELETE THE ALERT ASSOCIATED WITH THE USER
    const resp = await Alert.findOneAndDelete({ userId });

    // CHECK IF THE ALERT WAS DELETED
    if (resp) {
      // RETURN SUCCESS RESPONSE IF ALERT WAS DELETED
      return res.status(200).json({
        message: "Alert deleted successfully",
        success: true,
      });
    } else {
      // RETURN FAILURE RESPONSE IF NO ALERT WAS FOUND TO DELETE
      return res.status(404).json({
        message: "Alert not found. Nothing to delete.",
        success: false,
      });
    }
  } catch (err) {
    // LOG ERROR IF DELETION FAILS
    console.error(err); // LOG THE ERROR FOR DEBUGGING
    return res.status(400).json({
      message: "Something went wrong",
      error: err.message,
      success: false,
    });
  }
};

// MATCH JOB WITH ALERTS AND SEND EMAIL NOTIFICATIONS
export const matchJobWithAlerts = async (job) => {
  try {
    // FIND ALERTS THAT MATCH THE JOB CRITERIA BASED ON ROLE, LOCATION, AND SALARY
    const alerts = await Alert.find({
      role: job.title,
      location: job.location,
      minSalary: { $lte: job.salary },
      maxSalary: { $gte: job.salary },
    }).populate("userId", "email"); // POPULATE THE userId FIELD TO RETRIEVE THE USER'S EMAIL

    // CHECK IF THERE ARE ANY MATCHING ALERTS
    if (alerts.length > 0) {
      // LOOP THROUGH ALL ALERTS AND SEND EMAIL NOTIFICATIONS TO THE USER
      alerts.forEach(async (alert) => {
        // SUBJECT AND BODY CONTENT FOR THE EMAIL NOTIFICATION
        const subject = `New Job Posting: ${job.title}`;
        const text = `A new job matching your alert has been posted!
                      Job Title: ${job.title}
                      Company: ${job.company}
                      Location: ${job.location}
                      Salary: ${job.minSalary} - ${job.maxSalary}
                      Description: ${job.description}`;

        // SEND EMAIL TO THE USER
        const emailSent = await sendEmail(alert.userId.email, subject, text);

        // LOG WHETHER THE EMAIL WAS SENT SUCCESSFULLY OR NOT
        if (emailSent) {
          console.log(`Email sent to user ${alert.userId.email}`);
        } else {
          console.log(`Failed to send email to user ${alert.userId.email}`);
        }
      });
    }
  } catch (err) {
    // LOG ANY ERROR THAT OCCURS WHILE MATCHING JOBS WITH ALERTS
    console.error("Error matching job with alerts:", err.message);
  }
};
