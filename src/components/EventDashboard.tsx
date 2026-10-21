"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  DollarSign,
  Palette,
  Clock,
  Calculator,
  Utensils,
  CheckSquare,
  Compass,
  Edit2,
  Trash2,
  Plus,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  TrendingDown,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  Layers,
  Sun,
  Home,
} from "lucide-react";
import {
  EventPlan,
  BudgetItem,
  ItineraryItem,
  ChecklistItem,
  VendorLead,
} from "@/types/event";
import { calculateBudgetMetrics, formatCurrency } from "@/lib/budget-math";
import { CopilotDrawer } from "./CopilotDrawer";
import { CostOptimizerModal } from "./CostOptimizerModal";

interface EventDashboardProps {
  plan: EventPlan;
  onUpdatePlan: (updated: EventPlan) => void;
  onDeletePlan: (id: string) => void;
  onDuplicatePlan: (id: string) => void;
  onOpenPrint: () => void;
  customApiKey?: string;
}

export const EventDashboard: React.FC<EventDashboardProps> = ({
  plan,
  onUpdatePlan,
  onDeletePlan,
  onDuplicatePlan,
  onOpenPrint,
  customApiKey,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "itinerary" | "budget" | "menu" | "checklist" | "vendors"
  >("overview");

  const [copilotOpen, setCopilotOpen] = useState(false);
  const [optimizerOpen, setOptimizerOpen] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Editable title modal state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(plan.title);

  // New item modal states
  const [newBudgetItemOpen, setNewBudgetItemOpen] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState<BudgetItem["category"]>("Decor & Styling");
  const [newExpenseCost, setNewExpenseCost] = useState<number>(1000);
  const [newExpensePriority, setNewExpensePriority] = useState<BudgetItem["priority"]>("nice-to-have");

  // New Itinerary item state
  const [newItinOpen, setNewItinOpen] = useState(false);
  const [newItinTime, setNewItinTime] = useState("19:00 - 19:45");
  const [newItinTitle, setNewItinTitle] = useState("");
  const [newItinDesc, setNewItinDesc] = useState("");
  const [newItinDuration, setNewItinDuration] = useState(45);
  const [newItinPhase, setNewItinPhase] = useState<ItineraryItem["phase"]>("evening");

  // New Task state
  const [newTaskInput, setNewTaskInput] = useState("");
  const [newTaskPhase, setNewTaskPhase] = useState<ChecklistItem["phase"]>("week_of");

  // New Vendor state
  const [newVendorOpen, setNewVendorOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorCategory, setNewVendorCategory] = useState("Decor & Styling");
  const [newVendorContact, setNewVendorContact] = useState("");
  const [newVendorPrice, setNewVendorPrice] = useState("");

  // Real-time deterministic budget arithmetic
  const metrics = calculateBudgetMetrics(plan.budgetBreakdown, plan.input.guestCount);
  const currency = plan.budgetBreakdown.currency;

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      onUpdatePlan({ ...plan, title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  // Budget Actions
  const handleUpdateItemCost = (itemId: string, newCost: number) => {
    const updatedItems = plan.budgetBreakdown.items.map((it) =>
      it.id === itemId ? { ...it, estimatedCost: Math.max(0, newCost) } : it
    );
    onUpdatePlan({
      ...plan,
      budgetBreakdown: { ...plan.budgetBreakdown, items: updatedItems },
    });
  };

  const handleUpdateItemPriority = (itemId: string, newPriority: BudgetItem["priority"]) => {
    const updatedItems = plan.budgetBreakdown.items.map((it) =>
      it.id === itemId ? { ...it, priority: newPriority } : it
    );
    onUpdatePlan({
      ...plan,
      budgetBreakdown: { ...plan.budgetBreakdown, items: updatedItems },
    });
  };

  const handleDeleteBudgetItem = (itemId: string) => {
    const updatedItems = plan.budgetBreakdown.items.filter((it) => it.id !== itemId);
    onUpdatePlan({
      ...plan,
      budgetBreakdown: { ...plan.budgetBreakdown, items: updatedItems },
    });
  };

  const handleAddBudgetItem = () => {
    if (!newExpenseName.trim()) return;
    const newItem: BudgetItem = {
      id: `custom-b-${Date.now()}`,
      category: newExpenseCategory,
      name: newExpenseName.trim(),
      estimatedCost: Number(newExpenseCost) || 0,
      priority: newExpensePriority,
      notes: "Custom user-added expense line item",
      isCustom: true,
    };
    onUpdatePlan({
      ...plan,
      budgetBreakdown: {
        ...plan.budgetBreakdown,
        items: [...plan.budgetBreakdown.items, newItem],
      },
    });
    setNewExpenseName("");
    setNewExpenseCost(1000);
    setNewBudgetItemOpen(false);
  };

  // Checklist Actions
  const handleToggleTask = (taskId: string) => {
    const updatedChecklist = plan.checklist.map((c) =>
      c.id === taskId ? { ...c, completed: !c.completed } : c
    );
    onUpdatePlan({ ...plan, checklist: updatedChecklist });
  };

  const handleAddTask = () => {
    if (!newTaskInput.trim()) return;
    const newTask: ChecklistItem = {
      id: `task-${Date.now()}`,
      phase: newTaskPhase,
      task: newTaskInput.trim(),
      dueDate: newTaskPhase.replace("_", " "),
      completed: false,
      category: "Custom",
    };
    onUpdatePlan({
      ...plan,
      checklist: [...plan.checklist, newTask],
    });
    setNewTaskInput("");
  };

  // Itinerary Actions
  const handleAddItinerary = () => {
    if (!newItinTitle.trim()) return;
    const newItin: ItineraryItem = {
      id: `itin-${Date.now()}`,
      time: newItinTime,
      title: newItinTitle.trim(),
      description: newItinDesc.trim(),
      durationMin: Number(newItinDuration) || 30,
      phase: newItinPhase,
    };
    onUpdatePlan({
      ...plan,
      itinerary: [...plan.itinerary, newItin],
    });
    setNewItinTitle("");
    setNewItinDesc("");
    setNewItinOpen(false);
  };

  const handleDeleteItinerary = (id: string) => {
    onUpdatePlan({
      ...plan,
      itinerary: plan.itinerary.filter((i) => i.id !== id),
    });
  };

  // Vendor Actions
  const handleAddCustomVendor = () => {
    if (!newVendorName.trim()) return;
    const newLead: VendorLead = {
      id: `ven-${Date.now()}`,
      category: newVendorCategory,
      suggestedType: newVendorName.trim(),
      recommendationReason: "Direct user-saved contact & estimate",
      typicalPriceRange: newVendorPrice || "Contract Pending",
      keyQuestionsToAsk: ["Deliverables agreement", "Payment terms"],
      verified: true,
      contactInfo: newVendorContact.trim(),
    };
    onUpdatePlan({
      ...plan,
      vendorLeads: [newLead, ...plan.vendorLeads],
    });
    setNewVendorName("");
    setNewVendorContact("");
    setNewVendorPrice("");
    setNewVendorOpen(false);
  };

  const completedTasks = plan.checklist.filter((t) => t.completed).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
      {/* Top Banner / Event Header Card */}
      <div className="bg-white rounded-2xl border border-[#EFECE1] p-6 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-100/70 px-2.5 py-0.5 rounded-full border border-violet-200">
                {plan.input.eventType.toUpperCase()}
              </span>

              {/* Attribution Label */}
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${
                  plan.aiMetadata.isMockFallback
                    ? "bg-amber-50 text-amber-900 border-amber-200"
                    : "bg-emerald-50 text-emerald-900 border-emerald-200"
                }`}
              >
                <Sparkles className="w-3 h-3 text-violet-600" />
                <span>
                  {plan.aiMetadata.isMockFallback
                    ? "Demo Intelligence Sandbox"
                    : `Powered by Google ${plan.aiMetadata.model}`}
                </span>
              </span>

              <span className="text-xs text-slate-400">• Updated {new Date(plan.updatedAt).toLocaleTimeString()}</span>
            </div>

            {/* Editable Title */}
            <div className="flex items-center space-x-3">
              {isEditingTitle ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-xl sm:text-2xl font-serif font-bold text-slate-900 border-b-2 border-violet-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="p-1 rounded bg-violet-600 text-white hover:bg-violet-700"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                    {plan.title}
                  </h1>
                  <button
                    onClick={() => {
                      setEditedTitle(plan.title);
                      setIsEditingTitle(true);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    title="Edit Title"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Sub-pills */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{plan.input.city}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-violet-600" />
                <span>{plan.input.date}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>{plan.input.guestCount} Guests</span>
              </span>
              <span className="flex items-center space-x-1 capitalize font-medium text-slate-800">
                {plan.input.venuePreference === "outdoor" ? (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Home className="w-3.5 h-3.5 text-violet-500" />
                )}
                <span>{plan.input.venuePreference} Setting</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Copilot Trigger */}
            <button
              onClick={() => setCopilotOpen(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-rose-600 hover:opacity-95 shadow-md shadow-violet-500/25 flex items-center space-x-2 transition-all"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Event Copilot</span>
            </button>

            {/* Cost Optimizer */}
            <button
              onClick={() => setOptimizerOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center space-x-1.5"
            >
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>Cost Optimizer</span>
            </button>

            {/* Print / Export */}
            <button
              onClick={onOpenPrint}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Live Financial Metrics Strip */}
        <div className="mt-6 pt-5 border-t border-[#EFECE1] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EFECE1]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Budget Target
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {formatCurrency(metrics.totalBudget, currency)}
            </span>
          </div>

          <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EFECE1]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Allocated Spend
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {formatCurrency(metrics.totalAllocated, currency)}
            </span>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              metrics.isOverBudget
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-950"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
              {metrics.isOverBudget ? "Over Budget" : "Remaining Reserve"}
            </span>
            <span className="text-base sm:text-lg font-bold">
              {formatCurrency(metrics.isOverBudget ? metrics.overBudgetAmount : metrics.remaining, currency)}
            </span>
          </div>

          <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EFECE1]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Per-Guest Average
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-800">
              {formatCurrency(metrics.perGuestCost, currency)}
              <span className="text-xs font-normal text-slate-500"> / head</span>
            </span>
          </div>
        </div>

        {/* Feasibility Alert if any */}
        {metrics.feasibilityWarnings.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              {metrics.feasibilityWarnings.map((w, idx) => (
                <p key={idx}>{w}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#EFECE1] overflow-x-auto space-x-2 sm:space-x-4">
        {[
          { id: "overview", label: "Overview & Concept", icon: Palette },
          { id: "itinerary", label: "Timeline & Itinerary", icon: Clock },
          { id: "budget", label: "Budget Tracker", icon: Calculator },
          { id: "menu", label: "Gastronomy & Menu", icon: Utensils },
          { id: "checklist", label: `Checklist (${completedTasks}/${plan.checklist.length})`, icon: CheckSquare },
          { id: "vendors", label: `Vendor Discovery (${plan.vendorLeads.length})`, icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 px-3.5 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
                isActive
                  ? "border-violet-600 text-violet-700 bg-white/60"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & CONCEPT */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Concept Summary & Rationale */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-[#EFECE1] p-6 shadow-soft space-y-4">
              <div className="flex items-center space-x-2 text-violet-700">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-base font-bold uppercase tracking-wider text-slate-900">
                  Concept Rationale & Experience Architecture
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#EFECE1]">
                <h4 className="font-serif font-bold text-lg text-slate-900">{plan.concept.name}</h4>
                <p className="text-sm text-slate-700 mt-2 leading-relaxed">{plan.concept.summary}</p>
                <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200 leading-relaxed">
                  <span className="font-semibold text-slate-700">Strategic Rationale:</span> {plan.concept.rationale}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {plan.concept.aestheticKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Decor & Styling Ideas */}
            <div className="bg-white rounded-2xl border border-[#EFECE1] p-6 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Decor & Spatial Styling Concepts</span>
                <span className="text-xs text-slate-400 font-normal">
                  {plan.styling.decorIdeas.length} Curated Installations
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.styling.decorIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-violet-300 transition-colors bg-white flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                        {idea.area}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-2">{idea.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{idea.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Estimated Cost:</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(idea.estimatedCost, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assumptions & Next Actions */}
            <div className="bg-white rounded-2xl border border-[#EFECE1] p-6 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-slate-900">Practical Next Actions</h3>
              <div className="space-y-2">
                {plan.nextActionSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Palette & Contingency */}
          <div className="space-y-6">
            {/* Color Palette Moodboard */}
            <div className="bg-white rounded-2xl border border-[#EFECE1] p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Aesthetic Color Palette</h3>
                <span className="text-[11px] text-slate-400">Click to copy hex</span>
              </div>

              <div className="space-y-3">
                {plan.styling.colorPalette.map((swatch, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCopyHex(swatch.hex)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className="w-8 h-8 rounded-lg shadow-sm border border-slate-300 flex-shrink-0"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{swatch.name}</p>
                        <p className="text-[11px] text-slate-500">{swatch.usage}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {copiedHex === swatch.hex ? "Copied!" : swatch.hex}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks & Contingencies */}
            <div className="bg-white rounded-2xl border border-[#EFECE1] p-6 shadow-soft space-y-4">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900">Risks & Contingency Plans</h3>
              </div>

              <div className="space-y-3">
                {plan.riskAndContingency.map((r, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{r.risk}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          r.impact === "high"
                            ? "bg-rose-100 text-rose-800"
                            : r.impact === "medium"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {r.impact} impact
                      </span>
                    </div>
                    <p className="text-slate-600">
                      <strong className="text-slate-700">Prevention:</strong> {r.prevention}
                    </p>
                    <p className="text-slate-600">
                      <strong className="text-violet-700">Backup Plan:</strong> {r.backupPlan}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TIMELINE / ITINERARY */}
      {activeTab === "itinerary" && (
        <div className="bg-white rounded-2xl border border-[#EFECE1] p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Time-Blocked Event Itinerary</h3>
              <p className="text-xs text-slate-500">Flow, pacing, and operational transitions</p>
            </div>
            <button
              onClick={() => setNewItinOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event Phase</span>
            </button>
          </div>

          <div className="relative border-l-2 border-violet-200 ml-4 pl-6 space-y-6">
            {plan.itinerary.map((item, index) => (
              <div key={item.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-violet-600 ring-4 ring-white" />

                <div className="p-4 rounded-xl border border-slate-200 hover:border-violet-300 transition-all bg-white flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                        {item.time}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 capitalize">
                        • {item.phase} ({item.durationMin} mins)
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteItinerary(item.id)}
                    className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 self-end sm:self-center transition-colors"
                    title="Delete phase"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Itinerary Modal */}
          {newItinOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-base text-slate-900">Add Timeline Milestone</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Range</label>
                  <input
                    type="text"
                    value={newItinTime}
                    onChange={(e) => setNewItinTime(e.target.value)}
                    placeholder="e.g. 18:30 - 19:15"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newItinTitle}
                    onChange={(e) => setNewItinTitle(e.target.value)}
                    placeholder="e.g. Toast & Acoustic Performance"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newItinDesc}
                    onChange={(e) => setNewItinDesc(e.target.value)}
                    placeholder="Details of what occurs during this phase"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setNewItinOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddItinerary}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
                  >
                    Add Milestone
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BUDGET TRACKER */}
      {activeTab === "budget" && (
        <div className="space-y-6">
          {/* Category Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {metrics.categories.map((cat) => (
              <div key={cat.category} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                  {cat.category}
                </span>
                <span className="text-sm font-bold text-slate-900 block mt-1">
                  {formatCurrency(cat.total, currency)}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {Math.round(cat.percentageOfBudget)}% of budget
                </span>
              </div>
            ))}
          </div>

          {/* Interactive Itemized Table */}
          <div className="bg-white rounded-2xl border border-[#EFECE1] p-6 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Itemized Cost Allocations</h3>
                <p className="text-xs text-slate-500">
                  Directly editable • Sum matches total allocated • Real-time recalculation
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setOptimizerOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 flex items-center space-x-1"
                >
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cost Optimizer</span>
                </button>
                <button
                  onClick={() => setNewBudgetItemOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense Line</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Expense Item & Notes</th>
                    <th className="py-2.5 px-3">Priority Level</th>
                    <th className="py-2.5 px-3 text-right">Estimate ({currency})</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plan.budgetBreakdown.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.notes}</div>
                      </td>

                      <td className="py-3 px-3">
                        <select
                          value={item.priority}
                          onChange={(e) =>
                            handleUpdateItemPriority(item.id, e.target.value as BudgetItem["priority"])
                          }
                          className={`text-xs px-2 py-1 rounded-lg border font-semibold focus:outline-none ${
                            item.priority === "must-have"
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : item.priority === "nice-to-have"
                              ? "bg-slate-50 text-slate-700 border-slate-200"
                              : "bg-purple-50 text-purple-800 border-purple-200"
                          }`}
                        >
                          <option value="must-have">Must-Have</option>
                          <option value="nice-to-have">Nice-to-Have</option>
                          <option value="splurge">Splurge</option>
                        </select>
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        <div className="inline-flex items-center space-x-1">
                          <span className="text-slate-400 text-xs font-mono">{currency === "INR" ? "₹" : "$"}</span>
                          <input
                            type="number"
                            min="0"
                            step="500"
                            value={item.estimatedCost}
                            onChange={(e) => handleUpdateItemCost(item.id, Number(e.target.value))}
                            className="w-24 text-right px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500"
                          />
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleDeleteBudgetItem(item.id)}
                          className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold text-sm bg-slate-50/50">
                    <td colSpan={3} className="py-3 px-3 text-slate-900">
                      Total Allocated Calculation (Sum of all {plan.budgetBreakdown.items.length} line items)
                    </td>
                    <td className="py-3 px-3 text-right text-slate-900 font-mono">
                      {formatCurrency(metrics.totalAllocated, currency)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Add Budget Item Modal */}
          {newBudgetItemOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-base text-slate-900">Add Custom Budget Item</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={newExpenseName}
                    onChange={(e) => setNewExpenseName(e.target.value)}
                    placeholder="e.g. Polaroid Guestbook Station"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={newExpenseCategory}
                      onChange={(e) => setNewExpenseCategory(e.target.value as BudgetItem["category"])}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                    >
                      <option value="Venue">Venue</option>
                      <option value="Catering">Catering</option>
                      <option value="Decor & Styling">Decor & Styling</option>
                      <option value="Photography">Photography</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Logistics & Staff">Logistics & Staff</option>
                      <option value="Gifts & Favors">Gifts & Favors</option>
                      <option value="Contingency">Contingency</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                    <select
                      value={newExpensePriority}
                      onChange={(e) => setNewExpensePriority(e.target.value as BudgetItem["priority"])}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                    >
                      <option value="must-have">Must-Have</option>
                      <option value="nice-to-have">Nice-to-Have</option>
                      <option value="splurge">Splurge</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Cost ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={newExpenseCost}
                    onChange={(e) => setNewExpenseCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setNewBudgetItemOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBudgetItem}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
                  >
                    Add Line Item
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GASTRONOMY & MENU */}
      {activeTab === "menu" && (
        <div className="bg-white rounded-2xl border border-[#EFECE1] p-6 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">
                Culinary Experience & Hospitality
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{plan.menu.cateringStyle}</h3>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
              <span className="text-emerald-800 font-semibold block">Estimated Per-Head Food Spend:</span>
              <span className="font-bold text-emerald-950 text-base">
                {formatCurrency(plan.menu.perHeadEstimate, currency)} / guest
              </span>
            </div>
          </div>

          {/* Courses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plan.menu.courses.map((course, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>{course.name}</span>
                  <span className="text-xs text-slate-400 font-normal">{course.items.length} Options</span>
                </h4>

                <div className="space-y-3">
                  {course.items.map((item, i) => (
                    <div key={i} className="text-xs space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{item.title}</span>
                        {item.isVegetarian && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                            Veg
                          </span>
                        )}
                        {item.isVegan && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-semibold">
                            Vegan
                          </span>
                        )}
                        {item.isGlutenFree && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                            GF
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 leading-relaxed">{item.description}</p>
                      {item.dietaryNotes && (
                        <p className="text-[11px] text-violet-700 italic">{item.dietaryNotes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Beverages */}
          <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Curated Beverage & Refreshment Pairings
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {plan.menu.beverages.map((bev, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 font-medium text-slate-800 shadow-xs"
                >
                  🍹 {bev}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MASTER CHECKLIST */}
      {activeTab === "checklist" && (
        <div className="bg-white rounded-2xl border border-[#EFECE1] p-6 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Master Preparation Checklist</h3>
              <p className="text-xs text-slate-500">
                {completedTasks} of {plan.checklist.length} milestones checked off
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full sm:w-64 bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${(completedTasks / (plan.checklist.length || 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Add quick task */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              placeholder="Add a new custom task..."
              className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <select
              value={newTaskPhase}
              onChange={(e) => setNewTaskPhase(e.target.value as ChecklistItem["phase"])}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700"
            >
              <option value="4_weeks_prior">4 Weeks Prior</option>
              <option value="2_weeks_prior">2 Weeks Prior</option>
              <option value="week_of">Week of Event</option>
              <option value="day_of">Day of Event</option>
              <option value="post_event">Post Event</option>
            </select>
            <button
              onClick={handleAddTask}
              className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Add
            </button>
          </div>

          <div className="space-y-3">
            {plan.checklist.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  task.completed
                    ? "bg-slate-50 border-slate-200 opacity-60 line-through text-slate-400"
                    : "bg-white border-slate-200 hover:border-violet-300 text-slate-900 shadow-xs"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border ${
                      task.completed
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold">{task.task}</span>
                    <span className="ml-2 text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {task.category}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono text-slate-500">{task.dueDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: VENDOR DISCOVERY */}
      {activeTab === "vendors" && (
        <div className="bg-white rounded-2xl border border-[#EFECE1] p-6 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-violet-600" />
                <h3 className="text-lg font-bold text-slate-900">Vendor Discovery Leads & Shortlist</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Clearly distinguishes AI discovery leads from your verified booked partners
              </p>
            </div>

            <button
              onClick={() => setNewVendorOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Real Vendor Contact</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.vendorLeads.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between space-y-4 hover:border-violet-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                      {v.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.verified
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {v.verified ? "Verified Partner" : "Discovery Lead"}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 mt-2">{v.suggestedType}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{v.recommendationReason}</p>

                  {v.contactInfo && (
                    <p className="text-xs font-semibold text-slate-800 mt-2">
                      📞 {v.contactInfo}
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Typical Pricing:</span>
                    <span className="font-bold text-slate-900">{v.typicalPriceRange}</span>
                  </div>

                  {v.keyQuestionsToAsk && v.keyQuestionsToAsk.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Vetting Questions to Ask:
                      </span>
                      <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 pl-1">
                        {v.keyQuestionsToAsk.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Vendor Modal */}
          {newVendorOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-base text-slate-900">Add Real Vendor Contract</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Business or Contact Name</label>
                  <input
                    type="text"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    placeholder="e.g. Blossom Botanicals Bengaluru"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={newVendorCategory}
                    onChange={(e) => setNewVendorCategory(e.target.value)}
                    placeholder="e.g. Sustainable Decor & Lighting"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone or Link</label>
                  <input
                    type="text"
                    value={newVendorContact}
                    onChange={(e) => setNewVendorContact(e.target.value)}
                    placeholder="e.g. +91 98450 12345 / @blossombotanicals"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Agreed Price or Estimate</label>
                  <input
                    type="text"
                    value={newVendorPrice}
                    onChange={(e) => setNewVendorPrice(e.target.value)}
                    placeholder="e.g. ₹6,500 advance deposit"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setNewVendorOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomVendor}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800"
                  >
                    Save Vendor
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Copilot Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setCopilotOpen(true)}
          className="px-5 py-3 rounded-full font-bold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-rose-600 hover:opacity-95 shadow-xl shadow-violet-500/30 flex items-center space-x-2.5 transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: "6s" }} />
          <span>Ask Event Copilot</span>
        </button>
      </div>

      {/* Copilot Drawer */}
      <CopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        currentPlan={plan}
        onApplyChanges={(updated) => onUpdatePlan(updated)}
        customApiKey={customApiKey}
      />

      {/* Cost Optimizer Modal */}
      <CostOptimizerModal
        isOpen={optimizerOpen}
        onClose={() => setOptimizerOpen(false)}
        budgetBreakdown={plan.budgetBreakdown}
        currency={currency}
        onApplyOptimization={(items) => {
          onUpdatePlan({
            ...plan,
            budgetBreakdown: { ...plan.budgetBreakdown, items },
          });
        }}
      />
    </div>
  );
};
