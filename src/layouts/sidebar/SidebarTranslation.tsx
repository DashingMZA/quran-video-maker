import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Languages } from "lucide-react";
import { VideoConfig } from "../../features/video-editor/types";
import {
  TRANSLATION_LANGUAGES,
  getTranslationById,
  getTranslationsForLanguage,
} from "../../features/quran/data/translations";

interface SidebarTranslationProps {
  config: VideoConfig;
  setConfig: React.Dispatch<React.SetStateAction<VideoConfig>>;
}

/** Shared dropdown shell: button + absolute list, closes on outside click. */
function Dropdown({
  label,
  buttonText,
  buttonSubtext,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  buttonText: string;
  buttonSubtext?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onToggle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="space-y-2">
      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
        {label}
      </span>
      <div className="relative" ref={containerRef}>
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-between bg-[#1a1a1e] border ${isOpen ? "border-studio-accent ring-1 ring-studio-accent/20" : "border-white/5 hover:border-white/10"} rounded-xl px-4 py-3 transition-all group text-left`}
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-white group-hover:text-studio-accent transition-colors">
              {buttonText}
            </span>
            {buttonSubtext && (
              <span className="block truncate text-[11px] text-zinc-500">
                {buttonSubtext}
              </span>
            )}
          </span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 ml-3 text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-studio-accent" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SidebarTranslation({
  config,
  setConfig,
}: SidebarTranslationProps) {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isTranslationOpen, setIsTranslationOpen] = useState(false);
  const [translationSearch, setTranslationSearch] = useState("");

  // Guard against a stale id (e.g. an old saved config): fall back to the
  // first translation of the selected language, then to the default.
  const selectedTranslationRaw = getTranslationById(config.translationId);
  const selectedLanguage =
    TRANSLATION_LANGUAGES.find((l) => l.code === config.translationLanguage) ??
    TRANSLATION_LANGUAGES[0];
  const translationsForLanguage = getTranslationsForLanguage(
    selectedLanguage.code,
  );
  // If the stored translation belongs to another language, show the first
  // translation of the selected language instead of a mismatched one.
  const selectedTranslation =
    selectedTranslationRaw.languageCode === selectedLanguage.code
      ? selectedTranslationRaw
      : (translationsForLanguage[0] ?? selectedTranslationRaw);
  const filteredTranslations = translationsForLanguage.filter((t) =>
    `${t.name} ${t.author}`
      .toLowerCase()
      .includes(translationSearch.toLowerCase()),
  );

  const handleLanguageChange = (languageCode: string) => {
    const firstForLanguage = getTranslationsForLanguage(languageCode)[0];
    if (!firstForLanguage) return;
    setConfig({
      ...config,
      translationLanguage: languageCode,
      translationId: firstForLanguage.id,
    });
    setIsLanguageOpen(false);
    setTranslationSearch("");
  };

  const handleTranslationChange = (translationId: number) => {
    const next = getTranslationById(translationId);
    setConfig({
      ...config,
      translationLanguage: next.languageCode,
      translationId: next.id,
    });
    setIsTranslationOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-1 h-4 bg-studio-accent rounded-full shadow-[0_0_10px_rgba(44,164,171,0.5)]"></span>
        <h2 className="text-xs font-bold text-studio-textMuted uppercase tracking-wider">
          Translations
        </h2>
      </div>

      <div className="space-y-4">
        {/* Language dropdown */}
        <Dropdown
          label="Language"
          buttonText={selectedLanguage.name}
          buttonSubtext={`${translationsForLanguage.length} translation${translationsForLanguage.length === 1 ? "" : "s"}`}
          isOpen={isLanguageOpen}
          onToggle={() => {
            setIsLanguageOpen(!isLanguageOpen);
            setIsTranslationOpen(false);
          }}
        >
          <div className="overflow-y-auto custom-scrollbar max-h-[240px] p-1">
            {TRANSLATION_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-0.5 transition-all text-left ${language.code === selectedLanguage.code ? "bg-studio-accent text-white shadow-md" : "hover:bg-white/5 text-zinc-400 hover:text-white"}`}
              >
                <span className="text-sm font-medium">{language.name}</span>
                <span className="flex items-center gap-2">
                  <span
                    className={`text-[10px] uppercase tracking-wider ${language.code === selectedLanguage.code ? "text-white/60" : "text-zinc-600"}`}
                  >
                    {getTranslationsForLanguage(language.code).length}
                  </span>
                  {language.code === selectedLanguage.code && (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </Dropdown>

        {/* Translator / translation dropdown (filtered by language) */}
        <Dropdown
          label="Translation"
          buttonText={selectedTranslation.name}
          buttonSubtext={selectedTranslation.author}
          isOpen={isTranslationOpen}
          onToggle={() => {
            if (!isTranslationOpen) setTranslationSearch("");
            setIsTranslationOpen(!isTranslationOpen);
            setIsLanguageOpen(false);
          }}
        >
          <div className="p-3 border-b border-[#27272a] sticky top-0 bg-[#18181b]/95 backdrop-blur-sm z-10">
            <input
              type="text"
              placeholder="Search translator..."
              autoFocus
              value={translationSearch}
              onChange={(e) => setTranslationSearch(e.target.value)}
              className="w-full bg-[#27272a] border border-transparent focus:border-studio-accent/50 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-studio-accent/20 outline-none placeholder:text-zinc-600 transition-all"
            />
          </div>
          <div className="overflow-y-auto custom-scrollbar max-h-[240px] p-1">
            {filteredTranslations.length > 0 ? (
              filteredTranslations.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTranslationChange(t.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-0.5 transition-all text-left ${t.id === selectedTranslation.id ? "bg-studio-accent text-white shadow-md" : "hover:bg-white/5 text-zinc-400 hover:text-white"}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {t.name}
                    </span>
                    {t.author !== t.name && (
                      <span
                        className={`block truncate text-[11px] ${t.id === selectedTranslation.id ? "text-white/60" : "text-zinc-600"}`}
                      >
                        {t.author}
                      </span>
                    )}
                  </span>
                  {t.id === selectedTranslation.id && (
                    <Check className="w-3.5 h-3.5 shrink-0 ml-2" />
                  )}
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-zinc-600">
                No match
              </div>
            )}
          </div>
        </Dropdown>
      </div>

      {/* Selected summary, in the style of the Translations card */}
      <div className="flex items-center gap-3 bg-[#1a1a1e] border border-white/5 rounded-xl px-4 py-3">
        <Languages className="w-4 h-4 shrink-0 text-studio-accent" />
        <div className="min-w-0">
          <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            Selected Translation
          </p>
          <p className="truncate text-sm font-bold text-white">
            {selectedLanguage.name} — {selectedTranslation.name}
          </p>
        </div>
      </div>

      {!config.showTranslation && (
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Subtitles are currently off, so this translation won&apos;t show on
          the canvas yet. Turn Subtitles on in the Style panel (right sidebar)
          to see it.
        </p>
      )}
    </div>
  );
}
