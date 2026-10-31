const eventLabel = (eventType: string) =>
  eventType.charAt(0).toUpperCase() + eventType.slice(1);

export function createOfflineTimeline(eventType: string, eventDate: string) {
  const milestones = [
    [180, "Set the overall vision", "Define the event goals, style, guest experience, and planning priorities.", "misc", "high", "1-2 hours"],
    [150, "Set the working budget", "Confirm the total budget and reserve a contingency amount.", "misc", "high", "1 hour"],
    [120, "Book the venue", "Compare venues, confirm availability, and sign the agreement.", "venue", "high", "4-6 hours"],
    [100, "Create the guest list", "Prepare a first guest list and collect contact information.", "invitations", "high", "2-3 hours"],
    [90, "Book key vendors", "Confirm catering, photography, entertainment, and other priority vendors.", "vendors", "high", "3-4 hours"],
    [75, "Choose the menu", "Select food and drink options and record dietary requirements.", "catering", "high", "2 hours"],
    [60, "Send invitations", "Send invitations with the event date, location, and RSVP deadline.", "invitations", "high", "2-3 hours"],
    [45, "Finalize decor plan", "Confirm the color palette, decorations, signage, and rentals.", "decor", "medium", "2-3 hours"],
    [30, "Confirm guest count", "Review RSVPs and provide the final estimate to your vendors.", "catering", "high", "1 hour"],
    [21, "Confirm vendor schedule", "Share the run of show, arrival times, access details, and contact list.", "vendors", "high", "1-2 hours"],
    [14, "Purchase remaining supplies", "Buy favors, stationery, emergency supplies, and non-perishable items.", "misc", "medium", "2-3 hours"],
    [7, "Complete the final walkthrough", "Walk through the venue layout and verify every setup requirement.", "venue", "high", "1-2 hours"],
    [3, "Prepare event kits", "Pack decor, favors, paperwork, vendor payments, and backup supplies.", "misc", "medium", "2-3 hours"],
    [1, "Confirm final details", "Reconfirm vendors, weather plans, deliveries, and the final guest count.", "vendors", "high", "1 hour"],
    [0, "Enjoy the event", "Use the schedule and contact list to keep the event running smoothly.", "misc", "high", "All day"],
  ] as const;

  return milestones.map(([daysBeforeEvent, title, description, category, priority, estimatedTime], index) => ({
    id: String(index + 1),
    title: `${eventLabel(eventType)}: ${title}`,
    description: `${description} Event date: ${eventDate}.`,
    daysBeforeEvent,
    category,
    priority,
    estimatedTime,
  }));
}

export function createOfflineVendors(eventType: string) {
  const prefix = eventLabel(eventType);
  return [
    {
      id: "1",
      category: "Venue & Setup",
      vendors: [
        { id: "1-1", name: "Venue coordinator", description: `Coordinates the ${prefix.toLowerCase()} venue and setup`, estimatedCost: "Varies", bookingLeadTime: "3-6 months before event", questions: ["What is included in the rental?", "What are the setup and cleanup times?"], tips: "Ask for a complete fee sheet.", priority: "essential" },
        { id: "1-2", name: "Rental company", description: "Provides tables, chairs, linens, and equipment", estimatedCost: "$300-1500", bookingLeadTime: "1-3 months before event", questions: ["Do you deliver and collect?", "What is the replacement policy?"], tips: "Bundle rentals to reduce delivery fees.", priority: "recommended" },
      ],
    },
    {
      id: "2",
      category: "Food & Drinks",
      vendors: [
        { id: "2-1", name: "Caterer", description: "Provides food service and staff", estimatedCost: "$25-100 per guest", bookingLeadTime: "3-6 months before event", questions: ["Can you accommodate dietary needs?", "Are service and setup included?"], tips: "Request a tasting before booking.", priority: "essential" },
        { id: "2-2", name: "Cake or dessert provider", description: "Creates desserts suited to the event style", estimatedCost: "$100-600", bookingLeadTime: "1-3 months before event", questions: ["How many servings are included?", "Can you deliver and set up?"], tips: "Book early for custom designs.", priority: "recommended" },
      ],
    },
    {
      id: "3",
      category: "Photography & Entertainment",
      vendors: [
        { id: "3-1", name: "Photographer", description: "Captures key moments and group photos", estimatedCost: "$500-3000", bookingLeadTime: "3-9 months before event", questions: ["How many edited images are included?", "What is the backup plan?"], tips: "Review a full event gallery, not only highlights.", priority: "recommended" },
        { id: "3-2", name: "DJ or entertainment provider", description: "Manages music, announcements, and atmosphere", estimatedCost: "$400-2000", bookingLeadTime: "2-6 months before event", questions: ["Do you provide sound equipment?", "Can we submit a do-not-play list?"], tips: "Share a detailed schedule and must-play list.", priority: "recommended" },
      ],
    },
    {
      id: "4",
      category: "Decor & Support",
      vendors: [
        { id: "4-1", name: "Decorator or florist", description: "Designs the visual details and arrangements", estimatedCost: "$300-2500", bookingLeadTime: "2-6 months before event", questions: ["What is included in setup and teardown?", "Can you work within the selected budget?"], tips: "Prioritize a few high-impact focal points.", priority: "recommended" },
        { id: "4-2", name: "Event coordinator", description: "Keeps vendors and the event schedule on track", estimatedCost: "$500-2500", bookingLeadTime: "1-4 months before event", questions: ["How many hours are included?", "Will you manage vendor arrivals?"], tips: "A coordinator is especially helpful for large events.", priority: "optional" },
      ],
    },
  ];
}

