"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  DollarSign,
  Sun,
  Home,
  Layers,
  Heart,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Compass,
} from "lucide-react";
import { EventInput, EventType, VenuePreference, PriorityItem } from "@/types/event";
import { SAMPLE_PRESETS } from "@/lib/sample-data";

interface EventWizardProps {
  onGenerate: (input: EventInput) => Promise<void>;
  isGenerating: boolean;
  onCancel?: () => void;
  initialPreset?: EventInput | null;
}

const EVENT_TYPES: { id: EventType; label: string; icon: string }[] = [
  { id: "birthday", label: "Birthday", icon: "🎂" },
  { id: "wedding", label: "Wedding", icon: "💍" },
  { id: "anniversary", label: "Anniversary", icon: "🥂" },
  { id: "engagement", label: "Engagement", icon: "✨" },
  { id: "baby_shower", label: "Baby Shower", icon: "🍼" },
  { id: "graduation", label: "Graduation", icon: "🎓" },
  { id: "corporate", label: "Corporate Event", icon: "💼" },
  { id: "festival", label: "Festival / Gala", icon: "🎉" },
  { id: "custom", label: "Custom Occasion", icon: "🌟" },
];

const DIETARY_OPTIONS = [
  "Vegetarian options",
  "Vegan options",
  "Gluten-free options",
  "Jain food (No onion/garlic)",
  "Halal options",
  "Nut-free",
  "Dairy-free",
];

const ACCESSIBILITY_OPTIONS = [
  "Wheelchair accessible / ramp access",
  "Ground floor / step-free venue",
  "Quiet retreat area / low noise zone",
  "Adequate shaded seating",
  "Braille / high contrast signage",
];

const PRIORITY_OPTIONS: { id: PriorityItem; label: string; desc: string }[] = [
  { id: "atmosphere_decor", label: "Atmosphere & Styling", desc: "Elevated visuals and lighting" },
  { id: "gourmet_food", label: "Culinary & Dining", desc: "Exceptional dining & craft beverages" },
  { id: "photography_video", label: "Photography & Keepsakes", desc: "Capturing candid high-res memories" },
  { id: "entertainment_music", label: "Music & Entertainment", desc: "Live music, DJ, or interactive fun" },
  { id: "budget_savings", label: "Strict Cost Discipline", desc: "Maximize value without going over" },
  { id: "guest_comfort", label: "Guest Comfort & Ease", desc: "Smooth logistics, seating, hospitality" },
  { id: "eco_friendly", label: "Zero-Waste & Eco Chic", desc: "No single-use plastic, sustainable items" },
];

