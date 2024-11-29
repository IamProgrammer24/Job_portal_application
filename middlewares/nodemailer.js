import nodemailer from "nodemailer";
import dotenv from "dotenv";

// LOAD ENVIRONMENT VARIABLES FROM .ENV FILE
dotenv.config();

// SET UP THE TRANSPORTER FOR SENDING EMAILS
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST, // EMAIL SERVER HOST
  port: process.env.MAIL_PORT, // EMAIL SERVER PORT

  auth: {
    user: process.env.MAIL_USER, // EMAIL USERNAME
    pass: process.env.MAIL_PASS, // EMAIL PASSWORD
  },
});

// FUNCTION TO SEND AN EMAIL
export const sendEmail = async (to, subject, text) => {
  try {
    // SENDING THE EMAIL WITH THE PROVIDED PARAMETERS
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM, // SENDER EMAIL ADDRESS
      to, // RECIPIENT EMAIL ADDRESS
      subject, // EMAIL SUBJECT
      text, // EMAIL BODY
    });

    // LOGGING THE SUCCESSFUL EMAIL SENDING WITH MESSAGE ID
    console.log("Email sent:", info.messageId);
    return true; // EMAIL SENT SUCCESSFULLY
  } catch (error) {
    // LOGGING ANY ERROR THAT OCCURS DURING EMAIL SENDING
    console.error("Error sending email:", error);
    return false; // EMAIL SENDING FAILED
  }
};
