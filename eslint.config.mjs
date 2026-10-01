import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Studio tem node_modules e lint próprios; artefatos de build do adaptador.
    "studio/**",
    ".open-next/**",
    "dist/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
