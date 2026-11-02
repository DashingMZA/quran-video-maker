import { Reciter, QuranFont } from "../types";

export const RECITERS: Reciter[] = [
  { id: 1, name: "AbdulBaset AbdulSamad (Mujawwad)" },
  { id: 2, name: "AbdulBaset AbdulSamad" },
  { id: 158, name: "Abdullah Ali Jabir" },
  { id: 3, name: "Abdur-Rahman as-Sudais" },
  { id: 4, name: "Abu Bakr al-Shatri" },
  { id: 19, name: "Ahmed ibn Ali al-Ajmy" },
  { id: 160, name: "Bandar Baleela" },
  { id: 5, name: "Hani ar-Rifai" },
  { id: 161, name: "Khalifah Al Tunaiji" },
  { id: 159, name: "Maher al-Muaiqly" },
  { id: 6, name: "Mahmoud Khalil Al-Husary" },
  { id: 7, name: "Mishari Rashid al-`Afasy" },
  { id: 9, name: "Mohamed Siddiq al-Minshawi" },
  { id: 13, name: "Sa'ad al-Ghamdi" },
  { id: 10, name: "Sa'ud ash-Shuraim" },
  { id: 12, name: "Mahmoud Khalil Al-Husary (Muallim)" },
  { id: 173, name: "Mishari Rashid al-`Afasy" },
  { id: 168, name: "Mohamed Siddiq al-Minshawi (Kids repeat)" },
  { id: 174, name: "Yasser Ad Dussary" },
];

// Page-specific Font Base URLs - Using jsDelivr CDN with fallbacks
export const FONT_BASE_URLS = {
  v1: [
    "https://cdn.jsdelivr.net/gh/quran/quran.com-frontend-next@production/public/fonts/quran/hafs/v1/woff2/p",
    "https://verses.quran.foundation/fonts/quran/hafs/v1/woff2/p",
    "https://quran.com/fonts/quran/hafs/v1/woff2/p",
  ],
  v2: [
    "https://cdn.jsdelivr.net/gh/quran/quran.com-frontend-next@production/public/fonts/quran/hafs/v2/woff2/p",
    "https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p",
    "https://quran.com/fonts/quran/hafs/v2/woff2/p",
  ],
  v4: [
    "https://cdn.jsdelivr.net/gh/quran/quran.com-frontend-next@production/public/fonts/quran/hafs/v4/colrv1/woff2/p",
    "https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p",
    "https://quran.com/fonts/quran/hafs/v4/colrv1/woff2/p",
  ],
};

export const FONTS: QuranFont[] = [
  // Only Official Quran.com Fonts
  { name: "v1", family: "v1", label: "KFC V1", type: "v1" },
  { name: "v2", family: "v2", label: "KFC V2", type: "v2" },
  { name: "v4", family: "v4", label: "QPC Hafs", type: "v4" },
];

export const AL_QADR_FONT: QuranFont = {
  name: "surah_al_qadr",
  family: "surah_al_qadr",
  label: "Al-Qadr Special",
  type: "qadr",
};

export const ENGLISH_FONTS: QuranFont[] = [
  { name: "figtree", family: "Figtree", label: "Figtree", type: "v1" }, // Dummy type to satisfy TS, not used for Quran text
  { name: "inter", family: "Inter", label: "Inter", type: "v1" },
  { name: "roboto", family: "Roboto", label: "Roboto", type: "v1" },
  { name: "montserrat", family: "Montserrat", label: "Montserrat", type: "v1" },
  { name: "poppins", family: "Poppins", label: "Poppins", type: "v1" },
  { name: "lato", family: "Lato", label: "Lato", type: "v1" },
  { name: "open-sans", family: "Open Sans", label: "Open Sans", type: "v1" },
  { name: "nunito", family: "Nunito", label: "Nunito", type: "v1" },
  { name: "manrope", family: "Manrope", label: "Manrope", type: "v1" },
  { name: "oswald", family: "Oswald", label: "Oswald", type: "v1" },
];

/**
 * Bundled subtitle font files (Google Fonts, SIL OFL 1.1, Latin subset)
 * in public/fonts/subtitles/. Variable fonts ship as a single file with
 * a weight range; static fonts ship as separate 400/700 files. The
 * canvas draws subtitles in bold (700), so both cases must be loadable
 * — previously NONE of these fonts were bundled, imported, or loaded,
 * so the canvas silently fell back to the system sans-serif on any
 * machine without the font installed.
 */
export const SUBTITLE_FONT_FILES: Record<
  string,
  { variable?: { file: string; weight: string }; regular?: string; bold?: string }
> = {
  Figtree: { variable: { file: "figtree.woff2", weight: "300 900" } },
  Inter: { variable: { file: "inter.woff2", weight: "100 900" } },
  Roboto: { variable: { file: "roboto.woff2", weight: "100 900" } },
  Montserrat: { variable: { file: "montserrat.woff2", weight: "100 900" } },
  Poppins: { regular: "poppins-400.woff2", bold: "poppins-700.woff2" },
  Lato: { regular: "lato-400.woff2", bold: "lato-700.woff2" },
  "Open Sans": { variable: { file: "open-sans.woff2", weight: "300 800" } },
  Nunito: { variable: { file: "nunito.woff2", weight: "200 1000" } },
  Manrope: { variable: { file: "manrope.woff2", weight: "200 800" } },
  Oswald: { variable: { file: "oswald.woff2", weight: "400 700" } },
};

export const CANVAS_SIZES = {
  "9:16": { width: 1080, height: 1920 },
  "16:9": { width: 1920, height: 1080 },
  "1:1": { width: 1080, height: 1080 },
};
