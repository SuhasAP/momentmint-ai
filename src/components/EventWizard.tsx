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
  AlertCircle,
  CheckCircle2,
  Check,
  Compass,
} from "lucide-react";
import { EventInput, EventType, VenuePreference, PriorityItem } from "@/types/event";
import { SAMPLE_PRESETS } from "@/lib/sample-data";

interface EventWizardProps {
  onGenerate: (input: EventInput) => Promise<void>;
  isGenerating: boolean;
  onCancel?: () => void;
  initialPreset?: EventInput | null;
  generationError?: string | null;
  onClearError?: () => void;
  onGenerateDemo?: (input: EventInput) => void;
  onOpenSettings?: () => void;
}

const EVENT_TYPES: { id: EventType; label: string; icon: string; subtitle: string }[] = [
  { id: "birthday", label: "Birthday", icon: "🎂", subtitle: "Milestone & intimate gatherings" },
  { id: "wedding", label: "Wedding", icon: "💍", subtitle: "Multi-ceremony & grand celebrations" },
  { id: "anniversary", label: "Anniversary", icon: "🥂", subtitle: "Romantic dinner & jubilee galas" },
  { id: "engagement", label: "Engagement", icon: "✨", subtitle: "Ring ceremony & sunset soirées" },
  { id: "baby_shower", label: "Baby Shower", icon: "🍼", subtitle: "Warm maternal blessings & tea" },
  { id: "graduation", label: "Graduation", icon: "🎓", subtitle: "Academic honor & family banquets" },
  { id: "corporate", label: "Corporate Event", icon: "💼", subtitle: "Mixers, summits & product launches" },
  { id: "festival", label: "Festival / Gala", icon: "🎉", subtitle: "Cultural, seasonal & charity galas" },
  { id: "custom", label: "Bespoke Occasion", icon: "🌟", subtitle: "Unique celebrations tailored to you" },
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
  { id: "atmosphere_decor", label: "Atmosphere & Spatial Styling", desc: "Elevated florals, textiles, and warm ambient lighting" },
  { id: "gourmet_food", label: "Culinary & Dining Experience", desc: "Curated tasting spreads, passed canapés, craft beverages" },
  { id: "photography_video", label: "Photography & Keepsakes", desc: "Capturing candid natural-light memories & video reels" },
  { id: "entertainment_music", label: "Music & Acoustic Ambiance", desc: "Live instrumental, curated playlists, or DJ performance" },
  { id: "budget_savings", label: "Strict Fiscal Discipline", desc: "Maximize experiential value without exceeding limits" },
  { id: "guest_comfort", label: "Hospitality & Guest Flow", desc: "Effortless seating, shaded lounges, smooth logistics" },
  { id: "eco_friendly", label: "Zero-Waste & Eco-Chic", desc: "No single-use plastics, living plants, plantable stationery" },
];

