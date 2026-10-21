import { NextRequest, NextResponse } from "next/server";
import { EventInputSchema } from "@/lib/schemas";
import { generateGeminiEventPlan, sanitizeErrorMessage } from "@/lib/gemini";

export const maxDuration = 30; // Extend Vercel function timeout window to 30 seconds
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, apiKey, model } = body;

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

    const plan = await generateGeminiEventPlan(validationResult.data, apiKey, model);
    return NextResponse.json({ success: true, plan });
  } catch (error) {
    const rawMsg = (error as Error).message || "Unknown error occurred";
    const safeMsg = sanitizeErrorMessage(rawMsg);
    console.error("[API] Error in /api/generate-plan:", safeMsg);

    let status = 500;
    if (safeMsg.includes("503") || safeMsg.includes("high demand") || safeMsg.includes("overloaded")) {
      status = 503;
    } else if (safeMsg.includes("timed out") || safeMsg.includes("timeout")) {
      status = 504;
    } else if (safeMsg.includes("429") || safeMsg.includes("rate limit")) {
      status = 429;
    }

    return NextResponse.json(
      {
        error: "Failed to generate event plan",
        message: safeMsg,
      },
      { status }
    );
  }
}
