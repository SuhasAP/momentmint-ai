import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveGeminiModel, DEFAULT_MODEL } from "../src/lib/gemini";
import { getStoredModel, setStoredModel, DEFAULT_GEMINI_MODEL } from "../src/lib/storage";
import { CopilotRequestSchema } from "../src/lib/schemas";
import { generateFallbackPlan } from "../src/lib/sample-data";

describe("Gemini Model Selection & Obsolete Model Migration", () => {
  const originalEnvModel = process.env.GEMINI_MODEL;

  afterEach(() => {
    if (originalEnvModel !== undefined) {
      process.env.GEMINI_MODEL = originalEnvModel;
    } else {
      delete process.env.GEMINI_MODEL;
    }
  });

  describe("resolveGeminiModel()", () => {
    it("defaults to gemini-3.8-flash when no model is specified", () => {
      delete process.env.GEMINI_MODEL;
      expect(resolveGeminiModel()).toBe("gemini-3.8-flash");
      expect(DEFAULT_MODEL).toBe("gemini-3.8-flash");
    });

    it("safely migrates obsolete gemini-2.5-flash customModel to gemini-3.8-flash", () => {
      expect(resolveGeminiModel("gemini-2.5-flash")).toBe("gemini-3.8-flash");
      expect(resolveGeminiModel("models/gemini-2.5-flash")).toBe("gemini-3.8-flash");
      expect(resolveGeminiModel("  gemini-2.5-flash  ")).toBe("gemini-3.8-flash");
    });

    it("safely migrates obsolete GEMINI_MODEL environment variable from 2.5 to gemini-3.8-flash", () => {
      process.env.GEMINI_MODEL = "gemini-2.5-flash";
      expect(resolveGeminiModel()).toBe("gemini-3.8-flash");

      process.env.GEMINI_MODEL = "models/gemini-2.5-flash";
      expect(resolveGeminiModel()).toBe("gemini-3.8-flash");
    });

    it("preserves valid alternative model overrides", () => {
      expect(resolveGeminiModel("gemini-2.0-flash")).toBe("gemini-2.0-flash");
      expect(resolveGeminiModel("gemini-1.5-flash")).toBe("gemini-1.5-flash");

      delete process.env.GEMINI_MODEL;
      process.env.GEMINI_MODEL = "gemini-2.0-flash";
      expect(resolveGeminiModel()).toBe("gemini-2.0-flash");
    });
  });

  describe("CopilotRequestSchema model parameter", () => {
    const validPlan = generateFallbackPlan({
      eventType: "birthday",
      title: "Botanical Celebration",
      date: "2026-11-14",
      city: "Bengaluru",
      guestCount: 30,
      budget: 30000,
      currency: "INR",
      venuePreference: "outdoor",
      themeVibe: "Warm rustic",
      dietaryRequirements: [],
      accessibilityNeeds: [],
      priorities: [],
    });

    it("validates request payload containing custom model", () => {
      const payload = {
        currentPlan: validPlan,
        userInstruction: "Shift all activities indoors due to rain",
        apiKey: "AIzaSyTestMockKey",
        model: "gemini-3.8-flash",
      };

      const result = CopilotRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.model).toBe("gemini-3.8-flash");
      }
    });
  });

  describe("Browser LocalStorage Model Migration", () => {
    const memoryStorage = new Map<string, string>();

    beforeEach(() => {
      memoryStorage.clear();
      // Setup mock localStorage in node test environment
      (global as unknown as { window: unknown }).window = {
        localStorage: {
          getItem: (key: string) => memoryStorage.get(key) || null,
          setItem: (key: string, val: string) => memoryStorage.set(key, val),
          removeItem: (key: string) => memoryStorage.delete(key),
        },
      };
      (global as unknown as { localStorage: unknown }).localStorage = (global as unknown as { window: { localStorage: unknown } }).window.localStorage;
    });

    afterEach(() => {
      // Clean up globals
      delete (global as unknown as { window?: unknown }).window;
      delete (global as unknown as { localStorage?: unknown }).localStorage;
    });

    it("defaults to DEFAULT_GEMINI_MODEL (gemini-3.8-flash) if storage is empty", () => {
      expect(getStoredModel()).toBe(DEFAULT_GEMINI_MODEL);
      expect(DEFAULT_GEMINI_MODEL).toBe("gemini-3.8-flash");
    });

    it("automatically migrates obsolete gemini-2.5-flash stored in localStorage to gemini-3.8-flash", () => {
      memoryStorage.set("momentmint_custom_gemini_model", "gemini-2.5-flash");
      const model = getStoredModel();
      expect(model).toBe("gemini-3.8-flash");
      // Verify storage was updated to avoid re-reading obsolete value
      expect(memoryStorage.get("momentmint_custom_gemini_model")).toBe("gemini-3.8-flash");
    });

    it("persists and retrieves valid selected models like gemini-2.0-flash", () => {
      setStoredModel("gemini-2.0-flash");
      expect(getStoredModel()).toBe("gemini-2.0-flash");
    });
  });
});
