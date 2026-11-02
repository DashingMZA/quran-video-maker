/**
 * Quran text scripts selectable in the UI ("Quran Font Style" in the
 * right sidebar, above Typography).
 *
 * `field` is the exact api.quran.com/api/v4 field name used for both the
 * verse-level `fields=` param and the word-level `word_fields=` param:
 * - uthmani → text_uthmani (QPC Uthmani Hafs, the previous hard-coded
 *   behaviour and the default)
 * - indopak → text_indopak (IndoPak script)
 *
 * Only these two are offered, per the feature request. Both were
 * verified against the live API on 2026-11-02: requesting
 * `fields=text_indopak` returns verse-level `text_indopak`, and
 * `word_fields=text_indopak,...` returns word-level `text_indopak`.
 */
export type QuranTextScript = "uthmani" | "indopak";

export interface QuranTextScriptOption {
  id: QuranTextScript;
  /** api.quran.com field name, e.g. "text_uthmani" */
  field: string;
  label: string;
  description: string;
}

export const QURAN_TEXT_SCRIPTS: QuranTextScriptOption[] = [
  {
    id: "uthmani",
    field: "text_uthmani",
    label: "QPC Uthmani Hafs",
    description: "Standard Uthmani script (QPC Hafs)",
  },
  {
    id: "indopak",
    field: "text_indopak",
    label: "IndoPak",
    description: "IndoPak script",
  },
];

export function getTextScriptOption(
  id: QuranTextScript,
): QuranTextScriptOption {
  return QURAN_TEXT_SCRIPTS.find((s) => s.id === id) ?? QURAN_TEXT_SCRIPTS[0];
}
