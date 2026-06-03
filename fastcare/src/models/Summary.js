
import mongoose from "mongoose";

const SummarySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      unique: true,
      required: true,
    },
    conditions: [String],
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
      },
    ],
    surgeries: [String],
    allergies: [String],
    labValues: [
      {
        name: String,
        value: String,
        unit: String,
        isAbnormal: Boolean,
      },
    ],
    criticalFlags: [String],
    contradictions: [
      {
        contradictionType: String,
        description: String,
        severity: String,
      },
    ],
    timeline: [
      {
        date: String,
        event: String,
        source: String,
        page: String,
      },
    ],
    aiSummary: String,
    lastUpdated: Date,
  },
  { timestamps: true }
);

const Summary =
  mongoose.models.Summary ||
  mongoose.model("Summary", SummarySchema);

export default Summary;