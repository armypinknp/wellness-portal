import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { es } from "@/lib/es";

// Spanish lookups are keyed by the exact English string, so an edited English
// line silently loses its translation. Guard the safety-critical screens.
const intro = readFileSync("src/components/portal/Intro.tsx", "utf8");
const privacy = readFileSync("src/components/portal/PrivacyChoice.tsx", "utf8");
const literals = (src: string) =>
  [...src.matchAll(/tx\(\s*(["'])((?:\\.|(?!\1).)+)\1\s*,?\s*\)/g)].map(([, , s]) =>
    s!.replace(/\\(["'])/g, "$1"),
  );

describe("draft Spanish coverage", () => {
  it.each([
    ["Intro", intro],
    ["PrivacyChoice", privacy],
  ])("every %s string has a Spanish entry", (_name, src) => {
    const missing = literals(src).filter((s) => !(s in es));
    expect(missing).toEqual([]);
  });
});
