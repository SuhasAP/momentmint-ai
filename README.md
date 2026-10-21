# MOMENTMINT AI

> **"Big moments. Brilliantly planned."**  
> *The AI-Powered Event Architect with Live Budget Intelligence and Conversational Copilot.*  
> Built for **Hack2Skill PromptWars — Challenge 5: Celebration & Event Planner**.

---

## 🌟 Executive Summary & Product Vision

Planning an unforgettable celebration—whether a milestone 30th botanical birthday in Bengaluru, a beach sunset engagement in Goa, or an AI startup launch—is traditionally plagued by fragmented spreadsheets, illusory budget guesses, disconnected vendor quotes, and sudden weather or headcount surprises.

**MOMENTMINT AI** solves this end-to-end. It transforms high-level event concepts, strict financial envelopes, guest counts, geographic locations, and cultural or dietary requirements into a living, editable, mathematically disciplined event plan.

At its heart lies a **Live Conversational Event Copilot** powered by **Google Gemini**. Unlike traditional static generators, the Momentmint Copilot reasons about real-world trade-offs (e.g., *"Rain is forecast; shift indoors without increasing the budget"*, or *"Reduce catering expenditure by 20% while protecting premium decor"*), computes atomic before/after diffs, and applies updates directly to the underlying plan state while maintaining mathematical invariants.

---

## 🚀 Key Implemented Features

### 1. Multi-Step Event Wizard & Scenario Fast-Track
- **Cultural & Occasion Attunement**: Support for birthdays, weddings, engagements, anniversaries, baby showers, graduations, festivals, and custom occasions.
- **Micro-Targeted Preferences**: City economics (Bengaluru, Mumbai, Delhi, Goa, etc.), indoor/outdoor/hybrid venue settings, dietary restrictions (Vegetarian, Vegan, Jain, Gluten-free, Halal), and accessibility requirements (step-free, wheelchair accessible, low-noise zones).
- **1-Click Test Scenarios**: Instant prefill helper with real competition test cases including the standard 40-guest Bengaluru botanical celebration under ₹25,000.
- **Client-Side Validation**: Immediate feedback on negative budgets, zero guests, or unrealistic spend thresholds.

### 2. Live Budget Intelligence (Deterministic Arithmetic)
- **Zero Hallucination Guarantee**: Financial arithmetic is computed and validated deterministically by application code (`calculateBudgetMetrics`), maintaining the invariant that itemized category sums strictly equal the displayed total allocated budget.
- **Real-Time Category Visualizations**: Immediate categorization into Venue, Catering, Decor, Photography, Entertainment, Logistics, Favors, and Contingency.
- **Interactive Editing**: Add custom expense lines, adjust estimated costs inline, change item priorities (`must-have`, `nice-to-have`, `splurge`), or remove line items with instant metric recalculation.
- **Priority-Protected Cost Optimizer**: An AI/algorithmic assistant that identifies discretionary savings on "splurge" and "nice-to-have" items while strictly shielding all "must-have" items.

### 3. Conversational Event Copilot
- **Trade-Off Reasoning**: Natural language prompt processing through Google Gemini (`gemini-3.8-flash` or `gemini-2.5-flash`).
- **Structured Before/After Diffs**: Evaluates the impact on budget diffs, venue transitions, itinerary pacing, and menu adaptations.
- **Atomic Plan Updates**: Users can review strategic rationales and warnings, then click **Apply to Live Plan** to atomically update the underlying event state and recalculate all financial constraints.

### 4. Cohesive Event Workspace
- **Overview & Aesthetic Swatches**: Event summary, strategic rationale, moodboard color swatches with 1-click hex copying, spatial decor installations, and key planning assumptions.
- **Master Time-Blocked Itinerary**: Hour-by-hour timeline categorized into morning, afternoon, evening, and night phases, with full add/edit/delete capabilities.
- **Gastronomy & Dining Experience**: Curated catering style, per-head food cost calculations, multi-course menus with dietary badges (Veg, Vegan, GF), and signature beverage pairings.
- **Master Preparation Checklist**: Phased milestone tracker (4 weeks prior, 2 weeks prior, week of, day of, post-event) with interactive completion toggles and progress bar.
- **Grounded Vendor Discovery Leads**: Recommended vendor categories, typical market price ranges, and essential vetting questions, clearly distinguishing discovery leads from verified contracts.