export const EventWizard: React.FC<EventWizardProps> = ({
  onGenerate,
  isGenerating,
  onCancel,
  initialPreset,
  generationError,
  onClearError,
  onGenerateDemo,
  onOpenSettings,
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
  const [additionalNotes, setAdditionalNotes] = useState(
    initialPreset?.additionalNotes || "Zero single-use plastic. Handcrafted seed-paper favors. Keep decor reusable."
  );

  // Inline Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (s === 1) {
      if (!title || title.trim().length < 2) {
        newErrors.title = "Please provide an event title (at least 2 characters).";
      }
      if (!themeVibe || themeVibe.trim().length < 3) {
        newErrors.themeVibe = "Please describe the desired aesthetic theme or vibe.";
      }
    } else if (s === 2) {
      if (!city || city.trim().length < 2) {
        newErrors.city = "City or geographic location is required.";
      }
      if (!date) {
        newErrors.date = "Please select a target celebration date.";
      }
    } else if (s === 3) {
      if (guestCount === undefined || guestCount < 1) {
        newErrors.guestCount = "Guest count must be at least 1 person.";
      } else if (guestCount > 25000) {
        newErrors.guestCount = "Guest count exceeds planner limits.";
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
    if (onClearError) onClearError();
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
    if (onClearError) onClearError();
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
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      {/* Editorial Consultation Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#17372B] bg-[#DCE5D8] px-3 py-1 rounded-full border border-[#C4D4BE]">
                CONSULTATION STAGE 0{step} / 05
              </span>
              <span className="text-xs text-[#697168]">• Tailored Event Blueprint</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#17372B] mt-2">
              {step === 1 && "Occasion & Creative Aesthetic"}
              {step === 2 && "Calendar Date, City & Setting"}
              {step === 3 && "Guest Scale & Financial Envelope"}
              {step === 4 && "Gastronomy & Guest Hospitality"}
              {step === 5 && "Review & Synthesize Master Plan"}
            </h2>
          </div>

          {/* Quick preset selector */}
          <div className="relative">
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (val !== "") handleLoadSample(Number(val));
              }}
              defaultValue=""
              className="text-xs bg-white border border-[#E7E3D9] rounded-xl px-3 py-2 font-semibold text-[#17372B] shadow-subtle focus:outline-none focus:ring-1 focus:ring-[#214737]"
            >
              <option value="" disabled>
                ⚡ Explore Preset Brief...
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
        <div className="w-full bg-[#E7E3D9] h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#214737] via-[#C87960] to-[#E9DFC9] transition-all duration-300 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Studio Card */}
      <div className="studio-card p-6 sm:p-9 shadow-soft">
        {/* STEP 1: Occasion & Concept */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-[#17372B] uppercase tracking-wider mb-2">
                Celebration Classification
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {EVENT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setEventType(t.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      eventType === t.id
                        ? "border-[#214737] bg-[#F0F5F2] ring-1 ring-[#214737] shadow-sm"
                        : "border-[#E7E3D9] hover:border-[#D8C7A5] text-[#222820] bg-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{t.icon}</span>
                      <span className="text-sm font-bold text-[#17372B] font-serif">{t.label}</span>
                    </div>
                    <p className="text-[11px] text-[#697168] mt-1 line-clamp-1">{t.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>

            {eventType === "custom" && (
              <div>
                <label className="block text-[11px] font-bold text-[#17372B] uppercase tracking-wider mb-1.5">
                  Specify Bespoke Celebration
                </label>
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="e.g. Literary Salon & Book Launch Gala"
                  className="w-full px-4 py-3 bg-[#FAF7F1] border border-[#E7E3D9] rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#214737]"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#17372B] uppercase tracking-wider mb-1.5">
                Celebration Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Aarav's 30th Botanical Birthday"
                className={`w-full px-4 py-3 border rounded-xl text-sm font-serif font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#214737] ${
                  errors.title ? "border-[#C87960] bg-[#FAF1EE]" : "border-[#E7E3D9] bg-white"
                }`}
              />
              {errors.title && (
                <p className="text-xs text-[#C87960] mt-1.5 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#17372B] uppercase tracking-wider mb-1.5">
                Aesthetic Theme & Moodboard Vision
              </label>
              <textarea
                rows={3}
                value={themeVibe}
                onChange={(e) => setThemeVibe(e.target.value)}
                placeholder="e.g. Warm bohemian garden picnic with potted herbs, soft fairy lighting, and zero single-use plastic"
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#214737] ${
                  errors.themeVibe ? "border-[#C87960] bg-[#FAF1EE]" : "border-[#E7E3D9] bg-white"
                }`}
              />
              {errors.themeVibe && (
                <p className="text-xs text-[#C87960] mt-1.5 flex items-center space-x-1">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-[#17372B] uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[#214737]" />
                  <span>Celebration Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#214737] ${
                    errors.date ? "border-[#C87960] bg-[#FAF1EE]" : "border-[#E7E3D9] bg-white"
                  }`}
                />
                {errors.date && (
                  <p className="text-xs text-[#C87960] mt-1.5 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.date}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#17372B] uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C87960]" />
                  <span>City / Geographic Location</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru, Mumbai, Goa, London"
                  className={`w-full px-4 py-3 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#214737] ${
                    errors.city ? "border-[#C87960] bg-[#FAF1EE]" : "border-[#E7E3D9] bg-white"
                  }`}
                />
                {errors.city && (
                  <p className="text-xs text-[#C87960] mt-1.5 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.city}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#17372B] uppercase tracking-wider mb-2">
                Venue Spatial Setting & Atmosphere
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setVenuePreference("outdoor")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    venuePreference === "outdoor"
                      ? "border-[#214737] bg-[#F0F5F2] ring-1 ring-[#214737] shadow-sm"
                      : "border-[#E7E3D9] hover:border-[#D8C7A5] text-[#222820] bg-white"
                  }`}
                >
                  <Sun className="w-6 h-6 mb-2 text-[#C87960]" />
                  <div className="text-sm font-bold text-[#17372B] font-serif">Outdoor Garden</div>
                  <div className="text-[11px] text-[#697168] mt-0.5">Lawn, open pergola, beachside</div>
                </button>

                <button
                  type="button"
                  onClick={() => setVenuePreference("indoor")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    venuePreference === "indoor"
                      ? "border-[#214737] bg-[#F0F5F2] ring-1 ring-[#214737] shadow-sm"
                      : "border-[#E7E3D9] hover:border-[#D8C7A5] text-[#222820] bg-white"
                  }`}
                >
                  <Home className="w-6 h-6 mb-2 text-[#214737]" />
                  <div className="text-sm font-bold text-[#17372B] font-serif">Indoor Glasshouse</div>
                  <div className="text-[11px] text-[#697168] mt-0.5">Sheltered banquet, private estate</div>
                </button>

                <button
                  type="button"
                  onClick={() => setVenuePreference("hybrid")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    venuePreference === "hybrid"
                      ? "border-[#214737] bg-[#F0F5F2] ring-1 ring-[#214737] shadow-sm"
                      : "border-[#E7E3D9] hover:border-[#D8C7A5] text-[#222820] bg-white"
                  }`}
                >
                  <Layers className="w-6 h-6 mb-2 text-[#E9DFC9]" />
                  <div className="text-sm font-bold text-[#17372B] font-serif">Hybrid Veranda</div>
                  <div className="text-[11px] text-[#697168] mt-0.5">Covered courtyard & adjoining lawn</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Scale & Budget */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-[#17372B] uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-[#214737]" />
                  <span>Confirmed Guest Count</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="25000"
                  value={guestCount || ""}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-xl text-base font-bold text-[#17372B] focus:outline-none focus:ring-2 focus:ring-[#214737] ${
                    errors.guestCount ? "border-[#C87960] bg-[#FAF1EE]" : "border-[#E7E3D9] bg-white"
                  }`}
                />
                {errors.guestCount && (
                  <p className="text-xs text-[#C87960] mt-1.5 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.guestCount}</span>
                  </p>
                )}
                <div className="flex gap-1.5 mt-2.5">
                  {[20, 40, 75, 120, 250].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuestCount(num)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        guestCount === num
                          ? "bg-[#DCE5D8] text-[#17372B] border-[#C4D4BE] font-bold"
                          : "bg-white text-[#697168] border-[#E7E3D9] hover:bg-[#FAF7F1]"
                      }`}
                    >
                      {num} pax
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#17372B] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    {currency === "INR" ? (
                      <IndianRupee className="w-3.5 h-3.5 text-[#214737]" />
                    ) : (
                      <DollarSign className="w-3.5 h-3.5 text-[#214737]" />
                    )}
                    <span>Financial Budget Envelope</span>
                  </span>

                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="text-xs bg-[#FAF7F1] border border-[#E7E3D9] rounded-lg px-2 py-0.5 font-bold text-[#17372B]"
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
                  className={`w-full px-4 py-3 border rounded-xl text-base font-bold text-[#17372B] focus:outline-none focus:ring-2 focus:ring-[#214737] ${
                    errors.budget ? "border-[#C87960] bg-[#FAF1EE]" : "border-[#E7E3D9] bg-white"
                  }`}
                />
                {errors.budget && (
                  <p className="text-xs text-[#C87960] mt-1.5 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.budget}</span>
                  </p>
                )}
                <div className="flex gap-1.5 mt-2.5">
                  {[25000, 50000, 100000, 250000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBudget(amt)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        budget === amt
                          ? "bg-[#DCE5D8] text-[#17372B] border-[#C4D4BE] font-bold"
                          : "bg-white text-[#697168] border-[#E7E3D9] hover:bg-[#FAF7F1]"
                      }`}
                    >
                      {currency === "INR" ? `₹${(amt / 1000).toFixed(0)}k` : `$${amt}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Average spend preview */}
            <div className="p-4 rounded-xl bg-[#FAF7F1] border border-[#E7E3D9] flex items-center justify-between text-xs">
              <span className="text-[#697168] font-medium">Calculated Average Spend per Guest:</span>
              <span className="font-bold text-[#17372B] text-sm font-serif">
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
              <label className="block text-[11px] font-bold text-[#17372B] uppercase tracking-wider mb-2">
                Dietary Requirements & Kitchen Specifications
              </label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((item) => {
                  const selected = dietaryRequirements.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleDietary(item)}
                      className={`text-xs px-3.5 py-2 rounded-xl border transition-all ${
                        selected
                          ? "bg-[#214737] text-[#E9DFC9] border-[#214737] font-semibold shadow-xs"
                          : "bg-white text-[#697168] border-[#E7E3D9] hover:border-[#D8C7A5]"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#17372B] uppercase tracking-wider mb-2">
                Accessibility, Movement & Inclusion Needs
              </label>
              <div className="flex flex-wrap gap-2">
                {ACCESSIBILITY_OPTIONS.map((item) => {
                  const selected = accessibilityNeeds.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAccessibility(item)}
                      className={`text-xs px-3.5 py-2 rounded-xl border transition-all ${
                        selected
                          ? "bg-[#DCE5D8] text-[#17372B] border-[#C4D4BE] font-bold shadow-xs"
                          : "bg-white text-[#697168] border-[#E7E3D9] hover:border-[#D8C7A5]"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#17372B] uppercase tracking-wider mb-2">
                Top Priorities (Select your focal areas)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRIORITY_OPTIONS.map((opt) => {
                  const selected = priorities.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => togglePriority(opt.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selected
                          ? "border-[#C87960] bg-[#FAF1EE] text-[#17372B] shadow-xs"
                          : "border-[#E7E3D9] hover:border-[#D8C7A5] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-serif text-sm">{opt.label}</span>
                        {selected && <CheckCircle2 className="w-4 h-4 text-[#C87960]" />}
                      </div>
                      <p className="text-[11px] text-[#697168] mt-1 leading-relaxed">{opt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#17372B] uppercase tracking-wider mb-1.5">
                Special Directives & Host Notes (Optional)
              </label>
              <input
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Handcrafted seed-paper favors, acoustic playlists, low candle policy"
                className="w-full px-4 py-3 border border-[#E7E3D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#214737]"
              />
            </div>
          </div>
        )}

        {/* STEP 5: Review & Generate */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#FAF7F1] border border-[#E7E3D9] space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#214737] bg-[#DCE5D8] px-2.5 py-0.5 rounded-full">
                    {eventType.toUpperCase()} BRIEF
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-[#17372B] mt-1.5">{title}</h3>
                  <p className="text-xs text-[#697168] italic mt-0.5">&ldquo;{themeVibe}&rdquo;</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-[#C87960] hover:underline"
                >
                  Edit Brief
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E7E3D9] text-xs">
                <div>
                  <span className="text-[#697168] block text-[10px] uppercase font-bold tracking-wider">
                    Location
                  </span>
                  <span className="font-bold text-[#17372B] text-sm">{city}</span>
                </div>
                <div>
                  <span className="text-[#697168] block text-[10px] uppercase font-bold tracking-wider">
                    Date
                  </span>
                  <span className="font-bold text-[#17372B] text-sm">{date}</span>
                </div>
                <div>
                  <span className="text-[#697168] block text-[10px] uppercase font-bold tracking-wider">
                    Scale
                  </span>
                  <span className="font-bold text-[#17372B] text-sm">{guestCount} Guests</span>
                </div>
                <div>
                  <span className="text-[#697168] block text-[10px] uppercase font-bold tracking-wider">
                    Budget Limit
                  </span>
                  <span className="font-bold text-[#214737] text-sm font-serif">
                    {currency === "INR" ? "₹" : "$"}
                    {budget.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E7E3D9] flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E7E3D9] text-[#17372B] capitalize font-medium">
                  {venuePreference} Setting
                </span>
                {dietaryRequirements.map((d, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-[#DCE5D8] text-[#17372B] font-medium">
                    {d}
                  </span>
                ))}
                {accessibilityNeeds.map((a, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-[#F0ECE1] text-[#222820] font-medium">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Recoverable Error Banner */}
            {generationError && (
              <div className="p-4 rounded-xl bg-[#FAF1EE] border border-[#F4DFD8] text-xs text-[#B6644B] space-y-3 animate-fade-in">
                <div className="flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-[#C87960] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-[#17372B]">Google Gemini Service Notice</p>
                    <p className="mt-0.5 text-[#697168] leading-relaxed">{generationError}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F4DFD8]">
                  {onOpenSettings && (
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#E7E3D9] text-[#17372B] font-semibold hover:bg-[#FAF7F1] transition-colors"
                    >
                      Configure API Key in Settings
                    </button>
                  )}
                  {onGenerateDemo && (
                    <button
                      type="button"
                      onClick={() => {
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
                        onGenerateDemo(payload);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#214737] text-[#E9DFC9] font-semibold hover:bg-[#17372B] transition-colors"
                    >
                      Continue in Demo Sandbox Mode
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* AI Architecture Assurance */}
            <div className="p-4 rounded-xl bg-[#F0F5F2] border border-[#C4D4BE] flex items-start space-x-3 text-xs text-[#17372B]">
              <Sparkles className="w-5 h-5 text-[#214737] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Google Gemini AI Engine:</span> Submitting initiates server-side synthesis of an evocative concept rationale, timeline milestones, itemized budget allocations, curated tasting courses, and vendor leads.
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="mt-8 pt-5 border-t border-[#E7E3D9] flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={isGenerating}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#697168] hover:text-[#17372B] hover:bg-[#FAF7F1] flex items-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                disabled={isGenerating}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#697168] hover:bg-[#FAF7F1] transition-colors"
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
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-[#E9DFC9] bg-[#17372B] hover:bg-[#214737] transition-all flex items-center space-x-2 shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-[#E9DFC9]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isGenerating}
                className="px-8 py-3.5 rounded-xl text-sm font-bold text-[#E9DFC9] bg-[#17372B] hover:bg-[#214737] border border-[#E9DFC9]/40 shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#E9DFC9]/30 border-t-[#E9DFC9] rounded-full animate-spin" />
                    <span>Synthesizing Plan with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E9DFC9]" />
                    <span>Synthesize Event Plan</span>
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
