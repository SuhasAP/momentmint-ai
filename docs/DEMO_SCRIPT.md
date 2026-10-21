# MOMENTMINT AI — 4-Minute Competition Demonstration Script

> **Total Time**: 3 minutes, 55 seconds  
> **Target Audience**: Hack2Skill PromptWars Judges & Product Evaluators  
> **Core Concept**: Living AI Event Planner with Budget Intelligence & Conversational Copilot

---

## Timeline & Narration Flow

### 0:00 – 0:20 | Introduction & Problem Statement
- **Screen View**: Landing Page ([http://localhost:3000](http://localhost:3000))
- **Action**: Highlight the taglines, warm ivory & midnight aesthetic, and core differentiation pillars.
- **Narration**:
  > *"Every year, millions of people struggle with planning milestone celebrations. Traditional tools give you static templates or generic chatbots that hallucinate costs and break your budget. Meet MOMENTMINT AI: 'Big moments. Brilliantly planned.' It’s an AI event architect that turns any idea, budget, and guest count into a living, budget-aware event plan with an interactive Event Copilot."*

---

### 0:20 – 0:50 | Live Event Input & Validation
- **Screen View**: Event Creation Wizard (Steps 1 to 5)
- **Action**:
  - Click **"Try 4-Min Demo Case (Bengaluru Botanical)"** or enter live:
    - **Occasion**: Birthday
    - **Title**: Aarav's 30th Botanical Birthday
    - **Date**: 2026-11-14 | **City**: Bengaluru
    - **Guest Count**: 40 guests | **Budget**: ₹25,000 INR
    - **Venue Setting**: Outdoor | **Theme**: Sustainable Boho Botanical
    - **Dietary**: Vegetarian & Gluten-free dessert | **Accessibility**: Wheelchair accessible
- **Narration**:
  > *"Let's plan Aarav's 30th birthday in Bengaluru for 40 guests on a tight ₹25,000 budget. Notice how the wizard captures dietary requirements, accessibility needs, and top priorities like zero single-use plastic."*

---

### 0:50 – 1:35 | AI Plan Generation & Personalized Synthesis
- **Screen View**: Generation loading animation → Event Dashboard
- **Action**: Click **"Generate My Event Plan"**. Celebrate confetti appears; view the synthesized plan.
- **Narration**:
  > *"Our server-side API invokes Google Gemini with strict schema validation. Notice how the synthesized concept isn't generic text—it's tailored to Bengaluru's climate and eco-conscious culture, recommending living potted botanicals instead of cut flowers, and terracotta accents that honor our ₹25,000 limit."*

---

### 1:35 – 2:10 | Deep-Dive: Budget Invariants, Itinerary, Menu & Checklist
- **Screen View**: Dashboard Tabs
- **Action**:
  1. Inspect **Overview**: Color palette swatches with 1-click hex copying and decor cost tags.
  2. Click **Budget Tracker**: Show that the sum of itemized lines (Venue, Catering, Decor, Photography, Contingency) **strictly equals** the ₹25,000 total allocated spend.
  3. Click **Gastronomy & Menu**: Inspect the artisanal grazing spread, per-guest food spend (₹238/head), and specific vegetarian/gluten-free options.
  4. Click **Master Checklist**: Toggle a checklist milestone to show interactive completion state.
- **Narration**:
  > *"Notice the Live Budget Intelligence: every category total is calculated deterministically by our application code. The arithmetic is 100% sound. The menu specifically accommodates our vegetarian and gluten-free dietary requests, while the checklist is time-phased from 4 weeks prior to day-of."*

---

### 2:10 – 2:45 | The Differentiator: Conversational Event Copilot
- **Screen View**: "Your Event Copilot" Drawer
- **Action**:
  1. Open the Copilot drawer.
  2. Click the quick prompt: *"Rain is forecast; revise the plan for indoors"*.
  3. Inspect the live trade-off analysis: strategic rationale, net-zero budget impact, indoor venue switch, acoustic warning.
  4. Click **"Apply to Live Plan"**.
  5. Verify that the event setting badge immediately flips to **"Indoor"** and the venue expense line reallocates automatically.
- **Narration**:
  > *"Here is our core differentiator: Your Event Copilot. When weather forecasts threaten an outdoor gathering, you simply tell the Copilot. Rather than a vague chat response, Gemini computes an atomic before-and-after diff. When we click 'Apply to Live Plan', our actual dashboard state, venue setting, and budget allocations update instantaneously."*

---

### 2:45 – 3:15 | Cost Optimization & Error Guardrails
- **Screen View**: Cost Optimizer Modal & Validation Checks
- **Action**:
  1. Open the **"Cost Optimizer"** modal.
  2. Show how "must-have" items are protected while "splurge" items (like candid photography) can be trimmed to save money.
  3. Demonstrate input boundary resilience (e.g., negative budget or missing city triggers clear readable error banners, never a crash).
- **Narration**:
  > *"Our Cost Optimizer safeguards your core priorities, trimming only discretionary spend. And if a user enters unrealistic constraints or negative numbers, our validation engine catches it with clear human guidance."*

---

### 3:15 – 3:40 | Persistence, Print Dossier & Portability
- **Screen View**: Export / Print Modal & Saved Plans Dropdown
- **Action**:
  1. Click **"Export"** in the header to preview the printable client dossier.
  2. Demonstrate switching between saved events in the header dropdown.
- **Narration**:
  > *"Plans persist safely in the browser, allowing hosts to duplicate, rename, or export full JSON backups and print-ready event dossiers with a single click."*

---

### 3:40 – 3:55 | Wrap-up & Value Proposition
- **Screen View**: Full Dashboard / Landing
- **Narration**:
  > *"MOMENTMINT AI brings the power of Google Gemini to celebration planning with fiscal discipline, cultural sensitivity, and an interactive Copilot. Big moments. Brilliantly planned. Thank you!"*
