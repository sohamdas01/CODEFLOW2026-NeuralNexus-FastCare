import { connectDB } from "../lib/mongodb.js";
import Summary from "../models/Summary.js";
import MedicalRecord from "../models/MedicalRecord.js";

export async function getWiki(patientId) {
  await connectDB();

  let summary = await Summary.findOne({ patientId }).lean();

  if (!summary) {

    summary = await Summary.create({
      patientId,
      conditions: [],
      medications: [],
      surgeries: [],
      allergies: [],
      labValues: [],
      contradictions: [],
      criticalFlags: [],
      aiSummary: "",
      lastUpdated: new Date(),
    });
  }

  return summary;
}


export async function rebuildWiki(patientId) {
  await connectDB();

  const records = await MedicalRecord.find({
    patientId,
    processingStatus: "completed",
  })
    .sort({ createdAt: 1 })
    .lean();

  if (records.length === 0) {
    console.log(`[Wiki Service] No completed records for patient ${patientId}`);
    return;
  }

  // Aggregate all structured data
  let allConditions = new Set();
  let allSurgeries = new Set();
  let allAllergies = new Set();
  let allMedications = new Map();
  let allLabValues = new Map();

  for (const record of records) {
    const sd = record.structuredData || {};

    (sd.conditions || []).forEach((c) => allConditions.add(c.toLowerCase()));
    (sd.surgeries || []).forEach((s) => allSurgeries.add(s.toLowerCase()));
    (sd.allergies || []).forEach((a) => allAllergies.add(a.toLowerCase()));

    for (const med of sd.medications || []) {
      if (med.name && !allMedications.has(med.name.toLowerCase())) {
        allMedications.set(med.name.toLowerCase(), med);
      }
    }

    for (const lab of sd.labValues || []) {
      if (lab.name) {
        allLabValues.set(lab.name.toLowerCase(), lab);
      }
    }
  }

  await Summary.findOneAndUpdate(
    { patientId },
    {
      $set: {
        conditions: [...allConditions],
        surgeries: [...allSurgeries],
        allergies: [...allAllergies],
        medications: [...allMedications.values()],
        labValues: [...allLabValues.values()],
        lastUpdated: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  console.log(`[Wiki Service] Rebuilt wiki for patient ${patientId}`);
}
