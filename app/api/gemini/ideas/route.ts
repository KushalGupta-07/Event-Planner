import { NextRequest, NextResponse } from "next/server";
import { getModel, parseModelJson, positiveNumber, text as sanitizeText } from "../_lib";
import { createOfflineIdeas } from "../offline";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = sanitizeText(body.eventType, "event");
    const theme = sanitizeText(body.theme, "Open to suggestions");
    const guestCount = positiveNumber(body.guestCount);
    const budget = sanitizeText(body.budget, "Moderate");
    const preferences = sanitizeText(body.preferences, "None");
    const season = sanitizeText(body.season, "Not specified");
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      return NextResponse.json(createOfflineIdeas(eventType, theme));
    }
    const model = getModel();

    const prompt = `You are a creative event designer. Generate personalized, creative ideas for a ${eventType} event.

Event Details:
- Theme/Style: ${theme || "Open to suggestions"}
- Guest Count: ${guestCount}
- Budget: ${budget || "Moderate"}
- Preferences: ${preferences || "None"}
- Season/Month: ${season || "Not specified"}

Return a JSON object with this EXACT shape:
{
  "themes": [
    { "name": "Theme Name", "description": "Detailed description", "vibe": "elegant", "suitability": "Why it fits" }
  ],
  "decorations": [
    { "idea": "Decoration idea", "diy": true, "estimatedCost": "$50-100", "impact": "high" }
  ],
  "activities": [
    { "name": "Activity name", "description": "How it works", "duration": "30 mins", "guestEngagement": "high" }
  ],
  "food": {
    "appetizers": ["item1", "item2"],
    "mains": ["item1", "item2"],
    "desserts": ["item1", "item2"],
    "drinks": ["item1", "item2"],
    "dietaryNotes": "Notes about dietary accommodations"
  },
  "favors": [
    { "idea": "Favor idea", "estimatedCost": "$5-10", "diy": false }
  ],
  "uniqueTouches": ["Unique idea 1", "Unique idea 2", "Unique idea 3"]
}

Rules:
- vibe must be ONE of: elegant, fun, rustic, modern, whimsical
- impact must be ONE of: high, medium, low
- guestEngagement must be ONE of: high, medium, low
- Provide 3-4 themes, 6-8 decorations, 4-6 activities, 4-6 favors, 5 uniqueTouches
- Be creative and specific to ${eventType} events
- Return ONLY valid JSON object, no markdown, no code fences`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const data = parseModelJson<unknown>(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Ideas API error:", error);
    return NextResponse.json(
      { error: "Failed to generate ideas" },
      { status: 500 }
    );
  }
}
