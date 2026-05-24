import mongoose from "mongoose";

const MedicationSchema = new mongoose.Schema(
  {
    name: { type: String },
    dosage: { type: String, default: "" },
    frequency: { type: String, default: "" },
  },
  { _id: false }
);

const LabValueSchema = new mongoose.Schema(
  {
    name: { type: String },
    value: { type: String },
    unit: { type: String, default: "" },
    isAbnormal: { type: Boolean, default: false },
  },
  { _id: false }
);

const ContradictionSchema = new mongoose.Schema(
  {
    type: { type: String },
    description: { type: String },
    severity: {
      type: String,
      enum: ["critical", "warning"],
      default: "warning",
    },
    recordIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "MedicalRecord" }],
  },
  { _id: false }
);

const SummarySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
      index: true,
    },
    conditions: [{ type: String }],
    medications: [MedicationSchema],
    surgeries: [{ type: String }],
    allergies: [{ type: String }],
    labValues: [LabValueSchema],
    contradictions: [ContradictionSchema],
    criticalFlags: [{ type: String }],
    aiSummary: {
      type: String,
      default: "",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Summary =
  mongoose.models.Summary || mongoose.model("Summary", SummarySchema);

export default Summary;