### 5. Dossier Export & Print Engine
- Formatted dossier view ready for client printout or browser "Save as PDF".
- 1-click JSON export and import for seamless portability.
- Resilient client persistence (`localStorage`) with duplicate, rename, and delete safeguards.

---

## 🏗 Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Client UI (Next.js 16)                 │
│  - Tailwind CSS (Warm Ivory, Midnight Navy, Violet, Coral)  │
│  - Lucide React Icons & Accessible Headless Components      │
│  - Canvas Confetti for Event Generation Celebrations        │
└───────────────┬───────────────────────────────┬─────────────┘
                │                               │
                ▼                               ▼
┌───────────────────────────────┐ ┌───────────────────────────┐
│     Client Domain Engines     │ │    Browser Persistence    │
│  - budget-math.ts (Invariants)│ │  - localStorage Engine    │
│  - storage.ts (Safe SSR)      │ │  - JSON & PDF Export      │
└───────────────┬───────────────┘ └───────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js App Router API Routes             │
│  - /api/generate-plan (Zod Schema Validation)               │
│  - /api/copilot (Trade-off & Diff Synthesis)                │
│  - /api/optimize-budget (Discretionary Cost Trimming)       │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│             Official Google GenAI SDK (@google/genai)        │
│  - Gemini 2.5 Flash / Gemini 1.5 Flash                      │
│  - System Instructions & Structured JSON Schema Outputs     │
│  - Graceful Fallback Sandbox for Offline Evaluation         │
└─────────────────────────────────────────────────────────────┘
```

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with custom palette tokens (`#FAF9F5` Warm Ivory, `#0F172A` Midnight Navy, `#6366F1` Vivid Violet, `#F43F5E` Vivid Coral)
- **GenAI SDK**: Official `@google/genai` (Google GenAI SDK)
- **Schema Validation**: Zod (`EventInputSchema`, `EventPlanSchema`, `CopilotRequestSchema`)
- **Testing**: Vitest (11 passing tests for budget arithmetic, invariant enforcement, and schema constraints)

---

## 🔑 Setup & Environment Instructions

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `10+` or `11+`

### Installation
1. Clone or navigate to the repository directory:
   ```bash
   git clone <repo-url>
   cd momentmint-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Google AI Studio Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-3.8-flash
   ```
   *(Note: You can also enter or switch your Gemini API key directly inside the running application via the Settings dialog, or test the application in Demo Sandbox Mode without an API key).*

4. Run Development Server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Run Production Build:
   ```bash
   npm run build
   npm run start
   ```

6. Run Unit & Invariant Test Suite:
   ```bash
   npm test
   ```

---

## 🤖 Why Generative AI is Central to the Solution

Traditional event planners rely on rigid questionnaire templates with hardcoded line items. They fail because:
1. **Contextual Nuance**: A ₹25,000 budget for 40 guests in Bengaluru requires completely different logistics than the same budget in London or a rural town. Gemini understands hyper-local pricing dynamics, recommending park permits and potted rental greenery rather than expensive floral imports.
2. **Conversational Trade-Offs**: When rain strikes an outdoor garden party, adjusting the plan isn't a simple toggle; it involves moving seating indoors, adding misting fans or acoustic backdrops, adjusting vendor call times, and rebalancing costs. Gemini reasons about these ripple effects across the entire plan.
3. **Dietary & Sensory Hospitality**: Adapting menus for Jain, vegan, or gluten-free guests requires gastronomic creativity, pairing complimentary flavors and beverages rather than just leaving items off a plate.

---

## ⚠️ Known Limitations & Design Boundaries

1. **Vendor Quotations**: To preserve honesty and avoid hallucinated promises, vendor suggestions are strictly labeled as **Discovery Leads** with typical market ranges and vetting questions. Real booked vendors can be added and verified manually.
2. **Deterministic Arithmetic Boundary**: LLMs are notoriously prone to math errors; therefore, Gemini is never trusted for final financial calculations. All sums, remaining balances, and percentages are computed deterministically by `src/lib/budget-math.ts`.
3. **Browser Storage**: Prototype persistence uses browser `localStorage`. For multi-user enterprise deployments, a PostgreSQL or Supabase backend can be connected via Prisma/Drizzle.

Deployment attribution update.

Verified deployment author email.
