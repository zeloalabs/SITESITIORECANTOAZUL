import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "sitio-recanto-azul-site",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-01",
    compatibilityFlags: ["nodejs_compat"],
    assets: { notFoundHandling: "none" },
    env: {
      ASSETS: bindings.assets(),
      SANITY_API_READ_TOKEN: bindings.secret(),
      SANITY_API_BROWSER_TOKEN: bindings.secret(),
    },
  }),
});
