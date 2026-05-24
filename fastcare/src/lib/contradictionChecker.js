import { connectDB } from "./mongodb.js";
import Summary from "../models/Summary.js";
import Alert from "../models/Alert.js";
import MedicalRecord from "../models/MedicalRecord.js";

export async function runContradictionCheck(patientId) {
  await connectDB();

  const summary = await Summary.findOne({ patientId });
  if (!summary) return [];

  const contradictions = [];
  const newAlerts = [];

  // 1. Drug-Allergy Contradiction
  // Check if any medication name matches any known allergy
  const allergiesLower = (summary.allergies || []).map((a) => a.toLowerCase());
  const medicationsLower = (summary.medications || []).map((m) => ({
    name: m.name,
    lower: m.name.toLowerCase(),
  }));

  for (const medication of medicationsLower) {
    for (const allergy of allergiesLower) {
      // Check for exact match or substring match (e.g., "penicillin" in "amoxicillin/penicillin allergy")
      if (
        allergy.includes(medication.lower) ||
        medication.lower.includes(allergy) ||
        levenshteinSimilar(allergy, medication.lower)
      ) {
        const desc = `Patient is prescribed "${medication.name}" but has a documented allergy to "${allergy}". This is a potentially dangerous drug-allergy conflict.`;

        // Get relevant record IDs
        const records = await MedicalRecord.find({ patientId })
          .select("_id")
          .limit(5)
          .lean();

        contradictions.push({
          type: "drug_allergy",
          description: desc,
          severity: "critical",
          recordIds: records.map((r) => r._id),
        });

        newAlerts.push({
          patientId,
          type: "contradiction",
          severity: "critical",
          message: `DRUG-ALLERGY CONFLICT: ${medication.name} vs documented allergy to ${allergy}`,
          recordIds: records.map((r) => r._id),
        });
        break;
      }
    }
  }

  // 2. Abnormal lab values → create critical alerts
  const abnormalLabs = (summary.labValues || []).filter((lv) => lv.isAbnormal);
  for (const lab of abnormalLabs) {
    const existing = await Alert.findOne({
      patientId,
      type: "critical",
      message: new RegExp(lab.name, "i"),
    });

    if (!existing) {
      newAlerts.push({
        patientId,
        type: "critical",
        severity: "critical",
        message: `Abnormal lab value: ${lab.name} = ${lab.value}${lab.unit ? " " + lab.unit : ""} (marked ABNORMAL)`,
        recordIds: [],
      });
    }
  }


  for (const flag of summary.criticalFlags || []) {
    const existing = await Alert.findOne({
      patientId,
      type: "critical",
      message: flag,
    });

    if (!existing) {
      newAlerts.push({
        patientId,
        type: "critical",
        severity: "critical",
        message: flag,
        recordIds: [],
      });
    }
  }

  // Save new alerts
  if (newAlerts.length > 0) {
    await Alert.insertMany(newAlerts);
    console.log(`[Contradiction Checker] Created ${newAlerts.length} alerts for patient ${patientId}`);
  }

  // Update summary with contradictions
  if (contradictions.length > 0) {
    await Summary.findOneAndUpdate(
      { patientId },
      { $set: { contradictions } },
      { new: true }
    );
  }

  return contradictions;
}

function levenshteinSimilar(str1, str2, threshold = 0.8) {
  if (!str1 || !str2) return false;
  if (str1 === str2) return true;

  // Skip very short strings to avoid false positives
  if (str1.length < 4 || str2.length < 4) return false;

  const maxLen = Math.max(str1.length, str2.length);
  const distance = levenshtein(str1, str2);
  const similarity = 1 - distance / maxLen;

  return similarity >= threshold;
}

function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