export const EventWizard: React.FC<EventWizardProps> = ({
  onGenerate,
  isGenerating,
  onCancel,
  initialPreset,
}) => {
  const [step, setStep] = useState(1);

  // Form state
  const [eventType, setEventType] = useState<EventType>(initialPreset?.eventType || "birthday");
  const [customType, setCustomType] = useState(initialPreset?.customType || "");
  const [title, setTitle] = useState(initialPreset?.title || "Aarav's 30th Botanical Birthday");
  const [date, setDate] = useState(initialPreset?.date || "2026-11-14");
  const [city, setCity] = useState(initialPreset?.city || "Bengaluru");
  const [guestCount, setGuestCount] = useState<number>(initialPreset?.guestCount ?? 40);
  const [budget, setBudget] = useState<number>(initialPreset?.budget ?? 25000);
  const [currency, setCurrency] = useState(initialPreset?.currency || "INR");
  const [venuePreference, setVenuePreference] = useState<VenuePreference>(initialPreset?.venuePreference || "outdoor");
  const [themeVibe, setThemeVibe] = useState(
    initialPreset?.themeVibe ||
      "Eco-chic sustainable garden picnic with potted plants, warm fairy lights, and acoustic vibes"
  );
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>(
    initialPreset?.dietaryRequirements || ["Vegetarian options", "Gluten-free dessert"]
  );
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>(
    initialPreset?.accessibilityNeeds || ["Ground level access", "Wheelchair friendly"]
  );
  const [priorities, setPriorities] = useState<PriorityItem[]>(
    initialPreset?.priorities || ["atmosphere_decor", "eco_friendly", "budget_savings"]
  );
  const [additionalNotes, setAdditionalNotes] = useState(initialPreset?.additionalNotes || "Zero single-use plastic. Handcrafted seed-paper favors. Keep decor reusable.");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (s === 1) {
      if (!title || title.trim().length < 2) {
        newErrors.title = "Please provide an event title (at least 2 characters).";
      }
      if (!themeVibe || themeVibe.trim().length < 3) {
        newErrors.themeVibe = "Please describe the desired theme or vibe.";
      }
    } else if (s === 2) {
      if (!city || city.trim().length < 2) {
        newErrors.city = "City or location is required.";
      }
      if (!date) {
        newErrors.date = "Please select a target celebration date.";
      }
    } else if (s === 3) {
      if (guestCount === undefined || guestCount < 1) {
        newErrors.guestCount = "Guest count must be at least 1 person.";
      } else if (guestCount > 20000) {
        newErrors.guestCount = "Guest count exceeds maximum limit for this planner.";
      }

      if (budget === undefined || budget <= 0) {
        newErrors.budget = "Please enter a valid positive budget amount.";
      } else if (currency === "INR" && budget < 5000) {
        newErrors.budget = "Budget is unusually tight for hosting an organized event. Minimum recommendation is ₹5,000.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(5, prev + 1));
    }
  };

  const handlePrev = () => {
    setErrors({});
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleLoadSample = (index: number) => {
    const preset = SAMPLE_PRESETS[index];
    if (!preset) return;
    const inp = preset.input;
    setEventType(inp.eventType);
    setCustomType(inp.customType || "");
    setTitle(inp.title);
    setDate(inp.date);
    setCity(inp.city);
    setGuestCount(inp.guestCount);
    setBudget(inp.budget);
    setCurrency(inp.currency);
    setVenuePreference(inp.venuePreference);
    setThemeVibe(inp.themeVibe);
    setDietaryRequirements(inp.dietaryRequirements);
    setAccessibilityNeeds(inp.accessibilityNeeds);
    setPriorities(inp.priorities);
    setAdditionalNotes(inp.additionalNotes || "");
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setStep(1);
      return;
    }

    const payload: EventInput = {
      eventType,
      customType: eventType === "custom" ? customType : undefined,
      title: title.trim(),
      date,
      city: city.trim(),
      guestCount: Number(guestCount),
      budget: Number(budget),
      currency,
      venuePreference,
      themeVibe: themeVibe.trim(),
      dietaryRequirements,
      accessibilityNeeds,
      priorities,
      additionalNotes: additionalNotes.trim(),
    };

    await onGenerate(payload);
  };

  const toggleDietary = (item: string) => {
    setDietaryRequirements((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleAccessibility = (item: string) => {
    setAccessibilityNeeds((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const togglePriority = (p: PriorityItem) => {
    setPriorities((prev) =>
      prev.includes(p) ? prev.filter((i) => i !== p) : [...prev, p]
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      {/* Top Wizard Navigation & Presets Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">
              Step {step} of 5
            </span>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mt-1">
              {step === 1 && "Occasion & Creative Concept"}
              {step === 2 && "Date, City & Venue Setting"}
              {step === 3 && "Scale, Budget & Currency"}
              {step === 4 && "Gastronomy & Guest Hospitality"}
              {step === 5 && "Review & Launch AI Plan"}
            </h2>
          </div>

          {/* Quick preset filler */}
          <div className="relative">
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (val !== "") handleLoadSample(Number(val));
              }}
              defaultValue=""
              className="text-xs bg-white border border-[#EFECE1] rounded-lg px-2.5 py-1.5 font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="" disabled>
                ⚡ Prefill Scenario...
              </option>
              {SAMPLE_PRESETS.map((p, i) => (
                <option key={i} value={i}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#EFECE1] h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-rose-500 transition-all duration-300 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Card Body */}
      <div className="bg-white rounded-2xl border border-[#EFECE1] p-6 sm:p-8 shadow-soft">
        {/* STEP 1: Occasion & Concept */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Celebration Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {EVENT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setEventType(t.id)}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                      eventType === t.id
                        ? "border-violet-600 bg-violet-50/70 text-violet-950 font-semibold shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                    }`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-xs sm:text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {eventType === "custom" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Specify Custom Occasion
                </label>
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="e.g. Book Launch Gala, Golden Retriever 1st Birthday"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Event Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Aarav's 30th Botanical Birthday"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  errors.title ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                }`}
              />
              {errors.title && (
                <p className="text-xs text-rose-600 mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Theme, Mood & Styling Vision
              </label>
              <textarea
                rows={3}
                value={themeVibe}
                onChange={(e) => setThemeVibe(e.target.value)}
                placeholder="e.g. Warm bohemian garden picnic with potted herbs, soft fairy lighting, and zero single-use plastic"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  errors.themeVibe ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                }`}
              />
              {errors.themeVibe && (
                <p className="text-xs text-rose-600 mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.themeVibe}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Date, City & Setting */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-violet-600" />
                  <span>Event Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    errors.date ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                  }`}
                />
                {errors.date && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.date}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>City / Geographic Location</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru, Mumbai, Goa, London"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    errors.city ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                  }`}
                />
                {errors.city && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.city}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Venue Preference & Atmosphere
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setVenuePreference("outdoor")}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    venuePreference === "outdoor"
                      ? "border-emerald-500 bg-emerald-50/60 text-emerald-950 font-semibold ring-1 ring-emerald-500 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                  }`}
                >
                  <Sun className="w-6 h-6 mx-auto mb-1.5 text-amber-500" />
                  <div className="text-xs sm:text-sm font-semibold">Outdoor</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Garden, lawn, beach</div>
                </button>

                <button
                  type="button"
                  onClick={() => setVenuePreference("indoor")}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    venuePreference === "indoor"
                      ? "border-violet-600 bg-violet-50/60 text-violet-950 font-semibold ring-1 ring-violet-500 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                  }`}
                >
                  <Home className="w-6 h-6 mx-auto mb-1.5 text-violet-600" />
                  <div className="text-xs sm:text-sm font-semibold">Indoor</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Hall, glasshouse, home</div>
                </button>

                <button
                  type="button"
                  onClick={() => setVenuePreference("hybrid")}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    venuePreference === "hybrid"
                      ? "border-indigo-500 bg-indigo-50/60 text-indigo-950 font-semibold ring-1 ring-indigo-500 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                  }`}
                >
                  <Layers className="w-6 h-6 mx-auto mb-1.5 text-indigo-500" />
                  <div className="text-xs sm:text-sm font-semibold">Hybrid</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Covered patio & lawn</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Scale & Budget */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Total Guest Count</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={guestCount || ""}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    errors.guestCount ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                  }`}
                />
                {errors.guestCount && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.guestCount}</span>
                  </p>
                )}
                <div className="flex gap-1.5 mt-2">
                  {[20, 40, 75, 120, 250].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuestCount(num)}
                      className={`text-[11px] px-2 py-0.5 rounded border ${
                        guestCount === num
                          ? "bg-violet-100 text-violet-800 border-violet-200 font-semibold"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {num} guests
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    {currency === "INR" ? (
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>Total Financial Budget</span>
                  </span>

                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-0.5 font-semibold text-slate-700"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={budget || ""}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    errors.budget ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
                  }`}
                />
                {errors.budget && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.budget}</span>
                  </p>
                )}
                <div className="flex gap-1.5 mt-2">
                  {[25000, 50000, 100000, 250000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBudget(amt)}
                      className={`text-[11px] px-2 py-0.5 rounded border ${
                        budget === amt
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {currency === "INR" ? `₹${(amt / 1000).toFixed(0)}k` : `$${amt}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-time per guest calculation helper */}
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] flex items-center justify-between text-xs">
              <span className="text-slate-600">Calculated Average Spend per Guest:</span>
              <span className="font-bold text-slate-900 text-sm">
                {currency === "INR" ? "₹" : "$"}
                {guestCount > 0 ? Math.round(budget / guestCount).toLocaleString() : 0} / person
              </span>
            </div>
          </div>
        )}

        {/* STEP 4: Gastronomy & Hospitality */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Dietary Requirements & Preferences
              </label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((item) => {
                  const selected = dietaryRequirements.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleDietary(item)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        selected
                          ? "bg-emerald-600 text-white border-emerald-600 font-semibold shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Accessibility & Inclusion Needs
              </label>
              <div className="flex flex-wrap gap-2">
                {ACCESSIBILITY_OPTIONS.map((item) => {
                  const selected = accessibilityNeeds.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAccessibility(item)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        selected
                          ? "bg-violet-600 text-white border-violet-600 font-semibold shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Planner Priorities (Select your top 3)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRIORITY_OPTIONS.map((opt) => {
                  const selected = priorities.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => togglePriority(opt.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selected
                          ? "border-rose-500 bg-rose-50/50 text-slate-900 ring-1 ring-rose-400"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{opt.label}</span>
                        {selected && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Special Requests or Notes (Optional)
              </label>
              <input
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Return favors, acoustic playlist preferences, candle restrictions"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        )}

        {/* STEP 5: Review & Generate */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EFECE1] space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 bg-violet-100/70 px-2.5 py-0.5 rounded-full">
                    {eventType.toUpperCase()}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{title}</h3>
                  <p className="text-xs text-slate-600 italic mt-0.5">&ldquo;{themeVibe}&rdquo;</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-violet-600 hover:underline"
                >
                  Edit Details
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#EFECE1] text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">City</span>
                  <span className="font-semibold text-slate-800">{city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date</span>
                  <span className="font-semibold text-slate-800">{date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Guests</span>
                  <span className="font-semibold text-slate-800">{guestCount} people</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Budget</span>
                  <span className="font-semibold text-emerald-700">
                    {currency === "INR" ? "₹" : "$"}
                    {budget.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EFECE1] flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 capitalize font-medium">
                  {venuePreference} Setting
                </span>
                {dietaryRequirements.map((d, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                    {d}
                  </span>
                ))}
                {accessibilityNeeds.map((a, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-violet-100 text-violet-800 font-medium">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* GenAI Generation Assurance */}
            <div className="p-4 rounded-xl bg-violet-50/70 border border-violet-100 flex items-start space-x-3 text-xs text-violet-950">
              <Sparkles className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Google Gemini AI Engine:</span> Submitting will synthesize a
                personalized concept rationale, time-blocked itinerary, mathematically verified itemized budget,
                curated menu with dietary alternatives, checklist, and vendor discovery leads.
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            ) : null}
          </div>

          <div>
            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all flex items-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isGenerating}
                className="px-7 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-rose-600 hover:opacity-95 shadow-lg shadow-violet-500/25 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Synthesizing Plan with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate My Event Plan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
