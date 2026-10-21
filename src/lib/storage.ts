import { EventPlan } from "@/types/event";

const STORAGE_KEY = "momentmint_saved_events";
const CURRENT_ACTIVE_KEY = "momentmint_active_event_id";
const API_KEY_STORAGE = "momentmint_custom_gemini_key";

export function getStoredApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(API_KEY_STORAGE) || "";
  } catch {
    return "";
  }
}

export function setStoredApiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!key || key.trim() === "") {
      localStorage.removeItem(API_KEY_STORAGE);
    } else {
      localStorage.setItem(API_KEY_STORAGE, key.trim());
    }
  } catch (err) {
    console.error("Failed to store API key:", err);
  }
}

export function loadSavedEvents(): EventPlan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error loading saved events from localStorage:", err);
    return [];
  }
}

export function saveEvent(plan: EventPlan): void {
  if (typeof window === "undefined") return;
  try {
    const events = loadSavedEvents();
    const existingIndex = events.findIndex((e) => e.id === plan.id);
    const updatedPlan = {
      ...plan,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      events[existingIndex] = updatedPlan;
    } else {
      events.unshift(updatedPlan);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    localStorage.setItem(CURRENT_ACTIVE_KEY, updatedPlan.id);
  } catch (err) {
    console.error("Error saving event to localStorage:", err);
  }
}

export function loadEventById(id: string): EventPlan | null {
  const events = loadSavedEvents();
  return events.find((e) => e.id === id) || null;
}

export function deleteEvent(id: string): EventPlan[] {
  if (typeof window === "undefined") return [];
  try {
    const events = loadSavedEvents().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return events;
  } catch (err) {
    console.error("Error deleting event:", err);
    return [];
  }
}

export function duplicateEvent(id: string): EventPlan | null {
  const existing = loadEventById(id);
  if (!existing) return null;

  const duplicated: EventPlan = {
    ...existing,
    id: `plan-${Date.now()}`,
    title: `${existing.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveEvent(duplicated);
  return duplicated;
}

export function renameEvent(id: string, newTitle: string): EventPlan | null {
  const existing = loadEventById(id);
  if (!existing) return null;

  const updated: EventPlan = {
    ...existing,
    title: newTitle.trim(),
    updatedAt: new Date().toISOString(),
  };

  saveEvent(updated);
  return updated;
}

export function exportPlanAsJson(plan: EventPlan): void {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(plan, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${plan.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_momentmint_plan.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
