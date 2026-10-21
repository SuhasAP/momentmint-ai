import { NextRequest, NextResponse } from "next/server";
import { BudgetBreakdownSchema } from "@/lib/schemas";
import { generateCostOptimization } from "@/lib/budget-math";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { budgetBreakdown, targetSavingsPercent } = body;

    const validationResult = BudgetBreakdownSchema.safeParse(budgetBreakdown);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid budget breakdown",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const optimization = generateCostOptimization(
      validationResult.data,
      targetSavingsPercent || 15
    );

    return NextResponse.json({ success: true, optimization });
  } catch (error) {
    console.error("[API] Error in /api/optimize-budget:", error);
    return NextResponse.json(
      {
        error: "Failed to optimize budget",
        message: (error as Error).message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
