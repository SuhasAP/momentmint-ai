import { describe, it, expect } from "vitest";
import { reconcileBudgetBreakdown } from "../src/lib/gemini";
import { BudgetItem } from "../src/types/event";

describe("Deterministic Budget Reconciliation & Invariant Enforcement", () => {
  it("adjusts contingency when item sum is less than total budget", () => {
    const rawItems: BudgetItem[] = [
      { id: "1", category: "Venue", name: "Hall", estimatedCost: 10000, priority: "must-have", notes: "" },
      { id: "2", category: "Catering", name: "Food", estimatedCost: 8000, priority: "must-have", notes: "" },
      { id: "3", category: "Contingency", name: "Reserve", estimatedCost: 2000, priority: "must-have", notes: "" },
    ];
    // sum is 20000, but target is 25000 (delta +5000)
    const reconciled = reconcileBudgetBreakdown(rawItems, 25000, "INR");
    const sum = reconciled.items.reduce((s, i) => s + i.estimatedCost, 0);

    expect(sum).toBe(25000);
    const cont = reconciled.items.find((i) => i.category === "Contingency");
    expect(cont?.estimatedCost).toBe(7000); // 2000 + 5000
  });

  it("adds contingency buffer automatically if none existed and balances to target", () => {
    const rawItems: BudgetItem[] = [
      { id: "1", category: "Venue", name: "Hall", estimatedCost: 10000, priority: "must-have", notes: "" },
      { id: "2", category: "Catering", name: "Food", estimatedCost: 12000, priority: "must-have", notes: "" },
    ];
    // sum is 22000, target is 25000 (delta +3000)
    const reconciled = reconcileBudgetBreakdown(rawItems, 25000, "INR");
    const sum = reconciled.items.reduce((s, i) => s + i.estimatedCost, 0);

    expect(sum).toBe(25000);
    const cont = reconciled.items.find((i) => i.category === "Contingency");
    expect(cont).toBeDefined();
    expect(cont?.estimatedCost).toBe(3000);
  });

  it("scales non-must-have items if sum exceeds budget and contingency is exhausted", () => {
    const rawItems: BudgetItem[] = [
      { id: "1", category: "Venue", name: "Hall", estimatedCost: 15000, priority: "must-have", notes: "" },
      { id: "2", category: "Decor & Styling", name: "Excess Decor", estimatedCost: 15000, priority: "nice-to-have", notes: "" },
      { id: "3", category: "Contingency", name: "Reserve", estimatedCost: 1000, priority: "must-have", notes: "" },
    ];
    // sum is 31000, target is 25000
    const reconciled = reconcileBudgetBreakdown(rawItems, 25000, "INR");
    const sum = reconciled.items.reduce((s, i) => s + i.estimatedCost, 0);

    expect(sum).toBe(25000);
  });
});
