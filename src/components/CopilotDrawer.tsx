"use client";

import React, { useState } from "react";
import {
  Sparkles,
  X,
  Send,
  ArrowRight,
  Check,
  AlertTriangle,
  RotateCcw,
  IndianRupee,
  Clock,
  Home,
  Utensils,
  Palette,
} from "lucide-react";
import { EventPlan, CopilotDiff } from "@/types/event";
import { formatCurrency } from "@/lib/budget-math";

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: EventPlan;
  onApplyChanges: (updatedPlan: EventPlan) => void;
  customApiKey?: string;
}

const QUICK_PROMPTS = [
  "Rain is forecast; revise the plan for indoors",
  "Reduce catering costs but keep the premium decor",
  "Add sustainable seed-paper favors and reduce floral waste",
  "Make the itinerary more relaxed with extra cocktail hour",
];

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onApplyChanges,
  customApiKey,
}) => {
  const [instruction, setInstruction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [diff, setDiff] = useState<CopilotDiff | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || instruction).trim();
    if (!promptText) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPlan,
          userInstruction: promptText,
          apiKey: customApiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to process instruction");
      }

      setDiff(data.diff);
    } catch (err) {
      console.error("Copilot Error:", err);
      setError((err as Error).message || "Copilot encountered a temporary issue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!diff || !diff.proposedPlan) return;

    // Deep merge proposed changes into current plan
    const updated: EventPlan = {
      ...currentPlan,
      ...diff.proposedPlan,
      concept: {
        ...currentPlan.concept,
        ...(diff.proposedPlan.concept || {}),
      },
      styling: {
        ...currentPlan.styling,
        ...(diff.proposedPlan.styling || {}),
      },
      itinerary: diff.proposedPlan.itinerary || currentPlan.itinerary,
      budgetBreakdown: diff.proposedPlan.budgetBreakdown || currentPlan.budgetBreakdown,
      menu: diff.proposedPlan.menu || currentPlan.menu,
      checklist: diff.proposedPlan.checklist || currentPlan.checklist,
      riskAndContingency: diff.proposedPlan.riskAndContingency || currentPlan.riskAndContingency,
      input: {
        ...currentPlan.input,
        ...(diff.proposedPlan.input || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    onApplyChanges(updated);
    setDiff(null);
    setInstruction("");
    onClose();
  };

  const handleDiscard = () => {
    setDiff(null);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slide-up">
      {/* Drawer Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-violet-900 to-indigo-900 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-rose-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Your Event Copilot</h3>
            <p className="text-[11px] text-violet-200">Conversational trade-off analysis & atomic plan updates</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-violet-200 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {/* Quick Suggestions */}
        {!diff && (
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Try a Quick Scenario Request:
            </span>
            <div className="space-y-1.5">
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInstruction(p);
                    handleSend(p);
                  }}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/40 text-xs font-medium text-slate-700 transition-all flex items-center justify-between group"
                >
                  <span>&ldquo;{p}&rdquo;</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="p-6 rounded-2xl bg-violet-50/60 border border-violet-100 text-center space-y-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold text-violet-950">Reasoning through plan trade-offs...</p>
              <p className="text-xs text-violet-700 mt-0.5">
                Balancing budget allocations, vendor logistics, and guest hospitality.
              </p>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Copilot Notice</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Diff Result Card */}
        {diff && !isLoading && (
          <div className="rounded-2xl border-2 border-violet-400 bg-violet-50/30 p-4 space-y-4 animate-fade-in shadow-soft">
            <div className="flex items-center justify-between pb-2 border-b border-violet-100">
              <span className="text-xs font-bold text-violet-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                <span>Proposed Plan Changes</span>
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Ready for Review
              </span>
            </div>

            {/* Rationale */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                AI Strategic Rationale:
              </span>
              <p className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                {diff.rationale}
              </p>
            </div>

            {/* Impact Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">Budget Impact</span>
                <span
                  className={`font-bold ${
                    diff.impactAnalysis.budgetDiff < 0
                      ? "text-emerald-700"
                      : diff.impactAnalysis.budgetDiff > 0
                      ? "text-rose-700"
                      : "text-slate-700"
                  }`}
                >
                  {diff.impactAnalysis.budgetDiff < 0
                    ? `Saves ${formatCurrency(Math.abs(diff.impactAnalysis.budgetDiff), currentPlan.budgetBreakdown.currency)}`
                    : diff.impactAnalysis.budgetDiff > 0
                    ? `+${formatCurrency(diff.impactAnalysis.budgetDiff, currentPlan.budgetBreakdown.currency)}`
                    : "No net budget change"}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">Setting/Venue</span>
                <span className="font-bold text-slate-800">
                  {diff.impactAnalysis.venueChanged ? "Updated to Indoor" : "Preserved"}
                </span>
              </div>
            </div>

            {/* Summary List */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Summary of Adjustments:
              </span>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                {diff.summaryOfChanges}
              </div>
            </div>

            {/* Warnings or Tradeoffs */}
            {diff.warningsOrTradeoffs && diff.warningsOrTradeoffs.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center space-x-1 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Trade-offs to Keep in Mind:</span>
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 pl-1">
                  {diff.warningsOrTradeoffs.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={handleDiscard}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Discard Diff</span>
              </button>

              <button
                onClick={handleApply}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Apply to Live Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-[#FAF9F5]">
        <div className="relative">
          <textarea
            rows={2}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Copilot: 'Make this an indoor event', 'Reduce catering by ₹5,000'..."
            className="w-full pl-3.5 pr-12 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all resize-none shadow-sm"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !instruction.trim()}
            className="absolute right-2.5 bottom-3.5 w-8 h-8 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white flex items-center justify-center shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 text-center">
          Powered by Gemini • Reasons about tradeoffs and updates actual plan state.
        </p>
      </div>
    </div>
  );
};
