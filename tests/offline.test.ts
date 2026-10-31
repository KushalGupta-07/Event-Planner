import { describe, expect, it } from "vitest";
import {
  createOfflineChatResponse,
  createOfflineIdeas,
  createOfflineTimeline,
  createOfflineVendors,
} from "../app/api/gemini/offline";

describe("offline planning responses", () => {
  it("creates a complete timeline ordered from long-term planning to event day", () => {
    const timeline = createOfflineTimeline("wedding", "2026-12-20");

    expect(timeline).toHaveLength(15);
    expect(timeline[0]).toMatchObject({
      id: "1",
      daysBeforeEvent: 180,
      category: "misc",
      priority: "high",
    });
    expect(timeline.at(-1)).toMatchObject({
      daysBeforeEvent: 0,
      title: "Wedding: Enjoy the event",
    });
    expect(timeline.every((item) => item.description.includes("2026-12-20"))).toBe(true);
  });

  it("creates vendor groups with unique item ids", () => {
    const groups = createOfflineVendors("birthday");
    const vendorIds = groups.flatMap((group) => group.vendors.map((vendor) => vendor.id));

    expect(groups).toHaveLength(4);
    expect(vendorIds).toHaveLength(8);
    expect(new Set(vendorIds).size).toBe(vendorIds.length);
    expect(groups[0].vendors[0].description).toContain("birthday");
  });

  it("applies the requested theme to creative ideas", () => {
    const ideas = createOfflineIdeas("community", "garden party");

    expect(ideas.themes).toHaveLength(3);
    expect(ideas.themes[0].description).toContain("garden party");
    expect(ideas.decorations.length).toBeGreaterThan(0);
    expect(ideas.food.dietaryNotes).toContain("vegetarian");
  });
});

describe("offline chat responses", () => {
  it.each([
    ["How much will food cost?", "budget"],
    ["What should the menu include?", "food"],
    ["When should I book vendors?", "timeline"],
    ["Help me get started", "general"],
  ])("returns a useful %s response", (message, topic) => {
    const response = createOfflineChatResponse(message, "community");

    expect(response.length).toBeGreaterThan(40);
    if (topic === "budget") expect(response).toContain("unexpected costs");
    if (topic === "food") expect(response).toContain("vegetarian");
    if (topic === "timeline") expect(response).toContain("venue");
    if (topic === "general") expect(response).toContain("guest list");
  });
});
