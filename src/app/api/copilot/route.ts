import { NextRequest, NextResponse } from "next/server";
import { CopilotRequestSchema } from "@/lib/schemas";
import { generateGeminiCopilotDiff, sanitizeErrorMessage } from "@/lib/gemini";

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
    const safeMsg = sanitizeErrorMessage((error as Error).message || "Unknown error occurred");
    console.error("[API] Error in /api/copilot:", safeMsg);
    return NextResponse.json(
      {
        error: "Failed to process copilot instruction",
        message: safeMsg,
      },
      { status: 500 }
    );
  }
}
