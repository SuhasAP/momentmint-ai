"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Header } from "@/components/Header";
import { HeroLanding } from "@/components/HeroLanding";
import { EventWizard } from "@/components/EventWizard";
import { EventDashboard } from "@/components/EventDashboard";
import { SettingsModal } from "@/components/SettingsModal";
import { PrintViewModal } from "@/components/PrintViewModal";
import { EventInput, EventPlan } from "@/types/event";
import {
  loadSavedEvents,
  saveEvent,
  deleteEvent,
  duplicateEvent,
  getStoredApiKey,
} from "@/lib/storage";
import { SAMPLE_PRESETS, generateFallbackPlan } from "@/lib/sample-data";

export default function Home() {
  const [savedEvents, setSavedEvents] = useState<EventPlan[]>([]);
  const [activePlan, setActivePlan] = useState<EventPlan | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [initialPreset, setInitialPreset] = useState<EventInput | null>(null);
  const [customApiKey, setCustomApiKey] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Initialize from storage on client mount
  useEffect(() => {
    const events = loadSavedEvents();
    setSavedEvents(events);
    const key = getStoredApiKey();
    setCustomApiKey(key);

    if (events.length > 0) {
      setActivePlan(events[0]);
    }
  }, []);

  const handleKeyUpdated = (hasKey: boolean) => {
    const key = getStoredApiKey();
    setCustomApiKey(key);
  };

  const handleStartPlanning = (preset?: EventInput) => {
    setInitialPreset(preset || null);
    setIsWizardOpen(true);
  };

  const handleLoadPresetAndOpen = (index: number) => {
    const preset = SAMPLE_PRESETS[index];
    if (preset) {
      handleStartPlanning(preset.input);
    }
  };

  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleGeneratePlan = async (input: EventInput) => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, apiKey: customApiKey }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.plan) {
        throw new Error(data.message || data.error || "Generation request failed");
      }

      const newPlan: EventPlan = data.plan;
      saveEvent(newPlan);
      const updatedList = loadSavedEvents();
      setSavedEvents(updatedList);
      setActivePlan(newPlan);
      setIsWizardOpen(false);
      setGenerationError(null);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#7C3AED", "#F43F5E", "#10B981", "#F59E0B"],
        });
      } catch {
        // Safe confetti fallback
      }
    } catch (err) {
      console.error("[MOMENTMINT AI] Plan Generation Error:", err);
      setGenerationError((err as Error).message || "Generation failed. Please verify your Gemini API key in Settings or continue in Demo Sandbox Mode.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDemo = (input: EventInput) => {
    const fallback = generateFallbackPlan(input);
    saveEvent(fallback);
    setSavedEvents(loadSavedEvents());
    setActivePlan(fallback);
    setIsWizardOpen(false);
    setGenerationError(null);
  };

  const handleUpdatePlan = (updated: EventPlan) => {
    saveEvent(updated);
    setActivePlan(updated);
    setSavedEvents(loadSavedEvents());
  };

  const handleDeletePlan = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    const remaining = deleteEvent(deleteConfirmId);
    setSavedEvents(remaining);
    if (activePlan?.id === deleteConfirmId) {
      setActivePlan(remaining.length > 0 ? remaining[0] : null);
    }
    setDeleteConfirmId(null);
  };

  const handleDuplicatePlan = (id: string) => {
    const dup = duplicateEvent(id);
    if (dup) {
      const updatedList = loadSavedEvents();
      setSavedEvents(updatedList);
      setActivePlan(dup);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
      {/* Header */}
      <Header
        onNewEvent={() => handleStartPlanning()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        savedEvents={savedEvents}
        activeEvent={activePlan}
        onSelectEvent={(plan) => {
          setActivePlan(plan);
          setIsWizardOpen(false);
        }}
        onDeleteEvent={handleDeletePlan}
        onDuplicateEvent={handleDuplicatePlan}
        apiKeyConfigured={customApiKey.trim().length > 5}
        onOpenPrint={() => setIsPrintOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isWizardOpen ? (
          <EventWizard
            onGenerate={handleGeneratePlan}
            isGenerating={isGenerating}
            onCancel={() => {
              setIsWizardOpen(false);
              setGenerationError(null);
            }}
            initialPreset={initialPreset}
            generationError={generationError}
            onClearError={() => setGenerationError(null)}
            onGenerateDemo={handleGenerateDemo}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        ) : activePlan ? (
          <EventDashboard
            plan={activePlan}
            onUpdatePlan={handleUpdatePlan}
            onDeletePlan={handleDeletePlan}
            onDuplicatePlan={handleDuplicatePlan}
            onOpenPrint={() => setIsPrintOpen(true)}
            customApiKey={customApiKey}
          />
        ) : (
          <HeroLanding
            onStartPlanning={() => handleStartPlanning()}
            onLoadPreset={handleLoadPresetAndOpen}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EFECE1] py-8 bg-[#FAF9F5] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-slate-800">MOMENTMINT AI</span>
            <span>—</span>
            <span>Big moments. Brilliantly planned.</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span>Google Gemini AI Native</span>
            <span>Strict Financial Arithmetic</span>
            <span>Hack2Skill PromptWars 2026</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeyUpdated={handleKeyUpdated}
      />

      {/* Print / PDF Modal */}
      {activePlan && (
        <PrintViewModal
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
          plan={activePlan}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Delete Event Plan?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this event plan? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
