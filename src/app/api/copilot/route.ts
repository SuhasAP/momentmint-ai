import { NextRequest, NextResponse } from "next/server";
import { CopilotRequestSchema } from "@/lib/schemas";
import { generateGeminiCopilotDiff, sanitizeErrorMessage } from "@/lib/gemini";

export const maxDuration = 30; // Extend Vercel function timeout window to 30 seconds
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = CopilotRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { currentPlan, userInstruction, apiKey, model } = validationResult.data;
    const diff = await generateGeminiCopilotDiff(currentPlan, userInstruction, apiKey, model);

    return NextResponse.json({ success: true, diff });
  } catch (error) {
    const rawMsg = (error as Error).message || "Unknown error occurred";
    const safeMsg = sanitizeErrorMessage(rawMsg);
    console.error("[API] Error in /api/copilot:", safeMsg);

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
        error: "Failed to process copilot instruction",
        message: safeMsg,
      },
      { status }
    );
  }
}
