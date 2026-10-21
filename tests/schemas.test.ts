import { describe, it, expect } from "vitest";
import { EventInputSchema, EventPlanSchema } from "../src/lib/schemas";
import { generateFallbackPlan } from "../src/lib/sample-data";
import { EventInput } from "../src/types/event";

describe("Schema Validation & Constraint Handling", () => {
  const validPayload: EventInput = {
    eventType: "birthday",
    title: "Aarav's 30th Botanical Birthday",
    date: "2026-11-14",
    city: "Bengaluru",
    guestCount: 40,
    budget: 25000,
    currency: "INR",
    venuePreference: "outdoor",
    themeVibe: "Sustainable botanical garden picnic",
    dietaryRequirements: ["Vegetarian"],
    accessibilityNeeds: ["Ground level access"],
    priorities: ["atmosphere_decor", "eco_friendly"],
  };

  it("successfully validates a valid event input payload", () => {
    const result = EventInputSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects invalid or negative budgets", () => {
    const invalidBudget = { ...validPayload, budget: -5000 };
    const result = EventInputSchema.safeParse(invalidBudget);
    expect(result.success).toBe(false);
  });

  it("rejects 0 or negative guest counts", () => {
    const invalidGuests = { ...validPayload, guestCount: 0 };
    const result = EventInputSchema.safeParse(invalidGuests);
    expect(result.success).toBe(false);
  });

  it("rejects empty titles and cities", () => {
    const emptyTitle = { ...validPayload, title: "" };
    expect(EventInputSchema.safeParse(emptyTitle).success).toBe(false);

    const emptyCity = { ...validPayload, city: "" };
    expect(EventInputSchema.safeParse(emptyCity).success).toBe(false);
  });

  it("ensures fallback engine produces a valid EventPlan complying strictly with EventPlanSchema", () => {
    const plan = generateFallbackPlan(validPayload);
    const result = EventPlanSchema.safeParse(plan);
    expect(result.success).toBe(true);
    expect(plan.aiMetadata.isMockFallback).toBe(true);
    expect(plan.budgetBreakdown.items.length).toBeGreaterThan(3);
  });
});
