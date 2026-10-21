"use client";

import React, { useState } from "react";
import { X, TrendingDown, Check, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { BudgetBreakdown, BudgetItem } from "@/types/event";
import { generateCostOptimization, formatCurrency, OptimizationSuggestion } from "@/lib/budget-math";

interface CostOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetBreakdown: BudgetBreakdown;
  currency: string;
  onApplyOptimization: (updatedItems: BudgetItem[]) => void;
}

export const CostOptimizerModal: React.FC<CostOptimizerModalProps> = ({
  isOpen,
  onClose,
  budgetBreakdown,
  currency,
  onApplyOptimization,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const optimization = generateCostOptimization(budgetBreakdown);

  // Initialize selected IDs on open
  React.useEffect(() => {
    if (isOpen) {
      setSelectedIds(optimization.suggestions.map((s) => s.itemId));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    const updated = budgetBreakdown.items.map((item) => {
      if (selectedIds.includes(item.id)) {
        const suggestion = optimization.suggestions.find((s) => s.itemId === item.id);
        if (suggestion) {
          return {
            ...item,
            estimatedCost: suggestion.suggestedCost,
            notes: `${item.notes} [AI Optimized: -${formatCurrency(suggestion.savings, currency)}]`,
          };
        }
      }
      return item;
    });

    onApplyOptimization(updated);
    onClose();
  };

  const currentSelectedSavings = optimization.suggestions
    .filter((s) => selectedIds.includes(s.itemId))
    .reduce((sum, s) => sum + s.savings, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#E7E3D9] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E3D9]">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#DCE5D8] text-[#17372B] flex items-center justify-center border border-[#DCE5D8]">
              <TrendingDown className="w-5 h-5 text-[#214737]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#17372B]">Cost Optimization Studio</h3>
              <p className="text-xs text-[#697168]">Trim discretionary expenditures while protecting core celebration milestones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#697168] hover:text-[#17372B] hover:bg-[#F8F6F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Priority Protection Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-[#DCE5D8]/40 border border-[#DCE5D8] flex items-start space-x-2.5 text-xs text-[#17372B]">
          <ShieldCheck className="w-4 h-4 text-[#214737] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Priority Protection Guarantee:</span>{" "}
            All line items marked as &lsquo;Must-Have&rsquo; are preserved without compromise. Only discretionary &lsquo;Splurge&rsquo; and non-essential allocations are proposed for smart calibration.
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
          {optimization.suggestions.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#697168]">
              Your budget is already lean! No discretionary splurge or non-essential items detected to trim.
            </div>
          ) : (
            optimization.suggestions.map((s) => {
              const isChecked = selectedIds.includes(s.itemId);
              return (
                <div
                  key={s.itemId}
                  onClick={() => toggleSelect(s.itemId)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isChecked
                      ? "border-[#214737] bg-white shadow-subtle"
                      : "border-[#E7E3D9] hover:border-[#214737]/40 bg-[#F8F6F0]/40 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border ${
                          isChecked
                            ? "bg-[#214737] border-[#214737] text-[#E9DFC9]"
                            : "border-[#E7E3D9] bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#17372B]">{s.name}</span>
                        <span className="ml-2 text-[10px] uppercase font-semibold text-[#697168] bg-[#F8F6F0] border border-[#E7E3D9] px-2 py-0.5 rounded-full">
                          {s.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-serif text-sm font-bold text-[#214737]">
                        -{formatCurrency(s.savings, currency)}
                      </div>
                      <div className="text-[10px] text-[#697168] line-through font-mono">
                        {formatCurrency(s.currentCost, currency)} → {formatCurrency(s.suggestedCost, currency)}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#697168] mt-2.5 pl-7 leading-relaxed">
                    {s.rationale}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        <div className="pt-4 border-t border-[#E7E3D9] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#697168] uppercase tracking-wider block">
              Estimated Total Savings:
            </span>
            <span className="font-serif text-xl font-bold text-[#214737]">
              {formatCurrency(currentSelectedSavings, currency)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#697168] hover:bg-[#F8F6F0] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={selectedIds.length === 0}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#E9DFC9] bg-[#17372B] hover:bg-[#214737] border border-[#E9DFC9]/30 shadow-subtle transition-all disabled:opacity-50 flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#E9DFC9]" />
              <span>Apply {selectedIds.length} Optimizations</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
