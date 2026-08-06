import { defineConfig } from "vitest/config";
import path from "node:path";

// Harness for T5-01's risk-ordered test tranche (Paymob webhook, seat-lock
// concurrency, auth/role gating, rate limiters). See overhaul/adr/0001-test-framework.md.
export default defineConfig({
  test: {
    // Node, not jsdom: every T5-01 target is server-side (API routes, lib/).
    // Add a jsdom project later if component tests are actually scoped.
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    // Mirrors tsconfig.json's "@/*": ["./*"] so tests import the same way app code does.
    alias: {
      "@": path.resolve(import.meta.dirname, "./"),
    },
  },
});
