import { VideoConfig } from "../types";
import { AL_QADR_FONT, FONTS } from "../../../shared/constants";

// Smooth interpolation for the camera movement
export const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t;
};

// Helper to draw text via scratch canvas for compositing (V4 coloring fix)
export const drawCompositedText = (
  ctx: CanvasRenderingContext2D,
  scratch: HTMLCanvasElement | null,
  text: string,
  font: string,
  x: number, // Center X
  y: number, // Center Y (Middle Baseline)
  color: string,
  width: number,
  fontSize: number,
) => {
  if (!scratch) return;

  const padding = fontSize;
  const w = width + padding * 2;
  const h = fontSize * 2.5; // generous height

  // Grow scratch canvas if needed
  if (scratch.width < w) scratch.width = w;
  if (scratch.height < h) scratch.height = h;

  const sCtx = scratch.getContext("2d");
  if (!sCtx) return;

  // Clear scratch
  sCtx.clearRect(0, 0, w, h);

  // 1. Draw base text centered
  sCtx.font = font;
  sCtx.textBaseline = "middle";
  sCtx.textAlign = "center";
  sCtx.fillStyle = "#000"; // Draw opaque base
  sCtx.fillText(text, w / 2, h / 2);

  // 2. Tint using source-in
  sCtx.globalCompositeOperation = "source-in";
  sCtx.fillStyle = color;
  sCtx.fillRect(0, 0, w, h);

  // Reset
  sCtx.globalCompositeOperation = "source-over";

  // 3. Draw back
  ctx.drawImage(scratch, 0, 0, w, h, x - w / 2, y - h / 2, w, h);
};

export const getFontType = (config: VideoConfig) => {
  if (config.fontFamily === AL_QADR_FONT.family) {
    return AL_QADR_FONT.type;
  }
  const selectedFont = FONTS.find((f) => f.family === config.fontFamily);
  return selectedFont?.type || "v2";
};

export const getWordDisplay = (
  word: any,
  fontType: string,
  quranTextScript: VideoConfig["quranTextScript"] = "uthmani",
) => {
  // IndoPak must bypass the QPC code glyphs (code_v1/code_v2 are Uthmani
  // QPC glyphs) — otherwise selecting IndoPak would change nothing
  // visually. Render the IndoPak Unicode text instead.
  if (quranTextScript === "indopak") {
    return word.text_indopak ?? word.text_uthmani ?? "";
  }
  let displayWord = word.text_uthmani;
  if (fontType === "v1" && word.code_v1) displayWord = word.code_v1;
  else if (fontType === "qadr" && word.code_v1) displayWord = word.code_v1;
  else if ((fontType === "v2" || fontType === "v4") && word.code_v2)
    displayWord = word.code_v2;
  return displayWord;
};

// IndoPak end-of-ayah fallback (parentheses marker, e.g. "(١)").
//
// Root cause (verified 2026-11-02 against the bundled font): the API DOES
// return the ayah number for IndoPak end words (text_indopak = "١", "٢",
// ...), but the IndoPak font's Arabic-Indic digits ١-٩ (U+0661-U+0669)
// are EMPTY glyphs — 0 contours, 0 advance — so a bare digit renders
// invisible. Only ٠ (U+0660) has a real glyph. Uthmani does not hit this
// because its end words use a QPC code_v2 glyph that draws the whole
// ornate marker. So for IndoPak we draw the marker ourselves: the digit
// in parentheses, in verseNumberColor, using a system Naskh stack —
// never IndoPakNastaleeq, or the browser would pick its empty glyph
// instead of falling back. (An earlier circled version was replaced
// with parentheses at the user's request.)
export const toArabicIndicDigits = (n: number): string =>
  String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

export const getAyahNumberFont = (fontSize: number) =>
  `normal ${Math.round(fontSize * 0.8)}px "Amiri", "Noto Naskh Arabic", "Traditional Arabic", serif`;

export const getAyahMarkerWidth = (
  ctx: CanvasRenderingContext2D,
  digitText: string,
  fontSize: number,
) => {
  ctx.save();
  ctx.font = getAyahNumberFont(fontSize);
  // Drawn LTR (see drawAyahMarker) so the width is measured the same way.
  ctx.direction = "ltr";
  const width = ctx.measureText(`(${digitText})`).width;
  ctx.restore();
  // Extra breathing room on both sides: Nastaleeq word strokes overhang
  // their advance width, so a tight slot lets the marker visually mix
  // with the neighbouring Arabic word. The marker text stays centred
  // in this wider slot.
  return width + fontSize * 0.3;
};

export const drawAyahMarker = (
  ctx: CanvasRenderingContext2D,
  digitText: string,
  centerX: number,
  centerY: number,
  fontSize: number,
  color: string,
) => {
  ctx.save();
  ctx.font = getAyahNumberFont(fontSize);
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  // "middle" baseline, as in the earlier parentheses version: centring
  // by visual glyph bounds (tried 2026-11-02) pulled the marker down
  // into the Nastaleeq word strokes, so marker and Arabic word mixed.
  // The middle baseline keeps the marker clear of the word body.
  ctx.textBaseline = "middle";
  // LTR on purpose: the canvas around this runs RTL, which would flip
  // the parentheses. LTR keeps "(١)" exactly as written.
  ctx.direction = "ltr";
  ctx.fillText(`(${digitText})`, centerX, centerY);
  ctx.restore();
};

export const getWordFont = (
  word: any,
  fontType: string,
  config: VideoConfig,
) => {
  // IndoPak Unicode text cannot be drawn with the QPC page fonts (they
  // only contain QPC glyphs). Use the bundled IndoPak font, with a
  // system Arabic stack only as a fallback.
  if (config.quranTextScript === "indopak") {
    return `normal ${config.fontSize}px "IndoPakNastaleeq", "Amiri", "Traditional Arabic", serif`;
  }
  if (fontType === "qadr")
    return `normal ${config.fontSize}px "${AL_QADR_FONT.family}"`;
  if (word.page_number)
    return `normal ${config.fontSize}px "quran-${fontType}-p${word.page_number}"`;
  return `bold ${config.fontSize}px "${config.fontFamily}"`;
};
