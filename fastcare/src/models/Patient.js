import mongoose from "mongoose";

const EmergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    relation: { type: String, default: "" },
  },
  { _id: false }
);

const PatientSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    dob: {
      type: Date,
    },
    age: {
      type: Number,
      min: 0,
      max: 150,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      default: "Unknown",
    },
    emergencyContact: {
      type: EmergencyContactSchema,
      default: () => ({ name: "", phone: "", relation: "" }),
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    recordCount: {
      type: Number,
      default: 0,
    },
    lastVisit: {
      type: Date,
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

// Text index for search
PatientSchema.index({ name: "text", email: "text" });

const Patient = mongoose.models.Patient || mongoose.model("Patient", PatientSchema);

export default Patient;
