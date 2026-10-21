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
import { getStoredModel } from "@/lib/storage";

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: EventPlan;
  onApplyChanges: (updatedPlan: EventPlan) => void;
  customApiKey?: string;
  customModel?: string;
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
  customModel,
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
      const activeModel = customModel || getStoredModel();
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPlan,
          userInstruction: promptText,
          apiKey: customApiKey,
          model: activeModel,
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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#F8F6F0] shadow-2xl border-l border-[#E7E3D9] flex flex-col animate-slide-up">
      {/* Drawer Header */}
      <div className="p-4 sm:p-5 border-b border-[#E9DFC9]/20 bg-[#17372B] text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#E9DFC9]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#E9DFC9] tracking-wide">Studio Event Copilot</h3>
            <p className="text-[11px] text-[#DCE5D8]/80">Conversational trade-off reasoning & atomic plan revisions</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#E9DFC9]/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {/* Quick Suggestions */}
        {!diff && (
          <div>
            <span className="text-[11px] font-semibold text-[#697168] uppercase tracking-wider block mb-2">
              Try a Quick Scenario Consultation:
            </span>
            <div className="space-y-2">
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInstruction(p);
                    handleSend(p);
                  }}
                  className="w-full text-left p-3 rounded-2xl border border-[#E7E3D9] hover:border-[#214737] hover:bg-[#DCE5D8]/20 bg-white text-xs font-medium text-[#17372B] transition-all flex items-center justify-between group shadow-subtle"
                >
                  <span>&ldquo;{p}&rdquo;</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#697168] group-hover:text-[#214737] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="p-6 rounded-2xl bg-white border border-[#E7E3D9] text-center space-y-3 shadow-subtle animate-pulse">
            <div className="w-10 h-10 rounded-full bg-[#17372B] text-[#E9DFC9] flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <p className="font-serif text-base font-bold text-[#17372B]">Reasoning through plan trade-offs...</p>
              <p className="text-xs text-[#697168] mt-0.5">
                Balancing budget allocations, spatial ambience, and guest hospitality.
              </p>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-xl bg-[#FAF1EE] border border-[#C87960]/30 text-xs text-[#C87960] flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#C87960] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Copilot Consultation Notice</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Diff Result Card */}
        {diff && !isLoading && (
          <div className="rounded-2xl border-2 border-[#214737] bg-white p-5 space-y-4 animate-fade-in shadow-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E3D9]">
              <span className="text-xs font-bold text-[#17372B] uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#214737]" />
                <span>Proposed Plan Revisions</span>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#DCE5D8] text-[#17372B] border border-[#DCE5D8]">
                Ready for Review
              </span>
            </div>

            {/* Rationale */}
            <div>
              <span className="text-[10px] font-bold text-[#697168] uppercase tracking-wider block mb-1">
                AI Strategic Rationale:
              </span>
              <p className="text-xs text-[#222820] bg-[#F8F6F0] p-3.5 rounded-xl border border-[#E7E3D9] leading-relaxed">
                {diff.rationale}
              </p>
            </div>

            {/* Impact Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E7E3D9]">
                <span className="text-[10px] font-semibold text-[#697168] block uppercase">Budget Impact</span>
                <span
                  className={`font-serif font-bold text-sm ${
                    diff.impactAnalysis.budgetDiff < 0
                      ? "text-[#214737]"
                      : diff.impactAnalysis.budgetDiff > 0
                      ? "text-[#C87960]"
                      : "text-[#17372B]"
                  }`}
                >
                  {diff.impactAnalysis.budgetDiff < 0
                    ? `Saves ${formatCurrency(Math.abs(diff.impactAnalysis.budgetDiff), currentPlan.budgetBreakdown.currency)}`
                    : diff.impactAnalysis.budgetDiff > 0
                    ? `+${formatCurrency(diff.impactAnalysis.budgetDiff, currentPlan.budgetBreakdown.currency)}`
                    : "No net budget change"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E7E3D9]">
                <span className="text-[10px] font-semibold text-[#697168] block uppercase">Setting/Venue</span>
                <span className="font-serif font-bold text-sm text-[#17372B]">
                  {diff.impactAnalysis.venueChanged ? "Updated to Indoor" : "Preserved"}
                </span>
              </div>
            </div>

            {/* Summary List */}
            <div>
              <span className="text-[10px] font-bold text-[#697168] uppercase tracking-wider block mb-1">
                Summary of Adjustments:
              </span>
              <div className="bg-[#F8F6F0] p-3.5 rounded-xl border border-[#E7E3D9] text-xs text-[#222820] whitespace-pre-line leading-relaxed font-sans">
                {diff.summaryOfChanges}
              </div>
            </div>

            {/* Warnings or Tradeoffs */}
            {diff.warningsOrTradeoffs && diff.warningsOrTradeoffs.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#FAF1EE] border border-[#C87960]/30 text-xs text-[#C87960] space-y-1">
                <span className="font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Trade-offs to Keep in Mind:</span>
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
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
                className="flex-1 py-2.5 px-3 rounded-xl border border-[#E7E3D9] text-xs font-semibold text-[#697168] hover:bg-[#F8F6F0] transition-colors flex items-center justify-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Discard Diff</span>
              </button>

              <button
                onClick={handleApply}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#17372B] hover:bg-[#214737] text-[#E9DFC9] text-xs font-bold shadow-subtle transition-all flex items-center justify-center space-x-1.5"
              >
                <Check className="w-4 h-4 text-[#E9DFC9]" />
                <span>Apply to Live Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#E7E3D9] bg-white">
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
            placeholder="Ask Copilot: 'Shift this event indoors', 'Reduce catering by ₹5,000'..."
            className="w-full pl-3.5 pr-12 py-2.5 bg-[#F8F6F0] border border-[#E7E3D9] rounded-xl text-xs sm:text-sm text-[#222820] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#214737] transition-all resize-none shadow-subtle"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !instruction.trim()}
            className="absolute right-2.5 bottom-3.5 w-8 h-8 rounded-lg bg-[#17372B] hover:bg-[#214737] disabled:opacity-40 text-[#E9DFC9] flex items-center justify-center shadow-subtle transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-[#697168] mt-1.5 text-center">
          Powered by Gemini • Deterministic trade-off balancing with zero silent budget drift.
        </p>
      </div>
    </div>
  );
};
