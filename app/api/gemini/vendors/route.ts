import { NextRequest, NextResponse } from "next/server";
import { getModel, parseModelJson, positiveNumber, text as sanitizeText } from "../_lib";
import { createOfflineVendors } from "../offline";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = sanitizeText(body.eventType, "event");
    const guestCount = positiveNumber(body.guestCount);
    const budget = sanitizeText(body.budget, "Moderate");
    const location = sanitizeText(body.location, "TBD");
    const preferences = sanitizeText(body.preferences, "None");
    if (!guestCount) return NextResponse.json({ error: "Guest count must be positive." }, { status: 400 });
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      return NextResponse.json(createOfflineVendors(eventType));
    }
    const model = getModel();

    const prompt = `You are an expert event planner. Generate a comprehensive vendor checklist for a ${eventType} event.

Event Details:
- Guest Count: ${guestCount}
- Budget Range: ${budget}
- Location: ${location || "TBD"}
- Preferences: ${preferences || "None"}

Return a JSON ARRAY of vendor categories with this EXACT shape:
[
  {
    "id": "1",
    "category": "Category Name",
    "vendors": [
      {
        "id": "1-1",
        "name": "Vendor Role",
        "description": "What they provide",
        "estimatedCost": "$500-1000",
        "bookingLeadTime": "3-6 months before event",
        "questions": ["Question to ask vendor 1", "Question to ask vendor 2"],
        "tips": "Hiring tip",
        "priority": "essential"
      }
    ]
  }
]

Rules:
- priority must be ONE of: essential, recommended, optional
- Generate 5-7 categories with 2-4 vendors each
- Be specific to ${eventType} events
- Return ONLY valid JSON array, no markdown, no code fences`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const data = parseModelJson<unknown>(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Vendors API error:", error);
    return NextResponse.json(
      { error: "Failed to generate vendor list" },
      { status: 500 }
    );
  }
}
