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
  RotateCcw,
} from "lucide-react";
import {
  EventPlan,
  BudgetItem,
  ItineraryItem,
  ChecklistItem,
  VendorLead,
} from "@/types/event";
import { calculateBudgetMetrics, formatCurrency } from "@/lib/budget-math";
import { reconcileBudgetBreakdown } from "@/lib/gemini";
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

  const handleRebalanceContingency = () => {
    const reconciled = reconcileBudgetBreakdown(
      plan.budgetBreakdown.items,
      plan.budgetBreakdown.totalBudget,
      currency
    );
    onUpdatePlan({
      ...plan,
      budgetBreakdown: {
        ...plan.budgetBreakdown,
        items: reconciled.items,
        contingencyPercentage: reconciled.contingencyPercentage,
      },
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
      <div className="studio-card p-6 sm:p-8 border-[#E7E3D9] bg-white shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#17372B] bg-[#DCE5D8] px-3 py-1 rounded-full border border-[#C4D4BE]">
                {plan.input.eventType.toUpperCase()}
              </span>

              {/* Attribution Label */}
              <span
                className={`text-[11px] font-semibold px-3 py-0.5 rounded-full border flex items-center space-x-1.5 ${
                  plan.aiMetadata.isMockFallback
                    ? "bg-[#FAF7F1] text-[#697168] border-[#E7E3D9]"
                    : "bg-[#F0F5F2] text-[#214737] border-[#C4D4BE]"
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#214737]" />
                <span>
                  {plan.aiMetadata.isMockFallback
                    ? "Demo Intelligence Sandbox"
                    : `Powered by Google ${plan.aiMetadata.model}`}
                </span>
              </span>

              <span className="text-xs text-[#697168] font-sans">• Updated {new Date(plan.updatedAt).toLocaleTimeString()}</span>
            </div>

            {/* Editable Title */}
            <div className="flex items-center space-x-3">
              {isEditingTitle ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-2xl sm:text-3xl font-serif font-bold text-[#17372B] border-b-2 border-[#214737] focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="p-1.5 rounded-lg bg-[#214737] text-white hover:bg-[#17372B]"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2.5">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#17372B] tracking-tight">
                    {plan.title}
                  </h1>
                  <button
                    onClick={() => {
                      setEditedTitle(plan.title);
                      setIsEditingTitle(true);
                    }}
                    className="p-1.5 text-[#697168] hover:text-[#17372B] hover:bg-[#FAF7F1] rounded-lg transition-colors"
                    title="Edit Title"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Sub-pills */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#697168] font-sans">
              <span className="flex items-center space-x-1.5 font-medium text-[#222820]">
                <MapPin className="w-3.5 h-3.5 text-[#C87960]" />
                <span>{plan.input.city}</span>
              </span>
              <span className="flex items-center space-x-1.5 font-medium text-[#222820]">
                <Calendar className="w-3.5 h-3.5 text-[#214737]" />
                <span>{plan.input.date}</span>
              </span>
              <span className="flex items-center space-x-1.5 font-medium text-[#222820]">
                <Users className="w-3.5 h-3.5 text-[#214737]" />
                <span>{plan.input.guestCount} Guests</span>
              </span>
              <span className="flex items-center space-x-1.5 capitalize font-medium text-[#222820]">
                {plan.input.venuePreference === "outdoor" ? (
                  <Sun className="w-3.5 h-3.5 text-[#C87960]" />
                ) : (
                  <Home className="w-3.5 h-3.5 text-[#214737]" />
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
              className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#E9DFC9] bg-[#17372B] hover:bg-[#214737] border border-[#E9DFC9]/40 shadow-sm flex items-center space-x-2 transition-all group"
            >
              <Sparkles className="w-4 h-4 text-[#E9DFC9] animate-pulse" />
              <span>Ask Event Copilot</span>
            </button>

            {/* Cost Optimizer */}
            <button
              onClick={() => setOptimizerOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#C87960] bg-[#FAF1EE] hover:bg-[#F4DFD8] border border-[#E7E3D9] transition-colors flex items-center space-x-1.5 shadow-subtle"
            >
              <TrendingDown className="w-4 h-4 text-[#C87960]" />
              <span>Cost Optimizer</span>
            </button>

            {/* Print / Export */}
            <button
              onClick={onOpenPrint}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#222820] bg-white hover:bg-[#FAF7F1] border border-[#E7E3D9] shadow-subtle transition-colors flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4 text-[#697168]" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Live Financial Metrics Strip */}
        <div className="mt-6 pt-5 border-t border-[#E7E3D9] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#E7E3D9] shadow-subtle">
            <span className="text-[10px] font-bold text-[#697168] uppercase tracking-wider block">
              Budget Target
            </span>
            <span className="font-serif text-lg sm:text-xl font-bold text-[#17372B] mt-0.5 block">
              {formatCurrency(metrics.totalBudget, currency)}
            </span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#E7E3D9] shadow-subtle">
            <span className="text-[10px] font-bold text-[#697168] uppercase tracking-wider block">
              Allocated Spend
            </span>
            <span className="font-serif text-lg sm:text-xl font-bold text-[#17372B] mt-0.5 block">
              {formatCurrency(metrics.totalAllocated, currency)}
            </span>
          </div>

          <div
            className={`p-3.5 rounded-2xl border shadow-subtle ${
              metrics.isOverBudget
                ? "bg-[#FAF1EE] border-[#C87960]/30 text-[#C87960]"
                : "bg-[#DCE5D8]/40 border-[#DCE5D8] text-[#17372B]"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
              {metrics.isOverBudget ? "Over Budget" : "Remaining Reserve"}
            </span>
            <span className="font-serif text-lg sm:text-xl font-bold mt-0.5 block">
              {formatCurrency(metrics.isOverBudget ? metrics.overBudgetAmount : metrics.remaining, currency)}
            </span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#E7E3D9] shadow-subtle">
            <span className="text-[10px] font-bold text-[#697168] uppercase tracking-wider block">
              Per-Guest Average
            </span>
            <span className="font-serif text-lg sm:text-xl font-bold text-[#17372B] mt-0.5 block">
              {formatCurrency(metrics.perGuestCost, currency)}
              <span className="font-sans text-xs font-normal text-[#697168]"> / head</span>
            </span>
          </div>
        </div>

        {/* Feasibility Alert if any */}
        {metrics.feasibilityWarnings.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#FAF1EE] border border-[#C87960]/30 text-xs text-[#C87960] flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#C87960] flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              {metrics.feasibilityWarnings.map((w, idx) => (
                <p key={idx} className="font-medium">{w}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E7E3D9] overflow-x-auto space-x-2 sm:space-x-4">
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
                  ? "border-[#214737] text-[#17372B] bg-[#DCE5D8]/40 rounded-t-xl"
                  : "border-transparent text-[#697168] hover:text-[#17372B] hover:border-[#E7E3D9]"
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
            <div className="bg-white rounded-2xl border border-[#E7E3D9] p-6 shadow-subtle space-y-4">
              <div className="flex items-center space-x-2 text-[#214737]">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#17372B]">
                  Concept Rationale & Experience Architecture
                </h3>
              </div>

              <div className="p-5 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9]">
                <h4 className="font-serif font-bold text-xl text-[#17372B]">{plan.concept.name}</h4>
                <p className="text-sm text-[#222820] mt-2 leading-relaxed">{plan.concept.summary}</p>
                <p className="text-xs text-[#697168] mt-3 pt-3 border-t border-[#E7E3D9] leading-relaxed">
                  <span className="font-semibold text-[#17372B]">Strategic Rationale:</span> {plan.concept.rationale}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {plan.concept.aestheticKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-[#F8F6F0] border border-[#E7E3D9] text-[#17372B] font-medium"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Decor & Styling Ideas */}
            <div className="bg-white rounded-2xl border border-[#E7E3D9] p-6 shadow-subtle space-y-4">
              <h3 className="text-base font-bold text-[#17372B] flex items-center justify-between">
                <span>Decor & Spatial Styling Concepts</span>
                <span className="text-xs text-[#697168] font-normal">
                  {plan.styling.decorIdeas.length} Curated Installations
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.styling.decorIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="p-5 rounded-2xl border border-[#E7E3D9] hover:border-[#214737]/40 transition-colors bg-white shadow-subtle flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#17372B] bg-[#DCE5D8]/60 border border-[#DCE5D8] px-2.5 py-0.5 rounded-full">
                        {idea.area}
                      </span>
                      <h4 className="font-bold text-sm text-[#17372B] mt-2.5">{idea.title}</h4>
                      <p className="text-xs text-[#697168] mt-1 leading-relaxed">{idea.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E7E3D9] flex items-center justify-between text-xs">
                      <span className="text-[#697168]">Estimated Allocation:</span>
                      <span className="font-serif font-bold text-sm text-[#17372B]">
                        {formatCurrency(idea.estimatedCost, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assumptions & Next Actions */}
            <div className="bg-white rounded-2xl border border-[#E7E3D9] p-6 shadow-subtle space-y-4">
              <h3 className="text-base font-bold text-[#17372B]">Practical Next Actions</h3>
              <div className="space-y-2.5">
                {plan.nextActionSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-[#222820]">
                    <span className="w-5 h-5 rounded-full bg-[#17372B] text-[#E9DFC9] flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
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
            <div className="bg-white rounded-2xl border border-[#E7E3D9] p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#17372B]">Aesthetic Color Palette</h3>
                <span className="text-[11px] text-[#697168]">Click to copy hex</span>
              </div>

              <div className="space-y-3">
                {plan.styling.colorPalette.map((swatch, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCopyHex(swatch.hex)}
                    className="p-3.5 rounded-2xl border border-[#E7E3D9] hover:border-[#214737]/40 cursor-pointer transition-all flex items-center justify-between group bg-[#F8F6F0]/40"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className="w-9 h-9 rounded-xl shadow-subtle border border-[#E7E3D9] flex-shrink-0"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <div>
                        <p className="text-xs font-bold text-[#17372B]">{swatch.name}</p>
                        <p className="text-[11px] text-[#697168]">{swatch.usage}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs text-[#17372B] bg-white border border-[#E7E3D9] px-2.5 py-1 rounded-lg">
                        {copiedHex === swatch.hex ? "Copied!" : swatch.hex}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks & Contingencies */}
            <div className="bg-white rounded-2xl border border-[#E7E3D9] p-6 shadow-subtle space-y-4">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-[#C87960]" />
                <h3 className="text-base font-bold text-[#17372B]">Risks & Contingency Plans</h3>
              </div>

              <div className="space-y-3">
                {plan.riskAndContingency.map((r, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#17372B]">{r.risk}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          r.impact === "high"
                            ? "bg-[#FAF1EE] text-[#C87960] border border-[#C87960]/30"
                            : r.impact === "medium"
                            ? "bg-[#E9DFC9]/50 text-[#17372B] border border-[#E9DFC9]"
                            : "bg-[#DCE5D8]/50 text-[#17372B]"
                        }`}
                      >
                        {r.impact} impact
                      </span>
                    </div>
                    <p className="text-[#697168]">
                      <strong className="text-[#17372B]">Prevention:</strong> {r.prevention}
                    </p>
                    <p className="text-[#697168]">
                      <strong className="text-[#214737]">Backup Plan:</strong> {r.backupPlan}
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
        <div className="bg-white rounded-2xl border border-[#E7E3D9] p-6 shadow-subtle space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E3D9]">
            <div>
              <h3 className="text-lg font-bold text-[#17372B]">Time-Blocked Event Itinerary</h3>
              <p className="text-xs text-[#697168]">Flow, pacing, and operational transitions</p>
            </div>
            <button
              onClick={() => setNewItinOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#17372B] text-[#E9DFC9] text-xs font-semibold hover:bg-[#214737] flex items-center space-x-1.5 shadow-subtle transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event Phase</span>
            </button>
          </div>

          <div className="relative border-l-2 border-[#DCE5D8] ml-4 pl-6 space-y-6">
            {plan.itinerary.map((item) => (
              <div key={item.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#214737] ring-4 ring-[#F8F6F0]" />

                <div className="p-4 rounded-2xl border border-[#E7E3D9] hover:border-[#214737]/40 transition-all bg-white shadow-subtle flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-[#17372B] bg-[#DCE5D8]/50 border border-[#DCE5D8] px-2.5 py-0.5 rounded-lg">
                        {item.time}
                      </span>
                      <span className="text-[11px] font-semibold text-[#697168] capitalize">
                        • {item.phase} ({item.durationMin} mins)
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#17372B] mt-1">{item.title}</h4>
                    <p className="text-xs text-[#697168] leading-relaxed">{item.description}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteItinerary(item.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-[#C87960] hover:bg-[#FAF1EE] self-end sm:self-center transition-colors"
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
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E3D9] space-y-4">
                <h3 className="font-bold text-base text-[#17372B]">Add Timeline Milestone</h3>

                <div>
                  <label className="block text-xs font-semibold text-[#697168] mb-1">Time Range</label>
                  <input
                    type="text"
                    value={newItinTime}
                    onChange={(e) => setNewItinTime(e.target.value)}
                    placeholder="e.g. 18:30 - 19:15"
                    className="w-full px-3 py-2 border border-[#E7E3D9] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#214737]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#697168] mb-1">Title</label>
                  <input
                    type="text"
                    value={newItinTitle}
                    onChange={(e) => setNewItinTitle(e.target.value)}
                    placeholder="e.g. Toast & Acoustic Performance"
                    className="w-full px-3 py-2 border border-[#E7E3D9] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#214737]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#697168] mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newItinDesc}
                    onChange={(e) => setNewItinDesc(e.target.value)}
                    placeholder="Details of what occurs during this phase"
                    className="w-full px-3 py-2 border border-[#E7E3D9] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#214737]"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setNewItinOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#697168] hover:bg-[#F8F6F0]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddItinerary}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#E9DFC9] bg-[#17372B] hover:bg-[#214737]"
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
              <div key={cat.category} className="bg-white p-4 rounded-2xl border border-[#E7E3D9] shadow-subtle hover:border-[#214737]/40 transition-colors">
                <span className="text-[10px] font-bold text-[#697168] uppercase tracking-wider block truncate">
                  {cat.category}
                </span>
                <span className="font-serif text-base font-bold text-[#17372B] block mt-1">
                  {formatCurrency(cat.total, currency)}
                </span>
                <span className="text-[11px] text-[#697168] block mt-0.5">
                  {Math.round(cat.percentageOfBudget)}% of budget
                </span>
              </div>
            ))}
          </div>

          {/* Interactive Itemized Table */}
          <div className="bg-white rounded-2xl border border-[#E7E3D9] p-6 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E7E3D9] gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#17372B]">Itemized Cost Allocations</h3>
                <p className="text-xs text-[#697168]">
                  Directly editable • Sum matches total allocated • Real-time recalculation
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {metrics.remaining !== 0 && (
                  <button
                    onClick={handleRebalanceContingency}
                    className="px-3.5 py-1.5 rounded-xl bg-[#DCE5D8] text-[#17372B] border border-[#DCE5D8] text-xs font-semibold hover:bg-[#cdd8c8] flex items-center space-x-1.5 transition-colors shadow-subtle"
                    title="Automatically adjust contingency reserves to match target budget"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#17372B]" />
                    <span>Rebalance Reserves</span>
                  </button>
                )}
                <button
                  onClick={() => setOptimizerOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FAF1EE] text-[#C87960] border border-[#C87960]/30 text-xs font-semibold hover:bg-[#f4dfd8] flex items-center space-x-1.5 shadow-subtle"
                >
                  <TrendingDown className="w-3.5 h-3.5 text-[#C87960]" />
                  <span>Cost Optimizer</span>
                </button>
                <button
                  onClick={() => setNewBudgetItemOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#17372B] text-[#E9DFC9] text-xs font-semibold hover:bg-[#214737] flex items-center space-x-1.5 shadow-subtle"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense Line</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E7E3D9] text-[#697168] font-bold uppercase text-[10px] bg-[#F8F6F0]/60">
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Expense Item & Notes</th>
                    <th className="py-3 px-3">Priority Level</th>
                    <th className="py-3 px-3 text-right">Estimate ({currency})</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3D9]">
                  {plan.budgetBreakdown.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8F6F0]/40 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-[#17372B] whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F8F6F0] border border-[#E7E3D9] text-[#17372B] font-medium text-[11px]">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[#17372B]">{item.name}</div>
                        <div className="text-[11px] text-[#697168] mt-0.5">{item.notes}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={item.priority}
                          onChange={(e) =>
                            handleUpdateItemPriority(item.id, e.target.value as BudgetItem["priority"])
                          }
                          className={`text-xs px-2.5 py-1 rounded-lg border font-semibold focus:outline-none ${
                            item.priority === "must-have"
                              ? "bg-[#FAF1EE] text-[#C87960] border-[#C87960]/30"
                              : item.priority === "nice-to-have"
                              ? "bg-[#E9DFC9]/40 text-[#17372B] border-[#E9DFC9]"
                              : "bg-[#DCE5D8] text-[#17372B] border-[#DCE5D8]"
                          }`}
                        >
                          <option value="must-have">Must-Have</option>
                          <option value="nice-to-have">Nice-to-Have</option>
                          <option value="splurge">Splurge</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-[#17372B]">
                        <div className="inline-flex items-center space-x-1">
                          <span className="text-[#697168] text-xs font-mono">{currency === "INR" ? "₹" : "$"}</span>
                          <input
                            type="number"
                            min="0"
                            step="500"
                            value={item.estimatedCost}
                            onChange={(e) => handleUpdateItemCost(item.id, Number(e.target.value))}
                            className="w-24 text-right px-2 py-1 border border-[#E7E3D9] rounded-lg text-xs font-bold text-[#17372B] focus:outline-none focus:ring-1 focus:ring-[#214737]"
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleDeleteBudgetItem(item.id)}
                          className="p-1 rounded text-slate-300 hover:text-[#C87960] hover:bg-[#FAF1EE] transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#17372B] font-bold text-sm bg-[#F8F6F0]/80">
                    <td colSpan={3} className="py-3.5 px-3 text-[#17372B]">
                      Total Allocated Calculation (Sum of all {plan.budgetBreakdown.items.length} line items)
                    </td>
                    <td className="py-3.5 px-3 text-right text-[#17372B] font-mono">
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
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E3D9] space-y-4">
                <h3 className="font-bold text-base text-[#17372B]">Add Custom Budget Item</h3>

                <div>
                  <label className="block text-xs font-semibold text-[#697168] mb-1">Item Name</label>
                  <input
                    type="text"
                    value={newExpenseName}
                    onChange={(e) => setNewExpenseName(e.target.value)}
                    placeholder="e.g. Polaroid Guestbook Station"
                    className="w-full px-3 py-2 border border-[#E7E3D9] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#214737]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#697168] mb-1">Category</label>
                    <select
                      value={newExpenseCategory}
                      onChange={(e) => setNewExpenseCategory(e.target.value as BudgetItem["category"])}
                      className="w-full px-3 py-2 border border-[#E7E3D9] rounded-xl text-xs font-semibold"
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
                    <label className="block text-xs font-semibold text-[#697168] mb-1">Priority</label>
                    <select
                      value={newExpensePriority}
                      onChange={(e) => setNewExpensePriority(e.target.value as BudgetItem["priority"])}
                      className="w-full px-3 py-2 border border-[#E7E3D9] rounded-xl text-xs font-semibold"
                    >
                      <option value="must-have">Must-Have</option>
                      <option value="nice-to-have">Nice-to-Have</option>
                      <option value="splurge">Splurge</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#697168] mb-1">
                    Estimated Cost ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={newExpenseCost}
                    onChange={(e) => setNewExpenseCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E7E3D9] rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#214737]"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setNewBudgetItemOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#697168] hover:bg-[#F8F6F0]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBudgetItem}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#E9DFC9] bg-[#17372B] hover:bg-[#214737]"
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
        <div className="bg-white rounded-2xl border border-[#E7E3D9] p-6 shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E3D9] gap-3">
            <div>
              <span className="text-xs font-bold text-[#214737] uppercase tracking-wider">
                Culinary Experience & Hospitality
              </span>
              <h3 className="font-serif text-xl font-bold text-[#17372B] mt-0.5">{plan.menu.cateringStyle}</h3>
            </div>

            <div className="p-3.5 bg-[#DCE5D8]/40 rounded-2xl border border-[#DCE5D8] text-xs">
              <span className="text-[#17372B] font-semibold block">Estimated Per-Head Food Spend:</span>
              <span className="font-serif font-bold text-[#17372B] text-lg">
                {formatCurrency(plan.menu.perHeadEstimate, currency)} / guest
              </span>
            </div>
          </div>

          {/* Courses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plan.menu.courses.map((course, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-[#E7E3D9] bg-white shadow-subtle space-y-3">
                <h4 className="font-serif font-bold text-base text-[#17372B] pb-2 border-b border-[#E7E3D9] flex items-center justify-between">
                  <span>{course.name}</span>
                  <span className="text-xs text-[#697168] font-normal font-sans">{course.items.length} Options</span>
                </h4>

                <div className="space-y-3">
                  {course.items.map((item, i) => (
                    <div key={i} className="text-xs space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#17372B]">{item.title}</span>
                        {item.isVegetarian && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCE5D8] text-[#17372B] font-semibold">
                            Veg
                          </span>
                        )}
                        {item.isVegan && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E9DFC9] text-[#17372B] font-semibold">
                            Vegan
                          </span>
                        )}
                        {item.isGlutenFree && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF1EE] text-[#C87960] font-semibold">
                            GF
                          </span>
                        )}
                      </div>
                      <p className="text-[#697168] leading-relaxed">{item.description}</p>
                      {item.dietaryNotes && (
                        <p className="text-[11px] text-[#214737] italic font-medium">{item.dietaryNotes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Beverages */}
          <div className="p-5 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9] space-y-2.5">
            <h4 className="text-xs font-bold text-[#17372B] uppercase tracking-wider">
              Curated Beverage & Refreshment Pairings
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {plan.menu.beverages.map((bev, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-full bg-white border border-[#E7E3D9] font-medium text-[#17372B] shadow-subtle"
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
        <div className="bg-white rounded-2xl border border-[#E7E3D9] p-6 shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E3D9] gap-3">
            <div>
              <h3 className="text-lg font-bold text-[#17372B]">Master Preparation Checklist</h3>
              <p className="text-xs text-[#697168]">
                {completedTasks} of {plan.checklist.length} milestones checked off
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full sm:w-64 bg-[#E7E3D9] h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#214737] transition-all duration-300"
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
              className="flex-1 px-3.5 py-2 border border-[#E7E3D9] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#214737]"
            />
            <select
              value={newTaskPhase}
              onChange={(e) => setNewTaskPhase(e.target.value as ChecklistItem["phase"])}
              className="text-xs bg-[#F8F6F0] border border-[#E7E3D9] rounded-xl px-2.5 py-2 font-medium text-[#17372B]"
            >
              <option value="4_weeks_prior">4 Weeks Prior</option>
              <option value="2_weeks_prior">2 Weeks Prior</option>
              <option value="week_of">Week of Event</option>
              <option value="day_of">Day of Event</option>
              <option value="post_event">Post Event</option>
            </select>
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-[#17372B] text-[#E9DFC9] rounded-xl text-xs font-semibold hover:bg-[#214737] transition-all shadow-subtle"
            >
              Add
            </button>
          </div>

          <div className="space-y-3">
            {plan.checklist.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  task.completed
                    ? "bg-[#F8F6F0]/60 border-[#E7E3D9] opacity-60 line-through text-[#697168]"
                    : "bg-white border-[#E7E3D9] hover:border-[#214737]/40 text-[#17372B] shadow-subtle"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border ${
                      task.completed
                        ? "bg-[#214737] border-[#214737] text-[#E9DFC9]"
                        : "border-[#E7E3D9] bg-white"
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold">{task.task}</span>
                    <span className="ml-2 text-[10px] uppercase font-bold text-[#697168] bg-[#F8F6F0] border border-[#E7E3D9] px-2 py-0.5 rounded-full">
                      {task.category}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono text-[#697168]">{task.dueDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: VENDOR DISCOVERY */}
      {activeTab === "vendors" && (
        <div className="bg-white rounded-2xl border border-[#E7E3D9] p-6 shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E3D9] gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-[#214737]" />
                <h3 className="text-lg font-bold text-[#17372B]">Vendor Discovery Leads & Shortlist</h3>
              </div>
              <p className="text-xs text-[#697168] mt-0.5">
                Clearly distinguishes AI discovery leads from your verified booked partners
              </p>
            </div>

            <button
              onClick={() => setNewVendorOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#17372B] text-[#E9DFC9] text-xs font-semibold hover:bg-[#214737] flex items-center space-x-1.5 shadow-subtle transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Real Vendor Contact</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.vendorLeads.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded-2xl border border-[#E7E3D9] bg-white shadow-subtle flex flex-col justify-between space-y-4 hover:border-[#214737]/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#17372B] bg-[#DCE5D8]/60 border border-[#DCE5D8] px-2.5 py-0.5 rounded-full">
                      {v.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        v.verified
                          ? "bg-[#DCE5D8] text-[#17372B] border border-[#DCE5D8]"
                          : "bg-[#F8F6F0] text-[#697168] border border-[#E7E3D9]"
                      }`}
                    >
                      {v.verified ? "Verified Partner" : "Discovery Lead"}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#17372B] mt-2.5">{v.suggestedType}</h4>
                  <p className="text-xs text-[#697168] mt-1 leading-relaxed">{v.recommendationReason}</p>

                  {v.contactInfo && (
                    <p className="text-xs font-semibold text-[#17372B] mt-2">
                      📞 {v.contactInfo}
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-[#E7E3D9]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#697168]">Typical Pricing:</span>
                    <span className="font-bold text-[#17372B]">{v.typicalPriceRange}</span>
                  </div>

                  {v.keyQuestionsToAsk && v.keyQuestionsToAsk.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-[#697168] uppercase tracking-wider block mb-1">
                        Vetting Questions to Ask:
                      </span>
                      <ul className="list-disc list-inside text-[11px] text-[#697168] space-y-0.5 pl-1">
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
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E3D9] space-y-4">
                <h3 className="font-bold text-base text-[#17372B]">Add Real Vendor Contract</h3>

                <div>
                  <label className="block text-xs font-semibold text-[#697168] mb-1">Business or Contact Name</label>
                  <input
                    type="text"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    placeholder="e.g. Blossom Botanicals Bengaluru"
                    className="w-full px-3 py-2 border border-[#E7E3D9] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#214737]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#697168] mb-1">Category</label>
                  <input
                    type="text"
                    value={newVendorCategory}
                    onChange={(e) => setNewVendorCategory(e.target.value)}
                    placeholder="e.g. Sustainable Decor & Lighting"
                    className="w-full px-3 py-2 border border-[#E7E3D9] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#214737]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#697168] mb-1">Contact Phone or Link</label>
                  <input
                    type="text"
                    value={newVendorContact}
                    onChange={(e) => setNewVendorContact(e.target.value)}
                    placeholder="e.g. +91 98450 12345 / @blossombotanicals"
                    className="w-full px-3 py-2 border border-[#E7E3D9] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#214737]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#697168] mb-1">Agreed Price or Estimate</label>
                  <input
                    type="text"
                    value={newVendorPrice}
                    onChange={(e) => setNewVendorPrice(e.target.value)}
                    placeholder="e.g. ₹6,500 advance deposit"
                    className="w-full px-3 py-2 border border-[#E7E3D9] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#214737]"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setNewVendorOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#697168] hover:bg-[#F8F6F0]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomVendor}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#E9DFC9] bg-[#17372B] hover:bg-[#214737]"
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
          className="px-5 py-3 rounded-full font-bold text-sm text-[#E9DFC9] bg-[#17372B] hover:bg-[#214737] border border-[#E9DFC9]/40 shadow-xl shadow-[#17372B]/20 flex items-center space-x-2.5 transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-[#E9DFC9] animate-spin" style={{ animationDuration: "6s" }} />
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
