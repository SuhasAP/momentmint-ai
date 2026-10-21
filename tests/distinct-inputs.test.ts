import { describe, it, expect } from "vitest";
import { generateFallbackPlan, SAMPLE_PRESETS } from "../src/lib/sample-data";

describe("Distinct Inputs Produce Meaningfully Different Outputs", () => {
  it("generates distinct plans for Bengaluru Botanical Birthday vs Goa Sunset Engagement", () => {
    const planA = generateFallbackPlan(SAMPLE_PRESETS[0].input); // Bengaluru 40 pax 25k
    const planB = generateFallbackPlan(SAMPLE_PRESETS[1].input); // Goa 75 pax 350k

    // Concepts must differ
    expect(planA.concept.name).not.toBe(planB.concept.name);
    expect(planA.input.city).toBe("Bengaluru");
    expect(planB.input.city).toBe("Goa");

    // Per head spend must be radically distinct
    expect(planA.menu.perHeadEstimate).toBeLessThan(1000);
    expect(planB.menu.perHeadEstimate).toBeGreaterThan(1500);

    // Color swatches must reflect their themes
    const planAHexes = planA.styling.colorPalette.map((c) => c.hex);
    const planBHexes = planB.styling.colorPalette.map((c) => c.hex);
    expect(planAHexes).not.toEqual(planBHexes);

    // Budgets are preserved and distinct
    expect(planA.budgetBreakdown.totalBudget).toBe(25000);
    expect(planB.budgetBreakdown.totalBudget).toBe(350000);
  });

  it("generates distinct plans for Tech Mixer vs Birthday", () => {
    const planA = generateFallbackPlan(SAMPLE_PRESETS[0].input); // Birthday outdoor
    const planC = generateFallbackPlan(SAMPLE_PRESETS[2].input); // Corporate tech indoor

    expect(planA.input.venuePreference).toBe("outdoor");
    expect(planC.input.venuePreference).toBe("indoor");
    expect(planA.input.eventType).toBe("birthday");
    expect(planC.input.eventType).toBe("corporate");
  });
});
