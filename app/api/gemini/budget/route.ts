import { NextRequest, NextResponse } from "next/server";
import { getModel, jsonError, parseModelJson, positiveNumber, text as sanitizeText } from "../_lib";

type BudgetCategory = {
  name: string;
  amount: number;
  percentage: number;
  description: string;
  tips: string;
};

const OFFLINE_ALLOCATIONS: Record<string, Array<Omit<BudgetCategory, "amount">>> = {
  wedding: [
    { name: "Venue", percentage: 30, description: "Ceremony and reception venue costs", tips: "Ask about package pricing and off-peak dates." },
    { name: "Catering", percentage: 25, description: "Food, drinks, and service", tips: "Use a seasonal menu and confirm whether service fees are included." },
    { name: "Photography & Video", percentage: 10, description: "Photography and event video coverage", tips: "Book one team for both services when possible." },
    { name: "Decor & Flowers", percentage: 10, description: "Decorations, flowers, and rentals", tips: "Reuse ceremony arrangements at the reception." },
    { name: "Attire & Beauty", percentage: 8, description: "Outfits, accessories, hair, and makeup", tips: "Prioritize alterations and book trials before paying in full." },
    { name: "Music & Entertainment", percentage: 7, description: "DJ, live music, and entertainment", tips: "Ask venues about included sound equipment." },
    { name: "Stationery & Favors", percentage: 5, description: "Invitations, signage, and guest favors", tips: "Use digital invitations where appropriate." },
    { name: "Contingency", percentage: 5, description: "Reserve for unexpected expenses", tips: "Keep this amount untouched until the final week." },
  ],
  birthday: [
    { name: "Venue", percentage: 25, description: "Party space and setup time", tips: "Check community venues and included tables or chairs." },
    { name: "Food & Cake", percentage: 25, description: "Meals, snacks, drinks, and cake", tips: "Order portions based on confirmed guests." },
    { name: "Entertainment", percentage: 15, description: "Activities, performers, or games", tips: "Choose activities that work for multiple age groups." },
    { name: "Decorations", percentage: 12, description: "Theme decor, balloons, and table settings", tips: "Focus decor on one photo backdrop and the food table." },
    { name: "Rentals", percentage: 8, description: "Tables, seating, and party equipment", tips: "Borrow items before renting them." },
    { name: "Invitations & Favors", percentage: 5, description: "Invitations and take-home gifts", tips: "Bundle favors with the party theme." },
    { name: "Contingency", percentage: 10, description: "Reserve for unexpected expenses", tips: "Keep this amount available for last-minute supplies." },
  ],
  community: [
    { name: "Venue & Permits", percentage: 20, description: "Space rental, permits, and insurance", tips: "Ask local authorities about community-event discounts." },
    { name: "Food & Refreshments", percentage: 25, description: "Food, water, and serving supplies", tips: "Use local sponsors or bulk purchasing." },
    { name: "Equipment & Rentals", percentage: 15, description: "Tables, seating, tents, and sound equipment", tips: "Coordinate shared equipment with partner organizations." },
    { name: "Entertainment & Activities", percentage: 12, description: "Performances, activities, and workshops", tips: "Invite local talent and volunteers." },
    { name: "Promotion & Printing", percentage: 8, description: "Signage, flyers, and promotional materials", tips: "Use community social channels and digital flyers." },
    { name: "Staffing & Safety", percentage: 10, description: "Staff, security, first aid, and waste services", tips: "Confirm volunteer roles in writing before the event." },
    { name: "Contingency", percentage: 10, description: "Reserve for weather or unexpected costs", tips: "Keep this amount available until the event ends." },
  ],
};

function createOfflineBudget(
  eventType: string,
  totalBudget: number,
  guestCount: number,
  currency: string
) {
  const allocations = OFFLINE_ALLOCATIONS[eventType] ?? OFFLINE_ALLOCATIONS.community;
  const categories = allocations.map((allocation) => ({
    ...allocation,
    amount: Math.round((totalBudget * allocation.percentage) / 100),
  }));
  const totalAllocated = categories.reduce((total, category) => total + category.amount, 0);
  const roundingAdjustment = totalBudget - totalAllocated;
  categories[0].amount += roundingAdjustment;

  const contingency = categories.find((category) => category.name === "Contingency")?.amount ?? 0;
  return {
    categories,
    perPersonCost: Math.round((totalBudget / guestCount) * 100) / 100,
    contingency,
    totalAllocated: totalBudget,
    advice: `This ${currency}${totalBudget.toLocaleString()} estimate uses a practical ${eventType} allocation for ${guestCount} guests. Keep the contingency reserve untouched until final bookings are complete.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = sanitizeText(body.eventType, "event");
    const totalBudget = positiveNumber(body.totalBudget);
    const guestCount = positiveNumber(body.guestCount);
    const currency = sanitizeText(body.currency, "$");
    const preferences = sanitizeText(body.preferences, "None");
    if (!totalBudget || !guestCount) return jsonError("Budget and guest count must be positive numbers.");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(createOfflineBudget(eventType, totalBudget, guestCount, currency));
    }
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
