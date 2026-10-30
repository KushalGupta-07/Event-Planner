import { NextRequest, NextResponse } from "next/server";
import { getModel, jsonError, parseModelJson, positiveNumber, text as sanitizeText } from "../_lib";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = sanitizeText(body.eventType, "event");
    const eventDate = sanitizeText(body.eventDate);
    const guestCount = positiveNumber(body.guestCount);
    const location = sanitizeText(body.location, "TBD");
    const preferences = sanitizeText(body.preferences, "None");
    if (!eventDate || !guestCount) return jsonError("Event date and guest count are required.");
    const model = getModel();
    const today = new Date().toISOString().split("T")[0];

    const prompt = `You are an expert event planner. Create a detailed preparation timeline for a ${eventType} event.

Event Details:
- Event Date: ${eventDate}
- Today's Date: ${today}
- Guest Count: ${guestCount}
- Location: ${location || "TBD"}
- Preferences: ${preferences || "None"}

Return a JSON ARRAY of timeline milestones. Each milestone must follow this EXACT shape:
[
  {
    "id": "1",
    "title": "Milestone Title",
    "description": "Detailed description of what to do",
    "daysBeforeEvent": 180,
    "category": "venue",
    "priority": "high",
    "estimatedTime": "2-3 hours"
  }
]

Rules:
- category must be ONE of: venue, vendors, invitations, decor, catering, misc
- priority must be ONE of: high, medium, low
- daysBeforeEvent must be a positive integer
- Create 15-20 milestones sorted descending by daysBeforeEvent
- Be specific to ${eventType} events
- Return ONLY valid JSON array, no markdown, no code fences`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const data = parseModelJson<unknown>(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Timeline API error:", error);
    return NextResponse.json(
      { error: "Failed to generate timeline" },
      { status: 500 }
    );
  }
}
