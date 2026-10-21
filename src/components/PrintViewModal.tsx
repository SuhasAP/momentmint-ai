"use client";

import React from "react";
import { X, Printer, Download, Sparkles } from "lucide-react";
import { EventPlan } from "@/types/event";
import { formatCurrency, calculateBudgetMetrics } from "@/lib/budget-math";
import { exportPlanAsJson } from "@/lib/storage";

interface PrintViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
}

export const PrintViewModal: React.FC<PrintViewModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  if (!isOpen) return null;

  const metrics = calculateBudgetMetrics(plan.budgetBreakdown, plan.input.guestCount);
  const currency = plan.budgetBreakdown.currency;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E7E3D9]">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print p-4 border-b border-[#E9DFC9]/20 flex items-center justify-between bg-[#17372B] rounded-t-2xl text-white">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-[#E9DFC9] text-base">Studio Event Dossier</span>
            <span className="text-xs text-[#DCE5D8]/80">• Ready for PDF archiving & client presentation</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportPlanAsJson(plan)}
              className="px-3.5 py-1.5 rounded-xl border border-[#E9DFC9]/30 bg-white/10 text-xs font-semibold text-[#E9DFC9] hover:bg-white/20 flex items-center space-x-1.5 shadow-subtle transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-1.5 rounded-xl bg-[#E9DFC9] text-[#17372B] text-xs font-bold hover:bg-white flex items-center space-x-1.5 shadow-subtle transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#E9DFC9]/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 text-[#222820]">
          {/* Cover Header */}
          <div className="border-b-2 border-[#17372B] pb-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#214737]">
                  MOMENTMINT STUDIO AI • EXECUTIVE EVENT DOSSIER
                </span>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#17372B] mt-1">{plan.title}</h1>
              </div>
              <div className="text-right text-xs text-[#697168]">
                <p>Generated: {new Date(plan.createdAt).toLocaleDateString()}</p>
                <p className="font-semibold text-[#17372B]">{plan.aiMetadata.model}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-[#F8F6F0] p-4 rounded-2xl border border-[#E7E3D9]">
              <div>
                <span className="text-[#697168] block uppercase font-bold text-[10px]">Occasion</span>
                <span className="font-semibold text-[#17372B] capitalize">{plan.input.eventType}</span>
              </div>
              <div>
                <span className="text-[#697168] block uppercase font-bold text-[10px]">City / Location</span>
                <span className="font-semibold text-[#17372B]">{plan.input.city}</span>
              </div>
              <div>
                <span className="text-[#697168] block uppercase font-bold text-[10px]">Target Date</span>
                <span className="font-semibold text-[#17372B]">{plan.input.date}</span>
              </div>
              <div>
                <span className="text-[#697168] block uppercase font-bold text-[10px]">Scale & Budget</span>
                <span className="font-serif font-bold text-[#214737] text-sm">
                  {plan.input.guestCount} Guests • {formatCurrency(plan.budgetBreakdown.totalBudget, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Concept & Palette */}
          <div>
            <h2 className="text-base font-serif font-bold text-[#17372B] uppercase tracking-wider mb-2 border-b border-[#E7E3D9] pb-1">
              1. Creative Concept & Atmosphere
            </h2>
            <p className="text-sm text-[#222820] leading-relaxed">{plan.concept.summary}</p>
            <p className="text-xs text-[#697168] mt-1.5 italic">Rationale: {plan.concept.rationale}</p>

            <div className="mt-3 flex items-center space-x-3">
              {plan.styling.colorPalette.map((c, i) => (
                <div key={i} className="flex items-center space-x-1.5 text-xs">
                  <span
                    className="w-4 h-4 rounded-full border border-[#E7E3D9] inline-block shadow-xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[#17372B] font-medium">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Itinerary */}
          <div>
            <h2 className="text-base font-serif font-bold text-[#17372B] uppercase tracking-wider mb-2 border-b border-[#E7E3D9] pb-1">
              2. Master Timeline & Itinerary
            </h2>
            <div className="space-y-2">
              {plan.itinerary.map((it) => (
                <div key={it.id} className="flex items-start text-xs border-b border-[#E7E3D9] py-2">
                  <span className="w-28 font-mono font-bold text-[#17372B]">{it.time}</span>
                  <div className="flex-1">
                    <span className="font-bold text-[#17372B]">{it.title}</span>
                    <span className="text-[#697168] block mt-0.5">{it.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Budget Breakdown */}
          <div>
            <h2 className="text-base font-serif font-bold text-[#17372B] uppercase tracking-wider mb-2 border-b border-[#E7E3D9] pb-1">
              3. Itemized Budget Allocations (Total: {formatCurrency(metrics.totalAllocated, currency)})
            </h2>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E7E3D9] text-[#697168] font-bold uppercase text-[10px]">
                  <th className="py-1.5">Category</th>
                  <th className="py-1.5">Expense Item</th>
                  <th className="py-1.5">Priority</th>
                  <th className="py-1.5 text-right">Estimate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3D9]">
                {plan.budgetBreakdown.items.map((b) => (
                  <tr key={b.id} className="py-2">
                    <td className="py-2 font-semibold text-[#17372B]">{b.category}</td>
                    <td className="py-2 text-[#222820]">{b.name}</td>
                    <td className="py-2 capitalize text-[#697168]">{b.priority}</td>
                    <td className="py-2 text-right font-serif font-bold text-[#17372B]">
                      {formatCurrency(b.estimatedCost, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Menu */}
          <div>
            <h2 className="text-base font-serif font-bold text-[#17372B] uppercase tracking-wider mb-2 border-b border-[#E7E3D9] pb-1">
              4. Gastronomy & Hospitality
            </h2>
            <p className="text-xs font-semibold text-[#17372B] mb-2">Style: {plan.menu.cateringStyle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {plan.menu.courses.map((course, idx) => (
                <div key={idx} className="p-4 bg-[#F8F6F0] rounded-2xl border border-[#E7E3D9]">
                  <h4 className="font-serif font-bold text-sm text-[#17372B] mb-2">{course.name}</h4>
                  <ul className="space-y-1.5 text-[#222820]">
                    {course.items.map((item, i) => (
                      <li key={i}>
                        <span className="font-semibold text-[#17372B]">{item.title}</span>
                        {item.description && <span className="block text-[11px] text-[#697168]">{item.description}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Footer stamp */}
          <div className="pt-6 border-t border-[#E7E3D9] text-center text-xs text-[#697168]">
            Crafted with MOMENTMINT STUDIO AI • Bespoke Celebrations. Brilliantly Planned.
          </div>
        </div>
      </div>
    </div>
  );
};
