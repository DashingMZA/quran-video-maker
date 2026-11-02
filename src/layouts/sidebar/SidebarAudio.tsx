import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import {
  FileAudio,
  Mic,
  Mic2,
  ChevronDown,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import { VideoConfig } from "../../features/video-editor/types";
import { VerseData } from "../../features/quran/types";
import { RECITERS } from "../../shared/constants";

const CustomAudioStudio = lazy(
  () => import("../../features/audio/components/CustomAudioStudio"),
);

interface SidebarAudioProps {
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
  verses?: VerseData[];
}

export default function SidebarAudio({
  config,
  setConfig,
  verses = [],
}: SidebarAudioProps) {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isReciterOpen, setIsReciterOpen] = useState(false);
  const [reciterSearch, setReciterSearch] = useState("");
  const reciterDropdownRef = useRef<HTMLDivElement>(null);

  // Close the reciter dropdown on outside click (same pattern as the
  // Translations dropdowns in SidebarTranslation).
  useEffect(() => {
    if (!isReciterOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        reciterDropdownRef.current &&
        !reciterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsReciterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isReciterOpen]);

  const selectedReciter =
    RECITERS.find((r) => r.id === config.reciterId) ??
    RECITERS.find((r) => String(r.id) === String(config.reciterId)) ??
    RECITERS[0];
  const filteredReciters = RECITERS.filter((r) =>
    r.name.toLowerCase().includes(reciterSearch.toLowerCase()),
  );
  const selectedModeClasses =
    "bg-studio-accent text-white shadow-[0_0_20px_rgba(163,0,76,0.25)]";
  const idleModeClasses =
    "bg-white/[0.03] text-zinc-400 hover:bg-white/5 hover:text-white";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-1 h-4 bg-studio-accent rounded-full shadow-[0_0_10px_rgba(44,164,171,0.5)]"></span>
        <h2 className="text-xs font-bold text-studio-textMuted uppercase tracking-wider">
          Audio
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#1a1a1e] p-1 border border-white/5">
        <button
          onClick={() => setConfig({ ...config, audioSource: "reciter" })}
          className={`h-10 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            config.audioSource === "reciter"
              ? selectedModeClasses
              : idleModeClasses
          }`}
        >
          <Mic className="w-4 h-4" />
          Library
        </button>
        <button
          onClick={() => {
            setConfig({ ...config, audioSource: "custom" });
            setIsStudioOpen(true);
          }}
          className={`h-10 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            config.audioSource === "custom"
              ? selectedModeClasses
              : idleModeClasses
          }`}
        >
          <FileAudio className="w-4 h-4" />
          Custom
        </button>
      </div>

      {config.audioSource === "custom" && (
        <div className="rounded-xl border border-white/10 bg-[#1a1a1e] p-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {config.customAudioName || "No custom audio selected"}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {Object.keys(config.customVerseTimings).length
                  ? "Timing map ready for export"
                  : "Upload audio and sync ayah boundaries"}
              </p>
            </div>
            <button
              onClick={() => setIsStudioOpen(true)}
              className="h-10 w-10 shrink-0 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
              title="Open custom reciter studio"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Reciter dropdown — same pattern as the Translations dropdowns */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
          Reciter
        </span>
        <div className="relative" ref={reciterDropdownRef}>
          <button
            onClick={() => {
              if (!isReciterOpen) setReciterSearch("");
              setIsReciterOpen(!isReciterOpen);
            }}
            className={`w-full flex items-center justify-between bg-[#1a1a1e] border ${isReciterOpen ? "border-studio-accent ring-1 ring-studio-accent/20" : "border-white/5 hover:border-white/10"} rounded-xl px-4 py-3 transition-all group text-left`}
          >
            <span className="flex items-center gap-3 min-w-0">
              <span
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-colors ${config.audioSource === "reciter" ? "bg-studio-accent/20 text-studio-accent" : "bg-black/20 text-zinc-500"}`}
              >
                <Mic className="w-4 h-4" />
              </span>
              <span className="block truncate text-sm font-bold text-white group-hover:text-studio-accent transition-colors">
                {selectedReciter.name}
              </span>
            </span>
            <ChevronDown
              className={`w-4 h-4 shrink-0 ml-3 text-zinc-500 transition-transform duration-300 ${isReciterOpen ? "rotate-180 text-studio-accent" : ""}`}
            />
          </button>

          {isReciterOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
              <div className="p-3 border-b border-[#27272a] sticky top-0 bg-[#18181b]/95 backdrop-blur-sm z-10">
                <input
                  type="text"
                  placeholder="Search reciter..."
                  autoFocus
                  value={reciterSearch}
                  onChange={(e) => setReciterSearch(e.target.value)}
                  className="w-full bg-[#27272a] border border-transparent focus:border-studio-accent/50 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-studio-accent/20 outline-none placeholder:text-zinc-600 transition-all"
                />
              </div>
              <div className="overflow-y-auto custom-scrollbar max-h-[240px] p-1">
                {filteredReciters.length > 0 ? (
                  filteredReciters.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setConfig({
                          ...config,
                          reciterId: r.id,
                          audioSource: "reciter",
                        });
                        setIsReciterOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all text-left ${r.id === selectedReciter.id ? "bg-studio-accent text-white shadow-md" : "hover:bg-white/5 text-zinc-400 hover:text-white"}`}
                    >
                      <span
                        className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-colors ${r.id === selectedReciter.id ? "bg-white/20" : "bg-black/20"}`}
                      >
                        {r.id === selectedReciter.id ? (
                          <Mic2 className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </span>
                      <span className="flex-1 min-w-0 text-sm font-medium truncate leading-tight">
                        {r.name}
                      </span>
                      {r.id === selectedReciter.id && (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-zinc-600">
                    No match
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected audio summary — same card style as Selected Translation */}
      <div className="flex items-center gap-3 bg-[#1a1a1e] border border-white/5 rounded-xl px-4 py-3">
        {config.audioSource === "custom" ? (
          <FileAudio className="w-4 h-4 shrink-0 text-studio-accent" />
        ) : (
          <Mic2 className="w-4 h-4 shrink-0 text-studio-accent" />
        )}
        <div className="min-w-0">
          <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            {config.audioSource === "custom"
              ? "Custom Audio"
              : "Selected Reciter"}
          </p>
          <p className="truncate text-sm font-bold text-white">
            {config.audioSource === "custom"
              ? config.customAudioName || "No custom audio selected"
              : selectedReciter.name}
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <CustomAudioStudio
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          config={config}
          setConfig={setConfig}
          verses={verses}
        />
      </Suspense>
    </div>
  );
}
