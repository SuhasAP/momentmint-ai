# Prompt Evolution & AI Engineering Methodology

This document outlines the prompt engineering strategy, observed failure modes, iterative refinements, and structural safeguards developed for **MOMENTMINT AI**.

---

## 1. Initial Prompt Design (Iteration 0)

### Initial Prompt Prototype
```text
You are an event planner. Generate an event plan for a birthday in Bengaluru for 40 guests with a budget of ₹25,000. Give me a budget, itinerary, menu, and decor ideas.
```

### Observed Failure Modes & Deficiencies:
1. **Mathematical Drift & Inconsistency**: The model generated individual item costs that summed to ₹34,500, despite the stated prompt limit of ₹25,000.
2. **Generic Placeholders**: The menu contained phrases such as *"Appetizers will be served"* and *"Delicious dessert"*, lacking gastronomic specificity or cultural attunement to Bengaluru.
3. **Hallucinated Business Data**: The model fabricated vendor names, contact numbers, and five-star rating guarantees.
4. **Unrealistic Venue Proposals**: For ₹25,000 across 40 guests (~₹625 per person), the model proposed luxury banquet halls that alone cost ₹50,000+ to book in Bengaluru.
5. **Unstructured Responses**: Raw markdown text was difficult to parse safely into interactive UI widgets like tables and timelines.

---

## 2. Structural Prompt Refinement (Iteration 1: Schema Enforcement)

### Solution: Structured System Instructions & Zod Schema Output
We separated concerns:
- **System Instructions**: Define persona, domain constraints, zero-hallucination vendor policy, and cultural awareness.
- **User Prompt**: Supplies exact validated parameters (city, date, guest count, budget, currency, venue preference, dietary tags, accessibility needs).
- **JSON Output Formatting**: Configured `responseMimeType: "application/json"` with an explicit JSON schema contract.

### Architectural Constraint Applied:
```typescript
const SYSTEM_INSTRUCTION = `
You are MOMENTMINT AI, an elite event planner and financial logistics architect.
Your mission is to craft deeply personalized, culturally attuned, realistic, and budget-disciplined event plans.

CRITICAL PRINCIPLES:
1. RESPECT REAL BUDGETS & LOCATIONS: Real event expenses in the given city (e.g. Bengaluru, Mumbai, London, New York) must be strictly grounded. If budget is tight (e.g. ₹25,000 for 40 guests), do NOT propose five-star ballrooms or imported flowers; propose ingenious budget-conscious strategies like public park permits, potted plants, DIY acoustic playlists, and local street-food style grazing.
2. FINANCIAL ARITHMETIC DISCIPLINE: Every single item in the budgetBreakdown must have a realistic estimatedCost. The sum of all item costs MUST equal or stay strictly within totalBudget. Include a dedicated Contingency buffer item.
3. ADAPT TO DIETARY & ACCESSIBILITY: Explicitly adapt the menu to stated dietary restrictions (e.g. Vegetarian, Vegan, Jain, Gluten-free, Halal) and make venue/seating recommendations align with accessibility needs.
4. UNMISTAKABLE ORIGINALITY: Do NOT produce generic placeholder text. Provide exact evocative dish names, specific sensory color palettes, and hour-by-hour itinerary phases.
5. NO FABRICATED QUOTES: Vendor suggestions must be categorized discovery leads with typical ranges and vetting questions, never made-up phone numbers or fake commercial guarantees.
6. RETURN ONLY RAW JSON matching the requested schema.
`;
```

---

## 3. The Copilot Diff & Trade-Off Prompt (Iteration 2)

### Challenge:
When users ask for plan revisions (e.g., *"Rain is forecast; revise for indoors"*), standard chat models either output a whole new wall of text or miss the subtle domino effects (e.g., changing acoustics, modifying lighting drapes, adding misting fans).

### Refined Copilot Prompt Strategy:
We instructed Gemini to act as a **Trade-Off Reasoning Engine** that outputs a structured diff:
1. **Strategic Rationale**: Explaining why certain trade-offs were chosen.
2. **Impact Analysis**: Quantifying budget diffs, venue transitions, and itinerary pacing changes.
3. **Proposed Plan Updates**: Targeted delta patches that can be applied atomically to the current state.
4. **Trade-off Warnings**: Proactively alerting the host about noise limits, lighting needs, or seating density.

---

## 4. Invariant Boundary: Deterministic Code vs. Generative Model

| Capability | Assigned Layer | Rationale |
| :--- | :--- | :--- |
| **Concept Rationale & Aesthetics** | **Google Gemini** | Excels at evocative theme naming, color psychology, and sensory descriptions. |
| **Menu & Flavor Pairings** | **Google Gemini** | Translates dietary constraints (Jain, Gluten-free) into inventive, delicious dishes. |
| **Timeline Pacing & Phasing** | **Google Gemini** | Understands realistic human event flow (cocktails → speeches → dining → farewell). |
| **Financial Arithmetic Sums** | **Deterministic TS Engine** | Guarantees $\sum \text{items} = \text{totalAllocated}$. Zero float errors or hallucinations. |
| **Over-Budget Guardrails** | **Deterministic TS Engine** | Instantly flags when user modifications exceed budget limits. |
| **Cost Optimization Filter** | **Hybrid Rule + AI** | Deterministically protects "must-have" items while proposing percentage cuts to "splurge" items. |

---

## 5. Planned Future Experiments (Documented Roadmap)
- [ ] **Multi-Agent Negotiation**: A two-agent setup where one agent acts as Creative Stylist and a second agent acts as Fiscal Auditor, negotiating allocations before finalizing the plan.
- [ ] **Live OpenStreetMap Grounding**: Integrating geocoded park boundaries and public venue permit links for Indian metros.
