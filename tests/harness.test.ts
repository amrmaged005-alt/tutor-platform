import { describe, expect, it } from "vitest";
import { getClassImage } from "@/lib/classImage";

// T0-05 smoke test. Deliberately exercises a real module through the "@/" alias
// rather than asserting 1+1===2 — this proves the harness can reach app code the
// way T5-01's suites will need to, which is the only thing this file is for.
describe("test harness", () => {
  it("resolves the @/ path alias into app code", () => {
    expect(typeof getClassImage).toBe("function");
  });

  it("runs a real pure function from lib/", () => {
    const explicit = getClassImage("class-1", "Physics", "https://cdn.example.com/a.png");
    expect(explicit).toBe("https://cdn.example.com/a.png");

    const generated = getClassImage("class-1", "Physics");
    expect(generated.startsWith("data:image/svg+xml,")).toBe(true);
    // Deterministic: same id must always produce the same tile.
    expect(generated).toBe(getClassImage("class-1", "Physics"));
  });
});
