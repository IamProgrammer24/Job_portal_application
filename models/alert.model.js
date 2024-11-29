import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    role: {
      type: String,
    },
    requirment: [
      {
        type: String,
      },
    ],
    minSalary: {
      type: Number,
    },
    maxSalary: {
      type: Number,
    },
    location: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Alert = mongoose.model("Alert", alertSchema);
