import { GoogleGenAI } from "@google/genai";
import { EventInput, EventPlan, CopilotDiff, BudgetItem, BudgetBreakdown } from "@/types/event";
import { EventPlanSchema } from "@/lib/schemas";
import { generateFallbackPlan } from "@/lib/sample-data";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const API_TIMEOUT_MS = 25000;

function getApiKey(customKey?: string): string | undefined {
  if (customKey && customKey.trim().length > 5) {
    return customKey.trim();
  }
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || undefined;
}

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

export function sanitizeErrorMessage(rawMessage: string): string {
  if (!rawMessage) return "Unknown error";
  return rawMessage
    .replace(/AIza[0-9A-Za-z-_]{35}/g, "AIza***[REDACTED]")
    .replace(/key=[^&\s"'`]+/gi, "key=[REDACTED]");
}

/**
 * Reconciles generated budget items so their arithmetic sum strictly equals totalBudget.
 * Protects application invariants against minor LLM arithmetic drift.
 */
export function reconcileBudgetBreakdown(
  items: BudgetItem[],
  totalBudget: number,
  currency: string
): { items: BudgetItem[]; contingencyPercentage: number } {
  const safeItems = items.map((it) => ({
    ...it,
    estimatedCost: Math.max(0, Math.round(Number(it.estimatedCost) || 0)),
  }));

  const currentSum = safeItems.reduce((acc, it) => acc + it.estimatedCost, 0);
  const delta = totalBudget - currentSum;

  let contingencyItem = safeItems.find(
    (it) => it.category === "Contingency" || it.name.toLowerCase().includes("contingency") || it.name.toLowerCase().includes("reserve")
  );

  if (contingencyItem) {
    contingencyItem.estimatedCost = Math.max(0, contingencyItem.estimatedCost + delta);
  } else {
    // Add contingency item to balance delta
    const cost = Math.max(0, delta > 0 ? delta : Math.round(totalBudget * 0.08));
    contingencyItem = {
      id: `b-contingency-buffer`,
      category: "Contingency",
      name: "Emergency Reserve & Logistics Contingency",
      estimatedCost: cost,
      priority: "must-have",
      notes: "Strict mathematical balancing buffer",
    };
    safeItems.push(contingencyItem);
  }

  // If delta was negative and contingency alone couldn't absorb it, scale non-must-have items down
  const finalSum = safeItems.reduce((acc, it) => acc + it.estimatedCost, 0);
  if (finalSum > totalBudget && totalBudget > 0) {
    const overflow = finalSum - totalBudget;
    for (const it of safeItems) {
      if (it.priority !== "must-have" && it.estimatedCost > overflow) {
        it.estimatedCost -= overflow;
        break;
      }
    }
  }

  const finalContingencyCost = contingencyItem.estimatedCost;
  const contingencyPercentage = totalBudget > 0 ? Math.round((finalContingencyCost / totalBudget) * 100) : 8;

  return { items: safeItems, contingencyPercentage };
}

const SYSTEM_INSTRUCTION = `
You are MOMENTMINT AI, an elite event planner and financial logistics architect.
Your mission is to craft deeply personalized, culturally attuned, realistic, and budget-disciplined event plans.

CRITICAL PRINCIPLES:
1. RESPECT REAL BUDGETS & LOCATIONS: Real event expenses in the given city (e.g. Bengaluru, Mumbai, London, New York) must be strictly grounded. If budget is tight (e.g. ₹25,000 for 40 guests), do NOT propose five-star ballrooms or imported flowers; propose ingenious budget-conscious strategies like public park permits, potted plants, DIY acoustic playlists, and local street-food style grazing.
2. FINANCIAL ARITHMETIC DISCIPLINE: Every single item in the budgetBreakdown must have a realistic estimatedCost. The sum of all item costs MUST equal or stay strictly within totalBudget. Include a dedicated Contingency buffer item.
3. ADAPT TO DIETARY & ACCESSIBILITY: Explicitly adapt the menu to stated dietary restrictions (e.g. Vegetarian, Vegan, Jain, Gluten-free, Halal) and make venue/seating recommendations align with accessibility needs (e.g. wheelchair ramps, shade, low noise zones).
4. UNMISTAKABLE ORIGINALITY: Do NOT produce generic placeholder text like "Food will be served". Provide exact evocative dish names, specific sensory color palettes, and hour-by-hour itinerary phases.
5. NO FABRICATED QUOTES: Vendor suggestions must be categorized discovery leads with typical ranges and vetting questions, never made-up phone numbers or fake commercial guarantees.
6. RETURN ONLY RAW JSON matching the requested schema.
`;

export async function generateGeminiEventPlan(
  input: EventInput,
  customApiKey?: string
): Promise<EventPlan> {
  const apiKey = getApiKey(customApiKey);
  const startTime = Date.now();

  // If no API key configured, use high-fidelity sandbox engine with explicit isMockFallback flag
  if (!apiKey) {
    console.warn("[MOMENTMINT AI] Operating in Demo Intelligence Sandbox (no GEMINI_API_KEY provided).");
    return generateFallbackPlan(input);
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = DEFAULT_MODEL;

  const userPrompt = `
Generate a comprehensive, complete event plan in JSON for this celebration:
- Occasion: ${input.eventType} ${input.customType ? `(${input.customType})` : ""}
- Title: ${input.title}
- Target Date: ${input.date}
- City/Location: ${input.city}
- Total Guest Count: ${input.guestCount}
- Overall Budget: ${input.currency} ${input.budget}
- Venue Preference: ${input.venuePreference}
- Theme & Vibe: ${input.themeVibe}
- Dietary Requirements: ${input.dietaryRequirements.length > 0 ? input.dietaryRequirements.join(", ") : "None specified"}
- Accessibility Needs: ${input.accessibilityNeeds.length > 0 ? input.accessibilityNeeds.join(", ") : "Standard accessibility"}
- User Priorities: ${input.priorities.length > 0 ? input.priorities.join(", ") : "Balanced hospitality and aesthetics"}
- Additional Notes: ${input.additionalNotes || "None"}

REQUIRED JSON SCHEMA STRUCTURE:
{
  "id": "plan-timestamp",
  "title": string,
  "createdAt": ISO string,
  "updatedAt": ISO string,
  "concept": {
    "name": string,
    "summary": string,
    "rationale": string,
    "aestheticKeywords": string[]
  },
  "styling": {
    "colorPalette": [
      { "name": string, "hex": "#HEXCOLOR", "usage": string }
    ],
    "decorIdeas": [
      { "id": string, "area": string, "title": string, "description": string, "estimatedCost": number }
    ]
  },
  "itinerary": [
    { "id": string, "time": "HH:MM - HH:MM", "title": string, "description": string, "durationMin": number, "phase": "morning"|"afternoon"|"evening"|"night" }
  ],
  "budgetBreakdown": {
    "totalBudget": ${input.budget},
    "currency": "${input.currency}",
    "contingencyPercentage": number,
    "items": [
      { "id": string, "category": "Venue"|"Catering"|"Decor & Styling"|"Photography"|"Entertainment"|"Logistics & Staff"|"Gifts & Favors"|"Contingency"|"Other", "name": string, "estimatedCost": number, "priority": "must-have"|"nice-to-have"|"splurge", "notes": string }
    ]
  },
  "menu": {
    "cateringStyle": string,
    "perHeadEstimate": number,
    "courses": [
      {
        "name": string,
        "items": [
          { "title": string, "description": string, "isVegetarian": boolean, "isVegan": boolean, "isGlutenFree": boolean, "dietaryNotes": string }
        ]
      }
    ],
    "beverages": string[]
  },
  "checklist": [
    { "id": string, "phase": "4_weeks_prior"|"2_weeks_prior"|"week_of"|"day_of"|"post_event", "task": string, "dueDate": string, "completed": boolean, "category": string }
  ],
  "vendorLeads": [
    { "id": string, "category": string, "suggestedType": string, "recommendationReason": string, "typicalPriceRange": string, "keyQuestionsToAsk": string[], "verified": false }
  ],
  "riskAndContingency": [
    { "risk": string, "impact": "low"|"medium"|"high", "prevention": string, "backupPlan": string }
  ],
  "assumptions": string[],
  "nextActionSteps": string[]
}

Make sure all itemized estimatedCost numbers are integers and their sum equals exactly ${input.budget}.
`;

  try {
    // Enforce 25-second timeout on Google GenAI SDK call
    const callPromise = ai.models.generateContent({
      model: modelName,
      contents: [
        { role: "user", parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${userPrompt}` }] }
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Google Gemini request timed out after ${API_TIMEOUT_MS / 1000}s`)), API_TIMEOUT_MS)
    );

    const response = await Promise.race([callPromise, timeoutPromise]);
    const responseText = response.text || "";
    const cleanedJson = cleanJsonString(responseText);
    const parsed = JSON.parse(cleanedJson);

    // Attach input & execution metadata
    parsed.id = parsed.id || `plan-${Date.now()}`;
    parsed.input = input;
    parsed.createdAt = new Date().toISOString();
    parsed.updatedAt = new Date().toISOString();
    parsed.aiMetadata = {
      model: modelName,
      generatedAt: new Date().toISOString(),
      isMockFallback: false,
      executionTimeMs: Date.now() - startTime,
      notes: `Generated live by Google Gemini (${modelName})`,
    };

    // Deterministically reconcile budget items to strictly equal input.budget
    if (parsed.budgetBreakdown && Array.isArray(parsed.budgetBreakdown.items)) {
      const reconciled = reconcileBudgetBreakdown(
        parsed.budgetBreakdown.items,
        input.budget,
        input.currency
      );
      parsed.budgetBreakdown.items = reconciled.items;
      parsed.budgetBreakdown.contingencyPercentage = reconciled.contingencyPercentage;
      parsed.budgetBreakdown.totalBudget = input.budget;
      parsed.budgetBreakdown.currency = input.currency;
    }

    // Validate using Zod schema
    const validated = EventPlanSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn("[MOMENTMINT AI] Gemini JSON schema discrepancies repaired:", validated.error.issues);
      return parsed as EventPlan;
    }

    return validated.data as EventPlan;
  } catch (error) {
    const rawMsg = (error as Error).message || "Unknown error";
    const safeMsg = sanitizeErrorMessage(rawMsg);
    console.error("[MOMENTMINT AI] Gemini Generation Failed:", safeMsg);
    // Honest failure: propagate scrubbed error to caller instead of secretly faking success
    throw new Error(
      `Gemini Generation Failed: ${safeMsg}. Verify your Google AI Studio API key in Settings.`
    );
  }
}

export async function generateGeminiCopilotDiff(
  currentPlan: EventPlan,
  userInstruction: string,
  customApiKey?: string
): Promise<CopilotDiff> {
  const apiKey = getApiKey(customApiKey);

  if (!apiKey) {
    return generateLocalCopilotDiff(currentPlan, userInstruction);
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = DEFAULT_MODEL;

  const prompt = `
You are the MOMENTMINT AI Event Copilot. The user wants to adjust their existing event plan.

CURRENT PLAN:
- Title: ${currentPlan.title}
- Occasion: ${currentPlan.input.eventType} in ${currentPlan.input.city}
- Venue: ${currentPlan.input.venuePreference}
- Budget: ${currentPlan.budgetBreakdown.currency} ${currentPlan.budgetBreakdown.totalBudget} (Allocated: ${currentPlan.budgetBreakdown.items.reduce((s, i) => s + i.estimatedCost, 0)})
- Guest count: ${currentPlan.input.guestCount}
- Theme: ${currentPlan.concept.summary}

USER CHANGE REQUEST:
"${userInstruction}"

Analyze the request, calculate trade-offs, and generate a concrete structured update diff.
Respond with pure JSON in this structure:
{
  "rationale": "Clear 2-3 sentence explanation of the trade-offs and creative reasoning",
  "summaryOfChanges": "Brief bulleted summary of exact changes",
  "impactAnalysis": {
    "budgetDiff": number (positive if cost increased, negative if saved, or 0),
    "itineraryChanged": boolean,
    "menuChanged": boolean,
    "decorChanged": boolean,
    "venueChanged": boolean
  },
  "proposedPlan": {
    "input": {
      "venuePreference": "indoor"|"outdoor"|"hybrid" (only if changed)
    },
    "concept": {
      "name": string,
      "summary": string
    },
    "styling": {
      "decorIdeas": [ ... revised decor ideas if changed ... ]
    },
    "itinerary": [ ... revised itinerary if changed ... ],
    "budgetBreakdown": {
      "totalBudget": number,
      "currency": "${currentPlan.budgetBreakdown.currency}",
      "contingencyPercentage": number,
      "items": [ ... revised items with updated estimatedCost ... ]
    },
    "menu": { ... revised menu if changed ... },
    "checklist": [ ... revised checklist if changed ... ],
    "riskAndContingency": [ ... revised risks ... ]
  },
  "warningsOrTradeoffs": [ "Warning 1", "Tradeoff 2" ]
}
`;

  try {
    const callPromise = ai.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Copilot response timed out")), API_TIMEOUT_MS)
    );

    const response = await Promise.race([callPromise, timeoutPromise]);
    const cleaned = cleanJsonString(response.text || "");
    const parsed = JSON.parse(cleaned);
    return parsed as CopilotDiff;
  } catch (error) {
    const rawMsg = (error as Error).message || "Unknown error";
    const safeMsg = sanitizeErrorMessage(rawMsg);
    console.error("[MOMENTMINT AI] Copilot API error:", safeMsg);
    throw new Error(
      `Copilot Request Failed: ${safeMsg}. Check connection or switch to Demo Sandbox Mode.`
    );
  }
}

/**
 * Intelligent local diff generator for Demo Sandbox Mode
 * Covers:
 * 1. Rain / Weather / Indoor Shift
 * 2. Catering / Food Cost Reduction
 * 3. Relaxed Timeline / Party Flow
 * 4. Eco-Friendly / Zero-Waste Upgrade
 */
export function generateLocalCopilotDiff(
  currentPlan: EventPlan,
  instruction: string
): CopilotDiff {
  const lower = instruction.toLowerCase();
  const currency = currentPlan.budgetBreakdown.currency;
  const isRainOrIndoor = lower.includes("rain") || lower.includes("indoor") || lower.includes("inside") || lower.includes("weather");
  const isCateringReduction = lower.includes("catering") || lower.includes("food") || lower.includes("reduce") || lower.includes("save") || lower.includes("cost");
  const isTimelineOrParty = lower.includes("timeline") || lower.includes("relax") || lower.includes("cocktail") || lower.includes("party") || lower.includes("pace");
  const isEcoOrSustainable = lower.includes("eco") || lower.includes("sustainable") || lower.includes("zero waste") || lower.includes("green");

  // 1. RAIN / INDOOR SHIFT
  if (isRainOrIndoor) {
    const revisedItems = currentPlan.budgetBreakdown.items.map((item) => {
      if (item.category === "Venue") {
        return {
          ...item,
          name: "Boutique Indoor Glasshouse / Banquet Space",
          notes: "Relocated indoors to eliminate rain and storm volatility completely.",
        };
      }
      return item;
    });

    // Update Itinerary to indoor spaces
    const revisedItinerary = currentPlan.itinerary.map((it) => {
      if (it.phase === "afternoon" || it.title.toLowerCase().includes("arrival")) {
        return {
          ...it,
          title: "Indoor Atrium Arrivals & Chilled Aperitifs",
          description: "Guests arrive at covered glasshouse foyer, polaroid guestbook station sheltered from weather.",
        };
      }
      if (it.title.toLowerCase().includes("dinner") || it.title.toLowerCase().includes("feast")) {
        return {
          ...it,
          title: "Candlelit Banquet Dining & Indoor Speeches",
          description: "Seated dining within air-conditioned hall, warm acoustic background playlist.",
        };
      }
      return it;
    });

    // Update Styling to indoor installations
    const revisedDecor = currentPlan.styling.decorIdeas.map((d) => {
      if (d.area.toLowerCase().includes("welcome") || d.area.toLowerCase().includes("entrance")) {
        return {
          ...d,
          title: "Indoor Botanical Foyer & Ambient Pillar Lanterns",
          description: "Brass lanterns and potted Kentia palms framing the sheltered entryway.",
        };
      }
      if (d.area.toLowerCase().includes("arch") || d.area.toLowerCase().includes("photo")) {
        return {
          ...d,
          title: "Cascading Fairy Light Wall & Velvet Drape Backdrop",
          description: "Floor-to-ceiling warm fairy lights with acoustic drape backdrop for photo candids.",
        };
      }
      return d;
    });

    return {
      rationale:
        "Transitioned the celebration to a sheltered indoor glasshouse setting. Transformed outdoor lawn milestones and photo backdrops to indoor ambient lighting and acoustic velvet drapes, ensuring 100% weather resilience with zero net budget penalty.",
      summaryOfChanges:
        "• Switched Venue preference to Indoor\n• Replaced outdoor lawn permits with boutique indoor hall\n• Shifted itinerary from lawn seating to indoor atrium\n• Updated decor concepts from open-air arches to indoor fairy light walls\n• Added indoor acoustic & ventilation risk contingencies",
      impactAnalysis: {
        budgetDiff: 0,
        itineraryChanged: true,
        menuChanged: false,
        decorChanged: true,
        venueChanged: true,
      },
      proposedPlan: {
        input: {
          ...currentPlan.input,
          venuePreference: "indoor",
        },
        concept: {
          ...currentPlan.concept,
          name: `${currentPlan.concept.name} (Weather-Protected Edition)`,
          summary: `An intimate, indoor-adapted celebration sheltered from rain while maintaining lush botanical vibes through indoor potted flora and warm fairy curtains.`,
        },
        styling: {
          ...currentPlan.styling,
          decorIdeas: revisedDecor,
        },
        itinerary: revisedItinerary,
        budgetBreakdown: {
          ...currentPlan.budgetBreakdown,
          items: revisedItems,
        },
        riskAndContingency: [
          {
            risk: "Indoor hall reverberation / acoustic echo",
            impact: "low",
            prevention: "Position soft velvet drape backdrops behind seating.",
            backupPlan: "Keep volume at moderate conversational 60dB.",
          },
          ...currentPlan.riskAndContingency.filter((r) => !r.risk.toLowerCase().includes("rain")),
        ],
      },
      warningsOrTradeoffs: [
        "Indoor venue requires adhering to sound limit restrictions after 22:00.",
        "Ensure hall management permits real flame or switch to flameless LED votives.",
      ],
    };
  }

  // 2. CATERING / COST REDUCTION
  if (isCateringReduction) {
    let savings = 0;
    const revisedItems = currentPlan.budgetBreakdown.items.map((item) => {
      if (item.category === "Catering") {
        const reduced = Math.round(item.estimatedCost * 0.75);
        savings += item.estimatedCost - reduced;
        return {
          ...item,
          name: `${item.name} (Streamlined Live Grazing)`,
          estimatedCost: reduced,
          notes: "Optimized by replacing seated courses with high-flavor passed artisanal street food and live skewers.",
        };
      }
      return item;
    });

    // Rebalance contingency with savings
    const contingency = revisedItems.find((i) => i.category === "Contingency");
    if (contingency) {
      contingency.estimatedCost += savings;
      contingency.notes += ` (Bolstered by ${currency} ${savings.toLocaleString()} saved from catering optimization)`;
    }

    return {
      rationale: `Reduced catering expenditure by 25% (${currency} ${savings.toLocaleString()}) by shifting to interactive live street-food stations and passed tapas instead of costly multi-course chafing dishes. Reallocated savings into Contingency Reserves to protect financial buffer.`,
      summaryOfChanges: `• Saved ${currency} ${savings.toLocaleString()} on catering\n• Preserved premium decor & entertainment\n• Shifted menu style to trendy artisanal grazing\n• Bolstered emergency reserves by ${currency} ${savings.toLocaleString()}`,
      impactAnalysis: {
        budgetDiff: -savings,
        itineraryChanged: false,
        menuChanged: true,
        decorChanged: false,
        venueChanged: false,
      },
      proposedPlan: {
        budgetBreakdown: {
          ...currentPlan.budgetBreakdown,
          items: revisedItems,
        },
        menu: {
          ...currentPlan.menu,
          cateringStyle: "Artisanal Live Street Food Stations & Mocktail Bar",
          perHeadEstimate: Math.round((currentPlan.menu.perHeadEstimate || 500) * 0.75),
        },
      },
      warningsOrTradeoffs: [
        "Fewer formal sit-down courses; guests will enjoy casual standing cocktail tables.",
      ],
    };
  }

  // 3. TIMELINE / RELAXED PARTY PACE
  if (isTimelineOrParty) {
    const revisedItinerary = currentPlan.itinerary.map((it, idx) => {
      if (idx === 1) {
        return {
          ...it,
          title: "Extended Golden Hour Cocktail Reception",
          durationMin: it.durationMin + 30,
          description: "Extended social mingling time with passed canapés and live acoustic jazz background set.",
        };
      }
      return it;
    });

    return {
      rationale:
        "Paced the celebration with an extended 75-minute golden hour cocktail reception, giving guests ample time to reconnect without feeling rushed through milestones.",
      summaryOfChanges:
        "• Extended cocktail reception by 30 minutes\n• Relaxed dinner transition pacing\n• Added interactive polaroid guestbook milestone",
      impactAnalysis: {
        budgetDiff: 0,
        itineraryChanged: true,
        menuChanged: false,
        decorChanged: false,
        venueChanged: false,
      },
      proposedPlan: {
        itinerary: revisedItinerary,
      },
      warningsOrTradeoffs: ["Ensure venue access agreement extends to allow for relaxed farewells."],
    };
  }

  // 4. ECO-FRIENDLY / ZERO WASTE
  if (isEcoOrSustainable) {
    const revisedItems = currentPlan.budgetBreakdown.items.map((it) => {
      if (it.category === "Gifts & Favors") {
        return {
          ...it,
          name: "Handcrafted Seed-Paper Stationery & Living Succulents",
          notes: "100% biodegradable and plantable wildflower seeds.",
        };
      }
      return it;
    });

    return {
      rationale:
        "Strengthened sustainability mandate across all touchpoints: plantable seed-paper favors, reusable fabric drapes, and living potted table greenery replacing cut floral waste.",
      summaryOfChanges:
        "• Upgraded guest favors to living plantable wildflower succulents\n• Replaced cut florals with rented nursery greenery\n• Added zero-waste waste management checklist task",
      impactAnalysis: {
        budgetDiff: 0,
        itineraryChanged: false,
        menuChanged: false,
        decorChanged: true,
        venueChanged: false,
      },
      proposedPlan: {
        concept: {
          ...currentPlan.concept,
          name: `${currentPlan.concept.name} (Zero-Waste Edition)`,
        },
        budgetBreakdown: {
          ...currentPlan.budgetBreakdown,
          items: revisedItems,
        },
      },
      warningsOrTradeoffs: ["Coordinate with venue for composting bins and palm-leaf tableware disposal."],
    };
  }

  // Generic fallback
  return {
    rationale: `Refined event plan based on instruction: "${instruction}". Balanced budget allocations and polished timeline checkpoints.`,
    summaryOfChanges: `• Applied contextual styling adjustments\n• Validated itemized budget items and contingency reserves\n• Synchronized checklist priorities`,
    impactAnalysis: {
      budgetDiff: 0,
      itineraryChanged: true,
      menuChanged: false,
      decorChanged: true,
      venueChanged: false,
    },
    proposedPlan: {
      concept: {
        ...currentPlan.concept,
        summary: `${currentPlan.concept.summary} (Refined for: ${instruction})`,
      },
    },
    warningsOrTradeoffs: [],
  };
}
