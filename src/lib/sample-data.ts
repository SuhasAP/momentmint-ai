import { EventInput, EventPlan } from "@/types/event";

export const SAMPLE_PRESETS: { name: string; tag: string; input: EventInput }[] = [
  {
    name: "Bengaluru Eco-Chic Birthday",
    tag: "Competition 4-Min Demo Standard",
    input: {
      eventType: "birthday",
      title: "Aarav's 30th Botanical Birthday",
      date: "2026-11-14",
      city: "Bengaluru",
      guestCount: 40,
      budget: 25000,
      currency: "INR",
      venuePreference: "outdoor",
      themeVibe: "Eco-chic sustainable garden picnic with potted plants, warm fairy lights, and acoustic vibes",
      dietaryRequirements: ["Vegetarian options", "Gluten-free dessert"],
      accessibilityNeeds: ["Ground level access", "Wheelchair friendly"],
      priorities: ["atmosphere_decor", "eco_friendly", "budget_savings"],
      additionalNotes: "Zero single-use plastic. Handcrafted seed-paper favors. Keep decor reusable.",
    },
  },
  {
    name: "Goa Sunset Engagement",
    tag: "Coastal Luxury",
    input: {
      eventType: "engagement",
      title: "Rohan & Rhea's Coastal Dusk Soirée",
      date: "2026-12-05",
      city: "Goa",
      guestCount: 75,
      budget: 350000,
      currency: "INR",
      venuePreference: "outdoor",
      themeVibe: "Tropical boho luxe with terracotta clay vessels, pampas grass, and sunset pastels",
      dietaryRequirements: ["Seafood & Coastal delicacies", "Jain options"],
      accessibilityNeeds: ["Step-free boardwalk to beach lawn"],
      priorities: ["photography_video", "atmosphere_decor", "gourmet_food"],
      additionalNotes: "Sunset golden hour photo session is primary highlight. Live acoustic saxophone.",
    },
  },
  {
    name: "NextGen AI Tech Meetup",
    tag: "Corporate Innovation",
    input: {
      eventType: "corporate",
      title: "Synthesize 2026: AI Founders Mixer",
      date: "2026-11-28",
      city: "Bengaluru",
      guestCount: 60,
      budget: 85000,
      currency: "INR",
      venuePreference: "indoor",
      themeVibe: "Sleek neo-modern tech salon with deep indigo ambient wash, craft coffee bar, and fast wifi",
      dietaryRequirements: ["Vegan snacks", "High-protein finger foods"],
      accessibilityNeeds: ["Braille signage", "Elevator access"],
      priorities: ["guest_comfort", "entertainment_music", "gourmet_food"],
      additionalNotes: "Need two wireless lavalier microphones and a 4K laser projector.",
    },
  },
];

