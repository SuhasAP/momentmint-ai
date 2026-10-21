import { z } from "zod";

export const PriorityItemSchema = z.enum([
  "atmosphere_decor",
  "gourmet_food",
  "photography_video",
  "entertainment_music",
  "budget_savings",
  "guest_comfort",
  "eco_friendly",
]);

export const EventInputSchema = z.object({
  eventType: z.enum([
    "birthday",
    "wedding",
    "anniversary",
    "engagement",
    "baby_shower",
    "graduation",
    "corporate",
    "festival",
    "custom",
  ]),
  customType: z.string().optional(),
  title: z.string().min(2, "Event title must be at least 2 characters").max(100),
  date: z.string().min(4, "Event date is required"),
  city: z.string().min(2, "City/Location is required"),
  guestCount: z.number().int().min(1, "Guest count must be at least 1").max(50000, "Guest count exceeds limit"),
  budget: z.number().positive("Budget must be a positive number"),
  currency: z.string().default("INR"),
  venuePreference: z.enum(["indoor", "outdoor", "hybrid"]),
  themeVibe: z.string().min(2, "Theme or vibe is required"),
  dietaryRequirements: z.array(z.string()).default([]),
  accessibilityNeeds: z.array(z.string()).default([]),
  priorities: z.array(PriorityItemSchema).default([]),
  additionalNotes: z.string().optional(),
});

export const ColorSwatchSchema = z.object({
  name: z.string(),
  hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Valid hex code required"),
  usage: z.string(),
});

export const DecorIdeaSchema = z.object({
  id: z.string(),
  area: z.string(),
  title: z.string(),
  description: z.string(),
  estimatedCost: z.number().nonnegative(),
});

export const ItineraryItemSchema = z.object({
  id: z.string(),
  time: z.string(),
  title: z.string(),
  description: z.string(),
  durationMin: z.number().int().positive(),
  phase: z.enum(["morning", "afternoon", "evening", "night"]),
});

export const BudgetItemSchema = z.object({
  id: z.string(),
  category: z.enum([
    "Venue",
    "Catering",
    "Decor & Styling",
    "Photography",
    "Entertainment",
    "Logistics & Staff",
    "Gifts & Favors",
    "Contingency",
    "Other",
  ]),
  name: z.string(),
  estimatedCost: z.number().nonnegative(),
  priority: z.enum(["must-have", "nice-to-have", "splurge"]),
  notes: z.string(),
  isCustom: z.boolean().optional(),
});

export const BudgetBreakdownSchema = z.object({
  totalBudget: z.number().positive(),
  currency: z.string(),
  contingencyPercentage: z.number().min(0).max(50),
  items: z.array(BudgetItemSchema),
});

export const MenuItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  dietaryNotes: z.string().optional(),
});

export const MenuCourseSchema = z.object({
  name: z.string(),
  items: z.array(MenuItemSchema),
});

export const MenuPlanSchema = z.object({
  cateringStyle: z.string(),
  perHeadEstimate: z.number().nonnegative(),
  courses: z.array(MenuCourseSchema),
  beverages: z.array(z.string()),
});

export const ChecklistItemSchema = z.object({
  id: z.string(),
  phase: z.enum(["4_weeks_prior", "2_weeks_prior", "week_of", "day_of", "post_event"]),
  task: z.string(),
  dueDate: z.string(),
  completed: z.boolean(),
  category: z.string(),
});

export const VendorLeadSchema = z.object({
  id: z.string(),
  category: z.string(),
  suggestedType: z.string(),
  recommendationReason: z.string(),
  typicalPriceRange: z.string(),
  keyQuestionsToAsk: z.array(z.string()),
  verified: z.boolean().default(false),
  contactInfo: z.string().optional(),
});

export const RiskContingencySchema = z.object({
  risk: z.string(),
  impact: z.enum(["low", "medium", "high"]),
  prevention: z.string(),
  backupPlan: z.string(),
});

export const EventPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  input: EventInputSchema,
  aiMetadata: z.object({
    model: z.string(),
    generatedAt: z.string(),
    isMockFallback: z.boolean().optional(),
    executionTimeMs: z.number().optional(),
    notes: z.string().optional(),
  }),
  concept: z.object({
    name: z.string(),
    summary: z.string(),
    rationale: z.string(),
    aestheticKeywords: z.array(z.string()),
  }),
  styling: z.object({
    colorPalette: z.array(ColorSwatchSchema),
    decorIdeas: z.array(DecorIdeaSchema),
  }),
  itinerary: z.array(ItineraryItemSchema),
  budgetBreakdown: BudgetBreakdownSchema,
  menu: MenuPlanSchema,
  checklist: z.array(ChecklistItemSchema),
  vendorLeads: z.array(VendorLeadSchema),
  riskAndContingency: z.array(RiskContingencySchema),
  assumptions: z.array(z.string()),
  nextActionSteps: z.array(z.string()),
});

export const CopilotRequestSchema = z.object({
  currentPlan: EventPlanSchema,
  userInstruction: z.string().min(3, "Please enter a specific instruction or question for the copilot"),
  apiKey: z.string().optional(),
  model: z.string().optional(),
});
