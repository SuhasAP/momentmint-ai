"use client";

import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, Calculator, RefreshCw, Compass, Utensils, Clock, CheckCircle } from "lucide-react";

interface HeroLandingProps {
  onStartPlanning: () => void;
  onLoadPreset: (presetIndex: number) => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onStartPlanning,
  onLoadPreset,
}) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-16 md:py-20">
      {/* Decorative ambient background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-rose-200/30 via-violet-200/30 to-amber-100/40 blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Tagline Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EFECE1] shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
              Big moments. Brilliantly planned.
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-medium text-violet-700 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Gemini AI</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-slate-900 leading-[1.12]">
            Turn your celebration idea into a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-700 via-indigo-600 to-rose-600">
              living, budget-aware
            </span>{" "}
            event plan.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            MOMENTMINT AI calculates real trade-offs between guest count, location, styling, and culinary spreads.
            Features a real-time <strong>Event Copilot</strong> that reasons through plan revisions and keeps your budget mathematically balanced.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onStartPlanning}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/10 hover:shadow-xl transition-all flex items-center justify-center space-x-2.5 text-base group"
            >
              <span>Plan My Celebration</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onLoadPreset(0)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-[#EFECE1] hover:border-slate-300 shadow-sm transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>Try 4-Min Demo Case (Bengaluru Botanical)</span>
            </button>
          </div>

          {/* Assurance trust marks */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
            <span className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Strict budget arithmetic invariants</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Interactive Copilot before/after diffs</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>No signup required to test</span>
            </span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Live Budget Intelligence */}
          <div className="momentmint-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Live Budget Intelligence</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Deterministic arithmetic guarantees that category totals always equal the overall budget. Edit items, add custom expenses, or run the AI cost optimizer to protect core priorities.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Dynamic rebalancing</span>
              <span className="text-rose-600 font-semibold">Zero hallucinations</span>
            </div>
          </div>

          {/* Card 2: Conversational Event Copilot */}
          <div className="momentmint-card p-6 flex flex-col justify-between border-violet-200/60 bg-gradient-to-b from-white to-violet-50/20">
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Conversational Event Copilot</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Need to shift indoors because of rain? Want to trim 20% from catering? The Copilot reasons through trade-offs and generates atomic before/after diffs for you to approve or reject.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Structured diff previews</span>
              <span className="text-violet-600 font-semibold">Atomic plan updates</span>
            </div>
          </div>

          {/* Card 3: Culturally Attuned & Grounded */}
          <div className="momentmint-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Grounded Discovery Leads</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Clear distinction between AI-suggested supplier categories, pricing ranges, and real user-entered bookings. Never invents fake vendor phone numbers or illusory bookings.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>City-aware pricing</span>
              <span className="text-amber-700 font-semibold">Dietary & accessibility</span>
            </div>
          </div>
        </div>

        {/* Demo Fast-Track Strip */}
        <div className="mt-10 p-5 rounded-2xl bg-white border border-[#EFECE1] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Competition Evaluation Scenarios</h3>
              <p className="text-xs text-slate-500">
                Instantly prefill tested configurations to inspect complete live Gemini outputs and budget calculations:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => onLoadPreset(0)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-violet-100 hover:text-violet-900 transition-colors"
            >
              🌱 Aarav&apos;s 30th Birthday (Bengaluru • ₹25k)
            </button>
            <button
              onClick={() => onLoadPreset(1)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-rose-100 hover:text-rose-900 transition-colors"
            >
              🌊 Goa Sunset Engagement (75 guests • ₹3.5L)
            </button>
            <button
              onClick={() => onLoadPreset(2)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 transition-colors"
            >
              ⚡ AI Founders Mixer (Indoor • ₹85k)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
