import { BudgetBreakdown, BudgetItem } from "@/types/event";

export interface CategorySummary {
  category: string;
  total: number;
  itemCount: number;
  percentageOfBudget: number;
  percentageOfAllocated: number;
  items: BudgetItem[];
}

export interface BudgetMetrics {
  totalBudget: number;
  totalAllocated: number;
  remaining: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  percentAllocated: number;
  perGuestCost: number;
  currency: string;
  categories: CategorySummary[];
  priorityBreakdown: {
    mustHave: { total: number; percent: number; count: number };
    niceToHave: { total: number; percent: number; count: number };
    splurge: { total: number; percent: number; count: number };
  };
  feasibilityWarnings: string[];
}

export function formatCurrency(amount: number, currency = "INR"): string {
  const safeAmount = Math.round(Number(amount) || 0);

  if (currency === "INR") {
    // Format Indian Numbering System: e.g. ₹25,000 or ₹8,50,000
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(safeAmount);
    } catch {
      return `₹${safeAmount.toLocaleString("en-IN")}`;
    }
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(safeAmount);
  } catch {
    return `${currency} ${safeAmount.toLocaleString()}`;
  }
}

export function calculateBudgetMetrics(
  budget: BudgetBreakdown,
  guestCount = 1
): BudgetMetrics {
  const safeGuestCount = Math.max(1, guestCount || 1);
  const totalBudget = Math.max(0, Number(budget.totalBudget) || 0);
  const currency = budget.currency || "INR";
  const items = Array.isArray(budget.items) ? budget.items : [];

  // Deterministic arithmetic sum - invariant: totalAllocated == sum of all items
  const totalAllocated = items.reduce((sum, item) => sum + (Math.max(0, Number(item.estimatedCost) || 0)), 0);
  const remaining = totalBudget - totalAllocated;
  const isOverBudget = remaining < 0;
  const overBudgetAmount = isOverBudget ? Math.abs(remaining) : 0;
  const percentAllocated = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;
  const perGuestCost = Math.round(totalAllocated / safeGuestCount);

  // Group by category
  const categoryMap = new Map<string, BudgetItem[]>();
  items.forEach((item) => {
    const cat = item.category || "Other";
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, []);
    }
    categoryMap.get(cat)!.push(item);
  });

  const categories: CategorySummary[] = Array.from(categoryMap.entries()).map(([category, catItems]) => {
    const catTotal = catItems.reduce((acc, it) => acc + (Math.max(0, Number(it.estimatedCost) || 0)), 0);
    return {
      category,
      total: catTotal,
      itemCount: catItems.length,
      percentageOfBudget: totalBudget > 0 ? (catTotal / totalBudget) * 100 : 0,
      percentageOfAllocated: totalAllocated > 0 ? (catTotal / totalAllocated) * 100 : 0,
      items: catItems,
    };
  }).sort((a, b) => b.total - a.total);

  // Priority breakdown
  let mustHaveTotal = 0;
  let mustHaveCount = 0;
  let niceToHaveTotal = 0;
  let niceToHaveCount = 0;
  let splurgeTotal = 0;
  let splurgeCount = 0;

  items.forEach((item) => {
    const cost = Math.max(0, Number(item.estimatedCost) || 0);
    if (item.priority === "must-have") {
      mustHaveTotal += cost;
      mustHaveCount++;
    } else if (item.priority === "nice-to-have") {
      niceToHaveTotal += cost;
      niceToHaveCount++;
    } else {
      splurgeTotal += cost;
      splurgeCount++;
    }
  });

  // Feasibility & Warnings
  const feasibilityWarnings: string[] = [];
  if (isOverBudget) {
    feasibilityWarnings.push(
      `Plan is currently over budget by ${formatCurrency(overBudgetAmount, currency)} (${Math.round(percentAllocated)}% allocated).`
    );
  }

  if (safeGuestCount > 0 && perGuestCost < 150 && currency === "INR") {
    feasibilityWarnings.push(
      `Allocated per-guest spend is ${formatCurrency(perGuestCost, currency)}, which is tight for full hospitality in metro cities.`
    );
  }

  const hasCatering = items.some((i) => i.category === "Catering");
  if (!hasCatering && safeGuestCount > 10) {
    feasibilityWarnings.push("No catering or food expense is currently allocated in this plan.");
  }

  const hasVenue = items.some((i) => i.category === "Venue");
  if (!hasVenue) {
    feasibilityWarnings.push("Venue expense is ₹0. Assumes private home, free public park, or pre-arranged space.");
  }

  return {
    totalBudget,
    totalAllocated,
    remaining,
    isOverBudget,
    overBudgetAmount,
    percentAllocated,
    perGuestCost,
    currency,
    categories,
    priorityBreakdown: {
      mustHave: {
        total: mustHaveTotal,
        percent: totalAllocated > 0 ? (mustHaveTotal / totalAllocated) * 100 : 0,
        count: mustHaveCount,
      },
      niceToHave: {
        total: niceToHaveTotal,
        percent: totalAllocated > 0 ? (niceToHaveTotal / totalAllocated) * 100 : 0,
        count: niceToHaveCount,
      },
      splurge: {
        total: splurgeTotal,
        percent: totalAllocated > 0 ? (splurgeTotal / totalAllocated) * 100 : 0,
        count: splurgeCount,
      },
    },
    feasibilityWarnings,
  };
}

export interface OptimizationSuggestion {
  itemId: string;
  name: string;
  category: string;
  currentCost: number;
  suggestedCost: number;
  savings: number;
  action: "reduce" | "remove" | "replace";
  rationale: string;
}

export function generateCostOptimization(
  budget: BudgetBreakdown,
  targetSavingsPercent = 15
): {
  suggestions: OptimizationSuggestion[];
  potentialSavings: number;
  optimizedTotal: number;
} {
  const items = [...budget.items];
  const suggestions: OptimizationSuggestion[] = [];
  let totalSavings = 0;

  // Rule 1: Splurge items are reviewed first
  items.forEach((item) => {
    if (item.priority === "splurge" && item.estimatedCost > 0) {
      const trimAmount = Math.round(item.estimatedCost * 0.4);
      suggestions.push({
        itemId: item.id,
        name: item.name,
        category: item.category,
        currentCost: item.estimatedCost,
        suggestedCost: item.estimatedCost - trimAmount,
        savings: trimAmount,
        action: "reduce",
        rationale: `Classified as a 'splurge' item. Trimming by 40% preserves core experience while yielding immediate savings.`,
      });
      totalSavings += trimAmount;
    }
  });

  // Rule 2: Non-essential Nice-to-have items
  items.forEach((item) => {
    if (item.priority === "nice-to-have" && item.estimatedCost > 0) {
      const trimAmount = Math.round(item.estimatedCost * 0.25);
      suggestions.push({
        itemId: item.id,
        name: item.name,
        category: item.category,
        currentCost: item.estimatedCost,
        suggestedCost: item.estimatedCost - trimAmount,
        savings: trimAmount,
        action: "reduce",
        rationale: `Classified as 'nice-to-have'. Negotiating local alternatives or simplifying scope can save ~25%.`,
      });
      totalSavings += trimAmount;
    }
  });

  // Calculate current total
  const currentTotal = items.reduce((s, i) => s + (Number(i.estimatedCost) || 0), 0);
  const optimizedTotal = currentTotal - totalSavings;

  return {
    suggestions,
    potentialSavings: totalSavings,
    optimizedTotal,
  };
}
