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
    <header className="sticky top-0 z-40 bg-[#F8F6F0]/90 backdrop-blur-md border-b border-[#E7E3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand identity - Boutique Editorial Event Studio */}
        <div
          className="flex items-center space-x-3.5 cursor-pointer group"
          onClick={onNewEvent}
        >
          <div className="w-10 h-10 rounded-xl bg-[#17372B] border border-[#E9DFC9]/40 flex items-center justify-center text-[#E9DFC9] shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-[#E9DFC9]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif tracking-tight text-2xl font-bold text-[#17372B]">
                MOMENTMINT
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#DCE5D8] text-[#17372B] border border-[#C4D4BE]">
                STUDIO AI
              </span>
            </div>
            <p className="text-[11px] text-[#697168] font-medium tracking-wide hidden sm:block">
              Bespoke Celebrations. Brilliantly Planned.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Engine indicator */}
          <button
            onClick={onOpenSettings}
            className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              apiKeyConfigured
                ? "bg-[#DCE5D8]/80 text-[#17372B] border-[#C4D4BE] hover:bg-[#DCE5D8]"
                : "bg-[#FAF7F1] text-[#697168] border-[#E7E3D9] hover:bg-[#F0ECE1]"
            }`}
            title="Configure Google Gemini API Key"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiKeyConfigured ? "bg-[#214737] animate-pulse" : "bg-[#C87960]"
              }`}
            />
            <span className="tracking-wide">
              {apiKeyConfigured ? "Gemini 2.5 Active" : "Demo Sandbox (Add Key)"}
            </span>
          </button>

          {/* Saved Events Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#222820] bg-white border border-[#E7E3D9] hover:bg-[#FAF7F1] hover:border-[#D8C7A5] transition-all shadow-subtle"
              aria-label="View Saved Events"
            >
              <Calendar className="w-4 h-4 text-[#214737]" />
              <span className="hidden sm:inline font-sans">Dossiers</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#F0ECE1] text-[11px] font-bold text-[#17372B]">
                {savedEvents.length}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#697168]" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-[#E7E3D9] py-2.5 z-50 animate-fade-in"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-[#E7E3D9]/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#697168] uppercase tracking-widest">
                    Your Curated Events
                  </span>
                  <span className="text-xs text-[#697168]">{savedEvents.length} total</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#E7E3D9]/40">
                  {savedEvents.length === 0 ? (
                    <div className="p-5 text-center text-xs text-[#697168]">
                      No event dossiers saved yet. Generate your first plan to begin.
                    </div>
                  ) : (
                    savedEvents.map((evt) => {
                      const isActive = activeEvent?.id === evt.id;
                      return (
                        <div
                          key={evt.id}
                          className={`px-3.5 py-3 flex items-center justify-between hover:bg-[#F8F6F0] transition-colors ${
                            isActive ? "bg-[#DCE5D8]/40" : ""
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
                              {isActive && <Check className="w-3.5 h-3.5 text-[#214737] flex-shrink-0" />}
                              <p className="text-sm font-bold text-[#222820] truncate font-serif">
                                {evt.title}
                              </p>
                            </div>
                            <p className="text-xs text-[#697168] mt-0.5 font-sans">
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
                              className="p-1.5 rounded-lg text-[#697168] hover:text-[#222820] hover:bg-[#E9DFC9]/50 transition-colors"
                              title="Duplicate dossier"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteEvent(evt.id);
                              }}
                              className="p-1.5 rounded-lg text-[#697168] hover:text-[#C87960] hover:bg-[#FAF1EE] transition-colors"
                              title="Delete dossier"
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

          {/* Export button if active plan */}
          {activeEvent && (
            <button
              onClick={onOpenPrint}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#222820] bg-white border border-[#E7E3D9] hover:bg-[#FAF7F1] transition-all shadow-subtle"
              title="Print or Export PDF Dossier"
            >
              <FileText className="w-4 h-4 text-[#214737]" />
              <span className="hidden md:inline font-sans">Export</span>
            </button>
          )}

          {/* Settings / API Key */}
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl text-[#222820] bg-white border border-[#E7E3D9] hover:bg-[#FAF7F1] hover:border-[#D8C7A5] transition-all shadow-subtle"
            aria-label="Settings and API Key"
            title="Settings and API Key"
          >
            <Key className="w-4 h-4 text-[#214737]" />
          </button>

          {/* New Event Button */}
          <button
            onClick={onNewEvent}
            className="flex items-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#E9DFC9] bg-[#17372B] hover:bg-[#214737] border border-[#E9DFC9]/30 transition-all shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4 text-[#E9DFC9]" />
            <span className="font-sans">Plan Event</span>
          </button>
        </div>
      </div>
    </header>
  );
};
