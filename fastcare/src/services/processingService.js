import connectDB from "@/lib/mongodb";
import MedicalRecord from "@/models/MedicalRecord";
import Summary from "@/models/Summary";
import Patient from "@/models/Patient";
import { runContradictionCheck } from "@/lib/contradictionChecker";
import { updateRiskLevel } from "@/lib/riskCalculator";

const PYTHON_URL = "https://arrest-useable-epilepsy.ngrok-free.dev";
const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function updateStatus(recordId, status, extra = {}) {
  await connectDB();
  await MedicalRecord.findByIdAndUpdate(recordId, {
    processingStatus: status,
    ...extra,
  });
}

export async function processWithNLP(recordId, patient, files) {
  await connectDB();

  try {
    // ── STEP 1: Forward files to Python ──────────────────
    await updateStatus(recordId, "extracting");

    const nlpForm = new FormData();
    nlpForm.append("patient_name", patient.name);
    nlpForm.append(
      "patient_details",
      JSON.stringify({
        age: patient.age || "",
        blood_group: patient.bloodGroup || "",
        known_conditions: patient.conditions || [],
      })
    );

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const blob = new Blob([buffer], { type: "application/pdf" });
      nlpForm.append("files", blob, file.name);
    }

    console.log("📤 Sending to Python NLP:", PYTHON_URL);

    const nlpRes = await fetch(
      `${PYTHON_URL}/process-documents`,
      {
        method: "POST",
        body: nlpForm,
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    if (!nlpRes.ok) {
      const errText = await nlpRes.text();
      throw new Error(
        `Python NLP failed: ${nlpRes.status} — ${errText}`
      );
    }

    const nlpData = await nlpRes.json();
    console.log("✅ Python NLP response received");

    // Extract raw_text from response
    const rawText = nlpData.raw_text || JSON.stringify(nlpData);

    await updateStatus(recordId, "running_ner", {
      extractedText: rawText,
      nerOutput: nlpData.entities || {},
    });

    // ── STEP 2: Pass raw_text to OpenAI ──────────────────
    await updateStatus(recordId, "generating_summary");

    const llmResult = await callOpenAI(rawText, patient.name);

    // ── STEP 3: Save to MongoDB ───────────────────────────
    await updateStatus(recordId, "structuring");

    await Summary.findOneAndUpdate(
      { patientId: patient._id },
      {
        patientId: patient._id,
        conditions: llmResult.conditions || [],
        medications: llmResult.medications || [],
        surgeries: llmResult.surgeries || [],
        allergies: llmResult.allergies || [],
        labValues: llmResult.labValues || [],
        criticalFlags: llmResult.criticalFlags || [],

        // Map type → contradictionType (Mongoose fix)
        contradictions: llmResult.contradictions?.map((c) => ({
          contradictionType: c.type || c.contradictionType || "",
          description: c.description || "",
          severity: c.severity || "warning",
        })) || [],

        timeline: llmResult.timeline || [],
        aiSummary: llmResult.aiSummary || "",
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    // Update patient stats
    await Patient.findByIdAndUpdate(patient._id, {
      lastVisit: new Date(),
    });

    await updateStatus(recordId, "completed");

    // Run contradiction checks and update risk level
    await runContradictionCheck(patient._id);
    await updateRiskLevel(patient._id);

    console.log("✅ Record processing complete:", recordId);

  } catch (err) {
    console.error("❌ Processing error:", err.message);
    await updateStatus(recordId, "failed", {
      processingError: err.message,
    });
  }
}

async function callOpenAI(rawText, patientName) {
  const prompt = `
You are a clinical AI assistant analyzing medical records.
Patient Name: ${patientName}

The text below contains citation markers like:
[START SOURCE: doc1.pdf | PAGE: 1] ... [END SOURCE: doc1.pdf | PAGE: 1]

Read this patient history carefully.
Return ONLY valid JSON. No markdown. No explanation. No code blocks.

Required JSON format:
{
  "conditions": ["string"],
  "medications": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string"
    }
  ],
  "surgeries": ["string"],
  "allergies": ["string"],
  "labValues": [
    {
      "name": "string",
      "value": "string",
      "unit": "string",
      "isAbnormal": boolean
    }
  ],
  "criticalFlags": ["string"],
  "contradictions": [
    {
      "type": "string",
      "description": "string",
      "severity": "critical or warning"
    }
  ],
  "timeline": [
    {
      "date": "string",
      "event": "string",
      "source": "exact filename from citation marker",
      "page": "exact page number from citation marker"
    }
  ],
  "aiSummary": "2-3 sentence clinical summary"
}

Rules:
- timeline MUST include source + page from citation markers
- Flag allergy vs medication conflicts in contradictions
- Mark abnormal lab values isAbnormal: true
- Extract ALL medications with dosage
- Return chronological timeline sorted by date

Medical Record:
${rawText}
  `;

  const res = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI failed: ${res.status} — ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "{}";

  try {
    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    console.error("❌ LLM JSON parse failed:", content);
    return {
      conditions: [],
      medications: [],
      surgeries: [],
      allergies: [],
      labValues: [],
      criticalFlags: ["Could not parse AI response"],
      contradictions: [],
      timeline: [],
      aiSummary: "Processing error occurred.",
    };
  }
}