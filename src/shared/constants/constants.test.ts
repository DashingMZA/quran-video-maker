import { describe, it, expect } from "vitest";
import { RECITERS, FONTS, CANVAS_SIZES, FONT_BASE_URLS } from "./index";

describe("CANVAS_SIZES", () => {
  it("covers the three supported aspect ratios with 1080p dimensions", () => {
    expect(CANVAS_SIZES["9:16"]).toEqual({ width: 1080, height: 1920 });
    expect(CANVAS_SIZES["16:9"]).toEqual({ width: 1920, height: 1080 });
    expect(CANVAS_SIZES["1:1"]).toEqual({ width: 1080, height: 1080 });
  });
});

describe("RECITERS", () => {
  it("has at least one reciter and unique ids", () => {
    expect(RECITERS.length).toBeGreaterThan(0);
    const ids = RECITERS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every reciter has a non-empty name", () => {
    for (const reciter of RECITERS) {
      expect(reciter.name.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("FONTS", () => {
  it("exposes the bundled Quran font families", () => {
    const families = FONTS.map((f) => f.family);
    expect(families).toContain("v2");
    expect(FONT_BASE_URLS.v2.length).toBeGreaterThan(0);
    for (const urls of Object.values(FONT_BASE_URLS)) {
      for (const url of urls) {
        expect(url.startsWith("https://")).toBe(true);
      }
    }
  });
});
