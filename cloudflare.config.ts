import { bindings, defineConfig, defineWorker, exports } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "sitio-recanto-azul-site",
    entrypoint: "./src/worker/index.ts",
    compatibilityDate: "2026-09-28",
    compatibilityFlags: ["nodejs_compat"],
    assets: { notFoundHandling: "none" },
    // Workers Cache só no entrypoint `PublicPages` (páginas públicas). O gateway default fica sem cache.
    // (Declarar `default` em `exports` quebra o `vite dev` do plugin; por isso o desligamento é global.)
    cache: { enabled: false },
    exports: {
      PublicPages: exports.worker({ cache: { enabled: true } }),
    },
    env: {
      ASSETS: bindings.assets(),
      SANITY_API_READ_TOKEN: bindings.secret(),
      SANITY_API_BROWSER_TOKEN: bindings.secret(),
      SANITY_WEBHOOK_SECRET: bindings.secret(),
    },
  }),
});
