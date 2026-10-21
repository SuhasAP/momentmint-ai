"use client";

import React, { useState, useEffect } from "react";
import { X, Key, ExternalLink, CheckCircle2, ShieldCheck, Cpu } from "lucide-react";
import { getStoredApiKey, setStoredApiKey } from "@/lib/storage";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: (hasKey: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKey.trim());
    setSavedSuccess(true);
    onKeyUpdated(apiKey.trim().length > 0);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setApiKey("");
    setStoredApiKey("");
    onKeyUpdated(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Google Gemini AI Configuration</h3>
              <p className="text-xs text-slate-500">Connect Google AI Studio or evaluate with Demo Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              />
              {apiKey && (
                <button
                  onClick={handleClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-rose-500 hover:text-rose-700 px-2 py-0.5 rounded bg-rose-50"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center justify-between">
              <span>Kept strictly in your browser session & server headers.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-violet-600 hover:underline flex items-center space-x-1"
              >
                <span>Get free key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Active Gemini Model
            </label>
            <div className="relative">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fastest & High Quality)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Supported General Purpose)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] text-xs space-y-2">
            <div className="flex items-start space-x-2 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Zero-Secret Exposure Guarantee:</span>{" "}
                API keys are never checked into git or leaked into public bundles. You can also configure via{" "}
                <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">.env.local</code>.
              </div>
            </div>
            <div className="flex items-start space-x-2 text-slate-700">
              <Cpu className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">Resilient Demo Sandbox:</span>{" "}
                If an API key is not yet provided, MOMENTMINT AI activates the high-fidelity Demo Engine so judges can test full interactive workflows, Copilot before/after diffs, and budget recalculations immediately!
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20 transition-all"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save & Connect</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
