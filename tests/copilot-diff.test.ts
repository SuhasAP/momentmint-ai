import { describe, it, expect } from "vitest";
import { generateLocalCopilotDiff } from "../src/lib/gemini";
import { generateFallbackPlan } from "../src/lib/sample-data";
import { SAMPLE_PRESETS } from "../src/lib/sample-data";

describe("Conversational Event Copilot Reasoning & Diff Generation", () => {
  const basePlan = generateFallbackPlan(SAMPLE_PRESETS[0].input);

  it("generates an atomic before/after diff for rain and weather transitions", () => {
    const diff = generateLocalCopilotDiff(
      basePlan,
      "Rain is forecast; revise the plan for indoors"
    );

    expect(diff.impactAnalysis.venueChanged).toBe(true);
    expect(diff.impactAnalysis.itineraryChanged).toBe(true);
    expect(diff.impactAnalysis.decorChanged).toBe(true);
    expect(diff.impactAnalysis.budgetDiff).toBe(0);

    // Verify proposedPlan changes
    expect(diff.proposedPlan.input?.venuePreference).toBe("indoor");
    expect(diff.proposedPlan.concept?.name).toContain("Weather-Protected");

    // Itinerary must be updated to indoor spaces
    expect(diff.proposedPlan.itinerary).toBeDefined();
    expect(diff.proposedPlan.itinerary!.some((i) => i.title.toLowerCase().includes("indoor") || i.title.toLowerCase().includes("atrium"))).toBe(true);

    // Styling decor ideas must be updated to indoor installations
    expect(diff.proposedPlan.styling?.decorIdeas).toBeDefined();
    expect(diff.proposedPlan.styling!.decorIdeas!.some((d) => d.title.toLowerCase().includes("indoor") || d.title.toLowerCase().includes("wall"))).toBe(true);

    // Venue budget item must be updated
    const venueItem = diff.proposedPlan.budgetBreakdown?.items?.find((i) => i.category === "Venue");
    expect(venueItem?.name).toContain("Indoor Glasshouse");
  });

  it("generates structured savings diff for catering reduction while preserving core priorities", () => {
    const diff = generateLocalCopilotDiff(
      basePlan,
      "Reduce catering costs but keep the premium decor"
    );

    expect(diff.impactAnalysis.budgetDiff).toBeLessThan(0);
    expect(diff.impactAnalysis.menuChanged).toBe(true);
    expect(diff.proposedPlan.menu?.cateringStyle).toContain("Live Street Food Stations");

    const oldCatering = basePlan.budgetBreakdown.items.find((i) => i.category === "Catering")?.estimatedCost || 0;
    const newCatering = diff.proposedPlan.budgetBreakdown?.items?.find((i) => i.category === "Catering")?.estimatedCost || 0;
    expect(newCatering).toBeLessThan(oldCatering);

    // Contingency buffer is bolstered
    const contingency = diff.proposedPlan.budgetBreakdown?.items?.find((i) => i.category === "Contingency");
    expect(contingency?.notes).toContain("Bolstered");
  });

  it("handles relaxed timeline and extended cocktail hours", () => {
    const diff = generateLocalCopilotDiff(
      basePlan,
      "Make the itinerary more relaxed with an extended cocktail reception"
    );

    expect(diff.impactAnalysis.itineraryChanged).toBe(true);
    expect(diff.proposedPlan.itinerary).toBeDefined();
    const cocktailMilestone = diff.proposedPlan.itinerary!.find((i) => i.title.toLowerCase().includes("cocktail"));
    expect(cocktailMilestone).toBeDefined();
  });

  it("handles eco-friendly and zero-waste upgrades", () => {
    const diff = generateLocalCopilotDiff(
      basePlan,
      "Upgrade to zero-waste and sustainable favors"
    );

    expect(diff.impactAnalysis.decorChanged).toBe(true);
    expect(diff.proposedPlan.concept?.name).toContain("Zero-Waste");
    const favors = diff.proposedPlan.budgetBreakdown?.items?.find((i) => i.category === "Gifts & Favors");
    expect(favors?.name).toContain("Seed-Paper");
  });
});
