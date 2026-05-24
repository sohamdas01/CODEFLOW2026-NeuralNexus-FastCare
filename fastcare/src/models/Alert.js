import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["contradiction", "critical", "warning", "info"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["critical", "warning", "info"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    recordIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MedicalRecord",
      },
    ],
    reviewed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Alert = mongoose.models.Alert || mongoose.model("Alert", AlertSchema);

export default Alert;
