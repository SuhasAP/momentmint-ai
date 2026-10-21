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
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900 text-sm">Export & Print Dossier</span>
            <span className="text-xs text-slate-500">• Ready for PDF or client presentation</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportPlanAsJson(plan)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center space-x-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 text-slate-900">
          {/* Cover Header */}
          <div className="border-b-2 border-slate-900 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-violet-700">
                  MOMENTMINT AI • EVENT DOSSIER
                </span>
                <h1 className="text-3xl font-serif font-bold text-slate-900 mt-1">{plan.title}</h1>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Generated: {new Date(plan.createdAt).toLocaleDateString()}</p>
                <p className="font-semibold text-slate-700">{plan.aiMetadata.model}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Occasion</span>
                <span className="font-semibold text-slate-900 capitalize">{plan.input.eventType}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">City / Location</span>
                <span className="font-semibold text-slate-900">{plan.input.city}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Target Date</span>
                <span className="font-semibold text-slate-900">{plan.input.date}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Scale & Budget</span>
                <span className="font-semibold text-emerald-800">
                  {plan.input.guestCount} Guests • {formatCurrency(plan.budgetBreakdown.totalBudget, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Concept & Palette */}
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
              1. Creative Concept & Atmosphere
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">{plan.concept.summary}</p>
            <p className="text-xs text-slate-500 mt-1.5 italic">Rationale: {plan.concept.rationale}</p>

            <div className="mt-3 flex items-center space-x-3">
              {plan.styling.colorPalette.map((c, i) => (
                <div key={i} className="flex items-center space-x-1.5 text-xs">
                  <span
                    className="w-4 h-4 rounded-full border border-slate-300 inline-block"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-slate-700 font-medium">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Itinerary */}
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
              2. Master Timeline & Itinerary
            </h2>
            <div className="space-y-2">
              {plan.itinerary.map((it) => (
                <div key={it.id} className="flex items-start text-xs border-b border-slate-100 py-1.5">
                  <span className="w-28 font-bold text-slate-700">{it.time}</span>
                  <div className="flex-1">
                    <span className="font-bold text-slate-900">{it.title}</span>
                    <span className="text-slate-600 block">{it.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Budget Breakdown */}
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
              3. Itemized Budget Allocations (Total: {formatCurrency(metrics.totalAllocated, currency)})
            </h2>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-1">Category</th>
                  <th className="py-1">Expense Item</th>
                  <th className="py-1">Priority</th>
                  <th className="py-1 text-right">Estimate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plan.budgetBreakdown.items.map((b) => (
                  <tr key={b.id} className="py-1.5">
                    <td className="py-1.5 font-semibold text-slate-600">{b.category}</td>
                    <td className="py-1.5 text-slate-800">{b.name}</td>
                    <td className="py-1.5 capitalize text-slate-500">{b.priority}</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">
                      {formatCurrency(b.estimatedCost, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Menu */}
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
              4. Gastronomy & Hospitality
            </h2>
            <p className="text-xs font-semibold text-slate-700 mb-2">Style: {plan.menu.cateringStyle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {plan.menu.courses.map((course, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1.5">{course.name}</h4>
                  <ul className="space-y-1 text-slate-600">
                    {course.items.map((item, i) => (
                      <li key={i}>
                        <span className="font-semibold text-slate-800">{item.title}</span>
                        {item.description && <span className="block text-[11px] text-slate-500">{item.description}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Footer stamp */}
          <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
            Created with MOMENTMINT AI • Big moments. Brilliantly planned.
          </div>
        </div>
      </div>
    </div>
  );
};
