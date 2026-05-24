import { connectDB } from "../lib/mongodb.js";
import {uploadPDF} from "../lib/cloudinary.js";
import MedicalRecord from "../models/MedicalRecord.js";
import Patient from "../models/Patient.js";


export async function handleUpload(fileBuffer, filename, patientId, uploadedBy, reportType) {
  await connectDB();

  // Verify patient exists
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new Error(`Patient not found: ${patientId}`);
  }

  // Upload to Cloudinary
  console.log(`[Upload Service] Uploading ${filename} to Cloudinary...`);
  const { url, publicId } = await uploadPDF(fileBuffer, filename);
  console.log(`[Upload Service] Cloudinary upload complete: ${publicId}`);

  // Create MedicalRecord
  const record = await MedicalRecord.create({
    patientId,
    cloudinaryUrl: url,
    publicId,
    reportType: reportType || "other",
    processingStatus: "uploading",
    uploadedBy,
    recordDate: new Date(),
  });

  console.log(`[Upload Service] Created MedicalRecord: ${record._id}`);
  return record._id.toString();
}
