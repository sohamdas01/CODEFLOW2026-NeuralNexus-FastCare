import mongoose from "mongoose";

const MedicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    cloudinaryUrl: {
      type: String,
      default: "",
    },

    publicId: {
      type: String,
      required: true,
    },

    reportType: {
      type: String,
      enum: ["lab", "prescription", "discharge", "scan", "other"],
      default: "other",
    },

    extractedText: {
      type: String,
      default: "",
    },

    nerOutput: {
      drugs: [String],
      diseases: [String],
      symptoms: [String],
      procedures: [String],
      anatomy: [String],
    },

    structuredData: {
      conditions: [String],
      medications: [String],
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
      dates: [String],
    },

    processingStatus: {
      type: String,
      enum: [
        "pending",
        "uploading",
        "extracting",
        "running_ner",
        "structuring",
        "generating_summary",
        "completed",
        "failed",
      ],
      default: "pending",
    },

    processingError: {
      type: String,
    },

    uploadedBy: {
      type: String,
    },

    recordDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const MedicalRecord =
  mongoose.models.MedicalRecord ||
  mongoose.model("MedicalRecord", MedicalRecordSchema);

export default MedicalRecord;