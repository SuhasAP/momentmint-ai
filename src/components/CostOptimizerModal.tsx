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
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Cost Optimization Assistant</h3>
              <p className="text-xs text-slate-500">Trim discretionary expenditures while protecting must-haves</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Priority Protection Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start space-x-2.5 text-xs text-emerald-950">
          <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Priority Protection Guarantee:</span>{" "}
            All items marked as &lsquo;Must-Have&rsquo; are strictly preserved. Only discretionary &lsquo;Splurge&rsquo; and &lsquo;Nice-to-Have&rsquo; allocations are proposed for smart trimming.
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
          {optimization.suggestions.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Your budget is already lean! No discretionary splurge or non-essential items detected to trim.
            </div>
          ) : (
            optimization.suggestions.map((s) => {
              const isChecked = selectedIds.includes(s.itemId);
              return (
                <div
                  key={s.itemId}
                  onClick={() => toggleSelect(s.itemId)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? "border-emerald-500 bg-emerald-50/40 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border ${
                          isChecked
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800">{s.name}</span>
                        <span className="ml-2 text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {s.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-700">
                        -{formatCurrency(s.savings, currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 line-through">
                        {formatCurrency(s.currentCost, currency)} → {formatCurrency(s.suggestedCost, currency)}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-2 pl-7 leading-relaxed">
                    {s.rationale}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Estimated Total Savings:
            </span>
            <span className="text-lg font-bold text-emerald-700">
              {formatCurrency(currentSelectedSavings, currency)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={selectedIds.length === 0}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply {selectedIds.length} Optimizations</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
