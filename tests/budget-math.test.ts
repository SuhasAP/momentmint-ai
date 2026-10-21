import { describe, it, expect } from "vitest";
import {
  calculateBudgetMetrics,
  generateCostOptimization,
  formatCurrency,
} from "../src/lib/budget-math";
import { BudgetBreakdown, BudgetItem } from "../src/types/event";

describe("Live Budget Arithmetic & Invariant Checks", () => {
  const sampleItems: BudgetItem[] = [
    {
      id: "b1",
      category: "Venue",
      name: "Garden Pavilion Permit",
      estimatedCost: 5000,
      priority: "must-have",
      notes: "Secured",
    },
    {
      id: "b2",
      category: "Catering",
      name: "Artisanal Buffet (40 pax)",
      estimatedCost: 10000,
      priority: "must-have",
      notes: "Vegetarian spread",
    },
    {
      id: "b3",
      category: "Decor & Styling",
      name: "Fairy Lights & Botanicals",
      estimatedCost: 4500,
      priority: "nice-to-have",
      notes: "Potted plants",
    },
    {
      id: "b4",
      category: "Photography",
      name: "Candid Shoot (3 hrs)",
      estimatedCost: 3500,
      priority: "splurge",
      notes: "High res reel",
    },
    {
      id: "b5",
      category: "Contingency",
      name: "Reserves Buffer",
      estimatedCost: 2000,
      priority: "must-have",
      notes: "Emergency funds",
    },
  ];

  const breakdown: BudgetBreakdown = {
    totalBudget: 25000,
    currency: "INR",
    contingencyPercentage: 8,
    items: sampleItems,
  };

  it("strictly maintains the invariant that category totals sum to totalAllocated", () => {
    const metrics = calculateBudgetMetrics(breakdown, 40);

    const manualItemSum = sampleItems.reduce((acc, it) => acc + it.estimatedCost, 0);
    const categorySum = metrics.categories.reduce((acc, cat) => acc + cat.total, 0);

    expect(manualItemSum).toBe(25000);
    expect(categorySum).toBe(25000);
    expect(metrics.totalAllocated).toBe(manualItemSum);
    expect(metrics.remaining).toBe(0);
    expect(metrics.isOverBudget).toBe(false);
  });

  it("calculates per-guest spend correctly", () => {
    const metrics = calculateBudgetMetrics(breakdown, 40);
    expect(metrics.perGuestCost).toBe(Math.round(25000 / 40)); // 625 INR
  });

  it("accurately detects over-budget plans", () => {
    const overBudgetBreakdown: BudgetBreakdown = {
      ...breakdown,
      totalBudget: 20000, // Allocated is 25000
    };

    const metrics = calculateBudgetMetrics(overBudgetBreakdown, 40);
    expect(metrics.isOverBudget).toBe(true);
    expect(metrics.overBudgetAmount).toBe(5000);
    expect(metrics.remaining).toBe(-5000);
    expect(metrics.feasibilityWarnings.some((w) => w.includes("over budget"))).toBe(true);
  });

  it("correctly identifies priority totals (must-have vs nice-to-have vs splurge)", () => {
    const metrics = calculateBudgetMetrics(breakdown, 40);
    // Must have: 5000 (Venue) + 10000 (Catering) + 2000 (Contingency) = 17000
    expect(metrics.priorityBreakdown.mustHave.total).toBe(17000);
    // Nice to have: 4500 (Decor)
    expect(metrics.priorityBreakdown.niceToHave.total).toBe(4500);
    // Splurge: 3500 (Photo)
    expect(metrics.priorityBreakdown.splurge.total).toBe(3500);
  });

  it("generates cost optimization that preserves must-have items while trimming splurge & nice-to-have", () => {
    const optimization = generateCostOptimization(breakdown);

    expect(optimization.suggestions.length).toBeGreaterThan(0);
    // None of the suggestions should target must-have items
    const suggestedItemIds = optimization.suggestions.map((s) => s.itemId);
    expect(suggestedItemIds).toContain("b4"); // splurge
    expect(suggestedItemIds).toContain("b3"); // nice-to-have
    expect(suggestedItemIds).not.toContain("b1"); // must-have preserved!
    expect(suggestedItemIds).not.toContain("b2"); // must-have preserved!

    const metrics = calculateBudgetMetrics(breakdown, 40);
    expect(optimization.potentialSavings).toBeGreaterThan(0);
    expect(optimization.optimizedTotal).toBeLessThan(metrics.totalAllocated);
  });

  it("formats Indian Rupee according to standard convention", () => {
    expect(formatCurrency(25000, "INR")).toMatch(/25,000/);
    expect(formatCurrency(350000, "INR")).toMatch(/3,50,000/);
  });
});
