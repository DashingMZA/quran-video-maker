import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { VideoConfig } from "../../features/video-editor/types";
import {
  QURAN_TEXT_SCRIPTS,
  getTextScriptOption,
} from "../../features/quran/data/textScripts";

interface SidebarQuranScriptProps {
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
}

/**
 * "Quran Font Style" selector, shown in the right sidebar above
 * Typography. It switches the Quran text script fetched from
 * api.quran.com (text_uthmani ↔ text_indopak) — not the QPC page font
 * itself; see getWordDisplay/getWordFont for how IndoPak text is drawn.
 */
export default function SidebarQuranScript({
  config,
  setConfig,
}: SidebarQuranScriptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selected = getTextScriptOption(config.quranTextScript);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-1 h-4 bg-studio-accent rounded-full shadow-[0_0_10px_rgba(44,164,171,0.5)]"></span>
        <h2 className="text-xs font-bold text-studio-textMuted uppercase tracking-wider">
          Quran Font Style
        </h2>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
          Script
        </span>
        <div className="relative" ref={containerRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full flex items-center justify-between bg-[#1a1a1e] border ${isOpen ? "border-studio-accent ring-1 ring-studio-accent/20" : "border-white/5 hover:border-white/10"} rounded-xl px-4 py-3 transition-all group text-left`}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-white group-hover:text-studio-accent transition-colors">
                {selected.label}
              </span>
              <span className="block truncate text-[11px] text-zinc-500">
                {selected.description}
              </span>
            </span>
            <ChevronDown
              className={`w-4 h-4 shrink-0 ml-3 text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-studio-accent" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
              <div className="overflow-y-auto custom-scrollbar max-h-[240px] p-1">
                {QURAN_TEXT_SCRIPTS.map((script) => (
                  <button
                    key={script.id}
                    onClick={() => {
                      setConfig({
                        ...config,
                        quranTextScript: script.id,
                      });
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-0.5 transition-all text-left ${script.id === selected.id ? "bg-studio-accent text-white shadow-md" : "hover:bg-white/5 text-zinc-400 hover:text-white"}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {script.label}
                      </span>
                      <span
                        className={`block truncate text-[11px] ${script.id === selected.id ? "text-white/60" : "text-zinc-600"}`}
                      >
                        {script.description}
                      </span>
                    </span>
                    {script.id === selected.id && (
                      <Check className="w-3.5 h-3.5 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
