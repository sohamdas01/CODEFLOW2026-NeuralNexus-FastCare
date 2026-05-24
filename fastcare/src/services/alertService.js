import { connectDB } from "../lib/mongodb.js";
import Alert from "../models/Alert.js";
import Patient from "../models/Patient.js";

export async function getAlerts({ severity, reviewed, page = 1, limit = 20 } = {}) {
  await connectDB();

  const query = {};
  if (severity && severity !== "all") query.severity = severity;
  if (reviewed !== undefined && reviewed !== "") {
    query.reviewed = reviewed === "true" || reviewed === true;
  }

  const skip = (page - 1) * limit;

  const [alerts, total] = await Promise.all([
    Alert.find(query)
      .populate("patientId", "name bloodGroup riskLevel")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Alert.countDocuments(query),
  ]);

  return {
    alerts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}


export async function markReviewed(alertId) {
  await connectDB();

  const alert = await Alert.findByIdAndUpdate(
    alertId,
    { reviewed: true },
    { new: true }
  ).populate("patientId", "name");

  if (!alert) throw new Error(`Alert not found: ${alertId}`);

  return alert;
}


export async function getUnreviewedCriticalCount() {
  await connectDB();
  return Alert.countDocuments({ severity: "critical", reviewed: false });
}


export async function createAlert(alertData) {
  await connectDB();
  return Alert.create(alertData);
}