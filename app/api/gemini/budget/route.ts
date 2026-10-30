import { NextRequest, NextResponse } from "next/server";
import { getModel, jsonError, parseModelJson, positiveNumber, text as sanitizeText } from "../_lib";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = sanitizeText(body.eventType, "event");
    const totalBudget = positiveNumber(body.totalBudget);
    const guestCount = positiveNumber(body.guestCount);
    const currency = sanitizeText(body.currency, "$");
    const preferences = sanitizeText(body.preferences, "None");
    if (!totalBudget || !guestCount) return jsonError("Budget and guest count must be positive numbers.");
    const model = getModel();

    const prompt = `You are an expert event planner. Create a detailed budget breakdown for a ${eventType} event.

Event Details:
- Total Budget: ${currency}${totalBudget}
- Guest Count: ${guestCount}
- Special Preferences: ${preferences || "None"}

Return a JSON object with this EXACT structure (no extra keys):
{
  "categories": [
    {
      "name": "Category Name",
      "amount": 1000,
      "percentage": 20,
      "description": "What this covers",
      "tips": "Money-saving tip"
    }
  ],
  "perPersonCost": 100,
  "contingency": 500,
  "totalAllocated": 5000,
  "advice": "Overall budget advice string"
}

Make it realistic and specific to ${eventType} events. All amounts must be numbers (not strings). Percentages must sum to ~100. Return ONLY valid JSON, no markdown, no code fences.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    // Strip potential markdown code fences
    text = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const data = parseModelJson<unknown>(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Budget API error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to generate budget" },
      { status: 500 }
    );
  }
}
