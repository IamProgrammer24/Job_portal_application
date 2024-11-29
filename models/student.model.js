import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    viewedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId, // Array of user IDs
        ref: "Job", // Reference to the User model
        default: [], // Default empty array
      },
    ],
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job", // Reference to the Job model
      },
    ],
    profile: {
      bio: { type: String },
      skills: [{ type: String }],
      resume: { type: String }, // URL to resume file
      resumeOriginalName: { type: String },
      company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
      profilePhoto: {
        type: String,
        default: "https://shorturl.at/lkcWa",
      },
    },
  },
  { timestamps: true }
);
export const Student = mongoose.model("Student", studentSchema);
