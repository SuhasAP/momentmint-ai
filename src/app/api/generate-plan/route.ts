import { NextRequest, NextResponse } from "next/server";
import { EventInputSchema } from "@/lib/schemas";
import { generateGeminiEventPlan, sanitizeErrorMessage } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, apiKey } = body;

    const validationResult = EventInputSchema.safeParse(input);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input parameters",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const plan = await generateGeminiEventPlan(validationResult.data, apiKey);
    return NextResponse.json({ success: true, plan });
  } catch (error) {
    const safeMsg = sanitizeErrorMessage((error as Error).message || "Unknown error occurred");
    console.error("[API] Error in /api/generate-plan:", safeMsg);
    return NextResponse.json(
      {
        error: "Failed to generate event plan",
        message: safeMsg,
      },
      { status: 500 }
    );
  }
}
