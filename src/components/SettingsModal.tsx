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
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E7E3D9]">
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E3D9]">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#DCE5D8] flex items-center justify-center text-[#17372B] border border-[#DCE5D8]">
              <Key className="w-5 h-5 text-[#214737]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#17372B]">Google Gemini AI Studio Engine</h3>
              <p className="text-xs text-[#697168]">Connect Google AI Studio or evaluate with Demo Sandbox</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#697168] hover:text-[#17372B] hover:bg-[#F8F6F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-[#17372B] uppercase tracking-wider mb-1.5">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 bg-[#F8F6F0] border border-[#E7E3D9] rounded-xl text-sm font-mono text-[#17372B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#214737] transition-all"
              />
              {apiKey && (
                <button
                  onClick={handleClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#C87960] hover:text-[#b5674f] px-2 py-0.5 rounded bg-[#FAF1EE]"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-xs text-[#697168] mt-1.5 flex items-center justify-between">
              <span>Kept strictly in your browser session & server headers.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[#214737] font-semibold hover:underline flex items-center space-x-1"
              >
                <span>Get free key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17372B] uppercase tracking-wider mb-1.5">
              Active Gemini Model
            </label>
            <div className="relative">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F6F0] border border-[#E7E3D9] rounded-xl text-sm font-medium text-[#17372B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#214737]"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fastest & High Quality)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Supported General Purpose)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E7E3D9] text-xs space-y-2.5">
            <div className="flex items-start space-x-2 text-[#222820]">
              <ShieldCheck className="w-4 h-4 text-[#214737] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#17372B]">Client Storage Advisory:</span>{" "}
                Keys saved here reside in your browser&apos;s local storage for this origin and are forwarded to server API routes for generation. For production deployment, configure{" "}
                <code className="bg-white border border-[#E7E3D9] px-1.5 py-0.5 rounded font-mono text-[11px] text-[#17372B]">GEMINI_API_KEY</code> in{" "}
                <code className="bg-white border border-[#E7E3D9] px-1.5 py-0.5 rounded font-mono text-[11px] text-[#17372B]">.env.local</code>.
              </div>
            </div>
            <div className="flex items-start space-x-2 text-[#222820]">
              <Cpu className="w-4 h-4 text-[#214737] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#17372B]">Resilient Demo Sandbox:</span>{" "}
                If an API key is not yet provided, MOMENTMINT AI activates the high-fidelity Demo Engine so judges can test full interactive workflows, Copilot before/after diffs, and budget recalculations immediately!
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3 pt-3 border-t border-[#E7E3D9]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[#697168] hover:bg-[#F8F6F0] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#E9DFC9] bg-[#17372B] hover:bg-[#214737] border border-[#E9DFC9]/30 shadow-subtle transition-all"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#DCE5D8]" />
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
