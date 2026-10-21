"use client";

import React from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calculator,
  RefreshCw,
  Compass,
  CheckCircle,
  Calendar,
  Layers,
  MapPin,
  Users,
} from "lucide-react";

interface HeroLandingProps {
  onStartPlanning: () => void;
  onLoadPreset: (presetIndex: number) => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onStartPlanning,
  onLoadPreset,
}) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-20 md:py-16">
      {/* Subtle organic ambient glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-[#DCE5D8]/40 via-[#FAF7F1]/30 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Asymmetric Editorial Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E7E3D9] shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-[#214737]" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#17372B]">
                BESPOKE EVENT STUDIO
              </span>
              <span className="text-[#E7E3D9]">|</span>
              <span className="text-xs font-semibold text-[#697168] flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C87960]" />
                <span>Google Gemini Architecture</span>
              </span>
            </div>

            {/* Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#17372B] leading-[1.1]">
              Celebrations crafted with{" "}
              <span className="italic font-normal text-[#C87960]">taste</span>,{" "}
              planned with{" "}
              <span className="underline decoration-[#E9DFC9] underline-offset-8">
                mathematical discipline
              </span>
              .
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#697168] max-w-xl leading-relaxed font-sans">
              MOMENTMINT AI translates event dreams, strict budgets, guest counts, and city logistics into
              cohesive design concepts, time-blocked itineraries, and tasting menus.
              Features a live <strong>Event Copilot</strong> that reasons about real trade-offs and updates your plan atomically.
            </p>

            {/* Primary & Secondary Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={onStartPlanning}
                className="px-7 py-4 rounded-xl font-semibold text-[#E9DFC9] bg-[#17372B] hover:bg-[#214737] border border-[#E9DFC9]/30 shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2.5 text-base group"
              >
                <span>Begin Event Consultation</span>
                <ArrowRight className="w-4 h-4 text-[#E9DFC9] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onLoadPreset(0)}
                className="px-6 py-4 rounded-xl font-semibold text-[#222820] bg-white hover:bg-[#FAF7F1] border border-[#E7E3D9] hover:border-[#D8C7A5] shadow-subtle transition-all flex items-center justify-center space-x-2 text-sm"
              >
                <span className="text-sm">🌱</span>
                <span>Sample: Botanical Birthday (Bengaluru • ₹25k)</span>
              </button>
            </div>

            {/* Reassurance marks */}
            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[#697168]">
              <span className="flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-[#214737]" />
                <span>Deterministic budget invariants</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-[#214737]" />
                <span>Conversational Copilot before/after diffs</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-[#214737]" />
                <span>Zero authentication required</span>
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Design Board Preview */}
          <div className="lg:col-span-5">
            <div className="studio-card p-6 sm:p-7 border-[#D8C7A5]/60 bg-white relative">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#E7E3D9]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#214737] bg-[#DCE5D8] px-2.5 py-0.5 rounded-full">
                    CURATED DESIGN BRIEF
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[#17372B] mt-1.5">
                    Aarav&apos;s 30th Botanical Sanctuary
                  </h3>
                  <p className="text-xs text-[#697168] mt-0.5 flex items-center space-x-2">
                    <span>Bengaluru • Garden Lawn</span>
                    <span>•</span>
                    <span>40 Guests</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#697168] uppercase tracking-wider block">
                    Envelope
                  </span>
                  <span className="text-lg font-bold text-[#17372B] font-serif">₹25,000</span>
                </div>
              </div>

              {/* Color Palette Swatches */}
              <div className="py-4 border-b border-[#E7E3D9]/60">
                <span className="text-[10px] font-bold text-[#697168] uppercase tracking-widest block mb-2">
                  Atelier Color Direction
                </span>
                <div className="flex items-center space-x-2">
                  {[
                    { name: "Porcelain", hex: "#FAF8F0" },
                    { name: "Forest Sage", hex: "#4A6B53" },
                    { name: "Terracotta", hex: "#E07A5F" },
                    { name: "Dusk Indigo", hex: "#1A2536" },
                    { name: "Champagne", hex: "#E9DFC9" },
                  ].map((s, idx) => (
                    <div key={idx} className="flex-1 text-center">
                      <div
                        className="h-8 rounded-lg border border-[#E7E3D9] shadow-xs"
                        style={{ backgroundColor: s.hex }}
                        title={s.name}
                      />
                      <span className="text-[9px] font-medium text-[#697168] mt-1 block truncate">
                        {s.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Invariant Ledger Preview */}
              <div className="py-4 border-b border-[#E7E3D9]/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#697168]">Budget Allocation Status:</span>
                  <span className="text-[#214737] font-bold">100% Balanced (₹25,000)</span>
                </div>
                <div className="w-full bg-[#F0ECE1] h-2 rounded-full overflow-hidden flex">
                  <div className="bg-[#214737] h-full" style={{ width: "38%" }} title="Catering: 38%" />
                  <div className="bg-[#C87960] h-full" style={{ width: "20%" }} title="Venue: 20%" />
                  <div className="bg-[#D8C7A5] h-full" style={{ width: "18%" }} title="Decor: 18%" />
                  <div className="bg-[#A8BFA0] h-full" style={{ width: "10%" }} title="Photo: 10%" />
                  <div className="bg-[#697168] h-full" style={{ width: "14%" }} title="Reserves: 14%" />
                </div>
                <div className="flex justify-between text-[10px] text-[#697168] pt-1">
                  <span>Catering: ₹9,500</span>
                  <span>Venue: ₹5,000</span>
                  <span>Decor: ₹4,500</span>
                  <span>Reserves: ₹3,500</span>
                </div>
              </div>

              {/* Live Copilot Trade-off Preview Callout */}
              <div className="pt-4">
                <div className="p-3.5 rounded-xl bg-[#F0F5F2] border border-[#C4D4BE] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#17372B] flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#214737]" />
                      <span>Copilot Trade-off Applied</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#214737] uppercase">Net Zero Impact</span>
                  </div>
                  <p className="text-xs text-[#222820] leading-relaxed">
                    &ldquo;Rain forecast? Relocated to sheltered indoor glasshouse. Switched lawn drapes to acoustic velvet lighting. Budget variance: ₹0.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Workflow: How MOMENTMINT AI Works */}
        <div className="space-y-8 pt-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#214737] bg-[#DCE5D8] px-3 py-1 rounded-full">
              STUDIO PROCESS
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#17372B]">
              How Your Event Comes to Life
            </h2>
            <p className="text-sm text-[#697168]">
              From raw inspiration to an airtight, budget-disciplined celebration plan in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Share Your Vision",
                desc: "Define occasion, guest count, city economics, setting preference, dietary restrictions, and top priorities.",
                icon: Calendar,
              },
              {
                step: "02",
                title: "Gemini AI Synthesis",
                desc: "Our server architecture crafts an evocative concept, color palette, hour-by-hour timeline, and tasting menu.",
                icon: Sparkles,
              },
              {
                step: "03",
                title: "Command the Budget",
                desc: "Deterministic financial logic maintains category sums strictly equal to your budget limit with zero float drift.",
                icon: Calculator,
              },
              {
                step: "04",
                title: "Conversational Copilot",
                desc: "Instruct changes in plain English. Review structured before/after diffs and apply updates atomically.",
                icon: RefreshCw,
              },
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div key={i} className="studio-card p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-2xl font-bold text-[#C87960]">{st.step}</span>
                      <div className="w-8 h-8 rounded-lg bg-[#F0F5F2] text-[#214737] flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-[#17372B]">{st.title}</h3>
                    <p className="text-xs text-[#697168] leading-relaxed font-sans">{st.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-[#E7E3D9] text-[10px] uppercase font-bold text-[#697168] tracking-wider">
                    Studio Assurance
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demo Fast-Track Scenario Bar */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E3D9] shadow-subtle flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#17372B] text-[#E9DFC9] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#E9DFC9]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17372B] font-serif text-base">
                Explore Verified Competition Scenarios
              </h3>
              <p className="text-xs text-[#697168] font-sans">
                Prefill realistic event briefs to test Gemini generation, budget reconciliation, and Copilot trade-offs:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <button
              onClick={() => onLoadPreset(0)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#17372B] bg-[#DCE5D8]/80 hover:bg-[#DCE5D8] border border-[#C4D4BE] transition-colors"
            >
              🌱 Aarav&apos;s 30th Birthday (Bengaluru • ₹25k)
            </button>
            <button
              onClick={() => onLoadPreset(1)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#222820] bg-[#FAF1EE] hover:bg-[#F4DFD8] border border-[#E7E3D9] transition-colors"
            >
              🌊 Goa Sunset Engagement (75 guests • ₹3.5L)
            </button>
            <button
              onClick={() => onLoadPreset(2)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#222820] bg-[#FAF7F1] hover:bg-[#F0ECE1] border border-[#E7E3D9] transition-colors"
            >
              ⚡ AI Founders Mixer (Indoor • ₹85k)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