export function createOfflineIdeas(eventType: string, theme: string) {
  const style = theme || "versatile and welcoming";
  return {
    themes: [
      { name: "Modern Minimal", description: `A clean ${style} look with intentional details and a simple palette.`, vibe: "modern", suitability: "Easy to coordinate across different budgets and venues." },
      { name: "Warm Celebration", description: "Comfortable textures, warm lighting, and personal details create an inviting atmosphere.", vibe: "elegant", suitability: "Works well for guests of different ages and interests." },
      { name: "Colorful Gathering", description: "Bright accents, playful signage, and interactive details keep the event energetic.", vibe: "fun", suitability: `A flexible fit for ${eventType} events and casual venues.` },
    ],
    decorations: [
      { idea: "Create one statement photo backdrop", diy: true, estimatedCost: "$50-200", impact: "high" },
      { idea: "Use coordinated table runners and simple centerpieces", diy: true, estimatedCost: "$75-250", impact: "medium" },
      { idea: "Add warm string lighting around the main gathering area", diy: true, estimatedCost: "$40-150", impact: "high" },
      { idea: "Use personalized welcome and directional signs", diy: true, estimatedCost: "$20-100", impact: "medium" },
      { idea: "Group decor by color rather than buying matching sets", diy: false, estimatedCost: "$50-200", impact: "medium" },
      { idea: "Add a small memory or message display", diy: true, estimatedCost: "$15-75", impact: "medium" },
    ],
    activities: [
      { name: "Welcome activity", description: "Give guests a simple prompt or card to complete as they arrive.", duration: "20 mins", guestEngagement: "high" },
      { name: "Photo challenge", description: "Offer a short list of moments or poses for guests to capture.", duration: "30 mins", guestEngagement: "high" },
      { name: "Shared memory moment", description: "Invite guests to write or share a favorite memory.", duration: "20 mins", guestEngagement: "medium" },
      { name: "Team game", description: "Run an inclusive game with small teams and simple prizes.", duration: "30 mins", guestEngagement: "high" },
      { name: "Quiet lounge", description: "Set aside a comfortable area for conversation and rest.", duration: "All event", guestEngagement: "medium" },
    ],
    food: {
      appetizers: ["Seasonal vegetable cups", "Mini sandwiches", "Cheese and fruit board"],
      mains: ["Herb-roasted chicken", "Vegetable pasta", "Grain and salad bowl"],
      desserts: ["Celebration cake", "Mini fruit tarts", "Chocolate bites"],
      drinks: ["Sparkling water bar", "Seasonal fruit punch", "Coffee and tea"],
      dietaryNotes: "Offer at least one vegetarian, one vegan, and one gluten-aware option. Label common allergens clearly.",
    },
    favors: [
      { idea: "Personalized thank-you card", estimatedCost: "$1-3 each", diy: true },
      { idea: "Small local treat", estimatedCost: "$2-6 each", diy: false },
      { idea: "Seed packet or small plant", estimatedCost: "$2-5 each", diy: false },
      { idea: "Reusable event-themed item", estimatedCost: "$3-10 each", diy: false },
    ],
    uniqueTouches: ["Create a shared playlist before the event.", "Add a guest advice or wishes station.", "Display a simple event timeline so guests know what to expect.", "Use a signature color in signage and refreshments.", "Plan one surprise moment near the end of the event."],
  };
}

export function createOfflineChatResponse(message: string, eventType: string) {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("budget") || lowerMessage.includes("cost")) {
    return `For your ${eventType} event, start by reserving 5-10% for unexpected costs. Prioritize the venue, food, and guest experience, then use a few high-impact decorations instead of spreading the budget too thin.`;
  }
  if (lowerMessage.includes("food") || lowerMessage.includes("menu")) {
    return "Plan one main option, a vegetarian alternative, and clearly labeled dietary choices. Confirm the final guest count with the caterer about two weeks before the event.";
  }
  if (lowerMessage.includes("timeline") || lowerMessage.includes("when")) {
    return "Book the venue and key vendors first, send invitations around 6-8 weeks ahead, confirm final numbers two weeks before, and complete a final walkthrough during the last week.";
  }
  return `For your ${eventType} event, begin with the guest list, date, venue, and budget. Once those are set, coordinate vendors, food, decor, and a simple schedule around the guest experience.`;
}
