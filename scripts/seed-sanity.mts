// Importa o conteúdo-base (rascunho) para o dataset do Sanity.
//
//   node scripts/seed-sanity.mts                -> simulação (não escreve nada)
//   node scripts/seed-sanity.mts --apply    -> grava (exige SANITY_API_WRITE_TOKEN no ambiente)
//   ... --force                                -> também substitui documentos já editados (cuidado)
//
// PASSO AUTORIZADO PELA PROPRIETÁRIA: escreve no dataset de produção. O token de escrita fica só no ambiente local.
// Fotos não fazem parte da seed: envie-as pelo Studio.
import { createClient } from "@sanity/client";
import { seedDocuments } from "../src/lib/content/seed.ts";
import { planSeed } from "../src/lib/content/seed-plan.ts";

const apply = process.argv.includes("--apply");
const force = process.argv.includes("--force");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "bwn70x6z";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (apply && !token) {
  console.error("Defina SANITY_API_WRITE_TOKEN (token com permissão de escrita) para usar --apply.");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2026-10-01", token, useCdn: false });
console.log(`${apply ? "GRAVANDO" : "Simulação"} em ${projectId}/${dataset}${force ? " (--force)" : ""}\n`);

const tx = client.transaction();
for (const doc of seedDocuments) {
  const existing = await client.getDocument(doc._id);
  const action = planSeed(existing as Record<string, unknown> | null, doc, force);
  console.log(`${action.padEnd(8)} ${doc._id}`);
  if (action === "create") tx.createIfNotExists(doc);
  if (action === "replace") tx.createOrReplace(doc);
}
if (apply) {
  const res = await tx.commit();
  console.log(`\nOk: ${res.results.length} operações.`);
} else {
  console.log("\nNada foi gravado. Use --apply para importar.");
}
