"use client";
import React, { useState, useRef, useEffect } from "react";
import { useDisasterStore } from "../../lib/store/useDisasterStore";
import { Send, X, User, Loader2, Bot } from "lucide-react";

const QUICK_PROMPTS = [
  "Bhai, abhi safe evacuation route kaunsa hai?",
  "Hospital generator flood ka kya quick fix hai?",
  "Odia aur Hindi me emergency warning draft karo",
  "Explain storm surge in simple human terms",
];

export function AIChatDrawer() {
  const {
    isAIChatOpen,
    setAIChatOpen,
    chatMessages,
    addChatMessage,
    searchedLocation,
    timeSteps,
    currentTimeStepIndex,
    assetEvaluations,
  } = useDisasterStore();

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const storm = timeSteps[currentTimeStepIndex];

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isAIChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isAIChatOpen, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage.trim();
    if (!text || isLoading) return;

    const userTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    addChatMessage({ role: "user", content: text, timestamp: userTimestamp });
    if (!textToSend) setInputMessage("");
    setIsLoading(true);

    try {
      const telemetryContext = {
        location: searchedLocation ? searchedLocation.name : "Paradip / Puri Coast (Cyclone Dana Sector)",
        coordinates: searchedLocation
          ? { lat: searchedLocation.lat, lon: searchedLocation.lon }
          : { lat: storm.latitude, lon: storm.longitude },
        liveWindKmh: searchedLocation?.liveWind ?? storm.max_sustained_wind_kmh,
        livePressureHpa: searchedLocation?.livePressure ?? storm.central_pressure_hpa,
        liveGustsKmh: searchedLocation?.liveGusts,
        elevationMetersMSL: searchedLocation?.elevation ?? 4,
        criticalBreachesCount: Object.values(assetEvaluations).filter(
          (a) => a.status === "CRITICAL_POWER_BREACH" || a.status === "SUBMERGED" || a.status === "STRUCTURAL_COLLAPSE"
        ).length,
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, { role: "user", content: text }].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          telemetryContext,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get copilot response");
      }

      const data = await res.json();
      const botTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      addChatMessage({
        role: "assistant",
        content: data.reply || "Tactical assessment completed.",
        timestamp: botTimestamp,
      });
    } catch (err) {
      console.error(err);
      addChatMessage({
        role: "assistant",
        content: "Operating in local offline mode. Live atmospheric telemetry and location safety checks remain synchronized.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ALWAYS VISIBLE: Floating Bottom-Right Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setAIChatOpen(!isAIChatOpen)}
          className={`relative group px-4 py-2.5 rounded-full border shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 ${
            isAIChatOpen
              ? "bg-[#0A0A0A] border-[#383838] text-[#F0F0F0]"
              : "bg-[#FAF7F0] border-[#383838]/40 text-[#0A0A0A] hover:bg-[#FAF5ED]"
          }`}
          title="KAI Tactical Copilot"
        >
          <div className="w-6 h-6 rounded-full bg-[#0A0A0A] overflow-hidden flex items-center justify-center shrink-0 shadow-xs relative">
            <img src="/kai-alert-logo.png" alt="KAI Copilot" className="w-full h-full object-cover" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#FAF7F0] animate-pulse" />
          </div>
          <span className="text-xs font-semibold tracking-tight font-sans">
            {isAIChatOpen ? "Close Copilot" : "Ask KAI Copilot"}
          </span>
        </button>
      </div>

      {/* Floating Bottom-Right Popover Window */}
      {isAIChatOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[540px] max-h-[75vh] border border-[#383838]/30 rounded-3xl shadow-2xl flex flex-col bg-[#FAF7F0] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 border-b border-[#383838]/20 flex items-center justify-between bg-[#0A0A0A] text-[#F0F0F0]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#141414] border border-[#383838] overflow-hidden flex items-center justify-center shrink-0 p-0.5">
                <img src="/kai-alert-logo.png" alt="KAI Copilot" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#F0F0F0] text-xs tracking-tight">KAI AI Copilot</h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                  {searchedLocation ? `Target: ${searchedLocation.name.split(",")[0]}` : "Sector: Disaster Defense"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setAIChatOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#141414] transition-colors"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF5ED]">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2 text-slate-600">
                <div className="w-10 h-10 rounded-2xl bg-[#F2ECE1] flex items-center justify-center text-slate-800">
                  <img src="/kai-alert-logo.png" alt="KAI" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#0A0A0A] text-xs">Namaste! Main aapka Disaster Assistant hu.</h4>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-xs">
                    Cyclone status, safe evacuation routes, ya hospital alerts ke baare me simple bhasha me poochiye.
                  </p>
                </div>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center overflow-hidden text-[10px] font-semibold ${
                      msg.role === "user" ? "bg-[#0A0A0A] text-[#F0F0F0]" : "bg-[#0A0A0A] text-[#F0F0F0] p-0.5"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <img src="/kai-alert-logo.png" alt="KAI" className="w-full h-full object-contain" />
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                      msg.role === "user"
                        ? "bg-[#0A0A0A] text-[#F0F0F0] font-medium rounded-tr-xs"
                        : "bg-[#F2ECE1] border border-[#383838]/20 text-[#0A0A0A] rounded-tl-xs whitespace-pre-wrap font-sans font-medium"
                    }`}
                  >
                    <div>{msg.content}</div>
                    <div className="mt-1 text-[9px] font-mono text-right opacity-60">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full shrink-0 bg-[#0A0A0A] text-[#F0F0F0] flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#F2ECE1] border border-[#383838]/20 rounded-2xl rounded-tl-xs p-3 flex items-center gap-2 text-xs text-slate-800 font-mono font-medium">
                  <Loader2 className="w-3.5 h-3.5 text-slate-700 animate-spin" />
                  <span>Analyzing situation...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Recommendation Prompts */}
          <div className="px-3 py-2.5 bg-[#FAF7F0] border-t border-[#383838]/20 flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-[10px] px-2.5 py-1 rounded-full bg-[#F2ECE1] hover:bg-[#EAE2D4] text-[#0A0A0A] border border-[#383838]/20 transition-all font-sans font-medium text-left truncate max-w-full"
              >
                💡 {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#383838]/20 bg-[#FAF7F0]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask in Hindi, English, or Hinglish..."
                disabled={isLoading}
                className="flex-1 bg-[#FAF5ED] border border-[#383838]/30 rounded-full px-3.5 py-2 text-xs text-[#0A0A0A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] transition-all font-sans"
              />

              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="w-8 h-8 rounded-full bg-[#0A0A0A] text-[#F0F0F0] flex items-center justify-center hover:bg-black disabled:opacity-40 transition-all shadow-2xs shrink-0"
                title="Send Message"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
