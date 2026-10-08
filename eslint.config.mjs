import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Links do site usam <a> simples de propósito: navegação completa serve a página do Workers Cache e evita o
  // prefetch RSC, que sempre renderiza no gateway (sem cache) e gasta CPU do Workers Free (docs/infra-medicoes.md).
  {
    files: ["src/components/**/*.{ts,tsx}", "src/app/(site)/**/*.{ts,tsx}"],
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
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
    ".cloudflare/**",
    "dist/**",
    "test-results/**",
    "playwright-report/**",
    "worker-configuration.d.ts",
  ]),
]);

export default eslintConfig;
