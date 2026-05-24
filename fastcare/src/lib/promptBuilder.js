
export function buildSummaryPrompt(structuredData, patientHistory) {
    const historySection = patientHistory
        ? `
PATIENT'S EXISTING MEDICAL HISTORY (from previous records):
- Known Conditions: ${(patientHistory.conditions || []).join(", ") || "None recorded"}
- Current Medications: ${(patientHistory.medications || [])
            .map((m) => `${m.name}${m.dosage ? " " + m.dosage : ""}${m.frequency ? " " + m.frequency : ""}`)
            .join(", ") || "None recorded"
        }
- Known Allergies: ${(patientHistory.allergies || []).join(", ") || "None recorded"}
- Previous Surgeries: ${(patientHistory.surgeries || []).join(", ") || "None recorded"}
- Previous Critical Flags: ${(patientHistory.criticalFlags || []).join(", ") || "None"}
`
        : "PATIENT'S EXISTING MEDICAL HISTORY: No prior records available.";

    const newDataSection = `
NEW RECORD - EXTRACTED MEDICAL DATA:
- Conditions/Diagnoses Mentioned: ${structuredData.conditions?.join(", ") || "None identified"}
- Medications Mentioned: ${(structuredData.medications || [])
            .map((m) => `${m.name}${m.dosage ? " " + m.dosage : ""}${m.frequency ? " " + m.frequency : ""}`)
            .join(", ") || "None identified"
        }
- Allergies Mentioned: ${structuredData.allergies?.join(", ") || "None identified"}
- Surgeries/Procedures Mentioned: ${structuredData.surgeries?.join(", ") || "None identified"}
- Lab Values: ${(structuredData.labValues || [])
            .map((l) => `${l.name}: ${l.value}${l.unit ? " " + l.unit : ""}${l.isAbnormal ? " (ABNORMAL)" : ""}`)
            .join(", ") || "None identified"
        }
- Relevant Dates: ${structuredData.dates?.slice(0, 5).join(", ") || "None found"}
`;

    return `You are a clinical AI assistant integrated into a medical records platform. Your task is to analyze newly extracted medical data and generate a structured clinical summary in JSON format.

${historySection}

${newDataSection}

Based on the above information, generate a comprehensive clinical summary. You MUST return ONLY valid JSON with exactly these fields:

{
  "conditions": ["array of all active/historical medical conditions, consolidated and deduplicated"],
  "medications": [{"name": "drug name", "dosage": "dose or empty string", "frequency": "frequency or empty string"}],
  "surgeries": ["array of confirmed surgical history items"],
  "allergies": ["array of known allergens"],
  "criticalFlags": ["array of serious clinical concerns requiring immediate attention, e.g., abnormal lab values, dangerous drug-allergy interactions, critical diagnoses"],
  "aiSummary": "A 2-4 sentence plain English clinical summary of this patient's overall health picture, suitable for a physician to read quickly."
}

RULES:
1. Return ONLY the JSON object — no markdown, no code blocks, no preamble.
2. If a field has no data, return an empty array [] or empty string "".
3. Merge data from both existing history and new records — do not duplicate.
4. criticalFlags should include any abnormal lab values, drug-allergy conflicts, or clinically significant findings.
5. aiSummary must be professional, concise, and clinically accurate.
6. Do not invent information not present in the data.`;
}