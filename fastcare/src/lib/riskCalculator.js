import { connectDB } from "./mongodb.js";
import Summary from "../models/Summary.js";
import Alert from "../models/Alert.js";
import Patient from "../models/Patient.js";


export async function updateRiskLevel(patientId) {
  await connectDB();

  const [summary, unreviewedCriticalAlerts] = await Promise.all([
    Summary.findOne({ patientId }).lean(),
    Alert.countDocuments({
      patientId,
      severity: "critical",
      reviewed: false,
    }),
  ]);

  const criticalFlagCount = summary?.criticalFlags?.length || 0;
  const contradictionCount = (summary?.contradictions || []).filter(
    (c) => c.severity === "critical"
  ).length;

  // Score calculation
  const totalScore = criticalFlagCount + unreviewedCriticalAlerts * 2 + contradictionCount * 3;

  let riskLevel;
  if (totalScore === 0) {
    riskLevel = "low";
  } else if (totalScore <= 2) {
    riskLevel = "medium";
  } else if (totalScore <= 5) {
    riskLevel = "high";
  } else {
    riskLevel = "critical";
  }

  await Patient.findByIdAndUpdate(patientId, { riskLevel });

  console.log(
    `[Risk Calculator] Patient ${patientId}: score=${totalScore}, ` +
      `criticalFlags=${criticalFlagCount}, alerts=${unreviewedCriticalAlerts}, ` +
      `contradictions=${contradictionCount} → ${riskLevel}`
  );

  return riskLevel;
}
