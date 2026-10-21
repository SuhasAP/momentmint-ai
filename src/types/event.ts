export type EventType =
  | "birthday"
  | "wedding"
  | "anniversary"
  | "engagement"
  | "baby_shower"
  | "graduation"
  | "corporate"
  | "festival"
  | "custom";

export type VenuePreference = "indoor" | "outdoor" | "hybrid";

export type PriorityItem =
  | "atmosphere_decor"
  | "gourmet_food"
  | "photography_video"
  | "entertainment_music"
  | "budget_savings"
  | "guest_comfort"
  | "eco_friendly";

export interface EventInput {
  eventType: EventType;
  customType?: string;
  title: string;
  date: string;
  city: string;
  guestCount: number;
  budget: number;
  currency: string; // e.g. "INR", "USD", "EUR", "GBP"
  venuePreference: VenuePreference;
  themeVibe: string;
  dietaryRequirements: string[];
  accessibilityNeeds: string[];
  priorities: PriorityItem[];
  additionalNotes?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  usage: string; // e.g. "Primary backdrop", "Floral accents"
}

export interface DecorIdea {
  id: string;
  area: string; // e.g. "Entrance Arch", "Dining Centerpieces"
  title: string;
  description: string;
  estimatedCost: number;
}

export interface ItineraryItem {
  id: string;
  time: string; // e.g. "17:30 - 18:30"
  title: string;
  description: string;
  durationMin: number;
  phase: "morning" | "afternoon" | "evening" | "night";
}

export interface BudgetItem {
  id: string;
  category: "Venue" | "Catering" | "Decor & Styling" | "Photography" | "Entertainment" | "Logistics & Staff" | "Gifts & Favors" | "Contingency" | "Other";
  name: string;
  estimatedCost: number;
  priority: "must-have" | "nice-to-have" | "splurge";
  notes: string;
  isCustom?: boolean;
}

export interface BudgetBreakdown {
  totalBudget: number;
  currency: string;
  contingencyPercentage: number;
  items: BudgetItem[];
}

export interface MenuItem {
  title: string;
  description: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  dietaryNotes?: string;
}

export interface MenuCourse {
  name: string; // e.g. "Welcome Drinks & Hors d'oeuvres", "Main Course Feast"
  items: MenuItem[];
}

export interface MenuPlan {
  cateringStyle: string; // e.g. "Live Stations & Passed Hors d'oeuvres", "Royal Thali Banquet"
  perHeadEstimate: number;
  courses: MenuCourse[];
  beverages: string[];
}

export interface ChecklistItem {
  id: string;
  phase: "4_weeks_prior" | "2_weeks_prior" | "week_of" | "day_of" | "post_event";
  task: string;
  dueDate: string;
  completed: boolean;
  category: string;
}

export interface VendorLead {
  id: string;
  category: string; // e.g. "Eco-friendly Decorator", "Locally Sourced Caterer"
  suggestedType: string;
  recommendationReason: string;
  typicalPriceRange: string;
  keyQuestionsToAsk: string[];
  verified: boolean; // clearly distinguishing suggestions vs real connected
  contactInfo?: string;
}

export interface RiskContingency {
  risk: string;
  impact: "low" | "medium" | "high";
  prevention: string;
  backupPlan: string;
}

export interface EventPlan {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  input: EventInput;
  aiMetadata: {
    model: string;
    generatedAt: string;
    isMockFallback?: boolean;
    executionTimeMs?: number;
    notes?: string;
  };
  concept: {
    name: string;
    summary: string;
    rationale: string;
    aestheticKeywords: string[];
  };
  styling: {
    colorPalette: ColorSwatch[];
    decorIdeas: DecorIdea[];
  };
  itinerary: ItineraryItem[];
  budgetBreakdown: BudgetBreakdown;
  menu: MenuPlan;
  checklist: ChecklistItem[];
  vendorLeads: VendorLead[];
  riskAndContingency: RiskContingency[];
  assumptions: string[];
  nextActionSteps: string[];
}

export interface CopilotDiff {
  rationale: string;
  summaryOfChanges: string;
  impactAnalysis: {
    budgetDiff: number;
    itineraryChanged: boolean;
    menuChanged: boolean;
    decorChanged: boolean;
    venueChanged?: boolean;
  };
  proposedPlan: Partial<EventPlan>;
  warningsOrTradeoffs?: string[];
}
