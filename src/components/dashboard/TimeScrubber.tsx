"use client";
import React, { useEffect } from "react";
import { useDisasterStore } from "../../lib/store/useDisasterStore";
import { Play, Pause, ChevronLeft, ChevronRight, Clock } from "lucide-react";

export function TimeScrubber() {
  const { currentTimeStepIndex, timeSteps, isPlaying, togglePlay, setTimeStepIndex } = useDisasterStore();

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const nextIndex = (currentTimeStepIndex + 1) % timeSteps.length;
      setTimeStepIndex(nextIndex);
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying, currentTimeStepIndex, timeSteps.length, setTimeStepIndex]);

  return (
    <footer className="h-14 border-t border-[#383838]/20 px-6 flex items-center gap-6 bg-[#FAF7F0] shadow-xs z-20 shrink-0 select-none">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTimeStepIndex(Math.max(0, currentTimeStepIndex - 1))}
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          title="Previous Time Step"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={togglePlay}
          className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs"
          title={isPlaying ? "Pause Simulation" : "Play Simulation"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
        </button>
        <button
          onClick={() => setTimeStepIndex(Math.min(timeSteps.length - 1, currentTimeStepIndex + 1))}
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          title="Next Time Step"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <input
          type="range"
          min={0}
          max={timeSteps.length - 1}
          value={currentTimeStepIndex}
          onChange={(e) => setTimeStepIndex(parseInt(e.target.value, 10))}
          className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          {timeSteps.map((step, idx) => (
            <span
              key={step.time_step}
              className={`cursor-pointer px-1.5 py-0.5 rounded transition-all ${
                idx === currentTimeStepIndex
                  ? "bg-slate-900 text-white font-bold shadow-2xs"
                  : "hover:text-slate-900"
              }`}
              onClick={() => setTimeStepIndex(idx)}
            >
              {step.time_step}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
