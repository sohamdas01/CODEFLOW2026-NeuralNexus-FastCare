import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

let llm = null;

function getLLM() {
  if (!llm) {
    llm = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.1, 
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxTokens: 5000,
    });
  }
  return llm;
}


export async function callLLM(prompt) {
  const model = getLLM();

  const systemMessage = new SystemMessage(
    "You are a clinical AI assistant. You always respond with valid JSON only. Never include markdown code blocks or any text outside the JSON object."
  );

  const humanMessage = new HumanMessage(prompt);

  try {
    console.log("[LLM] Calling gpt-4o for clinical summarization...");
    const response = await model.invoke([systemMessage, humanMessage]);

    let content = response.content;

    // Strip any accidental markdown code blocks
    content = content
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    // Attempt JSON parse
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from response if it has extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error(`Failed to parse LLM JSON response: ${content.substring(0, 200)}`);
      }
    }

    // Validate and normalize response
    const result = {
      conditions: Array.isArray(parsed.conditions) ? parsed.conditions : [],
      medications: Array.isArray(parsed.medications)
        ? parsed.medications.map((m) => ({
            name: m.name || "",
            dosage: m.dosage || "",
            frequency: m.frequency || "",
          }))
        : [],
      surgeries: Array.isArray(parsed.surgeries) ? parsed.surgeries : [],
      allergies: Array.isArray(parsed.allergies) ? parsed.allergies : [],
      criticalFlags: Array.isArray(parsed.criticalFlags) ? parsed.criticalFlags : [],
      aiSummary: typeof parsed.aiSummary === "string" ? parsed.aiSummary : "",
    };

    console.log(
      `[LLM] Summary generated: ${result.conditions.length} conditions, ` +
        `${result.criticalFlags.length} critical flags`
    );

    return result;
  } catch (error) {
    console.error("[LLM] Error:", error.message);
    throw new Error(`LLM call failed: ${error.message}`);
  }
}