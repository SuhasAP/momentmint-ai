import { describe, it, expect } from "vitest";
import {
  isTransientGeminiError,
  sanitizeErrorMessage,
  executeWithTransientRetry,
  ATTEMPT_TIMEOUT_MS,
  RETRY_DELAY_MS,
  MAX_RETRY_ATTEMPTS,
} from "../src/lib/gemini";

describe("Resilience, Timeout & Error Sanitization", () => {
  describe("Timeout and Retry Boundary Constraints", () => {
    it("configures attempt timeout and bounded retry to stay safely within Vercel's 30s limit", () => {
      // Maximum time = (ATTEMPT_TIMEOUT_MS * MAX_RETRY_ATTEMPTS) + (RETRY_DELAY_MS * (MAX_RETRY_ATTEMPTS - 1))
      const worstCaseDurationMs =
        ATTEMPT_TIMEOUT_MS * MAX_RETRY_ATTEMPTS +
        RETRY_DELAY_MS * (MAX_RETRY_ATTEMPTS - 1);

      // Must be bounded to under 28 seconds (leaving margin for 30s Vercel serverless function maxDuration)
      expect(MAX_RETRY_ATTEMPTS).toBeLessThanOrEqual(2);
      expect(worstCaseDurationMs).toBeLessThanOrEqual(28000);
      expect(worstCaseDurationMs).toBeGreaterThan(10000);
    });
  });

  describe("isTransientGeminiError()", () => {
    it("identifies HTTP 503 Service Unavailable and high demand as transient", () => {
      expect(isTransientGeminiError({ status: 503, message: "Service Unavailable" })).toBe(true);
      expect(
        isTransientGeminiError(
          new Error("The model is overloaded. Please try again later. (503 UNAVAILABLE)")
        )
      ).toBe(true);
      expect(
        isTransientGeminiError(new Error("models/gemini-3.8-flash experiencing high demand"))
      ).toBe(true);
    });

    it("identifies HTTP 429 Rate Limit / Resource Exhausted as transient", () => {
      expect(isTransientGeminiError({ statusCode: 429, message: "Too Many Requests" })).toBe(true);
      expect(
        isTransientGeminiError(new Error("Resource exhausted: RESOURCE_EXHAUSTED quota exceeded"))
      ).toBe(true);
    });

    it("identifies timeouts and socket resets as transient", () => {
      expect(isTransientGeminiError(new Error("Copilot response timed out"))).toBe(true);
      expect(isTransientGeminiError(new Error("Google Gemini request timed out"))).toBe(true);
      expect(isTransientGeminiError(new Error("fetch failed: ECONNRESET"))).toBe(true);
      expect(isTransientGeminiError(new Error("ETIMEDOUT"))).toBe(true);
    });

    it("does NOT classify permanent client errors as transient (never retried)", () => {
      // 400 Bad Request
      expect(isTransientGeminiError({ status: 400, message: "Invalid JSON Schema payload" })).toBe(
        false
      );
      expect(isTransientGeminiError(new Error("400 Bad Request: Invalid argument"))).toBe(false);

      // 401 / 403 Invalid API key
      expect(isTransientGeminiError({ status: 401, message: "API key not valid" })).toBe(false);
      expect(isTransientGeminiError(new Error("API_KEY_INVALID: Please pass a valid key"))).toBe(
        false
      );
      expect(isTransientGeminiError({ status: 403, message: "Permission denied" })).toBe(false);

      // 404 Model not found
      expect(isTransientGeminiError({ status: 404, message: "Model not found" })).toBe(false);
      expect(isTransientGeminiError(new Error("404 Not Found: models/invalid-model"))).toBe(false);
    });

    it("handles null, undefined, and non-error values gracefully", () => {
      expect(isTransientGeminiError(null)).toBe(false);
      expect(isTransientGeminiError(undefined)).toBe(false);
      expect(isTransientGeminiError("some random string")).toBe(false);
    });
  });

  describe("sanitizeErrorMessage() Security & Masking", () => {
    it("redacts standard Google AI Studio API keys (AIza...)", () => {
      const msg = "Failed request with key AIzaSyB1234567890abcdef1234567890ABCDEF at endpoint";
      const cleaned = sanitizeErrorMessage(msg);
      expect(cleaned).not.toContain("AIzaSyB1234567890abcdef1234567890ABCDEF");
      expect(cleaned).toContain("AIza***[REDACTED]");
    });

    it("redacts query parameter credentials", () => {
      const url = "https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSySecretKeyValue987654321012345";
      const cleaned = sanitizeErrorMessage(url);
      expect(cleaned).not.toContain("AIzaSySecretKeyValue987654321012345");
      expect(cleaned).toContain("key=[REDACTED]");
    });

    it("redacts Bearer tokens and header credentials", () => {
      const authError = "Authentication failed: Bearer ya29.a0AfH6SMD_secret_token_value_here";
      const cleaned = sanitizeErrorMessage(authError);
      expect(cleaned).not.toContain("ya29.a0AfH6SMD_secret_token_value_here");
      expect(cleaned).toContain("bearer [REDACTED]");

      const headerError = "x-goog-api-key: AIzaSyTopSecretKey123456789012345678";
      const cleanedHeader = sanitizeErrorMessage(headerError);
      expect(cleanedHeader).not.toContain("AIzaSyTopSecretKey123456789012345678");
      expect(cleanedHeader).toContain("x-goog-api-key: [REDACTED]");
    });

    it("handles empty and non-string inputs safely", () => {
      expect(sanitizeErrorMessage("")).toBe("Unknown error");
      expect(sanitizeErrorMessage(null as unknown as string)).toBe("Unknown error");
      expect(sanitizeErrorMessage(undefined as unknown as string)).toBe("Unknown error");
    });
  });

  describe("executeWithTransientRetry() Actual Execution Behavior", () => {
    it("successfully completes on attempt 2 after a transient 503 error on attempt 1", async () => {
      let callCount = 0;
      const result = await executeWithTransientRetry(
        async () => {
          callCount++;
          if (callCount === 1) {
            throw new Error("503 UNAVAILABLE: Model experiencing high demand");
          }
          return { success: true, planId: "p-123" };
        },
        { retryDelayMs: 10, attemptTimeoutMs: 1000, maxAttempts: 2 }
      );

      expect(callCount).toBe(2);
      expect(result).toEqual({ success: true, planId: "p-123" });
    });

    it("fails after two consecutive 503 responses and does not attempt a third", async () => {
      let callCount = 0;
      await expect(
        executeWithTransientRetry(
          async () => {
            callCount++;
            throw new Error("503 Service Unavailable");
          },
          { retryDelayMs: 10, attemptTimeoutMs: 1000, maxAttempts: 2 }
        )
      ).rejects.toThrow("503 Service Unavailable");

      expect(callCount).toBe(2);
    });

    it("does NOT retry when encountering permanent errors (e.g. 400 Bad Request, 401 Invalid Key)", async () => {
      let callCount = 0;
      await expect(
        executeWithTransientRetry(
          async () => {
            callCount++;
            throw new Error("401 Unauthorized: API key not valid");
          },
          { retryDelayMs: 10, attemptTimeoutMs: 1000, maxAttempts: 2 }
        )
      ).rejects.toThrow("401 Unauthorized");

      // Must be called exactly once
      expect(callCount).toBe(1);

      let callCount400 = 0;
      await expect(
        executeWithTransientRetry(
          async () => {
            callCount400++;
            throw new Error("400 Bad Request: Invalid JSON Schema payload");
          },
          { retryDelayMs: 10, attemptTimeoutMs: 1000, maxAttempts: 2 }
        )
      ).rejects.toThrow("400 Bad Request");

      expect(callCount400).toBe(1);
    });

    it("triggers AbortSignal cancellation upon timeout", async () => {
      let abortedSignalReceived = false;

      await expect(
        executeWithTransientRetry(
          async (signal) => {
            return new Promise((_, reject) => {
              signal.addEventListener("abort", () => {
                abortedSignalReceived = true;
                reject(new Error("Request aborted by timeout"));
              });
            });
          },
          { attemptTimeoutMs: 50, retryDelayMs: 10, maxAttempts: 1 }
        )
      ).rejects.toThrow("Request aborted by timeout");

      expect(abortedSignalReceived).toBe(true);
    });
  });
});
