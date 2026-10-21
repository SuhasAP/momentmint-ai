"use client";

import React, { useState } from "react";
import { Sparkles, Calendar, Plus, Key, ChevronDown, Trash2, Copy, FileText, Check } from "lucide-react";
import { EventPlan } from "@/types/event";

interface HeaderProps {
  onNewEvent: () => void;
  onOpenSettings: () => void;
  savedEvents: EventPlan[];
  activeEvent: EventPlan | null;
  onSelectEvent: (plan: EventPlan) => void;
  onDeleteEvent: (id: string) => void;
  onDuplicateEvent: (id: string) => void;
  apiKeyConfigured: boolean;
  onOpenPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewEvent,
  onOpenSettings,
  savedEvents,
  activeEvent,
  onSelectEvent,
  onDeleteEvent,
  onDuplicateEvent,
  apiKeyConfigured,
  onOpenPrint,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#EFECE1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onNewEvent}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif tracking-tight text-xl font-bold text-slate-900">
                MOMENTMINT
              </span>
              <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-rose-500 text-white shadow-sm">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Big moments. Brilliantly planned.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Engine indicator */}
          <button
            onClick={onOpenSettings}
            className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              apiKeyConfigured
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
            }`}
            title="Configure Gemini API Key"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiKeyConfigured ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>{apiKeyConfigured ? "Gemini 2.5 Active" : "Demo Engine (Add Key)"}</span>
          </button>

          {/* Saved Events Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-white border border-[#EFECE1] hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              aria-label="View Saved Events"
            >
              <Calendar className="w-4 h-4 text-violet-600" />
              <span className="hidden sm:inline">Saved Plans</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                {savedEvents.length}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Your Saved Celebrations
                  </span>
                  <span className="text-xs text-slate-400">{savedEvents.length} total</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {savedEvents.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      No saved events yet. Generate your first plan to save!
                    </div>
                  ) : (
                    savedEvents.map((evt) => {
                      const isActive = activeEvent?.id === evt.id;
                      return (
                        <div
                          key={evt.id}
                          className={`px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            isActive ? "bg-violet-50/70" : ""
                          }`}
                        >
                          <div
                            className="flex-1 cursor-pointer pr-2"
                            onClick={() => {
                              onSelectEvent(evt);
                              setDropdownOpen(false);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              {isActive && <Check className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />}
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {evt.title}
                              </p>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {evt.input.city} • {evt.input.guestCount} guests • {evt.budgetBreakdown.currency}{" "}
                              {evt.budgetBreakdown.totalBudget.toLocaleString()}
                            </p>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicateEvent(evt.id);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                              title="Duplicate plan"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteEvent(evt.id);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete plan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Print / Export button if active plan */}
          {activeEvent && (
            <button
              onClick={onOpenPrint}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-white border border-[#EFECE1] hover:bg-slate-50 transition-all shadow-sm"
              title="Print or Export PDF"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline">Export</span>
            </button>
          )}

          {/* Settings / API Key */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-600 bg-white border border-[#EFECE1] hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
            aria-label="Settings and API Key"
            title="Settings and API Key"
          >
            <Key className="w-4 h-4 text-slate-600" />
          </button>

          {/* New Event Button */}
          <button
            onClick={onNewEvent}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>New Plan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
