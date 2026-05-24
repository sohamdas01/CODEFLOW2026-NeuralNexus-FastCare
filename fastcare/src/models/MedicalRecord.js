import mongoose from "mongoose";

const LabValueSchema = new mongoose.Schema(
  {
    name: { type: String },
    value: { type: String },
    unit: { type: String },
    isAbnormal: { type: Boolean, default: false },
  },
  { _id: false }
);

const NEROutputSchema = new mongoose.Schema(
  {
    drugs: [{ type: String }],
    diseases: [{ type: String }],
    symptoms: [{ type: String }],
    procedures: [{ type: String }],
    anatomy: [{ type: String }],
  },
  { _id: false }
);

const MedicationSchema = new mongoose.Schema(
  {
    name: { type: String },
    dosage: { type: String },
    frequency: { type: String },
  },
  { _id: false }
);

const StructuredDataSchema = new mongoose.Schema(
  {
    conditions: [{ type: String }],
    medications: [MedicationSchema],
    surgeries: [{ type: String }],
    allergies: [{ type: String }],
    labValues: [LabValueSchema],
    dates: [{ type: String }],
  },
  { _id: false }
);

const MedicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
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
      type: NEROutputSchema,
      default: () => ({
        drugs: [],
        diseases: [],
        symptoms: [],
        procedures: [],
        anatomy: [],
      }),
    },
    structuredData: {
      type: StructuredDataSchema,
      default: () => ({
        conditions: [],
        medications: [],
        surgeries: [],
        allergies: [],
        labValues: [],
        dates: [],
      }),
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
      default: null,
    },
    uploadedBy: {
      type: String,
      required: true,
    },
    recordDate: {
      type: Date,
      default: Date.now,
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

const MedicalRecord =
  mongoose.models.MedicalRecord ||
  mongoose.model("MedicalRecord", MedicalRecordSchema);

export default MedicalRecord;