export function generateFallbackPlan(input: EventInput): EventPlan {
  const budget = input.budget || 25000;
  const isOutdoor = input.venuePreference === "outdoor";
  const currency = input.currency || "INR";

  // Create mathematically exact itemized budget that matches allocated amount
  // Budget breakdown tailored to input budget size
  const venueCost = isOutdoor ? Math.round(budget * 0.20) : Math.round(budget * 0.28);
  const cateringCost = Math.round(budget * 0.38);
  const decorCost = Math.round(budget * 0.18);
  const photoCost = Math.round(budget * 0.10);
  const contingencyCost = Math.round(budget * 0.08);
  const favorsCost = Math.max(0, budget - (venueCost + cateringCost + decorCost + photoCost + contingencyCost));

  const items = [
    {
      id: "b-venue",
      category: "Venue" as const,
      name: isOutdoor ? "Community Park Lawn / Pergola Permit" : "Private Boutique Hall Booking",
      estimatedCost: venueCost,
      priority: "must-have" as const,
      notes: isOutdoor
        ? "Secures 4-hour slot including setup and basic sanitation amenities."
        : "Air-conditioned space with banquet chairs and standard tables included.",
    },
    {
      id: "b-cater",
      category: "Catering" as const,
      name: `Artisanal Live Food Spread (${input.guestCount} guests)`,
      estimatedCost: cateringCost,
      priority: "must-have" as const,
      notes: `Approx. ${currency === "INR" ? "₹" : ""}${Math.round(cateringCost / input.guestCount)} per guest. Includes savory small plates, beverages, and dessert.`,
    },
    {
      id: "b-decor",
      category: "Decor & Styling" as const,
      name: `${input.themeVibe.split(" ")[0] || "Curated"} Styling & Ambience Accents`,
      estimatedCost: decorCost,
      priority: "nice-to-have" as const,
      notes: "Potted native greenery, fabric drapes, warm LED fairy strings, and signage.",
    },
    {
      id: "b-photo",
      category: "Photography" as const,
      name: "Semi-Pro Candid Photographer (3 Hours)",
      estimatedCost: photoCost,
      priority: "nice-to-have" as const,
      notes: "Delivers 80+ color-graded digital candid moments and highlight video reel.",
    },
    {
      id: "b-favors",
      category: "Gifts & Favors" as const,
      name: "Personalized Keepsake Favors",
      estimatedCost: favorsCost,
      priority: "nice-to-have" as const,
      notes: "Seed paper gratitude notes and terracotta mini succulents for guests.",
    },
    {
      id: "b-contingency",
      category: "Contingency" as const,
      name: "Unplanned Reserves & Logistics Buffer",
      estimatedCost: contingencyCost,
      priority: "must-have" as const,
      notes: "Reserved for last-minute guest additions, ice bags, or quick weather mitigation.",
    },
  ];

  return {
    id: `plan-${Date.now()}`,
    title: input.title || `${input.city} ${input.eventType.toUpperCase()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    input,
    aiMetadata: {
      model: "Demo Intelligence Mode (Rule Engine & Template)",
      generatedAt: new Date().toISOString(),
      isMockFallback: true,
      notes: "Generated via Momentmint Demo Engine. Connect a Google AI Studio API key in Settings to run live Gemini models.",
    },
    concept: {
      name: `${input.themeVibe.slice(0, 30)} Sanctuary`,
      summary: `A thoughtfully orchestrated ${input.eventType} celebration in ${input.city} emphasizing intimate connection, sustainable visual aesthetics, and sensory warmth for ${input.guestCount} cherished guests.`,
      rationale: `Tailored precisely for ${input.guestCount} attendees with a strict ${currency} ${budget.toLocaleString()} fiscal envelope. Balances warm hospitality with photo-worthy decor without wasteful single-use excesses.`,
      aestheticKeywords: ["Botanical", "Warm Ivory", "Terracotta", "Intimate", "Zero-Waste"],
    },
    styling: {
      colorPalette: input.city.toLowerCase().includes("goa") || input.themeVibe.toLowerCase().includes("coastal") || input.themeVibe.toLowerCase().includes("tropical")
        ? [
            { name: "Ocean Teal", hex: "#2A9D8F", usage: "Draped fabrics and runner textiles" },
            { name: "Sunset Terracotta", hex: "#E76F51", usage: "Handmade clay vessels & centerpieces" },
            { name: "Golden Dune", hex: "#E9C46A", usage: "Warm lighting votives and ambient glow" },
            { name: "Deep Coast Navy", hex: "#264653", usage: "Signage frames and evening lanterns" },
            { name: "Warm Shell", hex: "#FDFBF7", usage: "Linen overlays and parchment stationery" },
          ]
        : input.eventType === "corporate" || input.themeVibe.toLowerCase().includes("tech")
        ? [
            { name: "Deep Obsidian", hex: "#0F172A", usage: "Stage backdrop and digital displays" },
            { name: "Electric Indigo", hex: "#6366F1", usage: "Ambient LED uplighting wash" },
            { name: "Neon Cyan", hex: "#38BDF8", usage: "Badge accents and digital kiosks" },
            { name: "Clean Slate", hex: "#F1F5F9", usage: "Stationery and presentation materials" },
            { name: "Midnight Steel", hex: "#334155", usage: "Furniture frames and booth piping" },
          ]
        : [
            { name: "Warm Ivory", hex: "#FAF8F0", usage: "Linen table overlays and entrance drapery" },
            { name: "Forest Sage", hex: "#4A6B53", usage: "Living potted botanicals and eucalyptus runner" },
            { name: "Terracotta Coral", hex: "#E07A5F", usage: "Handmade ceramic pottery and menu stationery" },
            { name: "Midnight Indigo", hex: "#1A2536", usage: "Typography, signage frames, and accent lanterns" },
            { name: "Soft Amber", hex: "#F4A261", usage: "Warm 2700K fairy lights and candle glow" },
          ],
      decorIdeas: [
        {
          id: "dec-1",
          area: "Welcome Entrance",
          title: "Living Foliage & Chalkboard Welcome Easel",
          description: "Reclaimed wooden easel with calligraphed welcome greetings framed by rental potted palms and brass lanterns.",
          estimatedCost: Math.round(decorCost * 0.35),
        },
        {
          id: "dec-2",
          area: "Communal Gathering Area",
          title: "Low-Seating Boho Lounge with Floor Cushions",
          description: "Jute rugs, neutral bolster cushions, and low wooden pallet tables with hand-painted ceramic bud vases.",
          estimatedCost: Math.round(decorCost * 0.45),
        },
        {
          id: "dec-3",
          area: "Photo Backing & Cake Table",
          title: "Minimalist Macramé & Fairy Light Arch",
          description: "Geometric wooden hex-arch adorned with fresh ivy vines and soft cascading fairy curtain lights.",
          estimatedCost: Math.round(decorCost * 0.20),
        },
      ],
    },
    itinerary: [
      {
        id: "itin-1",
        time: "16:30 - 17:15",
        title: "Vendor Load-in & Styling Prep",
        description: "Venue access, sound check, caterer station arrangement, and ambient lighting check.",
        durationMin: 45,
        phase: "afternoon",
      },
      {
        id: "itin-2",
        time: "17:30 - 18:15",
        title: "Arrivals & Welcome Aperitifs",
        description: "Guests arrive, receive chilled botanical welcome drinks, polaroid guestbook signing.",
        durationMin: 45,
        phase: "evening",
      },
      {
        id: "itin-3",
        time: "18:15 - 19:15",
        title: "Main Celebration & Interactive Activity",
        description: "Acoustic playlist begins, celebratory toasts, heartfelt speeches, and centerpiece cake cutting.",
        durationMin: 60,
        phase: "evening",
      },
      {
        id: "itin-4",
        time: "19:15 - 20:30",
        title: "Artisanal Dinner Feast & Conversations",
        description: "Buffet stations open. Seamless music progression to upbeat indie tracks while guests dine comfortably.",
        durationMin: 75,
        phase: "night",
      },
      {
        id: "itin-5",
        time: "20:30 - 21:00",
        title: "Gratitude Favors & Fond Farewell",
        description: "Handing out botanical potted favors, final group photographs, and orderly departure.",
        durationMin: 30,
        phase: "night",
      },
    ],
    budgetBreakdown: {
      totalBudget: budget,
      currency,
      contingencyPercentage: 8,
      items,
    },
    menu: {
      cateringStyle: "Fresh Artisanal Grazing Spread & Live Skewers",
      perHeadEstimate: Math.round(cateringCost / input.guestCount),
      courses: [
        {
          name: "Welcome Drinks & Refreshments",
          items: [
            {
              title: "Hibiscus Mint Sparkler",
              description: "Cold-pressed hibiscus flower tea infused with fresh garden mint and sparkling soda.",
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: true,
            },
            {
              title: "Kokum Masala Cooler",
              description: "Traditional coastal kokum cordial spiced with roasted cumin and pink rock salt.",
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: true,
            },
          ],
        },
        {
          name: "Passed Small Bites",
          items: [
            {
              title: "Herb-Crusted Paneer & Veggie Skewers",
              description: "Locally made cottage cheese marinated in crushed coriander pesto and grilled over coconut charcoal.",
              isVegetarian: true,
              isGlutenFree: true,
            },
            {
              title: "Crispy Beetroot & Quinoa Croquettes",
              description: "Organic golden beetroot patties served with tangy raw mango dip.",
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: true,
            },
          ],
        },
        {
          name: "Hearty Main Fare",
          items: [
            {
              title: "Saffron Spiced Vegetable Dum Biryani",
              description: "Slow-cooked fragrant aged basmati rice layered with seasonal farm vegetables and mint raita.",
              isVegetarian: true,
              isGlutenFree: true,
            },
            {
              title: "Dal Makhani & Artisanal Kulchas",
              description: "Rich 18-hour simmered black lentils finished with cultured butter and baked sourdough breads.",
              isVegetarian: true,
            },
          ],
        },
        {
          name: "Sweet Finale",
          items: [
            {
              title: "Cardamom Pistachio Tres Leches or Coconut Panna Cotta",
              description: "Subtle cardamom-infused sponge soaked in rich reduced milk; dairy-free coconut option available.",
              isVegetarian: true,
              dietaryNotes: "Gluten-free variant provided for tagged guests",
            },
          ],
        },
      ],
      beverages: ["Fresh coconut water stations", "Darjeeling iced peach tea", "Infused citrus water dispensers"],
    },
    checklist: [
      {
        id: "chk-1",
        phase: "4_weeks_prior",
        task: `Finalize venue agreement for ${input.city} location with confirmed hours`,
        dueDate: "4 weeks prior",
        completed: true,
        category: "Venue",
      },
      {
        id: "chk-2",
        phase: "4_weeks_prior",
        task: `Send digital save-the-dates to ${input.guestCount} guests requesting dietary confirmations`,
        dueDate: "3 weeks prior",
        completed: true,
        category: "Invitations",
      },
      {
        id: "chk-3",
        phase: "2_weeks_prior",
        task: "Lock menu headcount with caterer and clarify vegan/gluten-free separate portions",
        dueDate: "14 days prior",
        completed: false,
        category: "Catering",
      },
      {
        id: "chk-4",
        phase: "2_weeks_prior",
        task: "Rent audio speaker, Bluetooth microphone, and fairy light strands",
        dueDate: "10 days prior",
        completed: false,
        category: "Logistics",
      },
      {
        id: "chk-5",
        phase: "week_of",
        task: "Curate a 4-hour background jazz & acoustic Spotify playlist",
        dueDate: "4 days prior",
        completed: false,
        category: "Entertainment",
      },
      {
        id: "chk-6",
        phase: "day_of",
        task: "Supervise welcome arch setup, test lighting & confirm cold drinks ready",
        dueDate: "Day of event (15:00)",
        completed: false,
        category: "On-site Ops",
      },
    ],
    vendorLeads: [
      {
        id: "ven-1",
        category: "Eco Decor & Rentals",
        suggestedType: "Local Botanical & Bamboo Styling Studio",
        recommendationReason: `Perfect match for ${input.city}'s sustainable suppliers, providing living potted plant rentals instead of cut flowers.`,
        typicalPriceRange: `${currency} 4,000 - ${currency} 7,500`,
        keyQuestionsToAsk: [
          "Do you handle setup and same-night pack-down?",
          "Are fairy lights and extension leads included in the rental?",
        ],
        verified: false,
      },
      {
        id: "ven-2",
        category: "Artisanal Catering",
        suggestedType: "Farm-to-Table Boutique Caterer",
        recommendationReason: `Experienced in dietary flexibility (${input.dietaryRequirements.join(", ") || "Vegetarian spreads"}).`,
        typicalPriceRange: `${currency} 450 - ${currency} 700 per person`,
        keyQuestionsToAsk: [
          "Do you supply compostable palm-leaf tableware?",
          "How many live servers are included for our guest count?",
        ],
        verified: false,
      },
      {
        id: "ven-3",
        category: "Candid Photography",
        suggestedType: "Freelance Natural-Light Photographer",
        recommendationReason: "Specializes in warm outdoor golden-hour candids without stiff poses.",
        typicalPriceRange: `${currency} 2,500 - ${currency} 4,500 for 3 hours`,
        keyQuestionsToAsk: [
          "What is the turnaround time for digital edited previews?",
          "Do you shoot in RAW and color-grade all deliverables?",
        ],
        verified: false,
      },
    ],
    riskAndContingency: [
      {
        risk: isOutdoor ? "Sudden unseasonal rain or strong wind gusts" : "AC breakdown or unexpected room heat",
        impact: isOutdoor ? "high" : "medium",
        prevention: isOutdoor
          ? "Reserve a pop-up canopy or confirm adjoining covered veranda with venue."
          : "Verify air conditioning backup and ventilation with venue manager 24h prior.",
        backupPlan: isOutdoor
          ? "Shift floor seating under covered veranda within 15 minutes; deploy waterproof tarps."
          : "Position oscillating mist fans and relocate main dining near shaded windows.",
      },
      {
        risk: "Guest count surge (+10 unexpected attendees)",
        impact: "medium",
        prevention: "Ask for final RSVP cutoff 5 days ahead with digital reminder.",
        backupPlan: "Buffer caterer food portioning with a +15% reserve using quick live station items.",
      },
      {
        risk: "Speaker battery drains or Bluetooth audio interference",
        impact: "low",
        prevention: "Fully charge main and secondary speaker; bring a 3.5mm auxiliary cable.",
        backupPlan: "Switch to backup portable power bank and hardwired phone audio connection.",
      },
    ],
    assumptions: [
      `Venue booking permits ${isOutdoor ? "outdoor lawn usage until 21:30" : "indoor music without decibel fines"}.`,
      "All guests will RSVP at least 5 days prior to allow accurate catering order.",
      "Weather forecast stays within normal historical temperature range for the date.",
    ],
    nextActionSteps: [
      "Contact and book venue space or confirm park permit slot.",
      "Send digital invitation link with dietary RSVP checkboxes.",
      "Approve caterer menu proposal and pay initial booking deposit.",
    ],
  };
}
