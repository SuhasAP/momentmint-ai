# Building in Public: MOMENTMINT AI

> *A developer's deep-dive into building an autonomous, budget-aware AI event planner with Google Gemini for Hack2Skill PromptWars Challenge 5.*

---

## 1. Technical Blog Post Draft

### Title: How We Built MOMENTMINT AI: An Event Planner That Doesn't Hallucinate Your Budget

#### The Problem: The "Chatbot Mirage" in Event Planning
If you ask standard LLMs to plan a birthday party on a ₹25,000 budget, they give you an inspiring list of ideas. But when you add up the numbers, you realize they just recommended ₹50,000 worth of catering and decor. In the real world, an event planner who cannot do math is a liability.

We set out to build **MOMENTMINT AI** for Hack2Skill PromptWars Challenge 5 with a clear rule: **Generative AI should handle the creativity and trade-off reasoning; deterministic software should handle the arithmetic invariants.**

#### The Architecture: Separation of Concerns
1. **Google Gemini GenAI SDK**: We used `@google/genai` on server-side Next.js App Router API endpoints (`/api/generate-plan`, `/api/copilot`). The model receives strict system instructions outlining city pricing heuristics, cultural expectations, and zero-hallucination vendor lead policies.
2. **Strict Invariant Arithmetic (`budget-math.ts`)**: The application calculates all category sums, remaining reserves, and percentages deterministically. It maintains the invariant that $\sum \text{items} = \text{totalAllocated}$.
3. **The Event Copilot with Structured Diffs**: When the user asks for a revision—such as *"Rain is forecast; revise for indoors"*—Gemini doesn't just chat. It emits a structured delta object containing the strategic rationale, net budget impact, and proposed plan updates that the user can review before applying atomically to the live state.

#### Lessons Learned
- **Prompt Engineering for Structure**: Relying on markdown ticks inside an LLM stream is brittle. Enforcing structured JSON schemas combined with Zod validation catches anomalies early.
- **The Power of Before/After Diffs**: Users don't trust an AI that quietly rewrites their entire document. By visualizing the before/after delta (e.g., swapping lawn permits for a glasshouse hall and showing +₹0 budget impact), users feel completely in control.

---

## 2. LinkedIn Launch Post Draft

🚀 Excited to unveil **MOMENTMINT AI** — built for **Hack2Skill PromptWars (Challenge 5: Celebration & Event Planner)**!

Tagline: *"Big moments. Brilliantly planned."* ✨

Most AI event planning tools are just fancy text generators that hallucinate impossible budgets and fake vendor quotes. We took a radically different engineering approach:

💡 **What makes MOMENTMINT AI different:**
1. **Live Budget Intelligence**: Strict deterministic arithmetic ensures itemized costs always sum to your exact budget limit. No floating-point drift. No hallucinations.
2. **Conversational Event Copilot**: Type *"Rain is forecast; move indoors"* or *"Reduce catering spend by 20% but keep premium styling"*, and Gemini reasons about trade-offs, generates an atomic before/after diff, and updates your live plan and timeline in one click.
3. **Culturally & Economically Grounded**: Understands the nuances of planning in Bengaluru vs. Goa vs. London—from vegan and Jain dietary alternatives to zero-single-use-plastic decor.
4. **Master Workspace**: Interactive timeline, live checklist, color swatches with 1-click hex copying, and exportable PDF dossiers.

Stack: Next.js 16 (App Router), TypeScript, Tailwind CSS, Google Gemini (`@google/genai`), Zod, and Vitest.

Check out our architecture and test suite:
🔗 [GitHub Repo Link]

#GenerativeAI #GoogleGemini #NextJS #TypeScript #WebDevelopment #Hack2Skill #PromptWars #BuildInPublic

---

## 3. Evidence & Verification Checklist

Capture these exact items for competition submission and audit verification:

- [x] **Browser Recording**: `file:///C:/Users/sidda/.gemini/antigravity-ide/brain/ad7f516a-5438-4381-b86d-4a7b2a5bbb7b/momentmint_demo_1792553385091.webp` (Full 11-step interactive flow).
- [x] **Automated Test Results**: 11 passing Vitest tests in `tests/budget-math.test.ts` and `tests/schemas.test.ts`.
- [x] **Production Build**: Clean Turbopack production build with 0 TypeScript errors and 0 build warnings.
- [x] **Server-Side API Endpoints**:
  - `/api/generate-plan`
  - `/api/copilot`
  - `/api/optimize-budget`
- [x] **Key Code Excerpts**:
  - `src/lib/gemini.ts`: Dedicated server-side Gemini service with system instructions and JSON schemas.
  - `src/lib/budget-math.ts`: Deterministic arithmetic engine maintaining invariants.
  - `src/components/CopilotDrawer.tsx`: Before/after trade-off diff preview and atomic updater.
