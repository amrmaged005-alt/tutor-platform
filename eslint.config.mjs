import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The mature codebase uses typed escape hatches around Prisma relation
      // projections and effect-driven data loaders. Keep lint focused on
      // actionable UI and correctness issues while those areas are migrated.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "app/generated/**",
    "next-env.d.ts",
    // Local tooling, browser traces, and the separate Flutter client:
    ".agents/**",
    ".claude/**",
    ".impeccable/**",
    ".playwright-cli/**",
    "flutter_application_1/**",
    "output/**",
  ]),
]);

export default eslintConfig;
